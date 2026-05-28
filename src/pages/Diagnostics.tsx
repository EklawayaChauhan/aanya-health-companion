import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, XCircle, Loader2, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/medtalk-chat`;

type LangCode = 'en' | 'hi' | 'mr';

type Result = {
  lang: LangCode;
  label: string;
  status: 'idle' | 'running' | 'ok' | 'fail';
  httpStatus?: number;
  ttfbMs?: number;
  totalMs?: number;
  chunks?: number;
  chars?: number;
  preview?: string;
  error?: string;
};

const TESTS: { lang: LangCode; label: string; prompt: string }[] = [
  { lang: 'en', label: 'English (en-IN)', prompt: 'Reply with a one-sentence friendly greeting.' },
  { lang: 'hi', label: 'Hindi (हिंदी)', prompt: 'एक छोटे वाक्य में नमस्ते कहें।' },
  { lang: 'mr', label: 'Marathi (मराठी)', prompt: 'एका छोट्या वाक्यात नमस्कार म्हणा.' },
];

export default function Diagnostics() {
  const navigate = useNavigate();
  const [results, setResults] = useState<Record<LangCode, Result>>({
    en: { lang: 'en', label: TESTS[0].label, status: 'idle' },
    hi: { lang: 'hi', label: TESTS[1].label, status: 'idle' },
    mr: { lang: 'mr', label: TESTS[2].label, status: 'idle' },
  });
  const [running, setRunning] = useState(false);

  const update = (lang: LangCode, patch: Partial<Result>) =>
    setResults((prev) => ({ ...prev, [lang]: { ...prev[lang], ...patch } }));

  async function runOne(test: typeof TESTS[number]) {
    const { lang, prompt } = test;
    update(lang, { status: 'running', error: undefined, preview: '', chunks: 0, chars: 0, ttfbMs: undefined, totalMs: undefined, httpStatus: undefined });
    const t0 = performance.now();
    try {
      const resp = await fetch(CHAT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ messages: [{ role: 'user', content: prompt }], language: lang }),
      });
      update(lang, { httpStatus: resp.status });
      if (!resp.ok || !resp.body) {
        const txt = await resp.text().catch(() => '');
        throw new Error(`HTTP ${resp.status} ${txt.slice(0, 120)}`);
      }
      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let text = '';
      let chunks = 0;
      let ttfb: number | undefined;
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        if (ttfb === undefined) {
          ttfb = Math.round(performance.now() - t0);
          update(lang, { ttfbMs: ttfb });
        }
        buffer += decoder.decode(value, { stream: true });
        let idx: number;
        while ((idx = buffer.indexOf('\n')) !== -1) {
          let line = buffer.slice(0, idx);
          buffer = buffer.slice(idx + 1);
          if (line.endsWith('\r')) line = line.slice(0, -1);
          if (!line.startsWith('data: ')) continue;
          const json = line.slice(6).trim();
          if (json === '[DONE]') continue;
          try {
            const parsed = JSON.parse(json);
            const delta = parsed.choices?.[0]?.delta?.content;
            if (delta) {
              chunks += 1;
              text += delta;
              update(lang, { chunks, chars: text.length, preview: text.slice(0, 160) });
            }
          } catch { /* partial */ }
        }
      }
      const total = Math.round(performance.now() - t0);
      update(lang, { status: text ? 'ok' : 'fail', totalMs: total, error: text ? undefined : 'No content received' });
    } catch (e) {
      update(lang, { status: 'fail', error: e instanceof Error ? e.message : 'Unknown error', totalMs: Math.round(performance.now() - t0) });
    }
  }

  async function runAll() {
    setRunning(true);
    for (const t of TESTS) await runOne(t);
    setRunning(false);
  }

  const allOk = Object.values(results).every((r) => r.status === 'ok');
  const anyFail = Object.values(results).some((r) => r.status === 'fail');

  return (
    <div className="min-h-screen chat-dark-bg text-slate-100 px-4 py-6 sm:py-10">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate('/')} className="rounded-full text-slate-200 hover:bg-white/10 hover:text-white">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-teal-300" />
            <h1 className="text-xl sm:text-2xl font-bold">Diagnostics</h1>
          </div>
        </div>

        <Card className="chat-glass-dark border-white/10 p-5 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <p className="text-sm text-slate-300">AI Gateway + streaming health</p>
              <p className="text-xs text-slate-500 mt-1 break-all">{CHAT_URL}</p>
            </div>
            <Button onClick={runAll} disabled={running} className="rounded-full send-btn-glow">
              {running ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              {running ? 'Running…' : 'Run all tests'}
            </Button>
          </div>
          {!running && (allOk || anyFail) && (
            <div className={`mt-4 text-sm flex items-center gap-2 ${allOk ? 'text-emerald-300' : 'text-rose-300'}`}>
              {allOk ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
              {allOk ? 'All systems operational.' : 'One or more checks failed.'}
            </div>
          )}
        </Card>

        <div className="space-y-4">
          {TESTS.map((t) => {
            const r = results[t.lang];
            return (
              <Card key={t.lang} className="chat-glass-dark border-white/10 p-5">
                <div className="flex items-center justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2">
                    {r.status === 'ok' && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
                    {r.status === 'fail' && <XCircle className="w-5 h-5 text-rose-400" />}
                    {r.status === 'running' && <Loader2 className="w-5 h-5 text-teal-300 animate-spin" />}
                    {r.status === 'idle' && <div className="w-5 h-5 rounded-full border border-slate-600" />}
                    <span className="font-semibold">{t.label}</span>
                  </div>
                  <Button size="sm" variant="ghost" onClick={() => runOne(t)} disabled={r.status === 'running'} className="text-slate-200 hover:bg-white/10">
                    Retest
                  </Button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <Stat label="HTTP" value={r.httpStatus ?? '—'} />
                  <Stat label="TTFB" value={r.ttfbMs != null ? `${r.ttfbMs}ms` : '—'} />
                  <Stat label="Total" value={r.totalMs != null ? `${r.totalMs}ms` : '—'} />
                  <Stat label="Chunks / chars" value={`${r.chunks ?? 0} / ${r.chars ?? 0}`} />
                </div>
                {r.preview && (
                  <div className="mt-3 text-sm bg-black/30 rounded-lg p-3 text-slate-200 border border-white/5">
                    {r.preview}
                  </div>
                )}
                {r.error && (
                  <div className="mt-3 text-sm text-rose-300">{r.error}</div>
                )}
              </Card>
            );
          })}
        </div>

        <p className="text-xs text-slate-500 mt-6">
          Tests call the medtalk-chat edge function with a short prompt per language and validate SSE streaming.
        </p>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-lg bg-white/5 border border-white/5 px-3 py-2">
      <div className="text-[10px] uppercase tracking-wider text-slate-400">{label}</div>
      <div className="text-slate-100 font-medium mt-0.5">{value}</div>
    </div>
  );
}
