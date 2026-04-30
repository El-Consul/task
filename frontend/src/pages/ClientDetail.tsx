import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { clientsApi } from '../services/api';
import { ArrowLeft, User, Mail, Phone, CreditCard, Calendar, Loader2 } from 'lucide-react';

interface ClientDetail {
  id: string;
  name: string;
  email: string;
  phone: string;
  idNumber?: string;
  createdAt: string;
  agent?: { id: string; name: string; email: string; role: string };
  paymentPlans?: {
    id: string;
    totalAmount: number;
    deposit: number;
    startDate: string;
    endDate: string;
    frequency: string;
    department: { code: string; name?: string; price: number };
    installments: { id: string; amount: number; dueDate: string; status: string }[];
  }[];
}

const ClientDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [client, setClient] = useState<ClientDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      clientsApi.getOne(id).then((res) => {
        setClient(res.data);
        setLoading(false);
      }).catch(() => setLoading(false));
    }
  }, [id]);

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

  return (
    <div className="flex-col gap-6">
      <button className="btn btn-secondary" onClick={() => navigate('/clients')} style={{ alignSelf: 'flex-start' }}>
        <ArrowLeft size={18} /> Back to Clients
      </button>

      <div className="grid grid-cols-3 gap-6">
        {/* Client Info Card */}
        <div className="card glass-panel">
          <div className="flex-col gap-4">
            <div className="avatar-lg">{client.name.charAt(0)}</div>
            <h2 className="text-h3">{client.name}</h2>
            <div className="flex-col gap-2">
              <div className="flex items-center gap-2 text-muted">
                <Mail size={16} /> {client.email}
              </div>
              <div className="flex items-center gap-2 text-muted">
                <Phone size={16} /> {client.phone}
              </div>
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
                <p className="text-sm text-muted">{client.agent.email}</p>
              </div>
            )}
          </div>
        </div>

        {/* Payment Plans */}
        <div className="card glass-panel" style={{ gridColumn: 'span 2' }}>
          <h3 className="text-h3 mb-4">
            <CreditCard size={20} style={{ display: 'inline', marginRight: '0.5rem' }} />
            Payment Plans ({client.paymentPlans?.length || 0})
          </h3>
          {!client.paymentPlans?.length ? (
            <div className="empty-state-sm">
              <p className="text-muted">No payment plans yet</p>
              <button className="btn btn-primary" onClick={() => navigate('/payment-plans')}>
                Create Payment Plan
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
                        <h4 className="font-medium">Unit {plan.department.code}</h4>
                        <span className="text-sm text-muted">{plan.frequency} • {plan.installments.length} installments</span>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <p className="font-bold text-accent-primary">${plan.totalAmount.toLocaleString()}</p>
                        <span className="text-sm text-muted">Deposit: ${plan.deposit.toLocaleString()}</span>
                      </div>
                    </div>
                    <div className="progress-bar-container">
                      <div className="progress-bar" style={{ width: `${progress}%` }} />
                    </div>
                    <span className="text-sm text-muted mt-2">{paidCount}/{plan.installments.length} installments paid ({Math.round(progress)}%)</span>

                    {/* Installments Table */}
                    <div className="table-container mt-4" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                      <table>
                        <thead>
                          <tr>
                            <th>#</th>
                            <th>Due Date</th>
                            <th>Amount</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {plan.installments.map((inst, idx) => (
                            <tr key={inst.id}>
                              <td className="text-muted">{idx + 1}</td>
                              <td>{new Date(inst.dueDate).toLocaleDateString()}</td>
                              <td className="font-medium">${inst.amount.toLocaleString()}</td>
                              <td><span className={`badge ${getStatusColor(inst.status)}`}>{inst.status}</span></td>
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
    </div>
  );
};

export default ClientDetail;
