
import { useState } from 'react';
import { LoginForm } from '@/components/auth/LoginForm';
import { Dashboard } from '@/components/dashboard/Dashboard';

const Index = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800">
      {!isAuthenticated ? (
        <LoginForm onLogin={() => setIsAuthenticated(true)} />
      ) : (
        <Dashboard onLogout={() => setIsAuthenticated(false)} />
      )}
    </div>
  );
};

export default Index;
