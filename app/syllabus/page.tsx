'use client';

import { useState } from 'react';
import { useStore } from '@/store/useStore';
import { MasteryLevel } from '@/lib/syllabus';
import { CheckCircle2, Circle, ChevronRight, ChevronDown, Atom, Beaker, Calculator } from 'lucide-react';

const MASTERY: { value: MasteryLevel; label: string; color: string }[] = [
  { value: 'not-started', label: 'Not Started', color: 'var(--label-tertiary)' },
  { value: 'learning',    label: 'Learning',    color: 'var(--red)' },
  { value: 'practiced',   label: 'Practiced',   color: 'var(--amber)' },
  { value: 'mastered',    label: 'Mastered',    color: 'var(--green)' },
];

const SUB_CONFIG = {
  physics:   { icon: Atom,       color: 'var(--blue)',  fill: 'var(--blue-fill)' },
  chemistry: { icon: Beaker,     color: 'var(--green)', fill: 'var(--green-fill)' },
  maths:     { icon: Calculator, color: 'var(--amber)', fill: 'var(--amber-fill)' },
};

export default function SyllabusPage() {
  const { chapters, updateMastery, toggleTopic } = useStore();
  const [subFilter, setSubFilter]     = useState('all');
  const [masteryFilter, setMasteryFilter] = useState('all');
  const [expanded, setExpanded]       = useState<Set<string>>(new Set());

  const toggle = (id: string) => setExpanded(prev => {
    const n = new Set(prev);
    n.has(id) ? n.delete(id) : n.add(id);
    return n;
  });

  const filtered = chapters.filter(c => {
    if (subFilter !== 'all' && c.subject !== subFilter) return false;
    if (masteryFilter !== 'all' && c.mastery !== masteryFilter) return false;
    return true;
  });

  const totalTopics = chapters.reduce((a, c) => a + c.topics.length, 0);
  const doneTopics  = chapters.reduce((a, c) => a + c.topics.filter(t => t.done).length, 0);
  const pct         = totalTopics ? Math.round((doneTopics / totalTopics) * 100) : 0;

  return (
    <div className="fade-in-up">
      <div className="page-header">
        <h1>Syllabus</h1>
        <p>Track every chapter and topic across Physics, Chemistry and Maths</p>
      </div>

      {/* Overall progress tile */}
      <div className="stat-tile mb-6" style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
        <div style={{ flex: 1 }}>
          <div className="stat-label">Overall Completion</div>
          <div className="progress-track mt-2" style={{ height: 7 }}>
            <div className="progress-fill" style={{ width: `${pct}%`, background: 'var(--blue)' }} />
          </div>
          <div style={{ fontSize: 12, color: 'var(--label-tertiary)', marginTop: 6 }}>
            {doneTopics} / {totalTopics} topics across {chapters.length} chapters
          </div>
        </div>
        <div style={{ fontSize: 40, fontWeight: 800, color: 'var(--blue)', letterSpacing: -2, lineHeight: 1 }}>
          {pct}%
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 18 }}>
        {['all', 'physics', 'chemistry', 'maths'].map(s => (
          <button
            key={s}
            className={`pill ${subFilter === s ? (s === 'physics' ? 'active' : s === 'chemistry' ? 'active-green' : s === 'maths' ? 'active-amber' : 'active') : ''}`}
            onClick={() => setSubFilter(s)}
          >
            {s === 'all' ? 'All' : s === 'physics' ? <><Atom size={14} /> Physics</> : s === 'chemistry' ? <><Beaker size={14} /> Chemistry</> : <><Calculator size={14} /> Maths</>}
          </button>
        ))}
        <div style={{ width: 1, background: 'var(--separator)', margin: '0 4px' }} />
        {MASTERY.map(m => (
          <button
            key={m.value}
            className={`pill ${masteryFilter === m.value ? 'active' : ''}`}
            style={masteryFilter === m.value ? { background: `${m.color}20`, color: m.color } : {}}
            onClick={() => setMasteryFilter(masteryFilter === m.value ? 'all' : m.value)}
          >
            {m.label}
          </button>
        ))}
      </div>

      {/* Chapter list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {filtered.map(chapter => {
          const sub  = SUB_CONFIG[chapter.subject];
          const done = chapter.topics.filter(t => t.done).length;
          const cpct = chapter.topics.length ? Math.round((done / chapter.topics.length) * 100) : 0;
          const open = expanded.has(chapter.id);
          const mastery = MASTERY.find(m => m.value === chapter.mastery)!;

          return (
            <div key={chapter.id} className="card">
              {/* Chapter row */}
              <div
                style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 18px', cursor: 'pointer' }}
                onClick={() => toggle(chapter.id)}
              >
                <div style={{ color: 'var(--label-tertiary)', flexShrink: 0 }}>
                  {open ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
                </div>

                <div style={{
                  width: 36, height: 36, borderRadius: 9, background: sub.fill,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 16, flexShrink: 0,
                }}>
                  <sub.icon size={18} color={sub.color} />
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
                    <span style={{ fontWeight: 600, fontSize: 15 }}>{chapter.name}</span>
                    <span className="tag" style={{ background: `${mastery.color}18`, color: mastery.color }}>
                      {mastery.label}
                    </span>
                  </div>
                  <div className="progress-track">
                    <div className="progress-fill" style={{ width: `${cpct}%`, background: sub.color }} />
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--label-tertiary)', marginTop: 4 }}>
                    {done}/{chapter.topics.length} topics
                  </div>
                </div>

                {/* Mastery selector */}
                <div onClick={e => e.stopPropagation()}>
                  <select
                    className="select"
                    value={chapter.mastery}
                    onChange={e => updateMastery(chapter.id, e.target.value as MasteryLevel)}
                    style={{ width: 130, fontSize: 12, padding: '5px 10px', color: mastery.color, background: `${mastery.color}15`, border: 'none' }}
                  >
                    {MASTERY.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                  </select>
                </div>
              </div>

              {/* Ultimate Checklist Content */}
              {open && (
                <div style={{ borderTop: '1px solid var(--separator)' }}>
                  <div style={{ padding: '12px 18px', fontSize: 11, fontWeight: 600, color: 'var(--label-tertiary)', textTransform: 'uppercase', letterSpacing: '0.04em', background: 'var(--bg-secondary)' }}>
                    Ultimate Checklist
                  </div>
                  {chapter.topics.length === 0 ? (
                    <div style={{ padding: '16px 18px', fontSize: 13, color: 'var(--label-tertiary)', fontStyle: 'italic' }}>
                      No checklist items.
                    </div>
                  ) : (
                    <div className="grid-2" style={{ padding: '0 18px 12px', gap: '0 24px' }}>
                      {chapter.topics.map(topic => (
                        <div
                          key={topic.id}
                          onClick={() => toggleTopic(chapter.id, topic.id)}
                          style={{
                            display: 'flex', alignItems: 'center', gap: 12,
                            padding: '12px 8px', cursor: 'pointer',
                            borderBottom: '1px solid var(--separator)',
                            transition: 'background 0.12s',
                          }}
                          onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-tertiary)')}
                          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                        >
                          {topic.done
                            ? <CheckCircle2 size={18} color="var(--green)" fill="var(--green)" fillOpacity={0.15} />
                            : <Circle size={18} color="var(--label-tertiary)" />
                          }
                          <span style={{
                            fontSize: 14, fontWeight: 500,
                            color: topic.done ? 'var(--label-tertiary)' : 'var(--label-primary)',
                            textDecoration: topic.done ? 'line-through' : 'none',
                          }}>
                            {topic.name}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
