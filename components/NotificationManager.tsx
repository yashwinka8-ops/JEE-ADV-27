'use client';

import { useState, useEffect, useCallback } from 'react';
import { Bell, BellOff, Clock, X, Check, Trash2 } from 'lucide-react';
import AppleEmoji from './AppleEmoji';

interface StudyReminder {
  id: string;
  time: string;      // HH:mm format
  label: string;
  enabled: boolean;
}

const DEFAULT_REMINDERS: StudyReminder[] = [
  { id: '1', time: '06:00', label: 'Morning Study Session', enabled: true },
  { id: '2', time: '14:00', label: 'Afternoon Revision', enabled: true },
  { id: '3', time: '20:00', label: 'Evening Practice', enabled: true },
];

const MOTIVATIONAL_MESSAGES = [
  "Time to study! 🔥 Your JEE goals won't achieve themselves.",
  "Back to the grind! 💪 Every hour counts towards AIR 1.",
  "Study time! 📚 Consistency beats talent every single day.",
  "Let's go! 🚀 Your future self will thank you.",
  "Focus mode activated! 🧠 JEE Advanced is waiting.",
  "Rise and grind! ⚡ Champions study when others sleep.",
];

export default function NotificationManager() {
  const [isOpen, setIsOpen] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [reminders, setReminders] = useState<StudyReminder[]>([]);
  const [newTime, setNewTime] = useState('08:00');
  const [newLabel, setNewLabel] = useState('');
  const [swRegistered, setSwRegistered] = useState(false);

  // Load reminders from localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;
    setPermission(Notification.permission);

    const saved = localStorage.getItem('lifeos_reminders');
    if (saved) {
      try { setReminders(JSON.parse(saved)); } catch { setReminders(DEFAULT_REMINDERS); }
    } else {
      setReminders(DEFAULT_REMINDERS);
    }

    // Register service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then(() => setSwRegistered(true))
        .catch(err => console.error('SW registration failed:', err));
    }
  }, []);

  // Save reminders to localStorage
  useEffect(() => {
    if (reminders.length > 0) {
      localStorage.setItem('lifeos_reminders', JSON.stringify(reminders));
    }
  }, [reminders]);

  // Schedule notifications based on reminders
  useEffect(() => {
    if (permission !== 'granted' || !swRegistered) return;

    const checkAndNotify = () => {
      const now = new Date();
      const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

      reminders.forEach(r => {
        if (r.enabled && r.time === currentTime) {
          const msg = MOTIVATIONAL_MESSAGES[Math.floor(Math.random() * MOTIVATIONAL_MESSAGES.length)];
          new Notification(`📚 ${r.label}`, {
            body: msg,
            icon: '/favicon.ico',
            tag: `reminder-${r.id}`,
          });
        }
      });
    };

    // Check every minute
    const interval = setInterval(checkAndNotify, 60000);
    return () => clearInterval(interval);
  }, [permission, reminders, swRegistered]);

  const requestPermission = async () => {
    const result = await Notification.requestPermission();
    setPermission(result);
    if (result === 'granted') {
      new Notification('🎉 Notifications Enabled!', {
        body: 'You\'ll now receive study reminders. Stay focused!',
        icon: '/favicon.ico',
      });
    }
  };

  const addReminder = () => {
    if (!newTime) return;
    const r: StudyReminder = {
      id: Math.random().toString(36).slice(2),
      time: newTime,
      label: newLabel || 'Study Reminder',
      enabled: true,
    };
    setReminders(prev => [...prev, r]);
    setNewLabel('');
  };

  const toggleReminder = (id: string) => {
    setReminders(prev => prev.map(r => r.id === id ? { ...r, enabled: !r.enabled } : r));
  };

  const removeReminder = (id: string) => {
    setReminders(prev => prev.filter(r => r.id !== id));
  };

  const testNotification = useCallback(() => {
    if (permission === 'granted') {
      const msg = MOTIVATIONAL_MESSAGES[Math.floor(Math.random() * MOTIVATIONAL_MESSAGES.length)];
      new Notification('🔔 Test Notification', { body: msg, icon: '/favicon.ico' });
    }
  }, [permission]);

  const activeCount = reminders.filter(r => r.enabled).length;

  return (
    <>
      {/* Bell Icon Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: 44, height: 44, borderRadius: 12, display: 'flex', alignItems: 'center',
          justifyContent: 'center', background: isOpen ? 'rgba(250,204,21,0.15)' : 'transparent',
          border: 'none', cursor: 'pointer', position: 'relative', transition: 'all 0.2s',
          boxShadow: isOpen ? '0 0 16px rgba(250,204,21,0.3), inset 0 0 0 1px rgba(250,204,21,0.3)' : 'none',
        }}
        title="Study Reminders"
      >
        <Bell size={20} color={permission === 'granted' ? '#facc15' : '#6b7280'} />
        {activeCount > 0 && permission === 'granted' && (
          <span style={{
            position: 'absolute', top: 6, right: 6, width: 8, height: 8,
            background: '#22c55e', borderRadius: '50%', border: '2px solid #020209',
          }} />
        )}
      </button>

      {/* Notification Panel */}
      {isOpen && (
        <div style={{
          position: 'fixed', left: 80, bottom: 20, width: 360, maxHeight: '80vh',
          background: 'rgba(10,12,20,0.97)', backdropFilter: 'blur(30px)',
          border: '1px solid rgba(255,255,255,0.08)', borderRadius: 24,
          boxShadow: '0 20px 60px rgba(0,0,0,0.6)', zIndex: 300,
          overflow: 'hidden', animation: 'fadeUp 0.2s ease-out',
        }}>
          {/* Header */}
          <div style={{
            padding: '20px 24px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <AppleEmoji emoji="🔔" size={22} />
              <span style={{ fontWeight: 800, fontSize: 16, color: '#f8fafc' }}>Study Reminders</span>
            </div>
            <button onClick={() => setIsOpen(false)} style={{
              background: 'none', border: 'none', cursor: 'pointer', padding: 4,
            }}>
              <X size={18} color="#6b7280" />
            </button>
          </div>

          <div style={{ padding: '16px 24px', overflowY: 'auto', maxHeight: 'calc(80vh - 120px)' }}>
            {/* Permission Banner */}
            {permission !== 'granted' && (
              <button onClick={requestPermission} style={{
                width: '100%', padding: '14px 16px', background: 'linear-gradient(135deg, rgba(250,204,21,0.15), rgba(245,158,11,0.15))',
                border: '1px solid rgba(250,204,21,0.2)', borderRadius: 16, cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16,
              }}>
                <BellOff size={20} color="#facc15" />
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontWeight: 700, fontSize: 13, color: '#facc15' }}>Enable Notifications</div>
                  <div style={{ fontSize: 11, color: 'rgba(250,204,21,0.6)', marginTop: 2 }}>
                    Get study reminders to stay on track
                  </div>
                </div>
              </button>
            )}

            {permission === 'granted' && (
              <button onClick={testNotification} style={{
                width: '100%', padding: '10px', background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, cursor: 'pointer',
                color: '#94a3b8', fontSize: 12, fontWeight: 600, marginBottom: 16,
                transition: 'background 0.2s',
              }}>
                🔔 Send Test Notification
              </button>
            )}

            {/* Reminder List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
              {reminders.map(r => (
                <div key={r.id} style={{
                  display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px',
                  background: r.enabled ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.01)',
                  borderRadius: 14, border: '1px solid rgba(255,255,255,0.05)',
                  opacity: r.enabled ? 1 : 0.5, transition: 'all 0.2s',
                }}>
                  <button onClick={() => toggleReminder(r.id)} style={{
                    background: r.enabled ? 'rgba(34,197,94,0.15)' : 'rgba(255,255,255,0.05)',
                    border: `1px solid ${r.enabled ? 'rgba(34,197,94,0.3)' : 'rgba(255,255,255,0.1)'}`,
                    borderRadius: 8, width: 28, height: 28, display: 'flex', alignItems: 'center',
                    justifyContent: 'center', cursor: 'pointer', flexShrink: 0,
                  }}>
                    {r.enabled && <Check size={14} color="#22c55e" />}
                  </button>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#f8fafc' }}>{r.label}</div>
                    <div style={{ fontSize: 11, color: '#64748b', display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                      <Clock size={10} /> {r.time}
                    </div>
                  </div>
                  <button onClick={() => removeReminder(r.id)} style={{
                    background: 'none', border: 'none', cursor: 'pointer', padding: 4, flexShrink: 0,
                  }}>
                    <Trash2 size={14} color="#ef4444" />
                  </button>
                </div>
              ))}
            </div>

            {/* Add New Reminder */}
            <div style={{
              padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: 16,
              border: '1px solid rgba(255,255,255,0.05)',
            }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#94a3b8', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Add Reminder
              </div>
              <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                <input
                  type="time"
                  value={newTime}
                  onChange={e => setNewTime(e.target.value)}
                  style={{
                    background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 10, padding: '8px 12px', color: '#f8fafc', fontSize: 14,
                    outline: 'none', width: 110, fontFamily: 'monospace',
                  }}
                />
                <input
                  type="text"
                  placeholder="Label (optional)"
                  value={newLabel}
                  onChange={e => setNewLabel(e.target.value)}
                  style={{
                    flex: 1, background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 10, padding: '8px 12px', color: '#f8fafc', fontSize: 13,
                    outline: 'none',
                  }}
                />
              </div>
              <button onClick={addReminder} style={{
                width: '100%', padding: '10px', background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                border: 'none', borderRadius: 12, color: '#000', fontWeight: 700, fontSize: 13,
                cursor: 'pointer', transition: 'transform 0.2s',
              }}>
                + Add Reminder
              </button>
            </div>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @media (max-width: 768px) {
          div[style*="left: 80"] {
            left: 16px !important;
            right: 16px !important;
            bottom: 80px !important;
            width: auto !important;
          }
        }
      `}} />
    </>
  );
}
