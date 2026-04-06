const express = require('express');
const router = express.Router();
const { query, run } = require('../models/database');

// Endpoint simple para probar que la ruta funciona
router.get('/test', (req, res) => {
  res.json({ message: 'Payments route is working!' });
});

// Endpoint para ver todos los servicios (debug)
router.get('/all-services', async (req, res) => {
  try {
    const result = await query('SELECT * FROM services');
    res.json({ count: result.rows.length, services: result.rows });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Endpoint de deudas - VERSIÓN COMPLETA
router.get('/debts', async (req, res) => {
  try {
    console.log('🔍 Iniciando búsqueda de deudas...');
    
    // 1. Obtener todos los servicios
    const allServices = await query(`
      SELECT s.*, c.name as client_name 
      FROM services s 
      LEFT JOIN clients c ON s.client_id = c.id
    `);
    
    console.log(`📊 Total servicios encontrados: ${allServices.rows.length}`);
    
    // 2. Filtrar solo crédito y calcular deudas
    const debts = [];
    
    for (const service of allServices.rows) {
      // Solo considerar servicios con crédito = 'SI'
      if (service.is_credit === 'SI') {
        // Obtener pagos
        const paymentsResult = await query(
          'SELECT COALESCE(SUM(amount), 0) as total FROM payments WHERE service_id = ?',
          [service.id]
        );
        
        const paid = paymentsResult.rows[0].total;
        const total = service.sale_price || 0;
        const pending = total - paid;
        
        console.log(`Servicio ${service.id}: Total=${total}, Pagado=${paid}, Pendiente=${pending}`);
        
        if (pending > 0) {
          debts.push({
            client_id: service.client_id,
            client_name: service.client_name || 'Cliente sin nombre',
            service_id: service.id,
            service_number_text: service.service_number_text,
            service_type: service.service_type,
            service_detail: service.service_detail,
            service_date: service.service_date,
            total_amount: total,
            paid_amount: paid,
            pending_amount: pending,
            is_credit: service.is_credit
          });
        }
      }
    }
    
    console.log(`✅ Deudas encontradas: ${debts.length}`);
    res.json(debts);
  } catch (error) {
    console.error('❌ Error en debts:', error);
    res.status(500).json({ error: error.message, stack: error.stack });
  }
});

// Registrar un pago
router.post('/', async (req, res) => {
  const { service_id, payment_date, amount, payment_method, notes } = req.body;
  
  console.log('📝 Registrando pago:', { service_id, payment_date, amount });
  
  if (!service_id || !payment_date || !amount) {
    return res.status(400).json({ error: 'Faltan campos requeridos' });
  }
  
  try {
    // Verificar servicio
    const service = await query('SELECT sale_price, is_credit FROM services WHERE id = ?', [service_id]);
    if (service.rows.length === 0) {
      return res.status(404).json({ error: 'Servicio no encontrado' });
    }
    
    // Calcular pagos existentes
    const paid = await query('SELECT COALESCE(SUM(amount), 0) as total FROM payments WHERE service_id = ?', [service_id]);
    const totalPaid = paid.rows[0].total;
    const remaining = service.rows[0].sale_price - totalPaid;
    
    if (amount > remaining) {
      return res.status(400).json({ error: `El monto excede la deuda pendiente (S/ ${remaining.toFixed(2)})` });
    }
    
    // Registrar pago
    const result = await run(
      'INSERT INTO payments (service_id, payment_date, amount, payment_method, notes) VALUES (?, ?, ?, ?, ?)',
      [service_id, payment_date, amount, payment_method || 'efectivo', notes || null]
    );
    
    console.log('✅ Pago registrado ID:', result.lastID);
    res.json({ 
      success: true,
      id: result.lastID, 
      message: 'Pago registrado exitosamente',
      remaining: remaining - amount
    });
  } catch (error) {
    console.error('❌ Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Reporte de pagos por período
router.get('/reports/payments', async (req, res) => {
  const { start, end } = req.query;
  try {
    let queryStr = `
      SELECT p.*, s.service_number_text, c.name as client_name 
      FROM payments p
      JOIN services s ON p.service_id = s.id
      JOIN clients c ON s.client_id = c.id
    `;
    const params = [];
    
    if (start && end) {
      queryStr += ` WHERE p.payment_date BETWEEN ? AND ?`;
      params.push(start, end);
    }
    
    queryStr += ` ORDER BY p.payment_date DESC`;
    
    const result = await query(queryStr, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Reporte de pagos por período (entradas diarias/mensuales)
router.get('/reports/payments', async (req, res) => {
  const { start, end, client } = req.query;
  try {
    let queryStr = `
      SELECT 
        p.id,
        p.payment_date,
        p.amount,
        p.payment_method,
        p.notes,
        s.id as service_id,
        s.service_number_text,
        c.id as client_id,
        c.name as client_name
      FROM payments p
      JOIN services s ON p.service_id = s.id
      JOIN clients c ON s.client_id = c.id
      WHERE 1=1
    `;
    const params = [];
    
    if (start && end) {
      queryStr += ` AND p.payment_date BETWEEN ? AND ?`;
      params.push(start, end);
    }
    
    if (client) {
      queryStr += ` AND c.name LIKE ?`;
      params.push(`%${client}%`);
    }
    
    queryStr += ` ORDER BY p.payment_date DESC`;
    
    const result = await query(queryStr, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error en reports/payments:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;