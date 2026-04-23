const sqlite3 = require('sqlite3').verbose();
const { Pool } = require('pg');
const path = require('path');
const bcrypt = require('bcrypt');

// Variables de entorno para depuración
console.log('🔍 DEBUG - NODE_ENV:', JSON.stringify(process.env.NODE_ENV));
console.log('🔍 DEBUG - DATABASE_URL exists:', !!process.env.DATABASE_URL);
console.log('🔍 DEBUG - USE_POSTGRES:', process.env.USE_POSTGRES);

// Determinar qué base de datos usar
let query, run, db;

// Forzar SQLite en producción también
const usarPostgres = false;

console.log('🔍 DEBUG - usarPostgres:', usarPostgres);

if (usarPostgres) {
  // ============================================
  // MODO PRODUCCIÓN: PostgreSQL (Northflank)
  // ============================================
  console.log('📊 Conectando a PostgreSQL...');
  
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    max: 10,
    idleTimeoutMillis: 30000,
  });

  pool.connect((err, client, release) => {
    if (err) {
      console.error('❌ Error conectando a PostgreSQL:', err.message);
    } else {
      console.log('✅ Conectado a PostgreSQL correctamente');
      release();
    }
  });

  query = async (sql, params = []) => {
    try {
      const result = await pool.query(sql, params);
      return { rows: result.rows };
    } catch (err) {
      console.error('❌ Error en query PostgreSQL:', err.message);
      throw err;
    }
  };

  run = async (sql, params = []) => {
    try {
      const result = await pool.query(sql, params);
      return { lastID: null, changes: result.rowCount };
    } catch (err) {
      console.error('❌ Error en run PostgreSQL:', err.message);
      throw err;
    }
  };

  db = pool;
  console.log('📊 Base de datos: PostgreSQL (producción)');

} else {
  // ============================================
  // MODO SQLite (local y producción)
  // ============================================
  console.log('📊 Usando SQLite');
  
  // Usar /tmp en producción (Northflank) o carpeta local en desarrollo
  const dbPath = process.env.NODE_ENV === 'production' 
    ? '/tmp/fletes.db' 
    : path.join(__dirname, '../../database/fletes.db');
  console.log('📁 Ruta de base de datos:', dbPath);
  
  const sqliteDb = new sqlite3.Database(dbPath, (err) => {
    if (err) {
      console.error('❌ Error conectando a SQLite:', err.message);
    } else {
      console.log('✅ Conectado a SQLite correctamente');
      
      sqliteDb.serialize(() => {
      // ========== CREAR TABLAS ==========
      
      // Tabla users
      sqliteDb.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        full_name TEXT,
        role TEXT DEFAULT 'user',
        email TEXT,
        active TEXT DEFAULT 'SI',
        last_login DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`);
      
      // Tabla clients
      sqliteDb.run(`CREATE TABLE IF NOT EXISTS clients (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        document_number TEXT,
        phone TEXT,
        address TEXT,
        email TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`);
      
      // Tabla services
      sqliteDb.run(`CREATE TABLE IF NOT EXISTS services (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        service_number_text TEXT,
        client_id INTEGER,
        service_type TEXT,
        service_detail TEXT,
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
      )`);
      
      // Tabla payments
      sqliteDb.run(`CREATE TABLE IF NOT EXISTS payments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        service_id INTEGER,
        payment_date DATE NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        payment_method TEXT,
        collector_id INTEGER,
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(service_id) REFERENCES services(id),
        FOREIGN KEY(collector_id) REFERENCES users(id)
      )`);
      
      // Tabla costs
      sqliteDb.run(`CREATE TABLE IF NOT EXISTS costs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        service_id INTEGER,
        tolls DECIMAL(10,2) DEFAULT 0,
        fuel DECIMAL(10,2) DEFAULT 0,
        other DECIMAL(10,2) DEFAULT 0,
        total_cost DECIMAL(10,2) DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(service_id) REFERENCES services(id)
      )`);
      
      console.log('✅ Todas las tablas creadas/verificadas');
      
      console.log('✅ Todas las tablas creadas/verificadas');
      
      // ========== INSERTAR USUARIO ADMIN (después de crear tablas) ==========
      const hashedPassword = bcrypt.hashSync('admin123', 10);
      sqliteDb.run(`INSERT OR IGNORE INTO users (username, password, full_name, role, active) 
        VALUES ('admin', ?, 'Administrador', 'admin', 'SI')`, [hashedPassword], function(err) {
        if (err) {
          console.error('❌ Error creando usuario admin:', err.message);
        } else if (this.changes > 0) {
          console.log('✅ Usuario admin creado');
        } else {
          console.log('✅ Usuario admin ya existe');
        }
      });
    });
  }
});
  
  // query para SELECT
  query = (sql, params = []) => {
    return new Promise((resolve, reject) => {
      sqliteDb.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve({ rows });
      });
    });
  };

  // run para INSERT, UPDATE, DELETE
  run = (sql, params = []) => {
    return new Promise((resolve, reject) => {
      sqliteDb.run(sql, params, function(err) {
        if (err) reject(err);
        else resolve({ lastID: this.lastID, changes: this.changes });
      });
    });
  };

  db = sqliteDb;
  console.log('📊 Base de datos: SQLite');
}

module.exports = { query, run, db };