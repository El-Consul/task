import { useState, useEffect } from 'react';
import { paymentsApi, notificationsApi } from '../services/api';
import { DollarSign, Loader2, X, CheckCircle } from 'lucide-react';

interface Installment {
  id: string;
  amount: number;
  dueDate: string;
  status: string;
  paymentPlan: {
    client: { name: string; email: string };
    department: { code: string };
  };
}

interface Payment {
  id: string;
  amount: number;
  paymentDate: string;
  receiptUrl?: string;
  reference?: string;
  installment: {
    dueDate: string;
    paymentPlan: {
      client: { name: string };
      department: { code: string };
    };
  };
}

const PaymentsPage = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [pendingInstallments, setPendingInstallments] = useState<Installment[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'history' | 'pending'>('pending');
  const [showModal, setShowModal] = useState(false);
  const [selectedInstallment, setSelectedInstallment] = useState<Installment | null>(null);
  const [reference, setReference] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const fetchData = async () => {
    try {
      const [paymentsRes, installmentsRes] = await Promise.all([
        paymentsApi.getAll(),
        notificationsApi.getInstallments('PENDING'),
      ]);
      setPayments(paymentsRes.data);
      setPendingInstallments(installmentsRes.data);
    } catch (err) {
      console.error('Failed to fetch data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInstallment) return;
    setSubmitting(true);
    setError('');
    try {
      await paymentsApi.post({
        installmentId: selectedInstallment.id,
        amount: selectedInstallment.amount,
        reference: reference || undefined,
      });
      setShowModal(false);
      setSelectedInstallment(null);
      setReference('');
      fetchData();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Payment failed');
    } finally {
      setSubmitting(false);
    }
  };

  const openPayment = (inst: Installment) => {
    setSelectedInstallment(inst);
    setShowModal(true);
    setError('');
    setReference('');
  };

  return (
    <div className="flex-col gap-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-h2">Payments</h1>
          <p className="text-muted mt-2">Record and track all payment transactions</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs">
        <button className={`tab ${tab === 'pending' ? 'tab-active' : ''}`} onClick={() => setTab('pending')}>
          Pending Installments ({pendingInstallments.length})
        </button>
        <button className={`tab ${tab === 'history' ? 'tab-active' : ''}`} onClick={() => setTab('history')}>
          Payment History ({payments.length})
        </button>
      </div>

      {loading ? (
        <div className="loading-state"><Loader2 size={32} className="spin" /><p className="text-muted">Loading...</p></div>
      ) : tab === 'pending' ? (
        pendingInstallments.length === 0 ? (
          <div className="empty-state glass-panel">
            <CheckCircle size={48} style={{ color: 'var(--success)' }} />
            <h3>All caught up!</h3>
            <p className="text-muted">No pending installments at the moment</p>
          </div>
        ) : (
          <div className="table-container glass-panel">
            <table>
              <thead>
                <tr>
                  <th>Client</th>
                  <th>Unit</th>
                  <th>Due Date</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {pendingInstallments.map((inst) => {
                  const isOverdue = new Date(inst.dueDate) < new Date();
                  return (
                    <tr key={inst.id}>
                      <td className="font-medium">{inst.paymentPlan.client.name}</td>
                      <td>{inst.paymentPlan.department.code}</td>
                      <td className={isOverdue ? 'text-danger' : 'text-muted'}>
                        {new Date(inst.dueDate).toLocaleDateString()}
                        {isOverdue && <span className="badge badge-danger ml-2" style={{ marginLeft: '0.5rem' }}>Overdue</span>}
                      </td>
                      <td className="font-bold">${inst.amount.toLocaleString()}</td>
                      <td><span className={`badge ${isOverdue ? 'badge-danger' : 'badge-warning'}`}>{isOverdue ? 'OVERDUE' : inst.status}</span></td>
                      <td>
                        <button className="btn btn-primary btn-sm" onClick={() => openPayment(inst)}>
                          <DollarSign size={14} /> Record Payment
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )
      ) : (
        payments.length === 0 ? (
          <div className="empty-state glass-panel">
            <DollarSign size={48} />
            <h3>No payments recorded yet</h3>
          </div>
        ) : (
          <div className="table-container glass-panel">
            <table>
              <thead>
                <tr>
                  <th>Client</th>
                  <th>Unit</th>
                  <th>Amount</th>
                  <th>Reference</th>
                  <th>Payment Date</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p) => (
                  <tr key={p.id}>
                    <td className="font-medium">{p.installment.paymentPlan.client.name}</td>
                    <td>{p.installment.paymentPlan.department.code}</td>
                    <td className="font-bold" style={{ color: 'var(--success)' }}>${p.amount.toLocaleString()}</td>
                    <td className="text-muted">{p.reference || '—'}</td>
                    <td className="text-muted">{new Date(p.paymentDate).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}

      {/* Pay Modal */}
      {showModal && selectedInstallment && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal glass-panel" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="text-h3">Record Payment</h2>
              <button className="btn-icon" onClick={() => setShowModal(false)}><X size={20} /></button>
            </div>
            {error && <div className="login-error">{error}</div>}
            <div className="payment-summary glass-panel" style={{ padding: '1rem', margin: '0 0 1rem', backgroundColor: 'var(--bg-primary)' }}>
              <div className="flex justify-between">
                <span className="text-muted">Client</span>
                <span className="font-medium">{selectedInstallment.paymentPlan.client.name}</span>
              </div>
              <div className="flex justify-between mt-2">
                <span className="text-muted">Unit</span>
                <span className="font-medium">{selectedInstallment.paymentPlan.department.code}</span>
              </div>
              <div className="flex justify-between mt-2">
                <span className="text-muted">Due Date</span>
                <span className="font-medium">{new Date(selectedInstallment.dueDate).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between mt-2" style={{ paddingTop: '0.5rem', borderTop: '1px solid var(--border-color)' }}>
                <span className="font-bold">Amount</span>
                <span className="font-bold text-accent-primary">${selectedInstallment.amount.toLocaleString()}</span>
              </div>
            </div>
            <form onSubmit={handlePay} className="modal-form">
              <div className="form-group">
                <label className="form-label">Reference / Receipt #</label>
                <input className="input" placeholder="Optional reference number" value={reference} onChange={(e) => setReference(e.target.value)} />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? <><Loader2 size={16} className="spin" /> Processing...</> : `Pay $${selectedInstallment.amount.toLocaleString()}`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentsPage;
