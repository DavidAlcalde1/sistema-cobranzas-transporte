import React, { useState, useEffect } from 'react';
import { getDebts } from '../services/api';

function Dashboard() {
  const [stats, setStats] = useState({
    totalDebts: 0,
    totalAmount: 0,
    clientsCount: 0
  });
  const [recentDebts, setRecentDebts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const response = await getDebts();
      const debts = response.data;
      
      console.log('Deudas cargadas:', debts);
      
      const totalAmount = debts.reduce((sum, debt) => sum + (debt.pending_amount || 0), 0);
      const uniqueClients = new Set(debts.map(d => d.client_id));
      
      setStats({
        totalDebts: debts.length,
        totalAmount: totalAmount,
        clientsCount: uniqueClients.size
      });
      
      setRecentDebts(debts.slice(0, 5));
    } catch (error) {
      console.error('Error cargando datos:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '2rem' }}>Cargando...</div>;
  }

  return (
    <div>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem', color: 'white'}}>🏠 Dashboard</h2>
      
      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <div style={{ backgroundColor: 'white', borderRadius: '0.5rem', padding: '1rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>💰</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#dc2626' }}>
            S/ {stats.totalAmount.toFixed(2)}
          </div>
          <div style={{ color: '#6b7280', fontSize: '0.875rem' }}>Total Deudas</div>
        </div>
        
        <div style={{ backgroundColor: 'white', borderRadius: '0.5rem', padding: '1rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📋</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#2563eb' }}>
            {stats.totalDebts}
          </div>
          <div style={{ color: '#6b7280', fontSize: '0.875rem' }}>Servicios con deuda</div>
        </div>
        
        <div style={{ backgroundColor: 'white', borderRadius: '0.5rem', padding: '1rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>👥</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#10b981' }}>
            {stats.clientsCount}
          </div>
          <div style={{ color: '#6b7280', fontSize: '0.875rem' }}>Clientes deudores</div>
        </div>
      </div>
      
      {/* Recent Debts */}
      <div style={{ backgroundColor: 'white', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <div style={{ padding: '1rem', borderBottom: '1px solid #e5e7eb' }}>
          <h3 style={{ fontWeight: '600' }}>Últimas deudas pendientes</h3>
        </div>
        <div>
          {recentDebts.map((debt) => (
            <div key={debt.service_id} style={{ padding: '1rem', borderBottom: '1px solid #e5e7eb' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                <div>
                  <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.25rem' }}>
                    <span style={{ backgroundColor: '#e0e7ff', padding: '0.2rem 0.5rem', borderRadius: '0.25rem', fontSize: '0.7rem', fontWeight: 'bold' }}>
                      {debt.service_number_text || (() => {
                        // Calcular número correlativo basado en la posición
                        const index = recentDebts.findIndex(d => d.service_id === debt.service_id);
                        return `N° ${index + 1}`;
                      })()}
                    </span>
                    <span style={{ backgroundColor: '#fee2e2', padding: '0.2rem 0.5rem', borderRadius: '0.25rem', fontSize: '0.7rem' }}>
                      📋 Crédito
                    </span>
                  </div>
                  <p style={{ fontWeight: '500' }}>{debt.client_name}</p>
                  <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>{debt.service_type || debt.service_detail || 'Servicio de transporte'}</p>
                  <p style={{ fontSize: '0.75rem', color: '#9ca3af' }}>📅 {debt.service_date}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontWeight: 'bold', color: '#dc2626' }}>S/ {(debt.pending_amount || 0).toFixed(2)}</p>
                  <p style={{ fontSize: '0.75rem', color: '#9ca3af' }}>Total: S/ {(debt.total_amount || 0).toFixed(2)}</p>
                </div>
              </div>
            </div>
          ))}
          {recentDebts.length === 0 && (
            <div style={{ padding: '1rem', textAlign: 'center', color: '#6b7280' }}>
              🎉 No hay deudas pendientes
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;