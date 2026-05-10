import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { paymentsApi, notificationsApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { translations } from '../translations';
import { DollarSign, Loader2, X, CheckCircle, Search, Eye, Upload } from 'lucide-react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

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
  const [tab, setTab] = useState<'pending' | 'assessments' | 'history'>('pending');
  const [showModal, setShowModal] = useState(false);
  const [selectedInstallment, setSelectedInstallment] = useState<Installment | null>(null);
  const [reference, setReference] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [receiptUrl, setReceiptUrl] = useState('');
  
  // Filters
  const [filterMonth, setFilterMonth] = useState<number>(new Date().getMonth() + 1);
  const [filterYear, setFilterYear] = useState<number>(new Date().getFullYear());
  const [search, setSearch] = useState('');

  const { user } = useAuth();
  const location = useLocation();
  const lang = localStorage.getItem('lang') || 'en';
  const t = translations[lang] || translations.en;
  const canManage = user?.role === 'ADMIN' || user?.permissions?.includes('PAYMENTS_MANAGE');

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const searchParam = params.get('search');
    if (searchParam) setSearch(searchParam);
  }, [location]);

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
        receiptUrl: receiptUrl || undefined,
      });
      setShowModal(false);
      setSelectedInstallment(null);
      setReference('');
      setReceiptUrl('');
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
    setReceiptUrl('');
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'MAINTENANCE': return <span className="badge badge-warning">Maintenance</span>;
      case 'DELIVERY': return <span className="badge badge-info">Delivery</span>;
      case 'FINAL': return <span className="badge badge-primary">Final</span>;
      case 'ASSESSMENT': return <span className="badge badge-accent-primary">Assessment (مقايسة)</span>;
      default: return <span className="badge badge-secondary">Regular</span>;
    }
  };

  // Filtering Logic
  const filteredData = (tab === 'pending' ? pendingInstallments.filter(i => i.type !== 'ASSESSMENT') : 
                        tab === 'assessments' ? pendingInstallments.filter(i => i.type === 'ASSESSMENT') : 
                        []).filter((inst) => {
    const d = new Date(inst.dueDate);
    const matchesDate = d.getMonth() + 1 === filterMonth && d.getFullYear() === filterYear;
    const matchesSearch = inst.paymentPlan.client.name.toLowerCase().includes(search.toLowerCase()) || 
                          (inst.paymentPlan.client.unitCode && inst.paymentPlan.client.unitCode.toLowerCase().includes(search.toLowerCase()));
    
    return search ? matchesSearch : matchesDate;
  });

  // Calculate Totals
  const grandTotal = pendingInstallments.reduce((sum, i) => sum + i.amount, 0);
  const maintenanceTotal = pendingInstallments.filter(i => i.type === 'MAINTENANCE').reduce((sum, i) => sum + i.amount, 0);
  const assessmentTotal = pendingInstallments.filter(i => i.type === 'ASSESSMENT').reduce((sum, i) => sum + i.amount, 0);
  const regularTotal = pendingInstallments.filter(i => i.type === 'REGULAR').reduce((sum, i) => sum + i.amount, 0);
  const deliveryTotal = pendingInstallments.filter(i => i.type === 'DELIVERY' || i.type === 'FINAL').reduce((sum, i) => sum + i.amount, 0);

  return (
    <div className="flex-col gap-6" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-h2">{t.payments}</h1>
          <p className="text-muted mt-2">Track expected installments and view payment history</p>
        </div>
      </div>

      <div className="tabs">
        <button className={`tab ${tab === 'pending' ? 'tab-active' : ''}`} onClick={() => setTab('pending')}>
          {lang === 'ar' ? 'الأقساط المستحقة' : 'Pending Installments'} ({pendingInstallments.filter(i => i.type !== 'ASSESSMENT').length})
        </button>
        <button className={`tab ${tab === 'assessments' ? 'tab-active' : ''}`} onClick={() => setTab('assessments')}>
          {t.assessments} ({pendingInstallments.filter(i => i.type === 'ASSESSMENT').length})
        </button>
        <button className={`tab ${tab === 'history' ? 'tab-active' : ''}`} onClick={() => setTab('history')}>
          {lang === 'ar' ? 'سجل المدفوعات' : 'Payment History'} ({payments.length})
        </button>
      </div>

      {/* Filters (only for pending/assessments) */}
      {(tab === 'pending' || tab === 'assessments') && (
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
      {(tab === 'pending' || tab === 'assessments') && !loading && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="card glass-panel stat-card-dash p-4" style={{ '--stat-color': 'var(--accent-primary)' } as any}>
            <span className="text-muted text-xs uppercase tracking-wider font-bold">{lang === 'ar' ? 'أقساط عادية' : 'Regular Installments'}</span>
            <div className="flex justify-between items-end mt-2">
              <span className="text-xl font-bold text-accent-primary">{regularTotal.toLocaleString()}</span>
              <span className="text-[10px] text-muted mb-1 ml-1">EGP</span>
            </div>
          </div>
          <div className="card glass-panel stat-card-dash p-4" style={{ '--stat-color': 'var(--warning)' } as any}>
            <span className="text-muted text-xs uppercase tracking-wider font-bold">{lang === 'ar' ? 'صيانة' : 'Maintenance'}</span>
            <div className="flex justify-between items-end mt-2">
              <span className="text-xl font-bold text-warning">{maintenanceTotal.toLocaleString()}</span>
              <span className="text-[10px] text-muted mb-1 ml-1">EGP</span>
            </div>
          </div>
          <div className="card glass-panel stat-card-dash p-4" style={{ '--stat-color': 'var(--accent-primary)' } as any}>
            <span className="text-muted text-xs uppercase tracking-wider font-bold">{lang === 'ar' ? 'مقايسات' : 'Assessments'}</span>
            <div className="flex justify-between items-end mt-2">
              <span className="text-xl font-bold text-accent-primary" style={{ color: '#00d2ff' }}>{assessmentTotal.toLocaleString()}</span>
              <span className="text-[10px] text-muted mb-1 ml-1">EGP</span>
            </div>
          </div>
          <div className="card glass-panel stat-card-dash p-4" style={{ '--stat-color': 'var(--info)' } as any}>
            <span className="text-muted text-xs uppercase tracking-wider font-bold">{lang === 'ar' ? 'استلام / ختامي' : 'Delivery / Final'}</span>
            <div className="flex justify-between items-end mt-2">
              <span className="text-xl font-bold text-info">{deliveryTotal.toLocaleString()}</span>
              <span className="text-[10px] text-muted mb-1 ml-1">EGP</span>
            </div>
          </div>
          <div className="card glass-panel stat-card-dash p-4 bg-accent-primary/5 border-accent-primary/20" style={{ '--stat-color': 'var(--accent-primary)' } as any}>
            <span className="text-accent-primary text-xs uppercase tracking-wider font-bold">{lang === 'ar' ? 'إجمالي المستحق' : 'Total Due'}</span>
            <div className="flex justify-between items-end mt-2">
              <span className="text-2xl font-black text-accent-primary">{grandTotal.toLocaleString()}</span>
              <span className="text-[10px] text-accent-primary/60 mb-1 ml-1 font-bold">EGP</span>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="loading-state"><Loader2 size={32} className="spin" /><p className="text-muted">Loading...</p></div>
      ) : (tab === 'pending' || tab === 'assessments') ? (
        filteredData.length === 0 ? (
          <div className="empty-state glass-panel">
            <CheckCircle size={48} style={{ color: 'var(--success)' }} />
            <h3>No pending {tab === 'assessments' ? 'assessments' : 'installments'} found</h3>
            <p className="text-muted">Try changing the filters or month.</p>
          </div>
        ) : (
          <div className="table-container glass-panel">
            <table>
              <thead>
                <tr>
                  <th>Client</th>
                  <th>Unit Code</th>
                  <th>Type</th>
                  <th>Due Date</th>
                  <th>Amount (EGP)</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((inst) => {
                  const isOverdue = new Date(inst.dueDate) < new Date();
                  return (
                    <tr key={inst.id} className={isOverdue ? 'bg-danger/5' : ''}>
                      <td className="font-medium">{inst.paymentPlan.client.name}</td>
                      <td>{inst.paymentPlan.client.unitCode || '—'}</td>
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
                  <th>{lang === 'ar' ? 'رقم الوصل' : 'Receipt #'}</th>
                  <th>Client</th>
                  <th>Unit Code</th>
                  <th>Amount (EGP)</th>
                  <th>Ref</th>
                  <th>Payment Date</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p: any) => (
                  <tr key={p.id}>
                    <td className="font-bold text-accent-primary">#{p.receiptNumber || '—'}</td>
                    <td className="font-medium">{p.installment.paymentPlan.client.name}</td>
                    <td>{p.installment.paymentPlan.client.unitCode || '—'}</td>
                    <td className="font-bold" style={{ color: 'var(--success)' }}>{p.amount.toLocaleString()}</td>
                    <td className="text-muted">{p.reference || '—'}</td>
                    <td className="text-muted">{new Date(p.paymentDate).toLocaleDateString()}</td>
                    <td>
                      {p.receiptUrl && (
                        <a href={`${API_URL.replace('/api', '')}${p.receiptUrl}`} target="_blank" rel="noreferrer" className="btn btn-secondary btn-sm">
                          <Eye size={14} /> Receipt
                        </a>
                      )}
                    </td>
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
            <div className="payment-summary glass-panel" style={{ padding: '1.25rem', margin: '0 0 1.5rem', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div className="flex justify-between items-center mb-3">
                <span className="text-muted text-xs uppercase tracking-wider font-bold">{lang === 'ar' ? 'العميل' : 'Client'}</span>
                <span className="font-bold text-sm">{selectedInstallment.paymentPlan.client.name}</span>
              </div>
              <div className="flex justify-between items-center mb-3">
                <span className="text-muted text-xs uppercase tracking-wider font-bold">{lang === 'ar' ? 'الوحدة' : 'Unit'}</span>
                <span className="font-bold text-sm">{selectedInstallment.paymentPlan.client.unitCode || '—'}</span>
              </div>
              <div className="flex justify-between items-center mb-4">
                <span className="text-muted text-xs uppercase tracking-wider font-bold">{lang === 'ar' ? 'المبلغ المطلوب' : 'Due Amount'}</span>
                <span className="font-bold text-accent-primary text-xl">{selectedInstallment.amount.toLocaleString()} EGP</span>
              </div>
              <div className="h-[1px] bg-white/5 mb-4" />
              <div className="flex justify-between items-center text-xs text-muted">
                <span>{lang === 'ar' ? 'تاريخ الاستحقاق' : 'Due Date'}</span>
                <span>{new Date(selectedInstallment.dueDate).toLocaleDateString()}</span>
              </div>
            </div>
            <form onSubmit={handlePay} className="modal-form">
              <div className="form-group">
                <label className="form-label">{lang === 'ar' ? 'رقم الإيصال / المرجع' : 'Reference / Receipt #'}</label>
                <input className="input" placeholder={lang === 'ar' ? 'اختياري...' : 'Optional...'} value={reference} onChange={(e) => setReference(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">{lang === 'ar' ? 'إرفاق الإيصال (اختياري)' : 'Upload Receipt (Optional)'}</label>
                <div 
                  className="file-upload-zone"
                  onClick={() => document.getElementById('receipt-upload-input')?.click()}
                >
                  <div className="file-upload-zone-icon">
                    <Upload size={20} />
                  </div>
                  <p className="text-sm font-medium">{lang === 'ar' ? 'اضغط لرفع الإيصال' : 'Click to upload receipt'}</p>
                  <p className="text-xs text-muted mt-1">JPG, PNG or PDF (Max 5MB)</p>
                  
                  <input 
                    id="receipt-upload-input"
                    type="file" 
                    className="hidden" 
                    style={{ display: 'none' }}
                    accept=".jpg,.jpeg,.png,.pdf" 
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      
                      const formData = new FormData();
                      formData.append('file', file);
                      
                      try {
                        setSubmitting(true);
                        const token = localStorage.getItem('token');
                        const res = await axios.post(`${API_URL}/uploads/receipt`, formData, {
                          headers: { 
                            'Content-Type': 'multipart/form-data',
                            'Authorization': `Bearer ${token}`
                          }
                        });
                        setReceiptUrl(res.data.url);
                      } catch (err) {
                        console.error('Upload failed', err);
                        setError('File upload failed');
                      } finally {
                        setSubmitting(false);
                      }
                    }} 
                  />
                </div>
                {receiptUrl && (
                  <div className="flex items-center gap-2 mt-2 p-2 bg-success/10 rounded-lg border border-success/20">
                    <CheckCircle size={14} className="text-success" />
                    <span className="text-xs text-success font-medium">{lang === 'ar' ? 'تم رفع الإيصال بنجاح!' : 'Receipt uploaded successfully!'}</span>
                  </div>
                )}
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>{lang === 'ar' ? 'إلغاء' : 'Cancel'}</button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? <><Loader2 size={16} className="spin" /> {lang === 'ar' ? 'جاري التنفيذ...' : 'Processing...'}</> : (lang === 'ar' ? 'تأكيد الدفع' : 'Confirm Payment')}
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
