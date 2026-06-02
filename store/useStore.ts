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
}

const todayStr = () => new Date().toISOString().slice(0, 10);

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      // ── Syllabus ──────────────────────────
      chapters: initialSyllabus,
      updateMastery: (chapterId, level) =>
        set((s) => ({
          chapters: s.chapters.map((c) =>
            c.id === chapterId ? { ...c, mastery: level } : c
          ),
        })),
      toggleTopic: (chapterId, topicId) =>
        set((s) => ({
          chapters: s.chapters.map((c) =>
            c.id === chapterId
              ? {
                  ...c,
                  topics: c.topics.map((t) =>
                    t.id === topicId ? { ...t, done: !t.done } : t
                  ),
                }
              : c
          ),
        })),


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
    }),
    {
      name: 'jee-tracker-store',
      version: 8,
    }
  )
);
