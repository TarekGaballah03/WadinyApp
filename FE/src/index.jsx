// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { Toaster } from 'react-hot-toast';
import './index.css';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId="1001249800736-t71bsv2que8phgq4av6k94lhfmj06umb.apps.googleusercontent.com">
      <App />
      <Toaster 
        position="top-center"
        reverseOrder={false}
        gutter={8}
        containerClassName=""
        containerStyle={{}}
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
            padding: '12px 16px',
            borderRadius: '12px',
            fontSize: '14px',
            fontWeight: '500',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#10B981',
              secondary: '#fff',
            },
            style: {
              background: '#059669',
              color: '#fff',
            },
          },
          error: {
            duration: 4000,
            iconTheme: {
              primary: '#EF4444',
              secondary: '#fff',
            },
            style: {
              background: '#DC2626',
              color: '#fff',
            },
          },
          loading: {
            duration: Infinity,
            iconTheme: {
              primary: '#3B82F6',
              secondary: '#fff',
            },
            style: {
              background: '#3B82F6',
              color: '#fff',
            },
          },
        }}
      />
    </GoogleOAuthProvider>
  </React.StrictMode>
);