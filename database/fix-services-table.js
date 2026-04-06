const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'fletes.db');
const db = new sqlite3.Database(dbPath);

console.log('🔧 Reparando tabla services...\n');

// Verificar estructura actual
db.all("PRAGMA table_info(services)", [], (err, columns) => {
    if (err) {
        console.error('Error:', err);
        db.close();
        return;
    }
    
    console.log('Columnas actuales:');
    columns.forEach(col => {
        console.log(`  - ${col.name} (${col.type}) ${col.notnull ? 'NOT NULL' : ''}`);
    });
    
    // Verificar si service_type existe y es NOT NULL
    const serviceTypeCol = columns.find(c => c.name === 'service_type');
    
    if (serviceTypeCol && serviceTypeCol.notnull === 1) {
        console.log('\n⚠️  service_type es NOT NULL. Eliminando restricción...');
        
        // SQLite no permite modificar columnas directamente, hay que recrear la tabla
        db.serialize(() => {
            // 1. Crear tabla temporal
            db.run(`
                CREATE TABLE services_temp (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    service_number INTEGER,
                    client_id INTEGER,
                    service_detail TEXT,
                    service_type TEXT,
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
                if (err) console.log('Error creando tabla temporal:', err.message);
                else console.log('✅ Tabla temporal creada');
            });
            
            // 2. Copiar datos
            db.run(`
                INSERT INTO services_temp 
                SELECT id, service_number, client_id, service_detail, service_type, 
                       sale_price, cost_price, net_price, is_credit, is_cash, 
                       is_invoiced, has_receipt, origin_city, destination_city, 
                       service_date, description, total_amount, created_at
                FROM services
            `, (err) => {
                if (err) console.log('Error copiando datos:', err.message);
                else console.log('✅ Datos copiados');
            });
            
            // 3. Eliminar tabla original
            db.run(`DROP TABLE services`, (err) => {
                if (err) console.log('Error eliminando tabla:', err.message);
                else console.log('✅ Tabla original eliminada');
            });
            
            // 4. Renombrar temporal a original
            db.run(`ALTER TABLE services_temp RENAME TO services`, (err) => {
                if (err) console.log('Error renombrando:', err.message);
                else console.log('✅ Tabla reparada correctamente');
            });
            
            setTimeout(() => {
                console.log('\n✅ Reparación completada');
                db.close();
            }, 1000);
        });
    } else {
        console.log('\n✅ La tabla ya está correcta');
        db.close();
    }
});