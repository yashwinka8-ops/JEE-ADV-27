'use client';

import { useState } from 'react';
import { useStore } from '@/store/useStore';
import type { DreamCard } from '@/store/useStore';
import AppleEmoji from '@/components/AppleEmoji';
import { Plus, X, Trash2 } from 'lucide-react';

const CATEGORIES = [
  { k: 'country',   label: 'Places to Visit', color: '#3b82f6', bg: '#3b82f610', e: '🗻' },
  { k: 'house',     label: 'Dream House',     color: '#10b981', bg: '#10b98110', e: '🏡' },
  { k: 'car',       label: 'Dream Car',       color: '#ef4444', bg: '#ef444410', e: '🏎️' },
  { k: 'career',    label: 'Career / Goal',   color: '#a855f7', bg: '#a855f710', e: '👑' },
  { k: 'business',  label: 'Business',        color: '#f59e0b', bg: '#f59e0b10', e: '💼' },
  { k: 'lifestyle', label: 'Lifestyle',       color: '#ec4899', bg: '#ec489910', e: '✨' },
] as const;

const emptyCard = (): Omit<DreamCard, 'id'> => ({
  category: 'country', title: '', description: '',
  emoji: '🌎', progress: 0, targetYear: '', estimatedCost: '', why: ''
});

export default function DreamsPage() {
  const { dreamCards, addDreamCard, updateDreamCard, removeDreamCard } = useStore();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyCard());
  const [editId, setEditId] = useState<string | null>(null);
  const [filterCat, setFilterCat] = useState<string>('all');
  const [view, setView] = useState<'board' | 'progress'>('board');

  const filtered = filterCat === 'all' ? dreamCards : dreamCards.filter(d => d.category === filterCat);

  const save = () => {
    if (!form.title.trim()) return;
    if (editId) updateDreamCard(editId, form);
    else addDreamCard({ ...form, id: Math.random().toString(36).slice(2) });
    setShowForm(false); setEditId(null); setForm(emptyCard());
  };

  const startEdit = (d: DreamCard) => {
    setForm({ title: d.title, category: d.category, description: d.description, emoji: d.emoji, progress: d.progress, targetYear: d.targetYear, estimatedCost: d.estimatedCost, why: d.why });
    setEditId(d.id); setShowForm(true);
  };

  return (
    <div style={{ color: '#f0f0f0', fontFamily: 'Inter, sans-serif', animation: 'fadeUp 0.4s ease-out' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, alignItems: 'flex-start', marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: 32, fontWeight: 900, background: 'linear-gradient(135deg, #3b82f6, #22d3ee)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 12 }}>
            <AppleEmoji emoji="🌎" size={36} /> Dreams Vault
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 14 }}>Your visual future. What are you working so hard for?</p>
        </div>
        <button onClick={() => { setShowForm(true); setEditId(null); setForm(emptyCard()); }} style={{
          background: 'linear-gradient(135deg, #3b82f6, #22d3ee)', border: 'none', borderRadius: 12, padding: '10px 20px',
          color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer', display: 'flex', gap: 6, alignItems: 'center'
        }}>
          <Plus size={15} /> Add Vision
        </button>
      </div>

      {/* Add/Edit modal */}
      {showForm && (
        <div style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(59,130,246,0.25)', borderRadius: 24, padding: 32, marginBottom: 32 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, marginBottom: 20 }}>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: '#3b82f6' }}>{editId ? 'Edit Vision' : 'Add Vision'}</h2>
            <button onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', cursor: 'pointer' }}><X size={20} /></button>
          </div>
          {/* Category selector */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
            {CATEGORIES.map(c => (
              <button key={c.k} onClick={() => setForm(f => ({ ...f, category: c.k as any }))} style={{
                background: form.category === c.k ? c.bg : 'rgba(255,255,255,0.03)',
                border: `1px solid ${form.category === c.k ? c.color : 'rgba(255,255,255,0.06)'}`,
                color: form.category === c.k ? c.color : 'rgba(255,255,255,0.4)',
                borderRadius: 99, padding: '7px 14px', fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6
              }}><AppleEmoji emoji={c.e} size={14} /> {c.label}</button>
            ))}
          </div>
          <div className="mobile-stack-grid" style={{ display: 'grid', gridTemplateColumns: '64px 1fr', gap: 14, marginBottom: 14 }}>
            <input placeholder="🌎" value={form.emoji} onChange={e => setForm(f => ({ ...f, emoji: e.target.value }))} style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, color: '#fff', fontSize: 28, textAlign: 'center', outline: 'none' }} />
            <input placeholder="Dream title..." value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, color: '#fff', fontSize: 18, fontWeight: 700, padding: '0 16px', outline: 'none' }} />
          </div>
          <div className="mobile-grid-1 mobile-stack-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
            <input placeholder="Target Year (e.g. 2028)" value={form.targetYear} onChange={e => setForm(f => ({ ...f, targetYear: e.target.value }))} style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, color: '#fff', fontSize: 14, padding: '12px 16px', outline: 'none' }} />
            <input placeholder="Estimated Cost (e.g. ₹2,00,000)" value={form.estimatedCost} onChange={e => setForm(f => ({ ...f, estimatedCost: e.target.value }))} style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, color: '#fff', fontSize: 14, padding: '12px 16px', outline: 'none' }} />
          </div>
          <textarea placeholder="Why do you want this? Be specific..." value={form.why} onChange={e => setForm(f => ({ ...f, why: e.target.value }))} rows={2} style={{ width: '100%', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, color: '#f0f0f0', fontSize: 14, padding: 16, resize: 'vertical', outline: 'none', marginBottom: 14, fontFamily: 'inherit', lineHeight: 1.6 }} />
          <textarea placeholder="Description..." value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={2} style={{ width: '100%', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, color: '#f0f0f0', fontSize: 14, padding: 16, resize: 'vertical', outline: 'none', marginBottom: 16, fontFamily: 'inherit', lineHeight: 1.6 }} />
          <div style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, fontSize: 13, marginBottom: 8 }}>
              <span style={{ color: 'rgba(255,255,255,0.5)' }}>Progress</span>
              <span style={{ color: '#3b82f6', fontWeight: 700 }}>{form.progress}%</span>
            </div>
            <input type="range" min={0} max={100} value={form.progress} onChange={e => setForm(f => ({ ...f, progress: +e.target.value }))} style={{ width: '100%', accentColor: '#3b82f6' }} />
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <button onClick={save} style={{ flex: 1, background: 'linear-gradient(135deg, #3b82f6, #22d3ee)', border: 'none', borderRadius: 12, padding: 14, color: '#fff', fontWeight: 800, fontSize: 14, cursor: 'pointer' }}>
              {editId ? 'Update Vision' : 'Save Vision ✦'}
            </button>
            {editId && <button onClick={() => { removeDreamCard(editId); setShowForm(false); setEditId(null); }} style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 12, padding: '0 20px', color: '#ef4444', cursor: 'pointer' }}><Trash2 size={16} /></button>}
          </div>
        </div>
      )}

      {/* View toggle + Category filter */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button onClick={() => setFilterCat('all')} style={{ background: filterCat === 'all' ? 'rgba(59,130,246,0.15)' : 'rgba(255,255,255,0.03)', border: `1px solid ${filterCat === 'all' ? 'rgba(59,130,246,0.3)' : 'rgba(255,255,255,0.05)'}`, color: filterCat === 'all' ? '#3b82f6' : 'rgba(255,255,255,0.4)', borderRadius: 99, padding: '6px 14px', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>All ({dreamCards.length})</button>
          {CATEGORIES.map(c => (
            <button key={c.k} onClick={() => setFilterCat(c.k)} style={{ background: filterCat === c.k ? c.bg : 'rgba(255,255,255,0.03)', border: `1px solid ${filterCat === c.k ? c.color : 'rgba(255,255,255,0.05)'}`, color: filterCat === c.k ? c.color : 'rgba(255,255,255,0.4)', borderRadius: 99, padding: '6px 14px', fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
              <AppleEmoji emoji={c.e} size={14} /> {dreamCards.filter(d => d.category === c.k).length}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 4, background: 'rgba(255,255,255,0.03)', borderRadius: 10, padding: 3 }}>
          {(['board', 'progress'] as const).map(v => (
            <button key={v} onClick={() => setView(v)} style={{ background: view === v ? 'rgba(59,130,246,0.15)' : 'transparent', border: `1px solid ${view === v ? 'rgba(59,130,246,0.3)' : 'transparent'}`, color: view === v ? '#3b82f6' : 'rgba(255,255,255,0.4)', borderRadius: 8, padding: '6px 16px', fontSize: 12, fontWeight: 600, cursor: 'pointer', textTransform: 'capitalize' }}>{v}</button>
          ))}
        </div>
      </div>

      {/* Vision Board */}
      {view === 'board' && (
        <div style={{ columns: 3, columnGap: 16 }}>
          {filtered.map(d => {
            const cat = CATEGORIES.find(c => c.k === d.category)!;
            return (
              <div key={d.id} onClick={() => startEdit(d)} style={{ breakInside: 'avoid', marginBottom: 16, background: 'rgba(255,255,255,0.02)', border: `1px solid rgba(255,255,255,0.05)`, borderRadius: 22, padding: 24, cursor: 'pointer', transition: 'all 0.25s', position: 'relative', overflow: 'hidden' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = `${cat.color}40`; e.currentTarget.style.transform = 'translateY(-4px)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)'; e.currentTarget.style.transform = 'translateY(0)'; }}>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, ${cat.color}, transparent)` }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, alignItems: 'flex-start', marginBottom: 14 }}>
                  <div style={{ filter: `drop-shadow(0 0 16px ${cat.color}50)` }}><AppleEmoji emoji={d.emoji} size={44} /></div>
                  <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: 1, color: cat.color, background: cat.bg, padding: '4px 10px', borderRadius: 99, textTransform: 'uppercase' }}>{cat.label}</div>
                </div>
                <h3 style={{ fontSize: 20, fontWeight: 800, marginBottom: 8, lineHeight: 1.2 }}>{d.title}</h3>
                {d.why && <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', lineHeight: 1.6, marginBottom: 14, fontStyle: 'italic' }}>"{d.why}"</p>}
                {d.description && <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', lineHeight: 1.6, marginBottom: 14 }}>{d.description}</p>}
                <div style={{ display: 'flex', gap: 10, fontSize: 12, color: 'rgba(255,255,255,0.35)', flexWrap: 'wrap' }}>
                  {d.targetYear && <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><AppleEmoji emoji="📅" size={12} /> {d.targetYear}</span>}
                  {d.estimatedCost && <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><AppleEmoji emoji="💰" size={12} /> {d.estimatedCost}</span>}
                </div>
                {d.progress > 0 && (
                  <div style={{ marginTop: 14 }}>
                    <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 999, height: 5 }}>
                      <div style={{ height: '100%', width: `${d.progress}%`, background: cat.color, borderRadius: 999 }} />
                    </div>
                    <div style={{ fontSize: 11, color: cat.color, marginTop: 4, fontWeight: 600 }}>{d.progress}% progress</div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Progress View */}
      {view === 'progress' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {filtered.map(d => {
            const cat = CATEGORIES.find(c => c.k === d.category)!;
            return (
              <div key={d.id} onClick={() => startEdit(d)} style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 18, padding: '18px 24px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 20, transition: 'all 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.borderColor = `${cat.color}30`}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'}
              >
                <AppleEmoji emoji={d.emoji} size={32} />
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, marginBottom: 6 }}>
                    <span style={{ fontWeight: 700, fontSize: 15 }}>{d.title}</span>
                    <span style={{ fontSize: 13, fontWeight: 800, color: cat.color }}>{d.progress}%</span>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 999, height: 8 }}>
                    <div style={{ height: '100%', width: `${d.progress}%`, background: `linear-gradient(90deg, ${cat.color}, ${cat.color}99)`, borderRadius: 999, transition: 'width 0.6s' }} />
                  </div>
                  <div style={{ display: 'flex', gap: 14, marginTop: 6, fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>
                    <span style={{ color: cat.color }}>{cat.label}</span>
                    {d.targetYear && <span>Target: {d.targetYear}</span>}
                    {d.estimatedCost && <span>Cost: {d.estimatedCost}</span>}
                  </div>
                </div>
              </div>
            );
          })}
          {filtered.length === 0 && <div style={{ textAlign: 'center', padding: 48, color: 'rgba(255,255,255,0.2)' }}>No visions added yet.</div>}
        </div>
      )}
      <style dangerouslySetInnerHTML={{__html:`@keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}} @media(max-width:900px){div[style*="columns: 3"]{columns:2!important}} @media(max-width:600px){div[style*="columns: 3"]{columns:1!important}}`}} />
    </div>
  );
}