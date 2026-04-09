import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Question } from '../types';
import { pushToGist, pullFromGist } from '../services/githubSync';

interface AppState {
  // UI States
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (isOpen: boolean) => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;

  // Cloud Config
  githubToken: string;
  gistId: string;
  setGithubToken: (token: string) => void;
  setGistId: (id: string) => void;

  // Data States
  questions: Question[];
  isInitializing: boolean;
  isSyncing: boolean;
  lastSyncTime: number | null;
  syncError: string | null;

  // Actions
  fetchFromCloud: () => Promise<void>;
  syncToCloud: () => Promise<void>;
  triggerAutoSync: () => void;
  
  // CRUD
  addQuestion: (q: Question) => Promise<void>;
  updateQuestion: (id: string, changes: Partial<Question>) => Promise<void>;
  deleteQuestion: (id: string) => Promise<void>;
  bulkAddQuestions: (qs: Question[]) => Promise<void>;
  bulkUpdateQuestions: (updates: { id: string; changes: Partial<Question> }[]) => Promise<void>;
  bulkDeleteQuestions: (ids: string[]) => Promise<void>;
  setQuestions: (qs: Question[]) => Promise<void>;
  clearData: () => Promise<void>;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      sidebarOpen: true,
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      setSidebarOpen: (isOpen) => set({ sidebarOpen: isOpen }),
      theme: 'dark',
      toggleTheme: () => set((state) => ({ theme: state.theme === 'dark' ? 'light' : 'dark' })),
      githubToken: '',
      gistId: '',
      setGithubToken: (token) => set({ githubToken: token }),
      setGistId: (id) => set({ gistId: id }),

      questions: [],
      isInitializing: false,
      isSyncing: false,
      lastSyncTime: null,
      syncError: null,

      fetchFromCloud: async () => {
        const { githubToken, gistId } = get();
        if (!githubToken || !gistId) return;

        set({ isInitializing: true, syncError: null });
        try {
          const payload = await pullFromGist(githubToken, gistId);
          if (payload && Array.isArray(payload.questions)) {
            set({ questions: payload.questions, lastSyncTime: Date.now() });
          }
        } catch (error: any) {
          set({ syncError: error.message || '拉取数据失败' });
          console.error('Fetch from cloud failed:', error);
        } finally {
          set({ isInitializing: false });
        }
      },

      syncToCloud: async () => {
        const { githubToken, gistId, questions } = get();
        if (!githubToken) return;

        set({ isSyncing: true, syncError: null });
        try {
          const payload = { version: 2, questions };
          const newGistId = await pushToGist(githubToken, gistId, payload);
          if (!gistId && newGistId) {
            set({ gistId: newGistId, lastSyncTime: Date.now() });
          } else {
            set({ lastSyncTime: Date.now() });
          }
        } catch (error: any) {
          set({ syncError: error.message || '同步失败' });
          console.error('Sync to cloud failed:', error);
        } finally {
          set({ isSyncing: false });
        }
      },

      triggerAutoSync: () => {
        get().syncToCloud();
      },

      addQuestion: async (q) => {
        set((state) => ({ questions: [...state.questions, q] }));
        get().triggerAutoSync();
      },

      updateQuestion: async (id, changes) => {
        set((state) => ({
          questions: state.questions.map((q) => (q.id === id ? { ...q, ...changes } : q)),
        }));
        get().triggerAutoSync();
      },

      deleteQuestion: async (id) => {
        set((state) => ({
          questions: state.questions.filter((q) => q.id !== id),
        }));
        get().triggerAutoSync();
      },

      bulkAddQuestions: async (qs) => {
        set((state) => ({ questions: [...state.questions, ...qs] }));
        get().triggerAutoSync();
      },

      bulkUpdateQuestions: async (updates) => {
        set((state) => {
          const updateMap = new Map(updates.map(u => [u.id, u.changes]));
          return {
            questions: state.questions.map(q => {
              if (updateMap.has(q.id)) {
                return { ...q, ...updateMap.get(q.id) };
              }
              return q;
            })
          };
        });
        get().triggerAutoSync();
      },

      bulkDeleteQuestions: async (ids) => {
        const idSet = new Set(ids);
        set((state) => ({
          questions: state.questions.filter((q) => !idSet.has(q.id)),
        }));
        get().triggerAutoSync();
      },

      setQuestions: async (qs) => {
        set({ questions: qs });
        get().triggerAutoSync();
      },

      clearData: async () => {
        set({ questions: [] });
        get().triggerAutoSync();
      },
    }),
    {
      name: 'interview-pro-ui',
      partialize: (state) => ({ 
        sidebarOpen: state.sidebarOpen, 
        theme: state.theme,
        githubToken: state.githubToken,
        gistId: state.gistId
      }),
    }
  )
);
