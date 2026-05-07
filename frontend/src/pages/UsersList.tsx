import React, { useEffect, useState } from 'react';
import { usersApi, authApi } from '../services/api';
import { Shield, UserPlus, Mail, Edit2, Trash2, CheckCircle, XCircle, Loader2 } from 'lucide-react';

interface SystemUser {
  id: string;
  email: string;
  name: string;
  role: string;
  permissions: string[];
  isActive: boolean;
  createdAt: string;
}

const AVAILABLE_PERMISSIONS = [
  { id: 'CLIENTS_VIEW', label: 'View Clients', desc: 'Can see client lists and details' },
  { id: 'CLIENTS_MANAGE', label: 'Manage Clients', desc: 'Can add and edit client info' },
  { id: 'DEPARTMENTS_MANAGE', label: 'Manage Units', desc: 'Can add and edit property units' },
  { id: 'PAYMENT_PLANS_VIEW', label: 'View Payment Plans', desc: 'Can see installment schedules' },
  { id: 'PAYMENT_PLANS_MANAGE', label: 'Manage Payment Plans', desc: 'Can create new installment plans' },
  { id: 'PAYMENTS_VIEW', label: 'View Payments', desc: 'Can see payment history' },
  { id: 'PAYMENTS_MANAGE', label: 'Record Payments', desc: 'Can record new payment transactions' },
  { id: 'USERS_MANAGE', label: 'Manage Users', desc: 'Can manage system accounts' },
];

const UsersList: React.FC = () => {
  const [users, setUsers] = useState<SystemUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<SystemUser | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'SALES_AGENT',
    permissions: [] as string[],
  });

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await usersApi.getAll();
      setUsers(res.data);
    } catch (err) {
      console.error('Failed to fetch users', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingUser) {
        await usersApi.update(editingUser.id, formData);
      } else {
        await authApi.register(formData);
      }
      setShowModal(false);
      setEditingUser(null);
      setFormData({ name: '', email: '', password: '', role: 'SALES_AGENT', permissions: [] });
      fetchUsers();
    } catch (err) {
      alert('Error saving user');
    } finally {
      setSaving(false);
    }
  };

  const togglePermission = (permId: string) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permId)
        ? prev.permissions.filter(id => id !== permId)
        : [...prev.permissions, permId]
    }));
  };

  const toggleStatus = async (user: SystemUser) => {
    try {
      await usersApi.update(user.id, { isActive: !user.isActive });
      fetchUsers();
    } catch (err) {
      alert('Error updating status');
    }
  };

  const deleteUser = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      await usersApi.remove(id);
      fetchUsers();
    } catch (err) {
      alert('Error deleting user');
    }
  };

  if (loading) {
    return (
      <div className="loading-state">
        <Loader2 size={32} className="spin" />
        <p className="text-muted">Loading users...</p>
      </div>
    );
  }

  return (
    <div className="flex-col gap-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-h2 flex items-center gap-3">
            <Shield className="text-accent-primary" /> User Management
          </h1>
          <p className="text-muted mt-2">Control system access and permissions</p>
        </div>
        <button
          onClick={() => {
            setEditingUser(null);
            setFormData({ name: '', email: '', password: '', role: 'SALES_AGENT', permissions: [] });
            setShowModal(true);
          }}
          className="btn btn-primary"
        >
          <UserPlus size={18} /> Add New User
        </button>
      </div>

      <div className="table-container glass-panel">
        <table>
          <thead>
            <tr>
              <th>User</th>
              <th>Permissions</th>
              <th>Status</th>
              <th>Joined</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td>
                  <div className="flex items-center gap-3">
                    <div className="avatar-sm">
                      {u.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-medium text-white">{u.name}</div>
                      <div className="text-muted text-sm flex items-center gap-1">
                        <Mail size={12} /> {u.email}
                      </div>
                    </div>
                  </div>
                </td>
                <td>
                  <div className="flex flex-wrap gap-1" style={{ maxWidth: '300px' }}>
                    {u.permissions?.length > 0 ? (
                      u.permissions.map(p => (
                        <span key={p} className="badge badge-info" style={{ fontSize: '0.6rem' }}>
                          {p.replace('_', ' ')}
                        </span>
                      ))
                    ) : (
                      <span className="text-muted text-sm">No specific permissions</span>
                    )}
                  </div>
                </td>
                <td>
                  <button
                    onClick={() => toggleStatus(u)}
                    className={`btn-icon gap-1 ${u.isActive ? 'text-success' : 'text-danger'}`}
                    style={{ background: 'none', padding: 0 }}
                  >
                    {u.isActive ? <CheckCircle size={16} /> : <XCircle size={16} />}
                    <span className="text-sm">{u.isActive ? 'Active' : 'Disabled'}</span>
                  </button>
                </td>
                <td className="text-muted text-sm">
                  {new Date(u.createdAt).toLocaleDateString()}
                </td>
                <td>
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => {
                        setEditingUser(u);
                        setFormData({
                          name: u.name,
                          email: u.email,
                          password: '',
                          role: u.role,
                          permissions: u.permissions || []
                        });
                        setShowModal(true);
                      }}
                      className="btn-icon"
                      title="Edit User"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={() => deleteUser(u.id)}
                      className="btn-icon"
                      title="Delete User"
                      style={{ color: 'var(--danger)' }}
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal modal-lg glass-panel" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="text-h3">
                {editingUser ? 'Edit User' : 'Add New User'}
              </h2>
              <button onClick={() => setShowModal(false)} className="btn-icon">
                <XCircle size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="input"
                    placeholder="John Doe"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="input"
                    placeholder="john@example.com"
                  />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">
                  {editingUser ? 'New Password (optional)' : 'Password'}
                </label>
                <input
                  type="password"
                  required={!editingUser}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="input"
                  placeholder="••••••••"
                />
              </div>

              <div className="form-group mt-4">
                <label className="form-label mb-2">System Permissions</label>
                <div className="grid grid-cols-2 gap-3">
                  {AVAILABLE_PERMISSIONS.map(perm => (
                    <div
                      key={perm.id}
                      className={`card p-3 cursor-pointer transition-all ${formData.permissions.includes(perm.id) ? 'border-accent-primary' : 'border-color'}`}
                      style={{
                        borderWidth: '1px',
                        background: formData.permissions.includes(perm.id) ? 'rgba(59,130,246,0.05)' : 'var(--bg-primary)',
                        cursor: 'pointer'
                      }}
                      onClick={() => togglePermission(perm.id)}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={formData.permissions.includes(perm.id)}
                          onChange={() => { }} // Handled by div click
                          className="w-4 h-4"
                        />
                        <div>
                          <p className="font-medium text-sm">{perm.label}</p>
                          <p className="text-xs text-muted">{perm.desc}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="modal-actions pt-6">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <Loader2 size={18} className="spin" />
                      {editingUser ? 'Updating...' : 'Creating...'}
                    </>
                  ) : (
                    editingUser ? 'Update User' : 'Create User'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersList;
