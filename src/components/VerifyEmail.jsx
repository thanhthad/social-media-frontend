import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  
  const [status, setStatus] = useState('verifying'); // verifying, success, error
  const [message, setMessage] = useState('Verifying your email address...');
  const { verifyEmail, resendVerification } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Invalid or missing verification token.');
      return;
    }

    const performVerification = async () => {
      const result = await verifyEmail(token);
      if (result.success) {
        setStatus('success');
        setMessage('Your email has been successfully verified! You can now access all features.');
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } else {
        setStatus('error');
        setMessage(result.error || 'Verification failed. The link might be expired.');
      }
    };

    performVerification();
  }, [token, verifyEmail, navigate]);

  return (
    <div className="auth-container">
      <div className="auth-card" style={{ textAlign: 'center' }}>
        
        {status === 'verifying' && (
          <div style={{ padding: '2rem 0' }}>
            <div className="spinner" style={{ margin: '0 auto 1.5rem', width: '40px', height: '40px', border: '3px solid hsl(var(--color-border))', borderTopColor: 'hsl(var(--color-primary))', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
            <h2 className="auth-title">Verifying Email</h2>
            <p className="auth-subtitle">{message}</p>
            <style>{`
              @keyframes spin {
                to { transform: rotate(360deg); }
              }
            `}</style>
          </div>
        )}

        {status === 'success' && (
          <div style={{ padding: '1rem 0' }}>
            <svg style={{ width: '56px', height: '56px', color: 'hsl(var(--color-success))', margin: '0 auto 1.5rem' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h2 className="auth-title">Verification Complete</h2>
            <p className="auth-subtitle">{message}</p>
            <p style={{ marginTop: '1rem', fontSize: '0.875rem', color: 'hsl(var(--color-text-muted))' }}>
              Redirecting to login...
            </p>
          </div>
        )}

        {status === 'error' && (
          <div style={{ padding: '1rem 0' }}>
            <svg style={{ width: '56px', height: '56px', color: 'hsl(var(--color-error))', margin: '0 auto 1.5rem' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h2 className="auth-title">Verification Failed</h2>
            <p className="auth-subtitle" style={{ marginBottom: '1.5rem' }}>{message}</p>
            
            <Link to="/login" className="btn btn-primary" style={{ width: '100%', marginBottom: '1rem' }}>
              Return to Login
            </Link>
          </div>
        )}
        
      </div>
    </div>
  );
};

export default VerifyEmail;
