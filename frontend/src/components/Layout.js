import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import UserMenu from './UserMenu';

function Layout({ children }) {
  const location = useLocation();
  const { isAuthenticated, isAdmin, isSupervisor } = useAuth();
  
  const navigation = [
    { name: 'Dashboard', path: '/dashboard', icon: '🏠', roles: ['admin', 'supervisor', 'collector'] },
    { name: 'Clientes', path: '/clients', icon: '👥', roles: ['admin', 'supervisor', 'collector'] },
    { name: 'Servicios', path: '/services', icon: '📦', roles: ['admin', 'supervisor', 'collector'] },
    { name: 'Pagos', path: '/payments', icon: '💰', roles: ['admin', 'supervisor', 'collector'] },
    { name: 'Reportes', path: '/reports', icon: '📊', roles: ['admin', 'supervisor', 'collector'] },
    { name: 'Usuarios', path: '/users', icon: '👥', roles: ['admin'] }
  ];

  const visibleNavigation = navigation.filter(item => {
    if (item.roles.includes('admin') && isAdmin) return true;
    if (item.roles.includes('supervisor') && isSupervisor) return true;
    if (item.roles.includes('collector') && true) return true;
    return false;
  });

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #5a6e8a 0%, #3a4a6a 50%, #2a3a5a 100%)',
      backgroundAttachment: 'fixed'
    }}>
      {/* Header con gradiente azul oscuro */}
      <header style={{ 
        background: 'linear-gradient(135deg, #5a6e8a 0%, #3a4a6a 50%, #2a3a5a 100%)',
        backdropFilter: 'blur(10px)',
        color: 'white', 
        padding: '0.75rem 1rem',
        borderBottom: '1px solid rgba(0, 255, 255, 0.3)',
        boxShadow: '0 0 10px rgba(0, 255, 255, 0.1)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '1200px', margin: '0 auto' }}>
          {/* Logo con enlace a Landing Page */}
          <Link to="/" style={{ textDecoration: 'none' }}>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', textShadow: '0 0 10px rgba(0, 255, 255, 0.5)', color: '#ffffff', margin: 0 }}>
              🚛 Sistema de Cobros
            </h1>
            <p style={{ fontSize: '0.7rem', opacity: 0.9, color: '#cbd5e0', margin: 0 }}>
              Gestión de Cobranzas
            </p>
          </Link>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {/* Botón para volver a la Landing Page */}
            <Link 
              to="/"
              style={{
                backgroundColor: 'transparent',
                color: '#cbd5e0',
                padding: '0.5rem 1rem',
                borderRadius: '0.5rem',
                textDecoration: 'none',
                fontSize: '0.875rem',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                e.currentTarget.style.color = '#ffffff';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = '#cbd5e0';
              }}
            >
              🏠 Volver al sitio
            </Link>
            {isAuthenticated && <UserMenu />}
          </div>
        </div>
      </header>

      {/* Navigation con glassmorfismo y neón */}
      {isAuthenticated && (
        <nav style={{ 
          backgroundColor: 'rgba(10, 26, 58, 0.8)',
          backdropFilter: 'blur(10px)',
          boxShadow: '0 4px 6px rgba(0,0,0,0.3), 0 0 5px rgba(0, 255, 255, 0.2)',
          position: 'sticky', 
          top: 0, 
          zIndex: 10,
          borderBottom: '1px solid rgba(0, 255, 255, 0.3)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-around', padding: '0.5rem', maxWidth: '1200px', margin: '0 auto' }}>
            {visibleNavigation.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  padding: '0.5rem 1rem',
                  textDecoration: 'none',
                  borderRadius: '0.5rem',
                  color: location.pathname === item.path ? '#00ffff' : 'rgba(255, 255, 255, 0.9)',
                  backgroundColor: location.pathname === item.path ? 'rgba(0, 255, 255, 0.1)' : 'transparent',
                  transition: 'all 0.3s ease',
                  textShadow: location.pathname === item.path ? '0 0 5px rgba(0, 255, 255, 0.5)' : 'none'
                }}
              >
                <span style={{ fontSize: '1.25rem' }}>{item.icon}</span>
                <span style={{ fontSize: '0.75rem', marginTop: '0.25rem' }}>{item.name}</span>
              </Link>
            ))}
          </div>
        </nav>
      )}

      {/* Main content */}
      <main style={{ 
        maxWidth: '1200px', 
        margin: '0 auto', 
        padding: '1.5rem 1rem', 
        paddingBottom: '5rem'
      }}>
        {children}
      </main>
    </div>
  );
}

export default Layout;