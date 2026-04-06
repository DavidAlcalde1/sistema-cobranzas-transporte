const express = require('express');
const router = express.Router();
const { query, run } = require('../models/database');

// Obtener todos los clientes
router.get('/', async (req, res) => {
  try {
    const result = await query('SELECT * FROM clients ORDER BY id DESC');
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// Obtener un cliente específico
router.get('/:id', async (req, res) => {
  try {
    const result = await query('SELECT * FROM clients WHERE id = ?', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// Crear nuevo cliente
router.post('/', async (req, res) => {
  const { name, document_number, phone, address, email } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'El nombre es requerido' });
  }
  try {
    const result = await run(
      'INSERT INTO clients (name, document_number, phone, address, email) VALUES (?, ?, ?, ?, ?)',
      [name, document_number || null, phone || null, address || null, email || null]
    );
    res.status(201).json({ id: result.lastID, name, document_number, phone, address, email });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// Actualizar cliente
router.put('/:id', async (req, res) => {
  const { name, document_number, phone, address, email } = req.body;
  try {
    await run(
      'UPDATE clients SET name = ?, document_number = ?, phone = ?, address = ?, email = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [name, document_number, phone, address, email, req.params.id]
    );
    res.json({ message: 'Cliente actualizado correctamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// Eliminar cliente
router.delete('/:id', async (req, res) => {
  try {
    await run('DELETE FROM clients WHERE id = ?', [req.params.id]);
    res.json({ message: 'Cliente eliminado correctamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;