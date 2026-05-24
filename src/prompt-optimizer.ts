import { callLLM } from './llm-service';
import type { Scene } from './types';

export interface PromptOptimizationRequest {
  systemPrompt: string;
  userPrompt: string;
  sceneType: Scene['type'];
  sceneName: string;
  variables: Record<string, string>;
  provider: string;
  apiKey: string;
}

export interface PromptOptimizationResult {
  originalPrompt: string;
  optimizedPrompt: string;
  optimizedSystemPrompt: string;
  optimizedUserPrompt: string;
  improvements: string[];
  model: string;
}

interface ParsedOptimization {
  optimizedSystemPrompt?: unknown;
  optimizedUserPrompt?: unknown;
  improvements?: unknown;
}

const FALLBACK_IMPROVEMENT = '优化模型返回格式无法解析，已使用原始提示词。';

export async function optimizePrompt(request: PromptOptimizationRequest): Promise<PromptOptimizationResult> {
  const originalPrompt = formatPrompt(request.systemPrompt, request.userPrompt);

  try {
    const response = await callLLM({
      systemPrompt: '你是一位提示词优化专家和事实审查编辑。你的任务是改写提示词，让它更清晰、具体、可执行，同时保持用户意图不变，并要求最终回答避免过度绝对化、标明必要假设、区分确定事实与近似解释。只返回 JSON，不要返回 Markdown 或解释。',
      userPrompt: buildOptimizationPrompt(request),
      apiKey: request.apiKey,
      provider: request.provider,
      temperature: 0.2,
      maxTokens: 1600,
    });

    const parsed = parseOptimizationResponse(response);
    if (!parsed) {
      return fallbackResult(request, originalPrompt);
    }

    const optimizedPrompt = formatPrompt(parsed.optimizedSystemPrompt, parsed.optimizedUserPrompt, parsed.improvements);

    return {
      originalPrompt,
      optimizedPrompt,
      optimizedSystemPrompt: parsed.optimizedSystemPrompt,
      optimizedUserPrompt: parsed.optimizedUserPrompt,
      improvements: parsed.improvements,
      model: request.provider,
    };
  } catch {
    return fallbackResult(request, originalPrompt);
  }
}

export function formatPrompt(systemPrompt: string, userPrompt: string, improvements: string[] = []): string {
  const sections = [`[System]\n${systemPrompt}`, `[User]\n${userPrompt}`];

  if (improvements.length > 0) {
    sections.push(`[Improvements]\n${improvements.map(item => `- ${item}`).join('\n')}`);
  }

  return sections.join('\n\n');
}

function buildOptimizationPrompt(request: PromptOptimizationRequest): string {
  return `请优化下面这个 ${request.sceneType === 'image' ? '图像' : '文本'} 场景的提示词。\n\n场景名称: ${request.sceneName}\n变量: ${JSON.stringify(request.variables, null, 2)}\n\n当前 System Prompt:\n${request.systemPrompt}\n\n当前 User Prompt:\n${request.userPrompt}\n\n要求:\n1. 保留原始任务目标和所有关键约束。\n2. 让输出结构更明确，减少歧义。\n3. 不要添加用户没有要求的事实。\n4. 主动审查提示词是否会诱导过度绝对化、伪精确或忽略适用条件；如有风险，在优化后的提示词中要求最终回答说明关键假设和限制。\n5. 对科学、工程、医学、法律、金融等专业主题，要求最终回答区分“严格成立的条件”和“便于理解的近似说法”。\n6. 返回严格 JSON，格式如下：\n{\n  "optimizedSystemPrompt": "优化后的 system prompt",\n  "optimizedUserPrompt": "优化后的 user prompt",\n  "improvements": ["改进点1", "改进点2"]\n}`;
}

function parseOptimizationResponse(response: string): { optimizedSystemPrompt: string; optimizedUserPrompt: string; improvements: string[] } | null {
  const cleaned = stripJsonFence(response);

  try {
    const parsed = JSON.parse(cleaned) as ParsedOptimization;
    if (typeof parsed.optimizedSystemPrompt !== 'string' || !parsed.optimizedSystemPrompt.trim()) {
      return null;
    }
    if (typeof parsed.optimizedUserPrompt !== 'string' || !parsed.optimizedUserPrompt.trim()) {
      return null;
    }
    if (!Array.isArray(parsed.improvements)) {
      return null;
    }

    const improvements = parsed.improvements.filter((item): item is string => typeof item === 'string' && item.trim().length > 0);

    return {
      optimizedSystemPrompt: parsed.optimizedSystemPrompt.trim(),
      optimizedUserPrompt: parsed.optimizedUserPrompt.trim(),
      improvements,
    };
  } catch {
    return null;
  }
}

function stripJsonFence(value: string): string {
  const trimmed = value.trim();
  const fenced = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
  return fenced ? fenced[1].trim() : trimmed;
}

function fallbackResult(request: PromptOptimizationRequest, originalPrompt: string): PromptOptimizationResult {
  return {
    originalPrompt,
    optimizedPrompt: formatPrompt(request.systemPrompt, request.userPrompt, [FALLBACK_IMPROVEMENT]),
    optimizedSystemPrompt: request.systemPrompt,
    optimizedUserPrompt: request.userPrompt,
    improvements: [FALLBACK_IMPROVEMENT],
    model: request.provider,
  };
}
