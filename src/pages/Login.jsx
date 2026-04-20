import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Loader2, Lock, User, LayoutDashboard, AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const { t } = useTranslation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(username, password);
    if (!result.success) {
      setError(result.error || 'Invalid credentials');
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4 relative overflow-hidden">
      {/* Dynamic Background Elements */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent/15 rounded-full blur-3xl animate-pulse -z-10" />
      <div className="absolute bottom-1/4 right-1/4 w-[30rem] h-[30rem] bg-secondary/12 rounded-full blur-3xl animate-pulse delay-1000 -z-10" />
      
      {/* Login Card - Glassmorphism */}
      <div className="w-full max-w-md relative animate-in fade-in zoom-in duration-700">
        <div className="absolute inset-0 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl z-0" />
        
        <div className="relative z-10 p-8 sm:p-10">
          <div className="flex justify-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-accent to-secondary rounded-2xl flex items-center justify-center shadow-lg shadow-accent/20">
              <LayoutDashboard size={32} className="text-white" />
            </div>
          </div>
          
          <div className="text-center mb-10">
            <h1 className="text-3xl font-extrabold tracking-tight mb-2">
              {t('welcomeBack')}
            </h1>
            <p className="text-muted-foreground">{t('signInToOperations')}</p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-destructive/10 border border-destructive/20 flex items-center gap-3 text-destructive animate-in slide-in-from-top-2">
              <AlertCircle size={20} className="shrink-0" />
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold tracking-wide text-foreground/80 lowercase select-none">
                {t('username')}
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-accent transition-colors">
                  <User size={18} />
                </div>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-muted/30 border border-border rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent outline-none transition-all placeholder:text-muted-foreground/50 shadow-inner"
                  placeholder="admin"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold tracking-wide text-foreground/80 lowercase select-none">
                {t('password')}
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-accent transition-colors">
                  <Lock size={18} />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-muted/30 border border-border rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent outline-none transition-all placeholder:text-muted-foreground/50 shadow-inner"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="relative w-full overflow-hidden rounded-lg bg-accent text-accent-foreground font-semibold py-3.5 transition-all hover:shadow-md active:scale-[0.98] mt-4 disabled:opacity-70 disabled:active:scale-100"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 size={18} className="animate-spin" />
                  {t('authenticating')}
                </span>
              ) : (
                <span className="flex items-center justify-center">{t('signIn')}</span>
              )}
            </button>
          </form>
          
          <div className="mt-8 text-center">
            <p className="text-xs text-muted-foreground/70">
              {t('demoCredentials')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
