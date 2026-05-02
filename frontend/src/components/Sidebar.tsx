import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, Users, Building, CreditCard, DollarSign,
  Settings, LogOut,
} from 'lucide-react';

const Sidebar = () => {
  const location = useLocation();
  const { user, logout } = useAuth();

  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={20} />, roles: ['ADMIN', 'ACCOUNTANT', 'SALES_AGENT'] },
    { name: 'Clients', path: '/clients', icon: <Users size={20} />, roles: ['ADMIN', 'ACCOUNTANT', 'SALES_AGENT'] },
    { name: 'Departments', path: '/departments', icon: <Building size={20} />, roles: ['ADMIN', 'ACCOUNTANT', 'SALES_AGENT'] },
    { name: 'Payment Plans', path: '/payment-plans', icon: <CreditCard size={20} />, roles: ['ADMIN', 'ACCOUNTANT', 'SALES_AGENT'] },
    { name: 'Payments', path: '/payments', icon: <DollarSign size={20} />, roles: ['ADMIN', 'ACCOUNTANT'] },
    { name: 'User Management', path: '/users', icon: <Settings size={20} />, roles: ['ADMIN'] },
  ];

  const visibleItems = menuItems.filter((item) => !user?.role || item.roles.includes(user.role));

  const getRoleBadgeClass = (role: string) => {
    switch (role) {
      case 'ADMIN': return 'role-admin';
      case 'ACCOUNTANT': return 'role-accountant';
      default: return 'role-agent';
    }
  };

  return (
    <div className="sidebar">
      <div className="sidebar-inner">
        {/* Logo */}
        <div className="sidebar-logo">
          <div className="logo-icon">
            <Building size={22} color="white" />
          </div>
          <h1 className="logo-text">EstateCloud</h1>
        </div>

        {/* User info */}
        {user && (
          <div className="sidebar-user">
            <div className="sidebar-avatar">{user.name.charAt(0)}</div>
            <div className="sidebar-user-info">
              <span className="sidebar-user-name">{user.name}</span>
              <span className={`role-badge ${getRoleBadgeClass(user.role)}`}>{user.role.replace('_', ' ')}</span>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="sidebar-nav">
          <span className="sidebar-section-label">MENU</span>
          {visibleItems.map((item) => {
            const isActive = location.pathname === item.path || (item.path !== '/dashboard' && location.pathname.startsWith(item.path));
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`sidebar-link ${isActive ? 'sidebar-link-active' : ''}`}
              >
                <span className="sidebar-link-icon">{item.icon}</span>
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="sidebar-footer">
          <Link to="/settings" className="sidebar-link">
            <span className="sidebar-link-icon"><Settings size={20} /></span>
            Settings
          </Link>
          <button className="sidebar-link sidebar-logout" onClick={logout}>
            <span className="sidebar-link-icon"><LogOut size={20} /></span>
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
