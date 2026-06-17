'use client';

import { useState, useEffect } from 'react';
import { useSession, signIn } from 'next-auth/react';
import { 
  ListTodo, CheckCircle2, Circle, Plus, Trash2, Edit2, 
  X, Calendar, ChevronDown, Check, Loader2, RefreshCw, AlertCircle
} from 'lucide-react';
import AppleEmoji from './AppleEmoji';

interface Task {
  id: string;
  title: string;
  status: 'completed' | 'needsAction';
  due: string | null;
  notes: string;
  updated: string;
  position: string;
}

interface TaskList {
  id: string;
  title: string;
}

export default function GoogleTasksTracker() {
  const { data: session, status: sessionStatus } = useSession();
  const token = (session as any)?.accessToken;

  const [tasks, setTasks] = useState<Task[]>([]);
  const [lists, setLists] = useState<TaskList[]>([]);
  const [activeListId, setActiveListId] = useState<string>('');
  const [listTitle, setListTitle] = useState<string>('');
  
  const [loading, setLoading] = useState<boolean>(false);
  const [syncing, setSyncing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Filter state
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('pending');
  const [showListsDropdown, setShowListsDropdown] = useState<boolean>(false);

  // New task form state
  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  const [newTitle, setNewTitle] = useState<string>('');
  const [newNotes, setNewNotes] = useState<string>('');
  const [newDue, setNewDue] = useState<string>('');

  // Editing state
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState<string>('');
  const [editNotes, setEditNotes] = useState<string>('');
  const [editDue, setEditDue] = useState<string>('');

  // Fetch lists and tasks
  const loadData = async (listId?: string, isBackground = false) => {
    if (!token) return;
    if (!isBackground) setLoading(true);
    else setSyncing(true);
    setError(null);

    try {
      const url = listId ? `/api/google/tasks?listId=${listId}` : '/api/google/tasks';
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.status === 401) {
        setError('unauthenticated');
        return;
      }
      if (res.status === 403) {
        setError('permission_required');
        return;
      }

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to fetch tasks');
      }

      const data = await res.json();
      setTasks(data.tasks || []);
      setLists(data.lists || []);
      setActiveListId(data.activeListId || '');
      setListTitle(data.listTitle || '');
    } catch (err: any) {
      console.error('Google Tasks error:', err);
      setError(err.message || 'Failed to load Google Tasks');
    } finally {
      setLoading(false);
      setSyncing(false);
    }
  };

  useEffect(() => {
    if (token) {
      loadData();
    }
  }, [token]);

  // Handle switching list
  const handleSelectList = (listId: string) => {
    setShowListsDropdown(false);
    loadData(listId);
  };

  // Toggle complete / needsAction status
  const handleToggleStatus = async (task: Task) => {
    if (!token || !activeListId) return;

    const newStatus = task.status === 'completed' ? 'needsAction' : 'completed';
    
    // Optimistic UI Update
    const prevTasks = [...tasks];
    setTasks(tasks.map(t => t.id === task.id ? { ...t, status: newStatus } : t));
    setSyncing(true);

    try {
      const res = await fetch('/api/google/tasks', {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          listId: activeListId,
          taskId: task.id,
          status: newStatus,
        })
      });

      if (!res.ok) {
        throw new Error('Failed to update status');
      }
      
      const updatedData = await res.json();
      // Sync actual data returned
      setTasks(prev => prev.map(t => t.id === task.id ? { ...t, status: updatedData.status } : t));
    } catch (err: any) {
      // Revert on failure
      setTasks(prevTasks);
      setError('Could not update task status. Try again.');
    } finally {
      setSyncing(false);
    }
  };

  // Add Task
  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !token || !activeListId) return;

    setSyncing(true);
    const tempId = `temp-${Date.now()}`;
    const optimisticTask: Task = {
      id: tempId,
      title: newTitle,
      status: 'needsAction',
      due: newDue ? new Date(newDue).toISOString() : null,
      notes: newNotes,
      updated: new Date().toISOString(),
      position: 'z',
    };

    // Optimistic UI update
    setTasks([optimisticTask, ...tasks]);
    setNewTitle('');
    setNewNotes('');
    setNewDue('');
    setShowAddForm(false);

    try {
      const res = await fetch('/api/google/tasks', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          listId: activeListId,
          title: optimisticTask.title,
          notes: optimisticTask.notes,
          due: optimisticTask.due,
        })
      });

      if (!res.ok) {
        throw new Error('Failed to add task');
      }

      const created = await res.json();
      setTasks(prev => prev.map(t => t.id === tempId ? created : t));
    } catch (err: any) {
      setTasks(prev => prev.filter(t => t.id !== tempId));
      setError('Could not add task. Try again.');
    } finally {
      setSyncing(false);
    }
  };

  // Delete Task
  const handleDeleteTask = async (taskId: string) => {
    if (!token || !activeListId) return;

    // Optimistic UI Update
    const prevTasks = [...tasks];
    setTasks(tasks.filter(t => t.id !== taskId));
    setSyncing(true);

    try {
      const res = await fetch(`/api/google/tasks?listId=${activeListId}&taskId=${taskId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        throw new Error('Failed to delete task');
      }
    } catch (err: any) {
      setTasks(prevTasks);
      setError('Could not delete task. Try again.');
    } finally {
      setSyncing(false);
    }
  };

  // Start Edit Mode
  const startEditing = (task: Task) => {
    setEditingTaskId(task.id);
    setEditTitle(task.title);
    setEditNotes(task.notes);
    setEditDue(task.due ? task.due.slice(0, 10) : '');
  };

  // Save Edit
  const handleSaveEdit = async (taskId: string) => {
    if (!editTitle.trim() || !token || !activeListId) return;

    setSyncing(true);
    const prevTasks = [...tasks];
    const updatedDue = editDue ? new Date(editDue).toISOString() : null;

    setTasks(tasks.map(t => t.id === taskId ? { 
      ...t, 
      title: editTitle, 
      notes: editNotes, 
      due: updatedDue 
    } : t));
    setEditingTaskId(null);

    try {
      const res = await fetch('/api/google/tasks', {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          listId: activeListId,
          taskId,
          title: editTitle,
          notes: editNotes,
          due: updatedDue,
        })
      });

      if (!res.ok) {
        throw new Error('Failed to update task');
      }

      const updated = await res.json();
      setTasks(prev => prev.map(t => t.id === taskId ? updated : t));
    } catch (err: any) {
      setTasks(prevTasks);
      setError('Could not save task changes.');
    } finally {
      setSyncing(false);
    }
  };

  // Reconnect Google Authentication Handler
  const handleConnect = () => {
    signIn('google');
  };

  // Loading Session
  if (sessionStatus === 'loading') {
    return (
      <div className="card card-section" style={{ minHeight: 380, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Loader2 size={32} className="animate-spin" color="var(--green)" style={{ animation: 'spin 1s linear infinite' }} />
      </div>
    );
  }

  // Not logged in to NextAuth / Google
  if (!session || !token || error === 'unauthenticated') {
    return (
      <div className="card card-section" style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center', 
        textAlign: 'center', 
        padding: '40px 24px', 
        minHeight: 380, 
        background: 'rgba(28, 28, 30, 0.4)',
        border: '1px solid var(--separator)',
        borderRadius: 'var(--radius-lg)'
      }}>
        <div style={{
          width: 56, height: 56, borderRadius: '50%', background: 'rgba(48,209,88,0.1)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18, color: 'var(--green)'
        }}>
          <ListTodo size={26} />
        </div>
        <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8, color: 'var(--label-primary)' }}>Google Tasks Integration</h3>
        <p style={{ fontSize: 13, color: 'var(--label-secondary)', maxWidth: 260, lineHeight: 1.5, marginBottom: 20 }}>
          Manage your personal and study tasks directly from your Google Tasks account.
        </p>
        <button 
          onClick={handleConnect}
          className="btn btn-primary"
          style={{ 
            background: 'var(--green)', 
            color: '#000', 
            fontWeight: 700, 
            padding: '10px 20px', 
            borderRadius: 'var(--radius-md)', 
            display: 'flex', 
            alignItems: 'center', 
            gap: 8,
            boxShadow: '0 8px 20px -6px rgba(48,209,88,0.3)',
          }}
        >
          Connect Google Tasks
        </button>
      </div>
    );
  }

  // Handle permission request issue
  if (error === 'permission_required') {
    return (
      <div className="card card-section" style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center', 
        textAlign: 'center', 
        padding: '40px 24px', 
        minHeight: 380, 
        background: 'rgba(28, 28, 30, 0.4)',
        border: '1px solid var(--separator)',
        borderRadius: 'var(--radius-lg)'
      }}>
        <div style={{
          width: 56, height: 56, borderRadius: '50%', background: 'rgba(255,159,10,0.1)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18, color: 'var(--amber)'
        }}>
          <AlertCircle size={26} />
        </div>
        <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8, color: 'var(--label-primary)' }}>Permission Required</h3>
        <p style={{ fontSize: 13, color: 'var(--label-secondary)', maxWidth: 260, lineHeight: 1.5, marginBottom: 20 }}>
          The integration needs read/write permissions to create and check off tasks. Please re-authenticate to grant access.
        </p>
        <button 
          onClick={handleConnect}
          className="btn btn-primary"
          style={{ 
            background: 'var(--amber)', 
            color: '#000', 
            fontWeight: 700, 
            padding: '10px 20px', 
            borderRadius: 'var(--radius-md)', 
            display: 'flex', 
            alignItems: 'center', 
            gap: 8,
          }}
        >
          Grant Permissions
        </button>
      </div>
    );
  }

  // Filter tasks based on select tab
  const filteredTasks = tasks.filter(t => {
    if (filter === 'pending') return t.status === 'needsAction';
    if (filter === 'completed') return t.status === 'completed';
    return true;
  });

  // Sort tasks: pending first, then by due date.
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (a.status !== b.status) {
      return a.status === 'needsAction' ? -1 : 1;
    }
    // Sort by due dates
    if (a.due && b.due) return new Date(a.due).getTime() - new Date(b.due).getTime();
    if (a.due) return -1;
    if (b.due) return 1;
    return new Date(b.updated).getTime() - new Date(a.updated).getTime();
  });

  return (
    <div className="card card-section" style={{ display: 'flex', flexDirection: 'column', minHeight: 380, gap: 16 }}>
      {/* Header Widget */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <ListTodo size={18} color="var(--green)" />
          <h2 style={{ fontSize: 16, fontWeight: 600, color: 'var(--label-primary)' }}>Google Tasks</h2>
          {syncing && <Loader2 size={12} className="animate-spin" color="var(--label-tertiary)" style={{ animation: 'spin 1.5s linear infinite' }} />}
        </div>
        
        {/* Dropdown list selector */}
        <div style={{ position: 'relative' }}>
          <button 
            onClick={() => setShowListsDropdown(!showListsDropdown)}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 4, 
              fontSize: 12, 
              fontWeight: 600, 
              color: 'var(--green)',
              background: 'rgba(48,209,88,0.1)',
              padding: '4px 10px',
              borderRadius: 20,
              cursor: 'pointer'
            }}
          >
            {listTitle || 'Select List'}
            <ChevronDown size={12} />
          </button>

          {showListsDropdown && (
            <div style={{ 
              position: 'absolute', 
              top: 'calc(100% + 6px)', 
              right: 0, 
              background: 'var(--bg-tertiary)', 
              border: '1px solid var(--separator)', 
              borderRadius: 'var(--radius-md)', 
              boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
              zIndex: 50,
              minWidth: 150,
              maxHeight: 200,
              overflowY: 'auto',
              padding: 4
            }}>
              {lists.map(list => (
                <button
                  key={list.id}
                  onClick={() => handleSelectList(list.id)}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    padding: '8px 12px',
                    fontSize: 12,
                    fontWeight: activeListId === list.id ? 700 : 500,
                    color: activeListId === list.id ? 'var(--green)' : 'var(--label-secondary)',
                    borderRadius: 'var(--radius-xs)',
                    background: activeListId === list.id ? 'rgba(48,209,88,0.08)' : 'transparent',
                    cursor: 'pointer'
                  }}
                >
                  {list.title}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Top action/filters bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
        {/* Filters */}
        <div style={{ display: 'flex', background: 'var(--bg-secondary)', padding: 2, borderRadius: 8 }}>
          {(['pending', 'completed', 'all'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              style={{
                fontSize: 11,
                fontWeight: 600,
                textTransform: 'capitalize',
                padding: '4px 10px',
                borderRadius: 6,
                color: filter === tab ? 'var(--label-primary)' : 'var(--label-tertiary)',
                background: filter === tab ? 'var(--bg-quaternary)' : 'transparent',
              }}
            >
              {tab === 'pending' ? 'Pending' : tab === 'completed' ? 'Completed' : 'All'}
            </button>
          ))}
        </div>

        {/* Action Button */}
        <button
          onClick={() => {
            setShowAddForm(!showAddForm);
            setEditingTaskId(null);
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            fontSize: 12,
            fontWeight: 600,
            color: 'var(--label-primary)',
            background: 'var(--bg-secondary)',
            border: '1px solid var(--separator)',
            padding: '5px 10px',
            borderRadius: 8,
            cursor: 'pointer'
          }}
        >
          {showAddForm ? <X size={14} /> : <Plus size={14} />}
          {showAddForm ? 'Cancel' : 'Add Task'}
        </button>
      </div>

      {/* Add Task Form */}
      {showAddForm && (
        <form onSubmit={handleAddTask} style={{ 
          background: 'var(--bg-secondary)', 
          border: '1px solid var(--separator)',
          borderRadius: 'var(--radius-md)', 
          padding: 14,
          display: 'flex',
          flexDirection: 'column',
          gap: 10
        }}>
          <input
            type="text"
            required
            placeholder="What needs to be done?"
            value={newTitle}
            onChange={e => setNewTitle(e.target.value)}
            style={{
              background: 'transparent',
              border: 'none',
              borderBottom: '1px solid var(--separator)',
              color: 'var(--label-primary)',
              fontSize: 13,
              fontWeight: 600,
              paddingBottom: 6,
              outline: 'none',
            }}
          />
          <input
            type="text"
            placeholder="Add notes..."
            value={newNotes}
            onChange={e => setNewNotes(e.target.value)}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--label-secondary)',
              fontSize: 12,
              outline: 'none',
            }}
          />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginTop: 4 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--label-tertiary)', fontSize: 11 }}>
              <Calendar size={12} />
              <input
                type="date"
                value={newDue}
                onChange={e => setNewDue(e.target.value)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--label-secondary)',
                  fontSize: 11,
                  outline: 'none',
                  colorScheme: 'dark'
                }}
              />
            </div>
            <button
              type="submit"
              disabled={!newTitle.trim()}
              style={{
                background: 'var(--green)',
                color: '#000',
                fontSize: 11,
                fontWeight: 700,
                padding: '4px 12px',
                borderRadius: 6,
                cursor: newTitle.trim() ? 'pointer' : 'not-allowed',
                opacity: newTitle.trim() ? 1 : 0.5
              }}
            >
              Create
            </button>
          </div>
        </form>
      )}

      {/* Task List container */}
      <div style={{ flex: 1, overflowY: 'auto', maxHeight: 300, display: 'flex', flexDirection: 'column', gap: 6 }}>
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '10px 0' }}>
            {[1, 2, 3].map(i => (
              <div key={i} style={{ height: 48, background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', opacity: 0.3, animation: 'pulse 1.5s infinite' }} />
            ))}
          </div>
        ) : sortedTasks.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '30px 10px', textAlign: 'center', color: 'var(--label-tertiary)' }}>
            <AppleEmoji emoji="🎉" size={32} style={{ marginBottom: 10 }} />
            <span style={{ fontSize: 13, fontWeight: 500 }}>No tasks here!</span>
          </div>
        ) : (
          sortedTasks.map(task => {
            const isEditing = editingTaskId === task.id;
            const isDone = task.status === 'completed';
            
            return (
              <div 
                key={task.id}
                style={{ 
                  display: 'flex', 
                  flexDirection: 'column',
                  gap: 6,
                  padding: '10px 12px', 
                  background: 'var(--bg-secondary)', 
                  border: '1px solid var(--separator)',
                  borderRadius: 'var(--radius-md)',
                  opacity: isDone ? 0.6 : 1,
                  transition: 'opacity 0.2s',
                  position: 'relative'
                }}
              >
                {isEditing ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <input
                      type="text"
                      value={editTitle}
                      onChange={e => setEditTitle(e.target.value)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        borderBottom: '1px solid var(--separator)',
                        color: 'var(--label-primary)',
                        fontSize: 13,
                        fontWeight: 600,
                        outline: 'none',
                        width: '100%',
                      }}
                    />
                    <textarea
                      value={editNotes}
                      placeholder="Task notes..."
                      onChange={e => setEditNotes(e.target.value)}
                      rows={2}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--label-secondary)',
                        fontSize: 12,
                        outline: 'none',
                        resize: 'none',
                        width: '100%',
                      }}
                    />
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
                      <input
                        type="date"
                        value={editDue}
                        onChange={e => setEditDue(e.target.value)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: 'var(--label-secondary)',
                          fontSize: 11,
                          outline: 'none',
                          colorScheme: 'dark'
                        }}
                      />
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button
                          onClick={() => setEditingTaskId(null)}
                          style={{
                            background: 'var(--bg-quaternary)',
                            color: 'var(--label-secondary)',
                            fontSize: 11,
                            fontWeight: 600,
                            padding: '4px 10px',
                            borderRadius: 6,
                          }}
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleSaveEdit(task.id)}
                          style={{
                            background: 'var(--green)',
                            color: '#000',
                            fontSize: 11,
                            fontWeight: 700,
                            padding: '4px 10px',
                            borderRadius: 6,
                          }}
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                    {/* Toggle button */}
                    <button 
                      onClick={() => handleToggleStatus(task)}
                      style={{ marginTop: 2, color: isDone ? 'var(--green)' : 'var(--label-tertiary)', flexShrink: 0, cursor: 'pointer' }}
                    >
                      {isDone ? (
                        <CheckCircle2 size={16} fill="var(--green)" fillOpacity={0.15} />
                      ) : (
                        <Circle size={16} />
                      )}
                    </button>

                    {/* Task Title & Meta details */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <span style={{ 
                        fontSize: 13, 
                        fontWeight: 600, 
                        color: 'var(--label-primary)',
                        textDecoration: isDone ? 'line-through' : 'none',
                        wordBreak: 'break-word'
                      }}>
                        {task.title}
                      </span>
                      {task.notes && (
                        <p style={{ 
                          fontSize: 11, 
                          color: 'var(--label-secondary)', 
                          marginTop: 2, 
                          whiteSpace: 'pre-wrap',
                          wordBreak: 'break-word'
                        }}>
                          {task.notes}
                        </p>
                      )}
                      {task.due && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, color: 'var(--label-tertiary)', marginTop: 4 }}>
                          <Calendar size={10} />
                          <span>Due: {new Date(task.due).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                        </div>
                      )}
                    </div>

                    {/* Actions bar (Edit, Delete) */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 2, opacity: 0.6, flexShrink: 0 }}>
                      <button 
                        onClick={() => startEditing(task)}
                        style={{ padding: 4, borderRadius: 4, color: 'var(--label-secondary)' }}
                        title="Edit Task"
                      >
                        <Edit2 size={12} />
                      </button>
                      <button 
                        onClick={() => handleDeleteTask(task.id)}
                        style={{ padding: 4, borderRadius: 4, color: 'var(--red)' }}
                        title="Delete Task"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Footer / Error boundary */}
      {error && error !== 'unauthenticated' && error !== 'permission_required' && (
        <div style={{ 
          background: 'var(--red-fill)', 
          border: '1px solid var(--red)', 
          color: 'var(--red)', 
          fontSize: 11, 
          padding: '8px 10px', 
          borderRadius: 8, 
          display: 'flex', 
          alignItems: 'center', 
          gap: 6 
        }}>
          <AlertCircle size={12} />
          <span style={{ flex: 1 }}>{error}</span>
          <button onClick={() => setError(null)} style={{ color: 'var(--red)' }}>
            <X size={12} />
          </button>
        </div>
      )}
    </div>
  );
}
