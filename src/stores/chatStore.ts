import { create } from 'zustand';

export type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
};

export type AvatarState = 'idle' | 'listening' | 'thinking' | 'speaking';

interface ChatState {
  messages: Message[];
  isLoading: boolean;
  avatarState: AvatarState;
  isListening: boolean;
  language: string;
  addMessage: (msg: Omit<Message, 'id' | 'timestamp'>) => void;
  updateLastAssistant: (content: string) => void;
  setLoading: (v: boolean) => void;
  setAvatarState: (s: AvatarState) => void;
  setListening: (v: boolean) => void;
  setLanguage: (l: string) => void;
  clearMessages: () => void;
}

export const useChatStore = create<ChatState>((set) => ({
  messages: [],
  isLoading: false,
  avatarState: 'idle',
  isListening: false,
  language: 'en',
  addMessage: (msg) =>
    set((s) => ({
      messages: [
        ...s.messages,
        { ...msg, id: crypto.randomUUID(), timestamp: new Date() },
      ],
    })),
  updateLastAssistant: (content) =>
    set((s) => {
      const msgs = [...s.messages];
      const last = msgs[msgs.length - 1];
      if (last?.role === 'assistant') {
        msgs[msgs.length - 1] = { ...last, content };
      } else {
        msgs.push({ id: crypto.randomUUID(), role: 'assistant', content, timestamp: new Date() });
      }
      return { messages: msgs };
    }),
  setLoading: (isLoading) => set({ isLoading }),
  setAvatarState: (avatarState) => set({ avatarState }),
  setListening: (isListening) => set({ isListening }),
  setLanguage: (language) => set({ language }),
  clearMessages: () => set({ messages: [] }),
}));
