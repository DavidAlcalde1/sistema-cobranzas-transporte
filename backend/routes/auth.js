const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { query, run } = require('../models/database');

// Importar middleware - verificar que la ruta sea correcta
let verifyToken, isAdmin, isAdminOrSupervisor;
try {
  const authMiddleware = require('../middleware/auth');
  verifyToken = authMiddleware.verifyToken;
  isAdmin = authMiddleware.isAdmin;
  isAdminOrSupervisor = authMiddleware.isAdminOrSupervisor;
} catch (err) {
  console.log('⚠️ Middleware no encontrado, creando funciones básicas');
  // Funciones básicas si no existe el middleware
  verifyToken = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Acceso denegado' });
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'mi_secreto_super_seguro_2026');
      req.user = decoded;
      next();
    } catch (error) {
      return res.status(401).json({ error: 'Token inválido' });
    }
  };
  isAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Requiere rol admin' });
    next();
  };
  isAdminOrSupervisor = (req, res, next) => {
    if (req.user.role !== 'admin' && req.user.role !== 'supervisor') {
      return res.status(403).json({ error: 'Requiere rol supervisor o admin' });
    }
    next();
  };
}

const JWT_SECRET = process.env.JWT_SECRET || 'mi_secreto_super_seguro_2026';

// ========== RUTAS ==========

// Login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({ error: 'Usuario y contraseña son requeridos' });
  }
  
  try {
    const result = await query(
      'SELECT id, username, password, full_name, role, email, active FROM users WHERE username = ?',
      [username]
    );
    
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Usuario o contraseña incorrectos' });
    }
    
    const user = result.rows[0];
    
    if (user.active !== 'SI') {
      return res.status(401).json({ error: 'Usuario desactivado' });
    }
    
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Usuario o contraseña incorrectos' });
    }
    
    await run('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?', [user.id]);
    
    const token = jwt.sign(
      { id: user.id, username: user.username, full_name: user.full_name, role: user.role, email: user.email },
      JWT_SECRET,
      { expiresIn: '8h' }
    );
    
    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        full_name: user.full_name,
        role: user.role,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ error: error.message });
  }
});

// Obtener información del usuario actual
router.get('/me', verifyToken, async (req, res) => {
  try {
    const result = await query(
      'SELECT id, username, full_name, role, email, last_login, created_at FROM users WHERE id = ?',
      [req.user.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Cambiar contraseña
router.post('/change-password', verifyToken, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: 'Contraseñas requeridas' });
  }
  
  try {
    const result = await query('SELECT password FROM users WHERE id = ?', [req.user.id]);
    
    const validPassword = await bcrypt.compare(currentPassword, result.rows[0].password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Contraseña actual incorrecta' });
    }
    
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await run('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, req.user.id]);
    
    res.json({ message: 'Contraseña actualizada exitosamente' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Obtener todos los usuarios (solo admin)
router.get('/users', verifyToken, isAdmin, async (req, res) => {
  try {
    const result = await query(
      'SELECT id, username, full_name, role, email, active, last_login, created_at FROM users ORDER BY id'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Crear nuevo usuario (solo admin)
router.post('/users', verifyToken, isAdmin, async (req, res) => {
  const { username, password, full_name, role, email } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({ error: 'Usuario y contraseña requeridos' });
  }
  
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const result = await run(
      'INSERT INTO users (username, password, full_name, role, email, active) VALUES (?, ?, ?, ?, ?, ?)',
      [username, hashedPassword, full_name || null, role || 'collector', email || null, 'SI']
    );
    
    res.status(201).json({ id: result.lastID, message: 'Usuario creado exitosamente' });
  } catch (error) {
    console.error('Error:', error);
    if (error.message.includes('UNIQUE')) {
      res.status(400).json({ error: 'El nombre de usuario ya existe' });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
});

// Actualizar usuario (solo admin)
router.put('/users/:id', verifyToken, isAdmin, async (req, res) => {
  const { full_name, role, email, active } = req.body;
  const userId = req.params.id;
  
  try {
    await run(
      'UPDATE users SET full_name = ?, role = ?, email = ?, active = ? WHERE id = ?',
      [full_name || null, role || 'collector', email || null, active || 'SI', userId]
    );
    res.json({ message: 'Usuario actualizado exitosamente' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Eliminar usuario (solo admin)
router.delete('/users/:id', verifyToken, isAdmin, async (req, res) => {
  const userId = req.params.id;
  
  if (parseInt(userId) === req.user.id) {
    return res.status(400).json({ error: 'No puedes eliminar tu propio usuario' });
  }
  
  try {
    await run('DELETE FROM users WHERE id = ?', [userId]);
    res.json({ message: 'Usuario eliminado exitosamente' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;