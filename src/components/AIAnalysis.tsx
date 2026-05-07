'use client';

import { useState } from 'react';
import { Card } from '@/components/UI';

interface AIAnalysis {
  score: number;
  summary: string;
  strengths: string[];
  suggestions: string[];
  deeperQuestion: string;
  emotionalTone: 'thoughtful' | 'struggling' | 'optimistic' | 'candid' | 'rushed';
  wordCount: number;
}

interface Props {
  dayNumber: number;
  answer: string;
}

const toneLabels: Record<string, string> = {
  thoughtful: '🧠 深度思考',
  struggling: '🌧️ 正在挣扎',
  optimistic: '☀️ 积极乐观',
  candid: '💬 坦诚直率',
  rushed: '⏳ 匆忙写下',
};

const toneMessages: Record<string, string> = {
  thoughtful: '你今天写得很认真，这种深度自省本身就是一种修行。',
  struggling: '挣扎是成长的信号。你在诚实面对自己，这比假装一切都好更需要勇气。',
  optimistic: '你的积极能量很有感染力。保持这份明亮，也别忘了偶尔停下来审视阴影。',
  candid: '真诚比完美更重要。你写下的每一个字都是对真实的靠近。',
  rushed: '即使只是短暂停留，也是好的。有时候一个念头就足以照亮一整天的方向。',
};

export default function AIAnalysisCard({ dayNumber, answer }: Props) {
  const [analysis, setAnalysis] = useState<AIAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchAnalysis = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ day_number: dayNumber, answer }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || '分析失败');
      } else {
        setAnalysis(data.analysis);
      }
    } catch {
      setError('网络错误，请稍后再试');
    } finally {
      setLoading(false);
    }
  };

  // Score color
  const scoreColor = (s: number) => {
    if (s >= 8) return 'text-emerald-600';
    if (s >= 6) return 'text-sage';
    if (s >= 4) return 'text-amber-600';
    return 'text-red-400';
  };

  if (!analysis) {
    return (
      <Card className="mb-8 bg-gradient-to-br from-indigo-50/50 to-sage/5 border-indigo-100/50">
        <div className="text-center py-6">
          <div className="text-4xl mb-3">🤖</div>
          <h3 className="font-serif text-lg font-bold text-ink mb-2">
            AI 深度分析
          </h3>
          <p className="text-sm text-muted mb-4 max-w-sm mx-auto leading-relaxed">
            让 AI 导师帮你分析今天的反思，获得更深层的洞察和追问。
          </p>
          <button
            onClick={fetchAnalysis}
            disabled={loading}
            className="px-6 py-2.5 bg-indigo-500 text-white rounded-xl font-medium hover:bg-indigo-600 transition-colors disabled:opacity-50"
          >
            {loading ? '分析中...' : '✨ 开始分析'}
          </button>
          {error && <p className="text-xs text-red-400 mt-3">{error}</p>}
        </div>
      </Card>
    );
  }

  return (
    <Card className="mb-8 animate-fade-in border-sage/20">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-warm">
        <h3 className="font-serif text-lg font-bold text-ink flex items-center gap-2">
          🤖 AI 分析
        </h3>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted">洞察深度</span>
          <span className={`text-2xl font-bold ${scoreColor(analysis.score)}`}>
            {analysis.score}
          </span>
          <span className="text-xs text-muted">/10</span>
        </div>
      </div>

      {/* Tone */}
      <div className="mb-4 text-sm text-muted">
        {toneLabels[analysis.emotionalTone]} · {analysis.wordCount} 字
      </div>
      <p className="text-sm text-ink mb-4 leading-relaxed italic">
        {toneMessages[analysis.emotionalTone]}
      </p>

      {/* Summary */}
      <div className="bg-warm/50 rounded-xl p-4 mb-4">
        <h4 className="text-xs font-bold text-muted uppercase tracking-wider mb-2">📖 总评</h4>
        <p className="text-sm text-ink leading-relaxed">{analysis.summary}</p>
      </div>

      {/* Strengths */}
      <div className="mb-4">
        <h4 className="text-xs font-bold text-muted uppercase tracking-wider mb-2">✨ 亮点</h4>
        <ul className="space-y-1.5">
          {analysis.strengths.map((s, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-ink">
              <span className="text-sage mt-0.5">•</span>
              <span>{s}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Suggestions */}
      <div className="mb-4">
        <h4 className="text-xs font-bold text-muted uppercase tracking-wider mb-2">💡 思考方向</h4>
        <ul className="space-y-1.5">
          {analysis.suggestions.map((s, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-ink">
              <span className="text-amber-500 mt-0.5">→</span>
              <span>{s}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Deeper Question */}
      <div className="bg-indigo-50/50 rounded-xl p-4 border border-indigo-100/50">
        <h4 className="text-xs font-bold text-muted uppercase tracking-wider mb-2">🔮 追问</h4>
        <p className="font-serif text-ink font-medium leading-relaxed text-sm sm:text-base">
          {analysis.deeperQuestion}
        </p>
        <p className="text-xs text-muted mt-2">
          不急着回答。让这个问题在心里停留一天。
        </p>
      </div>
    </Card>
  );
}

// Re-export the type for use in parent components
export type { AIAnalysis };
