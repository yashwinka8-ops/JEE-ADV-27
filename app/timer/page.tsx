'use client';

import { useState, useEffect, useRef, useCallback, Suspense } from 'react';
import { useStore } from '@/store/useStore';
import { useSearchParams } from 'next/navigation';
import { Play, Pause, RotateCcw, Coffee, CheckCircle, CheckCircle2 } from 'lucide-react';

type Mode = 'focus' | 'short' | 'long' | 'stopwatch';

const MODES: Record<Mode, { label: string; mins: number; color: string }> = {
  focus:     { label: 'Focus',       mins: 25, color: 'var(--blue)' },
  short:     { label: 'Short Break', mins: 5,  color: 'var(--green)' },
  long:      { label: 'Long Break',  mins: 15, color: 'var(--amber)' },
  stopwatch: { label: 'Stopwatch',   mins: 0,  color: 'var(--red)' },
};

const CUSTOM_MINS = [30, 45, 60, 90];
const pad = (n: number) => String(n).padStart(2, '0');

function TimerComponent() {
  const { tasks, chapters, sessions, addSession, dailyGoalMinutes, getTodayMinutes, updateTask } = useStore();
  const searchParams = useSearchParams();

  const [mode, setMode]       = useState<Mode>('focus');
  const [custom, setCustom]   = useState<number | null>(null);
  const [secs, setSecs]       = useState(MODES.focus.mins * 60);
  const [running, setRunning] = useState(false);
  
  const [selectedTaskId, setSelectedTaskId] = useState<string>('');
  const [subject, setSubject] = useState<'physics' | 'chemistry' | 'maths' | 'general'>('general');
  const [chapterId, setChapterId] = useState('');
  
  const [done, setDone]       = useState(false);

  const intervalRef  = useRef<NodeJS.Timeout | null>(null);
  const startedAtRef = useRef<Date | null>(null);
  const totalRef     = useRef(MODES.focus.mins * 60);

  // Initialize from search params
  useEffect(() => {
    const tid = searchParams.get('taskId');
    if (tid) {
      const t = tasks.find(x => x.id === tid);
      if (t) {
        setSelectedTaskId(t.id);
        setSubject(t.subject);
        setChapterId(t.chapterId || '');
      }
    }
  }, [searchParams, tasks]);

  const handleTaskChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const tid = e.target.value;
    setSelectedTaskId(tid);
    if (tid) {
      const t = tasks.find(x => x.id === tid);
      if (t) {
        setSubject(t.subject);
        setChapterId(t.chapterId || '');
      }
    } else {
      setSubject('general');
      setChapterId('');
    }
  };

  const totalSecs = custom ? custom * 60 : MODES[mode].mins * 60;
  const { color } = MODES[mode];
  const pct       = mode === 'stopwatch' ? 100 : Math.min(100, ((totalRef.current - secs) / totalRef.current) * 100);
  const mins      = Math.floor(secs / 60);
  const secsLeft  = secs % 60;

  const reset = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setRunning(false); setDone(false);
    if (mode === 'stopwatch') {
      setSecs(0); totalRef.current = 0;
    } else {
      const t = custom ? custom * 60 : MODES[mode].mins * 60;
      setSecs(t); totalRef.current = t;
    }
    startedAtRef.current = null;
  }, [mode, custom]);

  useEffect(() => { reset(); }, [mode, reset]);

  useEffect(() => {
    if (!running) { if (intervalRef.current) clearInterval(intervalRef.current); return; }
    intervalRef.current = setInterval(() => {
      setSecs(prev => {
        if (mode === 'stopwatch') {
          return prev + 1;
        }
        
        if (prev <= 1) {
          clearInterval(intervalRef.current!);
          setRunning(false);
          if (mode === 'focus') {
            const elapsed = Math.round(totalRef.current / 60);
            addSession({
              id: Date.now().toString(),
              date: new Date().toISOString().slice(0, 10),
              subject, chapterId: chapterId || undefined,
              taskId: selectedTaskId || undefined,
              durationMinutes: elapsed,
              startedAt: startedAtRef.current?.toISOString() ?? new Date().toISOString(),
            });
            setDone(true);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(intervalRef.current!);
  }, [running, mode, subject, chapterId, selectedTaskId, addSession]);

  const start = () => { if (!startedAtRef.current) startedAtRef.current = new Date(); setRunning(true); setDone(false); };

  const todayMins    = getTodayMinutes();
  const todaySessions = sessions.filter(s => s.date === new Date().toISOString().slice(0, 10));
  const subChapters  = chapters.filter(c => c.subject === subject || subject === 'general');
  const pendingTasks = tasks.filter(t => t.status !== 'done');
  
  const linkedTask = tasks.find(t => t.id === selectedTaskId);

  // SVG ring
  const R   = 100;
  const circ = 2 * Math.PI * R;
  const dash = circ * (1 - pct / 100);

  return (
    <div className="fade-in-up">
      <div className="page-header">
        <h1>Study Timer</h1>
        <p>Focused Pomodoro sessions to build momentum</p>
      </div>

      <div className="grid-2" style={{ alignItems: 'start', gap: 20 }}>
        {/* Left — Timer */}
        <div>
          {/* Mode segment */}
          <div className="segment-control mb-6">
            {(Object.entries(MODES) as [Mode, typeof MODES[Mode]][]).map(([k, v]) => (
              <button
                key={k}
                className={`segment-btn ${mode === k ? 'active' : ''}`}
                onClick={() => { setMode(k); setCustom(null); }}
              >
                {v.label}
              </button>
            ))}
          </div>

          {/* SVG Ring */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 28 }}>
            <div style={{ position: 'relative', width: 240, height: 240 }}>
              <svg width="240" height="240" viewBox="0 0 240 240" style={{ transform: 'rotate(-90deg)' }}>
                <circle cx="120" cy="120" r={R} fill="none" stroke="var(--bg-tertiary)" strokeWidth="10" />
                <circle
                  cx="120" cy="120" r={R} fill="none"
                  stroke={color} strokeWidth="10" strokeLinecap="round"
                  strokeDasharray={circ} strokeDashoffset={dash}
                  style={{ transition: 'stroke-dashoffset 0.6s var(--ease)' }}
                />
              </svg>
              <div style={{
                position: 'absolute', inset: 0,
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              }}>
                <div style={{
                  fontSize: 50, fontWeight: 800, color,
                  fontFamily: 'JetBrains Mono, monospace', letterSpacing: -3, lineHeight: 1,
                }}>
                  {pad(mins)}:{pad(secsLeft)}
                </div>
                <div style={{ fontSize: 12, color: 'var(--label-tertiary)', marginTop: 6, fontWeight: 500, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                  {MODES[mode].label}
                </div>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginBottom: 20 }}>
            <button className="btn btn-secondary btn-icon" onClick={reset}>
              <RotateCcw size={18} />
            </button>
            <button
              className="btn btn-lg"
              style={{ background: color, color: '#fff', minWidth: 130 }}
              onClick={running ? () => setRunning(false) : start}
            >
              {running ? <Pause size={18} /> : <Play size={18} />}
              {running ? 'Pause' : 'Start'}
            </button>
            {mode === 'stopwatch' && secs >= 60 && (
              <button
                className="btn btn-lg"
                style={{ background: 'var(--green)', color: '#fff' }}
                onClick={() => {
                  setRunning(false);
                  const elapsed = Math.round(secs / 60);
                  addSession({
                    id: Date.now().toString(),
                    date: new Date().toISOString().slice(0, 10),
                    subject, chapterId: chapterId || undefined,
                    taskId: selectedTaskId || undefined,
                    durationMinutes: elapsed,
                    startedAt: startedAtRef.current?.toISOString() ?? new Date().toISOString(),
                  });
                  setDone(true);
                  setSecs(0);
                }}
              >
                <CheckCircle2 size={18} /> Save Session
              </button>
            )}
          </div>

          {done && (
            <div style={{
              background: 'var(--green-fill)', borderRadius: 12,
              padding: '14px 18px', textAlign: 'center', marginBottom: 16,
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <CheckCircle size={16} color="var(--green)" />
                <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--green)' }}>Session complete!</span>
              </div>
              
              {linkedTask && linkedTask.status !== 'done' && (
                <button 
                  className="btn btn-sm" 
                  style={{ background: 'var(--green)', color: '#fff' }}
                  onClick={() => updateTask(linkedTask.id, { status: 'done' })}
                >
                  <CheckCircle2 size={14} /> Mark Task as Done
                </button>
              )}
            </div>
          )}

          {/* Custom durations */}
          <div className="stat-tile">
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--label-secondary)', marginBottom: 10 }}>Custom Duration</div>
            <div style={{ display: 'flex', gap: 8 }}>
              {CUSTOM_MINS.map(m => (
                <button
                  key={m}
                  className={`pill ${custom === m ? 'active' : ''}`}
                  onClick={() => { setCustom(m); totalRef.current = m * 60; setSecs(m * 60); setRunning(false); }}
                >
                  {m}m
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right — Setup + Log */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          
          {/* Link Task */}
          <div>
            <div style={{ fontSize: 17, fontWeight: 600, marginBottom: 10 }}>Study Focus</div>
            <div className="card">
              <div className="card-section" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div className="form-group">
                  <label className="form-label">Link to Task</label>
                  <select className="select" value={selectedTaskId} onChange={handleTaskChange}>
                    <option value="">None / Open Study</option>
                    {pendingTasks.map(t => (
                      <option key={t.id} value={t.id}>{t.title} ({t.subject})</option>
                    ))}
                  </select>
                </div>

                {!selectedTaskId && (
                  <>
                    <div className="form-group">
                      <label className="form-label">Subject</label>
                      <select className="select" value={subject} onChange={e => setSubject(e.target.value as any)}>
                        <option value="general">General</option>
                        <option value="physics">Physics</option>
                        <option value="chemistry">Chemistry</option>
                        <option value="maths">Maths</option>
                      </select>
                    </div>
                    {subject !== 'general' && (
                      <div className="form-group">
                        <label className="form-label">Chapter (optional)</label>
                        <select className="select" value={chapterId} onChange={e => setChapterId(e.target.value)}>
                          <option value="">Select chapter…</option>
                          {subChapters.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Today stats */}
          <div>
            <div style={{ fontSize: 17, fontWeight: 600, marginBottom: 10 }}>Today</div>
            <div className="grid-2" style={{ gap: 10 }}>
              <div className="stat-tile">
                <div className="stat-label">Studied</div>
                <div className="stat-value" style={{ fontSize: 26, color: 'var(--blue)' }}>
                  {Math.floor(todayMins / 60)}h {todayMins % 60}m
                </div>
              </div>
              <div className="stat-tile">
                <div className="stat-label">Sessions</div>
                <div className="stat-value" style={{ fontSize: 26, color: 'var(--green)' }}>{todaySessions.length}</div>
              </div>
            </div>
          </div>

          {/* Session log */}
          <div>
            <div style={{ fontSize: 17, fontWeight: 600, marginBottom: 10 }}>Today's Log</div>
            <div className="card">
              {todaySessions.length === 0 ? (
                <div className="empty-state" style={{ padding: 30 }}>
                  <Coffee size={24} strokeWidth={1.5} />
                  <p>No sessions logged today yet.</p>
                </div>
              ) : (
                todaySessions.map(s => {
                  const col = s.subject === 'physics' ? 'var(--blue)' : s.subject === 'chemistry' ? 'var(--green)' : s.subject === 'maths' ? 'var(--amber)' : 'var(--label-secondary)';
                  return (
                    <div key={s.id} className="list-row" style={{ cursor: 'default' }}>
                      <div style={{ fontSize: 13, fontWeight: 600, textTransform: 'capitalize', color: col, flex: 1 }}>{s.subject}</div>
                      <div style={{ fontSize: 11, color: 'var(--label-tertiary)', marginRight: 12 }}>
                        {new Date(s.startedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                      <div style={{ fontWeight: 700, color: col, fontSize: 14, fontFamily: 'JetBrains Mono, monospace' }}>{s.durationMinutes}m</div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function TimerPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <TimerComponent />
    </Suspense>
  );
}
