import React, { useState, useEffect } from 'react';
import { getDebts, registerPayment } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

function Payments() {
  const { isAdmin, isSupervisor, isCollector } = useAuth();
  const [debts, setDebts] = useState([]);
  const [selectedDebt, setSelectedDebt] = useState(null);
  const [paymentData, setPaymentData] = useState({
    amount: '',
    payment_date: new Date().toISOString().split('T')[0],
    payment_method: 'efectivo',
    notes: ''
  });
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);

  // Todos los roles pueden registrar pagos (cobradores, supervisores, admin)
  const canRegister = isCollector || isSupervisor || isAdmin;

  useEffect(() => {
    loadDebts();
  }, []);

  const loadDebts = async () => {
    try {
      const response = await getDebts();
      setDebts(response.data);
    } catch (error) {
      console.error('Error cargando deudas:', error);
      alert('Error al cargar deudas');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    
    if (!canRegister) {
      alert('No tienes permisos para registrar pagos');
      return;
    }
    
    if (parseFloat(paymentData.amount) > selectedDebt.pending_amount) {
      alert('El monto no puede ser mayor a la deuda pendiente');
      return;
    }
    
    if (parseFloat(paymentData.amount) <= 0) {
      alert('El monto debe ser mayor a 0');
      return;
    }
    
    setRegistering(true);
    
    try {
      await registerPayment({
        service_id: selectedDebt.service_id,
        ...paymentData,
        amount: parseFloat(paymentData.amount)
      });
      alert('✅ Pago registrado exitosamente');
      setSelectedDebt(null);
      setPaymentData({
        amount: '',
        payment_date: new Date().toISOString().split('T')[0],
        payment_method: 'efectivo',
        notes: ''
      });
      loadDebts();
    } catch (error) {
      console.error('Error registrando pago:', error);
      alert('Error al registrar pago');
    } finally {
      setRegistering(false);
    }
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '2rem' }}>Cargando deudas...</div>;
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color:'white'}}>💰 Registrar Pago</h2>
        {!canRegister && (
          <div style={{ fontSize: '0.875rem', color: '#6b7280', backgroundColor: '#f3f4f6', padding: '0.25rem 0.75rem', borderRadius: '0.375rem' }}>
            👁️ Solo lectura - No puedes registrar pagos
          </div>
        )}
      </div>
      
      {!selectedDebt ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>
            📌 Selecciona un cliente deudor para registrar su pago
          </p>
          {debts.length === 0 ? (
            <div style={{ backgroundColor: 'white', borderRadius: '0.5rem', padding: '2rem', textAlign: 'center', color: '#6b7280' }}>
              🎉 ¡No hay deudas pendientes!
            </div>
          ) : (
            debts.map((debt, index) => {
              const correlativeNumber = index + 1;
              
              return (
                <div
                  key={debt.service_id}
                  onClick={() => canRegister && setSelectedDebt(debt)}
                  style={{
                    backgroundColor: 'white',
                    borderRadius: '0.5rem',
                    padding: '1rem',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                    cursor: canRegister ? 'pointer' : 'default',
                    transition: 'transform 0.2s',
                    opacity: canRegister ? 1 : 0.8
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem', flexWrap: 'wrap' }}>
                        <span style={{ 
                          backgroundColor: '#e0e7ff', 
                          padding: '0.2rem 0.5rem', 
                          borderRadius: '0.25rem', 
                          fontSize: '0.7rem',
                          fontWeight: 'bold'
                        }}>
                          {debt.service_number_text || `N° ${correlativeNumber}`}
                        </span>
                        <span style={{ 
                          backgroundColor: '#fee2e2', 
                          padding: '0.2rem 0.5rem', 
                          borderRadius: '0.25rem', 
                          fontSize: '0.7rem' 
                        }}>
                          📋 Crédito
                        </span>
                      </div>
                      <p style={{ fontWeight: 'bold', fontSize: '1rem', marginBottom: '0.25rem' }}>{debt.client_name}</p>
                      <p style={{ fontSize: '0.8rem', color: '#6b7280', marginBottom: '0.25rem' }}>{debt.service_detail || debt.service_type || 'Servicio de transporte'}</p>
                      <p style={{ fontSize: '0.7rem', color: '#9ca3af' }}>
                        📅 Servicio: {debt.service_date}
                      </p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#dc2626' }}>
                        S/ {(debt.pending_amount || 0).toFixed(2)}
                      </p>
                      <p style={{ fontSize: '0.7rem', color: '#9ca3af' }}>
                        Total: S/ {(debt.total_amount || 0).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      ) : (
        <div style={{ backgroundColor: 'white', borderRadius: '0.5rem', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <div style={{ marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px solid #e5e7eb' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
              <span style={{ 
                backgroundColor: '#e0e7ff', 
                padding: '0.25rem 0.75rem', 
                borderRadius: '0.25rem', 
                fontSize: '0.75rem',
                fontWeight: 'bold'
              }}>
                {selectedDebt.service_number_text || (() => {
                  const index = debts.findIndex(d => d.service_id === selectedDebt.service_id);
                  return `N° ${index + 1}`;
                })()}
              </span>
              <span style={{ 
                backgroundColor: '#fee2e2', 
                padding: '0.25rem 0.75rem', 
                borderRadius: '0.25rem', 
                fontSize: '0.75rem' 
              }}>
                📋 Crédito
              </span>
            </div>
            <h3 style={{ fontWeight: 'bold', fontSize: '1.125rem', marginBottom: '0.25rem' }}>{selectedDebt.client_name}</h3>
            <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>{selectedDebt.service_detail || selectedDebt.service_type || 'Servicio de transporte'}</p>
            <p style={{ fontSize: '0.8rem', color: '#9ca3af', marginBottom: '0.5rem' }}>
              📅 Fecha servicio: {selectedDebt.service_date}
            </p>
            <p style={{ fontSize: '0.875rem', marginTop: '0.5rem', padding: '0.5rem', backgroundColor: '#fef3c7', borderRadius: '0.375rem' }}>
              Deuda pendiente: <span style={{ fontWeight: 'bold', color: '#dc2626', fontSize: '1.1rem' }}>S/ {selectedDebt.pending_amount.toFixed(2)}</span>
            </p>
          </div>
          
          {canRegister ? (
            <form onSubmit={handlePaymentSubmit}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.25rem', fontWeight: '500' }}>Monto a pagar *</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem', fontSize: '1rem' }}
                    value={paymentData.amount}
                    onChange={(e) => setPaymentData({...paymentData, amount: e.target.value})}
                    required
                  />
                </div>
                
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.25rem', fontWeight: '500' }}>Fecha de pago *</label>
                  <input
                    type="date"
                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }}
                    value={paymentData.payment_date}
                    onChange={(e) => setPaymentData({...paymentData, payment_date: e.target.value})}
                    required
                  />
                </div>
                
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.25rem', fontWeight: '500' }}>Método de pago</label>
                  <select
                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }}
                    value={paymentData.payment_method}
                    onChange={(e) => setPaymentData({...paymentData, payment_method: e.target.value})}
                  >
                    <option value="efectivo">💵 Efectivo</option>
                    <option value="transferencia">🏦 Transferencia</option>
                    <option value="yape">📱 Yape</option>
                    <option value="plin">📱 Plin</option>
                    <option value="tarjeta">💳 Tarjeta</option>
                  </select>
                </div>
                
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.25rem', fontWeight: '500' }}>Notas</label>
                  <textarea
                    rows="2"
                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }}
                    value={paymentData.notes}
                    onChange={(e) => setPaymentData({...paymentData, notes: e.target.value})}
                    placeholder="Referencia, número de operación, etc."
                  />
                </div>
                
                <div style={{ display: 'flex', gap: '0.75rem', paddingTop: '0.5rem' }}>
                  <button
                    type="button"
                    onClick={() => setSelectedDebt(null)}
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
                    disabled={registering}
                    style={{
                      flex: 1,
                      padding: '0.5rem',
                      backgroundColor: '#3b82f6',
                      color: 'white',
                      border: 'none',
                      borderRadius: '0.375rem',
                      cursor: registering ? 'not-allowed' : 'pointer',
                      opacity: registering ? 0.7 : 1
                    }}
                  >
                    {registering ? 'Registrando...' : 'Registrar Pago'}
                  </button>
                </div>
              </div>
            </form>
          ) : (
            <div style={{ 
              textAlign: 'center', 
              padding: '2rem', 
              backgroundColor: '#fef3c7', 
              borderRadius: '0.5rem',
              color: '#92400e'
            }}>
              ⚠️ No tienes permisos para registrar pagos. Contacta al administrador.
              <div style={{ marginTop: '1rem' }}>
                <button
                  onClick={() => setSelectedDebt(null)}
                  style={{
                    padding: '0.5rem 1rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.375rem',
                    backgroundColor: 'white',
                    cursor: 'pointer'
                  }}
                >
                  Volver a la lista
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Payments;