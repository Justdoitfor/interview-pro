export interface QwenChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface QwenChatRequest {
  apiKey: string;
  baseUrl: string;
  model: string;
  messages: QwenChatMessage[];
  temperature?: number;
}

export async function generateQwenAnswer(req: QwenChatRequest): Promise<string> {
  const res = await fetch(req.baseUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${req.apiKey}`,
    },
    body: JSON.stringify({
      model: req.model,
      messages: req.messages,
      temperature: req.temperature ?? 0.4,
      stream: false,
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(text || `Qwen API 请求失败: ${res.status}`);
  }

  const data = await res.json();
  const content = data?.choices?.[0]?.message?.content;
  if (typeof content !== 'string' || !content.trim()) {
    throw new Error('Qwen API 未返回有效内容');
  }
  return content.trim();
}

