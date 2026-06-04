'use client';

import { useState, useEffect, useRef } from 'react';
import { useStore } from '@/store/useStore';
import type { JournalEntry } from '@/store/useStore';
import { Save, ChevronLeft, ChevronRight, Trash2 } from 'lucide-react';

/* ── helpers ── */
const todayStr = () => new Date().toISOString().slice(0, 10);
const fmt = (d: string) =>
  new Date(d + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

const MOODS = [
  { e: '😄', label: 'Happy',   color: '#f59e0b' },
  { e: '😊', label: 'Good',    color: '#10b981' },
  { e: '😐', label: 'Okay',    color: '#6b7280' },
  { e: '😔', label: 'Sad',     color: '#3b82f6' },
  { e: '😤', label: 'Angry',   color: '#ef4444' },
  { e: '😰', label: 'Anxious', color: '#a855f7' },
  { e: '💪', label: 'Strong',  color: '#22d3ee' },
  { e: '🥳', label: 'Excited', color: '#ec4899' },
  { e: '😴', label: 'Tired',   color: '#8b5cf6' },
  { e: '🤔', label: 'Focused', color: '#f97316' },
];

/* ── mini calendar helpers ── */
function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}
function getFirstDay(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

/* ── paper textarea ── */
function PaperArea({ value, onChange, placeholder, minH = 128 }: { value: string; onChange: (v: string) => void; placeholder: string; minH?: number }) {
  return (
    <textarea
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      style={{
        width: '100%', 
        background: 'transparent',
        border: 'none',
        color: '#2b2a27', 
        fontSize: 16,
        lineHeight: '32px', 
        resize: 'none', 
        minHeight: minH, 
        outline: 'none',
        fontFamily: 'Georgia, serif', 
        backgroundImage: 'repeating-linear-gradient(transparent, transparent 31px, rgba(0,0,0,0.1) 31px, rgba(0,0,0,0.1) 32px)',
        backgroundAttachment: 'local',
      }}
    />
  );
}

function SectionHeading({ title }: { title: string }) {
  return (
    <div style={{ 
      fontFamily: 'Georgia, serif', 
      fontSize: 18, 
      fontWeight: 'bold', 
      color: '#4a4843', 
      marginBottom: 8, 
      marginTop: 24,
      borderBottom: '2px solid rgba(0,0,0,0.1)',
      display: 'inline-block',
      paddingBottom: 4
    }}>
      {title}
    </div>
  );
}

export default function JournalPage() {
  const { journalEntries, upsertJournalEntry, removeJournalEntry } = useStore();

  /* date state */
  const today = todayStr();
  const [selDate, setSelDate] = useState(today);
  const [view, setView] = useState<'write' | 'history'>('write');

  /* calendar nav */
  const now = new Date();
  const [calYear,  setCalYear]  = useState(now.getFullYear());
  const [calMonth, setCalMonth] = useState(now.getMonth());

  /* form */
  const existing = journalEntries.find(e => e.date === selDate);
  const [mood,     setMood]     = useState('😊');
  const [what,     setWhat]     = useState('');
  const [wins,     setWins]     = useState('');
  const [failures, setFailures] = useState('');
  const [notes,    setNotes]    = useState('');
  const [saved,    setSaved]    = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (existing) {
      setMood(existing.mood); setWhat(existing.what);
      setWins(existing.wins); setFailures(existing.failures); setNotes(existing.notes);
    } else {
      setMood('😊'); setWhat(''); setWins(''); setFailures(''); setNotes('');
    }
    setSaved(false);
  }, [selDate, existing?.id]);

  const save = () => {
    upsertJournalEntry({ id: existing?.id || Math.random().toString(36).slice(2), date: selDate, mood, what, wins, failures, notes });
    setSaved(true);
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => setSaved(false), 2000);
  };

  /* streak */
  const streak = (() => {
    let s = 0;
    const d = new Date();
    while (journalEntries.find(e => e.date === d.toISOString().slice(0, 10))) {
      s++; d.setDate(d.getDate() - 1);
    }
    return s;
  })();

  /* calendar */
  const entryDates = new Set(journalEntries.map(e => e.date));
  const daysInMonth = getDaysInMonth(calYear, calMonth);
  const firstDay    = getFirstDay(calYear, calMonth);
  const monthLabel  = new Date(calYear, calMonth).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const activeMood = MOODS.find(m => m.e === mood) || MOODS[0];

  return (
    <div style={{ color: '#f0f0f0', fontFamily: 'Inter, sans-serif', display: 'flex', gap: 40, minHeight: 'calc(100vh - 96px)', animation: 'lifeIn 0.4s ease-out' }}>

      {/* ── Left: Mini Calendar Panel ─────────────────── */}
      <div style={{ width: 260, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* Streak badge */}
        {streak > 0 && (
          <div style={{
            background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)',
            borderRadius: 16, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10
          }}>
            <span style={{ fontSize: 24 }}>🔥</span>
            <div>
              <div style={{ fontWeight: 800, fontSize: 20, color: '#f59e0b', lineHeight: 1 }}>{streak}</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginTop: 2 }}>day streak</div>
            </div>
          </div>
        )}

        {/* Calendar */}
        <div style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 20, padding: 20 }}>
          {/* Month nav */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, marginBottom: 16 }}>
            <button onClick={() => { if (calMonth === 0) { setCalMonth(11); setCalYear(y => y - 1); } else setCalMonth(m => m - 1); }}
              style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', cursor: 'pointer', padding: 4 }}>
              <ChevronLeft size={14} />
            </button>
            <span style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.5)', letterSpacing: 0.5 }}>{monthLabel}</span>
            <button onClick={() => { if (calMonth === 11) { setCalMonth(0); setCalYear(y => y + 1); } else setCalMonth(m => m + 1); }}
              style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', cursor: 'pointer', padding: 4 }}>
              <ChevronRight size={14} />
            </button>
          </div>

          {/* Day headers */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2, marginBottom: 4 }}>
            {['S','M','T','W','T','F','S'].map((d, i) => (
              <div key={i} style={{ textAlign: 'center', fontSize: 10, color: 'rgba(255,255,255,0.2)', fontWeight: 700, padding: '4px 0' }}>{d}</div>
            ))}
          </div>

          {/* Day grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2 }}>
            {Array.from({ length: firstDay }).map((_, i) => <div key={`e-${i}`} />)}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const d = i + 1;
              const dateStr = `${calYear}-${String(calMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
              const hasEntry = entryDates.has(dateStr);
              const isSelected = dateStr === selDate;
              const isToday = dateStr === today;
              return (
                <button key={d} onClick={() => { setSelDate(dateStr); setView('write'); }}
                  style={{
                    aspectRatio: '1', borderRadius: 8, border: 'none', cursor: 'pointer',
                    fontSize: 11, fontWeight: isToday ? 800 : 400, position: 'relative',
                    background: isSelected ? 'rgba(236,72,153,0.3)' : 'transparent',
                    color: isSelected ? '#ec4899' : isToday ? '#f59e0b' : 'rgba(255,255,255,0.5)',
                    outline: isToday ? '1px solid rgba(245,158,11,0.3)' : 'none',
                    transition: 'all 0.15s',
                  }}>
                  {d}
                  {hasEntry && !isSelected && (
                    <div style={{ position: 'absolute', bottom: 3, left: '50%', transform: 'translateX(-50%)', width: 4, height: 4, borderRadius: '50%', background: '#ec4899', opacity: 0.7 }} />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* View toggle */}
        <div style={{ display: 'flex', gap: 8 }}>
          {(['write', 'history'] as const).map(v => (
            <button key={v} onClick={() => setView(v)} style={{
              flex: 1, padding: '9px', borderRadius: 12, border: 'none', fontWeight: 600,
              fontSize: 12, cursor: 'pointer', letterSpacing: 0.5, textTransform: 'uppercase',
              background: view === v ? 'rgba(236,72,153,0.15)' : 'rgba(255,255,255,0.03)',
              color: view === v ? '#ec4899' : 'rgba(255,255,255,0.3)',
              transition: 'all 0.15s',
            }}>
              {v === 'write' ? '✏️ Write' : '📚 History'}
            </button>
          ))}
        </div>

        {/* Entry count */}
        <div style={{ padding: '12px 16px', background: 'rgba(255,255,255,0.02)', borderRadius: 14, border: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ fontSize: 28, fontWeight: 900, color: 'rgba(255,255,255,0.7)' }}>{journalEntries.length}</div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', marginTop: 2 }}>total entries written</div>
        </div>
      </div>

      {/* ── Right: Writing / History Area ─────────────── */}
      <div style={{ flex: 1, maxWidth: 800 }}>

        {view === 'write' && (
          <div style={{ 
            background: '#fdfbf7', /* Paper color */
            borderRadius: 4,
            boxShadow: '0 20px 50px rgba(0,0,0,0.5), inset 0 0 40px rgba(0,0,0,0.03)',
            padding: '48px 56px',
            position: 'relative',
            animation: 'lifeIn 0.3s ease-out',
            color: '#2b2a27',
          }}>
            {/* Red margin line simulating notebook paper */}
            <div style={{ position: 'absolute', left: 40, top: 0, bottom: 0, width: 2, background: 'rgba(239, 68, 68, 0.3)' }} />
            
            <div style={{ position: 'relative', zIndex: 10, paddingLeft: 16 }}>
              {/* Date header & Delete */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, marginBottom: 32 }}>
                <div>
                  <div style={{ fontFamily: 'Georgia, serif', fontSize: 14, color: '#7a7873', marginBottom: 4, fontStyle: 'italic' }}>
                    {selDate === today ? 'Today' : 'Past Entry'}
                  </div>
                  <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 32, fontWeight: 'normal', color: '#1a1a1a', margin: 0 }}>
                    {fmt(selDate)}
                  </h1>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 12 }}>
                  <button onClick={save} style={{
                    background: saved ? '#10b981' : '#1a1a1a',
                    border: 'none', borderRadius: 8, padding: '8px 16px', color: '#fff',
                    fontWeight: 600, fontSize: 13, cursor: 'pointer', display: 'flex',
                    alignItems: 'center', gap: 6, transition: 'all 0.3s',
                  }}>
                    {saved ? '✓ Saved' : <><Save size={14} /> Save</>}
                  </button>
                  {existing && (
                    <button onClick={() => removeJournalEntry(existing.id)}
                      style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', display: 'flex', gap: 4, alignItems: 'center', fontSize: 12, opacity: 0.7, transition: 'opacity 0.2s' }}
                      onMouseEnter={e => e.currentTarget.style.opacity = '1'}
                      onMouseLeave={e => e.currentTarget.style.opacity = '0.7'}
                    >
                      <Trash2 size={12} /> Delete Entry
                    </button>
                  )}
                </div>
              </div>

              {/* Mood Orbs */}
              <div style={{ marginBottom: 40 }}>
                <div style={{ fontFamily: 'Georgia, serif', fontSize: 16, fontStyle: 'italic', color: '#7a7873', marginBottom: 12 }}>
                  Feeling... {activeMood.label}
                </div>
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                  {MOODS.map(m => (
                    <button key={m.e} onClick={() => setMood(m.e)} title={m.label}
                      style={{
                        width: 44, height: 44, borderRadius: '50%', 
                        border: `2px solid ${mood === m.e ? '#1a1a1a' : 'transparent'}`,
                        background: mood === m.e ? 'rgba(0,0,0,0.05)' : 'transparent',
                        fontSize: 24, cursor: 'pointer', transition: 'all 0.2s',
                        transform: mood === m.e ? 'scale(1.1)' : 'scale(1)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                      }}>
                      {m.e}
                    </button>
                  ))}
                </div>
              </div>

              {/* What happened */}
              <div style={{ marginBottom: 24 }}>
                <SectionHeading title="Dear Journal," />
                <PaperArea value={what} onChange={setWhat} placeholder="What happened today? Let it all out..." minH={192} />
              </div>

              {/* Wins */}
              <div style={{ marginBottom: 24 }}>
                <SectionHeading title="Wins & Highlights" />
                <PaperArea value={wins} onChange={setWins} placeholder="What went well today? Any small victories?" minH={96} />
              </div>

              {/* Failures */}
              <div style={{ marginBottom: 24 }}>
                <SectionHeading title="Lessons Learned" />
                <PaperArea value={failures} onChange={setFailures} placeholder="What didn't go as planned? How can you improve?" minH={96} />
              </div>

              {/* Extra notes */}
              <div style={{ marginBottom: 24 }}>
                <SectionHeading title="Brain Dump" />
                <PaperArea value={notes} onChange={setNotes} placeholder="Random thoughts, stray ideas, things to remember..." minH={96} />
              </div>
              
              <div style={{ textAlign: 'center', marginTop: 48, opacity: 0.3, fontFamily: 'Georgia, serif', fontStyle: 'italic' }}>
                ***
              </div>
            </div>
          </div>
        )}

        {view === 'history' && (
          <div style={{ animation: 'lifeIn 0.3s ease-out' }}>
            <h2 style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-0.5px', marginBottom: 8 }}>Past Entries</h2>
            <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: 13, marginBottom: 28 }}>{journalEntries.length} entries · Click any card to edit it</p>

            {journalEntries.length === 0 ? (
              <div style={{ padding: '64px 32px', textAlign: 'center', background: 'rgba(255,255,255,0.02)', borderRadius: 24, border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>📖</div>
                <div style={{ color: 'rgba(255,255,255,0.25)', fontSize: 14 }}>No entries yet. Start writing today!</div>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
                {journalEntries.map(e => {
                  const moodInfo = MOODS.find(m => m.e === e.mood) || MOODS[0];
                  return (
                    <div key={e.id}
                      onClick={() => { setSelDate(e.date); setView('write'); }}
                      style={{
                        background: '#fdfbf7', /* Paper look for cards too */
                        color: '#2b2a27',
                        borderRadius: 4,
                        boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                        padding: 24, cursor: 'pointer',
                        transition: 'transform 0.2s', position: 'relative', overflow: 'hidden',
                      }}
                      onMouseEnter={el => (el.currentTarget.style.transform = `translateY(-4px)`)}
                      onMouseLeave={el => (el.currentTarget.style.transform = 'translateY(0)')}
                    >
                      {/* Red margin line */}
                      <div style={{ position: 'absolute', left: 16, top: 0, bottom: 0, width: 1, background: 'rgba(239, 68, 68, 0.3)' }} />
                      
                      <div style={{ paddingLeft: 12 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, alignItems: 'flex-start', marginBottom: 16 }}>
                          <div>
                            <div style={{ fontSize: 11, color: '#7a7873', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 4 }}>
                              {new Date(e.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </div>
                            <div style={{ fontSize: 15, fontFamily: 'Georgia, serif', fontWeight: 'bold', color: '#1a1a1a' }}>
                              {new Date(e.date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long' })}
                            </div>
                          </div>
                          <div style={{ fontSize: 24 }}>{e.mood}</div>
                        </div>

                        {e.what && (
                          <p style={{ fontSize: 14, fontFamily: 'Georgia, serif', color: '#4a4843', lineHeight: 1.6, margin: 0, display: '-webkit-box', WebkitLineClamp: 4, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                            {e.what}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes lifeIn { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        textarea::placeholder { color: rgba(0,0,0,0.3) !important; font-style: italic; }
      `}} />
    </div>
  );
}
