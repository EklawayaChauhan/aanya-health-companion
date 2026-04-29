import { motion } from 'framer-motion';
import { ArrowUpRight, Play, Mic, Globe, HeartPulse } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import FadingVideo from '@/components/FadingVideo';
import BlurText from '@/components/BlurText';

const HERO_VIDEO =
  'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260418_080021_d598092b-c4c2-4e53-8e46-94cf9064cd50.mp4';
const CAPS_VIDEO =
  'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260418_094631_d30ab262-45ee-4b7d-99f3-5d5848c8ef13.mp4';

const navLinks = ['Home', 'Aanya', 'How it Works', 'Languages', 'Safety'];

const baseFade = {
  initial: { filter: 'blur(10px)', opacity: 0, y: 20 },
  animate: { filter: 'blur(0px)', opacity: 1, y: 0 },
};

export default function Index() {
  const navigate = useNavigate();
  const goChat = () => navigate('/chat');

  return (
    <div className="bg-black text-white font-body">
      {/* ============== SECTION 1 — HERO ============== */}
      <section className="relative min-h-screen w-full overflow-hidden bg-black">
        <FadingVideo
          src={HERO_VIDEO}
          className="absolute left-1/2 top-0 -translate-x-1/2 object-cover object-top z-0"
          style={{ width: '120%', height: '120%' }}
        />

        {/* Navbar */}
        <nav className="fixed top-4 left-0 right-0 z-50 px-4 sm:px-8 lg:px-16 flex items-center justify-between">
          <div className="liquid-glass w-12 h-12 rounded-full flex items-center justify-center">
            <span className="font-heading italic text-2xl text-white leading-none">a</span>
          </div>

          <div className="hidden md:flex liquid-glass rounded-full px-1.5 py-1.5 items-center gap-0">
            {navLinks.map((l) => (
              <a
                key={l}
                href="#"
                className="px-3 py-2 text-sm font-medium text-white/90 font-body hover:text-white"
              >
                {l}
              </a>
            ))}
            <button
              onClick={goChat}
              className="ml-1 inline-flex items-center gap-1.5 bg-white text-black rounded-full px-4 py-2 text-sm font-medium whitespace-nowrap hover:bg-white/90 transition"
            >
              Talk to Aanya <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={goChat}
            className="md:hidden liquid-glass-strong rounded-full px-4 py-2 text-xs font-medium text-white inline-flex items-center gap-1"
          >
            Talk to Aanya <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </nav>

        {/* Hero content */}
        <div className="relative z-10 min-h-screen flex flex-col">
          <div className="flex-1 flex flex-col items-center justify-center text-center pt-32 pb-12 px-4">
            <motion.div
              {...baseFade}
              transition={{ duration: 0.7, ease: 'easeOut', delay: 0.4 }}
              className="liquid-glass rounded-full inline-flex items-center gap-2 pl-1 pr-3 py-1"
            >
              <span className="bg-white text-black rounded-full px-3 py-1 text-xs font-semibold">New</span>
              <span className="text-sm text-white/90">Aanya now speaks English, Hindi & Marathi</span>
            </motion.div>

            <div className="mt-8 max-w-3xl">
              <BlurText
                text="Your Voice. Her Care. Health, Reimagined."
                className="text-5xl sm:text-6xl md:text-7xl lg:text-[5.5rem] font-heading italic text-white leading-[0.85] tracking-[-3px] sm:tracking-[-4px] justify-center"
              />
            </div>

            <motion.p
              {...baseFade}
              transition={{ duration: 0.7, ease: 'easeOut', delay: 0.8 }}
              className="mt-5 text-sm md:text-base text-white max-w-2xl font-body font-light leading-snug px-4"
            >
              Meet Aanya — an empathetic, voice-powered AI health companion. She listens to your symptoms,
              speaks your language, and guides you toward better well-being. Safe. Private. Always there.
            </motion.p>

            <motion.div
              {...baseFade}
              transition={{ duration: 0.7, ease: 'easeOut', delay: 1.1 }}
              className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 mt-8"
            >
              <button
                onClick={goChat}
                className="liquid-glass-strong rounded-full px-6 py-3 text-sm font-medium text-white inline-flex items-center gap-2 hover:scale-[1.02] transition"
              >
                Get Started <ArrowUpRight className="w-5 h-5" />
              </button>
              <button
                onClick={goChat}
                className="text-white text-sm inline-flex items-center gap-2 hover:text-white/80"
              >
                <Play className="w-4 h-4 fill-white" /> See Aanya in action
              </button>
            </motion.div>

            <motion.div
              {...baseFade}
              transition={{ duration: 0.7, ease: 'easeOut', delay: 1.3 }}
              className="flex flex-col sm:flex-row items-stretch gap-4 mt-12 px-4"
            >
              <div className="liquid-glass rounded-[1.25rem] p-5 w-full sm:w-[220px] text-left">
                <Mic className="w-7 h-7 text-white" strokeWidth={1.5} />
                <p className="mt-3 text-4xl font-heading italic text-white tracking-[-1px] leading-none">3</p>
                <p className="text-xs text-white font-body font-light mt-2">Languages spoken fluently</p>
              </div>
              <div className="liquid-glass rounded-[1.25rem] p-5 w-full sm:w-[220px] text-left">
                <Globe className="w-7 h-7 text-white" strokeWidth={1.5} />
                <p className="mt-3 text-4xl font-heading italic text-white tracking-[-1px] leading-none">24/7</p>
                <p className="text-xs text-white font-body font-light mt-2">Always here when you need her</p>
              </div>
            </motion.div>
          </div>

          {/* Partners */}
          <motion.div
            {...baseFade}
            transition={{ duration: 0.7, ease: 'easeOut', delay: 1.4 }}
            className="flex flex-col items-center gap-4 pb-8 px-4"
          >
            <div className="liquid-glass rounded-full px-3.5 py-1 text-xs font-medium text-white">
              Built with care alongside health & wellness pioneers
            </div>
            <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-12 md:gap-16">
              {['Aeon', 'Vela', 'Apex', 'Orbit', 'Zeno'].map((n) => (
                <span
                  key={n}
                  className="font-heading italic text-white text-2xl md:text-3xl tracking-tight"
                >
                  {n}
                </span>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ============== SECTION 2 — CAPABILITIES ============== */}
      <section className="relative min-h-screen w-full overflow-hidden bg-black">
        <FadingVideo src={CAPS_VIDEO} className="absolute inset-0 w-full h-full object-cover z-0" />

        <div className="relative z-10 px-6 sm:px-8 md:px-16 lg:px-20 pt-24 pb-16 flex flex-col min-h-screen">
          <div className="mb-auto">
            <p className="text-sm font-body text-white/80 mb-6">// Capabilities</p>
            <h2 className="font-heading italic text-white text-5xl sm:text-6xl md:text-7xl lg:text-[6rem] leading-[0.9] tracking-[-2px] sm:tracking-[-3px]">
              Care that listens,
              <br />
              evolved.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
            {[
              {
                icon: Mic,
                tags: ['Natural Voice', 'Active Listening', 'Tone Aware', 'Real-time'],
                title: 'Voice-First Care',
                body:
                  'Talk to Aanya like a friend. She listens to your concerns, reads your tone, and responds with calm, human-feeling guidance.',
              },
              {
                icon: Globe,
                tags: ['English', 'हिंदी', 'मराठी', 'Code-switch'],
                title: 'Truly Multilingual',
                body:
                  'Aanya answers in the language you speak — English, Hindi, or Marathi — without forcing you to switch or translate.',
              },
              {
                icon: HeartPulse,
                tags: ['Empathy First', 'Safety Checks', 'Private', 'Never a Doctor'],
                title: 'Empathetic & Safe',
                body:
                  'Trained to be gentle, recognize urgency, and always recommend a real medical professional when it matters.',
              },
            ].map((c, i) => (
              <motion.div
                key={c.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                className="liquid-glass rounded-[1.25rem] p-6 min-h-[360px] flex flex-col"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="liquid-glass w-11 h-11 rounded-[0.75rem] flex items-center justify-center">
                    <c.icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex flex-wrap justify-end gap-1.5 max-w-[70%]">
                    {c.tags.map((t) => (
                      <span
                        key={t}
                        className="liquid-glass rounded-full px-3 py-1 text-[11px] text-white/90 font-body whitespace-nowrap"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex-1" />

                <div className="mt-6">
                  <h3 className="font-heading italic text-white text-3xl md:text-4xl tracking-[-1px] leading-none">
                    {c.title}
                  </h3>
                  <p className="mt-3 text-sm text-white/90 font-body font-light leading-snug max-w-[32ch]">
                    {c.body}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Final CTA */}
          <div className="mt-16 flex flex-col sm:flex-row items-center justify-between gap-6 border-t border-white/10 pt-8">
            <p className="text-xs text-white/70 max-w-md text-center sm:text-left">
              ⚠️ Aanya is not a doctor. Always consult a licensed medical professional. Helpline (India): iCall
              9152987821
            </p>
            <button
              onClick={goChat}
              className="liquid-glass-strong rounded-full px-6 py-3 text-sm font-medium text-white inline-flex items-center gap-2"
            >
              Start chatting with Aanya <ArrowUpRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
