import { motion } from 'framer-motion';
import { ArrowRight, Heart, Shield, Globe, Mic } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import AanyaAvatar from '@/components/AanyaAvatar';
import Iridescence from '@/components/Iridescence';

const features = [
  { icon: Mic, title: 'Voice-First', desc: 'Talk naturally — Aanya listens, understands, and responds with care.' },
  { icon: Heart, title: 'Empathetic AI', desc: 'Emotionally intelligent responses that adapt to how you feel.' },
  { icon: Globe, title: 'Multilingual', desc: 'Speak in English, Hindi, or Marathi — Aanya follows your language.' },
  { icon: Shield, title: 'Safe & Private', desc: 'Your health data stays private. We never replace real doctors.' },
];

export default function Index() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen relative">
      <div className="fixed inset-0 z-0">
        <Iridescence color={[0.3, 0.6, 0.5]} speed={0.6} amplitude={0.05} mouseReact={false} />
      </div>
      <div className="relative z-10 bg-background/70 backdrop-blur-md min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="relative z-10 container mx-auto px-4 py-20 lg:py-32 flex flex-col lg:flex-row items-center gap-12">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
            className="flex-1 text-center lg:text-left"
          >
            <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-6">
              Meet <span className="gradient-text">Aanya</span>,<br />
              Your AI Health<br />Companion
            </h1>
            <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto lg:mx-0">
              An empathetic, voice-powered AI therapist that understands your symptoms, speaks your language, and guides you towards better health — safely.
            </p>
            <div className="flex gap-4 justify-center lg:justify-start">
              <Button onClick={() => navigate('/chat')} size="lg" className="gradient-btn px-8 py-6 text-base">
                Start Talking <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </div>
            <p className="mt-4 text-xs text-muted-foreground">
              ⚠️ MedTalk AI is not a doctor. Always consult a licensed medical professional.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="flex-1 flex justify-center"
          >
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-primary/10 blur-3xl scale-150" />
              <AanyaAvatar size="lg" />
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="mt-6 glass-card-strong px-6 py-3 text-center"
              >
                <p className="text-sm font-medium text-foreground">"Hi! I'm Aanya. How are you feeling today?"</p>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-20">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-3xl md:text-4xl font-bold text-center mb-16"
        >
          Why <span className="gradient-text">MedTalk AI</span>?
        </motion.h2>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="glass-card p-6 hover:shadow-xl transition-shadow"
            >
              <div className="w-12 h-12 rounded-xl gradient-btn flex items-center justify-center mb-4">
                <f.icon className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg mb-2">{f.title}</h3>
              <p className="text-sm text-muted-foreground">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 border-t border-border">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">© 2026 MedTalk AI. Not a substitute for professional medical advice.</p>
          <p className="text-xs text-muted-foreground">Helpline (India): iCall 9152987821</p>
        </div>
      </footer>
      </div>
    </div>
  );
}
