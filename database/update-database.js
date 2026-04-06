const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, 'fletes.db');
console.log('📁 Actualizando base de datos en:', dbPath);

// Hacer backup
if (fs.existsSync(dbPath)) {
    const backupPath = path.join(__dirname, `fletes_backup_${Date.now()}.db`);
    fs.copyFileSync(dbPath, backupPath);
    console.log('💾 Backup creado:', backupPath);
}

const db = new sqlite3.Database(dbPath);

// Verificar si las columnas ya existen
db.get("PRAGMA table_info(services)", (err, rows) => {
    if (err) {
        console.error('Error:', err);
        return;
    }
    
    // Lista de columnas que queremos agregar
    const newColumns = [
        'service_number INTEGER',
        'service_detail TEXT',
        'sale_price DECIMAL(10,2)',
        'cost_price DECIMAL(10,2)',
        'net_price DECIMAL(10,2)',
        'is_credit TEXT DEFAULT "NO"',
        'is_cash TEXT DEFAULT "NO"',
        'is_invoiced TEXT DEFAULT "NO"',
        'has_receipt TEXT DEFAULT "NO"'
    ];
    
    // Obtener columnas existentes
    db.all("PRAGMA table_info(services)", [], (err, columns) => {
        const existingColumns = columns.map(c => c.name);
        
        // Agregar cada columna si no existe
        newColumns.forEach(col => {
            const colName = col.split(' ')[0];
            if (!existingColumns.includes(colName)) {
                const sql = `ALTER TABLE services ADD COLUMN ${col}`;
                db.run(sql, (err) => {
                    if (err) {
                        console.log(`⚠️  No se pudo agregar ${colName}:`, err.message);
                    } else {
                        console.log(`✅ Columna agregada: ${colName}`);
                    }
                });
            } else {
                console.log(`⏭️  Columna ya existe: ${colName}`);
            }
        });
        
        // Crear tabla de costos si no existe
        db.run(`CREATE TABLE IF NOT EXISTS costs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            service_id INTEGER,
            tolls DECIMAL(10,2) DEFAULT 0,
            fuel DECIMAL(10,2) DEFAULT 0,
            other DECIMAL(10,2) DEFAULT 0,
            total_cost DECIMAL(10,2) DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(service_id) REFERENCES services(id)
        )`, (err) => {
            if (err) {
                console.log('⚠️  Error creando tabla costs:', err.message);
            } else {
                console.log('✅ Tabla costs creada/verificada');
            }
        });
        
        // Actualizar servicios existentes con datos de ejemplo
        db.run(`UPDATE services SET 
            service_number = id,
            service_detail = 'Servicio de traslado',
            sale_price = total_amount,
            cost_price = total_amount * 0.7,
            net_price = total_amount * 0.3,
            is_credit = 'SI',
            is_cash = 'NO',
            is_invoiced = 'NO',
            has_receipt = 'SI'
            WHERE service_number IS NULL`, (err) => {
            if (err) {
                console.log('⚠️  Error actualizando servicios:', err.message);
            } else {
                console.log('✅ Servicios actualizados con datos por defecto');
            }
        });
        
        setTimeout(() => {
            db.close();
            console.log('\n✨ Base de datos actualizada!');
            console.log('👤 Usuario: admin');
            console.log('🔑 Contraseña: admin123');
        }, 2000);
    });
});