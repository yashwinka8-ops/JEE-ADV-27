'use client';

import { useState } from 'react';
import { useStore } from '@/store/useStore';
import type { LifeAnalyticsLog } from '@/store/useStore';
import { Plus, X, Activity, Moon, Dumbbell, BookOpen } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, BarChart, Bar } from 'recharts';

export default function AnalyticsPage() {
  const { lifeAnalytics, upsertLifeAnalytics } = useStore();
  const [showLogForm, setShowLogForm] = useState(false);
  const [form, setForm] = useState<Partial<LifeAnalyticsLog>>({
    date: new Date().toISOString().slice(0, 10),
    sleep: 7,
    weight: 70,
    exercise: 0,
    booksRead: 0,
    moneySaved: 0,
    mood: 3,
    productivity: 5
  });

  const save = () => {
    if (!form.date) return;
    upsertLifeAnalytics({ ...form } as LifeAnalyticsLog);
    setShowLogForm(false);
  };

  // Sort logs by date for charts
  const sorted = [...(lifeAnalytics || [])].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Recent averages (last 7 logs)
  const recent = sorted.slice(-7);
  const avgSleep = recent.length ? (recent.reduce((a, b) => a + (b.sleep || 0), 0) / recent.length).toFixed(1) : '0';
  const avgWorkout = recent.length ? Math.round(recent.reduce((a, b) => a + (b.exercise || 0), 0) / recent.length) : 0;
  const avgMood = recent.length ? (recent.reduce((a, b) => a + (b.mood || 0), 0) / recent.length).toFixed(1) : '0';
  const latestWeight = sorted.length ? sorted[sorted.length - 1].weight : 0;

  return (
    <div style={{ color: '#f0f0f0', fontFamily: 'Inter, sans-serif', animation: 'fadeUp 0.4s ease-out' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, alignItems: 'flex-start', marginBottom: 40 }}>
        <div>
          <h1 style={{ fontSize: 32, fontWeight: 900, background: 'linear-gradient(135deg, #22d3ee, #8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: 6 }}>📈 Life Analytics</h1>
          <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 14 }}>Track the inputs that shape your life.</p>
        </div>
        <button onClick={() => setShowLogForm(true)} style={{
          background: 'linear-gradient(135deg, #22d3ee, #8b5cf6)', border: 'none', borderRadius: 12, padding: '10px 20px',
          color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer', display: 'flex', gap: 6, alignItems: 'center'
        }}>
          <Plus size={15} /> Log Today
        </button>
      </div>

      {showLogForm && (
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(34,211,238,0.2)', borderRadius: 24, padding: 32, marginBottom: 40 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, marginBottom: 24 }}>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: '#22d3ee' }}>Log Daily Metrics</h2>
            <button onClick={() => setShowLogForm(false)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', cursor: 'pointer' }}><X size={20} /></button>
          </div>
          <div className="mobile-stack-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, marginBottom: 20 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, color: 'rgba(255,255,255,0.4)', marginBottom: 8 }}>Date</label>
              <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} style={{ width: '100%', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, color: '#fff', padding: 12, outline: 'none' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, color: 'rgba(255,255,255,0.4)', marginBottom: 8 }}>Sleep (Hours)</label>
              <input type="number" step="0.5" value={form.sleep} onChange={e => setForm({ ...form, sleep: +e.target.value })} style={{ width: '100%', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, color: '#fff', padding: 12, outline: 'none' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, color: 'rgba(255,255,255,0.4)', marginBottom: 8 }}>Weight (kg)</label>
              <input type="number" step="0.1" value={form.weight} onChange={e => setForm({ ...form, weight: +e.target.value })} style={{ width: '100%', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, color: '#fff', padding: 12, outline: 'none' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, color: 'rgba(255,255,255,0.4)', marginBottom: 8 }}>Workout (Mins)</label>
              <input type="number" value={form.exercise} onChange={e => setForm({ ...form, exercise: +e.target.value })} style={{ width: '100%', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, color: '#fff', padding: 12, outline: 'none' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, color: 'rgba(255,255,255,0.4)', marginBottom: 8 }}>Books Read (Pages)</label>
              <input type="number" value={form.booksRead} onChange={e => setForm({ ...form, booksRead: +e.target.value })} style={{ width: '100%', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, color: '#fff', padding: 12, outline: 'none' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, color: 'rgba(255,255,255,0.4)', marginBottom: 8 }}>Overall Mood (1-5)</label>
              <input type="range" min="1" max="5" value={form.mood} onChange={e => setForm({ ...form, mood: +e.target.value })} style={{ width: '100%', accentColor: '#22d3ee', marginTop: 12 }} />
              <div style={{ textAlign: 'center', fontSize: 13, marginTop: 8, fontWeight: 700, color: '#22d3ee' }}>{form.mood}/5</div>
            </div>
          </div>
          <button onClick={save} style={{ background: '#22d3ee', border: 'none', borderRadius: 12, padding: '14px', width: '100%', color: '#000', fontWeight: 800, cursor: 'pointer' }}>Save Log</button>
        </div>
      )}

      {/* Quick Stats */}
      <div className="mobile-stack-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20, marginBottom: 40 }}>
        <div style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 20, padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#60a5fa', marginBottom: 12 }}><Moon size={16} /><span style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase' }}>Avg Sleep</span></div>
          <div style={{ fontSize: 32, fontWeight: 900 }}>{avgSleep}<span style={{ fontSize: 14, color: 'rgba(255,255,255,0.3)', fontWeight: 500, marginLeft: 6 }}>hrs</span></div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginTop: 8 }}>Last 7 entries</div>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 20, padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#ec4899', marginBottom: 12 }}><Activity size={16} /><span style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase' }}>Weight</span></div>
          <div style={{ fontSize: 32, fontWeight: 900 }}>{latestWeight}<span style={{ fontSize: 14, color: 'rgba(255,255,255,0.3)', fontWeight: 500, marginLeft: 6 }}>kg</span></div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginTop: 8 }}>Current</div>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 20, padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#f59e0b', marginBottom: 12 }}><Dumbbell size={16} /><span style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase' }}>Avg Workout</span></div>
          <div style={{ fontSize: 32, fontWeight: 900 }}>{avgWorkout}<span style={{ fontSize: 14, color: 'rgba(255,255,255,0.3)', fontWeight: 500, marginLeft: 6 }}>mins</span></div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginTop: 8 }}>Last 7 entries</div>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 20, padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#10b981', marginBottom: 12 }}><BookOpen size={16} /><span style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase' }}>Avg Mood</span></div>
          <div style={{ fontSize: 32, fontWeight: 900 }}>{avgMood}<span style={{ fontSize: 14, color: 'rgba(255,255,255,0.3)', fontWeight: 500, marginLeft: 6 }}>/5</span></div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginTop: 8 }}>Last 7 entries</div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="mobile-stack-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 40 }}>
        
        {/* Sleep & Mood Trends */}
        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 24, padding: 32 }}>
          <div style={{ fontSize: 16, fontWeight: 800, marginBottom: 24, color: '#f0f0f0' }}>Sleep vs. Mood Trend</div>
          {sorted.length > 1 ? (
            <div style={{ height: 260 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={sorted.slice(-30)} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="date" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} tickFormatter={v => v.slice(5)} axisLine={false} tickLine={false} />
                  <YAxis yAxisId="left" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis yAxisId="right" orientation="right" domain={[0, 5]} tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: '#111', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 12 }} />
                  <Line yAxisId="left" type="monotone" dataKey="sleep" name="Sleep (hrs)" stroke="#60a5fa" strokeWidth={3} dot={{ r: 4, fill: '#60a5fa', strokeWidth: 0 }} />
                  <Line yAxisId="right" type="monotone" dataKey="mood" name="Mood" stroke="#10b981" strokeWidth={3} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : <div style={{ height: 260, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.2)' }}>Need at least 2 logs to show charts.</div>}
        </div>

        {/* Weight & Workout Trends */}
        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 24, padding: 32 }}>
          <div style={{ fontSize: 16, fontWeight: 800, marginBottom: 24, color: '#f0f0f0' }}>Weight Progress</div>
          {sorted.length > 1 ? (
            <div style={{ height: 260 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={sorted.slice(-30)} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="date" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} tickFormatter={v => v.slice(5)} axisLine={false} tickLine={false} />
                  <YAxis domain={['dataMin - 1', 'dataMax + 1']} tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: '#111', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 12 }} />
                  <Line type="monotone" dataKey="weight" name="Weight (kg)" stroke="#ec4899" strokeWidth={3} dot={{ r: 4, fill: '#ec4899', strokeWidth: 0 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : <div style={{ height: 260, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.2)' }}>Need at least 2 logs to show charts.</div>}
        </div>

        {/* Workout Bar Chart */}
        <div style={{ gridColumn: '1 / -1', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 24, padding: 32 }}>
          <div style={{ fontSize: 16, fontWeight: 800, marginBottom: 24, color: '#f0f0f0' }}>Activity (Workout)</div>
          {sorted.length > 1 ? (
            <div style={{ height: 260 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sorted.slice(-30)} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="date" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} tickFormatter={v => v.slice(5)} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: '#111', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 12 }} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
                  <Bar dataKey="exercise" name="Workout (mins)" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : <div style={{ height: 260, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.2)' }}>Need at least 2 logs to show charts.</div>}
        </div>

      </div>

      {/* Raw Data List */}
      <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 24, padding: 32 }}>
        <div style={{ fontSize: 16, fontWeight: 800, marginBottom: 24, color: '#f0f0f0' }}>Log History</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[...sorted].reverse().map(l => (
            <div key={l.date} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: 12, fontSize: 13 }}>
              <div style={{ fontWeight: 700, minWidth: 120 }}>{new Date(l.date).toLocaleDateString()}</div>
              <div style={{ flex: 1, display: 'flex', gap: 24, color: 'rgba(255,255,255,0.6)' }}>
                <span><Moon size={14} style={{ display: 'inline', marginRight: 4, verticalAlign: 'text-bottom' }}/>{l.sleep}h</span>
                <span><Activity size={14} style={{ display: 'inline', marginRight: 4, verticalAlign: 'text-bottom' }}/>{l.weight}kg</span>
                <span><Dumbbell size={14} style={{ display: 'inline', marginRight: 4, verticalAlign: 'text-bottom' }}/>{l.exercise}m</span>
                <span><BookOpen size={14} style={{ display: 'inline', marginRight: 4, verticalAlign: 'text-bottom' }}/>{l.booksRead}p</span>
                <span>😊 {l.mood}/5</span>
              </div>
            </div>
          ))}
          {sorted.length === 0 && <div style={{ color: 'rgba(255,255,255,0.3)' }}>No data logged.</div>}
        </div>
      </div>
      
      <style dangerouslySetInnerHTML={{__html:`@keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}`}} />
    </div>
  );
}