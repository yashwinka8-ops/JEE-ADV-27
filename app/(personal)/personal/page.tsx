'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useStore } from '@/store/useStore';
import { auth, googleProvider, signInWithPopup, firebaseSignOut } from '@/lib/firebase';
import { GoogleAuthProvider } from 'firebase/auth';
import { fetchGooglePhotos, getDriveFolder, createDriveFolder, syncFileToDrive } from '@/lib/googleApi';
import { 
  CloudSun, Focus, Target, CheckCircle2, Circle, 
  Quote, MapPin, Wind, Sparkles, Cloud, Image as ImageIcon
} from 'lucide-react';
import AppleEmoji from '@/components/AppleEmoji';

const GITA_SHLOKAS = [
  {
    sanskrit: "कर्मण्येवाधिकारस्ते मा फलेषु कदाचन।\nमा कर्मफलहेतुर्भूर्मा ते सङ्गोऽस्त्वकर्मणि॥",
    english: "You have a right to perform your prescribed duty, but you are not entitled to the fruits of action.",
    verse: "Chapter 2, Verse 47"
  },
  {
    sanskrit: "क्रोधाद्भवति सम्मोहः सम्मोहात्स्मृतिविभ्रमः।\nस्मृतिभ्रंशाद्बुद्धिनाशो बुद्धिनाशात्प्रणश्यति॥",
    english: "From anger comes delusion; from delusion, confused memory; from confused memory, the ruin of reason; from ruin of reason, man perishes.",
    verse: "Chapter 2, Verse 63"
  },
  {
    sanskrit: "उद्धरेदात्मनात्मानं नात्मानमवसादयेत्।\nआत्मैव ह्यात्मनो बन्धुरात्मैव रिपुरात्मनः॥",
    english: "Elevate yourself through the power of your mind, and not degrade yourself, for the mind can be the friend and also the enemy of the self.",
    verse: "Chapter 6, Verse 5"
  },
  {
    sanskrit: "ध्यायतो विषयान्पुंसः सङ्गस्तेषूपजायते।\nसङ्गात्सञ्जायते कामः कामात्क्रोधोऽभिजायते॥",
    english: "While contemplating the objects of the senses, a person develops attachment for them, and from such attachment lust develops, and from lust anger arises.",
    verse: "Chapter 2, Verse 62"
  },
  {
    sanskrit: "न जायते म्रियते वा कदाचिन्\nनायं भूत्वा भविता वा न भूयः।\nअजो नित्यः शाश्वतोऽयं पुराणो\nन हन्यते हन्यमाने शरीरे॥",
    english: "The soul is neither born, nor does it ever die; nor having once existed, does it ever cease to be. The soul is without birth, eternal, immortal, and ageless.",
    verse: "Chapter 2, Verse 20"
  }
];

export default function PersonalDashboard() {
  const store = useStore();
  const { todayFocus, setTodayFocus, lifeHabits, toggleHabit, lifeGoals, customMemories, addCustomMemory, removeCustomMemory, firebaseUser, googleAccessToken, setGoogleAccessToken } = store;
  const [mounted, setMounted] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [quickNote, setQuickNote] = useState('');
  const [shloka, setShloka] = useState(GITA_SHLOKAS[0]);
  const [loadingShloka, setLoadingShloka] = useState(true);
  const [photos, setPhotos] = useState<any[]>([]);
  const [loadingPhotos, setLoadingPhotos] = useState(false);
  
  useEffect(() => {
    if (firebaseUser && googleAccessToken) {
      setLoadingPhotos(true);
      fetchGooglePhotos(googleAccessToken)
        .then(mediaItems => {
          if (mediaItems) setPhotos(mediaItems.filter((i: any) => i.mimeType?.startsWith('image/')));
          setLoadingPhotos(false);
        })
        .catch(err => {
          console.error('Failed to fetch photos', err);
          setLoadingPhotos(false);
        });
    }
  }, [firebaseUser, googleAccessToken]);
  
  useEffect(() => {
    setMounted(true);
    const savedNote = localStorage.getItem('lifeos_quicknote');
    if (savedNote) setQuickNote(savedNote);

    const fetchShloka = async () => {
      const todayStr = new Date().toISOString().slice(0, 10);
      const cached = localStorage.getItem('lifeos_daily_shloka');
      if (cached) {
        try {
          const parsedCache = JSON.parse(cached);
          if (parsedCache.date === todayStr && parsedCache.shloka) {
            setShloka(parsedCache.shloka);
            setLoadingShloka(false);
            return;
          }
        } catch (e) {
          // ignore cache parsing error
        }
      }

      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: [{
              role: 'user',
              content: 'Please provide a random Bhagavad Gita shloka. You MUST return ONLY a raw JSON object with exactly three keys: "sanskrit" (the sanskrit verse), "english" (the translation), and "verse" (e.g. Chapter X, Verse Y). Do not include markdown code blocks like ```json, do not include any other text or greetings, just output the raw JSON object.'
            }],
            provider: 'groq'
          })
        });
        const data = await response.json();
        
        let jsonStr = data.reply.trim();
        if (jsonStr.startsWith('```json')) jsonStr = jsonStr.replace(/^```json/, '').replace(/```$/, '').trim();
        else if (jsonStr.startsWith('```')) jsonStr = jsonStr.replace(/^```/, '').replace(/```$/, '').trim();
        
        const parsed = JSON.parse(jsonStr);
        if (parsed.sanskrit && parsed.english && parsed.verse) {
          setShloka(parsed);
          localStorage.setItem('lifeos_daily_shloka', JSON.stringify({ date: todayStr, shloka: parsed }));
        } else {
          const fallback = GITA_SHLOKAS[Math.floor(Math.random() * GITA_SHLOKAS.length)];
          setShloka(fallback);
          localStorage.setItem('lifeos_daily_shloka', JSON.stringify({ date: todayStr, shloka: fallback }));
        }
      } catch (e) {
        console.error('Failed to fetch AI Shloka, using fallback', e);
        const fallback = GITA_SHLOKAS[Math.floor(Math.random() * GITA_SHLOKAS.length)];
        setShloka(fallback);
        localStorage.setItem('lifeos_daily_shloka', JSON.stringify({ date: todayStr, shloka: fallback }));
      } finally {
        setLoadingShloka(false);
      }
    };
    
    fetchShloka();
  }, []);

  const handleNoteChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setQuickNote(e.target.value);
    localStorage.setItem('lifeos_quicknote', e.target.value);
  };

  const handleSync = async () => {
    if (!firebaseUser || !googleAccessToken) return alert('Connect Google first!');
    setSyncing(true);
    try {
      let folderId = await getDriveFolder(googleAccessToken);
      if (!folderId) {
        folderId = await createDriveFolder(googleAccessToken);
      }
      if (!folderId) throw new Error('Could not create or find Life OS folder');

      // Sync all items as individual files for now (or a single JSON dump)
      const dataDump = JSON.stringify({
        journals: store.journalEntries,
        dreams: store.dreamCards,
        goals: store.lifeGoals,
        brainNotes: store.brainNotes,
        relationships: store.relationships
      }, null, 2);

      await syncFileToDrive(googleAccessToken, 'LifeOS_Backup.json', dataDump, folderId);
      
      alert('Successfully synced backup to Google Drive!');
    } catch (e: any) {
      alert('Error syncing to Drive: ' + e.message);
    } finally {
      setSyncing(false);
    }
  };

  const handleConnectGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      if (credential?.accessToken) {
        setGoogleAccessToken(credential.accessToken);
      }
    } catch (error) {
      console.error('Login Failed', error);
      alert('Failed to connect to Google');
    }
  };

  const handleDisconnectGoogle = async () => {
    await firebaseSignOut(auth);
    setGoogleAccessToken(null);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (ev.target?.result) addCustomMemory(ev.target.result as string);
      };
      reader.readAsDataURL(file);
    });
  };

  const todayStr = new Date().toISOString().slice(0, 10);
  const todayHabits = lifeHabits.map(h => ({ ...h, isDoneToday: h.date === todayStr && h.done }));

  const onToggleHabit = (id: string) => {
    toggleHabit(id, todayStr);
  };

  // Current Date formatting
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  // Greeting
  const hour = now.getHours();
  let greeting = 'Good evening';
  if (hour < 12) greeting = 'Good morning';
  else if (hour < 17) greeting = 'Good afternoon';

  const apps = [
    { label: 'Second Brain', href: '/personal/brain', emoji: '🧠', color: '#9333ea', desc: 'Ideas, notes & thoughts' },
    { label: 'Relationships', href: '/personal/relationships', emoji: '❤️', color: '#e11d48', desc: 'Your CRM & memories' },
    { label: 'Health', href: '/personal/health', emoji: '🏥', color: '#14b8a6', desc: 'Sickness & hospital log' },
    { label: 'Wealth', href: '/personal/money', emoji: '💰', color: '#059669', desc: 'Net worth & goals' },
    { label: 'Dreams', href: '/personal/dreams', emoji: '🌎', color: '#2563eb', desc: 'Vision board' },
    { label: 'Future Letters', href: '/personal/future', emoji: '✉️', color: '#d97706', desc: 'Time capsules' },
    { label: 'Self Analysis', href: '/personal/self', emoji: '✨', color: '#db2777', desc: 'Reflections & self' },
    { label: 'Analytics', href: '/personal/analytics', emoji: '📈', color: '#0d9488', desc: 'Life data & metrics' },
    { label: 'Journal', href: '/personal/journal', emoji: '📓', color: '#ea580c', desc: 'Daily logs & entries' },
  ];

  if (!mounted) return null;

  return (
    <div style={{ color: '#f0f0f0', fontFamily: 'Inter, sans-serif', animation: 'fadeUp 0.6s cubic-bezier(0.16, 1, 0.3, 1)' }}>
      
      {/* Background Ambient Glows */}
      <div style={{ position: 'fixed', top: '-10%', left: '-10%', width: '40vw', height: '40vw', background: 'radial-gradient(circle, rgba(147,51,234,0.1) 0%, transparent 70%)', filter: 'blur(80px)', zIndex: -1, pointerEvents: 'none' }} />
      <div style={{ position: 'fixed', bottom: '-10%', right: '-10%', width: '40vw', height: '40vw', background: 'radial-gradient(circle, rgba(14,165,233,0.1) 0%, transparent 70%)', filter: 'blur(80px)', zIndex: -1, pointerEvents: 'none' }} />

      {/* Header */}
      <div className="mobile-header-wrap" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 20, marginBottom: 40, marginTop: 10 }}>
        <div style={{ minWidth: 280 }}>
          <h1 style={{ fontSize: 32, fontWeight: 900, letterSpacing: '-1px', background: 'linear-gradient(135deg, #ffffff 0%, #cbd5e1 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: 6 }}>
            {greeting}, Yashwin.
          </h1>
          <p style={{ color: '#94a3b8', fontSize: 16, fontWeight: 500 }}>Ready to conquer the day?</p>
        </div>
        <div className="mobile-header-actions" style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          {/* Google Connect Button */}
          {firebaseUser ? (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
              <button onClick={handleSync} disabled={syncing} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'linear-gradient(135deg, #10b981, #059669)', color: '#fff', padding: '10px 16px', borderRadius: 20, border: 'none', fontWeight: 600, fontSize: 13, cursor: syncing ? 'wait' : 'pointer', boxShadow: '0 4px 14px rgba(16,185,129,0.3)', opacity: syncing ? 0.7 : 1 }}>
                <CloudSun size={16} /> {syncing ? 'Syncing...' : 'Sync to Drive'}
              </button>
              <button onClick={handleDisconnectGoogle} style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'rgba(0,0,0,0.3)', padding: '6px 12px', borderRadius: 20, border: '1px solid rgba(255,255,255,0.05)', cursor: 'pointer', transition: 'background 0.2s' }}>
                {firebaseUser.photoURL ? <img src={firebaseUser.photoURL} alt="Profile" style={{ width: 24, height: 24, borderRadius: '50%' }} /> : <Cloud size={18} color="#60a5fa" />}
                <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
                  <div style={{ fontSize: 12, color: '#f8fafc', fontWeight: 600 }}>{firebaseUser.displayName || firebaseUser.email}</div>
                  <div style={{ fontSize: 10, color: '#94a3b8' }}>Connected</div>
                </div>
              </button>
            </div>
          ) : (
            <button onClick={handleConnectGoogle} style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#3b82f6', color: '#fff', padding: '10px 16px', borderRadius: 20, border: 'none', fontWeight: 600, fontSize: 13, cursor: 'pointer', boxShadow: '0 4px 14px rgba(59,130,246,0.4)', transition: 'transform 0.2s' }}>
              <Cloud size={16} /> Connect Google
            </button>
          )}
          <div style={{ textAlign: 'right', background: 'rgba(255,255,255,0.02)', padding: '12px 24px', borderRadius: 24, border: '1px solid rgba(255,255,255,0.05)', backdropFilter: 'blur(10px)' }}>
            <div style={{ fontSize: 24, fontWeight: 800, color: '#f8fafc', letterSpacing: '1px' }}>{timeStr}</div>
            <div style={{ fontSize: 13, color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: 2 }}>{dateStr}</div>
          </div>
        </div>
      </div>

      {/* Bento Grid */}
      <div className="dashboard-grid mobile-stack-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 24, marginBottom: 48 }}>
        
        {/* Today's Focus (Large Wide Card) */}
        <div style={{ gridColumn: 'span 8', background: 'linear-gradient(145deg, rgba(30,41,59,0.4) 0%, rgba(15,23,42,0.4) 100%)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 32, padding: 36, display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden', boxShadow: '0 20px 40px -20px rgba(0,0,0,0.5)' }}>
          <div style={{ position: 'absolute', top: -100, right: -50, width: 300, height: 300, background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#818cf8', marginBottom: 20 }}>
            <Focus size={20} strokeWidth={2.5} />
            <span style={{ fontWeight: 800, textTransform: 'uppercase', fontSize: 12, letterSpacing: '1.5px' }}>Main Focus</span>
          </div>
          <input 
            type="text" 
            placeholder="What is your main focus for today?"
            value={todayFocus}
            onChange={(e) => setTodayFocus(e.target.value)}
            style={{ 
              background: 'transparent', border: 'none', color: '#ffffff', fontSize: 36, fontWeight: 800, 
              outline: 'none', width: '100%', padding: '16px 0', borderBottom: '2px solid rgba(255,255,255,0.1)',
              transition: 'border-color 0.3s'
            }}
            onFocus={(e) => e.target.style.borderBottom = '2px solid #818cf8'}
            onBlur={(e) => e.target.style.borderBottom = '2px solid rgba(255,255,255,0.1)'}
          />
        </div>

        {/* Weather Card */}
        <div style={{ gridColumn: 'span 4', background: 'linear-gradient(135deg, #1e3a8a 0%, #312e81 100%)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 32, padding: 32, display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden', boxShadow: '0 20px 40px -20px rgba(0,0,0,0.5)' }}>
          <div style={{ position: 'absolute', top: 20, right: 20 }}>
            <AppleEmoji emoji="☀️" size={64} style={{ filter: 'drop-shadow(0 0 20px rgba(252,211,77,0.5))' }} />
          </div>
          <div style={{ marginTop: 'auto' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
              <div style={{ fontSize: 52, fontWeight: 900, color: '#fff', letterSpacing: '-2px' }}>24°</div>
              <div style={{ fontSize: 20, color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>C</div>
            </div>
            <div style={{ fontSize: 16, color: 'rgba(255,255,255,0.9)', fontWeight: 600, marginBottom: 12 }}>Partly Cloudy</div>
            <div style={{ display: 'flex', gap: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'rgba(255,255,255,0.6)', fontWeight: 500 }}><MapPin size={14} /> Bengaluru</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'rgba(255,255,255,0.6)', fontWeight: 500 }}><Wind size={14} /> 12 km/h</div>
            </div>
          </div>
        </div>

        {/* Habit Tracker */}
        <div style={{ gridColumn: 'span 4', background: 'rgba(20,25,35,0.6)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 32, padding: 32, boxShadow: '0 20px 40px -20px rgba(0,0,0,0.5)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#34d399', marginBottom: 24 }}>
            <Target size={20} strokeWidth={2.5} />
            <span style={{ fontWeight: 800, textTransform: 'uppercase', fontSize: 12, letterSpacing: '1.5px' }}>Daily Habits</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {todayHabits.map((habit) => (
              <div 
                key={habit.id} 
                onClick={() => onToggleHabit(habit.id)}
                style={{ 
                  display: 'flex', alignItems: 'center', gap: 16, padding: '16px', 
                  background: habit.isDoneToday ? 'rgba(52,211,153,0.1)' : 'rgba(255,255,255,0.02)',
                  border: `1px solid ${habit.isDoneToday ? 'rgba(52,211,153,0.3)' : 'rgba(255,255,255,0.04)'}`,
                  borderRadius: 20, cursor: 'pointer', transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
                }}
                onMouseEnter={(e) => {
                  if (!habit.isDoneToday) e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                }}
                onMouseLeave={(e) => {
                  if (!habit.isDoneToday) e.currentTarget.style.background = 'rgba(255,255,255,0.02)';
                }}
              >
                {habit.isDoneToday ? <CheckCircle2 size={24} color="#34d399" /> : <Circle size={24} color="rgba(255,255,255,0.2)" />}
                <AppleEmoji emoji={habit.icon} size={24} />
                <span style={{ fontSize: 15, fontWeight: 600, color: habit.isDoneToday ? '#f8fafc' : '#94a3b8', textDecoration: habit.isDoneToday ? 'line-through' : 'none' }}>
                  {habit.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Notes */}
        <div style={{ gridColumn: 'span 4', background: 'rgba(20,25,35,0.6)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 32, padding: 32, display: 'flex', flexDirection: 'column', boxShadow: '0 20px 40px -20px rgba(0,0,0,0.5)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#fcd34d', marginBottom: 24 }}>
            <AppleEmoji emoji="📝" size={20} />
            <span style={{ fontWeight: 800, textTransform: 'uppercase', fontSize: 12, letterSpacing: '1.5px' }}>Quick Notes</span>
          </div>
          <textarea 
            value={quickNote}
            onChange={handleNoteChange}
            placeholder="Jot down a quick thought..."
            style={{ 
              flex: 1, width: '100%', background: 'transparent', border: 'none', 
              color: 'rgba(255,255,255,0.9)', fontSize: 15, lineHeight: 1.6, resize: 'none', outline: 'none' 
            }}
          />
        </div>

        {/* Goals & Quotes */}
        <div style={{ gridColumn: 'span 4', display: 'flex', flexDirection: 'column', gap: 24 }}>
          
          {/* Gita Shloka */}
          <div style={{ background: 'rgba(20,25,35,0.6)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 32, padding: 32, position: 'relative', boxShadow: '0 20px 40px -20px rgba(0,0,0,0.5)' }}>
            <Sparkles size={40} color="rgba(245,158,11,0.15)" style={{ position: 'absolute', top: 24, right: 24 }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#f59e0b', marginBottom: 20 }}>
              <AppleEmoji emoji="🪔" size={20} />
              <span style={{ fontWeight: 800, textTransform: 'uppercase', fontSize: 12, letterSpacing: '1.5px' }}>Daily Wisdom {loadingShloka && <span style={{ opacity: 0.5, marginLeft: 8 }}>(Summoning AI...)</span>}</span>
            </div>
            <div style={{ opacity: loadingShloka ? 0.3 : 1, transition: 'opacity 0.4s' }}>
              <p style={{ color: '#fbbf24', fontSize: 17, lineHeight: 1.7, marginBottom: 16, fontWeight: 600, paddingRight: 20, whiteSpace: 'pre-line', fontStyle: 'italic' }}>
                {shloka.sanskrit}
              </p>
              <p style={{ color: '#e2e8f0', fontSize: 14, lineHeight: 1.6, marginBottom: 16, paddingRight: 20, opacity: 0.9 }}>
                "{shloka.english}"
              </p>
              <div style={{ fontSize: 13, color: '#f59e0b', fontWeight: 800, letterSpacing: '0.5px' }}>— {shloka.verse}</div>
            </div>
          </div>

          {/* Current Goals Preview */}
          <div style={{ background: 'rgba(20,25,35,0.6)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 32, padding: 32, flex: 1, boxShadow: '0 20px 40px -20px rgba(0,0,0,0.5)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#60a5fa', marginBottom: 24 }}>
              <AppleEmoji emoji="🎯" size={20} />
              <span style={{ fontWeight: 800, textTransform: 'uppercase', fontSize: 12, letterSpacing: '1.5px' }}>Active Goals</span>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {lifeGoals.slice(0, 2).map(goal => (
                <div key={goal.id}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, fontSize: 14, marginBottom: 10, fontWeight: 600 }}>
                    <span style={{ color: '#f8fafc' }}>{goal.title}</span>
                    <span style={{ color: '#94a3b8' }}>{goal.progress}%</span>
                  </div>
                  <div style={{ height: 8, background: 'rgba(0,0,0,0.5)', borderRadius: 8, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ height: '100%', width: `${goal.progress}%`, background: 'linear-gradient(90deg, #3b82f6, #60a5fa)', borderRadius: 8 }} />
                  </div>
                </div>
              ))}
              {lifeGoals.length === 0 && (
                <div style={{ fontSize: 14, color: '#64748b', fontWeight: 500 }}>No active goals. Add some!</div>
              )}
            </div>
          </div>

        </div>

      </div>

      {/* Memories */}
      <div style={{ background: 'rgba(20,25,35,0.6)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 32, padding: 36, boxShadow: '0 20px 40px -20px rgba(0,0,0,0.5)', overflow: 'hidden', marginBottom: 48 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#e879f9' }}>
            <ImageIcon size={22} strokeWidth={2.5} />
            <span style={{ fontWeight: 800, textTransform: 'uppercase', fontSize: 12, letterSpacing: '1.5px' }}>Recent Memories</span>
          </div>
          <div>
            <label style={{ cursor: 'pointer', background: 'rgba(255,255,255,0.05)', padding: '8px 16px', borderRadius: 20, fontSize: 13, fontWeight: 600, color: '#f8fafc', transition: 'background 0.2s', border: '1px solid rgba(255,255,255,0.1)' }}>
              <span style={{ marginRight: 6 }}>+</span> Add Photo
              <input type="file" multiple accept="image/*" style={{ display: 'none' }} onChange={handlePhotoUpload} />
            </label>
          </div>
        </div>
        
        {loadingPhotos ? (
          <div style={{ display: 'flex', gap: 16, overflowX: 'auto', paddingBottom: 10 }}>
            {[1,2,3,4].map(i => (
              <div key={i} style={{ width: 240, height: 240, background: 'rgba(255,255,255,0.02)', borderRadius: 24, flexShrink: 0, animation: 'pulse 1.5s infinite ease-in-out' }} />
            ))}
          </div>
        ) : (customMemories.length > 0 || photos.length > 0) ? (
          <div style={{ display: 'flex', gap: 16, overflowX: 'auto', paddingBottom: 16, WebkitOverflowScrolling: 'touch', scrollbarWidth: 'thin' }}>
            {/* Custom Memories First */}
            {customMemories.map((base64, idx) => (
              <div key={`custom-${idx}`} style={{ position: 'relative', flexShrink: 0, width: 240, height: 240 }}>
                <img 
                  src={base64} 
                  alt="Custom Memory" 
                  style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 24, border: '1px solid rgba(255,255,255,0.05)', transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)' }}
                  onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                />
                <button 
                  onClick={() => removeCustomMemory(idx)}
                  style={{ position: 'absolute', top: 10, right: 10, background: 'rgba(0,0,0,0.5)', color: '#fff', border: 'none', width: 28, height: 28, borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}
                >
                  ✕
                </button>
              </div>
            ))}
            
            {/* Google Photos API Next */}
            {photos.map(photo => (
              <img 
                key={photo.id} 
                src={`${photo.baseUrl}=w400-h400-c`} 
                alt="Memory" 
                style={{ width: 240, height: 240, objectFit: 'cover', borderRadius: 24, flexShrink: 0, border: '1px solid rgba(255,255,255,0.05)', transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)' }}
                onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
              />
            ))}
          </div>
        ) : (
          <div style={{ padding: 40, textAlign: 'center', color: 'rgba(255,255,255,0.4)', fontSize: 14 }}>
            No recent photos found in your Google Photos library. Click "Add Photo" to upload manually!
          </div>
        )}
      </div>

      {/* Modules Section */}
      <h2 style={{ fontSize: 24, fontWeight: 900, marginBottom: 32, display: 'flex', alignItems: 'center', gap: 12, letterSpacing: '-0.5px' }}>
        <AppleEmoji emoji="🚀" size={28} /> Life Modules
      </h2>
      <div className="dashboard-apps-grid mobile-stack-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20, marginBottom: 80 }}>
        {apps.map((app) => (
          <Link href={app.href} key={app.label} style={{ textDecoration: 'none' }}>
            <div 
              style={{ 
                background: 'rgba(20,25,35,0.6)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.06)', 
                borderRadius: 28, padding: 24, transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)', cursor: 'pointer',
                display: 'flex', flexDirection: 'column', gap: 20, boxShadow: '0 10px 30px -15px rgba(0,0,0,0.5)',
                position: 'relative', overflow: 'hidden'
              }}
              className="module-card"
            >
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '40%', background: `linear-gradient(180deg, ${app.color}15 0%, transparent 100%)`, zIndex: 0 }} />
              <div style={{ zIndex: 1 }}>
                <AppleEmoji emoji={app.emoji} size={42} style={{ filter: `drop-shadow(0 8px 16px ${app.color}40)` }} />
              </div>
              <div style={{ zIndex: 1 }}>
                <div style={{ color: '#fff', fontWeight: 800, fontSize: 17, marginBottom: 6, letterSpacing: '-0.3px' }}>{app.label}</div>
                <div style={{ color: '#94a3b8', fontSize: 13, fontWeight: 500 }}>{app.desc}</div>
              </div>
            </div>
          </Link>
        ))}
      </div>
      
      <style dangerouslySetInnerHTML={{__html:`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px) scale(0.98) }
          to { opacity: 1; transform: translateY(0) scale(1) }
        }
        .module-card:hover {
          transform: translateY(-4px) scale(1.02) !important;
          background: rgba(30,35,50,0.8) !important;
          border-color: rgba(255,255,255,0.1) !important;
          box-shadow: 0 20px 40px -10px rgba(0,0,0,0.6) !important;
        }
      `}} />
    </div>
  );
}
