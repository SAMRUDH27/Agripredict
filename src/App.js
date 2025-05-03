import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import FieldEntry from './pages/FieldEntry';
import CropManagement from './pages/croppage';
import AppBar from './components/layouts/AppBar';

function App() {
  // Check if both username and farmerId are in localStorage
  const [isLoggedIn, setIsLoggedIn] = useState(
    !!localStorage.getItem('username') && !!localStorage.getItem('farmerId')
  );
  
  const [username, setUsername] = useState(localStorage.getItem('username') || '--');
  const [farmerId, setFarmerId] = useState(localStorage.getItem('farmerId') || null);

  const handleLogin = (user, farmerId) => {
    setIsLoggedIn(true);
    setUsername(user);
    setFarmerId(farmerId);
    
    // Store both username and farmerId
    localStorage.setItem('username', user);
    localStorage.setItem('farmerId', farmerId);
  };

  const handleRegister = (user, farmerId) => {
    // Same as handleLogin, but can be customized if needed
    handleLogin(user, farmerId);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUsername('--');
    setFarmerId(null);
    
    // Remove both username and farmerId
    localStorage.removeItem('username');
    localStorage.removeItem('farmerId');
  };

  // Protected Route Component
  const ProtectedRoute = ({ children }) => {
    if (!isLoggedIn) {
      // Redirect to login if not logged in
      return <Navigate to="/login" replace />;
    }
    return children;
  };

  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <AppBar 
          isLoggedIn={isLoggedIn} 
          username={username}
          onLogout={handleLogout}
        />
        <Routes>
        <Route 
  path="/" 
  element={
    <ProtectedRoute>
      <Dashboard 
        username={username} 
        isLoggedIn={isLoggedIn} 
        farmerId={farmerId}  // Add this
      />
    </ProtectedRoute>
  } 
/>
          <Route 
            path="/login" 
            element={<Login onLogin={handleLogin} />} 
          />
          <Route 
            path="/register" 
            element={<Register onRegister={handleRegister} />} 
          />
          <Route 
            path="/field-entry" 
            element={
              <ProtectedRoute>
                <FieldEntry 
                  username={username} 
                  farmerId={farmerId} 
                />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/crops" 
            element={
              <ProtectedRoute>
                <CropManagement />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;