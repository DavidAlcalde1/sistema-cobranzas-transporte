const express = require('express');
const router = express.Router();
const { query, run } = require('../models/database');

// ========== RUTAS ESPECÍFICAS PRIMERO ==========

// Obtener el último número de servicio para autocompletar
router.get('/last-number', async (req, res) => {
  try {
    const currentYear = new Date().getFullYear();
    
    const result = await query(`
      SELECT service_number_text 
      FROM services 
      WHERE service_number_text IS NOT NULL 
        AND service_number_text != ''
        AND service_number_text LIKE ?
      ORDER BY id DESC 
      LIMIT 1
    `, [`%-${currentYear}`]);
    
    let nextNumber = 1;
    
    if (result.rows.length > 0) {
      const lastText = result.rows[0].service_number_text;
      const match = lastText.match(/S(\d+)-/);
      if (match) {
        const lastNum = parseInt(match[1]);
        nextNumber = lastNum + 1;
      }
    }
    
    const suggested = `S${nextNumber.toString().padStart(3, '0')}-${currentYear}`;
    
    res.json({ suggested });
  } catch (error) {
    console.error('Error en last-number:', error);
    res.status(500).json({ error: error.message });
  }
});

// Reiniciar contador de IDs
router.post('/reset-counter', async (req, res) => {
  try {
    await run(`DELETE FROM sqlite_sequence WHERE name = 'services'`);
    res.json({ message: 'Contador reiniciado correctamente' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ========== RUTA PRINCIPAL ==========

// Obtener todos los servicios
router.get('/', async (req, res) => {
  try {
    const result = await query(`
      SELECT s.*, c.name as client_name 
      FROM services s 
      JOIN clients c ON s.client_id = c.id 
      ORDER BY s.service_date DESC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Crear nuevo servicio
router.post('/', async (req, res) => {
  const {
    service_number_text,
    client_id,
    service_type,
    service_detail,
    sale_price,
    cost_price,
    net_price,
    is_credit,
    is_cash,
    is_invoiced,
    has_receipt,
    origin_city,
    destination_city,
    service_date,
    description
  } = req.body;

  if (!client_id || !service_date) {
    return res.status(400).json({ error: 'Cliente y fecha son requeridos' });
  }

  try {
    // Insertar el servicio
    const result = await run(`
      INSERT INTO services (
        service_number_text, client_id, service_type, service_detail, 
        sale_price, cost_price, net_price, is_credit, is_cash, 
        is_invoiced, has_receipt, origin_city, destination_city, 
        service_date, description
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      service_number_text || null, 
      client_id, 
      service_type || 'carga_completa', 
      service_detail || null, 
      sale_price || 0, 
      cost_price || 0,
      net_price || 0, 
      is_credit || 'NO', 
      is_cash || 'NO', 
      is_invoiced || 'NO', 
      has_receipt || 'NO',
      origin_city || null, 
      destination_city || null, 
      service_date, 
      description || null
    ]);
    
    const serviceId = result.lastID;
    
    // Si es al contado (is_cash = 'SI'), registrar el pago automáticamente
    if (is_cash === 'SI' && sale_price > 0) {
      await run(`
        INSERT INTO payments (service_id, payment_date, amount, payment_method, notes) 
        VALUES (?, ?, ?, ?, ?)
      `, [serviceId, service_date, sale_price, 'efectivo', 'Pago al contado - automático']);
      console.log(`✅ Pago automático registrado para servicio ${serviceId} (contado)`);
    }
    
    res.status(201).json({ 
      id: serviceId, 
      message: 'Servicio creado exitosamente' 
    });
  } catch (error) {
    console.error('Error al crear servicio:', error);
    res.status(500).json({ error: error.message });
  }
});

// ========== RUTAS CON PARÁMETROS (DEBEN IR AL FINAL) ==========

// Obtener un servicio específico
router.get('/:id', async (req, res) => {
  // Evitar que capture rutas específicas
  if (req.params.id === 'last-number' || req.params.id === 'reset-counter') {
    return res.status(404).json({ error: 'Ruta no encontrada' });
  }
  
  try {
    const result = await query(`
      SELECT s.*, c.name as client_name 
      FROM services s 
      JOIN clients c ON s.client_id = c.id 
      WHERE s.id = ?
    `, [req.params.id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Servicio no encontrado' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Actualizar servicio
router.put('/:id', async (req, res) => {
  const {
    service_number_text,
    client_id,
    service_detail,
    sale_price,
    cost_price,
    net_price,
    is_credit,
    is_cash,
    is_invoiced,
    has_receipt,
    origin_city,
    destination_city,
    service_date,
    description
  } = req.body;

  try {
    // Obtener el servicio actual para comparar
    const oldService = await query('SELECT is_cash, sale_price FROM services WHERE id = ?', [req.params.id]);
    
    await run(`
      UPDATE services SET 
        service_number_text = ?, client_id = ?, service_detail = ?, 
        sale_price = ?, cost_price = ?, net_price = ?,
        is_credit = ?, is_cash = ?, is_invoiced = ?, has_receipt = ?,
        origin_city = ?, destination_city = ?, service_date = ?, description = ?
      WHERE id = ?
    `, [
      service_number_text, client_id, service_detail,
      sale_price, cost_price, net_price,
      is_credit, is_cash, is_invoiced, has_receipt,
      origin_city, destination_city, service_date, description,
      req.params.id
    ]);
    
    // Si se cambió a contado y no tenía pago, registrar pago automático
    if (is_cash === 'SI' && oldService.rows[0]?.is_cash !== 'SI' && sale_price > 0) {
      // Verificar si ya existe un pago
      const existingPayment = await query('SELECT id FROM payments WHERE service_id = ?', [req.params.id]);
      if (existingPayment.rows.length === 0) {
        await run(`
          INSERT INTO payments (service_id, payment_date, amount, payment_method, notes) 
          VALUES (?, ?, ?, ?, ?)
        `, [req.params.id, service_date, sale_price, 'efectivo', 'Pago al contado - automático']);
        console.log(`✅ Pago automático registrado para servicio ${req.params.id} (cambiado a contado)`);
      }
    }
    
    res.json({ message: 'Servicio actualizado exitosamente' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Eliminar servicio
router.delete('/:id', async (req, res) => {
  try {
    await run('DELETE FROM costs WHERE service_id = ?', [req.params.id]);
    await run('DELETE FROM payments WHERE service_id = ?', [req.params.id]);
    await run('DELETE FROM services WHERE id = ?', [req.params.id]);
    
    res.json({ message: 'Servicio eliminado exitosamente' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Obtener costos de un servicio
router.get('/:id/costs', async (req, res) => {
  try {
    const result = await query('SELECT * FROM costs WHERE service_id = ?', [req.params.id]);
    if (result.rows.length === 0) {
      res.json({ tolls: 0, fuel: 0, other: 0, total_cost: 0 });
    } else {
      res.json(result.rows[0]);
    }
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Actualizar costos
router.put('/:id/costs', async (req, res) => {
  const { tolls, fuel, other } = req.body;
  const total_cost = (parseFloat(tolls) || 0) + (parseFloat(fuel) || 0) + (parseFloat(other) || 0);
  
  try {
    const existing = await query('SELECT id FROM costs WHERE service_id = ?', [req.params.id]);
    
    if (existing.rows.length > 0) {
      await run(`
        UPDATE costs SET tolls = ?, fuel = ?, other = ?, total_cost = ? 
        WHERE service_id = ?
      `, [tolls || 0, fuel || 0, other || 0, total_cost, req.params.id]);
    } else {
      await run(`
        INSERT INTO costs (service_id, tolls, fuel, other, total_cost) 
        VALUES (?, ?, ?, ?, ?)
      `, [req.params.id, tolls || 0, fuel || 0, other || 0, total_cost]);
    }
    
    await run(`
      UPDATE services SET cost_price = ?, net_price = (sale_price - ?) WHERE id = ?
    `, [total_cost, total_cost, req.params.id]);
    
    res.json({ message: 'Costos actualizados', total_cost });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;