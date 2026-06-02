'use client';

import { useState } from 'react';
import { Lock, Unlock } from 'lucide-react';

export default function PersonalPage() {
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === '240622') {
      setIsAuthenticated(true);
      setError(false);
    } else {
      setError(true);
      setPassword('');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="fade-in-up" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div className="card" style={{ padding: 40, maxWidth: 400, width: '100%', textAlign: 'center' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
            <div style={{ background: 'var(--bg-tertiary)', padding: 16, borderRadius: '50%' }}>
              <Lock size={32} color="var(--label-secondary)" />
            </div>
          </div>
          <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>Restricted Access</h2>
          <p style={{ color: 'var(--label-secondary)', marginBottom: 24 }}>Please enter the password to view this page.</p>
          
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <input 
              type="password" 
              className="input text-center" 
              placeholder="Enter Password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoFocus
            />
            {error && <p style={{ color: 'var(--red)', fontSize: 13 }}>Incorrect password. Try again.</p>}
            <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
              <Unlock size={18} /> Unlock
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="fade-in-up" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', textAlign: 'center' }}>
      <h1 style={{ fontSize: 48, fontWeight: 800, color: 'var(--purple)', marginBottom: 16 }}>Personal</h1>
      <p style={{ fontSize: 20, color: 'var(--label-secondary)', maxWidth: 600 }}>
        Welcome to your personal space.
      </p>
      
      <div style={{ marginTop: 40, padding: '20px 40px', background: 'var(--bg-tertiary)', borderRadius: 100, border: '1px solid var(--separator)' }}>
        <span style={{ fontSize: 18, fontWeight: 600, color: 'var(--label-primary)', letterSpacing: 2, textTransform: 'uppercase' }}>
          Coming Soon
        </span>
      </div>
    </div>
  );
}
