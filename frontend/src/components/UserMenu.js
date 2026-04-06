import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

function UserMenu() {
  const { user, logout } = useAuth();
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);

  const getRoleName = (role) => {
    switch(role) {
      case 'admin': return 'Administrador';
      case 'supervisor': return 'Supervisor';
      case 'collector': return 'Cobrador';
      default: return 'Usuario';
    }
  };

  const getRoleColor = (role) => {
    switch(role) {
      case 'admin': return '#ff6b6b';
      case 'supervisor': return '#ffa500';
      case 'collector': return '#00ffff';
      default: return '#00ffff';
    }
  };

  // Cerrar menú al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div ref={menuRef} style={{ position: 'relative', zIndex: 9999 }}>
      <button
        onClick={() => setShowMenu(!showMenu)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          background: 'rgba(10, 26, 58, 0.9)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(0, 255, 255, 0.5)',
          padding: '0.5rem 1rem',
          borderRadius: '0.5rem',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          boxShadow: '0 0 5px rgba(0, 255, 255, 0.3)',
          whiteSpace: 'nowrap'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(0, 255, 255, 0.25)';
          e.currentTarget.style.borderColor = '#00ffff';
          e.currentTarget.style.boxShadow = '0 0 15px rgba(0, 255, 255, 0.5)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'rgba(10, 26, 58, 0.9)';
          e.currentTarget.style.borderColor = 'rgba(0, 255, 255, 0.5)';
          e.currentTarget.style.boxShadow = '0 0 5px rgba(0, 255, 255, 0.3)';
        }}
      >
        <span style={{ fontSize: '1.25rem' }}>👤</span>
        <div style={{ textAlign: 'left' }}>
          <div style={{ 
            fontSize: '0.875rem', 
            fontWeight: '500',
            color: getRoleColor(user?.role),
            textShadow: `0 0 5px ${getRoleColor(user?.role)}`
          }}>
            {user?.full_name || user?.username}
          </div>
          <div style={{ fontSize: '0.7rem', color: 'rgba(255, 255, 255, 0.9)' }}>{getRoleName(user?.role)}</div>
        </div>
      </button>
      
      {showMenu && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 8px)',
          right: 0,
          background: 'rgba(10, 26, 58, 0.98)',
          backdropFilter: 'blur(15px)',
          borderRadius: '0.75rem',
          border: '1px solid rgba(0, 255, 255, 0.5)',
          boxShadow: '0 8px 20px rgba(0, 0, 0, 0.4), 0 0 20px rgba(0, 255, 255, 0.2)',
          minWidth: '220px',
          width: 'auto',
          maxWidth: '280px',
          zIndex: 10000
        }}>
          <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid rgba(0, 255, 255, 0.3)' }}>
            <div style={{ 
              fontWeight: 'bold', 
              fontSize: '0.9rem',
              color: getRoleColor(user?.role),
              textShadow: `0 0 5px ${getRoleColor(user?.role)}`,
              wordBreak: 'break-word'
            }}>
              {user?.full_name}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.8)', marginTop: '0.25rem', wordBreak: 'break-word' }}>
              @{user?.username}
            </div>
            {user?.email && (
              <div style={{ fontSize: '0.7rem', color: 'rgba(255, 255, 255, 0.6)', marginTop: '0.25rem', wordBreak: 'break-word' }}>
                {user?.email}
              </div>
            )}
            <div style={{ 
              fontSize: '0.65rem', 
              marginTop: '0.75rem',
              background: 'rgba(0, 255, 255, 0.2)',
              padding: '0.25rem 0.6rem',
              borderRadius: '0.25rem',
              display: 'inline-block',
              color: getRoleColor(user?.role),
              border: '1px solid rgba(0, 255, 255, 0.4)'
            }}>
              {getRoleName(user?.role)}
            </div>
          </div>
          <button
            onClick={() => {
              setShowMenu(false);
              logout();
            }}
            style={{
              width: '100%',
              textAlign: 'left',
              padding: '0.75rem 1rem',
              border: 'none',
              backgroundColor: 'transparent',
              cursor: 'pointer',
              color: '#ff6b6b',
              fontSize: '0.85rem',
              fontWeight: '500',
              transition: 'all 0.3s ease',
              borderRadius: '0 0 0.75rem 0.75rem'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 107, 107, 0.2)';
              e.currentTarget.style.textShadow = '0 0 5px #ff6b6b';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.textShadow = 'none';
            }}
          >
            🔓 Cerrar Sesión
          </button>
        </div>
      )}
    </div>
  );
}

export default UserMenu;