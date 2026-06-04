'use client';

import { useState } from 'react';
import { useStore } from '@/store/useStore';
import { ChevronDown, ChevronRight, CheckCircle2, Circle, Atom, Beaker, Calculator } from 'lucide-react';

const BUCKETS = ['2026-2025', '2024-2023', '2022-2021', '2020-2019', '2018-2017'];
const SUBJECTS = [
  { id: 'all', label: 'All Subjects', icon: null },
  { id: 'physics', label: 'Physics', icon: <Atom size={14} /> },
  { id: 'chemistry', label: 'Chemistry', icon: <Beaker size={14} /> },
  { id: 'maths', label: 'Maths', icon: <Calculator size={14} /> }
];

export default function PYQPage() {
  const { chapters, pyqProgress, togglePYQBucket } = useStore();
  const [subFilter, setSubFilter] = useState('all');
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const toggleExpand = (id: string) => {
    setExpanded(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const filteredChapters = chapters.filter(c => subFilter === 'all' || c.subject === subFilter);

  // Calculate overall stats
  let totalBuckets = 0;
  let completedBuckets = 0;

  filteredChapters.forEach(c => {
    const chapterProg = pyqProgress[c.id] || {};
    BUCKETS.forEach(b => {
      totalBuckets += 2; // Mains + Advanced
      if (chapterProg[`mains-${b}`]) completedBuckets++;
      if (chapterProg[`advanced-${b}`]) completedBuckets++;
    });
  });

  const percent = totalBuckets === 0 ? 0 : Math.round((completedBuckets / totalBuckets) * 100);

  return (
    <div className="fade-in-up">
      <div className="page-header flex justify-between items-center">
        <div>
          <h1>PYQ Checklist</h1>
          <p>Track your chapter-wise PYQ completion across 2-year buckets.</p>
        </div>
      </div>

      <div className="card mb-6 p-6">
        <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--label-tertiary)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 16 }}>
          Overall PYQ Completion
        </div>
        <div className="progress-bar mb-2">
          <div className="progress-fill" style={{ width: `${percent}%`, background: 'var(--blue)' }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, fontSize: 13, color: 'var(--label-secondary)' }}>
          <span>{completedBuckets} / {totalBuckets} buckets completed</span>
          <span style={{ fontWeight: 600, color: 'var(--blue)', fontSize: 18 }}>{percent}%</span>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 20 }}>
        {SUBJECTS.map(s => (
          <button
            key={s.id}
            className={`pill ${subFilter === s.id ? (s.id === 'physics' ? 'active' : s.id === 'chemistry' ? 'active-green' : s.id === 'maths' ? 'active-amber' : 'active') : ''}`}
            onClick={() => setSubFilter(s.id)}
          >
            {s.icon} {s.label}
          </button>
        ))}
      </div>

      {/* Chapter List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {filteredChapters.map(chapter => {
          const open = expanded.has(chapter.id);
          const cProg = pyqProgress[chapter.id] || {};

          let cTotal = BUCKETS.length * 2;
          let cDone = 0;
          BUCKETS.forEach(b => {
            if (cProg[`mains-${b}`]) cDone++;
            if (cProg[`advanced-${b}`]) cDone++;
          });

          return (
            <div key={chapter.id} className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <div
                onClick={() => toggleExpand(chapter.id)}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16,
                  padding: '16px 20px', cursor: 'pointer', background: open ? 'var(--bg-tertiary)' : 'transparent',
                  transition: 'background 0.2s',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ color: 'var(--label-tertiary)' }}>
                    {open ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                  </div>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 500, color: 'var(--label-primary)' }}>{chapter.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--label-tertiary)', marginTop: 2, textTransform: 'capitalize' }}>
                      {chapter.subject} • {cDone}/{cTotal} completed
                    </div>
                  </div>
                </div>
                {cDone === cTotal && cTotal > 0 && (
                  <CheckCircle2 size={18} color="var(--green)" />
                )}
              </div>

              {open && (
                <div style={{ borderTop: '1px solid var(--separator)', background: 'var(--bg-secondary)', padding: '0' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--separator)', background: 'var(--bg-tertiary)' }}>
                        <th style={{ padding: '12px 20px', fontSize: 12, fontWeight: 600, color: 'var(--label-tertiary)', textTransform: 'uppercase' }}>Year Bracket</th>
                        <th style={{ padding: '12px 20px', fontSize: 12, fontWeight: 600, color: 'var(--label-tertiary)', textTransform: 'uppercase' }}>JEE Mains</th>
                        <th style={{ padding: '12px 20px', fontSize: 12, fontWeight: 600, color: 'var(--label-tertiary)', textTransform: 'uppercase' }}>JEE Advanced</th>
                      </tr>
                    </thead>
                    <tbody>
                      {BUCKETS.map(bucket => {
                        const mainsKey = `mains-${bucket}`;
                        const advKey = `advanced-${bucket}`;
                        const isMainsDone = cProg[mainsKey] || false;
                        const isAdvDone = cProg[advKey] || false;

                        return (
                          <tr key={bucket} style={{ borderBottom: '1px solid var(--separator)', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-tertiary)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                            <td style={{ padding: '14px 20px', fontSize: 14, fontWeight: 500, color: 'var(--label-primary)' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><ClockIcon size={14} /> {bucket}</div>
                            </td>
                            <td style={{ padding: '14px 20px' }}>
                              <div
                                onClick={() => togglePYQBucket(chapter.id, mainsKey)}
                                style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', width: 'fit-content' }}
                              >
                                {isMainsDone ? <CheckCircle2 size={18} color="var(--green)" fill="var(--green)" fillOpacity={0.15} /> : <Circle size={18} color="var(--label-tertiary)" />}
                                <span style={{ fontSize: 14, color: isMainsDone ? 'var(--label-tertiary)' : 'var(--label-primary)', textDecoration: isMainsDone ? 'line-through' : 'none' }}>
                                  Mains
                                </span>
                              </div>
                            </td>
                            <td style={{ padding: '14px 20px' }}>
                              <div
                                onClick={() => togglePYQBucket(chapter.id, advKey)}
                                style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', width: 'fit-content' }}
                              >
                                {isAdvDone ? <CheckCircle2 size={18} color="var(--blue)" fill="var(--blue)" fillOpacity={0.15} /> : <Circle size={18} color="var(--label-tertiary)" />}
                                <span style={{ fontSize: 14, color: isAdvDone ? 'var(--label-tertiary)' : 'var(--label-primary)', textDecoration: isAdvDone ? 'line-through' : 'none' }}>
                                  Advanced
                                </span>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Simple clock icon component
function ClockIcon({ size = 24 }: { size?: number }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"></circle>
      <polyline points="12 6 12 12 16 14"></polyline>
    </svg>
  );
}
