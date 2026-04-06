import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

const API_URL = 'http://localhost:3001/api';

function Services() {
  const { isAdmin, isSupervisor, isCollector } = useAuth();
  const [services, setServices] = useState([]);
  const [clients, setClients] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingCosts, setEditingCosts] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedServices, setSelectedServices] = useState([]);
  const [sortOrder, setSortOrder] = useState('desc');

  // Solo admin y supervisor pueden editar (crear, modificar, eliminar)
  const canEdit = isAdmin || isSupervisor;

  const [formData, setFormData] = useState({
    service_number_text: '',
    client_id: '',
    service_type: 'carga_completa',
    service_detail: '',
    sale_price: '',
    origin_city: '',
    destination_city: '',
    service_date: new Date().toISOString().split('T')[0],
    is_credit: 'NO',
    is_cash: 'NO',
    is_invoiced: 'NO',
    has_receipt: 'NO'
  });

  const [costs, setCosts] = useState({
    tolls: 0,
    fuel: 0,
    other: 0
  });

  useEffect(() => {
    loadServices();
    loadClients();
  }, []);

  const loadServices = async () => {
    try {
      const response = await axios.get(`${API_URL}/services`);
      const sorted = response.data.sort((a, b) => {
        return new Date(b.service_date) - new Date(a.service_date);
      });
      setServices(sorted);
    } catch (error) {
      console.error('Error cargando servicios:', error);
    }
  };

  const loadClients = async () => {
    try {
      const response = await axios.get(`${API_URL}/clients`);
      setClients(response.data);
    } catch (error) {
      console.error('Error cargando clientes:', error);
    }
  };

  // Cargar el siguiente número de servicio sugerido
  const loadNextServiceNumber = async () => {
    try {
      const response = await axios.get(`${API_URL}/services/last-number`);
      if (response.data.suggested) {
        setFormData(prev => ({
          ...prev,
          service_number_text: response.data.suggested
        }));
      }
    } catch (error) {
      console.error('Error cargando siguiente número:', error);
    }
  };

  const calculateTotalCost = () => {
    return (parseFloat(costs.tolls) || 0) + (parseFloat(costs.fuel) || 0) + (parseFloat(costs.other) || 0);
  };

  const calculateNetPrice = () => {
    const sale = parseFloat(formData.sale_price) || 0;
    const totalCost = calculateTotalCost();
    return (sale - totalCost).toFixed(2);
  };

  const updateCost = (field, value) => {
    const newCosts = { ...costs, [field]: parseFloat(value) || 0 };
    setCosts(newCosts);
  };

  const handlePaymentTypeChange = (type, value) => {
    if (type === 'credit') {
      setFormData({
        ...formData,
        is_credit: value,
        is_cash: value === 'SI' ? 'NO' : formData.is_cash
      });
    } else if (type === 'cash') {
      setFormData({
        ...formData,
        is_cash: value,
        is_credit: value === 'SI' ? 'NO' : formData.is_credit
      });
    }
  };

  const handleDocumentTypeChange = (type, value) => {
    if (type === 'invoiced') {
      setFormData({
        ...formData,
        is_invoiced: value,
        has_receipt: value === 'SI' ? 'NO' : formData.has_receipt
      });
    } else if (type === 'receipt') {
      setFormData({
        ...formData,
        has_receipt: value,
        is_invoiced: value === 'SI' ? 'NO' : formData.is_invoiced
      });
    }
  };

  const openCostModal = async (serviceId) => {
    try {
      const response = await axios.get(`${API_URL}/services/${serviceId}/costs`);
      setCosts(response.data);
      setEditingCosts(serviceId);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleCostSubmit = async (serviceId) => {
    try {
      await axios.put(`${API_URL}/services/${serviceId}/costs`, costs);
      alert('✅ Costos actualizados');
      setEditingCosts(null);
      loadServices();
    } catch (error) {
      console.error('Error:', error);
      alert('Error al actualizar costos');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const totalCost = calculateTotalCost();
    const netPrice = calculateNetPrice();

    const serviceData = {
      ...formData,
      service_type: formData.service_type,
      sale_price: parseFloat(formData.sale_price) || 0,
      cost_price: totalCost,
      net_price: parseFloat(netPrice),
      service_number_text: formData.service_number_text || null
    };

    setLoading(true);

    try {
      const response = await axios.post(`${API_URL}/services`, serviceData);
      const serviceId = response.data.id;

      if (totalCost > 0) {
        await axios.put(`${API_URL}/services/${serviceId}/costs`, {
          tolls: costs.tolls,
          fuel: costs.fuel,
          other: costs.other
        });
      }

      alert('✅ Servicio creado exitosamente');

      setShowForm(false);
      setFormData({
        service_number_text: '',
        client_id: '',
        service_type: 'carga_completa',
        service_detail: '',
        sale_price: '',
        origin_city: '',
        destination_city: '',
        service_date: new Date().toISOString().split('T')[0],
        is_credit: 'NO',
        is_cash: 'NO',
        is_invoiced: 'NO',
        has_receipt: 'NO'
      });
      setCosts({ tolls: 0, fuel: 0, other: 0 });

      loadServices();
    } catch (error) {
      console.error('Error:', error.response?.data || error.message);
      alert('Error al crear servicio: ' + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteService = async (serviceId) => {
    if (!canEdit) {
      alert('No tienes permisos para eliminar servicios');
      return;
    }
    if (window.confirm('¿Estás seguro de eliminar este servicio?')) {
      try {
        await axios.delete(`${API_URL}/services/${serviceId}`);
        alert('✅ Servicio eliminado');
        loadServices();
      } catch (error) {
        console.error('Error:', error);
        alert('Error al eliminar servicio');
      }
    }
  };

  const handleDeleteSelected = async () => {
    if (!canEdit) {
      alert('No tienes permisos para eliminar servicios');
      return;
    }
    if (selectedServices.length === 0) {
      alert('No hay servicios seleccionados');
      return;
    }

    if (window.confirm(`¿Estás seguro de eliminar ${selectedServices.length} servicio(s)?`)) {
      setLoading(true);
      try {
        for (const serviceId of selectedServices) {
          await axios.delete(`${API_URL}/services/${serviceId}`);
        }
        alert(`✅ ${selectedServices.length} servicio(s) eliminado(s)`);
        setSelectedServices([]);
        loadServices();
      } catch (error) {
        console.error('Error:', error);
        alert('Error al eliminar servicios');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleDeleteAll = async () => {
    if (!canEdit) {
      alert('No tienes permisos para eliminar servicios');
      return;
    }
    if (services.length === 0) {
      alert('No hay servicios para eliminar');
      return;
    }

    if (window.confirm(`⚠️ ¿Eliminar TODOS los ${services.length} servicios?`)) {
      setLoading(true);
      try {
        for (const service of services) {
          await axios.delete(`${API_URL}/services/${service.id}`);
        }
        alert(`✅ Todos los servicios eliminados`);
        setSelectedServices([]);
        loadServices();
      } catch (error) {
        console.error('Error:', error);
        alert('Error al eliminar servicios');
      } finally {
        setLoading(false);
      }
    }
  };

  const toggleSelectService = (serviceId) => {
    if (!canEdit) return;
    setSelectedServices(prev => {
      if (prev.includes(serviceId)) {
        return prev.filter(id => id !== serviceId);
      } else {
        return [...prev, serviceId];
      }
    });
  };

  const toggleSelectAll = () => {
    if (!canEdit) return;
    if (selectedServices.length === services.length) {
      setSelectedServices([]);
    } else {
      setSelectedServices(services.map(s => s.id));
    }
  };

  const handleSortChange = (order) => {
    setSortOrder(order);
    const sorted = [...services].sort((a, b) => {
      if (order === 'desc') {
        return new Date(b.service_date) - new Date(a.service_date);
      } else {
        return new Date(a.service_date) - new Date(b.service_date);
      }
    });
    setServices(sorted);
  };

  const totalCostDisplay = calculateTotalCost().toFixed(2);
  const netPriceDisplay = calculateNetPrice();

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'white' }}>📦 Servicios de Transporte</h2>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {canEdit && (
            <button
              onClick={() => {
                if (!showForm) {
                  setCosts({ tolls: 0, fuel: 0, other: 0 });
                  loadNextServiceNumber();
                }
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
              {showForm ? 'Cancelar' : '+ Nuevo Servicio'}
            </button>
          )}
          {!canEdit && (
            <div style={{ fontSize: '0.875rem', color: '#6b7280', backgroundColor: '#f3f4f6', padding: '0.25rem 0.75rem', borderRadius: '0.375rem' }}>
              👁️ Solo lectura
            </div>
          )}
          {canEdit && selectedServices.length > 0 && (
            <button
              onClick={handleDeleteSelected}
              style={{
                backgroundColor: '#ef4444',
                color: 'white',
                padding: '0.5rem 1rem',
                borderRadius: '0.5rem',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              🗑️ Eliminar ({selectedServices.length})
            </button>
          )}
          {canEdit && (
            <button
              onClick={handleDeleteAll}
              style={{
                backgroundColor: '#dc2626',
                color: 'white',
                padding: '0.5rem 1rem',
                borderRadius: '0.5rem',
                border: 'none',
                cursor: 'pointer',
                opacity: services.length === 0 ? 0.5 : 1
              }}
              disabled={services.length === 0}
            >
              ⚠️ Eliminar Todos
            </button>
          )}
        </div>
      </div>

      {services.length > 0 && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>Ordenar por fecha:</span>
          <button
            onClick={() => handleSortChange('desc')}
            style={{
              padding: '0.25rem 0.75rem',
              borderRadius: '0.375rem',
              border: '1px solid #d1d5db',
              backgroundColor: sortOrder === 'desc' ? '#132342' : 'white',
              color: sortOrder === 'desc' ? 'white' : '#374151',
              cursor: 'pointer'
            }}
          >
            📅 Más reciente
          </button>
          <button
            onClick={() => handleSortChange('asc')}
            style={{
              padding: '0.25rem 0.75rem',
              borderRadius: '0.375rem',
              border: '1px solid #d1d5db',
              backgroundColor: sortOrder === 'asc' ? '#3b82f6' : 'white',
              color: sortOrder === 'asc' ? 'white' : '#374151',
              cursor: 'pointer'
            }}
          >
            📅 Más antiguo
          </button>
        </div>
      )}

      {showForm && canEdit && (
        <div style={{ backgroundColor: 'white', borderRadius: '0.5rem', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: '1.5rem' }}>
          <h3 style={{ fontWeight: 'bold', marginBottom: '1rem', color:'white' }}>Registrar Nuevo Servicio</h3>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1rem' }}>
                <div>
                  <label style={{ fontWeight: '500', display: 'block', marginBottom: '0.25rem', color: 'white' }}>N° Servicio:</label>
                  <input
                    type="text"
                    placeholder="Ej: S001-2026"
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '0.375rem',
                      backgroundColor: '#f3f4f6',
                      cursor: 'not-allowed'
                    }}
                    value={formData.service_number_text}
                    readOnly
                  />
                  <p style={{ fontSize: '0.7rem', color: '#6b7280', marginTop: '0.25rem' }}>
                    📌 Número generado automáticamente con el formato S001-{new Date().getFullYear()}, S002-{new Date().getFullYear()}, etc.
                  </p>
                </div>
                <div>
                  <label style={{ fontWeight: '500', display: 'block', marginBottom: '0.25rem' }}>Contratista *:</label>
                  <select
                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }}
                    value={formData.client_id}
                    onChange={(e) => setFormData({ ...formData, client_id: e.target.value })}
                    required
                  >
                    <option value="">Seleccionar contratista</option>
                    {clients.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label style={{ fontWeight: '500', display: 'block', marginBottom: '0.25rem' }}>Detalle del Traslado:</label>
                <textarea
                  rows="3"
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }}
                  value={formData.service_detail}
                  onChange={(e) => setFormData({ ...formData, service_detail: e.target.value })}
                  placeholder="Ej: SERVICIO DE TRASLADO DE MATERIAL..."
                />
              </div>

              <div>
                <label style={{ fontWeight: '500', display: 'block', marginBottom: '0.25rem' }}>Tipo de Servicio:</label>
                <select
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }}
                  value={formData.service_type}
                  onChange={(e) => setFormData({ ...formData, service_type: e.target.value })}
                  required
                >
                  <option value="carga_completa">Carga Completa</option>
                  <option value="carga_parcial">Carga Parcial</option>
                  <option value="expreso">Expreso</option>
                  <option value="especial">Especial</option>
                </select>
              </div>

              <div>
                <label style={{ fontWeight: '500', display: 'block', marginBottom: '0.25rem' }}>P. VENTA (S/):</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }}
                  value={formData.sale_price === '' || formData.sale_price === 0 ? '' : formData.sale_price}
                  onChange={(e) => {
                    const value = e.target.value === '' ? '' : parseFloat(e.target.value);
                    setFormData({ ...formData, sale_price: value });
                  }}
                  onFocus={(e) => {
                    if (formData.sale_price === '' || formData.sale_price === 0) e.target.value = '';
                  }}
                  onBlur={(e) => {
                    if (e.target.value === '') setFormData({ ...formData, sale_price: '' });
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ fontWeight: '500', display: 'block', marginBottom: '0.25rem' }}>Origen:</label>
                  <input
                    type="text"
                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }}
                    value={formData.origin_city}
                    onChange={(e) => setFormData({ ...formData, origin_city: e.target.value })}
                    placeholder="Ciudad de origen"
                  />
                </div>
                <div>
                  <label style={{ fontWeight: '500', display: 'block', marginBottom: '0.25rem' }}>Destino:</label>
                  <input
                    type="text"
                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }}
                    value={formData.destination_city}
                    onChange={(e) => setFormData({ ...formData, destination_city: e.target.value })}
                    placeholder="Ciudad de destino"
                  />
                </div>
              </div>

              <div>
                <label style={{ fontWeight: '500', display: 'block', marginBottom: '0.25rem' }}>Fecha Servicio:</label>
                <input
                  type="date"
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }}
                  value={formData.service_date}
                  onChange={(e) => setFormData({ ...formData, service_date: e.target.value })}
                  required
                />
              </div>

              {/* SECCIÓN DE COSTOS */}
              <div style={{
                marginTop: '0.5rem',
                padding: '1rem',
                backgroundColor: '#fef3c7',
                borderRadius: '0.5rem',
                border: '1px solid #f59e0b'
              }}>
                <h4 className="section-title-neon">💰 COSTOS DEL VIAJE</h4>
                <p style={{ fontSize: '0.875rem', color: '#92400e', marginBottom: '1rem' }}>
                  Ingresa los costos desglosados. Se sumarán automáticamente al P. COSTO.
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ fontSize: '0.875rem', fontWeight: '500' }}>Peajes (S/):</label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem', marginTop: '0.25rem' }}
                      value={costs.tolls === 0 ? '' : costs.tolls}
                      onChange={(e) => updateCost('tolls', e.target.value)}
                      onFocus={(e) => { if (costs.tolls === 0) e.target.value = ''; }}
                      onBlur={(e) => { if (e.target.value === '') updateCost('tolls', 0); }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.875rem', fontWeight: '500' }}>Petróleo (S/):</label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem', marginTop: '0.25rem' }}
                      value={costs.fuel === 0 ? '' : costs.fuel}
                      onChange={(e) => updateCost('fuel', e.target.value)}
                      onFocus={(e) => { if (costs.fuel === 0) e.target.value = ''; }}
                      onBlur={(e) => { if (e.target.value === '') updateCost('fuel', 0); }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.875rem', fontWeight: '500' }}>Otros (S/):</label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem', marginTop: '0.25rem' }}
                      value={costs.other === 0 ? '' : costs.other}
                      onChange={(e) => updateCost('other', e.target.value)}
                      onFocus={(e) => { if (costs.other === 0) e.target.value = ''; }}
                      onBlur={(e) => { if (e.target.value === '') updateCost('other', 0); }}
                    />
                  </div>
                </div>

                <div style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid #f59e0b', display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: 'bold' }}>💰 TOTAL COSTOS:</span>
                  <span style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#dc2626' }}>S/ {totalCostDisplay}</span>
                </div>
              </div>

              {/* RESUMEN DE PRECIOS */}
              <div style={{ backgroundColor: '#f0fdf4', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #10b981' }}>
                <h4 style={{ fontWeight: 'bold', marginBottom: '0.75rem', color: '#166534' }}>📊 RESUMEN DE PRECIOS</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div><span style={{ fontSize: '0.875rem' }}>P. VENTA:</span><div style={{ fontSize: '1.125rem', fontWeight: 'bold' }}>S/ {(parseFloat(formData.sale_price) || 0).toFixed(2)}</div></div>
                  <div><span style={{ fontSize: '0.875rem' }}>P. COSTO:</span><div style={{ fontSize: '1.125rem', fontWeight: 'bold', color: '#dc2626' }}>S/ {totalCostDisplay}</div></div>
                  <div><span style={{ fontSize: '0.875rem' }}>P. NETO:</span><div style={{ fontSize: '1.125rem', fontWeight: 'bold', color: '#10b981' }}>S/ {netPriceDisplay}</div></div>
                </div>
              </div>

              {/* OPCIONES DE PAGO */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', padding: '1rem', backgroundColor: '#f9fafb', borderRadius: '0.5rem' }}>
                <div>
                  <h4 style={{ fontSize: '0.875rem', fontWeight: 'bold' }}>💳 Tipo de Pago</h4>
                  <div style={{ display: 'flex', gap: '1.5rem' }}>
                    <label><input type="radio" name="paymentType" checked={formData.is_credit === 'SI'} onChange={() => handlePaymentTypeChange('credit', 'SI')} /> 📋 Crédito</label>
                    <label><input type="radio" name="paymentType" checked={formData.is_cash === 'SI'} onChange={() => handlePaymentTypeChange('cash', 'SI')} /> 💵 Contado</label>
                  </div>
                </div>
                <div>
                  <h4 style={{ fontSize: '0.875rem', fontWeight: 'bold' }}>📄 Tipo de Comprobante</h4>
                  <div style={{ display: 'flex', gap: '1.5rem' }}>
                    <label><input type="radio" name="documentType" checked={formData.is_invoiced === 'SI'} onChange={() => handleDocumentTypeChange('invoiced', 'SI')} /> 📄 Facturado</label>
                    <label><input type="radio" name="documentType" checked={formData.has_receipt === 'SI'} onChange={() => handleDocumentTypeChange('receipt', 'SI')} /> 🎫 Boleta</label>
                  </div>
                </div>
              </div>

              <button type="submit" disabled={loading} style={{ backgroundColor: '#132342', color: 'white', padding: '0.75rem', borderRadius: '0.375rem', border: 'none', cursor: loading ? 'not-allowed' : 'pointer', fontSize: '1rem', fontWeight: 'bold' }}>
                {loading ? 'Guardando...' : 'Guardar Servicio'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* LISTA DE SERVICIOS */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
          <h3 style={{ fontWeight: 'bold', color:'white'}}>Servicios Registrados ({services.length})</h3>
          {canEdit && services.length > 0 && (
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input type="checkbox" checked={selectedServices.length === services.length && services.length > 0} onChange={toggleSelectAll} />
              Seleccionar todos
            </label>
          )}
        </div>

        {services.map((service, index) => {
          const correlativeNumber = index + 1;

          return (
            <div key={service.id} style={{
              backgroundColor: selectedServices.includes(service.id) ? '#eff6ff' : 'white',
              borderRadius: '0.5rem',
              padding: '1rem',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              border: selectedServices.includes(service.id) ? '1px solid #07687e' : '1px solid transparent'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', flex: 1 }}>
                  {canEdit && (
                    <input type="checkbox" checked={selectedServices.includes(service.id)} onChange={() => toggleSelectService(service.id)} style={{ marginTop: '0.25rem' }} />
                  )}
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                      <span style={{ fontWeight: 'bold', fontSize: '1.125rem', backgroundColor: '#e0e7ff', padding: '0.25rem 0.5rem', borderRadius: '0.25rem' }}>
                        {service.service_number_text || `N° ${correlativeNumber}`}
                      </span>
                      <span style={{ backgroundColor: service.is_credit === 'SI' ? '#fee2e2' : '#dcfce7', padding: '0.25rem 0.5rem', borderRadius: '0.25rem', fontSize: '0.75rem' }}>
                        {service.is_credit === 'SI' ? '📋 Crédito' : '✅ Contado'}
                      </span>
                      <span style={{ backgroundColor: service.is_invoiced === 'SI' ? '#dbeafe' : (service.has_receipt === 'SI' ? '#fed7aa' : '#f3f4f6'), padding: '0.25rem 0.5rem', borderRadius: '0.25rem', fontSize: '0.75rem' }}>
                        {service.is_invoiced === 'SI' ? '📄 Factura' : service.has_receipt === 'SI' ? '🎫 Boleta' : 'Sin comprobante'}
                      </span>
                    </div>
                    <p style={{ fontWeight: 'bold' }}>{service.client_name}</p>
                    <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>{service.service_detail}</p>
                    <p style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.25rem' }}>
                      📍 {service.origin_city || '?'} → {service.destination_city || '?'}
                    </p>
                    <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                      <span>💰 Venta: S/ {service.sale_price || 0}</span>
                      <span>💸 Costo: S/ {service.cost_price || 0}</span>
                      <span style={{ fontWeight: 'bold', color: '#10b981' }}>📈 Neto: S/ {service.net_price || 0}</span>
                      <span>📅 {service.service_date}</span>
                    </div>
                  </div>
                </div>
                {canEdit && (
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button onClick={() => openCostModal(service.id)} style={{ backgroundColor: '#025c3a', color: 'white', padding: '0.5rem 0.75rem', borderRadius: '0.375rem', border: 'none', cursor: 'pointer', fontSize: '0.75rem' }}>
                      Editar Costos
                    </button>
                    <button onClick={() => handleDeleteService(service.id)} style={{ backgroundColor: '#ef4444', color: 'white', padding: '0.5rem 0.75rem', borderRadius: '0.375rem', border: 'none', cursor: 'pointer', fontSize: '0.75rem' }}>
                      🗑️
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {services.length === 0 && (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#6b7280', backgroundColor: 'white', borderRadius: '0.5rem' }}>
            No hay servicios registrados. ¡Agrega tu primer servicio!
          </div>
        )}
      </div>

      {/* MODAL DE COSTOS */}
      {editingCosts && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: 'white', borderRadius: '0.5rem', padding: '1.5rem', width: '90%', maxWidth: '400px' }}>
            <h3 style={{ fontWeight: 'bold', marginBottom: '1rem' }}>Editar Costos</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div><label>Peajes (S/)</label><input type="number" step="0.01" style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }} value={costs.tolls} onChange={(e) => setCosts({ ...costs, tolls: parseFloat(e.target.value) || 0 })} /></div>
              <div><label>Petróleo (S/)</label><input type="number" step="0.01" style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }} value={costs.fuel} onChange={(e) => setCosts({ ...costs, fuel: parseFloat(e.target.value) || 0 })} /></div>
              <div><label>Otros (S/)</label><input type="number" step="0.01" style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }} value={costs.other} onChange={(e) => setCosts({ ...costs, other: parseFloat(e.target.value) || 0 })} /></div>
              <div><p><strong>Total Costos:</strong> S/ {((costs.tolls || 0) + (costs.fuel || 0) + (costs.other || 0)).toFixed(2)}</p></div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button onClick={() => setEditingCosts(null)} style={{ flex: 1, padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem', background: 'white' }}>Cancelar</button>
                <button onClick={() => handleCostSubmit(editingCosts)} style={{ flex: 1, padding: '0.5rem', backgroundColor: '#07687e', color: 'white', border: 'none', borderRadius: '0.375rem' }}>Guardar</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Services;