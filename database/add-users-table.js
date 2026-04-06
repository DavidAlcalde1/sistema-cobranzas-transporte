const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcrypt');

const dbPath = path.join(__dirname, 'fletes.db');
const db = new sqlite3.Database(dbPath);

console.log('🔧 Agregando funcionalidad de usuarios...\n');

db.serialize(() => {
  // Verificar si la tabla users existe y agregar columnas si es necesario
  db.all("PRAGMA table_info(users)", [], (err, columns) => {
    if (err) {
      console.error('Error:', err);
      return;
    }
    
    const columnNames = columns ? columns.map(c => c.name) : [];
    
    // Agregar columna email si no existe
    if (!columnNames.includes('email')) {
      db.run('ALTER TABLE users ADD COLUMN email TEXT', (err) => {
        if (err) console.log('Error agregando email:', err.message);
        else console.log('✅ Columna email agregada');
      });
    } else {
      console.log('⏭️ Columna email ya existe');
    }
    
    // Agregar columna active si no existe
    if (!columnNames.includes('active')) {
      db.run('ALTER TABLE users ADD COLUMN active TEXT DEFAULT "SI"', (err) => {
        if (err) console.log('Error agregando active:', err.message);
        else console.log('✅ Columna active agregada');
      });
    } else {
      console.log('⏭️ Columna active ya existe');
    }
    
    // Agregar columna last_login si no existe
    if (!columnNames.includes('last_login')) {
      db.run('ALTER TABLE users ADD COLUMN last_login DATETIME', (err) => {
        if (err) console.log('Error agregando last_login:', err.message);
        else console.log('✅ Columna last_login agregada');
      });
    } else {
      console.log('⏭️ Columna last_login ya existe');
    }
    
    // Insertar usuarios de ejemplo si no existen
    setTimeout(() => {
      const users = [
        { username: 'admin', password: 'admin123', full_name: 'Administrador', role: 'admin', email: 'admin@fletes.com' },
        { username: 'cobrador1', password: 'cobrador123', full_name: 'Juan Pérez', role: 'collector', email: 'juan@fletes.com' },
        { username: 'cobrador2', password: 'cobrador123', full_name: 'María López', role: 'collector', email: 'maria@fletes.com' },
        { username: 'supervisor', password: 'supervisor123', full_name: 'Carlos Ruiz', role: 'supervisor', email: 'carlos@fletes.com' }
      ];
      
      users.forEach(user => {
        const hashedPassword = bcrypt.hashSync(user.password, 10);
        db.run(
          `INSERT OR IGNORE INTO users (username, password, full_name, role, email, active) 
           VALUES (?, ?, ?, ?, ?, 'SI')`,
          [user.username, hashedPassword, user.full_name, user.role, user.email],
          function(err) {
            if (err) {
              if (err.message.includes('UNIQUE')) {
                console.log(`⏭️ Usuario ${user.username} ya existe`);
              } else {
                console.log(`❌ Error insertando ${user.username}:`, err.message);
              }
            } else if (this.changes > 0) {
              console.log(`✅ Usuario ${user.username} creado`);
            }
          }
        );
      });
      
      setTimeout(() => {
        console.log('\n✨ Usuarios configurados:');
        console.log('   admin / admin123 (Administrador)');
        console.log('   cobrador1 / cobrador123 (Cobrador)');
        console.log('   cobrador2 / cobrador123 (Cobrador)');
        console.log('   supervisor / supervisor123 (Supervisor)');
        console.log('\n✅ Script completado');
        db.close();
      }, 1500);
    }, 500);
  });
});