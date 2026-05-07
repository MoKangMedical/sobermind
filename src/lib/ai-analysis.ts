// DeepSeek API integration for SoberMind
// Provides AI-powered analysis and feedback on user's daily reflections

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || '';
const DEEPSEEK_BASE_URL = 'https://api.deepseek.com';

export interface AIAnalysisRequest {
  userAnswer: string;
  lessonTitle: string;
  lessonCategory: string;
  lessonQuestion: string;
  dayNumber: number;
  userHistory?: string[]; // previous answers for context
}

export interface AIAnalysisResult {
  score: number; // 1-10 insight score
  summary: string; // AI's understanding of what they wrote
  strengths: string[]; // What they did well
  suggestions: string[]; // How to deepen reflection
  deeperQuestion: string; // A follow-up question
  emotionalTone: 'thoughtful' | 'struggling' | 'optimistic' | 'candid' | 'rushed';
  wordCount: number;
}

const SYSTEM_PROMPT = `你是 SoberMind 清醒日课的 AI 导师——一位温和而深刻的苏格拉底式引导者。

你的角色：
- 你阅读用户每天的反思打卡，给出深度反馈
- 你不是评判者，而是镜子——帮用户看见自己思考中的盲点、亮点、深度
- 你的语气：温暖、直接、有见地，像一位智慧的朋友
- 你引用东方哲学和现代心理学，但不卖弄
- 你提出的追问比答案更多

你需要返回一个 JSON 对象（不要有任何其他内容，就是纯JSON）：
{
  "score": <1-10的整数，评估用户反思的深度，不是评判他们的"好坏">,
  "summary": "<2-3句话，总结你认为用户在表达什么，你在字里行间读到了什么>",
  "strengths": ["<用户做得好的方面1>", "<方面2>", "<方面3>"],
  "suggestions": ["<可以深化思考的方向1>", "<方向2>"],
  "deeperQuestion": "<一个值得用户继续思考的追问，比原问题更深一层>",
  "emotionalTone": "<thoughtful/struggling/optimistic/candid/rushed 中的一个>"
}`;

export async function analyzeReflection(
  req: AIAnalysisRequest
): Promise<AIAnalysisResult> {
  if (!DEEPSEEK_API_KEY) {
    return getFallbackAnalysis(req);
  }

  const historyContext = req.userHistory?.length
    ? `\n\n用户过去几天的反思摘录（供参考）：\n${req.userHistory.slice(-5).map((h, i) => `第${i+1}天: ${h.slice(0, 200)}`).join('\n')}`
    : '';

  const prompt = `今天的日课主题：「${req.lessonTitle}」  
所属分类：${req.lessonCategory}  
引导问题：${req.lessonQuestion}

用户的反思：
"""
${req.userAnswer}
"""
${historyContext}

请根据以上内容对用户的反思进行深度分析，返回 JSON。`;

  try {
    const response = await fetch(`${DEEPSEEK_BASE_URL}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: prompt },
        ],
        temperature: 0.7,
        max_tokens: 1500,
        response_format: { type: 'json_object' },
      }),
    });

    if (!response.ok) {
      console.error('DeepSeek API error:', response.status, await response.text());
      return getFallbackAnalysis(req);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) {
      return getFallbackAnalysis(req);
    }

    // Try to parse JSON — handle markdown code blocks
    let jsonStr = content.trim();
    if (jsonStr.startsWith('```')) {
      jsonStr = jsonStr.replace(/^```(?:json)?\s*/, '').replace(/\s*```$/, '');
    }
    const result = JSON.parse(jsonStr);

    return {
      score: Math.min(10, Math.max(1, Math.round(result.score) || 5)),
      summary: result.summary || '你表达了自己的思考和感受。',
      strengths: result.strengths || ['你诚实地写下了自己的想法'],
      suggestions: result.suggestions || ['可以试着把感受和行动更具体地联系起来'],
      deeperQuestion: result.deeperQuestion || '这个经历让你对自己有了什么新的认识？',
      emotionalTone: validateTone(result.emotionalTone),
      wordCount: req.userAnswer.length,
    };
  } catch (error) {
    console.error('AI analysis error:', error);
    return getFallbackAnalysis(req);
  }
}

/** Fallback analysis when API is unavailable */
function getFallbackAnalysis(req: AIAnalysisRequest): AIAnalysisResult {
  const len = req.userAnswer.length;
  let score = 4;
  let emotionalTone: AIAnalysisResult['emotionalTone'] = 'candid';

  if (len > 500) { score = 8; emotionalTone = 'thoughtful'; }
  else if (len > 300) { score = 7; emotionalTone = 'thoughtful'; }
  else if (len > 150) { score = 6; emotionalTone = 'optimistic'; }
  else if (len > 60) { score = 5; emotionalTone = 'candid'; }
  else { score = 3; emotionalTone = 'rushed'; }

  return {
    score,
    summary: '你写下了今天的反思（AI 分析暂未连接，这是基于长度的自动评估）。',
    strengths: ['你完成了今天的打卡', '你愿意停下来思考'],
    suggestions: ['尝试写得更具体一些——描述具体情境和感受', '可以联系今天日课的主题深入思考'],
    deeperQuestion: req.lessonQuestion,
    emotionalTone,
    wordCount: len,
  };
}

function validateTone(tone: string): AIAnalysisResult['emotionalTone'] {
  const valid = ['thoughtful', 'struggling', 'optimistic', 'candid', 'rushed'];
  return valid.includes(tone) ? tone as any : 'candid';
}
