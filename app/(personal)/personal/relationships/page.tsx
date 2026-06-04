'use client';

import { useState } from 'react';
import { useStore } from '@/store/useStore';
import type { Relationship, RelationshipMemory, RelationshipConvoLog } from '@/store/useStore';
import AppleEmoji from '@/components/AppleEmoji';

import { Plus, X, Trash2, Phone, AtSign, MapPin, Gift, Calendar, Clock, ChevronRight, MessageSquare, Heart, Cloud, UploadCloud, File as FileIcon, Edit2, Image as ImageIcon } from 'lucide-react';

const TYPES = [
  { k: 'crush',   label: 'Crush',   color: '#ec4899', e: '💖' },
  { k: 'friend',  label: 'Friend',  color: '#10b981', e: '🤝' },
  { k: 'family',  label: 'Family',  color: '#3b82f6', e: '🏡' },
  { k: 'mentor',  label: 'Mentor',  color: '#a855f7', e: '🎓' },
  { k: 'teacher', label: 'Teacher', color: '#f59e0b', e: '📚' },
  { k: 'other',   label: 'Other',   color: '#6b7280', e: '👤' },
] as const;

const emptyRel = (): Omit<Relationship, 'id'> => ({
  name: '', nickname: '', type: 'friend', birthday: '', phone: '', instagram: '',
  location: '', notes: '', likes: '', dislikes: '', favFood: '', giftIdeas: '',
  interactionCount: 0, lastContact: '', memories: [], conversationLog: [], importantDates: []
});

const Input = ({ label, value, onChange, placeholder = '', type = 'text' }: any) => (
  <div>
    {label && <label style={{ display: 'block', fontSize: 11, color: 'rgba(255,255,255,0.35)', marginBottom: 5, textTransform: 'uppercase', letterSpacing: 0.5 }}>{label}</label>}
    <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
      style={{ width: '100%', background: 'rgba(0,0,0,0.25)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10, color: '#f0f0f0', fontSize: 14, padding: '11px 14px', outline: 'none', fontFamily: 'inherit' }} />
  </div>
);

const Textarea = ({ label, value, onChange, placeholder = '', rows = 3 }: any) => (
  <div>
    {label && <label style={{ display: 'block', fontSize: 11, color: 'rgba(255,255,255,0.35)', marginBottom: 5, textTransform: 'uppercase', letterSpacing: 0.5 }}>{label}</label>}
    <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={rows}
      style={{ width: '100%', background: 'rgba(0,0,0,0.25)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10, color: '#f0f0f0', fontSize: 14, padding: '11px 14px', outline: 'none', resize: 'vertical', fontFamily: 'inherit', lineHeight: 1.6 }} />
  </div>
);

export default function RelationshipsPage() {
  const { relationships, addRelationship, updateRelationship, removeRelationship, firebaseUser } = useStore();
  const [selected, setSelected] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState(emptyRel());
  const [editId, setEditId] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState('overview');
  const [convoNote, setConvoNote] = useState('');
  const [memoryNote, setMemoryNote] = useState('');
  const [uploading, setUploading] = useState(false);

  const person = selected ? relationships.find(r => r.id === selected) : null;
  const typeDef = person ? TYPES.find(t => t.k === person.type) || TYPES[5] : null;

  const save = () => {
    if (!form.name.trim()) return;
    if (editId) updateRelationship(editId, form);
    else addRelationship({ ...form, id: Math.random().toString(36).slice(2) });
    setShowAdd(false); setEditId(null); setForm(emptyRel());
  };

  const startEdit = (r: Relationship) => {
    setForm({ ...r }); setEditId(r.id); setShowAdd(true); setSelected(null);
  };

  const addConvo = () => {
    if (!convoNote.trim() || !person) return;
    const log: RelationshipConvoLog[] = [{ date: new Date().toISOString().slice(0, 10), note: convoNote }, ...(person.conversationLog || [])];
    updateRelationship(person.id, { conversationLog: log, lastContact: new Date().toISOString().slice(0, 10), interactionCount: person.interactionCount + 1 });
    setConvoNote('');
  };

  const addMemory = () => {
    if (!memoryNote.trim() || !person) return;
    const mems: RelationshipMemory[] = [{ date: new Date().toISOString().slice(0, 10), note: memoryNote }, ...(person.memories || [])];
    updateRelationship(person.id, { memories: mems });
    setMemoryNote('');
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !person) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('relationshipId', person.id);
    formData.append('relationshipName', person.name);

    try {
      const res = await fetch('/api/google/drive/upload', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        const driveFiles = person.driveFiles || [];
        updateRelationship(person.id, {
          driveFiles: [{ id: data.id, name: data.name, url: data.url, mimeType: data.mimeType, date: new Date().toISOString() }, ...driveFiles]
        });
      } else {
        alert('Upload failed. Did you approve Google Drive permissions?');
      }
    } catch (err) {
      console.error(err);
      alert('Upload failed.');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const deleteDriveFile = async (fileId: string) => {
    if (!person || !confirm('Delete this file from Google Drive?')) return;
    try {
      const res = await fetch(`/api/google/drive/file?id=${fileId}`, { method: 'DELETE' });
      if (res.ok) {
        const newFiles = (person.driveFiles || []).filter(f => f.id !== fileId);
        updateRelationship(person.id, { driveFiles: newFiles });
      } else {
        alert('Failed to delete file.');
      }
    } catch (e) {
      alert('Error deleting file.');
    }
  };

  const renameDriveFile = async (fileId: string, oldName: string) => {
    if (!person) return;
    const newName = prompt('Enter new file name:', oldName);
    if (!newName || newName === oldName) return;
    try {
      const res = await fetch('/api/google/drive/file', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: fileId, name: newName })
      });
      if (res.ok) {
        const newFiles = (person.driveFiles || []).map(f => f.id === fileId ? { ...f, name: newName } : f);
        updateRelationship(person.id, { driveFiles: newFiles });
      } else {
        alert('Failed to rename file.');
      }
    } catch (e) {
      alert('Error renaming file.');
    }
  };

  const handleProfilePicUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !person) return;
    
    // For profile pics, convert to base64 so they load instantly from local storage
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        updateRelationship(person.id, { profilePicUrl: event.target.result as string });
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const daysAgo = (dateStr?: string) => {
    if (!dateStr) return null;
    const days = Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000);
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    return `${days} days ago`;
  };

  const bDayCountdown = (bday?: string) => {
    if (!bday) return null;
    const [, m, d] = bday.split('-');
    const now = new Date();
    let next = new Date(now.getFullYear(), +m - 1, +d);
    if (next < now) next = new Date(now.getFullYear() + 1, +m - 1, +d);
    const days = Math.round((next.getTime() - now.getTime()) / 86400000);
    return days === 0 ? '🎉 Today!' : `${days} days`;
  };

  const sections = ['overview', 'memories', 'conversation', 'dates', 'drive'];

  return (
    <div className="rel-container" style={{ color: '#f0f0f0', fontFamily: 'Inter, sans-serif', animation: 'fadeUp 0.4s ease-out', display: 'flex', gap: 28, minHeight: 'calc(100vh - 96px)' }}>

      {/* ── Left: People list ── */}
      <div className="rel-left" style={{ width: 300, flexShrink: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, alignItems: 'center', marginBottom: 20 }}>
          <h1 style={{ fontSize: 22, fontWeight: 900, background: 'linear-gradient(135deg, #ef4444, #ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', display: 'flex', alignItems: 'center', gap: 8 }}>
            <AppleEmoji emoji="❤️" size={24} /> People
          </h1>
          <button onClick={() => { setShowAdd(true); setSelected(null); setEditId(null); setForm(emptyRel()); }} style={{ background: 'rgba(236,72,153,0.15)', border: '1px solid rgba(236,72,153,0.3)', borderRadius: 10, padding: '7px 12px', color: '#ec4899', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
            <Plus size={14} style={{ display: 'inline', marginRight: 4 }} />Add
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {relationships.map(r => {
            const t = TYPES.find(x => x.k === r.type) || TYPES[5];
            const isSel = selected === r.id;
            return (
              <div key={r.id} onClick={() => { setSelected(r.id); setShowAdd(false); setActiveSection('overview'); }} style={{
                background: isSel ? `${t.color}15` : 'rgba(255,255,255,0.025)',
                border: `1px solid ${isSel ? `${t.color}40` : 'rgba(255,255,255,0.06)'}`,
                borderRadius: 16, padding: '14px 16px', cursor: 'pointer', transition: 'all 0.15s',
                display: 'flex', alignItems: 'center', gap: 12
              }}>
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: `${t.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><AppleEmoji emoji={t.e} size={20} /></div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>{r.name}</div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginTop: 2 }}>
                    {t.label}{r.lastContact ? ` · ${daysAgo(r.lastContact)}` : ''}
                  </div>
                </div>
                <ChevronRight size={14} color="rgba(255,255,255,0.2)" />
              </div>
            );
          })}
          {relationships.length === 0 && (
            <div style={{ padding: 32, textAlign: 'center', color: 'rgba(255,255,255,0.25)', fontSize: 13, background: 'rgba(255,255,255,0.02)', borderRadius: 16 }}>
              Add the people who matter most to you.
            </div>
          )}
        </div>
      </div>

      {/* ── Right: Profile or Add Form ── */}
      <div style={{ flex: 1 }}>

        {/* Add/Edit form */}
        {showAdd && (
          <div style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(236,72,153,0.2)', borderRadius: 24, padding: 32 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, alignItems: 'center', marginBottom: 24 }}>
              <h2 style={{ fontSize: 20, fontWeight: 800, color: '#ec4899' }}>{editId ? 'Edit Person' : 'Add Person'}</h2>
              <button onClick={() => setShowAdd(false)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', cursor: 'pointer' }}><X size={20} /></button>
            </div>
            {/* Type selector */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
              {TYPES.map(t => (
                <button key={t.k} onClick={() => setForm(f => ({ ...f, type: t.k as any }))} style={{
                  background: form.type === t.k ? `${t.color}18` : 'rgba(255,255,255,0.03)',
                  border: `1px solid ${form.type === t.k ? t.color : 'rgba(255,255,255,0.06)'}`,
                  color: form.type === t.k ? t.color : 'rgba(255,255,255,0.4)',
                  borderRadius: 99, padding: '6px 14px', fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6
                }}><AppleEmoji emoji={t.e} size={14} /> {t.label}</button>
              ))}
            </div>
            <div className="mobile-stack-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
              <Input label="Name" value={form.name} onChange={(v: string) => setForm(f => ({ ...f, name: v }))} />
              <Input label="Nickname" value={form.nickname} onChange={(v: string) => setForm(f => ({ ...f, nickname: v }))} />
              <Input label="Birthday" value={form.birthday || ''} onChange={(v: string) => setForm(f => ({ ...f, birthday: v }))} type="date" />
              <Input label="Last Contact" value={form.lastContact || ''} onChange={(v: string) => setForm(f => ({ ...f, lastContact: v }))} type="date" />
              <Input label="Phone" value={form.phone} onChange={(v: string) => setForm(f => ({ ...f, phone: v }))} placeholder="+91..." />
              <Input label="Instagram" value={form.instagram} onChange={(v: string) => setForm(f => ({ ...f, instagram: v }))} placeholder="@handle" />
              <Input label="Location" value={form.location} onChange={(v: string) => setForm(f => ({ ...f, location: v }))} placeholder="City, Country" />
            </div>
            <div className="mobile-stack-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
              <Textarea label="Likes" value={form.likes} onChange={(v: string) => setForm(f => ({ ...f, likes: v }))} placeholder="What they love..." rows={2} />
              <Textarea label="Dislikes" value={form.dislikes} onChange={(v: string) => setForm(f => ({ ...f, dislikes: v }))} placeholder="What they hate..." rows={2} />
              <Input label="Favourite Food" value={form.favFood} onChange={(v: string) => setForm(f => ({ ...f, favFood: v }))} />
              <Input label="Gift Ideas" value={form.giftIdeas} onChange={(v: string) => setForm(f => ({ ...f, giftIdeas: v }))} placeholder="Books, watch..." />
            </div>
            <Textarea label="Notes" value={form.notes} onChange={(v: string) => setForm(f => ({ ...f, notes: v }))} placeholder="Important things to remember..." rows={2} />
            <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
              <button onClick={save} style={{ flex: 1, background: 'linear-gradient(135deg, #ef4444, #ec4899)', border: 'none', borderRadius: 12, padding: 14, color: '#fff', fontWeight: 800, fontSize: 14, cursor: 'pointer' }}>
                {editId ? 'Update' : 'Add Person'}
              </button>
              {editId && (
                <button onClick={() => { removeRelationship(editId); setShowAdd(false); setEditId(null); }} style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 12, padding: '0 20px', color: '#ef4444', cursor: 'pointer' }}>
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Person profile */}
        {person && typeDef && !showAdd && (
          <div style={{ animation: 'fadeUp 0.25s ease-out' }}>
            {/* Profile header */}
            <div style={{ background: `${typeDef.color}10`, border: `1px solid ${typeDef.color}25`, borderRadius: 24, padding: 28, marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <label style={{ cursor: 'pointer', position: 'relative' }}>
                    <div style={{ width: 72, height: 72, borderRadius: '50%', background: `${typeDef.color}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `2px solid ${typeDef.color}40`, overflow: 'hidden', position: 'relative' }}>
                      {person.profilePicUrl ? (
                        <img src={person.profilePicUrl} alt={person.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <AppleEmoji emoji={typeDef.e} size={36} />
                      )}
                      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', opacity: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'opacity 0.2s' }} onMouseEnter={e => e.currentTarget.style.opacity = '1'} onMouseLeave={e => e.currentTarget.style.opacity = '0'}>
                        <ImageIcon size={20} color="#fff" />
                      </div>
                    </div>
                    <input type="file" accept="image/*" onChange={handleProfilePicUpload} style={{ display: 'none' }} />
                  </label>
                  <div>
                    <h2 style={{ fontSize: 26, fontWeight: 900, margin: 0 }}>{person.name}</h2>
                    {person.nickname && <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>"{person.nickname}"</div>}
                    <div style={{ fontSize: 12, fontWeight: 700, color: typeDef.color, textTransform: 'uppercase', letterSpacing: 1, marginTop: 4 }}>{typeDef.label}</div>
                  </div>
                </div>
                <button onClick={() => startEdit(person)} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '8px 16px', color: 'rgba(255,255,255,0.6)', fontSize: 12, cursor: 'pointer', fontWeight: 600 }}>Edit</button>
              </div>

              {/* Quick stats */}
              <div className="mobile-stack-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginTop: 20 }}>
                <div style={{ background: 'rgba(0,0,0,0.2)', borderRadius: 14, padding: '14px 16px' }}>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginBottom: 4 }}>Last Talked</div>
                  <div style={{ fontSize: 15, fontWeight: 700 }}>{daysAgo(person.lastContact) || 'Never'}</div>
                </div>
                <div style={{ background: 'rgba(0,0,0,0.2)', borderRadius: 14, padding: '14px 16px' }}>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginBottom: 4 }}>Interactions</div>
                  <div style={{ fontSize: 15, fontWeight: 700 }}>{person.interactionCount}</div>
                </div>
                <div style={{ background: 'rgba(0,0,0,0.2)', borderRadius: 14, padding: '14px 16px' }}>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginBottom: 4 }}>Birthday In</div>
                  <div style={{ fontSize: 15, fontWeight: 700 }}>{bDayCountdown(person.birthday) || '—'}</div>
                </div>
              </div>

              {/* Contact icons */}
              <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
                {person.phone && <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'rgba(255,255,255,0.5)', background: 'rgba(255,255,255,0.05)', borderRadius: 99, padding: '5px 12px' }}><Phone size={12} />{person.phone}</span>}
                {person.instagram && <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'rgba(255,255,255,0.5)', background: 'rgba(255,255,255,0.05)', borderRadius: 99, padding: '5px 12px' }}><AtSign size={12} />{person.instagram}</span>}
                {person.location && <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'rgba(255,255,255,0.5)', background: 'rgba(255,255,255,0.05)', borderRadius: 99, padding: '5px 12px' }}><MapPin size={12} />{person.location}</span>}
              </div>
            </div>

            {/* Section tabs */}
            <div style={{ display: 'flex', gap: 4, marginBottom: 20, background: 'rgba(255,255,255,0.03)', borderRadius: 12, padding: 4, width: 'fit-content' }}>
              {sections.map(s => (
                <button key={s} onClick={() => setActiveSection(s)} style={{
                  background: activeSection === s ? `${typeDef.color}18` : 'transparent',
                  border: `1px solid ${activeSection === s ? `${typeDef.color}40` : 'transparent'}`,
                  color: activeSection === s ? typeDef.color : 'rgba(255,255,255,0.4)',
                  borderRadius: 8, padding: '7px 16px', fontSize: 12, fontWeight: 600, cursor: 'pointer', textTransform: 'capitalize'
                }}>{s}</button>
              ))}
            </div>

            {/* Overview */}
            {activeSection === 'overview' && (
              <div className="mobile-stack-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                {[
                  { icon: Heart, label: 'Likes', value: person.likes, color: '#ec4899' },
                  { icon: X, label: 'Dislikes', value: person.dislikes, color: '#ef4444' },
                  { icon: Gift, label: 'Gift Ideas', value: person.giftIdeas, color: '#f59e0b' },
                  { icon: Clock, label: 'Notes', value: person.notes, color: '#22d3ee' },
                ].map(item => (
                  <div key={item.label} style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 18, padding: 20 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, fontSize: 12, color: item.color, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>
                      <item.icon size={14} />{item.label}
                    </div>
                    <div style={{ fontSize: 14, color: item.value ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.2)', lineHeight: 1.6, fontStyle: item.value ? 'normal' : 'italic' }}>{item.value || 'Not set'}</div>
                  </div>
                ))}
                {person.favFood && (
                  <div style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 18, padding: 20 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#10b981', fontWeight: 700, marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1 }}><AppleEmoji emoji="🍕" size={14} /> Fav Food</div>
                    <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)' }}>{person.favFood}</div>
                  </div>
                )}
              </div>
            )}

            {/* Memories */}
            {activeSection === 'memories' && (
              <div>
                <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
                  <input value={memoryNote} onChange={e => setMemoryNote(e.target.value)} placeholder="Add a memory or important moment..."
                    style={{ flex: 1, background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, color: '#fff', fontSize: 14, padding: '12px 16px', outline: 'none' }} />
                  <button onClick={addMemory} style={{ background: `${typeDef.color}20`, border: `1px solid ${typeDef.color}40`, borderRadius: 12, padding: '0 20px', color: typeDef.color, fontWeight: 700, cursor: 'pointer', fontSize: 13 }}>Save</button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {(person.memories || []).map((m, i) => (
                    <div key={i} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 14, padding: '14px 18px', display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', whiteSpace: 'nowrap', marginTop: 2, minWidth: 70 }}>{new Date(m.date).toLocaleDateString('en', { month: 'short', day: 'numeric' })}</div>
                      <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)', lineHeight: 1.6 }}>{m.note}</div>
                    </div>
                  ))}
                  {!(person.memories?.length) && <div style={{ textAlign: 'center', padding: 32, color: 'rgba(255,255,255,0.2)' }}>No memories yet.</div>}
                </div>
              </div>
            )}

            {/* Conversation log */}
            {activeSection === 'conversation' && (
              <div>
                <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
                  <input value={convoNote} onChange={e => setConvoNote(e.target.value)} placeholder="Log a conversation or interaction..."
                    style={{ flex: 1, background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, color: '#fff', fontSize: 14, padding: '12px 16px', outline: 'none' }} />
                  <button onClick={addConvo} style={{ background: `${typeDef.color}20`, border: `1px solid ${typeDef.color}40`, borderRadius: 12, padding: '0 20px', color: typeDef.color, fontWeight: 700, cursor: 'pointer', fontSize: 13 }}>Log</button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {(person.conversationLog || []).map((c, i) => (
                    <div key={i} style={{ display: 'flex', gap: 14, alignItems: 'flex-start', padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      <MessageSquare size={14} color={typeDef.color} style={{ marginTop: 3, flexShrink: 0 }} />
                      <div>
                        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', marginBottom: 3 }}>{new Date(c.date).toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                        <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)' }}>{c.note}</div>
                      </div>
                    </div>
                  ))}
                  {!(person.conversationLog?.length) && <div style={{ textAlign: 'center', padding: 32, color: 'rgba(255,255,255,0.2)' }}>No conversations logged yet.</div>}
                </div>
              </div>
            )}

            {/* Important dates */}
            {activeSection === 'dates' && (
              <div>
                {person.birthday && (
                  <div style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 14, padding: '14px 18px', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 14 }}>
                    <Calendar size={18} color="#f59e0b" />
                    <div>
                      <div style={{ fontSize: 12, color: '#f59e0b', fontWeight: 700 }}>BIRTHDAY</div>
                      <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)', marginTop: 2 }}>{new Date(person.birthday + 'T00:00:00').toLocaleDateString('en', { month: 'long', day: 'numeric' })} · in {bDayCountdown(person.birthday)}</div>
                    </div>
                  </div>
                )}
                {(person.importantDates || []).map((d, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <Calendar size={16} color="rgba(255,255,255,0.3)" />
                    <div>
                      <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', fontWeight: 700 }}>{d.label.toUpperCase()}</div>
                      <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)' }}>{new Date(d.date).toLocaleDateString()}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Google Drive Uploads */}
            {activeSection === 'drive' && (
              <div>
                {!session ? (
                  <div style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: 16, padding: 24, textAlign: 'center' }}>
                    <Cloud size={32} color="#3b82f6" style={{ margin: '0 auto 12px' }} />
                    <div style={{ color: '#fff', fontWeight: 600, marginBottom: 8 }}>Google Drive Disconnected</div>
                    <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', marginBottom: 16 }}>Please log in via the Personal Dashboard to attach files.</div>
                  </div>
                ) : (
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, alignItems: 'center', marginBottom: 20 }}>
                      <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)' }}>Files automatically sync to your Google Drive.</div>
                      <label style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', padding: '10px 16px', borderRadius: 12, color: '#fff', fontSize: 13, fontWeight: 700, cursor: uploading ? 'wait' : 'pointer', display: 'flex', alignItems: 'center', gap: 8, opacity: uploading ? 0.7 : 1 }}>
                        <UploadCloud size={16} />
                        {uploading ? 'Uploading...' : 'Upload File'}
                        <input type="file" onChange={handleFileUpload} disabled={uploading} style={{ display: 'none' }} />
                      </label>
                    </div>
                    
                    <div className="mobile-stack-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                      {(person.driveFiles || []).map(file => (
                        <div key={file.id} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, transition: 'background 0.2s', paddingRight: 8 }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'} onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}>
                          <a href={file.url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', flex: 1, minWidth: 0 }}>
                            <div style={{ background: '#3b82f630', padding: 10, borderRadius: 10, flexShrink: 0 }}>
                              <FileIcon size={18} color="#60a5fa" />
                            </div>
                            <div style={{ overflow: 'hidden', flex: 1 }}>
                              <div style={{ fontSize: 13, fontWeight: 600, color: '#f8fafc', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{file.name}</div>
                              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>{new Date(file.date).toLocaleDateString()}</div>
                            </div>
                          </a>
                          <div style={{ display: 'flex', gap: 4 }}>
                            <button onClick={() => renameDriveFile(file.id, file.name)} style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', padding: 6, borderRadius: 6 }} title="Rename"><Edit2 size={14} /></button>
                            <button onClick={() => deleteDriveFile(file.id)} style={{ background: 'transparent', border: 'none', color: 'rgba(239,68,68,0.6)', cursor: 'pointer', padding: 6, borderRadius: 6 }} title="Delete"><Trash2 size={14} /></button>
                          </div>
                        </div>
                      ))}
                    </div>
                    {!(person.driveFiles?.length) && <div style={{ textAlign: 'center', padding: 32, color: 'rgba(255,255,255,0.2)' }}>No files attached yet.</div>}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {!person && !showAdd && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', color: 'rgba(255,255,255,0.15)', flexDirection: 'column', gap: 12 }}>
            <AppleEmoji emoji="❤️" size={48} />
            <div style={{ fontSize: 14 }}>Select a person to view their profile</div>
          </div>
        )}
      </div>
      <style dangerouslySetInnerHTML={{__html:`@keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}`}} />
    </div>
  );
}