import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Attendance from './pages/Attendance';
import Marks from './pages/Marks';
import StudyMaterials from './pages/StudyMaterials';
import DefaulterList from './pages/DefaulterList';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/" element={
              <ProtectedRoute>
                <Navbar />
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute>
                <Navbar />
                <Profile />
              </ProtectedRoute>
            } />
            <Route path="/attendance" element={
              <ProtectedRoute>
                <Navbar />
                <Attendance />
              </ProtectedRoute>
            } />
            <Route path="/marks" element={
              <ProtectedRoute>
                <Navbar />
                <Marks />
              </ProtectedRoute>
            } />
            <Route path="/materials" element={
              <ProtectedRoute>
                <Navbar />
                <StudyMaterials />
              </ProtectedRoute>
            } />
            <Route path="/defaulter" element={
              <ProtectedRoute>
                <Navbar />
                <DefaulterList />
              </ProtectedRoute>
            } />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;