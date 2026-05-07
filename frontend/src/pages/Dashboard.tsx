import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, TrendingUp, Building, AlertTriangle, Loader2, Download, Calendar } from 'lucide-react';
import { exportsApi, clientsApi, paymentsApi, notificationsApi } from '../services/api';

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({ total: 0, paid: 0, overdue: 0, pending: 0, count: 0 });
  const [clientCount, setClientCount] = useState(0);
  const [recentPayments, setRecentPayments] = useState<any[]>([]);
  const [upcomingInstallments, setUpcomingInstallments] = useState<any[]>([]);
  const [allPending, setAllPending] = useState<any[]>([]);
  
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAll = async () => {
      const results = await Promise.allSettled([
        exportsApi.getSummary(),
        clientsApi.getAll(),
        paymentsApi.getAll(),
        notificationsApi.getInstallments('PENDING'),
      ]);

      if (results[0].status === 'fulfilled') setSummary(results[0].value.data);
      if (results[1].status === 'fulfilled') setClientCount(results[1].value.data.length);
      if (results[2].status === 'fulfilled') setRecentPayments(results[2].value.data.slice(0, 5));
      if (results[3].status === 'fulfilled') {
        const pending = results[3].value.data;
        setAllPending(pending);
        
        // Sort for upcoming
        const sorted = [...pending].sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
        setUpcomingInstallments(sorted.slice(0, 6));
      }

      setLoading(false);
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

  // Generate Yearly Data Grid
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const yearlyData = months.map((month, index) => {
    const monthInstalls = allPending.filter(inst => {
      const d = new Date(inst.dueDate);
      return d.getMonth() === index && d.getFullYear() === selectedYear;
    });

    const group1 = monthInstalls.filter(i => i.paymentPlan.client.groupId === 1).reduce((s, i) => s + i.amount, 0);
    const group2 = monthInstalls.filter(i => i.paymentPlan.client.groupId === 2).reduce((s, i) => s + i.amount, 0);
    const other = monthInstalls.filter(i => !i.paymentPlan.client.groupId).reduce((s, i) => s + i.amount, 0);

    return { month, group1, group2, other, total: group1 + group2 + other };
  });

  const totalG1 = yearlyData.reduce((s, d) => s + d.group1, 0);
  const totalG2 = yearlyData.reduce((s, d) => s + d.group2, 0);
  const totalOther = yearlyData.reduce((s, d) => s + d.other, 0);
  const totalYear = yearlyData.reduce((s, d) => s + d.total, 0);

  const stats = [
    { title: 'Total Clients', value: clientCount, icon: <Users size={24} color="var(--accent-primary)" />, color: 'var(--accent-primary)' },
    { title: 'Total Collected', value: `${summary.paid.toLocaleString()} EGP`, icon: <TrendingUp size={24} color="var(--success)" />, color: 'var(--success)' },
    { title: 'Pending Installs', value: allPending.length, icon: <Building size={24} color="var(--warning)" />, color: 'var(--warning)' },
    { title: 'Overdue Amount', value: `${summary.overdue.toLocaleString()} EGP`, icon: <AlertTriangle size={24} color="var(--danger)" />, color: 'var(--danger)' },
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
          <h1 className="text-h2">EstateCloud Dashboard</h1>
          <p className="text-muted mt-2">Welcome back! Here's your property portfolio at a glance.</p>
        </div>
        <button className="btn btn-primary" onClick={handleExport} id="download-report-btn">
          <Download size={18} /> Export Report
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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

      {/* Yearly Expected Income Heatmap/Grid */}
      <div className="card glass-panel">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-h3 flex items-center gap-2"><Calendar size={20} /> Yearly Expected Income</h3>
          <div className="flex items-center gap-2">
            <span className="text-muted text-sm">Select Year:</span>
            <input 
              type="number" 
              className="input w-24" 
              value={selectedYear} 
              onChange={e => setSelectedYear(Number(e.target.value))} 
            />
          </div>
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Month</th>
                <th className="text-right">Group 1 (EGP)</th>
                <th className="text-right">Group 2 (EGP)</th>
                <th className="text-right">Other (EGP)</th>
                <th className="text-right font-bold text-accent-primary">Total Expected</th>
              </tr>
            </thead>
            <tbody>
              {yearlyData.map(data => (
                <tr key={data.month}>
                  <td className="font-medium">{data.month}</td>
                  <td className="text-right">{data.group1 > 0 ? data.group1.toLocaleString() : '-'}</td>
                  <td className="text-right">{data.group2 > 0 ? data.group2.toLocaleString() : '-'}</td>
                  <td className="text-right">{data.other > 0 ? data.other.toLocaleString() : '-'}</td>
                  <td className="text-right font-bold text-accent-primary">
                    {data.total > 0 ? data.total.toLocaleString() : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr style={{ backgroundColor: 'var(--bg-secondary)' }}>
                <td className="font-bold">YEAR TOTAL</td>
                <td className="text-right font-bold">{totalG1 > 0 ? totalG1.toLocaleString() : '-'}</td>
                <td className="text-right font-bold">{totalG2 > 0 ? totalG2.toLocaleString() : '-'}</td>
                <td className="text-right font-bold">{totalOther > 0 ? totalOther.toLocaleString() : '-'}</td>
                <td className="text-right font-bold text-xl text-accent-primary">{totalYear.toLocaleString()}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
                    <th>Unit Code</th>
                    <th>Amount (EGP)</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {recentPayments.map((p: any) => (
                    <tr key={p.id}>
                      <td className="font-medium">{p.installment?.paymentPlan?.client?.name || '—'}</td>
                      <td>{p.installment?.paymentPlan?.client?.unitCode || '—'}</td>
                      <td style={{ color: 'var(--success)' }} className="font-bold">{p.amount?.toLocaleString()}</td>
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
            <h3 className="text-h3">Upcoming Installments</h3>
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
                  <div key={inst.id} className={`upcoming-item ${isOverdue ? 'border-l-4 border-danger' : ''}`} style={{ paddingLeft: '1rem' }}>
                    <div className="flex-col">
                      <span className="font-medium text-sm">{inst.paymentPlan?.client?.name}</span>
                      <span className="text-sm text-muted">{inst.paymentPlan?.client?.unitCode || '—'}</span>
                    </div>
                    <div className="flex-col" style={{ textAlign: 'right' }}>
                      <span className="font-bold text-sm">{inst.amount?.toLocaleString()} EGP</span>
                      <span className={`text-sm font-medium ${isOverdue ? 'text-danger' : 'text-muted'}`}>
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
