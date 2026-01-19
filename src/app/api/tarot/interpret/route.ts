import { NextRequest, NextResponse } from 'next/server';
import { LLMClient, Config } from 'coze-coding-dev-sdk';
import { dailyQuotaManager, tarotInterpretationManager } from '@/storage/database';
import { llmConfig } from '@/config';
import type { TarotCard, Spread, SpreadPosition } from '@/lib/tarot';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, question, spread, cards }: { userId: string; question: string; spread: Spread; cards: TarotCard[] } = body;

    if (!userId || !question || !spread || !cards || cards.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // 检查每日限额
    const canInterpret = await dailyQuotaManager.canInterpret(userId);
    if (!canInterpret) {
      return NextResponse.json(
        { error: '今日解读次数已用完，请明天再来' },
        { status: 429 }
      );
    }

    const config = new Config();
    const client = new LLMClient(config);

    const cardsInfo = cards
      .map((card, index) => {
        const position = spread.positions[index];
        return `${index + 1}. ${position?.name}（${position?.description}）：${card.name} ${card.isReversed ? '（逆位）' : ''} - ${card.isReversed ? card.reversedMeaning : card.meaning}`;
      })
      .join('\n');

    const userPrompt = `用户的问题：${question}

牌阵：${spread.name}
${cardsInfo}

请根据以上信息为用户提供专业的塔罗牌解读。`;

    const stream = client.stream(
      [
        { role: 'system', content: llmConfig.systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      {
        temperature: llmConfig.temperature,
        thinking: llmConfig.thinking,
        model: llmConfig.model,
      }
    );

    const encoder = new TextEncoder();
    let fullInterpretation = '';

    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            if (chunk.content) {
              const text = chunk.content.toString();
              fullInterpretation += text;
              controller.enqueue(encoder.encode(text));
            }
          }

          // 保存解读记录并使用限额
          await tarotInterpretationManager.createInterpretation({
            userId,
            question,
            spreadType: spread.id,
            cards: JSON.stringify(cards),
            interpretation: fullInterpretation,
          });

          await dailyQuotaManager.useQuota(userId);

          controller.close();
        } catch (error) {
          controller.error(error);
        }
      },
    });

    return new NextResponse(readableStream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Transfer-Encoding': 'chunked',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Error in interpret route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
