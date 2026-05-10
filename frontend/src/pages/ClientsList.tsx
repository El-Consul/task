import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { clientsApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Plus, Search, Eye, Edit3, Users, Loader2, X, DollarSign } from 'lucide-react';

interface Client {
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
  agent?: { id: string; name: string; email: string };
  paymentPlans?: any[];
}

const ClientsList = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '', phone: '', unitNumber: '', unitCode: '', unitArea: '', groupId: 1, email: '', idNumber: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { user } = useAuth();
  const canManage = user?.role === 'ADMIN' || user?.permissions?.includes('CLIENTS_MANAGE');

  const fetchClients = async () => {
    try {
      const res = await clientsApi.getAll();
      setClients(res.data);
    } catch (err) {
      console.error('Failed to fetch clients', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchClients(); }, []);

  const filtered = clients.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.unitCode?.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search),
  );

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await clientsApi.create({
        name: formData.name,
        phone: formData.phone,
        unitNumber: formData.unitNumber || undefined,
        unitCode: formData.unitCode || undefined,
        unitArea: formData.unitArea ? parseFloat(formData.unitArea) : undefined,
        groupId: formData.groupId,
        email: formData.email || undefined,
        idNumber: formData.idNumber || undefined,
      });
      setShowModal(false);
      setFormData({ name: '', phone: '', unitNumber: '', unitCode: '', unitArea: '', groupId: 1, email: '', idNumber: '' });
      fetchClients();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create client');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex-col gap-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-h2">Clients</h1>
          <p className="text-muted mt-2">Manage your real estate clients</p>
        </div>
        {canManage && (
          <button className="btn btn-primary" onClick={() => setShowModal(true)} id="add-client-btn">
            <Plus size={18} /> Add Client
          </button>
        )}
      </div>

      <div className="search-bar">
        <Search size={18} className="search-icon" />
        <input
          type="text"
          className="input"
          placeholder="Search clients by name, unit code, or phone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          id="client-search"
          style={{ paddingLeft: '2.75rem' }}
        />
      </div>

      {loading ? (
        <div className="loading-state">
          <Loader2 size={32} className="spin" />
          <p className="text-muted">Loading clients...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state glass-panel">
          <Users size={48} />
          <h3>No clients found</h3>
          <p className="text-muted">{search ? 'Try a different search term' : 'Get started by adding your first client'}</p>
        </div>
      ) : (
        <div className="table-container glass-panel">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Unit Code</th>
                <th>Unit No.</th>
                <th>Area (m²)</th>
                <th>Phone</th>
                <th>Group</th>
                <th>Plans</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((client) => (
                <tr key={client.id}>
                  <td className="text-muted">#{client.id}</td>
                  <td className="font-medium">
                    <div className="flex items-center gap-2">
                      <div className="avatar-sm">{client.name.charAt(0)}</div>
                      {client.name}
                    </div>
                  </td>
                  <td className="text-muted">{client.unitCode || '—'}</td>
                  <td className="text-muted">{client.unitNumber || '—'}</td>
                  <td className="text-muted">{client.unitArea ? `${client.unitArea} m²` : '—'}</td>
                  <td className="text-muted">{client.phone}</td>
                  <td>
                    <span className="badge badge-info">{client.paymentPlans?.length || 0}</span>
                  </td>
                  <td>
                    <div className="flex gap-2">
                      <button className="btn-icon" onClick={() => navigate(`/clients/${client.id}`)} title="View Details">
                        <Eye size={16} />
                      </button>
                      <button className="btn-icon text-success" onClick={() => navigate(`/payments?search=${client.name}`)} title="Record Payment">
                        <DollarSign size={16} />
                      </button>
                      {canManage && (
                        <button className="btn-icon" title="Edit">
                          <Edit3 size={16} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Client Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal glass-panel" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="text-h3">Add New Client</h2>
              <button className="btn-icon" onClick={() => setShowModal(false)}><X size={20} /></button>
            </div>
            {error && <div className="login-error">{error}</div>}
            <form onSubmit={handleCreate} className="modal-form">
              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <input className="input" placeholder="Client Name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Phone *</label>
                  <input className="input" placeholder="010..." value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} required />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Unit Code</label>
                  <input className="input" placeholder="e.g. A-101" value={formData.unitCode} onChange={(e) => setFormData({ ...formData, unitCode: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Unit Details / Number</label>
                  <input className="input" placeholder="Building 79, Floor 4..." value={formData.unitNumber} onChange={(e) => setFormData({ ...formData, unitNumber: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Area (m²)</label>
                  <input type="number" className="input" placeholder="120" value={formData.unitArea} onChange={(e) => setFormData({ ...formData, unitArea: e.target.value })} />
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? <><Loader2 size={16} className="spin" /> Creating...</> : 'Create Client'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientsList;
