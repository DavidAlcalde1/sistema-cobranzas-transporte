const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'fletes.db');
const db = new sqlite3.Database(dbPath);

console.log('🔧 Limpiando tabla services...\n');

db.serialize(() => {
  // Crear nueva tabla sin service_number_old
  db.run(`
    CREATE TABLE services_new (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      client_id INTEGER,
      service_type TEXT,
      service_detail TEXT,
      service_number TEXT,
      sale_price DECIMAL(10,2),
      cost_price DECIMAL(10,2),
      net_price DECIMAL(10,2),
      is_credit TEXT DEFAULT 'NO',
      is_cash TEXT DEFAULT 'NO',
      is_invoiced TEXT DEFAULT 'NO',
      has_receipt TEXT DEFAULT 'NO',
      origin_city TEXT,
      destination_city TEXT,
      service_date DATE NOT NULL,
      description TEXT,
      total_amount DECIMAL(10,2),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(client_id) REFERENCES clients(id)
    )
  `, (err) => {
    if (err) console.log('Error:', err.message);
    else console.log('✅ Tabla temporal creada');
  });

  // Copiar datos (service_number_old se convierte a TEXT)
  db.run(`
    INSERT INTO services_new (
      id, client_id, service_type, service_detail, service_number,
      sale_price, cost_price, net_price, is_credit, is_cash,
      is_invoiced, has_receipt, origin_city, destination_city,
      service_date, description, total_amount, created_at
    )
    SELECT 
      id, client_id, service_type, service_detail, 
      CAST(service_number_old AS TEXT),
      sale_price, cost_price, net_price, is_credit, is_cash,
      is_invoiced, has_receipt, origin_city, destination_city,
      service_date, description, total_amount, created_at
    FROM services
  `, (err) => {
    if (err) console.log('Error copiando:', err.message);
    else console.log('✅ Datos copiados');
  });

  // Eliminar tabla vieja
  db.run(`DROP TABLE services`, (err) => {
    if (err) console.log('Error:', err.message);
    else console.log('✅ Tabla antigua eliminada');
  });

  // Renombrar nueva tabla
  db.run(`ALTER TABLE services_new RENAME TO services`, (err) => {
    if (err) console.log('Error:', err.message);
    else {
      console.log('✅ Tabla limpiada correctamente');
      console.log('\n📋 service_number ahora es TEXT y puede contener:');
      console.log('   - S001-2026');
      console.log('   - F-001');
      console.log('   - TR-001');
      console.log('   - Cualquier formato alfanumérico');
      
      // Verificar resultado
      db.all("PRAGMA table_info(services)", [], (err, cols) => {
        console.log('\n📊 Columnas finales:');
        cols.forEach(c => {
          if (c.name === 'service_number') console.log(`   ✅ ${c.name} (${c.type})`);
          else if (c.name === 'service_number_old') console.log(`   ❌ ${c.name} (eliminada)`);
        });
        db.close();
      });
    }
  });
});