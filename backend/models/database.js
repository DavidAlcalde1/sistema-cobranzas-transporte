const sqlite3 = require('sqlite3').verbose();
const { Pool } = require('pg');
const path = require('path');

// Variables de entorno para depuración
console.log('🔍 DEBUG - NODE_ENV:', JSON.stringify(process.env.NODE_ENV));
console.log('🔍 DEBUG - DATABASE_URL exists:', !!process.env.DATABASE_URL);
console.log('🔍 DEBUG - USE_POSTGRES:', process.env.USE_POSTGRES);

// Determinar qué base de datos usar (MÁS FLEXIBLE)
let query, run, db;

// Condición mejorada: acepta varias formas de activar PostgreSQL
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
    max: 10, // Máximo de conexiones
    idleTimeoutMillis: 30000,
  });

  // Probar conexión
  pool.connect((err, client, release) => {
    if (err) {
      console.error('❌ Error conectando a PostgreSQL:', err.message);
    } else {
      console.log('✅ Conectado a PostgreSQL correctamente');
      release();
    }
  });

  // query para SELECT
  query = async (sql, params = []) => {
    try {
      const result = await pool.query(sql, params);
      return { rows: result.rows };
    } catch (err) {
      console.error('❌ Error en query PostgreSQL:', err.message);
      throw err;
    }
  };

  // run para INSERT, UPDATE, DELETE
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
  // MODO DESARROLLO: SQLite (local)
  // ============================================
  console.log('📊 Usando SQLite (modo desarrollo) - VERSION_FORZADA_2');
  
  const dbPath = path.join(__dirname, '../../database/fletes.db');
  const sqliteDb = new sqlite3.Database(dbPath, (err) => {
    if (err) {
      console.error('❌ Error conectando a SQLite:', err.message);
    } else {
      console.log('✅ Conectado a SQLite correctamente');
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
  console.log('📊 Base de datos: SQLite (desarrollo)');
}

module.exports = { query, run, db };