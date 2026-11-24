/**
 * File: frontend/src/layouts/AuthLayout.jsx
 * Purpose: Authentication layout with smooth natural scrolling and optimized rendering.
 */
import React from 'react';
import { Outlet } from 'react-router-dom';

export const AuthLayout = ({ children }) => {
  return (
    <div 
      className="auth-page min-h-[calc(100vh-134px)] sm:min-h-[calc(100dvh-134px)] text-stone-100 flex flex-col justify-start items-center font-sans relative bg-stone-900 w-full py-6 sm:py-10"
      style={{
        backgroundImage: "url('/bg-auth.webp')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Blurry dark overlay */}
      <div className="absolute inset-0 bg-stone-950/30 backdrop-blur-sm z-0 pointer-events-none" />

      {/* Background decoration elements contained to prevent overflow without GPU stall */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div 
          className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-primary/20 blur-[120px] pointer-events-none" 
        />
        <div 
          className="absolute bottom-[-10%] right-[-10%] w-[450px] h-[450px] rounded-full bg-secondary/10 blur-[100px] pointer-events-none" 
        />
      </div>

      {/* Main Content Area: uses my-auto to center vertically when space allows without clipping on scroll */}
      <main className="flex-grow flex flex-col items-center justify-start px-3.5 xs:px-4 sm:px-6 relative z-10 w-full my-auto">
        <div className="w-full max-w-md mx-auto">
          {children || <Outlet />}
        </div>
      </main>
    </div>
  );
};

export default AuthLayout;
