import React, { useState, useEffect } from 'react';
import { getClients, createClient, deleteClient } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

function Clients() {
  const { isAdmin, isSupervisor, isCollector } = useAuth();
  const [clients, setClients] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    document_number: '',
    phone: '',
    address: '',
    email: ''
  });
  const [loading, setLoading] = useState(true);

  // Solo admin y supervisor pueden editar
  const canEdit = isAdmin || isSupervisor;

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    try {
      const response = await getClients();
      setClients(response.data);
    } catch (error) {
      console.error('Error cargando clientes:', error);
      alert('Error al cargar clientes');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name) {
      alert('El nombre es requerido');
      return;
    }
    try {
      await createClient(formData);
      alert('✅ Cliente creado exitosamente');
      setShowForm(false);
      setFormData({ name: '', document_number: '', phone: '', address: '', email: '' });
      loadClients();
    } catch (error) {
      console.error('Error creando cliente:', error);
      alert('Error al crear cliente');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar este cliente?')) {
      try {
        await deleteClient(id);
        alert('Cliente eliminado');
        loadClients();
      } catch (error) {
        console.error('Error eliminando cliente:', error);
        alert('Error al eliminar cliente');
      }
    }
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '2rem' }}>Cargando clientes...</div>;
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'white' }}>👥 Clientes</h2>
        {canEdit && (
          <button
            onClick={() => setShowForm(!showForm)}
            style={{
              backgroundColor: '#132342',
              color: 'white',
              padding: '0.5rem 1rem',
              borderRadius: '0.5rem',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            {showForm ? 'Cancelar' : '+ Nuevo Cliente'}
          </button>
        )}
        {!canEdit && (
          <div style={{ fontSize: '0.875rem', color: '#6b7280', backgroundColor: '#f3f4f6', padding: '0.25rem 0.75rem', borderRadius: '0.375rem' }}>
            👁️ Solo lectura
          </div>
        )}
      </div>

      {/* Formulario - Solo visible para admin y supervisor */}
      {showForm && canEdit && (
        <div style={{ backgroundColor: 'white', borderRadius: '0.5rem', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: '1.5rem' }}>
          <h3 style={{ fontWeight: 'bold', marginBottom: '1rem' }}>Nuevo Cliente</h3>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <input
                type="text"
                placeholder="Nombre *"
                style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }}
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required
              />
              <input
                type="text"
                placeholder="RUC / DNI"
                style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }}
                value={formData.document_number}
                onChange={(e) => setFormData({...formData, document_number: e.target.value})}
              />
              <input
                type="tel"
                placeholder="Teléfono"
                style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }}
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
              />
              <textarea
                placeholder="Dirección"
                rows="2"
                style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }}
                value={formData.address}
                onChange={(e) => setFormData({...formData, address: e.target.value})}
              />
              <input
                type="email"
                placeholder="Email"
                style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }}
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
              <button
                type="submit"
                style={{
                  backgroundColor: '#10b981',
                  color: 'white',
                  padding: '0.5rem',
                  borderRadius: '0.375rem',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                Guardar Cliente
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Lista de clientes */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {clients.map((client) => (
          <div key={client.id} style={{ backgroundColor: 'white', borderRadius: '0.5rem', padding: '1rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
              <div style={{ flex: 1 }}>
                <h3 style={{ fontWeight: 'bold' }}>{client.name}</h3>
                {client.document_number && (
                  <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>RUC: {client.document_number}</p>
                )}
                {client.phone && (
                  <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>📱 {client.phone}</p>
                )}
                {client.address && (
                  <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>📍 {client.address}</p>
                )}
              </div>
              {canEdit && (
                <button
                  onClick={() => handleDelete(client.id)}
                  style={{ color: '#ef4444', padding: '0.25rem 0.5rem', cursor: 'pointer', background: 'none', border: 'none' }}
                >
                  🗑️ Eliminar
                </button>
              )}
            </div>
          </div>
        ))}
        {clients.length === 0 && (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
            No hay clientes registrados
          </div>
        )}
      </div>
    </div>
  );
}

export default Clients;