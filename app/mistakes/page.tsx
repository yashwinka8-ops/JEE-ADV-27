'use client';

import { useState } from 'react';
import { useStore, Mistake, ErrorType } from '@/store/useStore';
import { Plus, Trash2, CheckCircle, Lightbulb, Clock, HelpCircle, XCircle } from 'lucide-react';

const ERROR_TYPES: { value: ErrorType; label: string; icon: React.ReactNode; color: string; fill: string }[] = [
  { value: 'concept', label: 'Concept',  icon: <Lightbulb size={13} />, color: 'var(--blue)',  fill: 'var(--blue-fill)' },
  { value: 'silly',   label: 'Silly',    icon: <XCircle size={13} />,   color: 'var(--red)',   fill: 'var(--red-fill)' },
  { value: 'time',    label: 'Time',     icon: <Clock size={13} />,     color: 'var(--amber)', fill: 'var(--amber-fill)' },
  { value: 'unknown', label: 'Other',    icon: <HelpCircle size={13} />, color: 'var(--label-secondary)', fill: 'var(--bg-tertiary)' },
];

const empty = (): Omit<Mistake, 'id'> => ({
  date: new Date().toISOString().slice(0, 10),
  subject: 'physics', chapter: '', question: '',
  errorType: 'concept', understood: false, resolution: '',
});

export default function MistakesPage() {
  const { mistakes, addMistake, updateMistake, removeMistake, chapters } = useStore();
  const [show, setShow]     = useState(false);
  const [form, setForm]     = useState(empty());
  const [subF, setSubF]     = useState('all');
  const [errF, setErrF]     = useState('all');
  const [showDone, setShowDone] = useState(false);
  const set = (k: string, v: any) => setForm(p => ({ ...p, [k]: v }));

  const filtered = mistakes.filter(m => {
    if (subF !== 'all' && m.subject !== subF) return false;
    if (errF !== 'all' && m.errorType !== errF) return false;
    if (!showDone && m.understood) return false;
    return true;
  });

  const submit = () => {
    if (!form.question) return;
    addMistake({ ...form, id: Date.now().toString() });
    setForm(empty()); setShow(false);
  };

  const stats = ERROR_TYPES.map(e => ({ ...e, count: mistakes.filter(m => m.errorType === e.value).length }));
  const subChapters = chapters.filter(c => c.subject === form.subject);

  return (
    <div className="fade-in-up">
      <div className="page-header flex justify-between items-center">
        <div><h1>Mistake Journal</h1><p>Track errors, understand patterns, improve</p></div>
        <button className="btn btn-primary" onClick={() => setShow(true)}><Plus size={16} />Log Mistake</button>
      </div>

      {/* Error type stats */}
      <div className="grid-4 mb-6 stagger">
        {stats.map(s => (
          <div key={s.value} className="stat-tile" style={{ borderLeft: `3px solid ${s.color}` }}>
            <div style={{ display: 'flex', gap: 7, alignItems: 'center', marginBottom: 8 }}>
              <span style={{ color: s.color }}>{s.icon}</span>
              <span className="stat-label" style={{ margin: 0 }}>{s.label}</span>
            </div>
            <div className="stat-value" style={{ color: s.color, fontSize: 28 }}>{s.count}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16, alignItems: 'center' }}>
        {['all', 'physics', 'chemistry', 'maths'].map(s => (
          <button key={s} className={`pill ${subF === s ? (s === 'physics' ? 'active' : s === 'chemistry' ? 'active-green' : s === 'maths' ? 'active-amber' : 'active') : ''}`}
            onClick={() => setSubF(s)}>
            {s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
        <div style={{ width: 1, background: 'var(--separator)', margin: '0 4px' }} />
        {ERROR_TYPES.map(e => (
          <button key={e.value} className={`pill ${errF === e.value ? 'active' : ''}`}
            style={errF === e.value ? { background: e.fill, color: e.color } : {}}
            onClick={() => setErrF(errF === e.value ? 'all' : e.value)}>
            {e.icon} {e.label}
          </button>
        ))}
        <label style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--label-secondary)', cursor: 'pointer' }}>
          <input type="checkbox" checked={showDone} onChange={e => setShowDone(e.target.checked)} />
          Show understood
        </label>
      </div>

      {/* Mistake cards */}
      {filtered.length === 0 ? (
        <div className="card"><div className="empty-state">
          <CheckCircle size={36} strokeWidth={1.5} />
          <h3>{mistakes.length === 0 ? 'No mistakes logged' : 'Nothing matches'}</h3>
          <p>Log a mistake whenever you get a question wrong.</p>
        </div></div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {filtered.map(m => {
            const et = ERROR_TYPES.find(e => e.value === m.errorType)!;
            const subCol = m.subject === 'physics' ? 'var(--blue)' : m.subject === 'chemistry' ? 'var(--green)' : 'var(--amber)';
            return (
              <div key={m.id} className="stat-tile" style={{ opacity: m.understood ? 0.55 : 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    <span className="tag" style={{ background: `${subCol}18`, color: subCol }}>{m.subject}</span>
                    {m.chapter && <span className="tag tag-muted">{m.chapter}</span>}
                    <span className="tag" style={{ background: et.fill, color: et.color }}>{et.icon} {et.label}</span>
                    {m.understood && <span className="tag tag-green">Understood</span>}
                  </div>
                  <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                    <button className="btn btn-secondary btn-sm btn-icon" onClick={() => updateMistake(m.id, { understood: !m.understood })}>
                      <CheckCircle size={13} color={m.understood ? 'var(--green)' : undefined} />
                    </button>
                    <button className="btn btn-danger btn-sm btn-icon" onClick={() => removeMistake(m.id)}><Trash2 size={13} /></button>
                  </div>
                </div>
                <div style={{ fontSize: 14, lineHeight: 1.5 }}>{m.question}</div>
                {m.resolution && (
                    <div style={{ display: 'flex', gap: 6, alignItems: 'flex-start', marginTop: 10, padding: '10px 14px', background: 'var(--bg-tertiary)', borderRadius: 10, fontSize: 13, color: 'var(--label-secondary)', lineHeight: 1.5 }}>
                      <Lightbulb size={14} style={{ marginTop: 2, flexShrink: 0, color: 'var(--amber)' }} />
                      <span>{m.resolution}</span>
                    </div>
                )}
                <div style={{ fontSize: 11, color: 'var(--label-tertiary)', marginTop: 8 }}>{m.date}</div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {show && (
        <div className="modal-overlay" onClick={() => setShow(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header"><span className="modal-title">Log Mistake</span>
              <button className="btn btn-secondary btn-sm" onClick={() => setShow(false)}>✕</button></div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div className="grid-2">
                <div className="form-group"><label className="form-label">Subject</label>
                  <select className="select" value={form.subject} onChange={e => set('subject', e.target.value)}>
                    <option value="physics">Physics</option><option value="chemistry">Chemistry</option><option value="maths">Maths</option>
                  </select></div>
                <div className="form-group"><label className="form-label">Chapter</label>
                  <select className="select" value={form.chapter} onChange={e => set('chapter', e.target.value)}>
                    <option value="">Select…</option>
                    {subChapters.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                  </select></div>
              </div>
              <div className="form-group">
                <label className="form-label">Error Type</label>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {ERROR_TYPES.map(e => (
                    <button key={e.value} className="pill" style={form.errorType === e.value ? { background: e.fill, color: e.color } : {}}
                      onClick={() => set('errorType', e.value)}>{e.icon} {e.label}</button>
                  ))}
                </div>
              </div>
              <div className="form-group"><label className="form-label">Question / What went wrong *</label>
                <textarea className="textarea" value={form.question} onChange={e => set('question', e.target.value)} placeholder="Describe the mistake…" /></div>
              <div className="form-group"><label className="form-label">Correct approach</label>
                <textarea className="textarea" value={form.resolution} onChange={e => set('resolution', e.target.value)} placeholder="How should it be solved?" style={{ minHeight: 60 }} /></div>
              <button className="btn btn-primary w-full" onClick={submit}>Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
