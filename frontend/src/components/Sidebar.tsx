import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, Users, Building, CreditCard, DollarSign,
  Settings, LogOut, History, Languages
} from 'lucide-react';
import { translations } from '../translations';

const Sidebar = () => {
  const location = useLocation();
  const { user, logout } = useAuth();
  const lang = localStorage.getItem('lang') || 'en';
  const t = translations[lang] || translations.en;

  const menuItems = [
    { name: t.dashboard, path: '/dashboard', icon: <LayoutDashboard size={20} />, roles: ['ADMIN', 'ACCOUNTANT', 'SALES_AGENT'] },
    { name: t.clients, path: '/clients', icon: <Users size={20} />, permissions: ['CLIENTS_VIEW'], roles: ['ADMIN', 'ACCOUNTANT', 'SALES_AGENT'] },
    { name: t.units, path: '/departments', icon: <Building size={20} />, roles: ['ADMIN', 'ACCOUNTANT', 'SALES_AGENT'] },
    { name: t.paymentPlans, path: '/payment-plans', icon: <CreditCard size={20} />, permissions: ['PAYMENT_PLANS_VIEW'], roles: ['ADMIN', 'ACCOUNTANT', 'SALES_AGENT'] },
    { name: t.payments, path: '/payments', icon: <DollarSign size={20} />, permissions: ['PAYMENTS_VIEW'], roles: ['ADMIN', 'ACCOUNTANT', 'SALES_AGENT'] },
    { name: t.users, path: '/users', icon: <Settings size={20} />, permissions: ['USERS_MANAGE'], roles: ['ADMIN'] },
    { name: t.auditLogs, path: '/audit-logs', icon: <History size={20} />, permissions: ['SYSTEM_AUDIT'], roles: ['ADMIN'] },
  ];

  const visibleItems = menuItems.filter((item) => {
    if (!user) return false;
    if (user.role === 'ADMIN') return true;
    if (item.permissions) {
      return item.permissions.some(p => user.permissions?.includes(p));
    }
    return !user.role || item.roles.includes(user.role);
  });

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
        <div className="sidebar-footer flex-col gap-2">
          <button 
            className="sidebar-link" 
            style={{ border: '1px solid rgba(255,255,255,0.05)', borderRadius: '8px', background: 'rgba(255,255,255,0.02)' }}
            onClick={() => { 
              const newLang = lang === 'ar' ? 'en' : 'ar';
              localStorage.setItem('lang', newLang); 
              window.location.reload(); 
            }}
          >
            <span className="sidebar-link-icon"><Languages size={18} /></span>
            {lang === 'ar' ? 'English' : 'العربية'}
          </button>
          
          <button className="sidebar-link sidebar-logout" onClick={logout}>
            <span className="sidebar-link-icon"><LogOut size={20} /></span>
            {t.logout}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
