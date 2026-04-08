const sqlite3 = require('sqlite3').verbose();
const { Pool } = require('pg');
const path = require('path');

// Determinar qué base de datos usar
let query, run, db;

if (process.env.DATABASE_URL && process.env.NODE_ENV === 'production') {
  // ============================================
  // MODO PRODUCCIÓN: PostgreSQL (Northflank)
  // ============================================
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
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