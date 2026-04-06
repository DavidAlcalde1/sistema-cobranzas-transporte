import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

const API_URL = 'http://localhost:3001/api';

function Users() {
  const { user: currentUser, isAdmin } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    full_name: '',
    role: 'collector',
    email: '',
    active: 'SI'
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (isAdmin) {
      loadUsers();
    }
  }, [isAdmin]);

  const loadUsers = async () => {
    try {
      const response = await axios.get(`${API_URL}/auth/users`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setUsers(response.data);
    } catch (error) {
      console.error('Error cargando usuarios:', error);
      setError('Error al cargar usuarios');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    try {
      if (editingUser) {
        // Actualizar usuario
        await axios.put(`${API_URL}/auth/users/${editingUser.id}`, {
          full_name: formData.full_name,
          role: formData.role,
          email: formData.email,
          active: formData.active
        }, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setSuccess('✅ Usuario actualizado exitosamente');
      } else {
        // Crear usuario
        await axios.post(`${API_URL}/auth/users`, {
          username: formData.username,
          password: formData.password,
          full_name: formData.full_name,
          role: formData.role,
          email: formData.email
        }, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setSuccess('✅ Usuario creado exitosamente');
      }
      
      setShowForm(false);
      setEditingUser(null);
      setFormData({
        username: '',
        password: '',
        full_name: '',
        role: 'collector',
        email: '',
        active: 'SI'
      });
      loadUsers();
    } catch (error) {
      console.error('Error:', error);
      setError(error.response?.data?.error || 'Error al guardar usuario');
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setFormData({
      username: user.username,
      password: '',
      full_name: user.full_name || '',
      role: user.role,
      email: user.email || '',
      active: user.active || 'SI'
    });
    setShowForm(true);
  };

  const handleDelete = async (userId) => {
    if (userId === currentUser?.id) {
      setError('No puedes eliminar tu propio usuario');
      return;
    }
    
    if (window.confirm('¿Estás seguro de eliminar este usuario?')) {
      try {
        await axios.delete(`${API_URL}/auth/users/${userId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setSuccess('✅ Usuario eliminado exitosamente');
        loadUsers();
      } catch (error) {
        console.error('Error:', error);
        setError(error.response?.data?.error || 'Error al eliminar usuario');
      }
    }
  };

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
      case 'admin': return '#dc2626';
      case 'supervisor': return '#f59e0b';
      case 'collector': return '#10b981';
      default: return '#6b7280';
    }
  };

  const getStatusColor = (active) => {
    return active === 'SI' ? '#10b981' : '#ef4444';
  };

  if (!isAdmin) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem', color: '#dc2626' }}>
        ⚠️ Acceso denegado. Solo administradores pueden ver esta página.
      </div>
    );
  }

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '2rem' }}>Cargando usuarios...</div>;
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>👥 Gestión de Usuarios</h2>
        <button
          onClick={() => {
            setEditingUser(null);
            setFormData({
              username: '',
              password: '',
              full_name: '',
              role: 'collector',
              email: '',
              active: 'SI'
            });
            setShowForm(!showForm);
          }}
          style={{
            backgroundColor: '#132342',
            color: 'white',
            padding: '0.5rem 1rem',
            borderRadius: '0.5rem',
            border: 'none',
            cursor: 'pointer'
          }}
        >
          {showForm ? 'Cancelar' : '+ Nuevo Usuario'}
        </button>
      </div>

      {error && (
        <div style={{ 
          backgroundColor: '#fee2e2', 
          border: '1px solid #ef4444', 
          borderRadius: '0.5rem', 
          padding: '0.75rem', 
          marginBottom: '1rem',
          color: '#dc2626'
        }}>
          {error}
        </div>
      )}

      {success && (
        <div style={{ 
          backgroundColor: '#d1fae5', 
          border: '1px solid #10b981', 
          borderRadius: '0.5rem', 
          padding: '0.75rem', 
          marginBottom: '1rem',
          color: '#065f46'
        }}>
          {success}
        </div>
      )}

      {/* Formulario de usuario */}
      {showForm && (
        <div style={{ backgroundColor: 'white', borderRadius: '0.5rem', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: '1.5rem' }}>
          <h3 style={{ fontWeight: 'bold', marginBottom: '1rem' }}>
            {editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}
          </h3>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ fontWeight: '500', display: 'block', marginBottom: '0.25rem' }}>Usuario *</label>
                <input
                  type="text"
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }}
                  value={formData.username}
                  onChange={(e) => setFormData({...formData, username: e.target.value})}
                  required
                  disabled={!!editingUser}
                  placeholder={editingUser ? "No se puede editar el nombre de usuario" : "Nombre de usuario"}
                />
              </div>
              
              {!editingUser && (
                <div>
                  <label style={{ fontWeight: '500', display: 'block', marginBottom: '0.25rem' }}>Contraseña *</label>
                  <input
                    type="password"
                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }}
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    required
                    placeholder="Contraseña"
                  />
                </div>
              )}
              
              <div>
                <label style={{ fontWeight: '500', display: 'block', marginBottom: '0.25rem' }}>Nombre Completo</label>
                <input
                  type="text"
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }}
                  value={formData.full_name}
                  onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                  placeholder="Nombre completo del usuario"
                />
              </div>
              
              <div>
                <label style={{ fontWeight: '500', display: 'block', marginBottom: '0.25rem' }}>Email</label>
                <input
                  type="email"
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }}
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  placeholder="correo@ejemplo.com"
                />
              </div>
              
              <div>
                <label style={{ fontWeight: '500', display: 'block', marginBottom: '0.25rem' }}>Rol</label>
                <select
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }}
                  value={formData.role}
                  onChange={(e) => setFormData({...formData, role: e.target.value})}
                >
                  <option value="admin">Administrador</option>
                  <option value="supervisor">Supervisor</option>
                  <option value="collector">Cobrador</option>
                </select>
              </div>
              
              {editingUser && (
                <div>
                  <label style={{ fontWeight: '500', display: 'block', marginBottom: '0.25rem' }}>Estado</label>
                  <select
                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }}
                    value={formData.active}
                    onChange={(e) => setFormData({...formData, active: e.target.value})}
                  >
                    <option value="SI">Activo</option>
                    <option value="NO">Inactivo</option>
                  </select>
                </div>
              )}
              
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingUser(null);
                  }}
                  style={{
                    flex: 1,
                    padding: '0.5rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.375rem',
                    backgroundColor: 'white',
                    cursor: 'pointer'
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  style={{
                    flex: 1,
                    padding: '0.5rem',
                    backgroundColor: '#10b981',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.375rem',
                    cursor: 'pointer'
                  }}
                >
                  {editingUser ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Lista de usuarios */}
      <div style={{ backgroundColor: 'white', borderRadius: '0.5rem', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                <th style={{ padding: '0.75rem', textAlign: 'left' }}>Usuario</th>
                <th style={{ padding: '0.75rem', textAlign: 'left' }}>Nombre</th>
                <th style={{ padding: '0.75rem', textAlign: 'left' }}>Email</th>
                <th style={{ padding: '0.75rem', textAlign: 'left' }}>Rol</th>
                <th style={{ padding: '0.75rem', textAlign: 'center' }}>Estado</th>
                <th style={{ padding: '0.75rem', textAlign: 'center' }}>Último Login</th>
                <th style={{ padding: '0.75rem', textAlign: 'center' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <td style={{ padding: '0.75rem' }}>
                    <strong>{user.username}</strong>
                    {user.id === currentUser?.id && (
                      <span style={{ 
                        backgroundColor: '#dbeafe', 
                        fontSize: '0.7rem', 
                        padding: '0.2rem 0.4rem', 
                        borderRadius: '0.25rem',
                        marginLeft: '0.5rem'
                      }}>
                        Tú
                      </span>
                    )}
                  </td>
                  <td style={{ padding: '0.75rem' }}>{user.full_name || '-'}</td>
                  <td style={{ padding: '0.75rem' }}>{user.email || '-'}</td>
                  <td style={{ padding: '0.75rem' }}>
                    <span style={{
                      backgroundColor: getRoleColor(user.role),
                      color: 'white',
                      padding: '0.2rem 0.5rem',
                      borderRadius: '0.25rem',
                      fontSize: '0.75rem'
                    }}>
                      {getRoleName(user.role)}
                    </span>
                  </td>
                  <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                    <span style={{
                      backgroundColor: getStatusColor(user.active),
                      color: 'white',
                      padding: '0.2rem 0.5rem',
                      borderRadius: '0.25rem',
                      fontSize: '0.75rem'
                    }}>
                      {user.active === 'SI' ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td style={{ padding: '0.75rem', textAlign: 'center', fontSize: '0.75rem', color: '#6b7280' }}>
                    {user.last_login ? new Date(user.last_login).toLocaleString() : 'Nunca'}
                  </td>
                  <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                    <button
                      onClick={() => handleEdit(user)}
                      style={{
                        backgroundColor: '#3b82f6',
                        color: 'white',
                        padding: '0.25rem 0.5rem',
                        borderRadius: '0.25rem',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '0.75rem',
                        marginRight: '0.5rem'
                      }}
                    >
                      Editar
                    </button>
                    {user.id !== currentUser?.id && (
                      <button
                        onClick={() => handleDelete(user.id)}
                        style={{
                          backgroundColor: '#ef4444',
                          color: 'white',
                          padding: '0.25rem 0.5rem',
                          borderRadius: '0.25rem',
                          border: 'none',
                          cursor: 'pointer',
                          fontSize: '0.75rem'
                        }}
                      >
                        Eliminar
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {users.length === 0 && (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
            No hay usuarios registrados
          </div>
        )}
      </div>
    </div>
  );
}

export default Users;