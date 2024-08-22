import React from 'react';
import { Navigate } from 'react-router-dom';

const AuthRoute = ({ element: Component, ...rest }) => {
  const isAuthenticated = !!localStorage.getItem('authToken'); // Replace with your auth logic

  return isAuthenticated ? <Component {...rest} /> : <Navigate to="/login" />;
};

export default AuthRoute;