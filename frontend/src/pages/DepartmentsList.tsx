import { useState, useEffect } from 'react';
import { departmentsApi } from '../services/api';
import { Plus, Building, Search, Edit3, Loader2, X } from 'lucide-react';

interface Department {
  id: string;
  code: string;
  name?: string;
  price: number;
  status: string;
  createdAt: string;
}

const DepartmentsList = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ code: '', name: '', price: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const fetchDepartments = async () => {
    try {
      const res = await departmentsApi.getAll();
      setDepartments(res.data);
    } catch (err) {
      console.error('Failed to fetch departments', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDepartments(); }, []);

  const filtered = departments.filter(
    (d) => d.code.toLowerCase().includes(search.toLowerCase()) ||
      (d.name?.toLowerCase().includes(search.toLowerCase()) ?? false),
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'AVAILABLE': return 'badge-success';
      case 'RESERVED': return 'badge-warning';
      case 'SOLD': return 'badge-danger';
      default: return 'badge-info';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      if (editId) {
        await departmentsApi.update(editId, { name: formData.name, price: parseFloat(formData.price) });
      } else {
        await departmentsApi.create({ code: formData.code, name: formData.name || undefined, price: parseFloat(formData.price) });
      }
      setShowModal(false);
      setEditId(null);
      setFormData({ code: '', name: '', price: '' });
      fetchDepartments();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save department');
    } finally {
      setSubmitting(false);
    }
  };

  const openEdit = (dept: Department) => {
    setEditId(dept.id);
    setFormData({ code: dept.code, name: dept.name || '', price: dept.price.toString() });
    setShowModal(true);
  };

  const stats = {
    total: departments.length,
    available: departments.filter((d) => d.status === 'AVAILABLE').length,
    reserved: departments.filter((d) => d.status === 'RESERVED').length,
    sold: departments.filter((d) => d.status === 'SOLD').length,
  };

  return (
    <div className="flex-col gap-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-h2">Departments / Units</h1>
          <p className="text-muted mt-2">Manage property units and their status</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setEditId(null); setFormData({ code: '', name: '', price: '' }); setShowModal(true); }} id="add-department-btn">
          <Plus size={18} /> Add Unit
        </button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-4 gap-4">
        <div className="stat-card glass-panel">
          <span className="text-muted text-sm">Total Units</span>
          <span className="text-h2">{stats.total}</span>
        </div>
        <div className="stat-card glass-panel">
          <span className="text-sm" style={{ color: 'var(--success)' }}>Available</span>
          <span className="text-h2">{stats.available}</span>
        </div>
        <div className="stat-card glass-panel">
          <span className="text-sm" style={{ color: 'var(--warning)' }}>Reserved</span>
          <span className="text-h2">{stats.reserved}</span>
        </div>
        <div className="stat-card glass-panel">
          <span className="text-sm" style={{ color: 'var(--danger)' }}>Sold</span>
          <span className="text-h2">{stats.sold}</span>
        </div>
      </div>

      <div className="search-bar">
        <Search size={18} className="search-icon" />
        <input type="text" className="input" placeholder="Search units by code or name..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ paddingLeft: '2.75rem' }} />
      </div>

      {loading ? (
        <div className="loading-state"><Loader2 size={32} className="spin" /><p className="text-muted">Loading units...</p></div>
      ) : filtered.length === 0 ? (
        <div className="empty-state glass-panel">
          <Building size={48} />
          <h3>No units found</h3>
          <p className="text-muted">{search ? 'Try a different search' : 'Add your first property unit'}</p>
        </div>
      ) : (
        <div className="dept-grid">
          {filtered.map((dept) => (
            <div key={dept.id} className="card glass-panel dept-card">
              <div className="flex justify-between items-center mb-4">
                <div className="dept-code-badge">
                  <Building size={16} />
                  {dept.code}
                </div>
                <span className={`badge ${getStatusBadge(dept.status)}`}>{dept.status}</span>
              </div>
              <h3 className="font-medium mb-2">{dept.name || `Unit ${dept.code}`}</h3>
              <p className="text-h3 text-accent-primary mb-4">${dept.price.toLocaleString()}</p>
              <button className="btn btn-secondary w-full" onClick={() => openEdit(dept)}>
                <Edit3 size={14} /> Edit
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal glass-panel" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="text-h3">{editId ? 'Edit Unit' : 'Add New Unit'}</h2>
              <button className="btn-icon" onClick={() => setShowModal(false)}><X size={20} /></button>
            </div>
            {error && <div className="login-error">{error}</div>}
            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-group">
                <label className="form-label">Unit Code *</label>
                <input className="input" placeholder="A-101" value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value })} required disabled={!!editId} />
              </div>
              <div className="form-group">
                <label className="form-label">Name</label>
                <input className="input" placeholder="Luxury Apartment" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Price ($) *</label>
                <input className="input" type="number" step="0.01" placeholder="150000" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} required />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? <><Loader2 size={16} className="spin" /> Saving...</> : editId ? 'Update Unit' : 'Create Unit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DepartmentsList;
