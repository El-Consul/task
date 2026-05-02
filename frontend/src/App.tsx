import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Sidebar from './components/Sidebar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ClientsList from './pages/ClientsList';
import ClientDetail from './pages/ClientDetail';
import DepartmentsList from './pages/DepartmentsList';
import PaymentPlansList from './pages/PaymentPlansList';
import PaymentsPage from './pages/PaymentsPage';
import UsersList from './pages/UsersList';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="loading-fullscreen">
        <div className="loading-spinner" />
        <p>Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}

function AppLayout() {
  const { user } = useAuth();

  return (
    <div className="app-container">
      <Sidebar />
      <main className="main-content">
        <header className="top-nav">
          <h2 className="text-h3">Real Estate Admin</h2>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted">{user?.name || 'User'}</span>
            <div className="top-nav-avatar">
              {user?.name?.charAt(0) || 'U'}
            </div>
          </div>
        </header>
        <div className="page-content">
          <Routes>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/clients" element={<ClientsList />} />
            <Route path="/clients/:id" element={<ClientDetail />} />
            <Route path="/departments" element={<DepartmentsList />} />
            <Route path="/payment-plans" element={<PaymentPlansList />} />
            <Route path="/payments" element={<PaymentsPage />} />
            <Route path="/users" element={<UsersList />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
