'use client';

import { useState, useMemo } from 'react';
import { useStore } from '@/store/useStore';
import { Clock, Plus, CheckCircle2, ChevronRight, Calendar, Info, Target, Atom, Beaker, Calculator, Book, Play } from 'lucide-react';
import { Chapter } from '@/lib/syllabus';
import Link from 'next/link';

export default function RevisionPage() {
  const { revisions, addRevision, advanceRevision, removeRevision, chapters } = useStore();
  const [showAddModal, setShowAddModal] = useState(false);
  
  // Form State
  const [selectedSubject, setSelectedSubject] = useState<'physics'|'chemistry'|'maths' | ''>('');
  const [selectedChapter, setSelectedChapter] = useState('');

  const todayStr = new Date().toISOString().slice(0, 10);
  
  const { due, upcoming, completed } = useMemo(() => {
    const d: typeof revisions = [];
    const u: typeof revisions = [];
    const c: typeof revisions = [];
    
    revisions.forEach((rev) => {
      if (rev.stage >= 4) {
        c.push(rev);
      } else {
        if (rev.nextRevisionDate <= todayStr) {
          d.push(rev);
        } else {
          u.push(rev);
        }
      }
    });
    
    // Sort due by date (oldest first)
    d.sort((a, b) => a.nextRevisionDate.localeCompare(b.nextRevisionDate));
    // Sort upcoming by date (soonest first)
    u.sort((a, b) => a.nextRevisionDate.localeCompare(b.nextRevisionDate));
    // Sort completed by latest first
    c.sort((a, b) => b.nextRevisionDate.localeCompare(a.nextRevisionDate));
    
    return { due: d, upcoming: u, completed: c };
  }, [revisions, todayStr]);

  const handleAdd = () => {
    if (!selectedSubject || !selectedChapter) return;
    
    const chapter = chapters.find(c => c.id === selectedChapter);
    if (!chapter) return;
    
    // Check if it already exists
    if (revisions.some(r => r.chapterId === chapter.id && r.stage < 4)) {
      alert("This chapter is already in your active revision cycle.");
      return;
    }

    addRevision({
      id: Math.random().toString(36).substring(7),
      chapterId: chapter.id,
      subject: selectedSubject as any,
      title: chapter.name,
      createdAt: todayStr,
      stage: 0,
      nextRevisionDate: todayStr // Start immediately (Day 1)
    });
    
    setShowAddModal(false);
    setSelectedSubject('');
    setSelectedChapter('');
  };

  const getSubjectIcon = (sub: string) => {
    if (sub === 'physics') return <Atom size={16} />;
    if (sub === 'chemistry') return <Beaker size={16} />;
    if (sub === 'maths') return <Calculator size={16} />;
    return <Book size={16} />;
  };
  
  const getSubjectColor = (sub: string) => {
    if (sub === 'physics') return 'var(--blue)';
    if (sub === 'chemistry') return 'var(--green)';
    if (sub === 'maths') return 'var(--amber)';
    return 'var(--label-secondary)';
  };

  const stageLabels = ["Started", "Day 1", "Day 3", "Day 7", "Day 21 (Done)"];

  return (
    <div className="fade-in-up" style={{ paddingBottom: 60 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 700, letterSpacing: -0.5, marginBottom: 4 }}>Spaced Repetition</h1>
          <p style={{ color: 'var(--label-tertiary)', fontSize: 15 }}>Master concepts using the 1-3-7-21 revision method.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
          <Plus size={16} /> Add Topic
        </button>
      </div>

      <div className="grid-2" style={{ gap: 20, alignItems: 'start' }}>
        
        {/* Left Col: Due & Upcoming */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          
          {/* Due Today */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--red)', marginBottom: 16 }}>
              <Target size={18} />
              <h2 style={{ fontSize: 16, fontWeight: 600 }}>Due for Revision ({due.length})</h2>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {due.length === 0 ? (
                <div style={{ padding: 24, textAlign: 'center', color: 'var(--label-tertiary)', fontSize: 14, background: 'var(--bg-tertiary)', borderRadius: 12 }}>
                  <CheckCircle2 size={32} style={{ margin: '0 auto 8px', opacity: 0.5 }} />
                  You're all caught up for today!
                </div>
              ) : (
                due.map(rev => {
                  const isOverdue = rev.nextRevisionDate < todayStr;
                  const cColor = getSubjectColor(rev.subject);
                  return (
                    <div key={rev.id} style={{ background: 'var(--bg-secondary)', borderRadius: 12, padding: '14px 16px', display: 'flex', gap: 12, alignItems: 'center' }}>
                      <div style={{ color: cColor, background: `${cColor}20`, padding: 8, borderRadius: 8 }}>
                        {getSubjectIcon(rev.subject)}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--label-primary)', marginBottom: 4 }}>{rev.title}</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}>
                          <span style={{ color: 'var(--label-secondary)', fontWeight: 500 }}>Next: {stageLabels[rev.stage + 1]}</span>
                          <span style={{ color: isOverdue ? 'var(--red)' : 'var(--label-tertiary)', fontWeight: isOverdue ? 600 : 400 }}>
                            {isOverdue ? 'Overdue' : 'Today'}
                          </span>
                        </div>
                      </div>
                      <button className="btn btn-primary btn-sm" onClick={() => advanceRevision(rev.id)}>
                        Mark Done
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Upcoming */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--blue)', marginBottom: 16 }}>
              <Calendar size={18} />
              <h2 style={{ fontSize: 16, fontWeight: 600 }}>Upcoming Revisions</h2>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {upcoming.length === 0 ? (
                <div style={{ padding: 16, textAlign: 'center', color: 'var(--label-tertiary)', fontSize: 13 }}>
                  No upcoming revisions.
                </div>
              ) : (
                upcoming.map(rev => {
                  const cColor = getSubjectColor(rev.subject);
                  
                  // Calculate days left
                  const daysLeft = Math.ceil((new Date(rev.nextRevisionDate).getTime() - new Date(todayStr).getTime()) / 86400000);
                  
                  return (
                    <div key={rev.id} style={{ padding: '12px 14px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ color: cColor }}>{getSubjectIcon(rev.subject)}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--label-primary)' }}>{rev.title}</div>
                        <div style={{ fontSize: 11, color: 'var(--label-tertiary)', marginTop: 2 }}>
                          Due in {daysLeft} day{daysLeft !== 1 ? 's' : ''} (Stage: {stageLabels[rev.stage]})
                        </div>
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--label-secondary)', background: 'var(--bg-tertiary)', padding: '4px 8px', borderRadius: 6 }}>
                        {rev.nextRevisionDate}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
          
        </div>
        
        {/* Right Col: Info & Completed */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          
          <div className="card" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', gap: 10, color: 'var(--label-secondary)' }}>
              <Info size={20} style={{ flexShrink: 0 }} />
              <div style={{ fontSize: 13, lineHeight: 1.5 }}>
                <strong style={{ color: 'var(--label-primary)' }}>How it works:</strong> When you finish studying a new topic, add it here. The tracker will automatically remind you to revise it after 1 day, 3 days, 7 days, and 21 days to move the information into your long-term memory.
              </div>
            </div>
          </div>
          
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--green)', marginBottom: 16 }}>
              <CheckCircle2 size={18} />
              <h2 style={{ fontSize: 16, fontWeight: 600 }}>Mastered (21 Days Done)</h2>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {completed.length === 0 ? (
                <div style={{ padding: 16, textAlign: 'center', color: 'var(--label-tertiary)', fontSize: 13 }}>
                  Complete all 4 stages to master a topic.
                </div>
              ) : (
                completed.map(rev => {
                  const cColor = getSubjectColor(rev.subject);
                  return (
                    <div key={rev.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                      <div style={{ color: cColor }}>{getSubjectIcon(rev.subject)}</div>
                      <div style={{ flex: 1, fontSize: 14, color: 'var(--label-primary)', textDecoration: 'line-through', opacity: 0.7 }}>
                        {rev.title}
                      </div>
                      <button className="btn btn-secondary btn-sm" style={{ padding: '4px 8px' }} onClick={() => removeRevision(rev.id)}>
                        Clear
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
          
        </div>
        
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 16 }}>Start Revision Cycle</h2>
            
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--label-secondary)', marginBottom: 8 }}>
                Subject
              </label>
              <select 
                className="select" 
                value={selectedSubject} 
                onChange={(e) => {
                  setSelectedSubject(e.target.value as any);
                  setSelectedChapter('');
                }}
              >
                <option value="">Select Subject</option>
                <option value="physics">Physics</option>
                <option value="chemistry">Chemistry</option>
                <option value="maths">Mathematics</option>
              </select>
            </div>

            {selectedSubject && (
              <div style={{ marginBottom: 24 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--label-secondary)', marginBottom: 8 }}>
                  Chapter
                </label>
                <select 
                  className="select" 
                  value={selectedChapter} 
                  onChange={(e) => setSelectedChapter(e.target.value)}
                >
                  <option value="">Select Chapter</option>
                  {chapters
                    .filter(c => c.subject === selectedSubject)
                    .map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            )}

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button className="btn btn-secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
              <button 
                className="btn btn-primary" 
                onClick={handleAdd}
                disabled={!selectedSubject || !selectedChapter}
              >
                Add Topic
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
