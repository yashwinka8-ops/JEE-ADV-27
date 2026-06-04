'use client';

import { useState } from 'react';
import { useStore } from '@/store/useStore';
import type { BrainNote } from '@/store/useStore';
import { Plus, X, Pin, Trash2, ChevronDown, ChevronUp, Edit3 } from 'lucide-react';

const SUBCATS = [
  { k: 'business', label: 'Business Ideas', emoji: '💡', color: '#f59e0b' },
  { k: 'app',      label: 'App Ideas',       emoji: '📱', color: '#22d3ee' },
  { k: 'content',  label: 'Content Ideas',   emoji: '🎥', color: '#ec4899' },
  { k: 'thought',  label: 'Random Thoughts', emoji: '📝', color: '#a855f7' },
] as const;

const RatingBar = ({ label, value, color }: { label: string; value: number; color: string }) => (
  <div>
    <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, fontSize: 11, color: 'rgba(255,255,255,0.5)', marginBottom: 4 }}>
      <span>{label}</span><span style={{ color, fontWeight: 700 }}>{value}/10</span>
    </div>
    <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 999, height: 4 }}>
      <div style={{ height: '100%', width: `${value * 10}%`, background: color, borderRadius: 999, transition: 'width 0.4s' }} />
    </div>
  </div>
);

const emptyNote = (): Omit<BrainNote, 'id' | 'createdAt'> => ({
  title: '', content: '', tag: 'idea', subCategory: 'thought',
  potential: 5, difficulty: 5, interest: 5, tags: [], pinned: false, evolutionLog: []
});

export default function BrainPage() {
  const { brainNotes, addBrainNote, updateBrainNote, removeBrainNote } = useStore();
  const [tab, setTab] = useState<'dashboard' | 'capture' | 'list'>('dashboard');
  const [subFilter, setSubFilter] = useState<string>('all');
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyNote());
  const [tagInput, setTagInput] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const thisWeek = brainNotes.filter(n => new Date(n.createdAt) >= new Date(Date.now() - 7 * 86400000)).length;
  const pinned = brainNotes.filter(n => n.pinned);

  const filtered = (subFilter === 'all' ? brainNotes : brainNotes.filter(n => n.subCategory === subFilter))
    .sort((a, b) => Number(b.pinned) - Number(a.pinned) || new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const save = () => {
    if (!form.title.trim()) return;
    const id = editId || Math.random().toString(36).slice(2);
    if (editId) updateBrainNote(editId, form);
    else addBrainNote({ ...form, id, createdAt: new Date().toISOString() });
    setShowForm(false); setEditId(null); setForm(emptyNote()); setTagInput('');
  };

  const addTag = () => {
    const t = tagInput.trim().replace(/^#/, '');
    if (t && !form.tags.includes(t)) setForm(f => ({ ...f, tags: [...f.tags, t] }));
    setTagInput('');
  };

  const startEdit = (n: BrainNote) => {
    setForm({ title: n.title, content: n.content, tag: n.tag, subCategory: n.subCategory,
      potential: n.potential, difficulty: n.difficulty, interest: n.interest,
      tags: n.tags, pinned: n.pinned, evolutionLog: n.evolutionLog });
    setEditId(n.id); setShowForm(true); setTab('capture');
  };

  const catOf = (n: BrainNote) => SUBCATS.find(s => s.k === n.subCategory) || SUBCATS[3];

  return (
    <div style={{ color: '#f0f0f0', fontFamily: 'Inter, sans-serif', animation: 'fadeUp 0.4s ease-out' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, alignItems: 'flex-start', marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: 32, fontWeight: 900, background: 'linear-gradient(135deg, #f97316, #f59e0b)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: 6 }}>
            🧠 Second Brain
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 14 }}>Your personal knowledge and idea vault.</p>
        </div>
        <button onClick={() => { setShowForm(!showForm); setEditId(null); setForm(emptyNote()); setTab('capture'); }} style={{
          background: 'linear-gradient(135deg, #f97316, #f59e0b)', border: 'none', borderRadius: 12,
          padding: '10px 20px', color: '#000', fontWeight: 700, fontSize: 13, cursor: 'pointer',
          display: 'flex', gap: 6, alignItems: 'center'
        }}>
          <Plus size={15} /> Capture Idea
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 28, background: 'rgba(255,255,255,0.03)', borderRadius: 14, padding: 4, width: 'fit-content' }}>
        {(['dashboard', 'capture', 'list'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            background: tab === t ? 'rgba(249,115,22,0.15)' : 'transparent',
            border: tab === t ? '1px solid rgba(249,115,22,0.3)' : '1px solid transparent',
            color: tab === t ? '#f97316' : 'rgba(255,255,255,0.4)',
            borderRadius: 10, padding: '8px 18px', fontSize: 13, fontWeight: 600, cursor: 'pointer',
            textTransform: 'capitalize', transition: 'all 0.15s'
          }}>{t}</button>
        ))}
      </div>

      {/* ── Dashboard ── */}
      {tab === 'dashboard' && (
        <div>
          {/* Stats row */}
          <div className="mobile-stack-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 32 }}>
            {[
              { label: 'Total Ideas', value: brainNotes.length, color: '#f97316' },
              { label: 'Pinned', value: pinned.length, color: '#f59e0b' },
              { label: 'This Week', value: thisWeek, color: '#22d3ee' },
              { label: 'Categories', value: 4, color: '#a855f7' },
            ].map(s => (
              <div key={s.label} style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 20, padding: 20 }}>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>{s.label}</div>
                <div style={{ fontSize: 36, fontWeight: 900, color: s.color }}>{s.value}</div>
              </div>
            ))}
          </div>

          {/* Category breakdown */}
          <div className="mobile-stack-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16, marginBottom: 32 }}>
            {SUBCATS.map(c => {
              const count = brainNotes.filter(n => n.subCategory === c.k).length;
              const top = brainNotes.filter(n => n.subCategory === c.k).slice(0, 2);
              return (
                <div key={c.k} onClick={() => { setSubFilter(c.k); setTab('list'); }} style={{ background: 'rgba(255,255,255,0.025)', border: `1px solid rgba(255,255,255,0.06)`, borderRadius: 20, padding: 22, cursor: 'pointer', transition: 'all 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = `${c.color}40`}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, alignItems: 'center', marginBottom: 16 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontSize: 24 }}>{c.emoji}</span>
                      <span style={{ fontWeight: 700, fontSize: 15 }}>{c.label}</span>
                    </div>
                    <span style={{ fontSize: 22, fontWeight: 900, color: c.color }}>{count}</span>
                  </div>
                  {top.map(n => (
                    <div key={n.id} style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', padding: '6px 0', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
                      {n.pinned ? '📌 ' : ''}{n.title}
                    </div>
                  ))}
                </div>
              );
            })}
          </div>

          {/* Pin board */}
          {pinned.length > 0 && (
            <div>
              <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: 2, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', marginBottom: 16 }}>📌 Pinboard</div>
              <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 8 }}>
                {pinned.map(n => {
                  const cat = catOf(n);
                  return (
                    <div key={n.id} onClick={() => startEdit(n)} style={{ flexShrink: 0, width: 240, background: `${cat.color}10`, border: `1px solid ${cat.color}30`, borderRadius: 18, padding: 18, cursor: 'pointer' }}>
                      <div style={{ fontSize: 11, fontWeight: 800, color: cat.color, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>{cat.label}</div>
                      <div style={{ fontWeight: 700, marginBottom: 8 }}>{n.title}</div>
                      <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{n.content}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Capture Form ── */}
      {tab === 'capture' && (
        <div style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(249,115,22,0.2)', borderRadius: 24, padding: 32, maxWidth: 720 }}>
          <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 24, color: '#f97316' }}>{editId ? 'Edit Idea' : 'Capture New Idea'}</h2>

          {/* Subcategory */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
            {SUBCATS.map(c => (
              <button key={c.k} onClick={() => setForm(f => ({ ...f, subCategory: c.k as any }))} style={{
                flex: 1, background: form.subCategory === c.k ? `${c.color}18` : 'rgba(255,255,255,0.03)',
                border: `1px solid ${form.subCategory === c.k ? c.color : 'rgba(255,255,255,0.06)'}`,
                color: form.subCategory === c.k ? c.color : 'rgba(255,255,255,0.4)',
                borderRadius: 12, padding: '10px 4px', fontSize: 12, fontWeight: 600, cursor: 'pointer', textAlign: 'center'
              }}>
                {c.emoji}<br />{c.label}
              </button>
            ))}
          </div>

          <input placeholder="Idea title..." value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
            style={{ width: '100%', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, color: '#fff', fontSize: 18, fontWeight: 700, padding: '14px 18px', outline: 'none', marginBottom: 14 }} />

          <textarea placeholder="Describe the idea in detail..." value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
            style={{ width: '100%', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, color: '#f0f0f0', fontSize: 14, padding: 16, minHeight: 120, resize: 'vertical', outline: 'none', marginBottom: 20, fontFamily: 'inherit', lineHeight: 1.6 }} />

          {/* Ratings */}
          <div className="mobile-stack-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24, marginBottom: 24 }}>
            {[
              { key: 'potential', label: 'Potential', color: '#22d3ee' },
              { key: 'difficulty', label: 'Difficulty', color: '#ef4444' },
              { key: 'interest', label: 'Interest', color: '#f59e0b' },
            ].map(r => (
              <div key={r.key}>
                <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, fontSize: 12, marginBottom: 6 }}>
                  <span style={{ color: 'rgba(255,255,255,0.5)' }}>{r.label}</span>
                  <span style={{ color: r.color, fontWeight: 700 }}>{(form as any)[r.key]}/10</span>
                </div>
                <input type="range" min={1} max={10} value={(form as any)[r.key]}
                  onChange={e => setForm(f => ({ ...f, [r.key]: +e.target.value }))}
                  style={{ width: '100%', accentColor: r.color }} />
              </div>
            ))}
          </div>

          {/* Tags */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 10 }}>
              {form.tags.map(t => (
                <span key={t} style={{ background: 'rgba(249,115,22,0.15)', color: '#f97316', borderRadius: 99, padding: '4px 12px', fontSize: 12, fontWeight: 600 }}>
                  #{t} <button onClick={() => setForm(f => ({ ...f, tags: f.tags.filter(x => x !== t) }))} style={{ background: 'none', border: 'none', color: '#f97316', cursor: 'pointer', padding: 0, marginLeft: 4 }}>×</button>
                </span>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <input placeholder="#tag" value={tagInput} onChange={e => setTagInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && addTag()}
                style={{ flex: 1, background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10, color: '#fff', fontSize: 13, padding: '10px 14px', outline: 'none' }} />
              <button onClick={addTag} style={{ background: 'rgba(249,115,22,0.15)', border: 'none', borderRadius: 10, padding: '0 16px', color: '#f97316', fontWeight: 700, cursor: 'pointer' }}>Add</button>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <button onClick={() => setForm(f => ({ ...f, pinned: !f.pinned }))} style={{
              background: form.pinned ? 'rgba(245,158,11,0.15)' : 'rgba(255,255,255,0.04)',
              border: `1px solid ${form.pinned ? 'rgba(245,158,11,0.3)' : 'rgba(255,255,255,0.06)'}`,
              color: form.pinned ? '#f59e0b' : 'rgba(255,255,255,0.4)', borderRadius: 10, padding: '10px 16px',
              fontSize: 13, cursor: 'pointer', display: 'flex', gap: 6, alignItems: 'center'
            }}>
              <Pin size={14} /> {form.pinned ? 'Pinned' : 'Pin Idea'}
            </button>
            <button onClick={save} style={{ flex: 1, background: 'linear-gradient(135deg, #f97316, #f59e0b)', border: 'none', borderRadius: 12, padding: '12px', color: '#000', fontWeight: 800, fontSize: 14, cursor: 'pointer' }}>
              {editId ? 'Update Idea' : 'Save Idea ✦'}
            </button>
            {editId && <button onClick={() => { setShowForm(false); setEditId(null); setForm(emptyNote()); }} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', cursor: 'pointer' }}><X size={18} /></button>}
          </div>
        </div>
      )}

      {/* ── Ideas List ── */}
      {tab === 'list' && (
        <div>
          {/* Filter pills */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
            {['all', ...SUBCATS.map(c => c.k)].map(f => {
              const cat = SUBCATS.find(c => c.k === f);
              return (
                <button key={f} onClick={() => setSubFilter(f)} style={{
                  background: subFilter === f ? 'rgba(249,115,22,0.15)' : 'rgba(255,255,255,0.03)',
                  border: `1px solid ${subFilter === f ? 'rgba(249,115,22,0.35)' : 'rgba(255,255,255,0.05)'}`,
                  color: subFilter === f ? '#f97316' : 'rgba(255,255,255,0.4)',
                  borderRadius: 99, padding: '7px 16px', fontSize: 12, fontWeight: 600, cursor: 'pointer', textTransform: 'capitalize'
                }}>
                  {cat ? `${cat.emoji} ${cat.label}` : '✦ All'} ({f === 'all' ? brainNotes.length : brainNotes.filter(n => n.subCategory === f).length})
                </button>
              );
            })}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {filtered.map(n => {
              const cat = catOf(n);
              const expanded = expandedId === n.id;
              return (
                <div key={n.id} style={{ background: 'rgba(255,255,255,0.02)', border: `1px solid ${expanded ? `${cat.color}30` : 'rgba(255,255,255,0.05)'}`, borderRadius: 20, overflow: 'hidden', transition: 'all 0.2s' }}>
                  <div style={{ display: 'flex', alignItems: 'center', padding: '18px 24px', gap: 16, cursor: 'pointer' }}
                    onClick={() => setExpandedId(expanded ? null : n.id)}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: `${cat.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>{cat.emoji}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: 15 }}>{n.pinned ? '📌 ' : ''}{n.title}</div>
                      <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', marginTop: 3 }}>{cat.label} · {new Date(n.createdAt).toLocaleDateString()}</div>
                    </div>
                    <div style={{ display: 'flex', gap: 6 }}>
                      {n.tags.slice(0, 2).map(t => <span key={t} style={{ fontSize: 10, color: cat.color, background: `${cat.color}15`, borderRadius: 99, padding: '2px 8px' }}>#{t}</span>)}
                    </div>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <button onClick={e => { e.stopPropagation(); startEdit(n); }} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', cursor: 'pointer' }}><Edit3 size={14} /></button>
                      <button onClick={e => { e.stopPropagation(); removeBrainNote(n.id); }} style={{ background: 'none', border: 'none', color: 'rgba(239,68,68,0.5)', cursor: 'pointer' }}><Trash2 size={14} /></button>
                      {expanded ? <ChevronUp size={16} color="rgba(255,255,255,0.3)" /> : <ChevronDown size={16} color="rgba(255,255,255,0.3)" />}
                    </div>
                  </div>
                  {expanded && (
                    <div style={{ padding: '0 24px 24px', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
                      <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)', lineHeight: 1.7, marginTop: 16, marginBottom: 20 }}>{n.content}</p>
                      <div className="mobile-stack-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
                        <RatingBar label="Potential" value={n.potential} color="#22d3ee" />
                        <RatingBar label="Difficulty" value={n.difficulty} color="#ef4444" />
                        <RatingBar label="Interest" value={n.interest} color="#f59e0b" />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
            {filtered.length === 0 && (
              <div style={{ textAlign: 'center', padding: 48, color: 'rgba(255,255,255,0.25)' }}>
                No ideas captured yet. Click "Capture Idea" to start.
              </div>
            )}
          </div>
        </div>
      )}
      <style dangerouslySetInnerHTML={{__html:`@keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}`}} />
    </div>
  );
}