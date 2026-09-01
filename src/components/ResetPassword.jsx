import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { resetPassword } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      toast.error('Invalid password reset token.');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    
    setIsSubmitting(true);
    const result = await resetPassword(token, newPassword);
    setIsSubmitting(false);
    
    if (result.success) {
      toast.success('Password has been reset successfully!');
      navigate('/login');
    } else {
      toast.error(result.error || 'Failed to reset password. The link might be expired.');
    }
  };

  if (!token) {
    return (
      <div className="auth-container">
        <div className="auth-card" style={{ textAlign: 'center' }}>
          <h2 className="auth-title">Invalid Request</h2>
          <p className="auth-subtitle" style={{ marginBottom: '1.5rem' }}>Missing reset token.</p>
          <Link to="/forgot-password" className="btn btn-primary">Request New Link</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1 className="auth-title">Create New Password</h1>
          <p className="auth-subtitle">Please enter your new password below</p>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label className="input-label" htmlFor="newPassword">New Password</label>
            <input
              id="newPassword"
              type="password"
              className="input-field"
              placeholder="••••••••"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              disabled={isSubmitting}
            />
          </div>
          
          <div className="input-group">
            <label className="input-label" htmlFor="confirmPassword">Confirm Password</label>
            <input
              id="confirmPassword"
              type="password"
              className="input-field"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
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
            {isSubmitting ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
