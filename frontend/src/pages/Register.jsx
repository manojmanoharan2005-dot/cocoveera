/**
 * File: frontend/src/pages/Register.jsx
 * Purpose: React page component representing the Register view.
 */
import React from 'react';
import AuthLayout from '../layouts/AuthLayout';
import RegisterForm from '../components/auth/RegisterForm';

export const Register = () => {
  return (
    <AuthLayout>
      <RegisterForm />
    </AuthLayout>
  );
};

export default Register;
