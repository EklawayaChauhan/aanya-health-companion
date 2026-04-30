import { useCallback, useRef } from 'react';
import { Mic, MicOff, Volume2, VolumeX } from 'lucide-react';
import { motion } from 'framer-motion';
import { useChatStore } from '@/stores/chatStore';
import { Button } from '@/components/ui/button';

import { langToBCP47, type LangCode } from '@/lib/speech';

interface VoiceControlsProps {
  onTranscript: (text: string) => void;
  isSpeaking: boolean;
  onStopSpeaking: () => void;
}

export default function VoiceControls({ onTranscript, isSpeaking, onStopSpeaking }: VoiceControlsProps) {
  const { isListening, setListening, setAvatarState, language } = useChatStore();
  const recognitionRef = useRef<any>(null);

  const langMap = langToBCP47;

  const toggleListening = useCallback(() => {
    if (isListening) {
      (recognitionRef.current as any)?.stop();
      setListening(false);
      setAvatarState('idle');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = langMap[language as LangCode] || 'en-IN';
    recognitionRef.current = recognition;

    recognition.onstart = () => {
      setListening(true);
      setAvatarState('listening');
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      onTranscript(transcript);
      setListening(false);
      setAvatarState('idle');
    };

    recognition.onerror = () => {
      setListening(false);
      setAvatarState('idle');
    };

    recognition.onend = () => {
      setListening(false);
    };

    recognition.start();
  }, [isListening, onTranscript, setListening, setAvatarState]);

  return (
    <div className="flex gap-2">
      <motion.div whileTap={{ scale: 0.9 }}>
        <Button
          variant={isListening ? "destructive" : "default"}
          size="icon"
          onClick={toggleListening}
          className={`rounded-full w-12 h-12 ${isListening ? '' : 'gradient-btn'}`}
        >
          {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
        </Button>
      </motion.div>

      {isSpeaking && (
        <motion.div whileTap={{ scale: 0.9 }}>
          <Button variant="outline" size="icon" onClick={onStopSpeaking} className="rounded-full w-12 h-12">
            <VolumeX className="w-5 h-5" />
          </Button>
        </motion.div>
      )}
    </div>
  );
}
