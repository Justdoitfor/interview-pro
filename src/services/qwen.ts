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

export async function generateQwenAnswerStream(
  req: QwenChatRequest,
  onDelta: (delta: string) => void
): Promise<string> {
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
      stream: true,
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(text || `Qwen API 请求失败: ${res.status}`);
  }

  const reader = res.body?.getReader();
  if (!reader) {
    throw new Error('Qwen API 流式响应不可用');
  }

  const decoder = new TextDecoder('utf-8');
  let buffer = '';
  let out = '';

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      const raw = line.trim();
      if (!raw) continue;
      if (!raw.startsWith('data:')) continue;

      const dataStr = raw.slice(5).trim();
      if (!dataStr) continue;
      if (dataStr === '[DONE]') {
        buffer = '';
        break;
      }

      let parsed: any;
      try {
        parsed = JSON.parse(dataStr);
      } catch {
        continue;
      }

      const delta: string =
        parsed?.choices?.[0]?.delta?.content ??
        parsed?.choices?.[0]?.message?.content ??
        '';
      if (!delta) continue;
      out += delta;
      onDelta(delta);
    }
  }

  const final = out.trim();
  if (!final) throw new Error('Qwen API 未返回有效内容');
  return final;
}
