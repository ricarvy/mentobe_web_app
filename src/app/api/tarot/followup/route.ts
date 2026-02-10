import { NextRequest, NextResponse } from 'next/server';
import { LLMClient, Config } from 'coze-coding-dev-sdk';
import { llmConfig } from '@/config';
import {
  createSuccessResponse,
  createErrorResponse,
  ERROR_CODES
} from '@/lib/api-response';

export async function POST(request: NextRequest) {
  console.log('=== /api/tarot/followup 开始处理请求 ===');

  let body;
  try {
    body = await request.json();
    const { question, interpretation, spread, cards, lang } = body;

    if (!question || !interpretation) {
      return NextResponse.json(createErrorResponse(
        ERROR_CODES.INVALID_REQUEST,
        'Missing required fields: question or interpretation'
      ), { status: 400 });
    }

    const config = new Config();
    const client = new LLMClient(config);

    // 构建 Prompt
    const cardsInfo = Array.isArray(cards) ? cards.map((c: { name: string }) => c.name).join(', ') : '';
    const spreadName = spread?.name || '';
    const languageInstruction = lang === 'en' ? 'Please reply in English.' : (lang === 'ja' ? 'Please reply in Japanese.' : '请用中文回答。');

    const userPrompt = `用户的问题：${question}
牌阵：${spreadName}
抽出的牌：${cardsInfo}
此前的解读：${interpretation.substring(0, 500)}... (内容较长，已截取)

请根据以上信息，为用户推荐 2 个“追问问题”，这两个问题应该能够引导用户进一步探索他们当前困惑的深层原因或未来的行动方向。
请直接返回这两个问题，不要包含其他引导语或编号，每行一个问题。
${languageInstruction}`;

    console.log('[Followup] Calling LLM...');
    
    // 使用 Promise.race 实现超时控制 (5秒超时)
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('LLM request timed out')), 5000);
    });

    // 使用 stream 模式并拼接结果
    const streamPromise = client.stream(
      [
        { role: 'system', content: llmConfig.systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      {
        model: llmConfig.model,
        temperature: 0.7,
      }
    );

    const stream = await Promise.race([streamPromise, timeoutPromise]) as AsyncIterable<any>;

    let fullContent = '';
    for await (const chunk of stream) {
        if (chunk.content) {
            fullContent += chunk.content.toString();
        }
    }

    console.log('[Followup] LLM Response:', fullContent);

    // 解析返回的问题
    const questions = fullContent
      .split('\n')
      .map(line => line.replace(/^\d+\.\s*/, '').trim()) // Remove "1. " etc.
      .filter(line => line.length > 0 && !line.startsWith('*') && !line.startsWith('相关追问') && !line.startsWith('**'));

    if (questions.length === 0) {
      throw new Error('No valid questions generated');
    }

    return NextResponse.json(createSuccessResponse({
      questions: questions
    }));

  } catch (error) {
    console.error('Followup API Error:', error);
    
    // 降级处理：返回默认的通用追问问题，确保前端不报错
    const fallbackQuestions = body?.lang === 'en' 
      ? ['What detailed guidance does this card offer?', 'How can I apply this advice in daily life?']
      : ['这张牌对我目前的情况有什么具体的指引？', '我应该如何在日常生活中运用这个建议？'];
      
    return NextResponse.json(createSuccessResponse({
      questions: fallbackQuestions,
      isFallback: true
    }));
  }
}
