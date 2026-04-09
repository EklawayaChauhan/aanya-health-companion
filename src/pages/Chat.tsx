import { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Send, ArrowLeft, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import AanyaAvatar from '@/components/AanyaAvatar';
import ChatBubble from '@/components/ChatBubble';
import VoiceControls from '@/components/VoiceControls';
import { useChatStore } from '@/stores/chatStore';
import { supabase } from '@/integrations/supabase/client';

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/medtalk-chat`;

export default function Chat() {
  const navigate = useNavigate();
  const { messages, isLoading, addMessage, updateLastAssistant, setLoading, setAvatarState, clearMessages } = useChatStore();
  const [input, setInput] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const synthRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const detectLanguage = useCallback((text: string): string => {
    const devanagariCount = (text.match(/[\u0900-\u097F]/g) || []).length;
    const totalChars = text.replace(/\s/g, '').length;
    if (totalChars === 0) return 'en-IN';
    const devanagariRatio = devanagariCount / totalChars;
    if (devanagariRatio > 0.3) {
      // Distinguish Hindi vs Marathi by common Marathi-specific characters/words
      const marathiMarkers = /[\u0960\u0961]|माझ|आहे|करा|तुम्ह|आम्ह|नाही|होत|असत|मला|तुला/;
      return marathiMarkers.test(text) ? 'mr-IN' : 'hi-IN';
    }
    return 'en-IN';
  }, []);

  const speak = useCallback((text: string) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();

    const lang = detectLanguage(text);
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.lang = lang;

    // Try to find a matching voice for the detected language
    const voices = window.speechSynthesis.getVoices();
    const langPrefix = lang.split('-')[0]; // 'hi', 'mr', 'en'
    const matchedVoice = voices.find(v => v.lang === lang) 
      || voices.find(v => v.lang.startsWith(langPrefix))
      || voices.find(v => v.lang.startsWith('hi') && lang === 'mr-IN'); // fallback Marathi to Hindi voice
    if (matchedVoice) {
      utterance.voice = matchedVoice;
    }

    utterance.onstart = () => { setIsSpeaking(true); setAvatarState('speaking'); };
    utterance.onend = () => { setIsSpeaking(false); setAvatarState('idle'); };
    synthRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  }, [setAvatarState, detectLanguage]);

  const stopSpeaking = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    setAvatarState('idle');
  };

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || isLoading) return;
    setInput('');
    addMessage({ role: 'user', content: text.trim() });
    setLoading(true);
    setAvatarState('thinking');

    const allMsgs = [...messages.map(m => ({ role: m.role, content: m.content })), { role: 'user' as const, content: text.trim() }];
    let assistantText = '';

    try {
      const resp = await fetch(CHAT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ messages: allMsgs }),
      });

      if (!resp.ok || !resp.body) {
        throw new Error(`Error: ${resp.status}`);
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        let idx: number;
        while ((idx = buffer.indexOf('\n')) !== -1) {
          let line = buffer.slice(0, idx);
          buffer = buffer.slice(idx + 1);
          if (line.endsWith('\r')) line = line.slice(0, -1);
          if (!line.startsWith('data: ')) continue;
          const json = line.slice(6).trim();
          if (json === '[DONE]') break;
          try {
            const parsed = JSON.parse(json);
            const delta = parsed.choices?.[0]?.delta?.content;
            if (delta) {
              assistantText += delta;
              updateLastAssistant(assistantText);
              setAvatarState('speaking');
            }
          } catch { /* partial */ }
        }
      }

      if (assistantText) speak(assistantText.slice(0, 500));
    } catch (e) {
      console.error(e);
      updateLastAssistant("I'm sorry, I'm having trouble connecting. Please try again.");
    } finally {
      setLoading(false);
      setAvatarState('idle');
    }
  }, [messages, isLoading, addMessage, updateLastAssistant, setLoading, setAvatarState, speak]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  return (
    <div className="min-h-screen gradient-bg flex flex-col">
      {/* Header */}
      <header className="glass-card-strong border-b border-border/50 px-4 py-3 flex items-center gap-4 sticky top-0 z-20">
        <Button variant="ghost" size="icon" onClick={() => navigate('/')} className="rounded-full">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <AanyaAvatar size="sm" />
        <div className="flex-1">
          <h1 className="font-bold text-sm">Aanya</h1>
          <p className="text-xs text-muted-foreground">
            {isLoading ? 'Thinking...' : 'AI Health Companion'}
          </p>
        </div>
        <Button variant="ghost" size="icon" onClick={clearMessages} className="rounded-full">
          <Trash2 className="w-4 h-4" />
        </Button>
      </header>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-6 space-y-2">
        {messages.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center h-full text-center py-20"
          >
            <AanyaAvatar size="lg" />
            <h2 className="text-xl font-bold mt-6 mb-2">Hello! I'm Aanya 👋</h2>
            <p className="text-muted-foreground text-sm max-w-sm">
              Your AI health companion. Tell me how you're feeling, and I'll try my best to help.
            </p>
            <p className="text-xs text-muted-foreground mt-4 max-w-xs">
              ⚠️ I'm not a doctor. For emergencies, please call your local emergency number.
            </p>
            <div className="flex flex-wrap gap-2 mt-6 justify-center">
              {['I have a headache', 'Feeling anxious', 'मुझे बुखार है'].map(q => (
                <button
                  key={q}
                  onClick={() => sendMessage(q)}
                  className="glass-card px-4 py-2 text-sm hover:bg-primary/5 transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {messages.map((msg) => (
          <ChatBubble key={msg.id} message={msg} />
        ))}

        {isLoading && messages[messages.length - 1]?.role !== 'assistant' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="chat-bubble-ai inline-flex gap-1 items-center"
          >
            <span className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }} />
            <span className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '150ms' }} />
            <span className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '300ms' }} />
          </motion.div>
        )}
      </div>

      {/* Input */}
      <div className="glass-card-strong border-t border-border/50 px-4 py-4 sticky bottom-0 z-20">
        <form onSubmit={handleSubmit} className="flex items-center gap-3">
          <VoiceControls onTranscript={sendMessage} isSpeaking={isSpeaking} onStopSpeaking={stopSpeaking} />
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Tell me how you're feeling..."
            className="flex-1 rounded-xl bg-background/80"
            disabled={isLoading}
          />
          <motion.div whileTap={{ scale: 0.9 }}>
            <Button type="submit" size="icon" disabled={isLoading || !input.trim()} className="rounded-full w-12 h-12 gradient-btn">
              <Send className="w-5 h-5" />
            </Button>
          </motion.div>
        </form>
      </div>
    </div>
  );
}
