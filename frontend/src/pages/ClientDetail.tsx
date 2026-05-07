import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { clientsApi } from '../services/api';
import { ArrowLeft, User, Mail, Phone, CreditCard, Calendar, Loader2, Home, Hash, Map } from 'lucide-react';

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

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'MAINTENANCE': return <span className="badge badge-warning">Maintenance</span>;
      case 'DELIVERY': return <span className="badge badge-info">Delivery</span>;
      case 'FINAL': return <span className="badge badge-primary">Final</span>;
      default: return <span className="badge badge-secondary">Regular</span>;
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
            <h2 className="text-h3">#{client.id} - {client.name}</h2>
            {client.groupId && (
              <span className={`badge ${client.groupId === 1 ? 'badge-primary' : 'badge-warning'} w-fit`}>
                Group {client.groupId}
              </span>
            )}
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
            Payment Plans ({client.paymentPlans?.length || 0})
          </h3>
          {!client.paymentPlans?.length ? (
            <div className="empty-state-sm">
              <p className="text-muted">No payment plans yet</p>
              <button className="btn btn-primary mt-2" onClick={() => navigate('/payment-plans/new')}>
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
                        <h4 className="font-medium text-lg">Contract Date: {new Date(plan.contractDate).toLocaleDateString()}</h4>
                        <span className="text-sm text-muted">{plan.installments.length} installments</span>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <p className="font-bold text-accent-primary text-xl">{plan.unitPrice.toLocaleString()} EGP</p>
                        <span className="text-sm text-muted block">Deposit: {plan.deposit.toLocaleString()} EGP</span>
                        <span className="text-sm text-muted block">Remaining: {plan.remainingAmount.toLocaleString()} EGP</span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mb-4 text-sm bg-black/20 p-3 rounded-lg border border-white/5">
                      {plan.measurements ? <div><span className="text-muted">Measurements:</span> {plan.measurements.toLocaleString()} EGP</div> : null}
                      {plan.deposit10Percent ? <div><span className="text-muted">10% Deposit:</span> {plan.deposit10Percent.toLocaleString()} EGP</div> : null}
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
                          </tr>
                        </thead>
                        <tbody>
                          {plan.installments.map((inst, idx) => (
                            <tr key={inst.id}>
                              <td className="text-muted">{idx + 1}</td>
                              <td>{getTypeBadge(inst.type)}</td>
                              <td>{new Date(inst.dueDate).toLocaleDateString()}</td>
                              <td className="font-medium">{inst.amount.toLocaleString()}</td>
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
