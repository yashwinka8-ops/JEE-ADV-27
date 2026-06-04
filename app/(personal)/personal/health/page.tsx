'use client';

import { useState, useEffect } from 'react';
import { useStore, HealthLog } from '@/store/useStore';
import { Activity, Plus, Trash2, Calendar, Pill, Thermometer, Stethoscope } from 'lucide-react';

export default function HealthPage() {
  const { healthLogs, addHealthLog, removeHealthLog } = useStore();
  const [mounted, setMounted] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form state
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [type, setType] = useState<'sick' | 'hospital' | 'medication'>('sick');
  const [notes, setNotes] = useState('');
  const [severity, setSeverity] = useState<1 | 2 | 3 | 4 | 5>(3);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addHealthLog({
      id: Date.now().toString(),
      date,
      type,
      notes,
      severity
    });
    setIsModalOpen(false);
    setNotes('');
    setSeverity(3);
  };

  const sortedLogs = [...healthLogs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const totalSick = healthLogs.filter(l => l.type === 'sick').length;
  const totalHospital = healthLogs.filter(l => l.type === 'hospital').length;
  const totalMedication = healthLogs.filter(l => l.type === 'medication').length;

  const getIcon = (t: string) => {
    if (t === 'sick') return <Thermometer color="#ef4444" size={24} />;
    if (t === 'hospital') return <Stethoscope color="#3b82f6" size={24} />;
    return <Pill color="#10b981" size={24} />;
  };

  return (
    <div style={{ color: '#f8fafc', animation: 'fadeUp 0.5s ease-out', maxWidth: 1000, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, alignItems: 'flex-end', marginBottom: 40 }}>
        <div>
          <h1 style={{ fontSize: 36, fontWeight: 900, letterSpacing: '-1px', display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            <Activity color="#14b8a6" size={36} />
            Health Tracker
          </h1>
          <p style={{ color: '#94a3b8', fontSize: 16 }}>Monitor your sickness, hospital visits, and medications.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          style={{ background: 'linear-gradient(135deg, #0d9488, #14b8a6)', border: 'none', borderRadius: 16, padding: '12px 24px', color: '#fff', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 8px 20px -8px rgba(20,184,166,0.6)' }}
        >
          <Plus size={18} /> Add Log
        </button>
      </div>

      <div className="mobile-stack-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24, marginBottom: 40 }}>
        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 24, padding: 24 }}>
          <div style={{ color: '#ef4444', marginBottom: 12 }}><Thermometer size={28} /></div>
          <div style={{ fontSize: 32, fontWeight: 800, marginBottom: 4 }}>{totalSick}</div>
          <div style={{ color: '#94a3b8', fontSize: 14, fontWeight: 600 }}>Times Sick</div>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 24, padding: 24 }}>
          <div style={{ color: '#3b82f6', marginBottom: 12 }}><Stethoscope size={28} /></div>
          <div style={{ fontSize: 32, fontWeight: 800, marginBottom: 4 }}>{totalHospital}</div>
          <div style={{ color: '#94a3b8', fontSize: 14, fontWeight: 600 }}>Hospital Visits</div>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 24, padding: 24 }}>
          <div style={{ color: '#10b981', marginBottom: 12 }}><Pill size={28} /></div>
          <div style={{ fontSize: 32, fontWeight: 800, marginBottom: 4 }}>{totalMedication}</div>
          <div style={{ color: '#94a3b8', fontSize: 14, fontWeight: 600 }}>Medication Logs</div>
        </div>
      </div>

      <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 20 }}>Health History</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {sortedLogs.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', background: 'rgba(255,255,255,0.02)', borderRadius: 24, border: '1px dashed rgba(255,255,255,0.1)', color: '#64748b' }}>
            No health logs recorded yet. Stay healthy!
          </div>
        ) : (
          sortedLogs.map(log => (
            <div key={log.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, padding: 24, background: 'rgba(255,255,255,0.02)', borderRadius: 24, border: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                <div style={{ width: 56, height: 56, borderRadius: 16, background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {getIcon(log.type)}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 4, textTransform: 'capitalize' }}>
                    {log.type === 'sick' ? 'Sick Day' : log.type === 'hospital' ? 'Hospital Visit' : 'Medication'}
                  </div>
                  <div style={{ color: '#94a3b8', fontSize: 14 }}>{log.notes}</div>
                  <div style={{ display: 'flex', gap: 4, marginTop: 8 }}>
                    {[1, 2, 3, 4, 5].map(star => (
                      <div key={star} style={{ width: 8, height: 8, borderRadius: '50%', background: star <= log.severity ? '#ef4444' : 'rgba(255,255,255,0.1)' }} />
                    ))}
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                <div style={{ color: '#64748b', fontSize: 14, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Calendar size={14} /> {new Date(log.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </div>
                <button onClick={() => removeHealthLog(log.id)} style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer', padding: 8 }}>
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {isModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', padding: 40, borderRadius: 32, width: '100%', maxWidth: 500, boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }}>
            <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 24 }}>New Health Log</h2>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div>
                <label style={{ display: 'block', marginBottom: 8, color: '#94a3b8', fontSize: 14, fontWeight: 600 }}>Type</label>
                <div className="mobile-stack-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                  {['sick', 'hospital', 'medication'].map(t => (
                    <div 
                      key={t}
                      onClick={() => setType(t as any)}
                      style={{ 
                        padding: '12px', textAlign: 'center', borderRadius: 12, cursor: 'pointer', textTransform: 'capitalize', fontWeight: 600, fontSize: 14,
                        background: type === t ? 'rgba(20,184,166,0.2)' : 'rgba(255,255,255,0.05)',
                        border: `1px solid ${type === t ? '#14b8a6' : 'transparent'}`,
                        color: type === t ? '#14b8a6' : '#94a3b8'
                      }}
                    >
                      {t}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: 8, color: '#94a3b8', fontSize: 14, fontWeight: 600 }}>Date</label>
                <input 
                  type="date" required value={date} onChange={e => setDate(e.target.value)}
                  style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', padding: 16, borderRadius: 16, color: '#fff', fontSize: 16, outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: 8, color: '#94a3b8', fontSize: 14, fontWeight: 600 }}>Severity / Intensity (1-5)</label>
                <div style={{ display: 'flex', gap: 12 }}>
                  {[1, 2, 3, 4, 5].map(num => (
                    <div 
                      key={num}
                      onClick={() => setSeverity(num as any)}
                      style={{
                        width: 40, height: 40, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer', fontWeight: 700,
                        background: severity === num ? '#ef4444' : 'rgba(255,255,255,0.05)',
                        color: severity === num ? '#fff' : '#94a3b8'
                      }}
                    >
                      {num}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: 8, color: '#94a3b8', fontSize: 14, fontWeight: 600 }}>Notes / Symptoms</label>
                <textarea 
                  required placeholder="What happened? Any symptoms or doctor's advice?" value={notes} onChange={e => setNotes(e.target.value)}
                  style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', padding: 16, borderRadius: 16, color: '#fff', fontSize: 16, outline: 'none', resize: 'vertical', minHeight: 100 }}
                />
              </div>

              <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
                <button type="button" onClick={() => setIsModalOpen(false)} style={{ flex: 1, padding: 16, background: 'rgba(255,255,255,0.05)', border: 'none', borderRadius: 16, color: '#f8fafc', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ flex: 1, padding: 16, background: '#14b8a6', border: 'none', borderRadius: 16, color: '#fff', fontWeight: 700, cursor: 'pointer' }}>Save Log</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}} />
    </div>
  );
}
