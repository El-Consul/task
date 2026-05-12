import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { clientsApi, paymentPlansApi } from '../services/api';
import { ArrowLeft, User, Mail, Phone, CreditCard, Calendar, Loader2, Home, Hash, Map, DollarSign, X, CheckCircle, Upload } from 'lucide-react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

interface ClientDetail {
  id: number;
  name: string;
  phone: string;
  unitNumber?: string;
  unitCode?: string;
  unitArea?: number;
  groupId?: number;
  email?: string;
  idNumber?: string;
  createdAt: string;
  agent?: { id: string; name: string; email: string; role: string };
  paymentPlans?: {
    id: string;
    unitPrice: number;
    deposit: number;
    remainingAmount: number;
    assessmentAmount?: number;
    measurements?: number;
    deposit10Percent?: number;
    contractDate: string;
    installments: { id: string; amount: number; dueDate: string; status: string; type: string }[];
  }[];
}

const ClientDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [client, setClient] = useState<ClientDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedInstallment, setSelectedInstallment] = useState<any>(null);
  const [reference, setReference] = useState('');
  const [receiptUrl, setReceiptUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [showAssessmentModal, setShowAssessmentModal] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [assessmentForm, setAssessmentForm] = useState({ amount: 0, dueDate: new Date().toISOString().split('T')[0] });

  const lang = localStorage.getItem('lang') || 'en';

  const fetchClient = () => {
    if (id) {
      setLoading(true);
      clientsApi.getOne(id).then((res) => {
        setClient(res.data);
        setLoading(false);
      }).catch(() => setLoading(false));
    }
  };

  useEffect(() => {
    fetchClient();
  }, [id]);

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInstallment) return;
    setSubmitting(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_URL}/payments`, {
        installmentId: selectedInstallment.id,
        amount: selectedInstallment.amount,
        reference: reference || undefined,
        receiptUrl: receiptUrl || undefined,
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setShowModal(false);
      setSelectedInstallment(null);
      setReference('');
      setReceiptUrl('');
      fetchClient();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Payment failed');
    } finally {
      setSubmitting(false);
    }
  };

  const openPayment = (inst: any) => {
    setSelectedInstallment(inst);
    setShowModal(true);
    setError('');
    setReference('');
    setReceiptUrl('');
  };

  const openAssessment = (planId: string) => {
    setSelectedPlanId(planId);
    setShowAssessmentModal(true);
    setError('');
  };

  const handleAddAssessment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlanId) return;
    setSubmitting(true);
    setError('');
    try {
      await paymentPlansApi.addInstallment(selectedPlanId, {
        ...assessmentForm,
        type: 'ASSESSMENT',
      });
      setShowAssessmentModal(false);
      setAssessmentForm({ amount: 0, dueDate: new Date().toISOString().split('T')[0] });
      fetchClient();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to add assessment');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-state">
        <Loader2 size={32} className="spin" />
        <p className="text-muted">Loading client details...</p>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="empty-state glass-panel">
        <h3>Client not found</h3>
        <button className="btn btn-primary" onClick={() => navigate('/clients')}>Back to Clients</button>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PAID': return 'badge-success';
      case 'OVERDUE': return 'badge-danger';
      default: return 'badge-warning';
    }
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

  return (
    <div className="flex-col gap-6" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <button className="btn btn-secondary" onClick={() => navigate('/clients')} style={{ alignSelf: 'flex-start' }}>
        <ArrowLeft size={18} /> {lang === 'ar' ? 'العودة للعملاء' : 'Back to Clients'}
      </button>

      <div className="grid grid-cols-3 gap-6">
        {/* Client Info Card */}
        <div className="card glass-panel">
          <div className="flex-col gap-4">
            <div className="avatar-lg">{client.name.charAt(0)}</div>
            <h2 className="text-h3">#{client.id} - {client.name}</h2>
            <div className="flex-col gap-2 mt-2">
              <div className="flex items-center gap-2 text-muted">
                <Phone size={16} /> {client.phone}
              </div>
              {client.email && (
                <div className="flex items-center gap-2 text-muted">
                  <Mail size={16} /> {client.email}
                </div>
              )}
              {client.unitCode && (
                <div className="flex items-center gap-2 text-muted">
                  <Hash size={16} /> Unit Code: {client.unitCode}
                </div>
              )}
              {client.unitNumber && (
                <div className="flex items-center gap-2 text-muted">
                  <Home size={16} /> {client.unitNumber}
                </div>
              )}
              {client.unitArea && (
                <div className="flex items-center gap-2 text-muted">
                  <Map size={16} /> {client.unitArea} m²
                </div>
              )}
              {client.idNumber && (
                <div className="flex items-center gap-2 text-muted">
                  <User size={16} /> ID: {client.idNumber}
                </div>
              )}
              <div className="flex items-center gap-2 text-muted">
                <Calendar size={16} /> Joined: {new Date(client.createdAt).toLocaleDateString()}
              </div>
            </div>
            {client.agent && (
              <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
                <span className="text-sm text-muted">Assigned Agent</span>
                <p className="font-medium">{client.agent.name}</p>
              </div>
            )}
          </div>
        </div>

        {/* Payment Plans */}
        <div className="card glass-panel" style={{ gridColumn: 'span 2' }}>
          <h3 className="text-h3 mb-4 flex items-center gap-2">
            <CreditCard size={20} />
            {lang === 'ar' ? 'أنظمة الدفع' : 'Payment Plans'} ({client.paymentPlans?.length || 0})
          </h3>
          {!client.paymentPlans?.length ? (
            <div className="empty-state-sm">
              <p className="text-muted">{lang === 'ar' ? 'لا يوجد أنظمة دفع' : 'No payment plans yet'}</p>
              <button className="btn btn-primary mt-2" onClick={() => navigate('/payment-plans/new')}>
                {lang === 'ar' ? 'إنشاء نظام دفع' : 'Create Payment Plan'}
              </button>
            </div>
          ) : (
            <div className="flex-col gap-4">
              {client.paymentPlans.map((plan) => {
                const paidCount = plan.installments.filter((i) => i.status === 'PAID').length;
                const progress = plan.installments.length > 0 ? (paidCount / plan.installments.length) * 100 : 0;
                return (
                  <div key={plan.id} className="plan-card">
                    <div className="flex justify-between items-center mb-4">
                      <div>
                        <h4 className="font-medium text-lg">{lang === 'ar' ? 'تاريخ التعاقد' : 'Contract Date'}: {new Date(plan.contractDate).toLocaleDateString()}</h4>
                        <span className="text-sm text-muted">{plan.installments.length} {lang === 'ar' ? 'قسط' : 'installments'}</span>
                      </div>
                      <div className="flex flex-col items-end">
                        <p className="font-bold text-accent-primary text-xl">{plan.unitPrice.toLocaleString()} EGP</p>
                        <span className="text-sm text-muted block">{lang === 'ar' ? 'المقدم' : 'Deposit'}: {plan.deposit.toLocaleString()} EGP</span>
                        <span className="text-sm text-muted block">{lang === 'ar' ? 'المتبقي' : 'Remaining'}: {plan.remainingAmount.toLocaleString()} EGP</span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center mb-4 gap-4">
                      <div className="grid grid-cols-2 gap-4 text-sm bg-black/20 p-3 rounded-lg border border-white/5 flex-1">
                        {plan.assessmentAmount ? <div><span className="text-muted">{lang === 'ar' ? 'إجمالي المقايسات' : 'Assessments'}:</span> {plan.assessmentAmount.toLocaleString()} EGP</div> : null}
                        {plan.measurements ? <div><span className="text-muted">{lang === 'ar' ? 'مبلغ المعاينة' : 'Measurements'}:</span> {plan.measurements.toLocaleString()} EGP</div> : null}
                        {plan.deposit10Percent ? <div><span className="text-muted">{lang === 'ar' ? 'وديعة صيانة' : '10% Maintenance'}:</span> {plan.deposit10Percent.toLocaleString()} EGP</div> : null}
                      </div>
                      <button className="btn btn-accent-primary btn-sm" onClick={() => openAssessment(plan.id)}>
                        + {lang === 'ar' ? 'إضافة مقايسة' : 'Add Assessment'}
                      </button>
                    </div>

                    <div className="progress-bar-container">
                      <div className="progress-bar" style={{ width: `${progress}%` }} />
                    </div>
                    <span className="text-sm text-muted mt-2 block mb-4">{paidCount}/{plan.installments.length} installments paid ({Math.round(progress)}%)</span>

                    {/* Installments Table */}
                    <div className="table-container" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                      <table>
                        <thead style={{ position: 'sticky', top: 0, background: 'var(--bg-secondary)', zIndex: 1 }}>
                          <tr>
                            <th>#</th>
                            <th>Type</th>
                            <th>Due Date</th>
                            <th>Amount (EGP)</th>
                            <th>Status</th>
                            <th>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {plan.installments.map((inst: any, idx: number) => (
                            <tr key={inst.id}>
                              <td className="text-muted">{idx + 1}</td>
                              <td>{getTypeBadge(inst.type)}</td>
                              <td>{new Date(inst.dueDate).toLocaleDateString()}</td>
                              <td className="font-medium">{inst.amount.toLocaleString()}</td>
                              <td><span className={`badge ${getStatusColor(inst.status)}`}>{inst.status}</span></td>
                              <td>
                                {inst.status !== 'PAID' && (
                                  <button className="btn btn-primary btn-sm" onClick={() => openPayment(inst)}>
                                    <DollarSign size={14} /> {lang === 'ar' ? 'دفع' : 'Pay'}
                                  </button>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Pay Modal */}
      {showModal && selectedInstallment && (
        <div className="modal-overlay" onClick={() => setShowModal(false)} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
          <div className="modal glass-panel" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="text-h3">{lang === 'ar' ? 'تسجيل دفعة' : 'Record Payment'}</h2>
              <button className="btn-icon" onClick={() => setShowModal(false)}><X size={20} /></button>
            </div>
            {error && <div className="login-error">{error}</div>}
            
            <div className="payment-summary glass-panel" style={{ padding: '1.25rem', margin: '0 0 1.5rem', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div className="flex justify-between items-center mb-3">
                <span className="text-muted text-xs uppercase tracking-wider font-bold">{lang === 'ar' ? 'العميل' : 'Client'}</span>
                <span className="font-bold text-sm">{client.name}</span>
              </div>
              <div className="flex justify-between items-center mb-4">
                <span className="text-muted text-xs uppercase tracking-wider font-bold">{lang === 'ar' ? 'المبلغ' : 'Amount'}</span>
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
                <label className="form-label">{lang === 'ar' ? 'رقم المرجع' : 'Reference'}</label>
                <input className="input" placeholder="Optional..." value={reference} onChange={(e) => setReference(e.target.value)} />
              </div>

              <div className="form-group">
                <label className="form-label">{lang === 'ar' ? 'إرفاق الإيصال' : 'Upload Receipt'}</label>
                <div className="file-upload-zone" onClick={() => document.getElementById('receipt-upload-input-cd')?.click()}>
                  <div className="file-upload-zone-icon"><Upload size={20} /></div>
                  <p className="text-sm font-medium">{lang === 'ar' ? 'اضغط للرفع' : 'Click to upload'}</p>
                  <input 
                    id="receipt-upload-input-cd"
                    type="file" 
                    className="hidden" 
                    style={{ display: 'none' }}
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const formData = new FormData();
                      formData.append('file', file);
                      try {
                        setSubmitting(true);
                        const token = localStorage.getItem('token');
                        const res = await axios.post(`${API_URL}/uploads/receipt`, formData, {
                          headers: { 'Content-Type': 'multipart/form-data', 'Authorization': `Bearer ${token}` }
                        });
                        setReceiptUrl(res.data.url);
                      } catch (err) { setError('Upload failed'); } finally { setSubmitting(false); }
                    }} 
                  />
                </div>
                {receiptUrl && (
                  <div className="flex items-center gap-2 mt-2 p-2 bg-success/10 rounded-lg border border-success/20">
                    <CheckCircle size={14} className="text-success" />
                    <span className="text-xs text-success font-medium">Done!</span>
                  </div>
                )}
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>{lang === 'ar' ? 'إلغاء' : 'Cancel'}</button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? <Loader2 size={16} className="spin" /> : (lang === 'ar' ? 'تأكيد' : 'Confirm')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Assessment Modal */}
      {showAssessmentModal && (
        <div className="modal-overlay" onClick={() => setShowAssessmentModal(false)} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
          <div className="modal glass-panel" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="text-h3">{lang === 'ar' ? 'إضافة مقايسة جديدة' : 'Add New Assessment'}</h2>
              <button className="btn-icon" onClick={() => setShowAssessmentModal(false)}><X size={20} /></button>
            </div>
            {error && <div className="login-error">{error}</div>}

            <form onSubmit={handleAddAssessment} className="modal-form">
              <div className="form-group">
                <label className="form-label">{lang === 'ar' ? 'المبلغ' : 'Amount'} *</label>
                <input type="number" className="input" value={assessmentForm.amount} onChange={e => setAssessmentForm({ ...assessmentForm, amount: Number(e.target.value) })} required />
              </div>
              <div className="form-group">
                <label className="form-label">{lang === 'ar' ? 'تاريخ الاستحقاق' : 'Due Date'} *</label>
                <input type="date" className="input" value={assessmentForm.dueDate} onChange={e => setAssessmentForm({ ...assessmentForm, dueDate: e.target.value })} required />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowAssessmentModal(false)}>{lang === 'ar' ? 'إلغاء' : 'Cancel'}</button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? <Loader2 size={16} className="spin" /> : (lang === 'ar' ? 'إضافة' : 'Add')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientDetail;
