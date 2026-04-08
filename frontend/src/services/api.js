import axios from 'axios';

const API_URL = '/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Clientes
export const getClients = () => api.get('/clients');
export const getClient = (id) => api.get(`/clients/${id}`);
export const createClient = (data) => api.post('/clients', data);
export const updateClient = (id, data) => api.put(`/clients/${id}`, data);
export const deleteClient = (id) => api.delete(`/clients/${id}`);

// Pagos y deudas
export const getDebts = () => api.get('/payments/debts');
export const registerPayment = (data) => api.post('/payments', data);
export const getPaymentsByService = (serviceId) => api.get(`/payments/service/${serviceId}`);

// Health check
export const healthCheck = () => api.get('/health');