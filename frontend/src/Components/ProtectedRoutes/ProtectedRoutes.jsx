import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { tokenContext } from '../../Context/TokenContext';

export default function ProtectedRoutes({ children }) {
  const { token } = useContext(tokenContext);
  if (token) {
    return children;
  }
  return <Navigate to={'/login'} />;
}
