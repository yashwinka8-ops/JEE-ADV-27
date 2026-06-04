'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStore, TodoTask, Priority, WeeklyGoal } from '@/store/useStore';
import { Plus, Trash2, CheckCircle2, Circle, Play, Atom, Beaker, Calculator, Book, Calendar as CalendarIcon, AlertTriangle, Target } from 'lucide-react';

const empty = (): Omit<TodoTask, 'id' | 'createdAt'> => ({
  title: '', subject: 'general', priority: 'medium', status: 'todo', dueDate: new Date().toISOString().slice(0, 10),
});

const PRIORITIES: Record<Priority, { label: string; color: string; fill: string }> = {
  high: { label: 'High Priority', color: 'var(--red)', fill: 'var(--red-fill)' },
  medium: { label: 'Medium Priority', color: 'var(--amber)', fill: 'var(--amber-fill)' },
  low: { label: 'Low Priority', color: 'var(--blue)', fill: 'var(--blue-fill)' },
};

export default function PlannerPage() {
  const { tasks, chapters, addTask, updateTask, removeTask, weeklyGoals, addWeeklyGoal, updateWeeklyGoal, removeWeeklyGoal } = useStore();
  const router = useRouter();
  const [show, setShow] = useState(false);
  const [form, setForm] = useState(empty());
  const [newGoal, setNewGoal] = useState('');

  const submitGoal = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && newGoal.trim()) {
      addWeeklyGoal({ id: Date.now().toString(), title: newGoal.trim(), completed: false, createdAt: new Date().toISOString() });
      setNewGoal('');
    }
  };

  const set = (k: string, v: any) => setForm(p => ({ ...p, [k]: v }));

  const submit = () => {
    if (!form.title) return;
    addTask({ ...form, id: Date.now().toString(), createdAt: new Date().toISOString() });
    setForm(empty()); setShow(false);
  };

  const today = new Date();
  const todayStr = today.toISOString().slice(0, 10);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().slice(0, 10);

  const overdue = tasks.filter(t => t.dueDate < todayStr && t.status !== 'done').sort((a, b) => a.dueDate.localeCompare(b.dueDate));
  const todaysTasks = tasks.filter(t => t.dueDate === todayStr).sort((a, b) => a.status === 'done' ? 1 : b.status === 'done' ? -1 : 0);
  const tomorrowsTasks = tasks.filter(t => t.dueDate === tomorrowStr).sort((a, b) => a.status === 'done' ? 1 : b.status === 'done' ? -1 : 0);
  const upcomingTasks = tasks.filter(t => t.dueDate > tomorrowStr).sort((a, b) => a.dueDate.localeCompare(b.dueDate));

  const todaysDoneCount = todaysTasks.filter(t => t.status === 'done').length;

  const subChapters = form.subject !== 'general' ? chapters.filter(c => c.subject === form.subject) : [];

  const renderTask = (t: TodoTask) => {
    const prio = PRIORITIES[t.priority];
    const Icon = t.subject === 'physics' ? Atom : t.subject === 'chemistry' ? Beaker : t.subject === 'maths' ? Calculator : Book;
    const subCol = t.subject === 'physics' ? 'var(--blue)' : t.subject === 'chemistry' ? 'var(--green)' : t.subject === 'maths' ? 'var(--amber)' : 'var(--label-secondary)';

    const isDone = t.status === 'done';
    const chap = t.chapterId ? chapters.find(c => c.id === t.chapterId) : null;

    return (
      <div key={t.id} style={{
        background: 'var(--bg-primary)', borderRadius: 12, padding: '16px 20px',
        border: '1px solid var(--separator)', display: 'flex', alignItems: 'center', gap: 16,
        opacity: isDone ? 0.6 : 1, transition: 'all 0.2s',
      }}>
        <div
          style={{ cursor: 'pointer', flexShrink: 0 }}
          onClick={() => updateTask(t.id, { status: isDone ? 'todo' : 'done' })}
        >
          {isDone ? <CheckCircle2 size={24} color="var(--green)" fill="var(--green)" fillOpacity={0.15} /> : <Circle size={24} color="var(--label-tertiary)" />}
        </div>

        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 6, flexWrap: 'wrap' }}>
            <span className="tag" style={{ color: subCol, background: `${subCol}15` }}>
              <Icon size={10} /> {t.subject}
            </span>
            {chap && <span className="tag" style={{ background: 'var(--bg-tertiary)', color: 'var(--label-secondary)' }}>{chap.name}</span>}
            <span className="tag" style={{ background: prio.fill, color: prio.color }}>{prio.label}</span>
          </div>
          <div style={{
            fontSize: 16, fontWeight: 500, color: isDone ? 'var(--label-tertiary)' : 'var(--label-primary)',
            textDecoration: isDone ? 'line-through' : 'none',
          }}>
            {t.title}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {!isDone && (
            <button className="btn btn-primary btn-sm btn-icon" onClick={() => router.push(`/timer?taskId=${t.id}`)} title="Start Timer">
              <Play size={14} fill="currentColor" />
            </button>
          )}
          <button className="btn btn-secondary btn-sm btn-icon" onClick={() => removeTask(t.id)} style={{ color: 'var(--red)', background: 'transparent' }} title="Delete Task">
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="fade-in-up">
      <div className="page-header flex justify-between items-center">
        <div><h1>Daily Agenda</h1><p>Plan your days and track study blocks</p></div>
        <button className="btn btn-primary" onClick={() => setShow(true)}><Plus size={16} />Add Task</button>
      </div>

      <div className="mobile-stack-grid" style={{ display: 'grid', gridTemplateColumns: 'minmax(280px, 320px) 1fr', gap: 32, alignItems: 'start', maxWidth: 1100 }}>

        {/* --- LEFT COLUMN: WEEKLY GOALS --- */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
          {/* Weekly Goals */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, color: 'var(--blue)' }}>
            <Target size={18} />
            <h2 style={{ fontSize: 16, fontWeight: 600 }}>Weekly Goals</h2>
          </div>
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: 16 }}>
            {weeklyGoals.map(g => (
              <div key={g.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, gap: 12, opacity: g.completed ? 0.6 : 1 }}>
                <div 
                  onClick={() => updateWeeklyGoal(g.id, { completed: !g.completed })}
                  style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', flex: 1 }}
                >
                  {g.completed ? <CheckCircle2 size={20} color="var(--green)" fill="var(--green)" fillOpacity={0.15} /> : <Circle size={20} color="var(--label-tertiary)" />}
                  <span style={{ fontSize: 15, fontWeight: 500, color: g.completed ? 'var(--label-tertiary)' : 'var(--label-primary)', textDecoration: g.completed ? 'line-through' : 'none' }}>
                    {g.title}
                  </span>
                </div>
                <button className="btn btn-secondary btn-sm btn-icon" onClick={() => removeWeeklyGoal(g.id)} style={{ color: 'var(--red)', background: 'transparent' }} title="Delete Goal">
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
            <input 
              type="text" 
              className="input" 
              placeholder="Add a new weekly goal... (Press Enter)" 
              value={newGoal} 
              onChange={e => setNewGoal(e.target.value)}
              onKeyDown={submitGoal}
              style={{ background: 'var(--bg-tertiary)', border: 'none', marginTop: weeklyGoals.length ? 8 : 0 }}
            />
          </div>
        </div>
        </div>

        {/* --- RIGHT COLUMN: DAILY AGENDA --- */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>


          {overdue.length > 0 && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, color: 'var(--red)' }}>
                <AlertTriangle size={18} />
                <h2 style={{ fontSize: 16, fontWeight: 600 }}>Overdue Tasks</h2>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {overdue.map(renderTask)}
              </div>
            </div>
          )}

          {/* Today */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--label-primary)' }}>
                <CalendarIcon size={18} />
                <h2 style={{ fontSize: 16, fontWeight: 600 }}>Today's Agenda</h2>
              </div>
              <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--label-secondary)', background: 'var(--bg-tertiary)', padding: '4px 12px', borderRadius: 12 }}>
                {todaysDoneCount} / {todaysTasks.length} tasks completed
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {todaysTasks.length === 0 ? (
                <div className="empty-state card" style={{ padding: '32px' }}>
                  <CheckCircle2 size={32} color="var(--green)" style={{ marginBottom: 12 }} />
                  <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--label-primary)' }}>All caught up!</h3>
                  <p style={{ fontSize: 14, color: 'var(--label-secondary)', marginTop: 4 }}>You have nothing scheduled for today.</p>
                </div>
              ) : (
                todaysTasks.map(renderTask)
              )}
            </div>
          </div>

          {/* Tomorrow */}
          {tomorrowsTasks.length > 0 && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, color: 'var(--label-secondary)' }}>
                <CalendarIcon size={18} />
                <h2 style={{ fontSize: 16, fontWeight: 600 }}>Tomorrow</h2>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {tomorrowsTasks.map(renderTask)}
              </div>
            </div>
          )}

          {/* Upcoming */}
          {upcomingTasks.length > 0 && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, color: 'var(--label-secondary)' }}>
                <CalendarIcon size={18} />
                <h2 style={{ fontSize: 16, fontWeight: 600 }}>Upcoming</h2>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {upcomingTasks.map(renderTask)}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {show && (
        <div className="modal-overlay" onClick={() => setShow(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 500 }}>
            <div className="modal-header">
              <span className="modal-title">Schedule Task</span>
              <button className="btn btn-secondary btn-sm" onClick={() => setShow(false)}>✕</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="form-group">
                <label className="form-label">Task Title *</label>
                <input className="input" value={form.title} onChange={e => set('title', e.target.value)} placeholder="e.g. Complete Kinematics Ex-1" autoFocus />
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Subject</label>
                  <select className="select" value={form.subject} onChange={e => { set('subject', e.target.value); set('chapterId', ''); }}>
                    <option value="general">General</option>
                    <option value="physics">Physics</option>
                    <option value="chemistry">Chemistry</option>
                    <option value="maths">Maths</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Link to Chapter (Optional)</label>
                  <select className="select" value={form.chapterId || ''} onChange={e => set('chapterId', e.target.value)} disabled={form.subject === 'general'}>
                    <option value="">None</option>
                    {subChapters.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Due Date</label>
                  <input className="input" type="date" value={form.dueDate} onChange={e => set('dueDate', e.target.value)} />
                </div>

                <div className="form-group">
                  <label className="form-label">Priority</label>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {Object.entries(PRIORITIES).map(([k, p]) => (
                      <button
                        key={k}
                        className={`pill ${form.priority === k ? 'active' : ''}`}
                        style={form.priority === k ? { background: p.fill, color: p.color, border: `1px solid ${p.color}40` } : {}}
                        onClick={() => set('priority', k)}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <button className="btn btn-primary w-full" onClick={submit} style={{ marginTop: 8 }}>Schedule</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
