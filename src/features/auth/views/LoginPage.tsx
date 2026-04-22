'use client';

import { useAuthViewModel } from '@/features/auth/viewmodels/useAuthViewModel';
import './LoginPage.css';

export default function LoginPage() {
  const {
    email,
    setEmail,
    password,
    setPassword,
    error,
    isSubmitting,
    handleLogin,
  } = useAuthViewModel();

  return (
    <div className="login-page">
      <div className="login-card">
        <h1 className="login-title">De Olho no Bueiro</h1>
        <p className="login-subtitle">Acesse sua conta para continuar</p>

        <div className="login-form">
          <div className="login-field">
            <label className="login-label">E-mail</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              className="login-input"
            />
          </div>

          <div className="login-field">
            <label className="login-label">Senha</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              className="login-input"
            />
          </div>

          {error && <p className="login-error">{error}</p>}

          <button
            onClick={handleLogin}
            disabled={isSubmitting}
            className="login-button"
          >
            {isSubmitting ? 'Entrando...' : 'Entrar'}
          </button>
        </div>
      </div>
    </div>
  );
}
