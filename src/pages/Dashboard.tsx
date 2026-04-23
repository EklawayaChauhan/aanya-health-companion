import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Crown, Star, Trophy, Calendar, ArrowRight, MessageCircle, Activity, BookOpen, Users, Mic, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import TopNav from '@/components/TopNav';
import { toast } from 'sonner';

interface Profile {
  display_name: string | null;
  level: number;
  beautiful_points: number;
  daily_streak: number;
  achievements_count: number;
  language_progress: number;
  voice_speech_progress: number;
}

interface HomeworkItem {
  id: string;
  title: string;
  description: string | null;
  status: string;
}

const exercises = [
  { title: 'Daily training', desc: 'Practice your speech and language skills', icon: Activity, color: 'from-emerald-500 to-teal-500', tag: null },
  { title: 'Homework', desc: 'Complete exercises set by your therapist', icon: BookOpen, color: 'from-sky-500 to-blue-500', tag: 'New' },
  { title: 'Group activities', desc: 'Join sessions with other patients', icon: Users, color: 'from-violet-500 to-fuchsia-500', tag: null },
  { title: 'Voice journal', desc: 'Record your thoughts and feelings', icon: Mic, color: 'from-amber-500 to-orange-500', tag: null },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [homework, setHomework] = useState<HomeworkItem[]>([]);
  const [showBanner, setShowBanner] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) navigate('/auth', { replace: true });
  }, [authLoading, user, navigate]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const [{ data: p }, { data: h }] = await Promise.all([
        supabase.from('profiles').select('*').eq('user_id', user.id).maybeSingle(),
        supabase.from('homework').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
      ]);
      if (p) setProfile(p as Profile);
      setHomework((h as HomeworkItem[]) ?? []);
    })();
  }, [user]);

  const seedDemo = async () => {
    if (!user) return;
    const items = [
      { user_id: user.id, title: 'Real life items', description: 'Think of words', status: 'new' },
      { user_id: user.id, title: 'Pick an object', description: 'Use sentences', status: 'in_progress' },
      { user_id: user.id, title: 'Practice mouth movements', description: 'Daily routine', status: 'in_progress' },
      { user_id: user.id, title: 'Read sentences', description: 'Latest news', status: 'completed' },
    ];
    const { error } = await supabase.from('homework').insert(items);
    if (error) return toast.error(error.message);
    const { data } = await supabase.from('homework').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
    setHomework((data as HomeworkItem[]) ?? []);
    toast.success('Sample homework added!');
  };

  if (authLoading || !user) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  const displayName = profile?.display_name ?? user.email?.split('@')[0] ?? 'there';
  const points = profile?.beautiful_points ?? 1145;
  const level = profile?.level ?? 1;
  const streak = profile?.daily_streak ?? 2;
  const achievements = profile?.achievements_count ?? 3;
  const langProgress = profile?.language_progress ?? 35;
  const voiceProgress = profile?.voice_speech_progress ?? 60;

  const newHomeworkCount = homework.filter((h) => h.status === 'new').length;

  return (
    <div className="min-h-screen bg-muted/30">
      <TopNav />

      <main className="container mx-auto px-4 py-6 sm:py-8 max-w-7xl">
        {/* Banner */}
        {showBanner && newHomeworkCount > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 flex items-center justify-between gap-3 px-4 py-3 rounded-xl bg-primary/10 border border-primary/20"
          >
            <div className="flex items-center gap-3 text-sm">
              <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center shrink-0">
                <BookOpen className="w-4 h-4" />
              </div>
              <span><strong>{newHomeworkCount} new homework exercise{newHomeworkCount > 1 ? 's' : ''}</strong> from your therapist</span>
            </div>
            <button onClick={() => setShowBanner(false)} className="px-3 py-1 rounded-full bg-foreground text-background text-xs flex items-center gap-1">
              Close <X className="w-3 h-3" />
            </button>
          </motion.div>
        )}

        {/* Greeting + profile card */}
        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-2"
          >
            <h1 className="text-3xl sm:text-4xl font-extrabold mb-1">Hi {displayName}!</h1>
            <p className="text-xl sm:text-2xl text-muted-foreground mb-6">Let's get started…</p>

            <div className="bg-card rounded-2xl p-5 sm:p-6 shadow-sm border border-border">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-lg">Activities</h2>
                <Button variant="ghost" size="sm" onClick={() => navigate('/chat')} className="gap-1 text-primary">
                  Talk to Aanya <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-sm text-muted-foreground mb-4">Practice your speech and language skills individually or in a group.</p>

              <div className="grid sm:grid-cols-2 gap-3">
                {exercises.map((ex) => {
                  const Icon = ex.icon;
                  return (
                    <motion.button
                      key={ex.title}
                      whileHover={{ y: -2 }}
                      onClick={() => ex.title === 'Daily training' ? navigate('/chat') : toast.info('Coming soon!')}
                      className="relative text-left rounded-xl overflow-hidden group"
                    >
                      <div className={`bg-gradient-to-br ${ex.color} p-4 sm:p-5 h-32 flex flex-col justify-between text-white`}>
                        <div className="flex items-start justify-between">
                          <Icon className="w-6 h-6" />
                          {ex.tag && (
                            <span className="text-[10px] font-bold uppercase bg-destructive text-destructive-foreground px-2 py-0.5 rounded-full">
                              {ex.tag}
                            </span>
                          )}
                        </div>
                        <div>
                          <h3 className="font-bold">{ex.title}</h3>
                          <p className="text-xs opacity-90 mt-0.5">{ex.desc}</p>
                        </div>
                        <span className="absolute bottom-3 right-3 w-8 h-8 rounded-full bg-white/95 text-emerald-600 flex items-center justify-center group-hover:translate-x-1 transition-transform">
                          <ArrowRight className="w-4 h-4" />
                        </span>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </div>
          </motion.div>

          {/* Side card */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-card rounded-2xl p-5 sm:p-6 shadow-sm border border-border h-fit lg:sticky lg:top-20"
          >
            <div className="flex items-center gap-3 mb-5">
              <div className="w-12 h-12 rounded-full bg-primary/15 text-primary flex items-center justify-center font-bold text-lg">
                {displayName[0]?.toUpperCase()}
              </div>
              <div>
                <p className="font-bold">{displayName}</p>
                <p className="text-xs text-muted-foreground">Level {level}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Stat icon={Crown} label="Level" value={level} />
              <Stat icon={Star} label="Beautiful Points" value={points} />
              <Stat icon={Trophy} label="Achievements" value={achievements} />
              <Stat icon={Calendar} label="Daily streak" value={streak} />
            </div>

            <div className="mt-6">
              <p className="font-semibold text-sm mb-3">Your progress</p>
              <p className="text-xs text-muted-foreground mb-1">Level {level}</p>
              <Progress value={(points % 1000) / 10} className="h-2 mb-4" />

              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span>Language</span>
                    <span className="text-muted-foreground">{langProgress}%</span>
                  </div>
                  <Progress value={langProgress} className="h-1.5" />
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span>Voice & Speech</span>
                    <span className="text-muted-foreground">{voiceProgress}%</span>
                  </div>
                  <Progress value={voiceProgress} className="h-1.5" />
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Homework + Therapist row */}
        <div className="grid lg:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="lg:col-span-2 bg-card rounded-2xl p-5 sm:p-6 shadow-sm border border-border"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-lg">Your homework</h2>
                {newHomeworkCount > 0 && (
                  <span className="text-[10px] font-bold uppercase bg-primary/15 text-primary px-2 py-0.5 rounded-full">
                    {newHomeworkCount} new
                  </span>
                )}
              </div>
              <Button variant="ghost" size="sm" className="gap-1">
                All homework <ArrowRight className="w-4 h-4" />
              </Button>
            </div>

            {homework.length === 0 ? (
              <div className="text-center py-10">
                <BookOpen className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
                <p className="text-sm text-muted-foreground mb-4">No homework yet.</p>
                <Button onClick={seedDemo} variant="outline" size="sm">Add sample homework</Button>
              </div>
            ) : (
              <div className="space-y-4">
                {(['new', 'in_progress', 'completed'] as const).map((status) => {
                  const items = homework.filter((h) => h.status === status);
                  if (items.length === 0) return null;
                  const labels = { new: 'New', in_progress: 'In progress', completed: 'Completed' };
                  return (
                    <div key={status}>
                      <p className="text-xs font-semibold uppercase text-muted-foreground tracking-wide mb-2">{labels[status]}</p>
                      <ul className="divide-y divide-border">
                        {items.map((h) => (
                          <li key={h.id} className="py-2.5 flex items-center justify-between gap-3">
                            <div className="min-w-0">
                              <p className="font-medium text-sm truncate">{h.title}</p>
                              {h.description && <p className="text-xs text-muted-foreground truncate">{h.description}</p>}
                            </div>
                            <ArrowRight className="w-4 h-4 text-muted-foreground shrink-0" />
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>

          {/* Therapist card */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-card rounded-2xl p-5 sm:p-6 shadow-sm border border-border"
          >
            <h2 className="font-bold text-lg mb-4">Your AI Therapist</h2>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full gradient-btn flex items-center justify-center text-white font-bold">
                A
              </div>
              <div>
                <p className="font-bold">Aanya</p>
                <p className="text-xs text-muted-foreground">Health Companion · Multilingual</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mb-4">
              Speak in English, Hindi or Marathi. I'll listen with empathy and help you understand your symptoms.
            </p>
            <Button onClick={() => navigate('/chat')} className="w-full gradient-btn gap-2">
              <MessageCircle className="w-4 h-4" /> Start a session
            </Button>
          </motion.div>
        </div>
      </main>
    </div>
  );
}

function Stat({ icon: Icon, label, value }: { icon: typeof Crown; label: string; value: number | string }) {
  return (
    <div className="bg-muted/40 rounded-xl p-3 text-center">
      <Icon className="w-4 h-4 mx-auto mb-1 text-primary" />
      <p className="text-[10px] uppercase text-muted-foreground tracking-wide">{label}</p>
      <p className="font-bold text-lg">{value}</p>
    </div>
  );
}
