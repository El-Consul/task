import { useState, useEffect } from 'react';
import { paymentsApi, notificationsApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { DollarSign, Loader2, X, CheckCircle, Search, Calendar, Filter } from 'lucide-react';

interface Installment {
  id: string;
  amount: number;
  dueDate: string;
  status: string;
  type: string;
  paymentPlan: {
    client: { name: string; unitCode?: string; groupId?: number };
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
      client: { name: string; unitCode?: string; groupId?: number };
    };
  };
}

const PaymentsPage = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [pendingInstallments, setPendingInstallments] = useState<Installment[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'pending' | 'history'>('pending');
  const [showModal, setShowModal] = useState(false);
  const [selectedInstallment, setSelectedInstallment] = useState<Installment | null>(null);
  const [reference, setReference] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  // Filters
  const [filterMonth, setFilterMonth] = useState<number>(new Date().getMonth() + 1);
  const [filterYear, setFilterYear] = useState<number>(new Date().getFullYear());
  const [search, setSearch] = useState('');

  const { user } = useAuth();
  const canManage = user?.role === 'ADMIN' || user?.permissions?.includes('PAYMENTS_MANAGE');

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

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'MAINTENANCE': return <span className="badge badge-warning">Maintenance</span>;
      case 'DELIVERY': return <span className="badge badge-info">Delivery</span>;
      case 'FINAL': return <span className="badge badge-primary">Final</span>;
      default: return <span className="badge badge-secondary">Regular</span>;
    }
  };

  // Filtering Logic
  const filteredPending = pendingInstallments.filter((inst) => {
    const d = new Date(inst.dueDate);
    const matchesDate = d.getMonth() + 1 === filterMonth && d.getFullYear() === filterYear;
    const matchesSearch = inst.paymentPlan.client.name.toLowerCase().includes(search.toLowerCase()) || 
                          (inst.paymentPlan.client.unitCode && inst.paymentPlan.client.unitCode.toLowerCase().includes(search.toLowerCase()));
    
    // We only apply month/year filter if user hasn't explicitly searched for a specific client name
    return search ? matchesSearch : matchesDate;
  });

  // Calculate Totals
  const group1Total = filteredPending.filter(i => i.paymentPlan.client.groupId === 1).reduce((sum, i) => sum + i.amount, 0);
  const group2Total = filteredPending.filter(i => i.paymentPlan.client.groupId === 2).reduce((sum, i) => sum + i.amount, 0);
  const noGroupTotal = filteredPending.filter(i => !i.paymentPlan.client.groupId).reduce((sum, i) => sum + i.amount, 0);
  const grandTotal = group1Total + group2Total + noGroupTotal;

  return (
    <div className="flex-col gap-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-h2">Monthly Payments & Installments</h1>
          <p className="text-muted mt-2">Track expected installments and view payment history</p>
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

      {/* Filters (only for pending) */}
      {tab === 'pending' && (
        <div className="card glass-panel p-4 flex flex-wrap gap-4 items-end">
          <div className="form-group mb-0 flex-1 min-w-[200px]">
            <label className="form-label text-sm">Search Client / Unit</label>
            <div className="search-bar" style={{ margin: 0 }}>
              <Search size={18} className="search-icon" />
              <input type="text" className="input w-full" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: '2.5rem' }} />
            </div>
          </div>
          <div className="form-group mb-0 w-[150px]">
            <label className="form-label text-sm">Month</label>
            <select className="input" value={filterMonth} onChange={e => setFilterMonth(Number(e.target.value))} disabled={!!search}>
              {Array.from({length: 12}).map((_, i) => <option key={i+1} value={i+1}>{new Date(2000, i, 1).toLocaleString('default', { month: 'long' })}</option>)}
            </select>
          </div>
          <div className="form-group mb-0 w-[120px]">
            <label className="form-label text-sm">Year</label>
            <input type="number" className="input" value={filterYear} onChange={e => setFilterYear(Number(e.target.value))} disabled={!!search} />
          </div>
        </div>
      )}

      {/* Totals Summary */}
      {tab === 'pending' && !loading && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="card glass-panel flex-col items-center justify-center text-center p-4">
            <span className="text-muted text-sm uppercase tracking-wider">Group 1 Expected</span>
            <span className="text-2xl font-bold text-primary mt-1">{group1Total.toLocaleString()} EGP</span>
          </div>
          <div className="card glass-panel flex-col items-center justify-center text-center p-4">
            <span className="text-muted text-sm uppercase tracking-wider">Group 2 Expected</span>
            <span className="text-2xl font-bold text-warning mt-1">{group2Total.toLocaleString()} EGP</span>
          </div>
          <div className="card glass-panel flex-col items-center justify-center text-center p-4">
            <span className="text-muted text-sm uppercase tracking-wider">Other / Uncategorized</span>
            <span className="text-2xl font-bold mt-1">{noGroupTotal.toLocaleString()} EGP</span>
          </div>
          <div className="card glass-panel flex-col items-center justify-center text-center p-4 border border-accent-primary/20 bg-accent-primary/5">
            <span className="text-accent-primary text-sm uppercase tracking-wider font-bold">Total Expected</span>
            <span className="text-3xl font-bold text-accent-primary mt-1">{grandTotal.toLocaleString()} EGP</span>
          </div>
        </div>
      )}

      {loading ? (
        <div className="loading-state"><Loader2 size={32} className="spin" /><p className="text-muted">Loading...</p></div>
      ) : tab === 'pending' ? (
        filteredPending.length === 0 ? (
          <div className="empty-state glass-panel">
            <CheckCircle size={48} style={{ color: 'var(--success)' }} />
            <h3>No pending installments found</h3>
            <p className="text-muted">Try changing the filters or month.</p>
          </div>
        ) : (
          <div className="table-container glass-panel">
            <table>
              <thead>
                <tr>
                  <th>Client</th>
                  <th>Unit Code</th>
                  <th>Group</th>
                  <th>Type</th>
                  <th>Due Date</th>
                  <th>Amount (EGP)</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredPending.map((inst) => {
                  const isOverdue = new Date(inst.dueDate) < new Date();
                  return (
                    <tr key={inst.id} className={isOverdue ? 'bg-danger/5' : ''}>
                      <td className="font-medium">{inst.paymentPlan.client.name}</td>
                      <td>{inst.paymentPlan.client.unitCode || '—'}</td>
                      <td>
                        {inst.paymentPlan.client.groupId ? (
                          <span className={`badge ${inst.paymentPlan.client.groupId === 1 ? 'badge-primary' : 'badge-warning'}`}>Group {inst.paymentPlan.client.groupId}</span>
                        ) : '—'}
                      </td>
                      <td>{getTypeBadge(inst.type)}</td>
                      <td className={isOverdue ? 'text-danger font-medium' : 'text-muted'}>
                        {new Date(inst.dueDate).toLocaleDateString()}
                        {isOverdue && <span className="badge badge-danger ml-2" style={{ marginLeft: '0.5rem' }}>Overdue</span>}
                      </td>
                      <td className="font-bold text-lg">{inst.amount.toLocaleString()}</td>
                      <td>
                        {canManage && (
                          <button className="btn btn-primary btn-sm" onClick={() => openPayment(inst)}>
                            <DollarSign size={14} /> Record Payment
                          </button>
                        )}
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
                  <th>Unit Code</th>
                  <th>Amount (EGP)</th>
                  <th>Reference</th>
                  <th>Payment Date</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p) => (
                  <tr key={p.id}>
                    <td className="font-medium">{p.installment.paymentPlan.client.name}</td>
                    <td>{p.installment.paymentPlan.client.unitCode || '—'}</td>
                    <td className="font-bold" style={{ color: 'var(--success)' }}>{p.amount.toLocaleString()}</td>
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
                <span className="font-medium">{selectedInstallment.paymentPlan.client.unitCode || '—'}</span>
              </div>
              <div className="flex justify-between mt-2">
                <span className="text-muted">Type</span>
                <span>{getTypeBadge(selectedInstallment.type)}</span>
              </div>
              <div className="flex justify-between mt-2">
                <span className="text-muted">Due Date</span>
                <span className="font-medium">{new Date(selectedInstallment.dueDate).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between mt-2" style={{ paddingTop: '0.5rem', borderTop: '1px solid var(--border-color)' }}>
                <span className="font-bold">Amount</span>
                <span className="font-bold text-accent-primary text-xl">{selectedInstallment.amount.toLocaleString()} EGP</span>
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
                  {submitting ? <><Loader2 size={16} className="spin" /> Processing...</> : `Confirm Payment`}
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
