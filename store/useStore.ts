'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { initialSyllabus, Chapter, MasteryLevel } from '@/lib/syllabus';

// ── Types ────────────────────────────────────────────────────────
export interface StudySession {
  id: string;
  date: string; // ISO yyyy-mm-dd
  subject: 'physics' | 'chemistry' | 'maths' | 'general';
  chapterId?: string;
  taskId?: string;
  durationMinutes: number;
  startedAt: string; // ISO timestamp
}

export interface MockTest {
  id: string;
  name: string;
  date: string;
  physics: number;
  chemistry: number;
  maths: number;
  totalScore: number;
  predictedPercentile: number;
}

export interface MockTargets {
  score: number;
  percentile: number;
  physics: number;
  chemistry: number;
  maths: number;
}

export type ErrorType = 'concept' | 'silly' | 'time' | 'unknown';

export interface Mistake {
  id: string;
  date: string;
  subject: 'physics' | 'chemistry' | 'maths';
  chapter: string;
  question: string;
  errorType: ErrorType;
  understood: boolean;
  resolution?: string;
}

export interface Doubt {
  id: string;
  date: string;
  subject: 'physics' | 'chemistry' | 'maths';
  chapter: string;
  description: string;
  status: 'unresolved' | 'in-progress' | 'cleared';
  resolution?: string;
}

export interface Note {
  id: string;
  subject: 'physics' | 'chemistry' | 'maths';
  chapterId: string;
  chapterName: string;
  content: string;
  updatedAt: string;
}

export interface RevisionItem {
  id: string;
  chapterId: string;
  subject: 'physics' | 'chemistry' | 'maths';
  title: string;
  createdAt: string; // ISO timestamp
  stage: number; // 0 = Not started, 1 = Day 1 done, 2 = Day 3 done, 3 = Day 7 done, 4 = Day 21 done
  nextRevisionDate: string; // ISO date yyyy-mm-dd
}

export type Priority = 'high' | 'medium' | 'low';
export type TaskStatus = 'todo' | 'done';

export interface TodoTask {
  id: string;
  title: string;
  subject: 'physics' | 'chemistry' | 'maths' | 'general';
  priority: Priority;
  status: TaskStatus;
  dueDate: string; // ISO date
  chapterId?: string;
  createdAt: string;
}

export interface WeeklyGoal {
  id: string;
  title: string;
  completed: boolean;
  createdAt: string;
}

export interface DailyLog {
  date: string;
  minutesStudied: number;
  goalMet: boolean;
}

export interface ChatThread {
  id: string;
  title: string;
  messages: { role: 'user' | 'model'; content: string }[];
  updatedAt: string;
}

// ── Life OS Types ────────────────────────────────────────────────
export interface LifeHabit {
  id: string;
  label: string;
  icon: string;
  done: boolean;
  date: string; // YYYY-MM-DD
}

export interface JournalEntry {
  id: string;
  date: string; // YYYY-MM-DD
  mood: string; // emoji
  what: string;
  wins: string;
  failures: string;
  notes: string;
}

export interface LifeGoal {
  id: string;
  title: string;
  category: 'academic' | 'financial' | 'personal' | 'longterm';
  targetDate: string;
  progress: number; // 0-100
  notes: string;
  createdAt: string;
}

export interface RpgAchievement {
  id: string;
  title: string;
  emoji: string;
  unlocked: boolean;
  unlockedAt?: string;
}

export interface RpgQuest {
  id: string;
  title: string;
  xpReward: number;
  done: boolean;
}

export interface BrainNote {
  id: string;
  title: string;
  content: string;
  tag: 'thought' | 'business' | 'app' | 'youtube' | 'book' | 'lesson' | 'idea';
  subCategory: 'business' | 'app' | 'content' | 'thought';
  potential: number;   // 1-10
  difficulty: number;  // 1-10
  interest: number;    // 1-10
  tags: string[];      // free-form tags
  pinned: boolean;
  createdAt: string;
  evolutionLog: { date: string; note: string }[];
}

export interface RelationshipMemory { date: string; note: string; }
export interface RelationshipConvoLog { date: string; note: string; }
export interface RelationshipDate { label: string; date: string; }
export interface RelationshipDriveFile { id: string; name: string; url: string; mimeType: string; date: string; }

export interface Relationship {
  id: string;
  name: string;
  nickname: string;
  type: 'friend' | 'family' | 'crush' | 'mentor' | 'other' | 'teacher';
  profilePicUrl?: string;
  birthday?: string;
  phone: string;
  instagram: string;
  location: string;
  notes: string;
  likes: string;
  dislikes: string;
  favFood: string;
  giftIdeas: string;
  interactionCount: number;
  lastContact?: string;
  memories: RelationshipMemory[];
  conversationLog: RelationshipConvoLog[];
  importantDates: RelationshipDate[];
  driveFiles?: RelationshipDriveFile[];
}

export interface MoneyEntry {
  id: string;
  type: 'income' | 'expense' | 'saving';
  amount: number;
  category: string;
  note: string;
  date: string;
}

export interface SavingsGoal {
  id: string;
  title: string;
  emoji: string;
  target: number;
  current: number;
}

export interface WishlistItem {
  id: string;
  title: string;
  priority: 'immediate' | 'longterm';
  done: boolean;
}

export interface DreamCard {
  id: string;
  category: 'country' | 'house' | 'car' | 'career' | 'business' | 'lifestyle';
  title: string;
  description: string;
  emoji: string;
  progress: number;       // 0-100
  targetYear: string;
  estimatedCost: string;
  why: string;
}

export interface FutureLetter {
  id: string;
  title: string;
  content: string;
  unlockDate: string;
  createdAt: string;
}

export interface LifeAnalyticsLog {
  date: string;
  sleep: number;
  weight: number;
  exercise: number; // minutes
  booksRead: number;
  moneySaved: number;
  mood: number;        // 1-5
  productivity: number; // 1-10
}

export interface HealthLog {
  id: string;
  date: string;
  type: 'sick' | 'hospital' | 'medication';
  notes: string;
  severity: 1 | 2 | 3 | 4 | 5;
}


export interface SelfAnalysisData {
  identity: string;
  values: string;
  strengths: string;
  weaknesses: string;
  fears: string;
  givesEnergy: string;
  drainsEnergy: string;
  whatIsSuccess: string;
  wantToBecome: string;
  principles: string;
  discipline: number;    // 1-10
  confidence: number;
  communication: number;
  empathy: number;
  yearlyReflections: { year: number; changed: string; mistake: string; lesson: string; proud: string }[];
}

// ── Store ────────────────────────────────────────────────────────
interface StoreState {
  // Syllabus
  chapters: Chapter[];
  updateMastery: (chapterId: string, level: MasteryLevel) => void;
  toggleTopic: (chapterId: string, topicId: string) => void;

  // Sessions & Timer
  sessions: StudySession[];
  addSession: (session: StudySession) => void;
  removeSession: (id: string) => void;

  // Weekly Goals
  weeklyGoals: WeeklyGoal[];
  addWeeklyGoal: (goal: WeeklyGoal) => void;
  updateWeeklyGoal: (id: string, updates: Partial<WeeklyGoal>) => void;
  removeWeeklyGoal: (id: string) => void;

  // Sync / Resets
  mockTests: MockTest[];
  mockTargets: MockTargets;
  addMockTest: (test: MockTest) => void;
  removeMockTest: (id: string) => void;
  setMockTargets: (targets: MockTargets) => void;

  // Mistakes
  mistakes: Mistake[];
  addMistake: (m: Mistake) => void;
  updateMistake: (id: string, updates: Partial<Mistake>) => void;
  removeMistake: (id: string) => void;

  // Doubts
  doubts: Doubt[];
  addDoubt: (d: Doubt) => void;
  updateDoubt: (id: string, updates: Partial<Doubt>) => void;
  removeDoubt: (id: string) => void;

  // Notes
  notes: Note[];
  upsertNote: (note: Note) => void;
  removeNote: (id: string) => void;

  // PYQ Checklist
  pyqProgress: Record<string, Record<string, boolean>>; // chapterId -> bucketKey -> done
  togglePYQBucket: (chapterId: string, bucketKey: string) => void;

  // Revision Tool
  revisions: RevisionItem[];
  addRevision: (rev: RevisionItem) => void;
  advanceRevision: (id: string) => void;
  removeRevision: (id: string) => void;

  // Planner (Todos)
  tasks: TodoTask[];
  addTask: (task: TodoTask) => void;
  updateTask: (id: string, updates: Partial<TodoTask>) => void;
  removeTask: (id: string) => void;

  // Daily goal
  dailyGoalMinutes: number;
  setDailyGoal: (mins: number) => void;

  // Streak helpers
  getStudyDates: () => Record<string, number>; // date → minutes
  getTodayMinutes: () => number;
  getCurrentStreak: () => number;
  getLongestStreak: () => number;

  // Firebase Sync
  firebaseUser: any | null;
  setFirebaseUser: (user: any | null) => void;
  _hasHydrated: boolean;
  setHasHydrated: (h: boolean) => void;
  replaceStoreData: (data: Partial<StoreState>) => void;

  // AI Chat History
  chatThreads: ChatThread[];
  activeThreadId: string | null;
  createNewChat: () => void;
  switchChat: (id: string) => void;
  addMessageToActiveChat: (msg: { role: 'user' | 'model'; content: string }) => void;
  deleteChat: (id: string) => void;
  aiProvider: 'gemini' | 'groq' | 'mistral' | 'cerebras' | 'openrouter';
  setAiProvider: (provider: 'gemini' | 'groq' | 'mistral' | 'cerebras' | 'openrouter') => void;

  // ── Life OS ──────────────────────────────────────────────────
  // Habits
  lifeHabits: LifeHabit[];
  toggleHabit: (id: string, date: string) => void;

  // Journal
  journalEntries: JournalEntry[];
  upsertJournalEntry: (entry: JournalEntry) => void;
  removeJournalEntry: (id: string) => void;

  // Health
  healthLogs: HealthLog[];
  addHealthLog: (log: HealthLog) => void;
  removeHealthLog: (id: string) => void;

  // Goals
  lifeGoals: LifeGoal[];
  addLifeGoal: (goal: LifeGoal) => void;
  updateLifeGoal: (id: string, updates: Partial<LifeGoal>) => void;
  removeLifeGoal: (id: string) => void;

  // RPG
  rpgLevel: number;
  rpgXp: number;
  rpgXpToNext: number;
  rpgAchievements: RpgAchievement[];
  rpgQuests: RpgQuest[];
  addRpgXp: (amount: number) => void;
  unlockAchievement: (id: string) => void;
  addRpgQuest: (quest: RpgQuest) => void;
  completeRpgQuest: (id: string) => void;

  // Second Brain
  brainNotes: BrainNote[];
  addBrainNote: (note: BrainNote) => void;
  updateBrainNote: (id: string, updates: Partial<BrainNote>) => void;
  removeBrainNote: (id: string) => void;

  // Relationships
  relationships: Relationship[];
  addRelationship: (r: Relationship) => void;
  updateRelationship: (id: string, updates: Partial<Relationship>) => void;
  removeRelationship: (id: string) => void;

  // Money
  moneyEntries: MoneyEntry[];
  addMoneyEntry: (entry: MoneyEntry) => void;
  removeMoneyEntry: (id: string) => void;
  savingsGoals: SavingsGoal[];
  addSavingsGoal: (g: SavingsGoal) => void;
  updateSavingsGoal: (id: string, updates: Partial<SavingsGoal>) => void;
  removeSavingsGoal: (id: string) => void;
  wishlistItems: WishlistItem[];
  addWishlistItem: (item: WishlistItem) => void;
  toggleWishlistDone: (id: string) => void;
  removeWishlistItem: (id: string) => void;

  // Dreams
  dreamCards: DreamCard[];
  addDreamCard: (card: DreamCard) => void;
  updateDreamCard: (id: string, updates: Partial<DreamCard>) => void;
  removeDreamCard: (id: string) => void;

  // Future Letters
  futureLetters: FutureLetter[];
  addFutureLetter: (letter: FutureLetter) => void;
  removeFutureLetter: (id: string) => void;

  // Analytics
  lifeAnalytics: LifeAnalyticsLog[];
  upsertLifeAnalytics: (log: LifeAnalyticsLog) => void;

  // Self Analysis
  selfAnalysis: SelfAnalysisData;
  updateSelfAnalysis: (data: Partial<SelfAnalysisData>) => void;

  // Today's focus
  todayFocus: string;
  setTodayFocus: (focus: string) => void;

  // Custom Photo Memories
  customMemories: string[];
  addCustomMemory: (base64: string) => void;
  removeCustomMemory: (index: number) => void;
}

const todayStr = () => new Date().toISOString().slice(0, 10);

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      firebaseUser: null,
      setFirebaseUser: (user) => set({ firebaseUser: user }),

      // ── Syllabus ──────────────────────────
      chapters: initialSyllabus,
      updateMastery: (chapterId, level) =>
        set((s) => {
          let newRevisions = s.revisions;
          if (level === 'mastered') {
            const chapter = s.chapters.find(c => c.id === chapterId);
            const alreadyInRevision = s.revisions.some(r => r.chapterId === chapterId && r.stage < 4);
            if (chapter && !alreadyInRevision) {
              newRevisions = [{
                id: Math.random().toString(36).substring(7),
                chapterId: chapter.id,
                subject: chapter.subject as any,
                title: chapter.name,
                createdAt: todayStr(),
                stage: 0,
                nextRevisionDate: todayStr()
              }, ...s.revisions];
            }
          }
          return {
            chapters: s.chapters.map((c) =>
              c.id === chapterId ? { ...c, mastery: level } : c
            ),
            revisions: newRevisions
          };
        }),
      toggleTopic: (chapterId, topicId) =>
        set((s) => {
          let newRevisions = s.revisions;
          const chapters = s.chapters.map((c) => {
            if (c.id === chapterId) {
              const updatedTopics = c.topics.map((t) =>
                t.id === topicId ? { ...t, done: !t.done } : t
              );
              
              const doneCount = updatedTopics.filter(t => t.done).length;
              // 4 out of 7 topics completed is considered "mastered"
              const isMastered = doneCount >= 4;
              const newMastery = isMastered ? 'mastered' : c.mastery;
              
              if (isMastered && c.mastery !== 'mastered') {
                const alreadyInRevision = s.revisions.some(r => r.chapterId === chapterId && r.stage < 4);
                if (!alreadyInRevision) {
                  newRevisions = [{
                    id: Math.random().toString(36).substring(7),
                    chapterId: c.id,
                    subject: c.subject as any,
                    title: c.name,
                    createdAt: todayStr(),
                    stage: 0,
                    nextRevisionDate: todayStr()
                  }, ...s.revisions];
                }
              }
              
              return { ...c, topics: updatedTopics, mastery: newMastery as any };
            }
            return c;
          });
          return { chapters, revisions: newRevisions };
        }),


      // ── Sessions ──────────────────────────
      sessions: [],
      addSession: (session) =>
        set((s) => ({ sessions: [session, ...s.sessions] })),
      removeSession: (id) =>
        set((s) => ({ sessions: s.sessions.filter((x) => x.id !== id) })),

      // --- Weekly Goals ---
      weeklyGoals: [],
      addWeeklyGoal: (g) => set((state) => ({ weeklyGoals: [...state.weeklyGoals, g] })),
      updateWeeklyGoal: (id, updates) => set((state) => ({
        weeklyGoals: state.weeklyGoals.map((g) => (g.id === id ? { ...g, ...updates } : g)),
      })),
      removeWeeklyGoal: (id) => set((state) => ({
        weeklyGoals: state.weeklyGoals.filter((g) => g.id !== id),
      })),

      // --- Sync / Reset ---s ────────────────────────
      mockTests: [],
      mockTargets: { score: 0, percentile: 0, physics: 0, chemistry: 0, maths: 0 },
      addMockTest: (test) =>
        set((s) => ({ mockTests: [...s.mockTests, test] })),
      removeMockTest: (id) =>
        set((s) => ({ mockTests: s.mockTests.filter((x) => x.id !== id) })),
      setMockTargets: (targets) => set({ mockTargets: targets }),

      // ── Mistakes ──────────────────────────
      mistakes: [],
      addMistake: (m) => set((s) => ({ mistakes: [m, ...s.mistakes] })),
      updateMistake: (id, updates) =>
        set((s) => ({
          mistakes: s.mistakes.map((x) =>
            x.id === id ? { ...x, ...updates } : x
          ),
        })),
      removeMistake: (id) =>
        set((s) => ({ mistakes: s.mistakes.filter((x) => x.id !== id) })),

      // ── Doubts ────────────────────────────
      doubts: [],
      addDoubt: (d) => set((s) => ({ doubts: [d, ...s.doubts] })),
      updateDoubt: (id, updates) =>
        set((s) => ({
          doubts: s.doubts.map((x) =>
            x.id === id ? { ...x, ...updates } : x
          ),
        })),
      removeDoubt: (id) =>
        set((s) => ({ doubts: s.doubts.filter((x) => x.id !== id) })),

      // ── Notes ─────────────────────────────
      notes: [],
      upsertNote: (note) =>
        set((s) => {
          const exists = s.notes.find((n) => n.id === note.id);
          if (exists) {
            return {
              notes: s.notes.map((n) =>
                n.id === note.id ? { ...n, ...note } : n
              ),
            };
          }
          return { notes: [note, ...s.notes] };
        }),
      removeNote: (id) =>
        set((s) => ({ notes: s.notes.filter((n) => n.id !== id) })),

      // ── PYQ ───────────────────────────────
      pyqProgress: {},
      togglePYQBucket: (chapterId, bucketKey) =>
        set((s) => {
          const chap = s.pyqProgress[chapterId] || {};
          const isDone = chap[bucketKey];
          return {
            pyqProgress: {
              ...s.pyqProgress,
              [chapterId]: {
                ...chap,
                [bucketKey]: !isDone,
              }
            }
          };
        }),

      // ── Revision Tool ─────────────────────
      revisions: [],
      addRevision: (rev) => set((s) => ({ revisions: [rev, ...s.revisions] })),
      advanceRevision: (id) =>
        set((s) => {
          const intervals = [1, 3, 7, 21]; // Days to add for stage 0->1, 1->2, 2->3, 3->4
          return {
            revisions: s.revisions.map((rev) => {
              if (rev.id === id && rev.stage < 4) {
                const nextStage = rev.stage + 1;
                let nextDate = rev.nextRevisionDate;
                if (nextStage <= 4) {
                  const daysToAdd = intervals[nextStage - 1] || 21;
                  const dateObj = new Date(); // use today as baseline for next review
                  dateObj.setDate(dateObj.getDate() + daysToAdd);
                  nextDate = dateObj.toISOString().slice(0, 10);
                }
                return { ...rev, stage: nextStage, nextRevisionDate: nextDate };
              }
              return rev;
            }),
          };
        }),
      removeRevision: (id) =>
        set((s) => ({ revisions: s.revisions.filter((r) => r.id !== id) })),

      // ── Planner (Todos) ────────────────────
      tasks: [],
      addTask: (task) => set((s) => ({ tasks: [task, ...s.tasks] })),
      updateTask: (id, updates) =>
        set((s) => ({
          tasks: s.tasks.map((x) => (x.id === id ? { ...x, ...updates } : x)),
        })),
      removeTask: (id) =>
        set((s) => ({ tasks: s.tasks.filter((x) => x.id !== id) })),

      // ── Goals ─────────────────────────────
      dailyGoalMinutes: 360,
      setDailyGoal: (mins) => set({ dailyGoalMinutes: mins }),

      // ── Computed ──────────────────────────
      getStudyDates: () => {
        const map: Record<string, number> = {};
        get().sessions.forEach((s) => {
          map[s.date] = (map[s.date] || 0) + s.durationMinutes;
        });
        return map;
      },
      getTodayMinutes: () => {
        const today = todayStr();
        return get()
          .sessions.filter((s) => s.date === today)
          .reduce((acc, s) => acc + s.durationMinutes, 0);
      },
      getCurrentStreak: () => {
        const dates = get().getStudyDates();
        const goal = get().dailyGoalMinutes;
        let streak = 0;
        const d = new Date();
        // Check today first, then go backwards
        while (true) {
          const key = d.toISOString().slice(0, 10);
          if (dates[key] && dates[key] >= goal) {
            streak++;
            d.setDate(d.getDate() - 1);
          } else {
            // Allow today to be partial
            if (key === todayStr() && dates[key] && dates[key] > 0) {
              streak++;
              d.setDate(d.getDate() - 1);
              continue;
            }
            break;
          }
        }
        return streak;
      },
      getLongestStreak: () => {
        const dates = get().getStudyDates();
        const sorted = Object.keys(dates).sort();
        let longest = 0;
        let current = 0;
        let prev: Date | null = null;
        for (const d of sorted) {
          const cur = new Date(d);
          if (prev) {
            const diff = (cur.getTime() - prev.getTime()) / 86400000;
            if (diff === 1) {
              current++;
            } else {
              current = 1;
            }
          } else {
            current = 1;
          }
          if (current > longest) longest = current;
          prev = cur;
        }
        return longest;
      },

      // ── Hydration & Sync ────────────────
      _hasHydrated: false,
      setHasHydrated: (h) => set({ _hasHydrated: h }),
      replaceStoreData: (data) => set((state) => ({ ...state, ...data })),

      // ── AI Chat History & Settings ───────
      chatThreads: [],
      activeThreadId: null,
      createNewChat: () => set((s) => {
        const id = Math.random().toString(36).substring(7);
        return {
          chatThreads: [{ id, title: 'New Chat', messages: [], updatedAt: new Date().toISOString() }, ...s.chatThreads],
          activeThreadId: id
        };
      }),
      switchChat: (id) => set({ activeThreadId: id }),
      addMessageToActiveChat: (msg) => set((s) => {
        let threads = [...s.chatThreads];
        let activeId = s.activeThreadId;
        
        // If no active thread or threads array is empty, create one
        if (!activeId || threads.length === 0) {
          activeId = Math.random().toString(36).substring(7);
          const title = msg.role === 'user' ? msg.content.substring(0, 25) : 'New Chat';
          threads = [{ id: activeId, title, messages: [msg], updatedAt: new Date().toISOString() }, ...threads];
          return { chatThreads: threads, activeThreadId: activeId };
        }
        
        // Find and update active thread
        const threadIndex = threads.findIndex(t => t.id === activeId);
        if (threadIndex >= 0) {
          const thread = threads[threadIndex];
          // Update title if it's the very first user message
          let title = thread.title;
          if (thread.messages.length === 0 && msg.role === 'user') {
             title = msg.content.substring(0, 25);
          }
          threads[threadIndex] = {
            ...thread,
            title,
            messages: [...thread.messages, msg],
            updatedAt: new Date().toISOString()
          };
          
          // Sort to put the latest updated thread at the top
          threads.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
        }
        return { chatThreads: threads };
      }),
      deleteChat: (id) => set((s) => {
        const newThreads = s.chatThreads.filter(t => t.id !== id);
        return {
          chatThreads: newThreads,
          activeThreadId: s.activeThreadId === id ? (newThreads[0]?.id || null) : s.activeThreadId
        };
      }),
      aiProvider: 'gemini',
      setAiProvider: (p) => set({ aiProvider: p }),

      // ── Life OS Implementations ────────────────────────────────
      // Today's focus
      todayFocus: '',
      setTodayFocus: (focus) => set({ todayFocus: focus }),

      // Custom Photo Memories
      customMemories: [],
      addCustomMemory: (base64) => set((state) => ({ customMemories: [base64, ...state.customMemories] })),
      removeCustomMemory: (index) => set((state) => ({ customMemories: state.customMemories.filter((_, i) => i !== index) })),

      // Health
      healthLogs: [],
      addHealthLog: (log) => set((state) => ({ healthLogs: [...state.healthLogs, log] })),
      removeHealthLog: (id) => set((state) => ({ healthLogs: state.healthLogs.filter(l => l.id !== id) })),

      lifeHabits: [
        { id: 'water', label: 'Drink 2L Water', icon: '💧', done: false, date: '' },
        { id: 'exercise', label: '15min Exercise', icon: '🏃', done: false, date: '' },
        { id: 'sleep', label: '7+ Hours Sleep', icon: '💤', done: false, date: '' },
        { id: 'reading', label: 'Read 10 Pages', icon: '📖', done: false, date: '' },
        { id: 'gratitude', label: 'Gratitude Note', icon: '🙏', done: false, date: '' },
      ],
      toggleHabit: (id, date) => set((s) => ({
        lifeHabits: s.lifeHabits.map(h =>
          h.id === id ? { ...h, done: !h.done, date } : h
        )
      })),

      journalEntries: [],
      upsertJournalEntry: (entry) => set((s) => {
        const existing = s.journalEntries.findIndex(e => e.id === entry.id);
        if (existing >= 0) {
          const updated = [...s.journalEntries];
          updated[existing] = entry;
          return { journalEntries: updated };
        }
        return { journalEntries: [entry, ...s.journalEntries] };
      }),
      removeJournalEntry: (id) => set((s) => ({ journalEntries: s.journalEntries.filter(e => e.id !== id) })),

      lifeGoals: [],
      addLifeGoal: (goal) => set((s) => ({ lifeGoals: [goal, ...s.lifeGoals] })),
      updateLifeGoal: (id, updates) => set((s) => ({ lifeGoals: s.lifeGoals.map(g => g.id === id ? { ...g, ...updates } : g) })),
      removeLifeGoal: (id) => set((s) => ({ lifeGoals: s.lifeGoals.filter(g => g.id !== id) })),

      rpgLevel: 1,
      rpgXp: 0,
      rpgXpToNext: 1000,
      rpgAchievements: [
        { id: 'first-website', title: 'First Website', emoji: '🌐', unlocked: false },
        { id: 'first-code', title: 'First Code', emoji: '💻', unlocked: false },
        { id: 'first-income', title: 'First Income', emoji: '💰', unlocked: false },
        { id: 'study-streak-7', title: '7-Day Streak', emoji: '🔥', unlocked: false },
        { id: 'study-streak-30', title: '30-Day Streak', emoji: '⚡', unlocked: false },
        { id: 'study-streak-100', title: '100-Day Streak', emoji: '🏆', unlocked: false },
        { id: 'first-mock-test', title: 'First Mock Test', emoji: '📝', unlocked: false },
        { id: 'all-nighter', title: 'All-Nighter', emoji: '🌙', unlocked: false },
        { id: 'board-topper', title: 'Board Topper', emoji: '🎓', unlocked: false },
        { id: 'jee-qualified', title: 'JEE Qualified', emoji: '🚀', unlocked: false },
      ],
      rpgQuests: [],
      addRpgXp: (amount) => set((s) => {
        const newXp = s.rpgXp + amount;
        if (newXp >= s.rpgXpToNext) {
          return { rpgLevel: s.rpgLevel + 1, rpgXp: newXp - s.rpgXpToNext, rpgXpToNext: Math.floor(s.rpgXpToNext * 1.5) };
        }
        return { rpgXp: newXp };
      }),
      unlockAchievement: (id) => set((s) => ({
        rpgAchievements: s.rpgAchievements.map(a => a.id === id ? { ...a, unlocked: true, unlockedAt: new Date().toISOString() } : a)
      })),
      addRpgQuest: (quest) => set((s) => ({ rpgQuests: [quest, ...s.rpgQuests] })),
      completeRpgQuest: (id) => set((s) => ({
        rpgQuests: s.rpgQuests.map(q => q.id === id ? { ...q, done: true } : q),
        rpgXp: s.rpgXp + (s.rpgQuests.find(q => q.id === id)?.xpReward || 0)
      })),

      brainNotes: [],
      addBrainNote: (note) => set((s) => ({ brainNotes: [note, ...s.brainNotes] })),
      updateBrainNote: (id, updates) => set((s) => ({ brainNotes: s.brainNotes.map(n => n.id === id ? { ...n, ...updates } : n) })),
      removeBrainNote: (id) => set((s) => ({ brainNotes: s.brainNotes.filter(n => n.id !== id) })),

      relationships: [],
      addRelationship: (r) => set((s) => ({ relationships: [r, ...s.relationships] })),
      updateRelationship: (id, updates) => set((s) => ({ relationships: s.relationships.map(r => r.id === id ? { ...r, ...updates } : r) })),
      removeRelationship: (id) => set((s) => ({ relationships: s.relationships.filter(r => r.id !== id) })),

      moneyEntries: [],
      addMoneyEntry: (entry) => set((s) => ({ moneyEntries: [entry, ...s.moneyEntries] })),
      removeMoneyEntry: (id) => set((s) => ({ moneyEntries: s.moneyEntries.filter(e => e.id !== id) })),
      savingsGoals: [],
      addSavingsGoal: (g) => set((s) => ({ savingsGoals: [g, ...s.savingsGoals] })),
      updateSavingsGoal: (id, updates) => set((s) => ({ savingsGoals: s.savingsGoals.map(g => g.id === id ? { ...g, ...updates } : g) })),
      removeSavingsGoal: (id) => set((s) => ({ savingsGoals: s.savingsGoals.filter(g => g.id !== id) })),
      wishlistItems: [],
      addWishlistItem: (item) => set((s) => ({ wishlistItems: [item, ...s.wishlistItems] })),
      toggleWishlistDone: (id) => set((s) => ({ wishlistItems: s.wishlistItems.map(i => i.id === id ? { ...i, done: !i.done } : i) })),
      removeWishlistItem: (id) => set((s) => ({ wishlistItems: s.wishlistItems.filter(i => i.id !== id) })),

      dreamCards: [
        { id: '1', category: 'country', title: 'Japan', description: 'Cherry blossoms in Kyoto', emoji: '🗾', progress: 10, targetYear: '2028', estimatedCost: '₹2,00,000', why: 'Culture, food, and beauty.' },
        { id: '2', category: 'career', title: 'Tech Founder', description: 'Build a product used by millions', emoji: '🚀', progress: 20, targetYear: '2030', estimatedCost: 'Sweat equity', why: 'Create impact and freedom.' },
        { id: '3', category: 'house', title: 'Penthouse', description: 'City skyline view, minimalist design', emoji: '🏙️', progress: 5, targetYear: '2035', estimatedCost: '₹2 Crore', why: 'A place to call my own.' },
      ],
      addDreamCard: (card) => set((s) => ({ dreamCards: [card, ...s.dreamCards] })),
      updateDreamCard: (id, updates) => set((s) => ({ dreamCards: s.dreamCards.map(c => c.id === id ? { ...c, ...updates } : c) })),
      removeDreamCard: (id) => set((s) => ({ dreamCards: s.dreamCards.filter(c => c.id !== id) })),

      futureLetters: [],
      addFutureLetter: (letter) => set((s) => ({ futureLetters: [letter, ...s.futureLetters] })),
      removeFutureLetter: (id) => set((s) => ({ futureLetters: s.futureLetters.filter(l => l.id !== id) })),

      lifeAnalytics: [],
      upsertLifeAnalytics: (log) => set((s) => {
        const existing = s.lifeAnalytics.findIndex(l => l.date === log.date);
        if (existing >= 0) {
          const updated = [...s.lifeAnalytics];
          updated[existing] = log;
          return { lifeAnalytics: updated };
        }
        return { lifeAnalytics: [log, ...s.lifeAnalytics] };
      }),

      selfAnalysis: {
        identity: '', values: '', strengths: '', weaknesses: '', fears: '',
        givesEnergy: '', drainsEnergy: '', whatIsSuccess: '', wantToBecome: '',
        principles: '', discipline: 5, confidence: 5, communication: 5, empathy: 5,
        yearlyReflections: []
      },
      updateSelfAnalysis: (data) => set((s) => ({ selfAnalysis: { ...s.selfAnalysis, ...data } })),
    }),
    {
      name: 'jee-tracker-storage',
      version: 13,
      migrate: (persistedState: any, version: number) => {
        let state = persistedState;
        if (version < 9) {
          const oldChapters = state.chapters || [];
          
          // Helper to find matching old chapter
          const findMatchingOld = (newCh: any) => {
            const normalize = (str: string) => str.toLowerCase().replace(/[^a-z0-9]/g, '');
            let matching = oldChapters.find(
              (oldCh: any) => normalize(oldCh.name) === normalize(newCh.name) || oldCh.id === newCh.id
            );
            
            if (!matching) {
              const overrides: Record<string, string> = {
                'physics-com': 'system of particles and rotational motion',
                'physics-rotation': 'system of particles and rotational motion',
                'physics-nlm': 'laws of motion',
                'physics-wpe': 'work, energy, and power',
                'physics-electrostatics': 'electrostatics',
                'physics-shm': 'oscillations (shm)',
                'physics-semiconductors': 'electronic devices',
                'physics-fluids': 'mechanical properties of solids & fluids',
                'physics-units-dimensions': 'units and measurements',
                'chemistry-chemical-bonding': 'chemical bonding and molecular structure',
                'chemistry-periodic-table': 'classification of elements and periodicity',
                'chemistry-mole-concept': 'some basic concepts of chemistry',
                'chemistry-equilibrium': 'chemical and ionic equilibrium',
                'chemistry-thermodynamics': 'chemical thermodynamics',
                'chemistry-goc': 'general organic chemistry (goc)',
                'chemistry-haloalkanes-haloarenes': 'haloalkanes and htmlarenes',
                'chemistry-alcohols-phenols-ethers': 'alcohols, phenols, and ethers',
                'chemistry-aldehydes-ketones': 'aldehydes and ketones',
                'chemistry-d-block': 'd and f block elements',
                'chemistry-f-block': 'd and f block elements',
                'maths-trigonometry': 'trigonometric ratios & identities',
                'maths-inverse-trig': 'inverse trigonometric functions',
                'maths-quadratic': 'quadratic equation',
                'maths-complex-numbers': 'complex number',
                'maths-sequence-series': 'sequences and series',
                'maths-permutation-combination': 'permutation combination',
                'maths-binomial': 'binomial theorem',
                'maths-continuity': 'continuity and differentiability',
                'maths-differentiability': 'continuity and differentiability',
                'maths-aod': 'application of derivatives',
                'maths-area-under-curve': 'area under curves',
                'maths-straight-line': 'straight lines',
                'maths-sets': 'sets and relations',
                'maths-relations': 'sets and relations',
                'maths-vectors': 'vector algebra',
                'maths-3d-geometry': 'three-dimensional geometry'
              };
              
              const oldNameTarget = overrides[newCh.id];
              if (oldNameTarget) {
                matching = oldChapters.find(
                  (oldCh: any) => normalize(oldCh.name) === normalize(oldNameTarget)
                );
              }
            }
            return matching;
          };

          // 1. Migrate chapters progress
          const migratedChapters = initialSyllabus.map((newCh) => {
            const matchingOld = findMatchingOld(newCh);
            if (matchingOld) {
              const mastery = matchingOld.mastery || 'not-started';
              const normalize = (str: string) => str.toLowerCase().replace(/[^a-z0-9]/g, '');
              const topics = newCh.topics.map((newT: any, idx: number) => {
                const oldT = matchingOld.topics?.find(
                  (t: any) => normalize(t.name) === normalize(newT.name)
                ) || matchingOld.topics?.[idx];
                
                return {
                  ...newT,
                  done: oldT ? !!oldT.done : false
                };
              });
              
              return {
                ...newCh,
                mastery,
                topics
              };
            }
            return newCh;
          });

          // 2. Build ID mapping
          const oldToNewIdMap: Record<string, string> = {};
          initialSyllabus.forEach((newCh) => {
            const matchingOld = findMatchingOld(newCh);
            if (matchingOld) {
              oldToNewIdMap[matchingOld.id] = newCh.id;
            }
          });

          // 3. Migrate pyqProgress
          const oldPyqProgress = persistedState.pyqProgress || {};
          const migratedPyqProgress: Record<string, any> = {};
          initialSyllabus.forEach((newCh) => {
            const matchingOld = findMatchingOld(newCh);
            if (matchingOld && oldPyqProgress[matchingOld.id]) {
              migratedPyqProgress[newCh.id] = oldPyqProgress[matchingOld.id];
            }
          });

          // 4. Migrate notes
          const oldNotes = persistedState.notes || [];
          const migratedNotes = oldNotes.map((note: any) => {
            if (note.chapterId && oldToNewIdMap[note.chapterId]) {
              const newId = oldToNewIdMap[note.chapterId];
              const newCh = initialSyllabus.find(c => c.id === newId);
              return {
                ...note,
                chapterId: newId,
                chapterName: newCh ? newCh.name : note.chapterName
              };
            }
            return note;
          });

          // 5. Migrate sessions
          const oldSessions = persistedState.sessions || [];
          const migratedSessions = oldSessions.map((session: any) => {
            if (session.chapterId && oldToNewIdMap[session.chapterId]) {
              return {
                ...session,
                chapterId: oldToNewIdMap[session.chapterId]
              };
            }
            return session;
          });

          // 6. Migrate tasks
          const oldTasks = persistedState.tasks || [];
          const migratedTasks = oldTasks.map((task: any) => {
            if (task.chapterId && oldToNewIdMap[task.chapterId]) {
              return {
                ...task,
                chapterId: oldToNewIdMap[task.chapterId]
              };
            }
            return task;
          });

          state = {
            ...state,
            chapters: migratedChapters,
            pyqProgress: migratedPyqProgress,
            notes: migratedNotes,
            sessions: migratedSessions,
            tasks: migratedTasks
          };
        }
        if (version < 10) {
          state = {
            ...state,
            revisions: state.revisions || []
          };
        }
        if (version < 11) {
          if (state.chatMessages && state.chatMessages.length > 0) {
            state.chatThreads = [{
              id: Math.random().toString(36).substring(7),
              title: state.chatMessages[0]?.content.substring(0, 25) || 'Previous Chat',
              messages: state.chatMessages,
              updatedAt: new Date().toISOString()
            }];
            state.activeThreadId = state.chatThreads[0].id;
          } else {
            state.chatThreads = state.chatThreads || [];
            state.activeThreadId = state.activeThreadId || null;
          }
          delete state.chatMessages;
        }
        if (version < 13) {
          // Add new fields to existing records with safe defaults
          state.savingsGoals = state.savingsGoals || [];
          state.wishlistItems = state.wishlistItems || [];
          state.selfAnalysis = state.selfAnalysis || {
            identity: '', values: '', strengths: '', weaknesses: '', fears: '',
            givesEnergy: '', drainsEnergy: '', whatIsSuccess: '', wantToBecome: '',
            principles: '', discipline: 5, confidence: 5, communication: 5, empathy: 5,
            yearlyReflections: []
          };
          // Migrate BrainNotes to expanded format
          state.brainNotes = (state.brainNotes || []).map((n: any) => ({
            subCategory: 'thought', potential: 5, difficulty: 5, interest: 5,
            tags: [], evolutionLog: [], ...n
          }));
          // Migrate Relationships to expanded format
          state.relationships = (state.relationships || []).map((r: any) => ({
            nickname: '', phone: '', instagram: '', location: '', likes: '',
            dislikes: '', favFood: '', interactionCount: 0,
            memories: [], conversationLog: [], importantDates: [], ...r
          }));
          // Migrate DreamCards to expanded format
          state.dreamCards = (state.dreamCards || []).map((d: any) => ({
            progress: 0, targetYear: '', estimatedCost: '', why: '', ...d
          }));
          // Migrate LifeAnalytics to expanded format
          state.lifeAnalytics = (state.lifeAnalytics || []).map((l: any) => ({
            productivity: 5, ...l
          }));
        }
        return state;
      },

      onRehydrateStorage: () => (state) => {
        if (state) state.setHasHydrated(true);
      },
    }
  )
);
