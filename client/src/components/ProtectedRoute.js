import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  // Show loading indicator while checking authentication status
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        <span className="ml-3 text-gray-600">Checking authentication...</span>
      </div>
    );
  }
  
  // Redirect to login if not authenticated (after loading is complete)
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  // Render protected content if authenticated
  return children;
};

export default ProtectedRoute;