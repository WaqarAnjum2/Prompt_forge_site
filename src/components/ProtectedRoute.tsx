import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import { Loading } from './Loading';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export default function ProtectedRoute({
  children,
  requireAdmin = true,
}: ProtectedRouteProps) {
  const { user, loading, isAdmin } = useAuth();
  const location = useLocation();

  if (loading) return <Loading label="Checking access" />;

  if (!user) {
    return (
      <Navigate
        to={requireAdmin ? '/admin/login' : '/admin/login'}
        state={{ from: location }}
        replace
      />
    );
  }

  if (requireAdmin && !isAdmin) {
    return (
      <div className="mx-auto max-w-md px-6 py-20 text-center">
        <div className="w-16 h-16 rounded-2xl bg-danger/15 flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl font-bold text-danger">!</span>
        </div>
        <h1 className="text-h2 font-display font-bold mb-2">Access Denied</h1>
        <p className="text-ink-soft mb-6">
          You do not have admin privileges to access this area.
        </p>
        <Navigate to="/admin/login" replace />
      </div>
    );
  }

  return <>{children}</>;
}
