/**
 * File: frontend/src/pages/Login.jsx
 * Purpose: React page component representing the Login view.
 */
import React from 'react';
import AuthLayout from '../layouts/AuthLayout';
import LoginForm from '../components/auth/LoginForm';

export const Login = () => {
  return (
    <AuthLayout>
      <LoginForm />
    </AuthLayout>
  );
};

export default Login;
