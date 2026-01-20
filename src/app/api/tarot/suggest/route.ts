import { NextRequest } from 'next/server';
import { LLMClient, Config } from 'coze-coding-dev-sdk';
import { llmConfig } from '@/config';
import type { TarotCard } from '@/lib/tarot';
import {
  withErrorHandler,
  createSuccessResponse,
  ApiError,
  ERROR_CODES,
} from '@/lib/api-response';

export async function POST(request: NextRequest) {
  return withErrorHandler(async () => {
    const body = await request.json();
    const { question, cards, interpretation }: { question: string; cards: TarotCard[]; interpretation: string } = body;

    if (!question || !cards || !interpretation) {
      throw new ApiError(
        ERROR_CODES.INVALID_REQUEST,
        'Missing required fields'
      );
    }

    const config = new Config();
    const client = new LLMClient(config);

    const systemPrompt = `你是一位专业的塔罗牌解读师和人生导师。你的任务是：
1. 根据用户的原始问题和塔罗牌解读结果，分析用户可能关心的其他相关问题
2. 为用户提供3-4个相关的探索方向或问题
3. 每个方向都要简要说明为什么这个问题值得关注
4. 语言要温暖、富有同理心，鼓励用户进一步探索
5. 保持神秘而专业的风格

回答格式：
- 简要回顾用户的问题和主要关注点
- 提出3-4个相关的探索方向，每个方向包含：
  * 问题名称
  * 为什么这个问题值得关注
  * 与当前问题的关联
- 鼓励的话语`;

    const userPrompt = `用户原始问题：${question}

抽出的牌面：
${cards.map((card, index) => `${index + 1}. ${card.name} ${card.isReversed ? '（逆位）' : ''}`).join('\n')}

塔罗牌解读：
${interpretation}

请基于以上信息，为用户提供其他值得探索的相关问题方向。`;

    const response = await client.invoke(
      [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      {
        temperature: llmConfig.temperature,
        model: llmConfig.model,
      }
    );

    return Response.json(createSuccessResponse({ suggestion: response.content }));
  });
}
