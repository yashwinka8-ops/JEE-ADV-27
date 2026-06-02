'use client';

import { useState, useMemo } from 'react';
import { useStore, Note } from '@/store/useStore';
import { Plus, Trash2, Search, Edit3, Atom, Beaker, Calculator } from 'lucide-react';

const empty = (): Omit<Note, 'id' | 'updatedAt'> => ({
  subject: 'physics', chapterId: '', chapterName: '', content: '',
});

export default function NotesPage() {
  const { notes, upsertNote, removeNote, chapters } = useStore();
  const [show, setShow]     = useState(false);
  const [form, setForm]     = useState(empty());
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [search, setSearch] = useState('');
  const [sub, setSub]       = useState('all');

  const filtered = useMemo(() => notes.filter(n => {
    if (sub !== 'all' && n.subject !== sub) return false;
    const q = search.toLowerCase();
    return !q || n.chapterName.toLowerCase().includes(q) || n.content.toLowerCase().includes(q);
  }), [notes, sub, search]);

  const submit = () => {
    if (!form.chapterId || !form.content) return;
    upsertNote({
      ...form,
      id: editingId || Date.now().toString(),
      updatedAt: new Date().toISOString(),
    });
    setForm(empty()); setEditingId(null); setShow(false);
  };

  const edit = (n: Note) => {
    setForm({ subject: n.subject, chapterId: n.chapterId, chapterName: n.chapterName, content: n.content });
    setEditingId(n.id);
    setShow(true);
  };

  const subChapters = chapters.filter(c => c.subject === form.subject);

  return (
    <div className="fade-in-up">
      <div className="page-header flex justify-between items-center">
        <div><h1>Notes</h1><p>Quick concepts, shortcuts, and summaries</p></div>
        <button className="btn btn-primary" onClick={() => { setForm(empty()); setEditingId(null); setShow(true); }}>
          <Plus size={16} />New Note
        </button>
      </div>

      {/* Toolbar */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 20, alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: '1 1 240px' }}>
          <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--label-tertiary)' }} />
          <input className="input" style={{ paddingLeft: 36 }} placeholder="Search notes…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {['all', 'physics', 'chemistry', 'maths'].map(s => (
            <button key={s} className={`pill ${sub === s ? (s === 'physics' ? 'active' : s === 'chemistry' ? 'active-green' : s === 'maths' ? 'active-amber' : 'active') : ''}`}
              onClick={() => setSub(s)}>
              {s === 'all' ? 'All' : s === 'physics' ? <><Atom size={14} /> Physics</> : s === 'chemistry' ? <><Beaker size={14} /> Chemistry</> : <><Calculator size={14} /> Maths</>}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="card"><div className="empty-state">
          <Edit3 size={32} strokeWidth={1.5} />
          <h3>No notes found</h3>
          <p>Create a note to remember a key concept or shortcut.</p>
        </div></div>
      ) : (
        <div className="grid-auto">
          {filtered.map(n => {
            const subCol = n.subject === 'physics' ? 'var(--blue)' : n.subject === 'chemistry' ? 'var(--green)' : 'var(--amber)';
            const fillCol = n.subject === 'physics' ? 'var(--blue-fill)' : n.subject === 'chemistry' ? 'var(--green-fill)' : 'var(--amber-fill)';
            const Icon = n.subject === 'physics' ? Atom : n.subject === 'chemistry' ? Beaker : Calculator;
            return (
              <div key={n.id} className="stat-tile" style={{ display: 'flex', flexDirection: 'column', padding: '18px 20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 28, height: 28, borderRadius: 8, background: fillCol, color: subCol, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Icon size={14} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{n.chapterName}</div>
                      <div style={{ fontSize: 11, color: 'var(--label-tertiary)', marginTop: 2 }}>{new Date(n.updatedAt).toLocaleDateString()}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 4 }}>
                    <button className="btn btn-secondary btn-sm btn-icon" onClick={() => edit(n)}><Edit3 size={13} /></button>
                    <button className="btn btn-danger btn-sm btn-icon" onClick={() => removeNote(n.id)}><Trash2 size={13} /></button>
                  </div>
                </div>
                <div style={{
                  fontSize: 14, lineHeight: 1.6, color: 'var(--label-secondary)',
                  whiteSpace: 'pre-wrap', flex: 1,
                  background: 'var(--bg-tertiary)', padding: '12px 14px', borderRadius: 10
                }}>
                  {n.content}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Editor Modal */}
      {show && (
        <div className="modal-overlay" onClick={() => setShow(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 600 }}>
            <div className="modal-header"><span className="modal-title">{editingId ? 'Edit Note' : 'New Note'}</span>
              <button className="btn btn-secondary btn-sm" onClick={() => setShow(false)}>✕</button></div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="grid-2">
                <div className="form-group"><label className="form-label">Subject</label>
                  <select className="select" value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value as any, chapterId: '', chapterName: '' })}>
                    <option value="physics">Physics</option><option value="chemistry">Chemistry</option><option value="maths">Maths</option>
                  </select></div>
                <div className="form-group"><label className="form-label">Chapter</label>
                  <select className="select" value={form.chapterId} onChange={e => {
                    const ch = subChapters.find(c => c.id === e.target.value);
                    setForm({ ...form, chapterId: e.target.value, chapterName: ch ? ch.name : '' });
                  }}>
                    <option value="">Select…</option>
                    {subChapters.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select></div>
              </div>
              <div className="form-group"><label className="form-label">Note Content *</label>
                <textarea className="textarea" value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} 
                  placeholder="Write your note here... (Markdown supported mentally)" style={{ minHeight: 180, fontSize: 14 }} /></div>
              <button className="btn btn-primary w-full" onClick={submit}>Save Note</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
