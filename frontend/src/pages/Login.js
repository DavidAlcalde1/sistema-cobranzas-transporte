import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    const result = await login(username, password);
    
    if (!result.success) {
      setError(result.error);
    }
    setLoading(false);
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      backgroundImage: `url('/camion.jpeg')`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      position: 'relative'
    }}>
      {/* Overlay oscuro para mejorar legibilidad */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        zIndex: 1
      }} />
      
      {/* Contenedor del login con efecto glassmorfismo */}
      <div style={{ 
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        backdropFilter: 'blur(10px)',
        borderRadius: '1rem',
        padding: '2rem',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
        border: '1px solid rgba(255, 255, 255, 0.3)',
        width: '100%',
        maxWidth: '400px',
        zIndex: 2,
        position: 'relative'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{ 
            fontSize: '1.75rem', 
            fontWeight: 'bold', 
            color: 'white',
            textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
            marginBottom: '0.5rem'
          }}>
            🚛 Sistema de Cobros
          </h1>
          <p style={{ 
            fontSize: '0.875rem', 
            color: 'rgba(255, 255, 255, 0.9)',
            textShadow: '1px 1px 2px rgba(0,0,0,0.2)'
          }}>
            Gestión de Cobranzas
          </p>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ 
              display: 'block', 
              fontSize: '0.875rem', 
              fontWeight: '500', 
              marginBottom: '0.5rem',
              color: 'white',
              textShadow: '1px 1px 2px rgba(0,0,0,0.2)'
            }}>
              Usuario
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                borderRadius: '0.5rem',
                fontSize: '1rem',
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                color: 'white',
                outline: 'none',
                transition: 'all 0.3s ease'
              }}
              onFocus={(e) => {
                e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.3)';
                e.target.style.borderColor = 'rgba(255, 255, 255, 0.6)';
              }}
              onBlur={(e) => {
                e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
                e.target.style.borderColor = 'rgba(255, 255, 255, 0.3)';
              }}
              required
              autoFocus
            />
          </div>
          
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ 
              display: 'block', 
              fontSize: '0.875rem', 
              fontWeight: '500', 
              marginBottom: '0.5rem',
              color: 'white',
              textShadow: '1px 1px 2px rgba(0,0,0,0.2)'
            }}>
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                borderRadius: '0.5rem',
                fontSize: '1rem',
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                color: 'white',
                outline: 'none',
                transition: 'all 0.3s ease'
              }}
              onFocus={(e) => {
                e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.3)';
                e.target.style.borderColor = 'rgba(255, 255, 255, 0.6)';
              }}
              onBlur={(e) => {
                e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
                e.target.style.borderColor = 'rgba(255, 255, 255, 0.3)';
              }}
              required
            />
          </div>
          
          {error && (
            <div style={{ 
              backgroundColor: 'rgba(220, 38, 38, 0.9)', 
              color: 'white', 
              padding: '0.75rem', 
              borderRadius: '0.5rem',
              marginBottom: '1rem',
              fontSize: '0.875rem',
              textAlign: 'center',
              backdropFilter: 'blur(5px)'
            }}>
              {error}
            </div>
          )}
          
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              backgroundColor: '#4a5568',
              color: 'white',
              padding: '0.75rem',
              borderRadius: '0.5rem',
              border: '1px solid #718096',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '1rem',
              fontWeight: 'bold',
              opacity: loading ? 0.7 : 1,
              transition: 'all 0.3s ease',
              boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
            }}
            onMouseEnter={(e) => {
              if (!loading) e.target.style.backgroundColor = '#2d3748';
            }}
            onMouseLeave={(e) => {
              if (!loading) e.target.style.backgroundColor = '#4a5568';
            }}
          >
            {loading ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>
        
        {/* Enlace sutil para volver a la Landing Page */}
        <div style={{ 
          marginTop: '1.5rem', 
          textAlign: 'center',
          borderTop: '1px solid rgba(255, 255, 255, 0.2)',
          paddingTop: '1rem'
        }}>
          <Link 
            to="/"
            style={{
              color: 'rgba(255, 255, 255, 0.6)',
              textDecoration: 'none',
              fontSize: '0.8rem',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#ffffff';
              e.currentTarget.style.textDecoration = 'underline';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'rgba(255, 255, 255, 0.6)';
              e.currentTarget.style.textDecoration = 'none';
            }}
          >
            ← Volver al inicio
          </Link>
        </div>
        
        <div style={{ 
          marginTop: '1rem', 
          textAlign: 'center'
        }}>
          <p style={{ fontSize: '0.65rem', color: 'rgba(255, 255, 255, 0.6)' }}>
            Credenciales de prueba:<br />
            admin / admin123 | cobrador1 / cobrador123
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;