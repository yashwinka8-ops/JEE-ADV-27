'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, BookOpen, Timer, FlaskConical, BarChart3,
  XCircle, Calendar, HelpCircle, Notebook, ScrollText, Flame, ChevronDown
} from 'lucide-react';
import { useStore } from '@/store/useStore';
import { useEffect, useState } from 'react';

const NAV_ITEMS = [
  { href: '/',          label: 'Dashboard',    icon: LayoutDashboard },
  { href: '/syllabus',  label: 'Syllabus',     icon: BookOpen },
  { href: '/timer',     label: 'Timer',        icon: Timer },
  { href: '/planner',   label: 'Planner',      icon: Calendar },
  { href: '/tests',     label: 'Tests',        icon: FlaskConical },
  { href: '/pyq',       label: 'PYQ',          icon: ScrollText },
  { href: '/mistakes',  label: 'Mistakes',     icon: XCircle },
  { href: '/analytics', label: 'Analytics',    icon: BarChart3 },
  { href: '/doubts',    label: 'Doubts',       icon: HelpCircle },
  { href: '/notes',     label: 'Notes',        icon: Notebook },
];

export default function TopNav() {
  const pathname = usePathname();
  const { getCurrentStreak } = useStore();
  const [streak, setStreak] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [showProjectMenu, setShowProjectMenu] = useState(false);

  useEffect(() => {
    setStreak(getCurrentStreak());
    setMounted(true);
  }, [getCurrentStreak]);

  const targetDate = new Date('2027-05-25');
  const today = new Date();
  const diffTime = targetDate.getTime() - today.getTime();
  const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (!mounted) return <div className="topnav" />; // Skeleton

  return (
    <nav className="topnav">
      <div className="topnav-inner">
        <div className="topnav-logo" style={{ position: 'relative' }}>
          <h1 
            onClick={() => setShowProjectMenu(!showProjectMenu)} 
            style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
          >
            JEE Adv '27 <ChevronDown size={14} />
          </h1>
          
          {showProjectMenu && (
            <div 
              style={{
                position: 'absolute', top: '100%', left: 0, marginTop: 8,
                background: 'var(--bg-secondary)', border: '1px solid var(--separator)',
                borderRadius: 8, padding: 8, display: 'flex', flexDirection: 'column', gap: 4,
                boxShadow: '0 10px 30px rgba(0,0,0,0.5)', zIndex: 100, minWidth: 150
              }}
            >
              <Link href="/" onClick={() => setShowProjectMenu(false)} style={{ padding: '8px 12px', borderRadius: 6, textDecoration: 'none', color: 'var(--label-primary)' }}>JEE Adv '27</Link>
              <Link href="/engineering" onClick={() => setShowProjectMenu(false)} style={{ padding: '8px 12px', borderRadius: 6, textDecoration: 'none', color: 'var(--label-primary)' }}>Engineering</Link>
              <Link href="/personal" onClick={() => setShowProjectMenu(false)} style={{ padding: '8px 12px', borderRadius: 6, textDecoration: 'none', color: 'var(--label-primary)' }}>Personal</Link>
            </div>
          )}
        </div>

        <div className="topnav-links">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`topnav-link ${isActive ? 'active' : ''}`}
                title={item.label}
              >
                <Icon className="nav-icon" />
                <span className="hide-on-mobile">{item.label}</span>
              </Link>
            );
          })}
        </div>

        <div className="topnav-actions">
          <div className="topnav-streak" title={`${streak} day streak`}>
            <Flame size={15} color="#ff9f0a" />
            <span style={{ fontWeight: 700, color: '#ff9f0a', fontSize: 13 }}>{streak}</span>
          </div>
          <div className="topnav-countdown">
            <span className="days">{daysLeft}</span>
            <span className="label">Days</span>
          </div>
        </div>
      </div>
    </nav>
  );
}
