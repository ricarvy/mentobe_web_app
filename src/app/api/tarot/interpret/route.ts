import { NextRequest } from 'next/server';
import { LLMClient, Config } from 'coze-coding-dev-sdk';
import { dailyQuotaManager, tarotInterpretationManager } from '@/storage/database';
import { llmConfig } from '@/config';
import type { TarotCard, Spread } from '@/lib/tarot';
import {
  ApiError,
  ERROR_CODES,
} from '@/lib/api-response';

export async function POST(request: NextRequest) {
  console.log('=== /api/tarot/interpret 开始处理请求 ===');

  try {
    console.log('[1] 解析请求体...');
    const body = await request.json();
    console.log('[1.1] 请求体内容:', JSON.stringify({
      userId: body.userId,
      question: body.question,
      spread: body.spread,
      cards: body.cards
    }));

    const { userId, question, spread, cards }: { userId: string; question: string; spread: Spread; cards: TarotCard[] } = body;

    console.log('[2] 验证必填字段...');
    if (!userId || !question || !spread || !cards || cards.length === 0) {
      console.log('[2.1] 验证失败 - 缺少必填字段');
      throw new ApiError(
        ERROR_CODES.INVALID_REQUEST,
        'Missing required fields'
      );
    }

    console.log('[3] 检查每日限额...');
    // 检查每日限额
    const canInterpret = await dailyQuotaManager.canInterpret(userId);
    console.log('[3.1] 限额检查结果:', canInterpret);

    if (!canInterpret) {
      console.log('[3.2] 配额已用完');
      throw new ApiError(
        ERROR_CODES.QUOTA_EXCEEDED,
        '今日解读次数已用完，请明天再来'
      );
    }

    console.log('[4] 准备 LLM 配置...');
    const config = new Config();
    const client = new LLMClient(config);

    console.log('[5] 构建用户提示词...');
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

    console.log('[6] 调用 LLM 流式接口...');
    console.log('[6.1] LLM 配置:', {
      model: llmConfig.model,
      temperature: llmConfig.temperature,
      thinking: llmConfig.thinking,
      systemPromptLength: llmConfig.systemPrompt.length,
      userPromptLength: userPrompt.length
    });

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

    console.log('[7] 创建可读流...');
    const readableStream = new ReadableStream({
      async start(controller) {
        console.log('[7.1] 流式响应开始...');
        try {
          let chunkCount = 0;
          for await (const chunk of stream) {
            chunkCount++;
            if (chunk.content) {
              const text = chunk.content.toString();
              fullInterpretation += text;
              controller.enqueue(encoder.encode(text));

              if (chunkCount % 10 === 0) {
                console.log(`[7.2] 已接收 ${chunkCount} 个数据块, 当前内容长度: ${fullInterpretation.length}`);
              }
            }
          }

          console.log(`[7.3] 流式响应完成，共接收 ${chunkCount} 个数据块，总长度: ${fullInterpretation.length}`);

          // 保存解读记录并使用限额
          console.log('[8] 保存解读记录...');
          await tarotInterpretationManager.createInterpretation({
            userId,
            question,
            spreadType: spread.id,
            cards: JSON.stringify(cards),
            interpretation: fullInterpretation,
          });
          console.log('[8.1] 解读记录保存成功');

          console.log('[9] 更新限额...');
          await dailyQuotaManager.useQuota(userId);
          console.log('[9.1] 限额更新成功');

          controller.close();
          console.log('[7.4] 流控制器已关闭');
        } catch (error) {
          console.error('[7.5] 流处理错误:', error);
          console.error('[7.6] 错误堆栈:', error instanceof Error ? error.stack : 'No stack');
          controller.error(error);
        }
      },
    });

    console.log('[10] 返回流式响应...');
    return new Response(readableStream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Transfer-Encoding': 'chunked',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('=== /api/tarot/interpret 发生错误 ===');
    console.error('[错误类型]:', error instanceof Error ? error.constructor.name : typeof error);
    console.error('[错误消息]:', error instanceof Error ? error.message : String(error));
    console.error('[错误堆栈]:', error instanceof Error ? error.stack : 'No stack');
    console.error('[错误详情]:', JSON.stringify(error, Object.getOwnPropertyNames(error)));

    // 返回200状态码，错误信息在响应体中
    const errorResponse = {
      success: false,
      error: {
        code: error instanceof ApiError ? error.code : ERROR_CODES.INTERNAL_ERROR,
        message: error instanceof ApiError ? error.message : '服务器繁忙，请稍后再试',
        details: error instanceof Error ? error.message : String(error),
      },
    };

    return new Response(JSON.stringify(errorResponse), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}
