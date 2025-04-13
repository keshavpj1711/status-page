import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './components/auth/AuthContext';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Dashboard from './components/Dashboard'; 
import PublicStatusPage from './components/PublicStatusPage';
import IncidentList from './components/incidents/IncidentList';
import IncidentDetail from './components/incidents/IncidentDetail';
import IncidentForm from './components/incidents/IncidentForm';

// Protected route component
function PrivateRoute({ children }) {
  const { currentUser, loading } = useAuth();
  
  if (loading) return <div>Loading...</div>;
  
  if (!currentUser) {
    return <Navigate to="/login" />;
  }
  
  return children;
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<PublicStatusPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Protected routes */}
          <Route 
            path="/dashboard/incidents" 
            element={
              <PrivateRoute>
                <IncidentList />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/dashboard/incidents/:incidentId" 
            element={
              <PrivateRoute>
                <IncidentDetail />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/dashboard/incidents/new" 
            element={
              <PrivateRoute>
                <IncidentForm />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/dashboard" 
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            } 
          />
          <Route path="/" element={<Navigate to="/dashboard" />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
