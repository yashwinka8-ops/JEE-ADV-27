'use client';

import { useMemo } from 'react';
import { useStore } from '@/store/useStore';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';

function Heatmap({ dateMap }: { dateMap: Record<string, number> }) {
  const weeks = useMemo(() => {
    const result: { date: string; mins: number }[][] = [];
    const today = new Date();
    const start = new Date(today);
    start.setDate(today.getDate() - 52 * 7);
    start.setDate(start.getDate() - start.getDay());
    let week: { date: string; mins: number }[] = [];
    const cur = new Date(start);
    while (cur <= today) {
      const key = cur.toISOString().slice(0, 10);
      week.push({ date: key, mins: dateMap[key] || 0 });
      if (week.length === 7) { result.push(week); week = []; }
      cur.setDate(cur.getDate() + 1);
    }
    if (week.length) result.push(week);
    return result;
  }, [dateMap]);

  const col = (m: number) =>
    m === 0 ? 'var(--bg-tertiary)' :
    m < 30  ? 'rgba(10,132,255,0.25)' :
    m < 120 ? 'rgba(10,132,255,0.50)' :
    m < 240 ? 'rgba(10,132,255,0.75)' : 'var(--blue)';

  return (
    <div style={{ overflowX: 'auto' }}>
      <div style={{ display: 'flex', gap: 3, minWidth: 'max-content' }}>
        {weeks.map((w, wi) => (
          <div key={wi} style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {w.map(d => (
              <div
                key={d.date}
                title={`${d.date}: ${d.mins}m`}
                style={{ width: 11, height: 11, borderRadius: 3, background: col(d.mins), cursor: 'default', transition: 'opacity 0.1s' }}
              />
            ))}
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 5, marginTop: 8, alignItems: 'center' }}>
        <span style={{ fontSize: 11, color: 'var(--label-tertiary)' }}>Less</span>
        {[0, 60, 120, 240, 360].map(m => (
          <div key={m} style={{ width: 11, height: 11, borderRadius: 3, background: col(m) }} />
        ))}
        <span style={{ fontSize: 11, color: 'var(--label-tertiary)' }}>More</span>
      </div>
    </div>
  );
}

export default function AnalyticsPage() {
  const { sessions, chapters, mockTests, getStudyDates } = useStore();
  const dateMap = getStudyDates();

  const subMins = useMemo(() => {
    const m: Record<string, number> = { physics: 0, chemistry: 0, maths: 0, general: 0 };
    sessions.forEach(s => { m[s.subject] = (m[s.subject] || 0) + s.durationMinutes; });
    return m;
  }, [sessions]);

  const pieData = Object.entries(subMins)
    .filter(([, v]) => v > 0)
    .map(([k, v]) => ({ name: k.charAt(0).toUpperCase() + k.slice(1), value: Math.round(v / 60) }));

  const PIE_COLORS: Record<string, string> = {
    Physics: 'var(--blue)', Chemistry: 'var(--green)', Maths: 'var(--amber)', General: '#8e8e93',
  };

  const masteryData = useMemo(() => {
    const c = { 'Not Started': 0, Learning: 0, Practiced: 0, Mastered: 0 };
    chapters.forEach(ch => {
      if (ch.mastery === 'not-started') c['Not Started']++;
      else if (ch.mastery === 'learning') c.Learning++;
      else if (ch.mastery === 'practiced') c.Practiced++;
      else c.Mastered++;
    });
    return Object.entries(c).map(([name, value]) => ({ name, value }));
  }, [chapters]);

  const masteryColors = ['#48484a', 'var(--red)', 'var(--amber)', 'var(--green)'];

  const weeklyData = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      const key = d.toISOString().slice(0, 10);
      return { day: d.toLocaleDateString('en', { weekday: 'short' }), mins: dateMap[key] || 0 };
    });
  }, [dateMap]);

  const totalHrs  = Math.round(sessions.reduce((a, s) => a + s.durationMinutes, 0) / 60);
  const totalDays = Object.keys(dateMap).length;
  const avgMins   = totalDays ? Math.round(sessions.reduce((a, s) => a + s.durationMinutes, 0) / totalDays) : 0;

  const tooltipStyle = {
    contentStyle: { background: 'var(--bg-secondary)', border: 'none', borderRadius: 12, boxShadow: '0 4px 20px rgba(0,0,0,0.4)' },
    labelStyle: { color: 'var(--label-primary)', fontWeight: 600 },
    itemStyle: { color: 'var(--label-secondary)' },
  };

  return (
    <div className="fade-in-up">
      <div className="page-header"><h1>Analytics</h1><p>Visualise your study patterns and progress</p></div>

      <div className="grid-4 mb-6 stagger">
        {[
          { label: 'Total Hours', val: `${totalHrs}h`, color: 'var(--blue)' },
          { label: 'Study Days',  val: totalDays,       color: 'var(--green)' },
          { label: 'Avg / Day',   val: `${Math.floor(avgMins/60)}h ${avgMins%60}m`, color: 'var(--amber)' },
          { label: 'Tests Taken', val: mockTests.length, color: 'var(--red)' },
        ].map(({ label, val, color }) => (
          <div key={label} className="stat-tile">
            <div className="stat-label">{label}</div>
            <div className="stat-value" style={{ color, fontSize: 28 }}>{val}</div>
          </div>
        ))}
      </div>

      {/* Heatmap */}
      <div className="stat-tile mb-6">
        <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>Study Heatmap · Last 12 Weeks</div>
        <Heatmap dateMap={dateMap} />
      </div>

      <div className="grid-2 mb-6">
        {/* Weekly bar */}
        <div className="stat-tile">
          <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>This Week</div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={weeklyData} barCategoryGap="35%">
              <CartesianGrid strokeDasharray="3 3" stroke="var(--separator)" />
              <XAxis dataKey="day" tick={{ fill: 'var(--label-tertiary)', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'var(--label-tertiary)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip {...tooltipStyle} formatter={(v: any) => [`${v} mins`, 'Study Time']} />
              <Bar dataKey="mins" fill="var(--blue)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie */}
        <div className="stat-tile">
          <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>Time by Subject</div>
          {pieData.length === 0 ? (
            <div className="empty-state" style={{ padding: 40 }}>No sessions yet.</div>
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" outerRadius={70} innerRadius={35} dataKey="value"
                  label={({ name, value }) => `${name} ${value}h`} labelLine={false} fontSize={11}>
                  {pieData.map((e, i) => <Cell key={i} fill={PIE_COLORS[e.name] || 'var(--blue)'} />)}
                </Pie>
                <Tooltip {...tooltipStyle} formatter={(v: any) => [`${v} hours`]} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Mastery bar */}
      <div className="stat-tile">
        <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>Chapter Mastery</div>
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={masteryData} layout="vertical" barCategoryGap="25%">
            <CartesianGrid strokeDasharray="3 3" stroke="var(--separator)" horizontal={false} />
            <XAxis type="number" tick={{ fill: 'var(--label-tertiary)', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis type="category" dataKey="name" tick={{ fill: 'var(--label-secondary)', fontSize: 12 }} axisLine={false} tickLine={false} width={90} />
            <Tooltip {...tooltipStyle} formatter={(v: any) => [`${v} chapters`]} />
            <Bar dataKey="value" radius={[0, 6, 6, 0]}>
              {masteryData.map((_, i) => <Cell key={i} fill={masteryColors[i]} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
