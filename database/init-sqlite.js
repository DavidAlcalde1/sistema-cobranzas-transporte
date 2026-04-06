const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// Asegurar que existe la carpeta database
const dbDir = path.join(__dirname);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const dbPath = path.join(dbDir, 'fletes.db');
console.log('📁 Creando base de datos en:', dbPath);

// Eliminar base de datos existente si la hay (para empezar limpio)
if (fs.existsSync(dbPath)) {
  fs.unlinkSync(dbPath);
  console.log('🗑️  Base de datos anterior eliminada');
}

const db = new sqlite3.Database(dbPath);

const schema = `
-- Tabla de usuarios
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  full_name TEXT,
  role TEXT DEFAULT 'user',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de clientes
CREATE TABLE clients (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  document_number TEXT,
  phone TEXT,
  address TEXT,
  email TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de servicios
CREATE TABLE services (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  client_id INTEGER,
  service_type TEXT NOT NULL,
  origin_city TEXT,
  destination_city TEXT,
  service_date DATE NOT NULL,
  total_amount REAL NOT NULL,
  description TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(client_id) REFERENCES clients(id)
);

-- Tabla de pagos
CREATE TABLE payments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  service_id INTEGER,
  payment_date DATE NOT NULL,
  amount REAL NOT NULL,
  payment_method TEXT,
  collector_id INTEGER,
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(service_id) REFERENCES services(id),
  FOREIGN KEY(collector_id) REFERENCES users(id)
);

-- Insertar usuario administrador
INSERT INTO users (username, password, full_name, role) 
VALUES ('admin', 'admin123', 'Administrador', 'admin');

-- Insertar clientes de ejemplo
INSERT INTO clients (name, document_number, phone, address) VALUES
('Transportes San Juan SAC', '20512345678', '987654321', 'Av. Colonial 123, Lima'),
('Importaciones Perú EIRL', '20612345679', '987654322', 'Calle Los Andes 456, Arequipa'),
('Distribuidora El Sol', '20456789123', '987654323', 'Jr. La Paz 789, Trujillo');

-- Insertar servicios de ejemplo
INSERT INTO services (client_id, service_type, origin_city, destination_city, service_date, total_amount) VALUES
(1, 'carga completa', 'Lima', 'Arequipa', '2026-03-15', 2500.00),
(1, 'carga parcial', 'Lima', 'Cusco', '2026-03-20', 1800.00),
(2, 'expreso', 'Callao', 'Trujillo', '2026-03-18', 3200.00),
(2, 'carga completa', 'Lima', 'Piura', '2026-03-25', 4200.00),
(3, 'carga parcial', 'Trujillo', 'Lima', '2026-03-22', 1500.00);

-- Insertar pagos de ejemplo
INSERT INTO payments (service_id, payment_date, amount, payment_method, notes) VALUES
(1, '2026-03-16', 1000.00, 'transferencia', 'Pago inicial'),
(1, '2026-03-20', 1500.00, 'efectivo', 'Pago completado'),
(3, '2026-03-19', 2000.00, 'yape', 'Abono a cuenta');
`;

db.serialize(() => {
  db.exec(schema, (err) => {
    if (err) {
      console.error('❌ Error creando tablas:', err.message);
    } else {
      console.log('✅ Tablas creadas exitosamente');
      
      // Verificar los datos insertados
      db.get("SELECT COUNT(*) as count FROM clients", (err, row) => {
        if (!err) {
          console.log(`📊 Clientes insertados: ${row.count}`);
        }
      });
      
      db.get("SELECT COUNT(*) as count FROM services", (err, row) => {
        if (!err) {
          console.log(`📊 Servicios insertados: ${row.count}`);
        }
      });
      
      console.log('\n✨ Base de datos lista para usar!');
      console.log('👤 Usuario: admin');
      console.log('🔑 Contraseña: admin123');
    }
    db.close();
  });
});