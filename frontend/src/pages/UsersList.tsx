import React, { useEffect, useState } from 'react';
import { usersApi, authApi } from '../services/api';
import { Shield, UserPlus, Mail, Edit2, Trash2, CheckCircle, XCircle } from 'lucide-react';

interface SystemUser {
  id: string;
  email: string;
  name: string;
  role: string;
  isActive: boolean;
  createdAt: string;
}

const UsersList: React.FC = () => {
  const [users, setUsers] = useState<SystemUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<SystemUser | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'SALES_AGENT',
  });

  const fetchUsers = async () => {
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
    try {
      if (editingUser) {
        await usersApi.update(editingUser.id, formData);
      } else {
        await authApi.register(formData);
      }
      setShowModal(false);
      setEditingUser(null);
      setFormData({ name: '', email: '', password: '', role: 'SALES_AGENT' });
      fetchUsers();
    } catch (err) {
      alert('Error saving user');
    }
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

  if (loading) return <div className="p-8 text-center text-gray-400">Loading users...</div>;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Shield className="text-indigo-500" /> User Management
          </h1>
          <p className="text-gray-400 mt-1">Control system access and permissions</p>
        </div>
        <button
          onClick={() => {
            setEditingUser(null);
            setFormData({ name: '', email: '', password: '', role: 'SALES_AGENT' });
            setShowModal(true);
          }}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-all"
        >
          <UserPlus size={18} /> Add New User
        </button>
      </div>

      <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700 rounded-2xl overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-900/50">
              <th className="p-4 text-gray-400 font-medium border-b border-gray-700">User</th>
              <th className="p-4 text-gray-400 font-medium border-b border-gray-700">Role</th>
              <th className="p-4 text-gray-400 font-medium border-b border-gray-700">Status</th>
              <th className="p-4 text-gray-400 font-medium border-b border-gray-700">Joined</th>
              <th className="p-4 text-gray-400 font-medium border-b border-gray-700 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-gray-700/30 transition-colors group">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold">
                      {u.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="text-white font-medium">{u.name}</div>
                      <div className="text-gray-400 text-sm flex items-center gap-1">
                        <Mail size={12} /> {u.email}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded-md text-xs font-bold uppercase ${
                    u.role === 'ADMIN' ? 'bg-red-500/10 text-red-400' : 
                    u.role === 'ACCOUNTANT' ? 'bg-blue-500/10 text-blue-400' : 
                    'bg-green-500/10 text-green-400'
                  }`}>
                    {u.role}
                  </span>
                </td>
                <td className="p-4">
                  <button 
                    onClick={() => toggleStatus(u)}
                    className={`flex items-center gap-1 text-sm ${u.isActive ? 'text-green-400' : 'text-red-400'}`}
                  >
                    {u.isActive ? <CheckCircle size={16} /> : <XCircle size={16} />}
                    {u.isActive ? 'Active' : 'Disabled'}
                  </button>
                </td>
                <td className="p-4 text-gray-400 text-sm">
                  {new Date(u.createdAt).toLocaleDateString()}
                </td>
                <td className="p-4 text-right">
                  <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => {
                        setEditingUser(u);
                        setFormData({ name: u.name, email: u.email, password: '', role: u.role });
                        setShowModal(true);
                      }}
                      className="p-2 text-indigo-400 hover:bg-indigo-400/10 rounded-lg"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={() => deleteUser(u.id)}
                      className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg"
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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 border border-gray-700 rounded-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-gray-700 flex justify-between items-center">
              <h2 className="text-xl font-bold text-white">
                {editingUser ? 'Edit User' : 'Add New User'}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white">
                <XCircle size={24} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="john@example.com"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">
                  {editingUser ? 'New Password (leave blank to keep current)' : 'Password'}
                </label>
                <input
                  type="password"
                  required={!editingUser}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="••••••••"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">System Role</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="ADMIN">Admin (Full Control)</option>
                  <option value="ACCOUNTANT">Accountant (Financial Access)</option>
                  <option value="SALES_AGENT">Sales Agent (Client Access)</option>
                </select>
              </div>
              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors font-bold"
                >
                  {editingUser ? 'Update User' : 'Create User'}
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
