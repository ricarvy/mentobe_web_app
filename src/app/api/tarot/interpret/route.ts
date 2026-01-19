import { NextRequest, NextResponse } from 'next/server';
import { LLMClient, Config } from 'coze-coding-dev-sdk';
import { dailyQuotaManager, tarotInterpretationManager } from '@/storage/database';
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

    const systemPrompt = `你是一位专业的塔罗牌解读师，拥有丰富的经验和深刻的洞察力。你的任务是：
1. 根据用户的问题和抽出的牌面，提供专业、深入、有启发性的解读
2. 结合每张牌的含义和位置，分析它们之间的关联和整体含义
3. 给出实用的建议和指导
4. 语言要温暖、富有同理心，同时保持神秘和专业的风格
5. 解读要全面但不冗长，重点突出

解读格式：
- 开头：简要概括整体牌面氛围
- 中间：逐张牌的详细解读（结合位置含义）
- 结尾：整体分析和建议`;

    const userPrompt = `用户的问题：${question}

牌阵：${spread.name}
${cardsInfo}

请根据以上信息为用户提供专业的塔罗牌解读。`;

    const stream = client.stream(
      [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      {
        temperature: 0.8,
        thinking: 'enabled',
        model: 'doubao-seed-1-6-thinking-250715',
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
