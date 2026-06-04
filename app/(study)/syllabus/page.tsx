'use client';

import { useState, useMemo } from 'react';
import { useStore } from '@/store/useStore';
import { MasteryLevel, Chapter } from '@/lib/syllabus';
import { CheckCircle2, Circle, ChevronRight, ChevronDown, Atom, Beaker, Calculator } from 'lucide-react';

const MASTERY: { value: MasteryLevel; label: string; color: string }[] = [
  { value: 'not-started', label: 'Not Started', color: 'var(--label-tertiary)' },
  { value: 'learning',    label: 'Learning',    color: 'var(--red)' },
  { value: 'practiced',   label: 'Practiced',   color: 'var(--amber)' },
  { value: 'mastered',    label: 'Mastered',    color: 'var(--green)' },
];

const SUB_CONFIG = {
  physics:   { icon: Atom,       color: 'var(--blue)',  fill: 'var(--blue-fill)',  label: 'Physics' },
  chemistry: { icon: Beaker,     color: 'var(--green)', fill: 'var(--green-fill)', label: 'Chemistry' },
  maths:     { icon: Calculator, color: 'var(--amber)', fill: 'var(--amber-fill)', label: 'Mathematics' },
};

export default function SyllabusPage() {
  const { chapters, updateMastery, toggleTopic } = useStore();
  const [subFilter, setSubFilter]     = useState('all');
  const [masteryFilter, setMasteryFilter] = useState('all');
  
  // Track which chapters have their topic checklist expanded
  const [expandedChapters, setExpandedChapters] = useState<Set<string>>(new Set());

  const toggleChapterExpand = (id: string) => setExpandedChapters(prev => {
    const n = new Set(prev);
    n.has(id) ? n.delete(id) : n.add(id);
    return n;
  });

  // Filter chapters based on subject and mastery
  const filteredChapters = useMemo(() => {
    return chapters.filter(c => {
      if (subFilter !== 'all' && c.subject !== subFilter) return false;
      if (masteryFilter !== 'all' && c.mastery !== masteryFilter) return false;
      return true;
    });
  }, [chapters, subFilter, masteryFilter]);

  // Group chapters by subject and then by their groupName (Phase/Block)
  const groupedData = useMemo(() => {
    interface Group {
      name: string;
      description?: string;
      chapters: Chapter[];
    }
    
    // We group by subject first, then maintain an ordered array of groups under each subject
    const result: Record<'physics' | 'chemistry' | 'maths', Group[]> = {
      physics: [],
      chemistry: [],
      maths: [],
    };

    filteredChapters.forEach(chapter => {
      const subjectGroups = result[chapter.subject];
      let group = subjectGroups.find(g => g.name === chapter.groupName);
      
      if (!group) {
        group = {
          name: chapter.groupName,
          description: chapter.groupDescription,
          chapters: []
        };
        subjectGroups.push(group);
      }
      group.chapters.push(chapter);
    });

    return result;
  }, [filteredChapters]);

  // Overall Statistics
  const totalTopics = chapters.reduce((a, c) => a + c.topics.length, 0);
  const doneTopics  = chapters.reduce((a, c) => a + c.topics.filter(t => t.done).length, 0);
  const pct         = totalTopics ? Math.round((doneTopics / totalTopics) * 100) : 0;

  // Render a specific group/block of chapters
  const renderGroup = (group: { name: string; description?: string; chapters: Chapter[] }, subject: 'physics' | 'chemistry' | 'maths') => {
    const sub = SUB_CONFIG[subject];
    
    // Group progress calculation
    const totalGroupTopics = group.chapters.reduce((acc, c) => acc + c.topics.length, 0);
    const doneGroupTopics = group.chapters.reduce((acc, c) => acc + c.topics.filter(t => t.done).length, 0);
    const groupPct = totalGroupTopics ? Math.round((doneGroupTopics / totalGroupTopics) * 100) : 0;

    return (
      <div key={`${subject}-${group.name}`} style={{ marginBottom: 32 }}>
        {/* Group Header */}
        <div style={{ padding: '0 4px', marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span className="tag" style={{ background: sub.fill, color: sub.color, padding: '4px 8px', fontSize: 10 }}>
                  {sub.label}
                </span>
                <h2 style={{ fontSize: 16, fontWeight: 700, letterSpacing: '-0.3px', color: 'var(--label-primary)' }}>
                  {group.name}
                </h2>
              </div>
              {group.description && (
                <p style={{ fontSize: 12, color: 'var(--label-secondary)', marginTop: 4, fontStyle: 'italic' }}>
                  💡 {group.description}
                </p>
              )}
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: sub.color }}>{groupPct}% Completed</span>
                <div style={{ fontSize: 11, color: 'var(--label-tertiary)' }}>
                  {doneGroupTopics}/{totalGroupTopics} topics done
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Chapters Card (iOS Grouped Layout) */}
        <div className="card" style={{ border: '1px solid var(--separator)' }}>
          {group.chapters.map((chapter, index) => {
            const done = chapter.topics.filter(t => t.done).length;
            const cpct = chapter.topics.length ? Math.round((done / chapter.topics.length) * 100) : 0;
            const isOpen = expandedChapters.has(chapter.id);
            const mastery = MASTERY.find(m => m.value === chapter.mastery)!;

            return (
              <div key={chapter.id} style={{ borderBottom: index < group.chapters.length - 1 ? '1px solid var(--separator)' : 'none' }}>
                {/* Chapter Row */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '16px 20px',
                    cursor: 'pointer',
                    background: isOpen ? 'rgba(255, 255, 255, 0.01)' : 'transparent',
                    transition: 'background 0.2s',
                  }}
                  onClick={() => toggleChapterExpand(chapter.id)}
                  onMouseEnter={e => !isOpen && (e.currentTarget.style.background = 'var(--bg-fill)')}
                  onMouseLeave={e => !isOpen && (e.currentTarget.style.background = 'transparent')}
                >
                  <div style={{ color: 'var(--label-tertiary)', flexShrink: 0, display: 'flex', alignItems: 'center' }}>
                    {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6, flexWrap: 'wrap' }}>
                      <span style={{ fontWeight: 600, fontSize: 15, color: 'var(--label-primary)' }}>{chapter.name}</span>
                      <span className="tag" style={{ background: `${mastery.color}15`, color: mastery.color, fontSize: 10 }}>
                        {mastery.label}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div className="progress-track" style={{ flex: 1, height: 4 }}>
                        <div className="progress-fill" style={{ width: `${cpct}%`, background: sub.color }} />
                      </div>
                      <span style={{ fontSize: 12, color: 'var(--label-secondary)', minWidth: 70, textAlign: 'right' }}>
                        {done}/{chapter.topics.length} topics ({cpct}%)
                      </span>
                    </div>
                  </div>

                  {/* Mastery Dropdown Selector */}
                  <div onClick={e => e.stopPropagation()} style={{ marginLeft: 8 }}>
                    <select
                      className="select"
                      value={chapter.mastery}
                      onChange={e => updateMastery(chapter.id, e.target.value as MasteryLevel)}
                      style={{
                        width: 120,
                        fontSize: 12,
                        padding: '6px 12px',
                        color: mastery.color,
                        background: `${mastery.color}12`,
                        borderColor: `${mastery.color}25`,
                        borderRadius: 'var(--radius-sm)',
                        fontWeight: 600
                      }}
                    >
                      {MASTERY.map(m => (
                        <option key={m.value} value={m.value} style={{ background: 'var(--bg-secondary)', color: 'var(--label-primary)' }}>
                          {m.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Checklist (Expandable Checklist Section) */}
                {isOpen && (
                  <div style={{ background: 'var(--bg-primary)', borderTop: '1px solid var(--separator)', padding: '16px 20px' }}>
                    <div style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: 'var(--label-tertiary)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      marginBottom: 12
                    }}>
                      📋 Checklist Progress
                    </div>
                    <div className="grid-2" style={{ gap: '8px 24px' }}>
                      {chapter.topics.map(topic => {
                        const isExtra = !topic.done && chapter.mastery === 'mastered';
                        return (
                          <div
                            key={topic.id}
                            onClick={() => toggleTopic(chapter.id, topic.id)}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 12,
                              padding: '10px 12px',
                              cursor: 'pointer',
                              borderRadius: 'var(--radius-sm)',
                              transition: 'background 0.12s',
                            }}
                            onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-secondary)')}
                            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                          >
                            {topic.done ? (
                              <CheckCircle2 size={18} color="var(--green)" fill="var(--green)" fillOpacity={0.15} style={{ flexShrink: 0 }} />
                            ) : (
                              <Circle size={18} color="var(--label-tertiary)" style={{ flexShrink: 0 }} />
                            )}
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 0 }}>
                              <span style={{
                                fontSize: 13,
                                fontWeight: 500,
                                color: topic.done ? 'var(--label-tertiary)' : 'var(--label-primary)',
                                textDecoration: topic.done ? 'line-through' : 'none',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis'
                              }}>
                                {topic.name}
                              </span>
                              {isExtra && (
                                <span className="tag tag-amber" style={{ fontSize: 9, padding: '2px 6px' }}>
                                  Advanced/Extra
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="fade-in-up">
      {/* Page Title & Header */}
      <div className="page-header">
        <h1>Study Tracker & Syllabus</h1>
        <p>Track your preparation grouped by high-impact phases and learning blocks</p>
      </div>

      {/* Progress Tile */}
      <div className="stat-tile mb-6" style={{ display: 'flex', alignItems: 'center', gap: 20, border: '1px solid var(--separator)' }}>
        <div style={{ flex: 1 }}>
          <div className="stat-label">Syllabus Completion</div>
          <div className="progress-track mt-2" style={{ height: 8 }}>
            <div className="progress-fill" style={{ width: `${pct}%`, background: 'var(--blue)' }} />
          </div>
          <div style={{ fontSize: 12, color: 'var(--label-secondary)', marginTop: 8 }}>
            {doneTopics} completed out of {totalTopics} total sub-tasks across all subjects
          </div>
        </div>
        <div style={{ fontSize: 44, fontWeight: 900, color: 'var(--blue)', letterSpacing: -2, lineHeight: 1 }}>
          {pct}%
        </div>
      </div>

      {/* Filters (Subject Tabs & Mastery Chips) */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 24, alignItems: 'center' }}>
        {['all', 'physics', 'chemistry', 'maths'].map(s => {
          const isActive = subFilter === s;
          let activeClass = 'active';
          if (s === 'physics') activeClass = 'active';
          if (s === 'chemistry') activeClass = 'active-green';
          if (s === 'maths') activeClass = 'active-amber';
          
          return (
            <button
              key={s}
              className={`pill ${isActive ? activeClass : ''}`}
              onClick={() => setSubFilter(s)}
              style={{ fontSize: 13, padding: '7px 16px' }}
            >
              {s === 'all' && 'All Subjects'}
              {s === 'physics' && <><Atom size={14} /> Physics</>}
              {s === 'chemistry' && <><Beaker size={14} /> Chemistry</>}
              {s === 'maths' && <><Calculator size={14} /> Maths</>}
            </button>
          );
        })}
        
        <div style={{ width: 1, height: 20, background: 'var(--separator)', margin: '0 4px' }} />
        
        {MASTERY.map(m => {
          const isActive = masteryFilter === m.value;
          return (
            <button
              key={m.value}
              className={`pill ${isActive ? 'active' : ''}`}
              style={{
                fontSize: 13,
                padding: '7px 14px',
                ...(isActive ? { background: `${m.color}20`, color: m.color, borderColor: `${m.color}40`, border: '1px solid' } : {})
              }}
              onClick={() => setMasteryFilter(masteryFilter === m.value ? 'all' : m.value)}
            >
              {m.label}
            </button>
          );
        })}
      </div>

      {/* Grouped Chapter Lists */}
      <div>
        {/* Physics Section */}
        {(subFilter === 'all' || subFilter === 'physics') && groupedData.physics.length > 0 && (
          <div>
            {subFilter === 'all' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '24px 0 16px', borderBottom: '1px solid var(--separator)', paddingBottom: 8 }}>
                <Atom size={20} color="var(--blue)" />
                <h2 style={{ fontSize: 18, fontWeight: 800, color: 'var(--blue)' }}>Physics</h2>
              </div>
            )}
            {groupedData.physics.map(group => renderGroup(group, 'physics'))}
          </div>
        )}

        {/* Chemistry Section */}
        {(subFilter === 'all' || subFilter === 'chemistry') && groupedData.chemistry.length > 0 && (
          <div>
            {subFilter === 'all' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '32px 0 16px', borderBottom: '1px solid var(--separator)', paddingBottom: 8 }}>
                <Beaker size={20} color="var(--green)" />
                <h2 style={{ fontSize: 18, fontWeight: 800, color: 'var(--green)' }}>Chemistry</h2>
              </div>
            )}
            {groupedData.chemistry.map(group => renderGroup(group, 'chemistry'))}
          </div>
        )}

        {/* Mathematics Section */}
        {(subFilter === 'all' || subFilter === 'maths') && groupedData.maths.length > 0 && (
          <div>
            {subFilter === 'all' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '32px 0 16px', borderBottom: '1px solid var(--separator)', paddingBottom: 8 }}>
                <Calculator size={20} color="var(--amber)" />
                <h2 style={{ fontSize: 18, fontWeight: 800, color: 'var(--amber)' }}>Mathematics</h2>
              </div>
            )}
            {groupedData.maths.map(group => renderGroup(group, 'maths'))}
          </div>
        )}

        {/* Empty State */}
        {filteredChapters.length === 0 && (
          <div className="card" style={{ padding: '64px 32px', textAlign: 'center', border: '1px solid var(--separator)' }}>
            <p style={{ color: 'var(--label-secondary)', fontSize: 15 }}>
              No chapters match the selected subject and mastery level filters.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
