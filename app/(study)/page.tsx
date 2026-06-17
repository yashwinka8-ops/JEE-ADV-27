'use client';

import { useStore } from '@/store/useStore';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { BookOpen, Timer, FlaskConical, Target, ChevronRight, Flame, Zap, Atom, Beaker, Calculator, Book, Calendar as CalendarIcon, CheckCircle2, Circle, Play, Repeat } from 'lucide-react';
import { useMemo, useEffect, useState } from 'react';
import GoogleTasksTracker from '@/components/GoogleTasksTracker';

function useCountdown() {
  const [t, setT] = useState({ days: 0, hours: 0, mins: 0, secs: 0 });
  useEffect(() => {
    const tick = () => {
      const diff = new Date('2027-05-25T06:00:00').getTime() - Date.now();
      if (diff <= 0) return;
      setT({
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        mins: Math.floor((diff % 3600000) / 60000),
        secs: Math.floor((diff % 60000) / 1000),
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  return t;
}

const pad = (n: number) => String(n).padStart(2, '0');

export default function DashboardPage() {
  const { chapters, sessions, dailyGoalMinutes, getTodayMinutes, getCurrentStreak, getLongestStreak, tasks, weeklyGoals, updateTask, updateWeeklyGoal, revisions } = useStore();
  const router = useRouter();
  const cd = useCountdown();

  const todayStr = new Date().toISOString().slice(0, 10);
  const todaysTasks = tasks.filter(t => t.dueDate === todayStr).sort((a, b) => a.status === 'done' ? 1 : b.status === 'done' ? -1 : 0);


  const todayMins = getTodayMinutes();
  const streak    = getCurrentStreak();
  const longest   = getLongestStreak();
  const goalPct   = Math.min(100, Math.round((todayMins / dailyGoalMinutes) * 100));
  const totalHrs  = Math.round(sessions.reduce((a, s) => a + s.durationMinutes, 0) / 60);

  const subStats = useMemo(() => {
    const calc = (sub: string) => {
      const chs   = chapters.filter(c => c.subject === sub);
      const total = chs.reduce((a, c) => a + c.topics.length, 0);
      const done  = chs.reduce((a, c) => a + c.topics.filter(t => t.done).length, 0);
      const mastered = chs.filter(c => c.mastery === 'mastered').length;
      return { total, done, pct: total ? Math.round((done / total) * 100) : 0, chs: chs.length, mastered };
    };
    return { physics: calc('physics'), chemistry: calc('chemistry'), maths: calc('maths') };
  }, [chapters]);

  const totalTopics = chapters.reduce((a, c) => a + c.topics.length, 0);
  const doneTopics  = chapters.reduce((a, c) => a + c.topics.filter(t => t.done).length, 0);
  const overallPct  = totalTopics ? Math.round((doneTopics / totalTopics) * 100) : 0;

  const subjects = [
    { key: 'physics',   label: 'Physics',   icon: Atom,       color: 'var(--blue)',  fill: 'var(--blue-fill)' },
    { key: 'chemistry', label: 'Chemistry', icon: Beaker,     color: 'var(--green)', fill: 'var(--green-fill)' },
    { key: 'maths',     label: 'Maths',     icon: Calculator, color: 'var(--amber)', fill: 'var(--amber-fill)' },
  ] as const;

  const dueRevisions = useMemo(() => revisions.filter(r => r.nextRevisionDate <= todayStr && r.stage < 4), [revisions, todayStr]);

  const quickActions = [
    { href: '/timer',    icon: Timer,       label: 'Start Study Session', sub: 'Log a focused Pomodoro block', color: 'var(--blue)',  fill: 'var(--blue-fill)' },
    { href: '/syllabus', icon: BookOpen,    label: 'Update Syllabus',     sub: 'Mark topics & chapters done',  color: 'var(--green)', fill: 'var(--green-fill)' },
    { href: '/revision', icon: Repeat,      label: 'Spaced Repetition',   sub: `${dueRevisions.length} topics due today`, color: 'var(--cyan)', fill: 'var(--cyan-fill)' },
    { href: '/tests',    icon: FlaskConical,label: 'Log Mock Test',       sub: 'Record your test score',       color: 'var(--amber)', fill: 'var(--amber-fill)' },
    { href: '/mistakes', icon: Target,      label: 'Add Mistake',         sub: 'Journal what went wrong',      color: 'var(--red)',   fill: 'var(--red-fill)' },
  ];

  const recentSessions = sessions.slice(0, 6);

  return (
    <div className="fade-in-up">
      {/* Countdown ─────────────────────────────────────────── */}
      <div style={{
        background: 'var(--bg-secondary)',
        borderRadius: 20,
        padding: '22px 26px',
        marginBottom: 22,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 16,
      }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--label-tertiary)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 4 }}>
            JEE Advanced · May 25, 2027
          </div>
          <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--label-primary)', letterSpacing: -0.5 }}>
            Time remaining
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          {[{ v: cd.days, l: 'Days' }, { v: cd.hours, l: 'Hrs' }, { v: cd.mins, l: 'Min' }, { v: cd.secs, l: 'Sec' }].map(({ v, l }) => (
            <div key={l} style={{ textAlign: 'center' }}>
              <div style={{
                fontSize: 34, fontWeight: 800, letterSpacing: -2,
                fontFamily: 'JetBrains Mono, monospace', lineHeight: 1,
                color: 'var(--label-primary)', background: 'var(--bg-tertiary)',
                borderRadius: 10, padding: '8px 14px', minWidth: 64, textAlign: 'center',
              }}>
                {pad(v)}
              </div>
              <div style={{ fontSize: 10, color: 'var(--label-tertiary)', marginTop: 5, fontWeight: 500, letterSpacing: '0.06em', textTransform: 'uppercase' }}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Stats Row ──────────────────────────────────────────── */}
      <div className="grid-4 mb-6 stagger">
        {/* Today */}
        <div className="stat-tile">
          <div className="stat-label">Today's Study</div>
          <div className="stat-value" style={{ color: 'var(--blue)', fontSize: 28 }}>
            {Math.floor(todayMins / 60)}h {todayMins % 60}m
          </div>
          <div style={{ marginTop: 10 }}>
            <div className="progress-track">
              <div className="progress-fill" style={{ width: `${goalPct}%`, background: 'var(--blue)' }} />
            </div>
            <div className="stat-sub mt-1">{goalPct}% of {Math.floor(dailyGoalMinutes / 60)}h goal</div>
          </div>
        </div>

        {/* Streak */}
        <div className="stat-tile">
          <div className="stat-label">Study Streak</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
            <div className="stat-value" style={{ color: '#ff9f0a' }}>{streak}</div>
            <span style={{ fontSize: 18 }}>🔥</span>
          </div>
          <div className="stat-sub">Best: {longest} days</div>
        </div>

        {/* Progress */}
        <div className="stat-tile">
          <div className="stat-label">Overall Progress</div>
          <div className="stat-value">{overallPct}%</div>
          <div className="stat-sub">{doneTopics}/{totalTopics} topics</div>
        </div>

        {/* Hours */}
        <div className="stat-tile">
          <div className="stat-label">Total Hours</div>
          <div className="stat-value" style={{ color: 'var(--green)' }}>{totalHrs}h</div>
          <div className="stat-sub">{sessions.length} sessions logged</div>
        </div>
      </div>

      {/* Action Center ───────────────────────────────────── */}
      <div className="grid-3 mb-6" style={{ gap: 20, alignItems: 'start' }}>
        
        {/* Today's Agenda */}
        <div className="card card-section">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--label-primary)' }}>
              <CalendarIcon size={18} />
              <h2 style={{ fontSize: 16, fontWeight: 600 }}>Today's Agenda</h2>
            </div>
            <button className="btn btn-secondary btn-sm" onClick={() => router.push('/planner')}>View Planner</button>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {todaysTasks.length === 0 ? (
              <div style={{ padding: 16, textAlign: 'center', color: 'var(--label-tertiary)', fontSize: 13, background: 'var(--bg-tertiary)', borderRadius: 12 }}>
                No tasks scheduled for today.
              </div>
            ) : (
              todaysTasks.slice(0, 4).map(t => {
                const isDone = t.status === 'done';
                return (
                  <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: 'var(--bg-secondary)', borderRadius: 12, opacity: isDone ? 0.6 : 1 }}>
                    <div onClick={() => updateTask(t.id, { status: isDone ? 'todo' : 'done' })} style={{ cursor: 'pointer', flexShrink: 0 }}>
                      {isDone ? <CheckCircle2 size={20} color="var(--green)" fill="var(--green)" fillOpacity={0.15} /> : <Circle size={20} color="var(--label-tertiary)" />}
                    </div>
                    <div style={{ flex: 1, fontSize: 14, fontWeight: 500, color: isDone ? 'var(--label-tertiary)' : 'var(--label-primary)', textDecoration: isDone ? 'line-through' : 'none' }}>
                      {t.title}
                    </div>
                    {!isDone && (
                      <button className="btn btn-primary btn-sm btn-icon" onClick={() => router.push(`/timer?taskId=${t.id}`)} title="Start Timer" style={{ padding: 6, height: 28, width: 28 }}>
                        <Play size={12} fill="currentColor" />
                      </button>
                    )}
                  </div>
                );
              })
            )}
            {todaysTasks.length > 4 && (
              <div style={{ textAlign: 'center', fontSize: 12, color: 'var(--label-tertiary)', marginTop: 4 }}>+ {todaysTasks.length - 4} more tasks</div>
            )}
          </div>
        </div>

        {/* Google Tasks To-Do List Tracker */}
        <GoogleTasksTracker />

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* Weekly Goals */}
        <div className="card card-section">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, color: 'var(--blue)' }}>
            <Target size={18} />
            <h2 style={{ fontSize: 16, fontWeight: 600 }}>Weekly Goals</h2>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {weeklyGoals.length === 0 ? (
              <div style={{ padding: 16, textAlign: 'center', color: 'var(--label-tertiary)', fontSize: 13, background: 'var(--bg-tertiary)', borderRadius: 12 }}>
                No weekly goals set.
              </div>
            ) : (
              weeklyGoals.slice(0, 4).map(g => (
                <div key={g.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: 'var(--bg-secondary)', borderRadius: 12, opacity: g.completed ? 0.6 : 1 }}>
                  <div onClick={() => updateWeeklyGoal(g.id, { completed: !g.completed })} style={{ cursor: 'pointer', flexShrink: 0 }}>
                    {g.completed ? <CheckCircle2 size={20} color="var(--green)" fill="var(--green)" fillOpacity={0.15} /> : <Circle size={20} color="var(--label-tertiary)" />}
                  </div>
                  <div style={{ flex: 1, fontSize: 14, fontWeight: 500, color: g.completed ? 'var(--label-tertiary)' : 'var(--label-primary)', textDecoration: g.completed ? 'line-through' : 'none' }}>
                    {g.title}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
        
        {/* Due Revisions */}
        <div className="card card-section">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--cyan)' }}>
              <Repeat size={18} />
              <h2 style={{ fontSize: 16, fontWeight: 600 }}>Due Revisions</h2>
            </div>
            <button className="btn btn-secondary btn-sm" onClick={() => router.push('/revision')}>Review All</button>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {dueRevisions.length === 0 ? (
              <div style={{ padding: 16, textAlign: 'center', color: 'var(--label-tertiary)', fontSize: 13, background: 'var(--bg-tertiary)', borderRadius: 12 }}>
                No revisions due today.
              </div>
            ) : (
              dueRevisions.slice(0, 3).map(r => {
                return (
                  <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: 'var(--bg-secondary)', borderRadius: 12 }}>
                    <div style={{ flex: 1, fontSize: 14, fontWeight: 500, color: 'var(--label-primary)' }}>
                      {r.title}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--label-tertiary)', fontWeight: 600, background: 'var(--bg-tertiary)', padding: '2px 8px', borderRadius: 8 }}>
                      Stage {r.stage}
                    </div>
                  </div>
                );
              })
            )}
            {dueRevisions.length > 3 && (
              <div style={{ textAlign: 'center', fontSize: 12, color: 'var(--label-tertiary)', marginTop: 4 }}>+ {dueRevisions.length - 3} more due</div>
            )}
          </div>
        </div>
        </div>
        
      </div>

      {/* Subject Progress ───────────────────────────────────── */}
      <div style={{ fontSize: 17, fontWeight: 600, marginBottom: 12 }}>Subject Progress</div>
      <div className="card mb-6">
        {subjects.map((sub, i) => {
          const s = subStats[sub.key];
          return (
            <Link key={sub.key} href="/syllabus" style={{ display: 'block' }}>
              <div className="list-row" style={{ cursor: 'pointer', padding: '14px 18px' }}>
                <div className="list-row-icon" style={{ background: sub.fill, color: sub.color }}>
                  <sub.icon size={18} />
                </div>
                <div className="list-row-body">
                  <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, marginBottom: 6 }}>
                    <span style={{ fontWeight: 600 }}>{sub.label}</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: sub.color }}>{s.pct}%</span>
                  </div>
                  <div className="progress-track">
                    <div className="progress-fill" style={{ width: `${s.pct}%`, background: sub.color }} />
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--label-tertiary)', marginTop: 4 }}>
                    {s.done}/{s.total} topics · {s.mastered}/{s.chs} chapters mastered
                  </div>
                </div>
                <ChevronRight size={14} color="var(--label-tertiary)" style={{ marginLeft: 8 }} />
              </div>
            </Link>
          );
        })}
      </div>

      {/* Bottom Row ─────────────────────────────────────────── */}
      <div className="grid-2" style={{ alignItems: 'start' }}>
        {/* Quick Actions */}
        <div>
          <div style={{ fontSize: 17, fontWeight: 600, marginBottom: 12 }}>Quick Actions</div>
          <div className="card">
            {quickActions.map(({ href, icon: Icon, label, sub, color, fill }, i) => (
              <Link key={href} href={href} style={{ display: 'block' }}>
                <div className="list-row">
                  <div className="list-row-icon" style={{ background: fill }}>
                    <Icon size={15} color={color} />
                  </div>
                  <div className="list-row-body">
                    <div className="list-row-title">{label}</div>
                    <div className="list-row-sub">{sub}</div>
                  </div>
                  <ChevronRight size={14} color="var(--label-tertiary)" />
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Sessions */}
        <div>
          <div style={{ fontSize: 17, fontWeight: 600, marginBottom: 12 }}>Recent Sessions</div>
          <div className="card">
            {recentSessions.length === 0 ? (
              <div className="empty-state" style={{ padding: 36 }}>
                <Zap size={28} strokeWidth={1.5} />
                <h3>No sessions yet</h3>
                <p>Start your first session with the timer.</p>
              </div>
            ) : (
              recentSessions.map((s) => {
                const col = s.subject === 'physics' ? 'var(--blue)' : s.subject === 'chemistry' ? 'var(--green)' : s.subject === 'maths' ? 'var(--amber)' : 'var(--label-secondary)';
                const fill = s.subject === 'physics' ? 'var(--blue-fill)' : s.subject === 'chemistry' ? 'var(--green-fill)' : s.subject === 'maths' ? 'var(--amber-fill)' : 'var(--bg-tertiary)';
                const IconComponent = s.subject === 'physics' ? Atom : s.subject === 'chemistry' ? Beaker : s.subject === 'maths' ? Calculator : Book;
                
                return (
                  <div key={s.id} className="list-row" style={{ cursor: 'default' }}>
                    <div className="list-row-icon" style={{ background: fill }}>
                      <span style={{ display: 'flex', color: col }}><IconComponent size={16} /></span>
                    </div>
                    <div className="list-row-body">
                      <div style={{ fontWeight: 500, fontSize: 14, textTransform: 'capitalize', color: col }}>{s.subject}</div>
                      <div style={{ fontSize: 11, color: 'var(--label-tertiary)' }}>{s.date}</div>
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: col }}>{s.durationMinutes}m</div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
