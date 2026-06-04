'use client';

import { useState } from 'react';
import { useStore } from '@/store/useStore';
import type { LifeGoal } from '@/store/useStore';
import AppleEmoji from '@/components/AppleEmoji';
import { Plus, Trash2, Edit3, Check, X } from 'lucide-react';

type Category = LifeGoal['category'];

const CATEGORIES: { key: Category; label: string; emoji: string; color: string }[] = [
  { key: 'academic',  label: 'Academic',  emoji: '🎓', color: '#22d3ee' },
  { key: 'financial', label: 'Financial', emoji: '💰', color: '#34d399' },
  { key: 'personal',  label: 'Personal',  emoji: '💪', color: '#f59e0b' },
  { key: 'longterm',  label: 'Long-Term', emoji: '🌟', color: '#a855f7' },
];

const blank = (): Omit<LifeGoal, 'id' | 'createdAt'> => ({
  title: '', category: 'academic', targetDate: '', progress: 0, notes: ''
});

export default function GoalsPage() {
  const { lifeGoals, addLifeGoal, updateLifeGoal, removeLifeGoal } = useStore();
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState(blank());
  const [editId, setEditId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Category>('academic');

  const filteredGoals = lifeGoals.filter(g => g.category === activeTab);

  const save = () => {
    if (!form.title.trim()) return;
    if (editId) {
      updateLifeGoal(editId, form);
      setEditId(null);
    } else {
      addLifeGoal({ ...form, id: Math.random().toString(36).slice(2), createdAt: new Date().toISOString() });
    }
    setForm(blank());
    setShowAdd(false);
  };

  const startEdit = (g: LifeGoal) => {
    setForm({ title: g.title, category: g.category, targetDate: g.targetDate, progress: g.progress, notes: g.notes });
    setEditId(g.id);
    setShowAdd(true);
  };

  const catInfo = CATEGORIES.find(c => c.key === activeTab)!;

  return (
    <div style={{ color: '#f5f5f5', animation: 'lifeIn 0.4s ease-out', maxWidth: 760 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, alignItems: 'flex-start', marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 12 }}>
            <AppleEmoji emoji="🎯" size={32} /> Goals
          </h1>
          <p style={{ color: '#555', fontSize: 14, marginTop: 4 }}>Your academic, financial, personal & long-term goals.</p>
        </div>
        <button onClick={() => { setShowAdd(true); setEditId(null); setForm(blank()); }} style={{
          background: 'linear-gradient(135deg, #ff69b4, #a855f7)', border: 'none', borderRadius: 12,
          padding: '10px 18px', color: '#fff', fontWeight: 600, fontSize: 13, cursor: 'pointer', display: 'flex', gap: 6, alignItems: 'center'
        }}>
          <Plus size={15} /> Add Goal
        </button>
      </div>

      {/* Category Tabs */}
      <div className="mobile-grid-2 mobile-stack-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 28 }}>
        {CATEGORIES.map(c => (
          <button key={c.key} onClick={() => setActiveTab(c.key)} style={{
            background: activeTab === c.key ? `${c.color}18` : '#1c1c1e',
            border: `1px solid ${activeTab === c.key ? c.color : 'rgba(255,255,255,0.05)'}`,
            borderRadius: 12, padding: '12px 8px', color: activeTab === c.key ? c.color : '#555',
            fontWeight: activeTab === c.key ? 700 : 400, fontSize: 13, cursor: 'pointer',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, transition: 'all 0.15s'
          }}>
            <AppleEmoji emoji={c.emoji} size={24} />
            <span>{c.label}</span>
            <span style={{ fontSize: 11, opacity: 0.7 }}>{lifeGoals.filter(g => g.category === c.key).length} goals</span>
          </button>
        ))}
      </div>

      {/* Add Form */}
      {showAdd && (
        <div style={{ background: '#1c1c1e', borderRadius: 20, padding: 24, marginBottom: 24, border: '1px solid rgba(255,105,180,0.2)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, marginBottom: 18 }}>
            <span style={{ fontWeight: 700, fontSize: 15 }}>{editId ? 'Edit Goal' : 'New Goal'}</span>
            <button onClick={() => setShowAdd(false)} style={{ background: 'none', border: 'none', color: '#555', cursor: 'pointer' }}><X size={16} /></button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <input
              placeholder="Goal title..."
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              style={{ background: '#111', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '12px 14px', color: '#f5f5f5', fontSize: 14, outline: 'none' }}
            />
            <div className="mobile-col mobile-stack-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <select
                value={form.category}
                onChange={e => setForm(f => ({ ...f, category: e.target.value as Category }))}
                style={{ background: '#111', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '12px 14px', color: '#f5f5f5', fontSize: 14, outline: 'none' }}
              >
                {CATEGORIES.map(c => <option key={c.key} value={c.key}>{c.emoji} {c.label}</option>)}
              </select>
              <input
                type="date"
                value={form.targetDate}
                onChange={e => setForm(f => ({ ...f, targetDate: e.target.value }))}
                style={{ background: '#111', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '12px 14px', color: '#f5f5f5', fontSize: 14, outline: 'none' }}
              />
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, marginBottom: 8 }}>
                <span style={{ fontSize: 12, color: '#888' }}>Progress</span>
                <span style={{ fontSize: 12, color: catInfo.color, fontWeight: 700 }}>{form.progress}%</span>
              </div>
              <input type="range" min={0} max={100} value={form.progress} onChange={e => setForm(f => ({ ...f, progress: +e.target.value }))}
                style={{ width: '100%', accentColor: catInfo.color }} />
            </div>
            <textarea
              placeholder="Notes..."
              value={form.notes}
              onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
              style={{ background: '#111', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '12px 14px', color: '#f5f5f5', fontSize: 14, outline: 'none', resize: 'none', minHeight: 80, fontFamily: 'inherit' }}
            />
            <button onClick={save} style={{ background: `linear-gradient(135deg, ${catInfo.color}, #a855f7)`, border: 'none', borderRadius: 12, padding: '12px', color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer', display: 'flex', gap: 8, alignItems: 'center', justifyContent: 'center' }}>
              <Check size={15} /> Save Goal
            </button>
          </div>
        </div>
      )}

      {/* Goals List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {filteredGoals.length === 0 ? (
          <div style={{ background: '#1c1c1e', borderRadius: 16, padding: 32, textAlign: 'center', color: '#444', border: '1px solid rgba(255,255,255,0.05)' }}>
            No {catInfo.label} goals yet.
          </div>
        ) : filteredGoals.map(g => (
          <div key={g.id} style={{ background: '#1c1c1e', borderRadius: 16, padding: 20, border: '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, marginBottom: 12 }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: 15 }}>{g.title}</div>
                {g.targetDate && <div style={{ fontSize: 12, color: '#555', marginTop: 2 }}>Target: {new Date(g.targetDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>}
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => startEdit(g)} style={{ background: 'none', border: 'none', color: '#555', cursor: 'pointer' }}><Edit3 size={14} /></button>
                <button onClick={() => removeLifeGoal(g.id)} style={{ background: 'none', border: 'none', color: '#444', cursor: 'pointer' }}><Trash2 size={14} /></button>
              </div>
            </div>
            <div style={{ background: '#111', borderRadius: 999, height: 6, overflow: 'hidden', marginBottom: 6 }}>
              <div style={{ height: '100%', width: `${g.progress}%`, background: catInfo.color, borderRadius: 999, transition: 'width 0.4s' }} />
            </div>
            <div style={{ fontSize: 12, color: '#555' }}>{g.progress}% complete</div>
            {g.notes && <div style={{ marginTop: 10, fontSize: 13, color: '#777', lineHeight: 1.6 }}>{g.notes}</div>}
          </div>
        ))}
      </div>
      <style dangerouslySetInnerHTML={{__html:`@keyframes lifeIn{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}`}} />
    </div>
  );
}
