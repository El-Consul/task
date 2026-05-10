import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building, Mail, Loader2, ArrowLeft } from 'lucide-react';
import { authApi } from '../services/api';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
    try {
      await authApi.forgotPassword(email);
      setMessage('If an account exists with this email, you will receive a reset token.');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Something went wrong');
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
          <p className="text-muted">Enter your email to reset your password</p>
        </div>

        {message && <div className="badge badge-success w-full p-3 mb-4 text-center">{message}</div>}
        {error && <div className="login-error">{error}</div>}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div className="search-bar" style={{ margin: 0 }}>
              <Mail size={18} className="search-icon" />
              <input type="email" className="input w-full" style={{ paddingLeft: '2.5rem' }} value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
          </div>
          <button type="submit" className="btn btn-primary w-full" disabled={loading}>
            {loading ? <Loader2 size={18} className="spin" /> : 'Send Reset Token'}
          </button>
        </form>

        <button className="flex items-center gap-2 text-sm text-muted hover:text-white mt-6" onClick={() => navigate('/login')}>
          <ArrowLeft size={16} /> Back to Login
        </button>
      </div>
    </div>
  );
};

export default ForgotPassword;
