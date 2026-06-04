'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import AppleEmoji from '@/components/AppleEmoji';

const SECTIONS = [
  { href: '/personal',               emoji: '🏠', label: 'Home',          glow: '#f59e0b' },
  { href: '/personal/journal',       emoji: '📖', label: 'Journal',       glow: '#ec4899' },
  { href: '/personal/goals',         emoji: '🎯', label: 'Goals',         glow: '#22d3ee' },
  { href: '/personal/rpg',           emoji: '🎮', label: 'Life RPG',      glow: '#a855f7' },
  { href: '/personal/brain',         emoji: '🧠', label: 'Second Brain',  glow: '#f97316' },
  { href: '/personal/relationships', emoji: '❤️', label: 'Relationships', glow: '#ef4444' },
  { href: '/personal/money',         emoji: '💰', label: 'Money',         glow: '#10b981' },
  { href: '/personal/health',        emoji: '🏥', label: 'Health',        glow: '#14b8a6' },
  { href: '/personal/dreams',        emoji: '🌎', label: 'Dreams Vault',  glow: '#3b82f6' },
  { href: '/personal/analytics',     emoji: '📈', label: 'Analytics',     glow: '#84cc16' },
  { href: '/personal/future',        emoji: '💌', label: 'Future',        glow: '#f59e0b' },
  { href: '/personal/self',          emoji: '🧩', label: 'Self',          glow: '#8b5cf6' },
];

const PASSWORD = '240622';

export default function PersonalLayout({ children }: { children: React.ReactNode }) {
  const [password, setPassword]   = useState('');
  const [authed,   setAuthed]     = useState(false);
  const [error,    setError]      = useState(false);
  const [tooltip,  setTooltip]    = useState('');
  const [mounted,  setMounted]    = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  /* ── Password Gate ─────────────────────────────────── */
  if (!authed) {
    return (
      <div style={{
        minHeight: '100vh', background: '#020209',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: 'Inter, sans-serif', position: 'relative', overflow: 'hidden',
      }}>
        {/* Star BG */}
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(168,85,247,0.12) 0%, transparent 70%)' }} />
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.15) 1px, transparent 1px)', backgroundSize: '40px 40px', opacity: 0.4 }} />

        <div style={{
          position: 'relative', zIndex: 10,
          background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(24px)',
          border: '1px solid rgba(255,255,255,0.08)', borderRadius: 28,
          padding: '56px 48px', maxWidth: 400, width: '90%', textAlign: 'center',
          boxShadow: '0 0 80px rgba(168,85,247,0.15)',
        }}>
          <div style={{ fontSize: 52, marginBottom: 4 }}>✦</div>
          <h1 style={{
            fontSize: 32, fontWeight: 900, letterSpacing: '-1px', marginBottom: 6,
            background: 'linear-gradient(135deg, #f59e0b 0%, #ec4899 100%)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>Life OS</h1>
          <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: 13, marginBottom: 36 }}>
            Your private universe. Password required.
          </p>
          <form onSubmit={e => {
            e.preventDefault();
            if (password === PASSWORD) { setAuthed(true); }
            else { setError(true); setPassword(''); }
          }} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <input
              type="password" placeholder="••••••"
              value={password} onChange={e => { setPassword(e.target.value); setError(false); }}
              autoFocus
              style={{
                background: 'rgba(255,255,255,0.05)', border: `1px solid ${error ? '#ef4444' : 'rgba(255,255,255,0.1)'}`,
                borderRadius: 14, padding: '16px', color: '#fff', fontSize: 20, outline: 'none',
                textAlign: 'center', letterSpacing: 10, fontFamily: 'monospace',
              }}
            />
            {error && <p style={{ color: '#ef4444', fontSize: 12, margin: 0 }}>Wrong password.</p>}
            <button type="submit" style={{
              background: 'linear-gradient(135deg, #f59e0b, #ec4899)',
              border: 'none', borderRadius: 14, padding: '14px', color: '#000',
              fontWeight: 800, fontSize: 14, cursor: 'pointer', letterSpacing: 0.5,
            }}>ENTER YOUR UNIVERSE</button>
          </form>
          <div style={{ marginTop: 24 }}>
            <Link href="/" style={{ color: 'rgba(255,255,255,0.2)', fontSize: 12, textDecoration: 'none' }}>
              ← Back to JEE Tracker
            </Link>
          </div>
        </div>
      </div>
    );
  }

  /* ── Main App Shell ─────────────────────────────────── */
  return (
    <div style={{ minHeight: '100vh', background: '#020209', display: 'flex', fontFamily: 'Inter, sans-serif', position: 'relative' }}>

      {/* Global BG glow */}
      <div style={{ position: 'fixed', inset: 0, background: 'radial-gradient(ellipse 60% 40% at 50% 0%, rgba(168,85,247,0.08) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'fixed', inset: 0, backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.08) 1px, transparent 1px)', backgroundSize: '48px 48px', opacity: 0.3, pointerEvents: 'none', zIndex: 0 }} />

      {/* ── Ultra-minimal Icon Sidebar ── */}
      <aside style={{
        position: 'fixed', left: 0, top: 0, bottom: 0, width: 70,
        background: 'rgba(255,255,255,0.02)', borderRight: '1px solid rgba(255,255,255,0.04)',
        backdropFilter: 'blur(20px)', zIndex: 100,
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        padding: '20px 0', gap: 6,
      }}>
        {/* Logo mark */}
        <div style={{ fontSize: 20, marginBottom: 16, opacity: 0.8 }}>✦</div>

        {SECTIONS.map(s => {
          const isActive = pathname === s.href;
          return (
            <Link key={s.href} href={s.href}
              onMouseEnter={() => setTooltip(s.label)}
              onMouseLeave={() => setTooltip('')}
              style={{
                width: 44, height: 44, borderRadius: 12, display: 'flex', alignItems: 'center',
                justifyContent: 'center', textDecoration: 'none', fontSize: 20, transition: 'all 0.2s',
                background: isActive ? `${s.glow}20` : 'transparent',
                boxShadow: isActive ? `0 0 16px ${s.glow}40, inset 0 0 0 1px ${s.glow}30` : 'none',
                transform: isActive ? 'scale(1.05)' : 'scale(1)',
                position: 'relative',
              }}
            >
              <AppleEmoji emoji={s.emoji} size={20} />
              {/* Tooltip */}
              {tooltip === s.label && (
                <div style={{
                  position: 'absolute', left: 54, top: '50%', transform: 'translateY(-50%)',
                  background: 'rgba(10,10,20,0.95)', border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 8, padding: '6px 12px', fontSize: 12, fontWeight: 600,
                  color: '#fff', whiteSpace: 'nowrap', pointerEvents: 'none', zIndex: 200,
                }}>
                  {s.label}
                </div>
              )}
            </Link>
          );
        })}

        {/* Back link at bottom */}
        <div style={{ marginTop: 'auto' }}>
          <Link href="/" title="Back to JEE Tracker" style={{
            width: 44, height: 44, borderRadius: 12, display: 'flex', alignItems: 'center',
            justifyContent: 'center', textDecoration: 'none', fontSize: 18, opacity: 0.3,
            transition: 'opacity 0.2s',
          }}>
            ←
          </Link>
        </div>
      </aside>

      {/* ── Main Content ── */}
      <main style={{
        marginLeft: 70, flex: 1, padding: '48px 56px',
        position: 'relative', zIndex: 1, overflowY: 'auto', minHeight: '100vh',
      }}>
        {children}
      </main>

      <style dangerouslySetInnerHTML={{__html: `
        @media (max-width: 768px) {
          aside { width: 100% !important; height: 60px !important; bottom: 0 !important; top: auto !important; flex-direction: row !important; padding: 0 12px !important; justify-content: flex-start !important; overflow-x: auto !important; overflow-y: hidden !important; gap: 12px !important; white-space: nowrap !important; border-top: 1px solid rgba(255,255,255,0.05) !important; border-right: none !important; }
          aside::-webkit-scrollbar { display: none; }
          aside > div:first-child { display: none !important; }
          aside a { width: 44px !important; height: 44px !important; flex-shrink: 0 !important; }
          main { margin-left: 0 !important; margin-bottom: 60px !important; padding: 24px 16px !important; }
          
          /* Utility Classes for Mobile Responsive Layouts */
          .mobile-col { flex-direction: column !important; }
          .mobile-grid-1 { grid-template-columns: 1fr !important; }
          .mobile-grid-2 { grid-template-columns: 1fr 1fr !important; }
          .mobile-w-full { width: 100% !important; }
          .mobile-hide { display: none !important; }
          .mobile-text-center { text-align: center !important; }
          .mobile-gap-16 { gap: 16px !important; }
          
          /* Component Specific Overrides */
          .dashboard-grid { display: flex !important; flex-direction: column !important; }
          .dashboard-grid > div { width: 100% !important; }
          .dashboard-apps-grid { grid-template-columns: 1fr !important; gap: 16px !important; }
          .rel-container { flex-direction: column !important; min-height: auto !important; }
          .rel-left { width: 100% !important; margin-bottom: 24px; }
          .money-hero { flex-direction: column !important; gap: 16px !important; }
          .money-hero > div { width: 100% !important; height: 1px; }
          .money-form { grid-template-columns: 1fr !important; }
        }
      `}} />
    </div>
  );
}
