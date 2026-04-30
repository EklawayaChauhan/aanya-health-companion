import { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Send, ArrowLeft, Trash2, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import AanyaAvatar from '@/components/AanyaAvatar';
import ChatBubble from '@/components/ChatBubble';
import VoiceControls from '@/components/VoiceControls';
import { useChatStore } from '@/stores/chatStore';
import { configureUtterance, detectLang, loadVoices, type LangCode } from '@/lib/speech';

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/medtalk-chat`;

export default function Chat() {
  const navigate = useNavigate();
  const { messages, isLoading, language, setLanguage, addMessage, updateLastAssistant, setLoading, setAvatarState, clearMessages } = useChatStore();
  const [input, setInput] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const synthRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    loadVoices();
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const speak = useCallback((text: string) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    // Detect from response text; fall back to selected language
    const detected = detectLang(text);
    const lang: LangCode = detected || (language as LangCode);
    const utter = new SpeechSynthesisUtterance(text);
    configureUtterance(utter, lang);
    utter.onstart = () => { setIsSpeaking(true); setAvatarState('speaking'); };
    utter.onend = () => { setIsSpeaking(false); setAvatarState('idle'); };
    synthRef.current = utter;
    window.speechSynthesis.speak(utter);
  }, [language, setAvatarState]);

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
        body: JSON.stringify({ messages: allMsgs, language }),
      });

      if (!resp.ok || !resp.body) throw new Error(`Error: ${resp.status}`);

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
  }, [messages, isLoading, addMessage, updateLastAssistant, setLoading, setAvatarState, speak, language]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const suggestionsByLang: Record<string, string[]> = {
    en: ['I have a headache', 'Feeling anxious', 'Trouble sleeping'],
    hi: ['मुझे सिरदर्द है', 'मुझे चिंता हो रही है', 'मुझे बुखार है'],
    mr: ['मला डोकेदुखी आहे', 'मला चिंता वाटतेय', 'मला झोप येत नाही'],
  };

  return (
    <div className="min-h-screen flex flex-col relative chat-dark-bg text-slate-100">
      {/* Animated aurora background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="aurora-blob absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full bg-teal-500/20" />
        <div className="aurora-blob absolute top-1/3 -right-40 w-[600px] h-[600px] rounded-full bg-cyan-500/20" style={{ animationDelay: '6s' }} />
        <div className="aurora-blob absolute bottom-0 left-1/3 w-[450px] h-[450px] rounded-full bg-emerald-500/15" style={{ animationDelay: '12s' }} />
        <div className="absolute inset-0 chat-grid-overlay opacity-40" />
      </div>

      {/* Header */}
      <header className="chat-glass-dark border-b border-white/5 px-3 sm:px-5 py-3 flex items-center gap-3 sm:gap-4 sticky top-0 z-20 rounded-none">
        <Button variant="ghost" size="icon" onClick={() => navigate('/')} className="rounded-full text-slate-200 hover:bg-white/10 hover:text-white shrink-0">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="shrink-0">
          <AanyaAvatar size="sm" />
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="font-bold text-sm flex items-center gap-1.5 text-white">
            Aanya <Sparkles className="w-3.5 h-3.5 text-teal-300" />
          </h1>
          <p className="text-xs text-slate-400 truncate">
            {isLoading ? 'Thinking…' : 'AI Health Companion'}
          </p>
        </div>
        <div className="flex items-center gap-1 chat-glass-dark rounded-full p-1">
          {(['en', 'hi', 'mr'] as const).map((lang) => (
            <button
              key={lang}
              onClick={() => setLanguage(lang)}
              className={`px-2.5 py-1 text-xs rounded-full transition-all font-medium ${
                language === lang ? 'lang-pill-active' : 'text-slate-300 hover:text-white'
              }`}
            >
              {lang === 'en' ? 'EN' : lang === 'hi' ? 'हिं' : 'मरा'}
            </button>
          ))}
        </div>
        <Button variant="ghost" size="icon" onClick={clearMessages} className="rounded-full text-slate-300 hover:bg-white/10 hover:text-white shrink-0">
          <Trash2 className="w-4 h-4" />
        </Button>
      </header>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 sm:px-6 py-6 relative z-10">
        <div className="max-w-3xl mx-auto space-y-2">
          {messages.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center text-center py-12 sm:py-20"
            >
              <AanyaAvatar size="lg" />
              <h2 className="text-2xl sm:text-3xl font-bold mt-6 mb-2 bg-gradient-to-r from-teal-300 to-cyan-300 bg-clip-text text-transparent">
                Hello! I'm Aanya 👋
              </h2>
              <p className="text-slate-300 text-sm sm:text-base max-w-sm">
                Your AI health companion. Tell me how you're feeling, and I'll do my best to help — in English, हिंदी, or मराठी.
              </p>
              <p className="text-xs text-slate-500 mt-4 max-w-xs">
                ⚠️ I'm not a doctor. For emergencies, call 112 (India).
              </p>
              <div className="flex flex-wrap gap-2 mt-8 justify-center">
                {(suggestionsByLang[language] || suggestionsByLang.en).map(q => (
                  <motion.button
                    key={q}
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => sendMessage(q)}
                    className="chat-chip"
                  >
                    {q}
                  </motion.button>
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
              className="chat-bubble-ai-dark inline-flex gap-1.5 items-center"
            >
              <span className="typing-dot w-2 h-2 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="typing-dot w-2 h-2 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="typing-dot w-2 h-2 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </motion.div>
          )}
        </div>
      </div>

      {/* Input */}
      <div className="chat-glass-dark border-t border-white/5 px-3 sm:px-6 py-4 sticky bottom-0 z-20 rounded-none">
        <form onSubmit={handleSubmit} className="max-w-3xl mx-auto flex items-center gap-2 sm:gap-3">
          <VoiceControls onTranscript={sendMessage} isSpeaking={isSpeaking} onStopSpeaking={stopSpeaking} />
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              language === 'hi' ? 'अपनी समस्या बताइए…'
              : language === 'mr' ? 'तुम्हाला काय वाटतंय ते सांगा…'
              : "Tell me how you're feeling…"
            }
            className="flex-1 rounded-full chat-input-dark h-12 px-5 text-base border-0 focus-visible:ring-0"
            disabled={isLoading}
          />
          <motion.div whileTap={{ scale: 0.92 }}>
            <Button type="submit" size="icon" disabled={isLoading || !input.trim()} className="rounded-full w-12 h-12 send-btn-glow border-0 disabled:opacity-40 disabled:shadow-none">
              <Send className="w-5 h-5 text-white" />
            </Button>
          </motion.div>
        </form>
      </div>
    </div>
  );
}
