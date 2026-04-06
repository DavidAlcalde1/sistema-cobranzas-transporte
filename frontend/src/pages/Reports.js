import React, { useState } from 'react';
import axios from 'axios';
import { getDebts } from '../services/api';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const API_URL = 'http://localhost:3001/api';

function Reports() {
  const [reportType, setReportType] = useState('debts');
  const [filters, setFilters] = useState({
    start_date: '',
    end_date: '',
    client_name: ''
  });
  const [reportData, setReportData] = useState([]);
  const [generating, setGenerating] = useState(false);
  const [summary, setSummary] = useState({ total: 0, count: 0 });
  const [error, setError] = useState('');

  const generateReport = async () => {
    setGenerating(true);
    setError('');
    
    try {
      let data = [];
      
      if (reportType === 'debts') {
        const response = await getDebts();
        data = response.data;
        
        if (filters.client_name && filters.client_name.trim() !== '') {
          const searchTerm = filters.client_name.toLowerCase().trim();
          data = data.filter(d => 
            d.client_name && d.client_name.toLowerCase().includes(searchTerm)
          );
        }
        
        setSummary({
          total: data.reduce((sum, d) => sum + (d.pending_amount || 0), 0),
          count: data.length
        });
      } 
      else if (reportType === 'payments') {
        let url = `${API_URL}/payments/reports/payments?`;
        const params = [];
        
        if (filters.start_date) params.push(`start=${filters.start_date}`);
        if (filters.end_date) params.push(`end=${filters.end_date}`);
        if (filters.client_name && filters.client_name.trim() !== '') {
          params.push(`client=${encodeURIComponent(filters.client_name.trim())}`);
        }
        
        url += params.join('&');
        const response = await axios.get(url);
        data = response.data;
        
        setSummary({
          total: data.reduce((sum, d) => sum + (d.amount || 0), 0),
          count: data.length
        });
      }
      else if (reportType === 'services') {
        const response = await axios.get(`${API_URL}/services`);
        data = response.data;
        
        if (filters.start_date && filters.end_date) {
          data = data.filter(s => 
            s.service_date >= filters.start_date && s.service_date <= filters.end_date
          );
        }
        if (filters.client_name && filters.client_name.trim() !== '') {
          const searchTerm = filters.client_name.toLowerCase().trim();
          data = data.filter(s => 
            s.client_name && s.client_name.toLowerCase().includes(searchTerm)
          );
        }
        
        setSummary({
          total: data.reduce((sum, d) => sum + (d.sale_price || 0), 0),
          count: data.length
        });
      }
      
      setReportData(data);
      
      if (data.length === 0) {
        setError('⚠️ No hay datos para los filtros seleccionados');
      } else {
        setError('');
      }
    } catch (error) {
      console.error('Error generando reporte:', error);
      setError('❌ Error al generar reporte: ' + (error.response?.data?.error || error.message));
    } finally {
      setGenerating(false);
    }
  };

  const exportToPDF = () => {
  const doc = new jsPDF();
  const currentDate = new Date().toLocaleDateString('es-PE');
  
  let title = '';
  switch(reportType) {
    case 'debts': title = 'Reporte de Deudas Pendientes'; break;
    case 'payments': title = 'Reporte de Entradas (Pagos)'; break;
    case 'services': title = 'Reporte de Servicios Realizados'; break;
    default: title = 'Reporte';
  }
  
  // Título
  doc.setFontSize(18);
  doc.setTextColor(37, 99, 235);
  doc.text(title, 14, 20);
  
  // Fecha de generación
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(`Generado: ${currentDate}`, 14, 28);
  
  // Filtros aplicados
  let filterText = '';
  if (filters.start_date || filters.end_date) {
    filterText += `Período: ${filters.start_date || 'inicio'} - ${filters.end_date || 'hoy'} `;
  }
  if (filters.client_name && filters.client_name.trim()) {
    filterText += `Cliente: ${filters.client_name}`;
  }
  if (filterText) {
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text(`Filtros: ${filterText}`, 14, 34);
  }
  
  // Configurar columnas y filas
  let columns = [];
  let rows = [];
  
  if (reportType === 'debts') {
    columns = ['Cliente', 'N° Servicio', 'Detalle', 'Fecha', 'Total', 'Pagado', 'Pendiente'];
    rows = reportData.map(d => [
      String(d.client_name || ''),
      String(d.service_number_text || d.service_id),
      String((d.service_detail || d.service_type || '').substring(0, 40)),
      String(d.service_date || ''),
      `S/ ${(d.total_amount || 0).toFixed(2)}`,
      `S/ ${(d.paid_amount || 0).toFixed(2)}`,
      `S/ ${(d.pending_amount || 0).toFixed(2)}`
    ]);
  } 
  else if (reportType === 'payments') {
    columns = ['Fecha', 'Cliente', 'N° Servicio', 'Monto', 'Método', 'Notas'];
    rows = reportData.map(p => [
      String(p.payment_date || ''),
      String(p.client_name || ''),
      String(p.service_number_text || p.service_id),
      `S/ ${(p.amount || 0).toFixed(2)}`,
      String(p.payment_method || ''),
      String((p.notes || '').substring(0, 30))
    ]);
  }
  else if (reportType === 'services') {
    columns = ['N° Servicio', 'Cliente', 'Detalle', 'Fecha', 'Venta', 'Costo', 'Neto', 'Tipo'];
    rows = reportData.map(s => [
      String(s.service_number_text || s.id),
      String(s.client_name || ''),
      String((s.service_detail || s.service_type || '').substring(0, 35)),
      String(s.service_date || ''),
      `S/ ${(s.sale_price || 0).toFixed(2)}`,
      `S/ ${(s.cost_price || 0).toFixed(2)}`,
      `S/ ${(s.net_price || 0).toFixed(2)}`,
      s.is_credit === 'SI' ? 'Crédito' : 'Contado'
    ]);
  }
  
  // Calcular posición inicial
  let startY = 38;
  if (filterText) {
    startY = 44;
  }
  
  // Generar tabla
  autoTable(doc, {
    startY: startY,
    head: [columns],
    body: rows,
    theme: 'striped',
    headStyles: { 
      fillColor: [37, 99, 235], 
      textColor: 255, 
      fontSize: 8,
      fontStyle: 'bold'
    },
    bodyStyles: { 
      fontSize: 7 
    },
    columnStyles: {
      0: { cellWidth: 30 },
      1: { cellWidth: 35 },
      2: { cellWidth: 45 },
      3: { cellWidth: 25 },
    },
    margin: { top: 10, left: 10, right: 10 },
    didDrawCell: (data) => {
      // Evitar caracteres especiales
      if (data.cell && data.cell.text) {
        data.cell.text = data.cell.text.map(t => String(t).replace(/[^\x20-\x7E\u00C0-\u00FF]/g, ''));
      }
    }
  });
  
  // Resumen
  const finalY = doc.lastAutoTable.finalY + 10;
  doc.setFontSize(11);
  doc.setTextColor(0, 0, 0);
  
  let totalLabel = '';
  let totalColor = [0, 0, 0];
  switch(reportType) {
    case 'debts': 
      totalLabel = '💰 Total de deudas pendientes:';
      totalColor = [220, 38, 38];
      break;
    case 'payments': 
      totalLabel = 'Total de ingresos:';
      totalColor = [16, 185, 129];
      break;
    case 'services': 
      totalLabel = '📊 Total de ventas:';
      totalColor = [16, 185, 129];
      break;
  }
  
  doc.setTextColor(totalColor[0], totalColor[1], totalColor[2]);
  doc.text(`${totalLabel} S/ ${summary.total.toFixed(2)}`, 14, finalY);
  
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.text(`Total de registros: ${reportData.length}`, 14, finalY + 6);
  doc.text(`Sistema de Fletes - Reporte generado automáticamente`, 14, finalY + 15);
  
  // Guardar PDF
  const fileName = `reporte_${reportType}_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
};

  const exportToExcel = () => {
    let headers = [];
    let rows = [];
    
    if (reportType === 'debts') {
      headers = ['Cliente', 'N° Servicio', 'Detalle', 'Fecha Servicio', 'Total', 'Pagado', 'Pendiente'];
      rows = reportData.map(d => [
        d.client_name || '',
        d.service_number_text || d.service_id,
        d.service_detail || d.service_type || '',
        d.service_date || '',
        d.total_amount || 0,
        d.paid_amount || 0,
        d.pending_amount || 0
      ]);
    } 
    else if (reportType === 'payments') {
      headers = ['Fecha', 'Cliente', 'N° Servicio', 'Monto', 'Método', 'Notas'];
      rows = reportData.map(p => [
        p.payment_date || '',
        p.client_name || '',
        p.service_number_text || p.service_id,
        p.amount || 0,
        p.payment_method || '',
        p.notes || ''
      ]);
    }
    else if (reportType === 'services') {
      headers = ['N° Servicio', 'Cliente', 'Detalle', 'Fecha', 'Venta', 'Costo', 'Neto', 'Tipo'];
      rows = reportData.map(s => [
        s.service_number_text || s.id,
        s.client_name || '',
        s.service_detail || s.service_type || '',
        s.service_date || '',
        s.sale_price || 0,
        s.cost_price || 0,
        s.net_price || 0,
        s.is_credit === 'SI' ? 'Crédito' : 'Contado'
      ]);
    }
    
    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');
    
    const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `reporte_${reportType}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getReportTitle = () => {
    switch(reportType) {
      case 'debts': return '📋 Reporte de Deudas Pendientes';
      case 'payments': return '💰 Reporte de Entradas (Pagos)';
      case 'services': return '🚛 Reporte de Servicios Realizados';
      default: return 'Generar Reportes';
    }
  };

  const getReportDescription = () => {
    switch(reportType) {
      case 'debts': return 'Muestra los servicios a crédito que aún tienen saldo pendiente.';
      case 'payments': return 'Muestra todos los pagos registrados. Puedes filtrar por fechas para ver entradas diarias, mensuales o por período.';
      case 'services': return 'Muestra todos los servicios realizados. Puedes filtrar por fechas y cliente.';
      default: return '';
    }
  };

  return (
    <div>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem', color:'white' }}>{getReportTitle()}</h2>
      <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '1.5rem' }}>{getReportDescription()}</p>
      
      {/* Selector de tipo de reporte */}
      <div style={{ backgroundColor: 'white', borderRadius: '0.5rem', padding: '1rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: '1rem'}}>
        <label style={{ fontWeight: '500', display: 'block', marginBottom: '0.5rem', color: '#000000' }}>📌 Tipo de Reporte:</label>
        <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
            <input type="radio" name="reportType" value="debts" checked={reportType === 'debts'} onChange={() => setReportType('debts')} />
            📋 Deudas Pendientes
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
            <input type="radio" name="reportType" value="payments" checked={reportType === 'payments'} onChange={() => setReportType('payments')} />
            💰 Entradas (Pagos)
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
            <input type="radio" name="reportType" value="services" checked={reportType === 'services'} onChange={() => setReportType('services')} />
            🚛 Servicios Realizados
          </label>
        </div>
      </div>
      
      {/* Filtros */}
      <div style={{ backgroundColor: 'white', borderRadius: '0.5rem', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: '1.5rem' }}>
        <h3 style={{ fontWeight: 'bold', marginBottom: '1rem' }}>🔍 Filtros (opcionales)</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {(reportType === 'payments' || reportType === 'services') && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.875rem', fontWeight: '500' }}>📅 Fecha Inicio:</label>
                <input
                  type="date"
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem', marginTop: '0.25rem' }}
                  value={filters.start_date}
                  onChange={(e) => setFilters({...filters, start_date: e.target.value})}
                />
              </div>
              <div>
                <label style={{ fontSize: '0.875rem', fontWeight: '500', }}>📅 Fecha Fin:</label>
                <input
                  type="date"
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem', marginTop: '0.25rem' }}
                  value={filters.end_date}
                  onChange={(e) => setFilters({...filters, end_date: e.target.value})}
                />
              </div>
            </div>
          )}
          
          <div>
            <label style={{ fontSize: '0.875rem', fontWeight: '500' }}>👤 Cliente (opcional):</label>
            <input
              type="text"
              style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem', marginTop: '0.25rem' }}
              placeholder="Escribe parte del nombre del cliente (ej: sol, san, transporte)"
              value={filters.client_name}
              onChange={(e) => setFilters({...filters, client_name: e.target.value})}
            />
            <p style={{ fontSize: '0.7rem', color: '#6b7280', marginTop: '0.25rem' }}>
              💡 Deja en blanco para ver todos los clientes
            </p>
          </div>
          
          <button
            onClick={generateReport}
            disabled={generating}
            style={{
              width: '100%',
              backgroundColor: '#0a2242',
              color: 'white',
              padding: '0.75rem',
              borderRadius: '0.375rem',
              border: 'none',
              cursor: generating ? 'not-allowed' : 'pointer',
              marginTop: '0.5rem',
              fontSize: '1rem',
              fontWeight: 'bold'
            }}
          >
            {generating ? '⏳ Generando...' : '📊 Generar Reporte'}
          </button>
        </div>
      </div>
      
      {/* Mensaje de error */}
      {error && (
        <div style={{ 
          backgroundColor: '#fee2e2', 
          border: '1px solid #ef4444', 
          borderRadius: '0.5rem', 
          padding: '1rem', 
          marginBottom: '1rem',
          color: '#dc2626'
        }}>
          {error}
        </div>
      )}
      
      {/* Resultados */}
      {reportData.length > 0 && (
        <>
          <div style={{ backgroundColor: 'white', borderRadius: '0.5rem', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: '1rem' }}>
            <div style={{ padding: '1rem', backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
              <span style={{ fontWeight: 'bold' }}>
                📊 Resultados: {reportData.length} registro(s) encontrado(s)
              </span>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  onClick={exportToExcel}
                  style={{
                    backgroundColor: '#10b981',
                    color: 'white',
                    padding: '0.5rem 1rem',
                    borderRadius: '0.375rem',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '0.875rem'
                  }}
                >
                  📥 Exportar Excel
                </button>
                <button
                  onClick={exportToPDF}
                  style={{
                    backgroundColor: '#ef4444',
                    color: 'white',
                    padding: '0.5rem 1rem',
                    borderRadius: '0.375rem',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '0.875rem'
                  }}
                >
                  📄 Exportar PDF
                </button>
              </div>
            </div>
            
            <div style={{ overflowX: 'auto', maxHeight: '500px', overflowY: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead style={{ position: 'sticky', top: 0, backgroundColor: '#f9fafb' }}>
                  <tr>
                    {reportType === 'debts' && (
                      <>
                        <th style={{ padding: '0.75rem', textAlign: 'left' }}>Cliente</th>
                        <th style={{ padding: '0.75rem', textAlign: 'left' }}>N° Servicio</th>
                        <th style={{ padding: '0.75rem', textAlign: 'left' }}>Detalle</th>
                        <th style={{ padding: '0.75rem', textAlign: 'left' }}>Fecha</th>
                        <th style={{ padding: '0.75rem', textAlign: 'right' }}>Total</th>
                        <th style={{ padding: '0.75rem', textAlign: 'right' }}>Pagado</th>
                        <th style={{ padding: '0.75rem', textAlign: 'right' }}>Pendiente</th>
                      </>
                    )}
                    {reportType === 'payments' && (
                      <>
                        <th style={{ padding: '0.75rem', textAlign: 'left' }}>Fecha</th>
                        <th style={{ padding: '0.75rem', textAlign: 'left' }}>Cliente</th>
                        <th style={{ padding: '0.75rem', textAlign: 'left' }}>N° Servicio</th>
                        <th style={{ padding: '0.75rem', textAlign: 'right' }}>Monto</th>
                        <th style={{ padding: '0.75rem', textAlign: 'left' }}>Método</th>
                        <th style={{ padding: '0.75rem', textAlign: 'left' }}>Notas</th>
                      </>
                    )}
                    {reportType === 'services' && (
                      <>
                        <th style={{ padding: '0.75rem', textAlign: 'left' }}>N° Servicio</th>
                        <th style={{ padding: '0.75rem', textAlign: 'left' }}>Cliente</th>
                        <th style={{ padding: '0.75rem', textAlign: 'left' }}>Detalle</th>
                        <th style={{ padding: '0.75rem', textAlign: 'left' }}>Fecha</th>
                        <th style={{ padding: '0.75rem', textAlign: 'right' }}>Venta</th>
                        <th style={{ padding: '0.75rem', textAlign: 'right' }}>Costo</th>
                        <th style={{ padding: '0.75rem', textAlign: 'right' }}>Neto</th>
                        <th style={{ padding: '0.75rem', textAlign: 'left' }}>Tipo</th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {reportData.map((item, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #e5e7eb' }}>
                      {reportType === 'debts' && (
                        <>
                          <td style={{ padding: '0.75rem' }}>{item.client_name || '-'}</td>
                          <td style={{ padding: '0.75rem' }}>{item.service_number_text || item.service_id}</td>
                          <td style={{ padding: '0.75rem' }}>{item.service_detail || item.service_type || '-'}</td>
                          <td style={{ padding: '0.75rem' }}>{item.service_date || '-'}</td>
                          <td style={{ padding: '0.75rem', textAlign: 'right' }}>S/ {(item.total_amount || 0).toFixed(2)}</td>
                          <td style={{ padding: '0.75rem', textAlign: 'right' }}>S/ {(item.paid_amount || 0).toFixed(2)}</td>
                          <td style={{ padding: '0.75rem', textAlign: 'right', fontWeight: 'bold', color: '#dc2626' }}>S/ {(item.pending_amount || 0).toFixed(2)}</td>
                        </>
                      )}
                      {reportType === 'payments' && (
                        <>
                          <td style={{ padding: '0.75rem' }}>{item.payment_date || '-'}</td>
                          <td style={{ padding: '0.75rem' }}>{item.client_name || '-'}</td>
                          <td style={{ padding: '0.75rem' }}>{item.service_number_text || item.service_id}</td>
                          <td style={{ padding: '0.75rem', textAlign: 'right', fontWeight: 'bold', color: '#10b981' }}>S/ {(item.amount || 0).toFixed(2)}</td>
                          <td style={{ padding: '0.75rem' }}>{item.payment_method || '-'}</td>
                          <td style={{ padding: '0.75rem' }}>{item.notes || '-'}</td>
                        </>
                      )}
                      {reportType === 'services' && (
                        <>
                          <td style={{ padding: '0.75rem' }}>{item.service_number_text || item.id}</td>
                          <td style={{ padding: '0.75rem' }}>{item.client_name || '-'}</td>
                          <td style={{ padding: '0.75rem' }}>{item.service_detail || item.service_type || '-'}</td>
                          <td style={{ padding: '0.75rem' }}>{item.service_date || '-'}</td>
                          <td style={{ padding: '0.75rem', textAlign: 'right' }}>S/ {(item.sale_price || 0).toFixed(2)}</td>
                          <td style={{ padding: '0.75rem', textAlign: 'right' }}>S/ {(item.cost_price || 0).toFixed(2)}</td>
                          <td style={{ padding: '0.75rem', textAlign: 'right', fontWeight: 'bold', color: '#10b981' }}>S/ {(item.net_price || 0).toFixed(2)}</td>
                          <td style={{ padding: '0.75rem' }}>{item.is_credit === 'SI' ? 'Crédito' : 'Contado'}</td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          
          {/* Resumen */}
          <div style={{ backgroundColor: 'white', borderRadius: '0.5rem', padding: '1rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
              <span style={{ fontWeight: 'bold' }}>
                {reportType === 'debts' ? '💰 Total de deudas pendientes:' : 
                 reportType === 'payments' ? '💵 Total de ingresos:' : 
                 '📊 Total de ventas:'}
              </span>
              <span style={{ fontSize: '1.25rem', fontWeight: 'bold', color: reportType === 'debts' ? '#dc2626' : '#10b981' }}>
                S/ {summary.total.toFixed(2)}
              </span>
            </div>
            <div style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: '#6b7280' }}>
              📌 {reportData.length} registro(s) encontrado(s)
              {filters.client_name && filters.client_name.trim() !== '' && ` • Cliente filtrado: "${filters.client_name}"`}
              {(filters.start_date || filters.end_date) && ` • Período: ${filters.start_date || 'inicio'} al ${filters.end_date || 'hoy'}`}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default Reports;