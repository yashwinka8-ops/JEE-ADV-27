'use client';

import { useState } from 'react';
import { useStore } from '@/store/useStore';
import { Save, BrainCircuit, Zap, UserSquare, Battery, NotebookTabs } from 'lucide-react';

const TABS = [
  { k: 'identity', label: 'Identity', icon: UserSquare },
  { k: 'energy', label: 'Energy Map', icon: Battery },
  { k: 'personality', label: 'Personality', icon: BrainCircuit },
  { k: 'philosophy', label: 'Philosophy', icon: Zap },
  { k: 'reflections', label: 'Reflections', icon: NotebookTabs },
] as const;

export default function SelfAnalysisPage() {
  const { selfAnalysis, updateSelfAnalysis } = useStore();
  const [tab, setTab] = useState<'identity' | 'energy' | 'personality' | 'philosophy' | 'reflections'>('identity');
  const [saved, setSaved] = useState(false);
  const [data, setData] = useState(selfAnalysis);
  const [newRef, setNewRef] = useState({ year: new Date().getFullYear(), changed: '', mistake: '', lesson: '', proud: '' });
  const [showRefForm, setShowRefForm] = useState(false);

  const save = () => {
    updateSelfAnalysis(data);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const addReflection = () => {
    if (!newRef.proud) return;
    const newData = { ...data, yearlyReflections: [newRef, ...data.yearlyReflections] };
    setData(newData); updateSelfAnalysis(newData);
    setShowRefForm(false); setNewRef({ year: new Date().getFullYear(), changed: '', mistake: '', lesson: '', proud: '' });
  };

  const InputA = ({ label, field, placeholder }: any) => (
    <div style={{ marginBottom: 24 }}>
      <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.7)', marginBottom: 8, letterSpacing: 0.5 }}>{label}</label>
      <textarea value={(data as any)[field]} onChange={e => setData(d => ({ ...d, [field]: e.target.value }))} placeholder={placeholder}
        style={{ width: '100%', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, color: '#f0f0f0', fontSize: 14, padding: 16, minHeight: 120, resize: 'vertical', outline: 'none', fontFamily: 'inherit', lineHeight: 1.6 }} />
    </div>
  );

  const Slider = ({ label, field, color }: any) => (
    <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 16, padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, marginBottom: 12 }}>
        <span style={{ fontWeight: 700, fontSize: 14 }}>{label}</span>
        <span style={{ color, fontWeight: 800 }}>{(data as any)[field]}/10</span>
      </div>
      <input type="range" min={1} max={10} value={(data as any)[field]} onChange={e => setData(d => ({ ...d, [field]: +e.target.value }))} style={{ width: '100%', accentColor: color }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, fontSize: 11, color: 'rgba(255,255,255,0.3)', marginTop: 8 }}>
        <span>Needs Work</span><span>Mastered</span>
      </div>
    </div>
  );

  return (
    <div style={{ color: '#f0f0f0', fontFamily: 'Inter, sans-serif', animation: 'fadeUp 0.4s ease-out', maxWidth: 900, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, alignItems: 'flex-start', marginBottom: 40 }}>
        <div>
          <h1 style={{ fontSize: 32, fontWeight: 900, background: 'linear-gradient(135deg, #8b5cf6, #d946ef)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: 8 }}>🧩 Self Analysis</h1>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14 }}>Your private psychological mirror.</p>
        </div>
        <button onClick={save} style={{
          background: saved ? '#10b981' : 'linear-gradient(135deg, #8b5cf6, #d946ef)', border: 'none', borderRadius: 12, padding: '10px 20px', color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer', display: 'flex', gap: 6, alignItems: 'center', transition: 'all 0.3s'
        }}>
          {saved ? '✓ Saved' : <><Save size={15} /> Save Changes</>}
        </button>
      </div>

      <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>
        {/* Sidebar Nav */}
        <div style={{ width: 220, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
          {TABS.map(t => (
            <button key={t.k} onClick={() => setTab(t.k as any)} style={{
              display: 'flex', alignItems: 'center', gap: 12, width: '100%', background: tab === t.k ? 'rgba(139,92,246,0.15)' : 'transparent',
              border: 'none', borderRadius: 12, padding: '14px 16px', color: tab === t.k ? '#a78bfa' : 'rgba(255,255,255,0.5)',
              fontSize: 14, fontWeight: tab === t.k ? 700 : 500, cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s'
            }}>
              <t.icon size={18} /> {t.label}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div style={{ flex: 1, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 24, padding: 40, minHeight: 600 }}>
          
          {tab === 'identity' && (
            <div style={{ animation: 'fadeUp 0.3s ease-out' }}>
              <h2 style={{ fontSize: 24, fontWeight: 800, color: '#f0f0f0', marginBottom: 24 }}>Who are you?</h2>
              <InputA label="Identity (Who am I without titles?)" field="identity" placeholder="I am a creator, a learner, a son/daughter..." />
              <InputA label="Core Values (Top 3)" field="values" placeholder="1. Freedom  2. Mastery  3. Kindness" />
              <InputA label="Deepest Fears" field="fears" placeholder="Not reaching my potential, regretting time wasted..." />
            </div>
          )}

          {tab === 'energy' && (
            <div style={{ animation: 'fadeUp 0.3s ease-out' }}>
              <h2 style={{ fontSize: 24, fontWeight: 800, color: '#f0f0f0', marginBottom: 24 }}>Energy Map</h2>
              <div className="mobile-stack-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#10b981', fontWeight: 800, marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1 }}><Battery size={16} /> Gives Energy</div>
                  <textarea value={data.givesEnergy} onChange={e => setData(d => ({ ...d, givesEnergy: e.target.value }))} placeholder="- Coding new things&#10;- Talking to passionate people&#10;- Heavy workouts" style={{ width: '100%', background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 12, color: '#f0f0f0', fontSize: 14, padding: 16, minHeight: 300, outline: 'none', lineHeight: 1.6 }} />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#ef4444', fontWeight: 800, marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1 }}><Battery size={16} style={{ transform: 'rotate(180deg)' }} /> Drains Energy</div>
                  <textarea value={data.drainsEnergy} onChange={e => setData(d => ({ ...d, drainsEnergy: e.target.value }))} placeholder="- Endless scrolling&#10;- Negative news&#10;- Bureaucracy" style={{ width: '100%', background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 12, color: '#f0f0f0', fontSize: 14, padding: 16, minHeight: 300, outline: 'none', lineHeight: 1.6 }} />
                </div>
              </div>
            </div>
          )}

          {tab === 'personality' && (
            <div style={{ animation: 'fadeUp 0.3s ease-out' }}>
              <h2 style={{ fontSize: 24, fontWeight: 800, color: '#f0f0f0', marginBottom: 24 }}>Trait Assessment</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20, marginBottom: 40 }}>
                <Slider label="Discipline" field="discipline" color="#3b82f6" />
                <Slider label="Confidence" field="confidence" color="#f59e0b" />
                <Slider label="Communication" field="communication" color="#ec4899" />
                <Slider label="Empathy" field="empathy" color="#10b981" />
              </div>
              <div className="mobile-stack-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                <InputA label="Top Strengths" field="strengths" placeholder="Analytical thinking, persistence..." />
                <InputA label="Weaknesses to Work On" field="weaknesses" placeholder="Overthinking, procrastination..." />
              </div>
            </div>
          )}

          {tab === 'philosophy' && (
            <div style={{ animation: 'fadeUp 0.3s ease-out' }}>
              <h2 style={{ fontSize: 24, fontWeight: 800, color: '#f0f0f0', marginBottom: 24 }}>Life Philosophy</h2>
              <InputA label="What is success to me?" field="whatIsSuccess" placeholder="Having control over my time, being able to provide..." />
              <InputA label="Who do I want to become?" field="wantToBecome" placeholder="A person who is reliable, skilled, and calm..." />
              <InputA label="My Core Principles" field="principles" placeholder="- Never complain without proposing a solution&#10;- Compound interest applies to habits" />
            </div>
          )}

          {tab === 'reflections' && (
            <div style={{ animation: 'fadeUp 0.3s ease-out' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, alignItems: 'center', marginBottom: 24 }}>
                <h2 style={{ fontSize: 24, fontWeight: 800, color: '#f0f0f0' }}>Yearly Reflections</h2>
                <button onClick={() => setShowRefForm(!showRefForm)} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '8px 16px', color: '#fff', fontSize: 13, cursor: 'pointer' }}>+ New Year</button>
              </div>
              
              {showRefForm && (
                <div style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(139,92,246,0.3)', borderRadius: 16, padding: 24, marginBottom: 32 }}>
                  <input type="number" value={newRef.year} onChange={e => setNewRef({ ...newRef, year: +e.target.value })} style={{ background: 'transparent', border: 'none', borderBottom: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: 24, fontWeight: 800, outline: 'none', marginBottom: 20 }} />
                  <div className="mobile-stack-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                    <textarea value={newRef.changed} onChange={e => setNewRef({ ...newRef, changed: e.target.value })} placeholder="What changed this year?" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 8, padding: 12, color: '#fff', outline: 'none', minHeight: 80 }} />
                    <textarea value={newRef.proud} onChange={e => setNewRef({ ...newRef, proud: e.target.value })} placeholder="What am I most proud of?" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 8, padding: 12, color: '#fff', outline: 'none', minHeight: 80 }} />
                    <textarea value={newRef.mistake} onChange={e => setNewRef({ ...newRef, mistake: e.target.value })} placeholder="Biggest mistake?" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 8, padding: 12, color: '#fff', outline: 'none', minHeight: 80 }} />
                    <textarea value={newRef.lesson} onChange={e => setNewRef({ ...newRef, lesson: e.target.value })} placeholder="Biggest lesson?" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 8, padding: 12, color: '#fff', outline: 'none', minHeight: 80 }} />
                  </div>
                  <button onClick={addReflection} style={{ background: '#8b5cf6', border: 'none', borderRadius: 8, padding: '10px 24px', color: '#fff', fontWeight: 700, cursor: 'pointer' }}>Save Reflection</button>
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                {data.yearlyReflections.map(r => (
                  <div key={r.year} style={{ borderLeft: '2px solid #8b5cf6', paddingLeft: 24, position: 'relative' }}>
                    <div style={{ position: 'absolute', left: -7, top: 0, width: 12, height: 12, borderRadius: '50%', background: '#8b5cf6', border: '2px solid #111' }} />
                    <div style={{ fontSize: 24, fontWeight: 900, color: '#8b5cf6', marginBottom: 16 }}>{r.year}</div>
                    <div className="mobile-stack-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                      {r.proud && <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 12, padding: 16 }}><div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', marginBottom: 4 }}>Proud Of</div><div style={{ fontSize: 14 }}>{r.proud}</div></div>}
                      {r.changed && <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 12, padding: 16 }}><div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', marginBottom: 4 }}>What Changed</div><div style={{ fontSize: 14 }}>{r.changed}</div></div>}
                      {r.mistake && <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 12, padding: 16 }}><div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', marginBottom: 4 }}>Biggest Mistake</div><div style={{ fontSize: 14 }}>{r.mistake}</div></div>}
                      {r.lesson && <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 12, padding: 16 }}><div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', marginBottom: 4 }}>Biggest Lesson</div><div style={{ fontSize: 14 }}>{r.lesson}</div></div>}
                    </div>
                  </div>
                ))}
                {data.yearlyReflections.length === 0 && <div style={{ color: 'rgba(255,255,255,0.3)' }}>No yearly reflections saved yet. Start by logging this year.</div>}
              </div>
            </div>
          )}

        </div>
      </div>
      <style dangerouslySetInnerHTML={{__html:`@keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}`}} />
    </div>
  );
}