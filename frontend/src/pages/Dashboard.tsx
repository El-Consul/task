import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, TrendingUp, Building, AlertTriangle, Loader2, Download } from 'lucide-react';
import { exportsApi, clientsApi, departmentsApi, notificationsApi, paymentsApi } from '../services/api';

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({ total: 0, paid: 0, overdue: 0, pending: 0, count: 0 });
  const [clientCount, setClientCount] = useState(0);
  const [deptCount, setDeptCount] = useState(0);
  const [recentPayments, setRecentPayments] = useState<any[]>([]);
  const [upcomingInstallments, setUpcomingInstallments] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [sumRes, cRes, dRes, payRes, instRes] = await Promise.all([
          exportsApi.getSummary(),
          clientsApi.getAll(),
          departmentsApi.getAll(),
          paymentsApi.getAll(),
          notificationsApi.getInstallments('PENDING'),
        ]);
        setSummary(sumRes.data);
        setClientCount(cRes.data.length);
        setDeptCount(dRes.data.length);
        setRecentPayments(payRes.data.slice(0, 5));
        setUpcomingInstallments(instRes.data.slice(0, 6));
      } catch (err) {
        console.error('Dashboard load error', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const handleExport = async () => {
    try {
      const res = await exportsApi.downloadAccounting();
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = `accounting_${Date.now()}.xlsx`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export failed', err);
    }
  };

  const stats = [
    { title: 'Total Clients', value: clientCount, icon: <Users size={24} color="var(--accent-primary)" />, color: 'var(--accent-primary)' },
    { title: 'Total Collected', value: `$${summary.paid.toLocaleString()}`, icon: <TrendingUp size={24} color="var(--success)" />, color: 'var(--success)' },
    { title: 'Units', value: deptCount, icon: <Building size={24} color="var(--warning)" />, color: 'var(--warning)' },
    { title: 'Overdue Amount', value: `$${summary.overdue.toLocaleString()}`, icon: <AlertTriangle size={24} color="var(--danger)" />, color: 'var(--danger)' },
  ];

  if (loading) {
    return (
      <div className="loading-state">
        <Loader2 size={32} className="spin" />
        <p className="text-muted">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="flex-col gap-6">
      <div className="flex justify-between items-center mb-2">
        <div>
          <h1 className="text-h2">Dashboard Overview</h1>
          <p className="text-muted mt-2">Welcome back! Here's your property portfolio at a glance.</p>
        </div>
        <button className="btn btn-primary" onClick={handleExport} id="download-report-btn">
          <Download size={18} /> Export Report
        </button>
      </div>

      <div className="grid grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="card glass-panel stat-card-dash" style={{ '--stat-color': stat.color } as any}>
            <div className="flex justify-between items-center">
              <span className="text-muted font-medium">{stat.title}</span>
              <div className="stat-icon-wrap">
                {stat.icon}
              </div>
            </div>
            <span className="text-h2 mt-4">{stat.value}</span>
          </div>
        ))}
      </div>

      {/* Financial overview bar */}
      <div className="card glass-panel">
        <h3 className="text-h3 mb-4">Financial Overview</h3>
        <div className="financial-bars">
          <div className="financial-bar-item">
            <div className="flex justify-between mb-2">
              <span className="text-sm">Paid</span>
              <span className="text-sm font-bold" style={{ color: 'var(--success)' }}>${summary.paid.toLocaleString()}</span>
            </div>
            <div className="progress-bar-container">
              <div className="progress-bar progress-bar-success" style={{ width: summary.total > 0 ? `${(summary.paid / summary.total) * 100}%` : '0%' }} />
            </div>
          </div>
          <div className="financial-bar-item">
            <div className="flex justify-between mb-2">
              <span className="text-sm">Pending</span>
              <span className="text-sm font-bold" style={{ color: 'var(--warning)' }}>${summary.pending.toLocaleString()}</span>
            </div>
            <div className="progress-bar-container">
              <div className="progress-bar progress-bar-warning" style={{ width: summary.total > 0 ? `${(summary.pending / summary.total) * 100}%` : '0%' }} />
            </div>
          </div>
          <div className="financial-bar-item">
            <div className="flex justify-between mb-2">
              <span className="text-sm">Overdue</span>
              <span className="text-sm font-bold" style={{ color: 'var(--danger)' }}>${summary.overdue.toLocaleString()}</span>
            </div>
            <div className="progress-bar-container">
              <div className="progress-bar progress-bar-danger" style={{ width: summary.total > 0 ? `${(summary.overdue / summary.total) * 100}%` : '0%' }} />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Recent Payments */}
        <div className="card glass-panel" style={{ gridColumn: 'span 2' }}>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-h3">Recent Payments</h3>
            <button className="btn btn-secondary btn-sm" onClick={() => navigate('/payments')}>View All</button>
          </div>
          {recentPayments.length === 0 ? (
            <p className="text-muted">No payments recorded yet</p>
          ) : (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Client</th>
                    <th>Unit</th>
                    <th>Amount</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {recentPayments.map((p: any) => (
                    <tr key={p.id}>
                      <td className="font-medium">{p.installment?.paymentPlan?.client?.name || '—'}</td>
                      <td>{p.installment?.paymentPlan?.department?.code || '—'}</td>
                      <td style={{ color: 'var(--success)' }} className="font-bold">${p.amount?.toLocaleString()}</td>
                      <td className="text-muted">{new Date(p.paymentDate).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Upcoming Installments */}
        <div className="card glass-panel">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-h3">Upcoming</h3>
            <button className="btn btn-secondary btn-sm" onClick={() => navigate('/payments')}>View All</button>
          </div>
          {upcomingInstallments.length === 0 ? (
            <p className="text-muted">No upcoming installments</p>
          ) : (
            <div className="flex-col gap-3">
              {upcomingInstallments.map((inst: any) => {
                const daysUntil = Math.ceil((new Date(inst.dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                const isOverdue = daysUntil < 0;
                return (
                  <div key={inst.id} className="upcoming-item">
                    <div className="flex-col">
                      <span className="font-medium text-sm">{inst.paymentPlan?.client?.name}</span>
                      <span className="text-sm text-muted">{inst.paymentPlan?.department?.code}</span>
                    </div>
                    <div className="flex-col" style={{ textAlign: 'right' }}>
                      <span className="font-bold text-sm">${inst.amount?.toLocaleString()}</span>
                      <span className={`text-sm ${isOverdue ? 'text-danger' : 'text-muted'}`}>
                        {isOverdue ? `${Math.abs(daysUntil)}d overdue` : `In ${daysUntil}d`}
                      </span>
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

export default Dashboard;
