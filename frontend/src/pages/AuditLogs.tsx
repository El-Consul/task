import { useState, useEffect } from 'react';
import { Loader2, History, User, Database, RotateCcw, Filter } from 'lucide-react';
import axios from 'axios';

import { translations } from '../translations';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const AuditLogs = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [meta, setMeta] = useState<any>({});
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({ userId: '', action: '', entityType: '' });
  
  // const { user } = useAuth();
  const lang = localStorage.getItem('lang') || 'en';
  const t = translations[lang] || translations.en;

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        ...filters
      });
      const res = await axios.get(`${API_URL}/audit-logs?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setLogs(res.data.data);
      setMeta(res.data.meta);
    } catch (err) {
      console.error('Failed to fetch audit logs', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [page, filters]);

  const getActionBadge = (action: string) => {
    switch (action) {
      case 'CREATE': return <span className="badge badge-success">Create</span>;
      case 'UPDATE': return <span className="badge badge-warning">Update</span>;
      case 'DELETE': return <span className="badge badge-danger">Delete</span>;
      case 'EXPORT': return <span className="badge badge-primary">Export</span>;
      default: return <span className="badge badge-secondary">{action}</span>;
    }
  };

  return (
    <div className="flex-col gap-6" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-h2 flex items-center gap-2"><History size={32} /> {t.auditLogs}</h1>
          <p className="text-muted mt-2">{lang === 'ar' ? 'تتبع جميع الإجراءات الهامة وتغييرات البيانات عبر النظام' : 'Track all critical actions and data changes across the system'}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="card glass-panel p-4 flex flex-wrap gap-4 items-end">
        <div className="flex items-center gap-2 text-muted mb-auto pb-2">
          <Filter size={16} />
          <span className="text-sm font-bold uppercase tracking-wider">Filters</span>
        </div>
        <div className="form-group mb-0 flex-1 min-w-[200px]">
          <label className="form-label text-xs uppercase tracking-wider opacity-60">Action Type</label>
          <select className="input" value={filters.action} onChange={e => setFilters({...filters, action: e.target.value})}>
            <option value="">All Actions</option>
            <option value="CREATE">Create</option>
            <option value="UPDATE">Update</option>
            <option value="DELETE">Delete</option>
            <option value="EXPORT">Export</option>
          </select>
        </div>
        <div className="form-group mb-0 flex-1 min-w-[200px]">
          <label className="form-label text-xs uppercase tracking-wider opacity-60">Entity</label>
          <select className="input" value={filters.entityType} onChange={e => setFilters({...filters, entityType: e.target.value})}>
            <option value="">All Entities</option>
            <option value="Client">Client</option>
            <option value="Department">Unit/Department</option>
            <option value="PaymentPlan">Payment Plan</option>
            <option value="Payment">Payment</option>
          </select>
        </div>
        <button className="btn btn-secondary h-[42px]" onClick={() => setFilters({userId: '', action: '', entityType: ''})}>
          <RotateCcw size={16} /> Reset
        </button>
      </div>

      {loading ? (
        <div className="loading-state"><Loader2 size={32} className="spin" /><p className="text-muted">Fetching audit trail...</p></div>
      ) : logs.length === 0 ? (
        <div className="empty-state glass-panel">
          <History size={48} />
          <h3>No audit logs found</h3>
        </div>
      ) : (
        <div className="flex-col gap-4">
          <div className="table-container glass-panel">
            <table>
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>User</th>
                  <th>Action</th>
                  <th>Entity</th>
                  <th>ID</th>
                  <th>Details</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id}>
                    <td className="text-sm text-muted">{new Date(log.createdAt).toLocaleString()}</td>
                    <td>
                      <div className="flex items-center gap-2">
                        <div className="avatar-xs"><User size={12} /></div>
                        <div className="flex-col">
                          <span className="font-medium text-sm">{log.user?.name}</span>
                          <span className="text-xs text-muted">{log.user?.email}</span>
                        </div>
                      </div>
                    </td>
                    <td>{getActionBadge(log.action)}</td>
                    <td><span className="flex items-center gap-1 text-sm"><Database size={14} className="text-muted" /> {log.entityType}</span></td>
                    <td className="text-xs font-mono text-muted">{log.entityId || '—'}</td>
                    <td className="text-sm">
                      <div className="details-scroll" style={{ maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {log.details}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          <div className="flex justify-between items-center mt-4">
            <span className="text-sm text-muted">Showing {logs.length} of {meta.total} logs</span>
            <div className="flex gap-2">
              <button className="btn btn-secondary btn-sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Previous</button>
              <div className="flex items-center px-4 text-sm font-medium">Page {page} of {meta.totalPages}</div>
              <button className="btn btn-secondary btn-sm" disabled={page === meta.totalPages} onClick={() => setPage(p => p + 1)}>Next</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuditLogs;
