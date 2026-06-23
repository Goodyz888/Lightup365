import { create } from 'zustand';
import { Theme, Language, KnowledgeBaseEntry, SocialUpdate } from './types';
import initialKnowledgeBase from './data/knowledgebase.json';
import initialSocials from './data/social.json';

interface AppState {
  theme: Theme;
  language: Language;
  knowledgeBase: KnowledgeBaseEntry[];
  socialUpdates: SocialUpdate[];
  toggleTheme: () => void;
  setLanguage: (lang: Language) => void;
  addKnowledgeBaseEntry: (entry: Omit<KnowledgeBaseEntry, 'id'>) => void;
  addSocialUpdate: (update: Omit<SocialUpdate, 'id' | 'timestamp'>) => void;
}

export const useStore = create<AppState>((set) => ({
  theme: 'light',
  language: 'en',
  knowledgeBase: initialKnowledgeBase as KnowledgeBaseEntry[],
  socialUpdates: initialSocials as SocialUpdate[],
  
  toggleTheme: () => set((state) => {
    const newTheme = state.theme === 'light' ? 'dark' : 'light';
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    return { theme: newTheme };
  }),
  
  setLanguage: (lang) => set({ language: lang }),
  
  addKnowledgeBaseEntry: (entry) => set((state) => ({
    knowledgeBase: [
      ...state.knowledgeBase,
      { ...entry, id: `kb-${Date.now()}` }
    ]
  })),
  
  addSocialUpdate: (update) => set((state) => ({
    socialUpdates: [
      { ...update, id: `soc-${Date.now()}`, timestamp: new Date().toISOString() },
      ...state.socialUpdates
    ]
  }))
}));
