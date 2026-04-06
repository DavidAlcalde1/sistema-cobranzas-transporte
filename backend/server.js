const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'mi_secreto_por_defecto';

// Middleware
app.use(cors());
app.use(express.json());

// Rutas
const authRoutes = require('./routes/auth');
const clientRoutes = require('./routes/clients');
const paymentRoutes = require('./routes/payments');
const serviceRoutes = require('./routes/services');

app.use('/api/auth', authRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/services', serviceRoutes);

// Ruta de prueba
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Sistema de Fletes funcionando',
    timestamp: new Date().toISOString()
  });
});

// Ruta raíz
app.get('/', (req, res) => {
  res.json({
    name: 'API Sistema de Fletes',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      clients: '/api/clients',
      services: '/api/services',
      debts: '/api/payments/debts',
      payments: '/api/payments'
    }
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`\n🚀 Servidor corriendo en http://localhost:${PORT}`);
  console.log(`📊 Base de datos: SQLite`);
  console.log(`📋 Endpoints disponibles:`);
  console.log(`   - POST /api/auth/login`);
  console.log(`   - GET  /api/auth/me`);
  console.log(`   - POST /api/auth/change-password`);
  console.log(`   - GET  /api/clients`);
  console.log(`   - POST /api/clients`);
  console.log(`   - GET  /api/services`);
  console.log(`   - POST /api/services`);
  console.log(`   - GET  /api/payments/debts`);
  console.log(`   - POST /api/payments\n`);
});