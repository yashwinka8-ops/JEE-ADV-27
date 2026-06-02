'use client';

import { useState } from 'react';
import { useStore, Doubt } from '@/store/useStore';
import { Plus, Trash2, CheckCircle, Clock, AlertCircle } from 'lucide-react';

const STATUS = {
  unresolved:   { label: 'Unresolved',   color: 'var(--red)',   fill: 'var(--red-fill)',   icon: <AlertCircle size={13} /> },
  'in-progress':{ label: 'In Progress',  color: 'var(--amber)', fill: 'var(--amber-fill)', icon: <Clock size={13} /> },
  cleared:      { label: 'Cleared',      color: 'var(--green)', fill: 'var(--green-fill)', icon: <CheckCircle size={13} /> },
};

const empty = (): Omit<Doubt, 'id'> => ({
  date: new Date().toISOString().slice(0, 10),
  subject: 'physics', chapter: '', description: '', status: 'unresolved', resolution: '',
});

export default function DoubtsPage() {
  const { doubts, addDoubt, updateDoubt, removeDoubt, chapters } = useStore();
  const [show, setShow]   = useState(false);
  const [form, setForm]   = useState(empty());
  const [statusF, setStatusF] = useState('all');
  const [subF, setSubF]   = useState('all');
  const set = (k: string, v: any) => setForm(p => ({ ...p, [k]: v }));

  const subChapters = chapters.filter(c => c.subject === form.subject);

  const filtered = doubts.filter(d => {
    if (subF !== 'all' && d.subject !== subF) return false;
    if (statusF !== 'all' && d.status !== statusF) return false;
    return true;
  });

  const submit = () => {
    if (!form.description) return;
    addDoubt({ ...form, id: Date.now().toString() });
    setForm(empty()); setShow(false);
  };

  const counts = {
    unresolved:    doubts.filter(d => d.status === 'unresolved').length,
    'in-progress': doubts.filter(d => d.status === 'in-progress').length,
    cleared:       doubts.filter(d => d.status === 'cleared').length,
  };

  return (
    <div className="fade-in-up">
      <div className="page-header flex justify-between items-center">
        <div><h1>Doubt Log</h1><p>Track unresolved questions and mark them when cleared</p></div>
        <button className="btn btn-primary" onClick={() => setShow(true)}><Plus size={16} />Add Doubt</button>
      </div>

      {/* Status stats */}
      <div className="grid-3 mb-6 stagger">
        {(Object.entries(STATUS) as [string, typeof STATUS[keyof typeof STATUS]][]).map(([key, cfg]) => (
          <div key={key} className="stat-tile" style={{ borderLeft: `3px solid ${cfg.color}` }}>
            <div style={{ display: 'flex', gap: 7, alignItems: 'center', marginBottom: 8 }}>
              <span style={{ color: cfg.color }}>{cfg.icon}</span>
              <span className="stat-label" style={{ margin: 0 }}>{cfg.label}</span>
            </div>
            <div className="stat-value" style={{ color: cfg.color, fontSize: 28 }}>{counts[key as keyof typeof counts]}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
        {['all', 'physics', 'chemistry', 'maths'].map(s => (
          <button key={s} className={`pill ${subF === s ? (s === 'physics' ? 'active' : s === 'chemistry' ? 'active-green' : s === 'maths' ? 'active-amber' : 'active') : ''}`}
            onClick={() => setSubF(s)}>
            {s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
        <div style={{ width: 1, background: 'var(--separator)', margin: '0 4px' }} />
        {['all', ...Object.keys(STATUS)].map(s => (
          <button key={s} className={`pill ${statusF === s ? 'active' : ''}`}
            style={statusF === s && s !== 'all' ? { background: (STATUS as any)[s].fill, color: (STATUS as any)[s].color } : {}}
            onClick={() => setStatusF(statusF === s ? 'all' : s)}>
            {s === 'all' ? 'All Status' : (STATUS as any)[s].label}
          </button>
        ))}
      </div>

      {/* Doubt list */}
      {filtered.length === 0 ? (
        <div className="card"><div className="empty-state">
          <CheckCircle size={36} strokeWidth={1.5} />
          <h3>{doubts.length === 0 ? 'No doubts logged' : 'None match filters'}</h3>
          <p>Log a doubt whenever you're stuck on something.</p>
        </div></div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {filtered.map(d => {
            const cfg = STATUS[d.status];
            const subCol = d.subject === 'physics' ? 'var(--blue)' : d.subject === 'chemistry' ? 'var(--green)' : 'var(--amber)';
            return (
              <div key={d.id} className="stat-tile" style={{ opacity: d.status === 'cleared' ? 0.65 : 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    <span className="tag" style={{ background: `${subCol}18`, color: subCol }}>{d.subject}</span>
                    {d.chapter && <span className="tag tag-muted">{d.chapter}</span>}
                    <span className="tag" style={{ background: cfg.fill, color: cfg.color }}>{cfg.icon} {cfg.label}</span>
                  </div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <select
                      className="select"
                      value={d.status}
                      onChange={e => updateDoubt(d.id, { status: e.target.value as any })}
                      style={{ width: 130, fontSize: 12, padding: '5px 10px', color: cfg.color, background: cfg.fill, border: 'none' }}
                    >
                      {Object.entries(STATUS).map(([k, c]) => <option key={k} value={k}>{c.label}</option>)}
                    </select>
                    <button className="btn btn-danger btn-sm btn-icon" onClick={() => removeDoubt(d.id)}><Trash2 size={13} /></button>
                  </div>
                </div>
                <div style={{ fontSize: 14, lineHeight: 1.5 }}>{d.description}</div>
                {d.status === 'cleared' && (
                  <input
                    className="input"
                    style={{ marginTop: 10, fontSize: 13, background: 'var(--bg-tertiary)' }}
                    placeholder="How did you resolve it? (optional)"
                    value={d.resolution || ''}
                    onChange={e => updateDoubt(d.id, { resolution: e.target.value })}
                  />
                )}
                <div style={{ fontSize: 11, color: 'var(--label-tertiary)', marginTop: 8 }}>{d.date}</div>
              </div>
            );
          })}
        </div>
      )}

      {show && (
        <div className="modal-overlay" onClick={() => setShow(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header"><span className="modal-title">Log Doubt</span>
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
              <div className="form-group"><label className="form-label">Doubt *</label>
                <textarea className="textarea" value={form.description} onChange={e => set('description', e.target.value)} placeholder="What are you confused about?" /></div>
              <button className="btn btn-primary w-full" onClick={submit}>Log Doubt</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
