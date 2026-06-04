'use client';

import { useState } from 'react';
import { useStore } from '@/store/useStore';
import type { FutureLetter } from '@/store/useStore';
import { Plus, X, Lock, Unlock, Mail, Trash2, Calendar, ChevronRight } from 'lucide-react';

export default function FuturePage() {
  const { futureLetters, addFutureLetter, removeFutureLetter } = useStore();
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState<Partial<FutureLetter>>({ title: '', content: '', unlockDate: '' });
  const [reading, setReading] = useState<FutureLetter | null>(null);

  const save = () => {
    if (!form.title?.trim() || !form.content?.trim() || !form.unlockDate) return;
    addFutureLetter({ ...form, id: Math.random().toString(36).slice(2), createdAt: new Date().toISOString() } as FutureLetter);
    setShowAdd(false); setForm({ title: '', content: '', unlockDate: '' });
  };

  const todayStr = new Date().toISOString().slice(0, 10);
  const now = new Date();

  return (
    <div style={{ color: '#f0f0f0', fontFamily: 'Inter, sans-serif', animation: 'fadeUp 0.4s ease-out', maxWidth: 900, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, alignItems: 'flex-start', marginBottom: 40 }}>
        <div>
          <h1 style={{ fontSize: 32, fontWeight: 900, background: 'linear-gradient(135deg, #f59e0b, #f97316)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: 6 }}>💌 Future Letters</h1>
          <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 14 }}>Messages locked in time. They open when you are ready.</p>
        </div>
        <button onClick={() => setShowAdd(true)} style={{
          background: 'linear-gradient(135deg, #f59e0b, #f97316)', border: 'none', borderRadius: 12, padding: '10px 20px',
          color: '#000', fontWeight: 700, fontSize: 13, cursor: 'pointer', display: 'flex', gap: 6, alignItems: 'center'
        }}>
          <Plus size={15} /> Write Letter
        </button>
      </div>

      {showAdd && (
        <div style={{ background: '#fdfbf7', border: '1px solid #e5e5e5', borderRadius: 12, padding: 40, marginBottom: 40, color: '#1a1a1a', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, alignItems: 'center', borderBottom: '2px solid #ef4444', paddingBottom: 16, marginBottom: 24 }}>
            <div style={{ fontSize: 20, fontWeight: 800, fontFamily: 'Georgia, serif', color: '#7f1d1d' }}>Drafting New Letter</div>
            <button onClick={() => setShowAdd(false)} style={{ background: 'none', border: 'none', color: '#999', cursor: 'pointer' }}><X size={20} /></button>
          </div>
          <div className="mobile-stack-grid" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24, marginBottom: 24 }}>
            <div>
              <label style={{ display: 'block', fontSize: 11, color: '#666', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>Title / Subject</label>
              <input placeholder="To College Me..." value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} style={{ width: '100%', background: 'transparent', border: 'none', borderBottom: '1px dashed #ccc', color: '#111', fontSize: 24, fontFamily: 'Georgia, serif', paddingBottom: 8, outline: 'none' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 11, color: '#666', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>Unlock Date</label>
              <input type="date" min={todayStr} value={form.unlockDate} onChange={e => setForm({ ...form, unlockDate: e.target.value })} style={{ width: '100%', background: '#fff', border: '1px solid #e5e5e5', borderRadius: 8, color: '#111', fontSize: 14, padding: 12, outline: 'none' }} />
            </div>
          </div>
          <textarea placeholder="Dear future me..." value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} style={{ width: '100%', background: 'transparent', border: 'none', borderBottom: '1px dashed #ccc', color: '#333', fontSize: 18, fontFamily: 'Georgia, serif', padding: '16px 0', minHeight: 250, resize: 'vertical', outline: 'none', marginBottom: 32, lineHeight: 1.8 }} />
          <button onClick={save} style={{ background: '#7f1d1d', border: 'none', borderRadius: 8, padding: '16px', width: '100%', color: '#fff', fontWeight: 700, fontSize: 15, cursor: 'pointer', display: 'flex', justifyContent: 'center', gap: 10, alignItems: 'center', textTransform: 'uppercase', letterSpacing: 2 }}>
            <Lock size={16} /> Seal the Letter
          </button>
        </div>
      )}

      {reading && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 24 }}>
          <div style={{ background: '#fdfbf7', borderRadius: 8, padding: 48, maxWidth: 640, width: '100%', maxHeight: '90vh', overflowY: 'auto', position: 'relative', boxShadow: '0 24px 48px rgba(0,0,0,0.5)', color: '#1a1a1a', fontFamily: 'Georgia, serif' }}>
            <button onClick={() => setReading(null)} style={{ position: 'absolute', top: 24, right: 24, background: 'none', border: 'none', color: '#999', cursor: 'pointer' }}><X size={24} /></button>
            <div style={{ textAlign: 'center', marginBottom: 32, paddingBottom: 24, borderBottom: '1px solid #e5e5e5' }}>
              <div style={{ fontSize: 12, color: '#7f1d1d', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 12 }}>Opened: {new Date().toLocaleDateString('en', { month: 'long', day: 'numeric', year: 'numeric' })}</div>
              <h2 style={{ fontSize: 32, margin: 0, color: '#111' }}>{reading.title}</h2>
              <div style={{ fontSize: 13, color: '#666', marginTop: 12, fontStyle: 'italic' }}>Written on {new Date(reading.createdAt).toLocaleDateString('en', { month: 'long', day: 'numeric', year: 'numeric' })}</div>
            </div>
            <div style={{ fontSize: 18, lineHeight: 1.8, color: '#333', whiteSpace: 'pre-wrap' }}>{reading.content}</div>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 24 }}>
        {futureLetters.sort((a, b) => new Date(a.unlockDate).getTime() - new Date(b.unlockDate).getTime()).map(l => {
          const uDate = new Date(l.unlockDate);
          const isLocked = uDate > now;
          const daysLeft = Math.ceil((uDate.getTime() - now.getTime()) / 86400000);

          return (
            <div key={l.id} style={{ background: isLocked ? 'rgba(255,255,255,0.02)' : 'rgba(16,185,129,0.05)', border: `1px solid ${isLocked ? 'rgba(255,255,255,0.05)' : 'rgba(16,185,129,0.3)'}`, borderRadius: 20, padding: 24, display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, alignItems: 'flex-start', marginBottom: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: isLocked ? '#ef4444' : '#10b981', background: isLocked ? 'rgba(239,68,68,0.1)' : 'rgba(16,185,129,0.1)', padding: '6px 12px', borderRadius: 99, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>
                  {isLocked ? <Lock size={12} /> : <Unlock size={12} />}
                  {isLocked ? 'Sealed' : 'Unlocked'}
                </div>
                <button onClick={() => removeFutureLetter(l.id)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.15)', cursor: 'pointer' }}><Trash2 size={16} /></button>
              </div>
              <h3 style={{ fontSize: 20, fontWeight: 800, marginBottom: 8, color: '#f0f0f0' }}>{l.title}</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'rgba(255,255,255,0.4)', marginBottom: 24 }}>
                <Calendar size={14} /> Opens: {uDate.toLocaleDateString('en', { month: 'long', day: 'numeric', year: 'numeric' })}
              </div>
              
              <div style={{ marginTop: 'auto' }}>
                {isLocked ? (
                  <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: 12, padding: 20, textAlign: 'center', border: '1px dashed rgba(255,255,255,0.1)' }}>
                    <div style={{ fontSize: 24, marginBottom: 8 }}>🔒</div>
                    <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', fontWeight: 600 }}>Opens in {daysLeft} days</div>
                  </div>
                ) : (
                  <button onClick={() => setReading(l)} style={{ width: '100%', background: '#10b981', border: 'none', borderRadius: 12, padding: 16, color: '#000', fontWeight: 700, fontSize: 14, cursor: 'pointer', display: 'flex', justifyContent: 'center', gap: 8, alignItems: 'center', transition: 'transform 0.2s' }}
                    onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                    onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}>
                    <Mail size={16} /> Read Letter
                  </button>
                )}
              </div>
            </div>
          );
        })}
        {futureLetters.length === 0 && (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: 64, background: 'rgba(255,255,255,0.02)', borderRadius: 24, border: '1px dashed rgba(255,255,255,0.1)' }}>
            <Mail size={48} color="rgba(255,255,255,0.1)" style={{ marginBottom: 16 }} />
            <div style={{ fontSize: 16, color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>No letters sent to the future yet.</div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.2)', marginTop: 8 }}>Write something to read in a year or five!</div>
          </div>
        )}
      </div>
      <style dangerouslySetInnerHTML={{__html:`@keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}`}} />
    </div>
  );
}