import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, TrendingUp, Building, AlertTriangle, Loader2, Calendar, PieChart as PieChartIcon, FileSpreadsheet, DollarSign } from 'lucide-react';
import { exportsApi, clientsApi, paymentsApi, notificationsApi } from '../services/api';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';

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
        notificationsApi.getInstallments(),
      ]);

      if (results[0].status === 'fulfilled') setSummary(results[0].value.data);
      if (results[1].status === 'fulfilled') setClientCount(results[1].value.data.length);
      if (results[2].status === 'fulfilled') setRecentPayments(results[2].value.data.slice(0, 5));
      if (results[3].status === 'fulfilled') {
        const installments = results[3].value.data;
        setAllPending(installments);
        
        // Sort for upcoming (only pending)
        const pending = installments.filter((i: any) => i.status === 'PENDING');
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
    const total = allPending
      .filter(inst => {
        const d = new Date(inst.dueDate);
        return d.getMonth() === index && d.getFullYear() === selectedYear;
      })
      .reduce((s, i) => s + i.amount, 0);

    return { month, total };
  });

  const stats = [
    { title: 'Total Clients', value: clientCount, icon: <Users size={24} color="var(--accent-primary)" />, color: 'var(--accent-primary)' },
    { title: 'Total Collected', value: `${summary.paid.toLocaleString()} EGP`, icon: <TrendingUp size={24} color="var(--success)" />, color: 'var(--success)' },
    { title: 'Pending Installments', value: allPending.filter(i => i.status === 'PENDING').length, icon: <Building size={24} color="var(--warning)" />, color: 'var(--warning)' },
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
          <FileSpreadsheet size={18} /> Export Full Accounting Report
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

      {/* Yearly Expected Income Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card glass-panel lg:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-h3 flex items-center gap-2"><Calendar size={20} /> Monthly Expected Revenue</h3>
            <div className="flex items-center gap-2">
              <input 
                type="number" 
                className="input w-24" 
                value={selectedYear} 
                onChange={e => setSelectedYear(Number(e.target.value))} 
              />
            </div>
          </div>
          
          <div style={{ width: '100%', height: 350 }}>
            <ResponsiveContainer>
              <BarChart data={yearlyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="month" stroke="rgba(255,255,255,0.5)" fontSize={12} />
                <YAxis stroke="rgba(255,255,255,0.5)" fontSize={12} tickFormatter={(val) => `${(val / 1000000).toFixed(1)}M`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1a1d21', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                  itemStyle={{ fontSize: '12px' }}
                />
                <Legend iconType="circle" />
                <Bar dataKey="total" name="Total Expected" fill="var(--accent-primary)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card glass-panel">
          <h3 className="text-h3 flex items-center gap-2 mb-6"><PieChartIcon size={20} /> Payment Status</h3>
          <div style={{ width: '100%', height: 350 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={[
                    { name: 'Paid', value: summary.paid },
                    { name: 'Overdue', value: summary.overdue },
                    { name: 'Pending', value: summary.pending }
                  ]}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  <Cell fill="var(--success)" />
                  <Cell fill="var(--danger)" />
                  <Cell fill="var(--warning)" />
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1a1d21', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                />
                <Legend verticalAlign="bottom" />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex-col gap-2 mt-4">
            <div className="flex justify-between text-sm">
              <span className="text-muted">Total Portfolio</span>
              <span className="font-bold">{(summary.paid + summary.overdue + summary.pending).toLocaleString()} EGP</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted">Collection Rate</span>
              <span className="font-bold text-success">{((summary.paid / (summary.paid + summary.overdue + summary.pending || 1)) * 100).toFixed(1)}%</span>
            </div>
          </div>
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
                const [daysUntil, isOverdue] = (() => {
                  const days = Math.ceil((new Date(inst.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                  return [days, days < 0];
                })();
                return (
                  <div key={inst.id} className={`upcoming-item ${isOverdue ? 'border-l-4 border-danger' : ''}`} style={{ paddingLeft: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div className="flex-col">
                      <span className="font-medium text-sm">{inst.paymentPlan?.client?.name}</span>
                      <span className="text-sm text-muted">{inst.paymentPlan?.client?.unitCode || '—'}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex-col" style={{ textAlign: 'right' }}>
                        <span className="font-bold text-sm">{inst.amount?.toLocaleString()} EGP</span>
                        <span className={`text-sm font-medium ${isOverdue ? 'text-danger' : 'text-muted'}`}>
                          {isOverdue ? `${Math.abs(daysUntil)}d overdue` : `In ${daysUntil}d`}
                        </span>
                      </div>
                      <button 
                        className="btn btn-primary btn-sm p-2" 
                        onClick={() => navigate('/payments')} 
                        title="Go to Payments"
                      >
                        <DollarSign size={14} />
                      </button>
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
