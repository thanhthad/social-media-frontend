import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { forgotPassword } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;
    
    setIsSubmitting(true);
    const result = await forgotPassword(email);
    setIsSubmitting(false);
    
    if (result.success) {
      setIsSuccess(true);
      toast.success('Password reset link sent to your email.');
    } else {
      toast.error(result.error || 'Failed to send reset link.');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1 className="auth-title">Reset Password</h1>
          <p className="auth-subtitle">Enter your email to receive a reset link</p>
        </div>
        
        {!isSuccess ? (
          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label className="input-label" htmlFor="email">Email Address</label>
              <input
                id="email"
                type="email"
                className="input-field"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isSubmitting}
              />
            </div>
            
            <button 
              type="submit" 
              className="btn btn-primary" 
              style={{ width: '100%', marginTop: '1rem' }}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>
        ) : (
          <div style={{ textAlign: 'center', padding: '1rem 0' }}>
            <svg style={{ width: '48px', height: '48px', color: 'hsl(var(--color-success))', margin: '0 auto 1rem' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p style={{ marginBottom: '1.5rem', color: 'hsl(var(--color-text-muted))' }}>
              We have sent a password reset link to <strong>{email}</strong>. Please check your inbox.
            </p>
            <button 
              onClick={() => setIsSuccess(false)}
              className="btn"
              style={{ border: '1px solid hsl(var(--color-border))' }}
            >
              Try another email
            </button>
          </div>
        )}
        
        <div className="auth-footer">
          Remember your password? <Link to="/login">Back to Sign In</Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
