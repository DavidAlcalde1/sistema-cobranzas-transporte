import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import Services from './pages/Services';
import Clients from './pages/Clients';
import Payments from './pages/Payments';
import Reports from './pages/Reports';
import Users from './pages/Users';

// Componente para proteger rutas
const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return <div style={{ textAlign: 'center', padding: '2rem' }}>Cargando...</div>;
  }
  
  return isAuthenticated ? children : <Navigate to="/login" />;
};

function AppRoutes() {
  const { isAuthenticated } = useAuth();
  
  return (
    <Routes>
      {/* Ruta pública - Landing Page */}
      <Route path="/" element={<Landing />} />
      
      {/* Login - si está autenticado, va al dashboard */}
      <Route path="/login" element={
        isAuthenticated ? <Navigate to="/dashboard" /> : <Login />
      } />
      
      {/* Dashboard y demás rutas protegidas */}
      <Route path="/dashboard" element={
        <PrivateRoute>
          <Layout>
            <Dashboard />
          </Layout>
        </PrivateRoute>
      } />
      <Route path="/clients" element={
        <PrivateRoute>
          <Layout>
            <Clients />
          </Layout>
        </PrivateRoute>
      } />
      <Route path="/services" element={
        <PrivateRoute>
          <Layout>
            <Services />
          </Layout>
        </PrivateRoute>
      } />
      <Route path="/payments" element={
        <PrivateRoute>
          <Layout>
            <Payments />
          </Layout>
        </PrivateRoute>
      } />
      <Route path="/reports" element={
        <PrivateRoute>
          <Layout>
            <Reports />
          </Layout>
        </PrivateRoute>
      } />
      <Route path="/users" element={
        <PrivateRoute>
          <Layout>
            <Users />
          </Layout>
        </PrivateRoute>
      } />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;