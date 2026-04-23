const { Client } = require('pg');
const bcrypt = require('bcrypt');

// La URL de conexión de Northflank (desde tus Connection details)
const DATABASE_URL = 'postgresql://_b41ba11215ff2262:_83b2075ea2a4a827d87ca359db00a0@primary.db-cobranzas--b8r4vf6vdbjv.addon.code.run:27664/_6ecc75d291a3?sslmode=require';

const client = new Client({
  connectionString: DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function initDatabase() {
  try {
    await client.connect();
    console.log('✅ Conectado a PostgreSQL');
    
    // Crear tablas
    console.log('📝 Creando tablas...');
    
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        full_name TEXT,
        role TEXT DEFAULT 'user',
        email TEXT,
        active TEXT DEFAULT 'SI',
        last_login TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Tabla users creada');
    
    await client.query(`
      CREATE TABLE IF NOT EXISTS clients (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        document_number TEXT,
        phone TEXT,
        address TEXT,
        email TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Tabla clients creada');
    
    await client.query(`
      CREATE TABLE IF NOT EXISTS services (
        id SERIAL PRIMARY KEY,
        service_number_text TEXT,
        client_id INTEGER REFERENCES clients(id),
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
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Tabla services creada');
    
    await client.query(`
      CREATE TABLE IF NOT EXISTS payments (
        id SERIAL PRIMARY KEY,
        service_id INTEGER REFERENCES services(id),
        payment_date DATE NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        payment_method TEXT,
        collector_id INTEGER REFERENCES users(id),
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Tabla payments creada');
    
    await client.query(`
      CREATE TABLE IF NOT EXISTS costs (
        id SERIAL PRIMARY KEY,
        service_id INTEGER REFERENCES services(id),
        tolls DECIMAL(10,2) DEFAULT 0,
        fuel DECIMAL(10,2) DEFAULT 0,
        other DECIMAL(10,2) DEFAULT 0,
        total_cost DECIMAL(10,2) DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Tabla costs creada');
    
    // Insertar usuario admin
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await client.query(`
      INSERT INTO users (username, password, full_name, role, active) 
      VALUES ('admin', $1, 'Administrador', 'admin', 'SI')
      ON CONFLICT (username) DO NOTHING
    `, [hashedPassword]);
    console.log('✅ Usuario admin creado/verificado');
    
    console.log('🎉 Base de datos inicializada correctamente');
    await client.end();
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

initDatabase();