import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import Layout from './components/layout/Layout';

import Dashboard from './pages/Dashboard';
import Employees from './pages/Employees';
import Warehouses from './pages/Warehouses';
import Parts from './pages/Parts';
import Backorders from './pages/Backorders';
import Queries from './pages/Queries';
import Analysis from './pages/Analysis';
import Login from './pages/Login';

const AppContent = () => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Login />;
  }

  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/employees" element={<Employees />} />
          <Route path="/warehouses" element={<Warehouses />} />
          <Route path="/parts" element={<Parts />} />
          <Route path="/backorders" element={<Backorders />} />
          <Route path="/queries" element={<Queries />} />
          <Route path="/analysis" element={<Analysis />} />
        </Routes>
      </Layout>
    </Router>
  );
};

function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <AppContent />
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;
