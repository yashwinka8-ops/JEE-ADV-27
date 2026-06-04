'use client';

import { useState, useRef, useEffect } from 'react';
import { useStore } from '@/store/useStore';
import { Sparkles, X, Send, Bot, Loader2, Maximize2, Minimize2, Plus, History, Trash2, ArrowLeft, MessageSquare } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Rnd } from 'react-rnd';

interface Message {
  role: 'user' | 'model';
  content: string;
}

export default function AIChatWidget() {
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [view, setView] = useState<'chat' | 'history'>('chat');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [rndState, setRndState] = useState({ width: 380, height: 600, x: 0, y: 0 });
  const [prevRnd, setPrevRnd] = useState({ width: 380, height: 600, x: 0, y: 0 });

  useEffect(() => {
    setMounted(true);
    if (typeof window !== 'undefined') {
      const checkMobile = () => {
        const mobile = window.innerWidth < 768;
        setIsMobile(mobile);
        return mobile;
      };
      
      const mobile = checkMobile();

      if (!mobile) {
        const w = 380;
        const h = 600;
        const initialRnd = {
          width: w,
          height: h,
          x: window.innerWidth - w - 24,
          y: window.innerHeight - h - 24,
        };
        setRndState(initialRnd);
        setPrevRnd(initialRnd);
      }

      window.addEventListener('resize', checkMobile);
      return () => window.removeEventListener('resize', checkMobile);
    }
  }, []);

  // Zustand Store values for Context
  const store = useStore();
  
  const activeThread = store.chatThreads?.find(t => t.id === store.activeThreadId);
  const messages = activeThread?.messages || [];

  useEffect(() => {
    if (messagesEndRef.current && view === 'chat') {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, view]);

  const toggleMaximize = () => {
    if (isMaximized) {
      setRndState(prevRnd);
      setIsMaximized(false);
    } else {
      setPrevRnd(rndState);
      setRndState({
        width: window.innerWidth - 48,
        height: window.innerHeight - 48,
        x: 24,
        y: 24
      });
      setIsMaximized(true);
    }
  };

  const generateContext = () => {
    const todayStr = new Date().toISOString().slice(0, 10);
    
    // Summarize data to save tokens
    const pendingTasks = store.tasks.filter(t => t.status !== 'done').slice(0, 10).map(t => ({ title: t.title, due: t.dueDate }));
    const goals = store.weeklyGoals.filter(g => !g.completed).map(g => g.title);
    const todayStudy = store.getTodayMinutes();
    const streak = store.getCurrentStreak();
    const dueRevs = store.revisions.filter(r => r.nextRevisionDate <= todayStr && r.stage < 4).length;
    
    const totalTopics = store.chapters.reduce((a, c) => a + c.topics.length, 0);
    const doneTopics = store.chapters.reduce((a, c) => a + c.topics.filter(t => t.done).length, 0);
    const completionPct = totalTopics ? Math.round((doneTopics / totalTopics) * 100) : 0;

    return {
      date: todayStr,
      studyStats: { todayMinutes: todayStudy, dailyGoal: store.dailyGoalMinutes, streakDays: streak },
      pendingTasks,
      weeklyGoals: goals,
      revisionsDueToday: dueRevs,
      overallSyllabusCompletion: `${completionPct}% (${doneTopics}/${totalTopics} topics)`
    };
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: Message = { role: 'user', content: input };
    const currentMessages = [...messages, userMessage];
    
    store.addMessageToActiveChat(userMessage);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: store.aiProvider || 'gemini',
          messages: currentMessages,
          context: currentMessages.length === 1 ? generateContext() : null
        }),
      });

      const data = await response.json();
      
      if (!response.ok) throw new Error(data.error || 'Failed to fetch AI response');

      store.addMessageToActiveChat({ role: 'model', content: data.reply });
    } catch (error) {
      console.error(error);
      store.addMessageToActiveChat({ role: 'model', content: '⚠️ Error: Unable to reach your AI Mentor. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  if (!mounted) return null;

  const chatContent = (
    <>
      {/* Header */}
      <div className="chat-header-handle" style={{
        padding: '16px 20px',
        background: 'var(--bg-tertiary)',
        borderBottom: '1px solid var(--separator)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        cursor: isMobile || isMaximized ? 'default' : 'grab'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {view === 'history' ? (
            <button 
              onClick={() => setView('chat')}
              style={{ background: 'transparent', border: 'none', color: 'var(--label-secondary)', cursor: 'pointer', padding: 4, display: 'flex', alignItems: 'center' }}
              title="Back to Chat"
            >
              <ArrowLeft size={18} />
            </button>
          ) : (
            <button 
              onClick={() => setView('history')}
              style={{ background: 'transparent', border: 'none', color: 'var(--label-secondary)', cursor: 'pointer', padding: 4, display: 'flex', alignItems: 'center' }}
              title="Chat History"
            >
              <History size={18} />
            </button>
          )}

          <div style={{ background: 'var(--blue)', padding: 6, borderRadius: 8 }}>
            <Bot size={18} color="#fff" />
          </div>
          <div>
            <h3 style={{ fontSize: 15, fontWeight: 700, margin: 0 }}>JEE Mentor AI</h3>
            <select 
              value={store.aiProvider || 'gemini'}
              onChange={e => store.setAiProvider(e.target.value as any)}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--label-tertiary)',
                fontSize: 11,
                padding: 0,
                margin: 0,
                outline: 'none',
                cursor: 'pointer',
                maxWidth: isMobile ? 120 : 200,
                textOverflow: 'ellipsis'
              }}
            >
              <option value="gemini" style={{ background: 'var(--bg-primary)', color: 'var(--label-primary)' }}>Gemini 2.5 Flash</option>
              <option value="groq" style={{ background: 'var(--bg-primary)', color: 'var(--label-primary)' }}>Groq (Llama 3 70B)</option>
              <option value="mistral" style={{ background: 'var(--bg-primary)', color: 'var(--label-primary)' }}>Mistral Small</option>
              <option value="cerebras" style={{ background: 'var(--bg-primary)', color: 'var(--label-primary)' }}>Cerebras (Llama 3.1 8B)</option>
              <option value="openrouter" style={{ background: 'var(--bg-primary)', color: 'var(--label-primary)' }}>OpenRouter (Llama 3 8B)</option>
            </select>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          {view === 'chat' && (
            <button 
              onClick={() => { store.createNewChat(); setView('chat'); }}
              style={{ color: 'var(--label-secondary)', padding: 6, borderRadius: 8, transition: 'background 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', border: 'none', cursor: 'pointer' }}
              title="New Chat"
              onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-secondary)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <Plus size={18} />
            </button>
          )}
          {!isMobile && (
            <button 
              onClick={toggleMaximize}
              style={{ color: 'var(--label-secondary)', padding: 6, borderRadius: 8, transition: 'background 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', border: 'none', cursor: 'pointer' }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-secondary)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              title={isMaximized ? "Minimize" : "Maximize"}
            >
              {isMaximized ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
            </button>
          )}
          <button 
            onClick={() => setIsOpen(false)}
            style={{ color: 'var(--label-secondary)', padding: 6, borderRadius: 8, transition: 'background 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', border: 'none', cursor: 'pointer' }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-secondary)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            title="Close"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      {view === 'history' ? (
        /* History View */
        <div style={{ flex: 1, overflowY: 'auto', padding: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
          {store.chatThreads?.map(thread => (
            <div 
              key={thread.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 16px',
                background: thread.id === store.activeThreadId ? 'var(--bg-tertiary)' : 'transparent',
                borderRadius: 12,
                cursor: 'pointer',
                transition: 'background 0.2s'
              }}
              onMouseEnter={e => { if (thread.id !== store.activeThreadId) e.currentTarget.style.background = 'var(--bg-tertiary)'; }}
              onMouseLeave={e => { if (thread.id !== store.activeThreadId) e.currentTarget.style.background = 'transparent'; }}
              onClick={() => {
                store.switchChat(thread.id);
                setView('chat');
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, overflow: 'hidden' }}>
                <MessageSquare size={16} color="var(--label-secondary)" style={{ flexShrink: 0 }} />
                <span style={{ 
                  color: 'var(--label-primary)', 
                  fontSize: 14, 
                  whiteSpace: 'nowrap', 
                  overflow: 'hidden', 
                  textOverflow: 'ellipsis' 
                }}>
                  {thread.title}
                </span>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  store.deleteChat(thread.id);
                }}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--label-secondary)',
                  cursor: 'pointer',
                  padding: 4,
                  opacity: 0.7,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                onMouseEnter={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.color = 'var(--red)'; }}
                onMouseLeave={e => { e.currentTarget.style.opacity = '0.7'; e.currentTarget.style.color = 'var(--label-secondary)'; }}
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
          {(!store.chatThreads || store.chatThreads.length === 0) && (
            <div style={{ textAlign: 'center', color: 'var(--label-tertiary)', marginTop: 40 }}>
              <p style={{ fontSize: 14 }}>No chat history found.</p>
            </div>
          )}
        </div>
      ) : (
        <>
          {/* Messages Area */}
          <div style={{ flex: 1, overflowY: 'auto', padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
            {messages.length === 0 && (
              <div style={{ textAlign: 'center', color: 'var(--label-tertiary)', margin: 'auto' }}>
                <Bot size={40} style={{ margin: '0 auto 12px', opacity: 0.5 }} />
                <p style={{ fontSize: 14 }}>Hello! I have full access to your JEE tracker data. Ask me anything about your prep!</p>
              </div>
            )}
            
            {messages.map((m, i) => (
              <div key={i} style={{
                alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
                maxWidth: '85%',
                background: m.role === 'user' ? 'var(--blue)' : 'var(--bg-tertiary)',
                color: m.role === 'user' ? '#fff' : 'var(--label-primary)',
                padding: '12px 16px',
                borderRadius: 16,
                borderBottomRightRadius: m.role === 'user' ? 4 : 16,
                borderBottomLeftRadius: m.role === 'model' ? 4 : 16,
                fontSize: 14,
                lineHeight: 1.5,
              }}>
                {m.role === 'user' ? (
                  <span style={{ whiteSpace: 'pre-wrap' }}>{m.content}</span>
                ) : (
                  <div className="markdown-content">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {m.content}
                    </ReactMarkdown>
                  </div>
                )}
              </div>
            ))}
            
            {isLoading && (
              <div style={{ alignSelf: 'flex-start', background: 'var(--bg-tertiary)', padding: '12px 16px', borderRadius: 16 }}>
                <Loader2 size={16} className="lucide-spin" style={{ animation: 'spin 2s linear infinite' }} />
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div style={{ padding: isMobile ? '12px 16px 24px' : 16, borderTop: '1px solid var(--separator)', background: 'var(--bg-primary)' }}>
            <form onSubmit={e => { e.preventDefault(); sendMessage(); }} style={{ display: 'flex', gap: 8 }}>
              <input 
                type="text" 
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Ask your mentor..."
                style={{
                  flex: 1,
                  background: 'var(--bg-tertiary)',
                  border: 'none',
                  borderRadius: 20,
                  padding: '10px 16px',
                  color: 'var(--label-primary)',
                  fontSize: 14,
                  outline: 'none',
                  // Prevent iOS zoom
                  WebkitAppearance: 'none'
                }}
              />
              <button 
                type="submit"
                disabled={!input.trim() || isLoading}
                style={{
                  background: input.trim() && !isLoading ? 'var(--blue)' : 'var(--bg-tertiary)',
                  color: '#fff',
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'background 0.2s',
                  opacity: input.trim() && !isLoading ? 1 : 0.5,
                  border: 'none',
                  cursor: input.trim() && !isLoading ? 'pointer' : 'default',
                  flexShrink: 0
                }}
              >
                <Send size={16} style={{ marginLeft: 2 }} />
              </button>
            </form>
          </div>
        </>
      )}
    </>
  );

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <button 
          onClick={() => setIsOpen(true)}
          style={{
            position: 'fixed',
            bottom: isMobile ? 80 : 24, // Lifted slightly on mobile so it doesn't overlap bottom tabs if any
            right: isMobile ? 16 : 24,
            width: 56,
            height: 56,
            borderRadius: 28,
            background: 'var(--blue)',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
            zIndex: 9999,
            transition: 'transform 0.2s',
          }}
          onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
        >
          <Sparkles size={24} />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        isMobile ? (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'var(--bg-secondary)',
            zIndex: 9999,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
          }}>
            {chatContent}
          </div>
        ) : (
          <Rnd
            size={{ width: rndState.width, height: rndState.height }}
            position={{ x: rndState.x, y: rndState.y }}
            onDragStop={(e, d) => setRndState({ ...rndState, x: d.x, y: d.y })}
            onResizeStop={(e, direction, ref, delta, position) => {
              setRndState({
                width: parseInt(ref.style.width, 10),
                height: parseInt(ref.style.height, 10),
                x: position.x,
                y: position.y
              });
            }}
            minWidth={320}
            minHeight={400}
            bounds="window"
            dragHandleClassName="chat-header-handle"
            disableDragging={isMaximized}
            enableResizing={!isMaximized}
            style={{
              position: 'fixed',
              background: 'var(--bg-secondary)',
              borderRadius: 20,
              boxShadow: '0 12px 40px rgba(0,0,0,0.5)',
              border: '1px solid var(--separator)',
              zIndex: 9999,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden'
            }}
          >
            {chatContent}
          </Rnd>
        )
      )}
    </>
  );
}
