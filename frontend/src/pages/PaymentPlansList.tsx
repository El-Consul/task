import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { paymentPlansApi, clientsApi, departmentsApi } from '../services/api';
import { Plus, Eye, CreditCard, Loader2, X } from 'lucide-react';

interface PaymentPlan {
  id: string;
  totalAmount: number;
  deposit: number;
  startDate: string;
  endDate: string;
  frequency: string;
  client: { id: string; name: string; email: string };
  department: { id: string; code: string; name?: string; price: number };
  installments: { id: string; amount: number; dueDate: string; status: string }[];
}

const PaymentPlansList = () => {
  const [plans, setPlans] = useState<PaymentPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [clients, setClients] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    clientId: '', departmentId: '', totalAmount: '', deposit: '',
    startDate: '', endDate: '', frequency: 'MONTHLY',
  });

  const fetchPlans = async () => {
    try {
      const res = await paymentPlansApi.getAll();
      setPlans(res.data);
    } catch (err) {
      console.error('Failed to fetch plans', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPlans(); }, []);

  const openCreate = async () => {
    try {
      const [c, d] = await Promise.all([clientsApi.getAll(), departmentsApi.getAll()]);
      setClients(c.data);
      setDepartments(d.data.filter((dept: any) => dept.status === 'AVAILABLE'));
      setShowModal(true);
    } catch (err) {
      console.error('Failed to load form data', err);
    }
  };

  const handleDeptChange = (deptId: string) => {
    const dept = departments.find((d: any) => d.id === deptId);
    setFormData({ ...formData, departmentId: deptId, totalAmount: dept ? dept.price.toString() : '' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await paymentPlansApi.create({
        clientId: formData.clientId,
        departmentId: formData.departmentId,
        totalAmount: parseFloat(formData.totalAmount),
        deposit: parseFloat(formData.deposit),
        startDate: formData.startDate,
        endDate: formData.endDate,
        frequency: formData.frequency,
      });
      setShowModal(false);
      setFormData({ clientId: '', departmentId: '', totalAmount: '', deposit: '', startDate: '', endDate: '', frequency: 'MONTHLY' });
      fetchPlans();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create plan');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex-col gap-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-h2">Payment Plans</h1>
          <p className="text-muted mt-2">Manage installment plans for property purchases</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate} id="add-plan-btn">
          <Plus size={18} /> Create Plan
        </button>
      </div>

      {loading ? (
        <div className="loading-state"><Loader2 size={32} className="spin" /><p className="text-muted">Loading plans...</p></div>
      ) : plans.length === 0 ? (
        <div className="empty-state glass-panel">
          <CreditCard size={48} />
          <h3>No payment plans yet</h3>
          <p className="text-muted">Create your first payment plan to get started</p>
        </div>
      ) : (
        <div className="flex-col gap-4">
          {plans.map((plan) => {
            const paidCount = plan.installments.filter((i) => i.status === 'PAID').length;
            const overdueCount = plan.installments.filter((i) => i.status === 'OVERDUE').length;
            const progress = plan.installments.length > 0 ? (paidCount / plan.installments.length) * 100 : 0;
            const paidAmount = plan.installments.filter((i) => i.status === 'PAID').reduce((s, i) => s + i.amount, 0);

            return (
              <div key={plan.id} className="card glass-panel plan-list-card">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <div className="dept-code-badge-lg">{plan.department.code}</div>
                    <div>
                      <h3 className="font-medium">{plan.client.name}</h3>
                      <span className="text-sm text-muted">{plan.client.email}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="flex-col" style={{ textAlign: 'center' }}>
                      <span className="text-sm text-muted">Total</span>
                      <span className="font-bold">${plan.totalAmount.toLocaleString()}</span>
                    </div>
                    <div className="flex-col" style={{ textAlign: 'center' }}>
                      <span className="text-sm text-muted">Paid</span>
                      <span className="font-bold" style={{ color: 'var(--success)' }}>${(plan.deposit + paidAmount).toLocaleString()}</span>
                    </div>
                    <div className="flex-col" style={{ textAlign: 'center' }}>
                      <span className="text-sm text-muted">Progress</span>
                      <span className="font-bold">{Math.round(progress)}%</span>
                    </div>
                    {overdueCount > 0 && (
                      <span className="badge badge-danger">{overdueCount} Overdue</span>
                    )}
                    <button className="btn btn-secondary" onClick={() => navigate(`/clients/${plan.client.id}`)}>
                      <Eye size={16} /> Details
                    </button>
                  </div>
                </div>
                <div className="progress-bar-container mt-4">
                  <div className="progress-bar" style={{ width: `${progress}%` }} />
                </div>
                <div className="flex justify-between mt-2">
                  <span className="text-sm text-muted">{plan.frequency} • {paidCount}/{plan.installments.length} paid</span>
                  <span className="text-sm text-muted">{new Date(plan.startDate).toLocaleDateString()} → {new Date(plan.endDate).toLocaleDateString()}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Plan Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal modal-lg glass-panel" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="text-h3">Create Payment Plan</h2>
              <button className="btn-icon" onClick={() => setShowModal(false)}><X size={20} /></button>
            </div>
            {error && <div className="login-error">{error}</div>}
            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Client *</label>
                  <select className="input" value={formData.clientId} onChange={(e) => setFormData({ ...formData, clientId: e.target.value })} required>
                    <option value="">Select a client</option>
                    {clients.map((c) => <option key={c.id} value={c.id}>{c.name} ({c.email})</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Department/Unit *</label>
                  <select className="input" value={formData.departmentId} onChange={(e) => handleDeptChange(e.target.value)} required>
                    <option value="">Select available unit</option>
                    {departments.map((d) => <option key={d.id} value={d.id}>{d.code} - ${d.price.toLocaleString()}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Total Amount ($) *</label>
                  <input className="input" type="number" step="0.01" value={formData.totalAmount} onChange={(e) => setFormData({ ...formData, totalAmount: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Deposit ($) *</label>
                  <input className="input" type="number" step="0.01" placeholder="Down payment" value={formData.deposit} onChange={(e) => setFormData({ ...formData, deposit: e.target.value })} required />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Start Date *</label>
                  <input className="input" type="date" value={formData.startDate} onChange={(e) => setFormData({ ...formData, startDate: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label className="form-label">End Date *</label>
                  <input className="input" type="date" value={formData.endDate} onChange={(e) => setFormData({ ...formData, endDate: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Frequency *</label>
                  <select className="input" value={formData.frequency} onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}>
                    <option value="MONTHLY">Monthly</option>
                    <option value="QUARTERLY">Quarterly</option>
                  </select>
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? <><Loader2 size={16} className="spin" /> Creating...</> : 'Create Plan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentPlansList;
