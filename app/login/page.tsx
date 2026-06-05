'use client';

import { useState } from 'react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
      // AuthGuard will automatically detect the state change and redirect to '/'
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/invalid-credential') {
        setError('Invalid email or password.');
      } else if (err.code === 'auth/email-already-in-use') {
        setError('Email already in use. Try logging in.');
      } else if (err.code === 'auth/weak-password') {
        setError('Password must be at least 6 characters.');
      } else {
        setError(err.message || 'An error occurred.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', background: '#020209',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'Inter, sans-serif', position: 'relative', overflow: 'hidden',
    }}>
      {/* Background ambient glows */}
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(59,130,246,0.12) 0%, transparent 70%)' }} />
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.08) 1px, transparent 1px)', backgroundSize: '40px 40px', opacity: 0.4 }} />

      <div style={{
        position: 'relative', zIndex: 10,
        background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(24px)',
        border: '1px solid rgba(255,255,255,0.08)', borderRadius: 28,
        padding: '56px 48px', maxWidth: 420, width: '90%', textAlign: 'center',
        boxShadow: '0 0 80px rgba(59,130,246,0.15)',
      }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>✦</div>
        <h1 style={{
          fontSize: 28, fontWeight: 900, letterSpacing: '-0.5px', marginBottom: 8,
          background: 'linear-gradient(135deg, #ffffff 0%, #cbd5e1 100%)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
        }}>
          {isLogin ? 'Welcome Back' : 'Create Account'}
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14, marginBottom: 32 }}>
          {isLogin ? 'Sign in to sync your universe.' : 'Join to start syncing your universe.'}
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <input
            type="email" placeholder="Email address"
            value={email} onChange={e => setEmail(e.target.value)}
            required
            style={{
              background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 14, padding: '16px', color: '#fff', fontSize: 15, outline: 'none',
              transition: 'all 0.2s'
            }}
          />
          <input
            type="password" placeholder="Password"
            value={password} onChange={e => setPassword(e.target.value)}
            required
            style={{
              background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 14, padding: '16px', color: '#fff', fontSize: 15, outline: 'none',
              transition: 'all 0.2s'
            }}
          />
          
          {error && <div style={{ color: '#ef4444', fontSize: 13, background: 'rgba(239,68,68,0.1)', padding: '8px 12px', borderRadius: 8 }}>{error}</div>}
          
          <button type="submit" disabled={loading} style={{
            background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
            border: 'none', borderRadius: 14, padding: '16px', color: '#fff',
            fontWeight: 700, fontSize: 15, cursor: loading ? 'wait' : 'pointer', 
            letterSpacing: 0.5, marginTop: 8, opacity: loading ? 0.7 : 1,
            boxShadow: '0 4px 20px rgba(59,130,246,0.3)', transition: 'all 0.2s'
          }}>
            {loading ? 'Processing...' : (isLogin ? 'SIGN IN' : 'SIGN UP')}
          </button>
        </form>

        <div style={{ marginTop: 32, fontSize: 14, color: 'rgba(255,255,255,0.5)' }}>
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button 
            onClick={() => { setIsLogin(!isLogin); setError(''); }}
            style={{ 
              background: 'none', border: 'none', color: '#60a5fa', 
              cursor: 'pointer', fontWeight: 600, padding: 0 
            }}
          >
            {isLogin ? 'Sign up' : 'Log in'}
          </button>
        </div>
      </div>
    </div>
  );
}
