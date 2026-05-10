import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building, Lock, Loader2, CheckCircle } from 'lucide-react';
import { authApi } from '../services/api';

const ResetPassword = () => {
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await authApi.resetPassword({ token, newPassword });
      setSuccess(true);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid or expired token');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-bg-pattern" />
      <div className="login-card glass-panel">
        <div className="login-header">
          <div className="login-logo">
            <div className="login-logo-icon"><Building size={28} color="white" /></div>
            <h1>EstateCloud</h1>
          </div>
          <p className="text-muted">Set your new password</p>
        </div>

        {success ? (
          <div className="flex-col items-center gap-4 text-center">
            <CheckCircle size={48} className="text-success" />
            <h3 className="text-h3">Password Reset!</h3>
            <p className="text-muted">Your password has been updated. Redirecting to login...</p>
          </div>
        ) : (
          <>
            {error && <div className="login-error">{error}</div>}
            <form onSubmit={handleSubmit} className="login-form">
              <div className="form-group">
                <label className="form-label">Reset Token</label>
                <input className="input" placeholder="Paste your token here" value={token} onChange={e => setToken(e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="form-label">New Password</label>
                <div className="search-bar" style={{ margin: 0 }}>
                  <Lock size={18} className="search-icon" />
                  <input type="password" className="input w-full" style={{ paddingLeft: '2.5rem' }} value={newPassword} onChange={e => setNewPassword(e.target.value)} required minLength={6} />
                </div>
              </div>
              <button type="submit" className="btn btn-primary w-full" disabled={loading}>
                {loading ? <Loader2 size={18} className="spin" /> : 'Update Password'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;
