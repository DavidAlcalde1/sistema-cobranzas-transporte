import React from 'react';
import { Link } from 'react-router-dom';

function Landing() {
  const services = [
    { 
      name: 'Carga Completa', 
      description: 'Transporte exclusivo para tus mercancías sin consolidar con otras cargas.',
      image: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=400&h=250&fit=crop',
      alt: 'Camión de carga completa'
    },
    { 
      name: 'Carga Parcial', 
      description: 'Optimiza costos compartiendo espacio con otras cargas compatibles.',
      image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=400&h=250&fit=crop',
      alt: 'Camión de carga parcial'
    },
    { 
      name: 'Expreso', 
      description: 'Entregas rápidas para envíos urgentes con prioridad en ruta.',
      image: 'https://images.unsplash.com/photo-1494412574643-ff11b0a5c1c3?w=400&h=250&fit=crop',
      alt: 'Camión expreso'
    },
    { 
      name: 'Especial', 
      description: 'Soluciones personalizadas para cargas de dimensiones o requerimientos especiales.',
      image: '/camion1.avif', 
      alt: 'Camión para carga especial'
    }
  ];

  const fleet = [
    { name: 'Freightliner M2 112', capacity: 'Hasta 30 TN', image: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=300&h=200&fit=crop' },
    { name: 'Freightliner 114 SD', capacity: 'Hasta 35 TN', image: 'camion3.jpg' },
    { name: 'Sitrak', capacity: 'Hasta 32 TN', image: 'camion6.jpg' },
    { name: 'Plataforma 20ft', capacity: '20 pies', image: 'camion5.jpg' },
    { name: 'Plataforma 40ft', capacity: '40 pies', image: 'camion7.jpg' },
    { name: 'Cama Baja', capacity: 'Hasta 50 TN', image: 'camion2.jpg' },
    { name: 'Caja 58M3', capacity: '58 m³', image: 'camion8.jpg' },
    { name: 'Caja 70M3', capacity: '70 m³', image: 'camion9.jpg' },
    { name: 'Caja 90M3', capacity: '90 m³', image: 'camion1.avif' }
  ];

  const whatsappNumber = '51980688012';
  const whatsappMessage = 'Hola, me gustaría recibir más información sobre sus servicios de transporte.';

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #4a5568 0%, #2d3748 50%, #1a202c 100%)',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      {/* Header con navegación */}
      <header style={{
        background: 'rgba(26, 32, 44, 0.95)',
        backdropFilter: 'blur(10px)',
        padding: '1rem 2rem',
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        <div style={{ 
          maxWidth: '1200px', 
          margin: '0 auto', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <div>
            <h2 style={{ 
              fontSize: '1.5rem', 
              fontWeight: 'bold', 
              color: '#ffffff',
              margin: 0
            }}>
              CORPORACION YOSMEL & HNOS S.A.C
            </h2>
            <p style={{ fontSize: '0.7rem', color: '#cbd5e0', margin: 0 }}>
              Movemos tu carga con seguridad y eficiencia en todo el Perú
            </p>
          </div>

          <nav style={{ display: 'flex', gap: '2rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <a href="#servicios" style={{ color: '#ffffff', textDecoration: 'none', fontSize: '0.9rem' }}>Servicios</a>
            <a href="#flota" style={{ color: '#ffffff', textDecoration: 'none', fontSize: '0.9rem' }}>Flota</a>
            <a href="#contacto" style={{ color: '#ffffff', textDecoration: 'none', fontSize: '0.9rem' }}>Contacto</a>
            <Link 
              to="/login" 
              style={{
                backgroundColor: '#4a5568',
                color: 'white',
                padding: '0.5rem 1.5rem',
                borderRadius: '0.375rem',
                textDecoration: 'none',
                fontWeight: '500',
                fontSize: '0.875rem',
                border: '1px solid #718096'
              }}
            >
              Sistema de Cobranzas
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
        <section style={{
        position: 'relative',
        padding: '5rem 2rem',
        textAlign: 'center',
        backgroundImage: 'url("/camion7.jpg")',
        backgroundSize: 'cover',
        backgroundPosition: 'center'
        }}>
        {/* Capa oscura para mejorar la legibilidad del texto */}
        <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
        }} />
        {/* Contenido con mayor jerarquía (z-index) */}
        <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h1 style={{ fontSize: '3rem', fontWeight: 'bold', color: '#ffffff', marginBottom: '1rem' }}>
                Transporte seguro y eficiente en todo el Perú
            </h1>
            <p style={{ fontSize: '1.25rem', color: '#cbd5e0', marginBottom: '2rem', lineHeight: '1.6' }}>
                Movemos tu carga con flota moderna, conductores capacitados y tecnología de punta.
            </p>
            </div>
        </div>
      </section>

      {/* Servicios Section */}
      <section id="servicios" style={{ padding: '5rem 2rem', maxWidth: '1200px', margin: '0 auto' }}>
        <h2 style={{ 
          fontSize: '2rem', 
          fontWeight: 'bold', 
          color: '#ffffff',
          textAlign: 'center',
          marginBottom: '0.5rem'
        }}>
          Nuestros Servicios
        </h2>
        <p style={{ textAlign: 'center', color: '#cbd5e0', marginBottom: '3rem' }}>
          Soluciones logísticas adaptadas a tus necesidades
        </p>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
          gap: '2rem'
        }}>
          {services.map((service, index) => (
            <div key={index} style={{
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(10px)',
              borderRadius: '0.75rem',
              overflow: 'hidden',
              transition: 'transform 0.3s ease',
              border: '1px solid rgba(255, 255, 255, 0.15)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
            }}>
              <img 
                src={service.image} 
                alt={service.alt}
                style={{
                  width: '100%',
                  height: '180px',
                  objectFit: 'cover'
                }}
              />
              <div style={{ padding: '1.5rem' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#ffffff', marginBottom: '0.75rem' }}>
                  {service.name}
                </h3>
                <p style={{ color: '#cbd5e0', fontSize: '0.875rem', lineHeight: '1.5' }}>
                  {service.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Flota Section */}
      <section id="flota" style={{ padding: '5rem 2rem', backgroundImage: 'url("ruta3.jpg")', backgroundSize: 'cover', backgroundPosition: 'center' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{ 
            fontSize: '2rem', 
            fontWeight: 'bold', 
            color: '#ffffff',
            textAlign: 'center',
            marginBottom: '0.5rem'
          }}>
            Flota Moderna y Confiable
          </h2>
          <p style={{ textAlign: 'center', color: '#cbd5e0', marginBottom: '3rem', maxWidth: '700px', margin: '0 auto 3rem auto' }}>
            Contamos con una flota moderna, segura y preparada para distintos modelos de operación logística
          </p>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
            gap: '1.5rem'
          }}>
            {fleet.map((vehicle, index) => (
              <div key={index} style={{
                background: 'rgba(255, 255, 255, 0.08)',
                borderRadius: '0.5rem',
                overflow: 'hidden',
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}>
                <img 
                  src={vehicle.image} 
                  alt={vehicle.name}
                  style={{
                    width: '100%',
                    height: '140px',
                    objectFit: 'cover'
                  }}
                />
                <div style={{ padding: '1rem', textAlign: 'center' }}>
                  <h4 style={{ color: '#ffffff', fontWeight: 'bold', marginBottom: '0.25rem', fontSize: '0.9rem' }}>
                    {vehicle.name}
                  </h4>
                  <p style={{ color: '#cbd5e0', fontSize: '0.7rem' }}>{vehicle.capacity}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contacto Section */}
      <section id="contacto" style={{ padding: '5rem 2rem', maxWidth: '800px', margin: '0 auto' }}>
        <h2 style={{ 
          fontSize: '2rem', 
          fontWeight: 'bold', 
          color: '#ffffff',
          textAlign: 'center',
          marginBottom: '0.5rem'
        }}>
          Conversemos sobre tu próxima operación
        </h2>
        <p style={{ textAlign: 'center', color: '#cbd5e0', marginBottom: '2rem' }}>
          Estamos listos para atender tu requerimiento
        </p>
        <div style={{
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          borderRadius: '1rem',
          padding: '2rem',
          border: '1px solid rgba(255, 255, 255, 0.15)'
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', justifyContent: 'center' }}>
              <span style={{ fontSize: '1.25rem' }}>📞</span>
              <span style={{ color: '#ffffff', fontSize: '1rem' }}>+51 980 688 012</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', justifyContent: 'center' }}>
              <span style={{ fontSize: '1.25rem' }}>✉️</span>
              <span style={{ color: '#ffffff', fontSize: '1rem' }}>ventas@transportesandino.pe</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', justifyContent: 'center' }}>
              <span style={{ fontSize: '1.25rem' }}>📍</span>
              <span style={{ color: '#ffffff', fontSize: '1rem' }}>Av. Colonial 1234, Lima - Perú</span>
            </div>
          </div>
          <div style={{ textAlign: 'center', marginTop: '2rem' }}>
            <a
              href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                backgroundColor: '#ffffff',
                color: 'black',
                padding: '0.75rem 2rem',
                borderRadius: '2rem',
                textDecoration: 'none',
                fontWeight: '500',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#128C7E';
                e.currentTarget.style.color = '#ffffff';
                e.currentTarget.style.transform = 'scale(1.02)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#ffffff';
                e.currentTarget.style.color = 'black';
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              <img 
                src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" 
                alt="WhatsApp" 
                style={{ width: '20px', height: '20px' }}
              />
              Contáctanos
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        textAlign: 'center',
        padding: '2rem',
        borderTop: '1px solid rgba(255, 255, 255, 0.1)',
        color: '#cbd5e0',
        fontSize: '0.75rem',
        background: 'rgba(0, 0, 0, 0.3)'
      }}>
        <p>© 2024 Transportes Andino - Todos los derechos reservados</p>
        <p style={{ marginTop: '0.5rem' }}>Movemos tu carga con seguridad y eficiencia en todo el Perú</p>
        <div style={{ marginTop: '0.75rem' }}>
          <a 
            href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: '#25D366', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
          >
            <img 
              src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" 
              alt="WhatsApp" 
              style={{ width: '14px', height: '14px' }}
            />
            Contáctanos
          </a>
        </div>
      </footer>
    </div>
  );
}

export default Landing;