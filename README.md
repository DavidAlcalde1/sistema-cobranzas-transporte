# sistema-cobranzas-transporte
Sistema de gestión de cobranzas para transporte de carga. Control de deudas, pagos, clientes y reportes con autenticación por roles (Admin, Supervisor, Cobrador).

## 📋 Características principales

- **Autenticación de usuarios** con JWT y roles (Administrador, Supervisor, Cobrador)
- **Gestión de clientes** (CRUD completo con control de permisos)
- **Gestión de servicios** de transporte con cálculo automático de costos
- **Registro de pagos** y control de deudas pendientes
- **Reportes en Excel y PDF** con filtros por fechas y clientes
- **Dashboard interactivo** con estadísticas en tiempo real
- **Diseño responsive** para uso en móvil, tablet y desktop
- **Landing page** corporativa para presentación de la empresa

## 👥 Roles y permisos

| Rol | Descripción |
|-----|-------------|
| 👑 Administrador | Acceso total al sistema, gestión de usuarios |
| 👔 Supervisor | Acceso a todas las funciones excepto gestión de usuarios |
| 💼 Cobrador | Registro de pagos y consulta de deudas |

## 🛠️ Tecnologías utilizadas

### Backend
- Node.js + Express
- SQLite (desarrollo) / PostgreSQL (producción)
- JWT para autenticación
- Bcrypt para encriptación

### Frontend
- React.js
- React Router
- Axios
- CSS-in-JS (estilos personalizados)
- jsPDF + AutoTable (reportes PDF)

## 🚀 Características de seguridad

- Autenticación con JWT
- Contraseñas encriptadas con bcrypt
- Protección de rutas por roles
- Variables de entorno para datos sensibles
- Rate limiting en login
- Helmet para protección de cabeceras HTTP

## 📦 Instalación

```bash
# Clonar el repositorio
git clone https://github.com/tu-usuario/sistema-cobranzas.git

# Instalar dependencias del backend
cd sistema-cobranzas/backend
npm install

# Instalar dependencias del frontend
cd ../frontend
npm install

# Configurar variables de entorno
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# Iniciar en modo desarrollo
# Backend (puerto 3001)
cd backend
npm run dev

# Frontend (puerto 3000)
cd frontend
npm start
