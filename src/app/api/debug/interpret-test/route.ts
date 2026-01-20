import { NextRequest, NextResponse } from 'next/server';
import { dailyQuotaManager, tarotInterpretationManager } from '@/storage/database';
import { llmConfig } from '@/config/llm';
import { DEMO_ACCOUNT } from '@/config/demo-account';
import { LLMClient, Config } from 'coze-coding-dev-sdk';

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  const results: any = {
    timestamp: new Date().toISOString(),
    tests: [],
    totalDuration: 0,
  };

  try {
    const body = await request.json();
    const { userId = 'demo-user-id', skipLLM = false } = body;

    console.log('=== Interpret Debug Test Started ===');
    console.log('[Request]', { userId, skipLLM });

    // Test 1: Quota Check
    console.log('[Test 1] Checking quota...');
    const quotaStart = Date.now();
    try {
      const canInterpret = await dailyQuotaManager.canInterpret(userId);
      const quotaDuration = Date.now() - quotaStart;

      results.tests.push({
        name: 'Quota Check',
        status: 'success',
        duration: quotaDuration,
        data: { canInterpret, userId, isDemo: userId === DEMO_ACCOUNT.id },
      });
      console.log('[Test 1] Success:', { canInterpret, duration: quotaDuration });
    } catch (error) {
      const quotaDuration = Date.now() - quotaStart;
      results.tests.push({
        name: 'Quota Check',
        status: 'failed',
        duration: quotaDuration,
        error: error instanceof Error ? error.message : String(error),
      });
      console.error('[Test 1] Failed:', error);
    }

    // Test 2: LLM Client Initialization (if not skipped)
    if (!skipLLM) {
      console.log('[Test 2] Testing LLM client...');
      const llmStart = Date.now();
      try {
        const config = new Config();
        const client = new LLMClient(config);

        // Send a simple test request
        const testPrompt = 'Hello, please respond with "Test successful"';
        const stream = client.stream(
          [
            { role: 'system', content: 'You are a test assistant.' },
            { role: 'user', content: testPrompt },
          ],
          {
            temperature: 0.1,
            thinking: llmConfig.thinking,
            model: llmConfig.model,
          }
        );

        let responseText = '';
        let chunkCount = 0;
        for await (const chunk of stream) {
          if (chunk.content) {
            responseText += chunk.content.toString();
            chunkCount++;
          }
        }

        const llmDuration = Date.now() - llmStart;

        results.tests.push({
          name: 'LLM Client',
          status: 'success',
          duration: llmDuration,
          data: {
            model: llmConfig.model,
            responseLength: responseText.length,
            chunkCount,
            responsePreview: responseText.substring(0, 100),
          },
        });
        console.log('[Test 2] Success:', { duration: llmDuration, responseLength: responseText.length });
      } catch (error) {
        const llmDuration = Date.now() - llmStart;
        results.tests.push({
          name: 'LLM Client',
          status: 'failed',
          duration: llmDuration,
          error: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined,
        });
        console.error('[Test 2] Failed:', error);
      }
    }

    // Test 3: Database Write (Test Create Interpretation)
    console.log('[Test 3] Testing database write...');
    const dbStart = Date.now();
    try {
      const testInterpretation = await tarotInterpretationManager.createInterpretation({
        userId: userId + '-test',
        question: 'Debug test question',
        spreadType: 'single',
        cards: JSON.stringify([{ id: 0, name: 'Test Card', isReversed: false }]),
        interpretation: 'This is a debug test interpretation.',
      });
      const dbDuration = Date.now() - dbStart;

      results.tests.push({
        name: 'Database Write',
        status: 'success',
        duration: dbDuration,
        data: {
          interpretationId: testInterpretation.id,
          userId: testInterpretation.userId,
          question: testInterpretation.question,
        },
      });
      console.log('[Test 3] Success:', { duration: dbDuration, id: testInterpretation.id });
    } catch (error) {
      const dbDuration = Date.now() - dbStart;
      results.tests.push({
        name: 'Database Write',
        status: 'failed',
        duration: dbDuration,
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });
      console.error('[Test 3] Failed:', error);
    }

    // Test 4: Database Read (Test Get Interpretations)
    console.log('[Test 4] Testing database read...');
    const readStart = Date.now();
    try {
      const interpretations = await tarotInterpretationManager.getInterpretationsByUserId(userId, 1);
      const readDuration = Date.now() - readStart;

      results.tests.push({
        name: 'Database Read',
        status: 'success',
        duration: readDuration,
        data: {
          count: interpretations.length,
          hasData: interpretations.length > 0,
        },
      });
      console.log('[Test 4] Success:', { duration: readDuration, count: interpretations.length });
    } catch (error) {
      const readDuration = Date.now() - readStart;
      results.tests.push({
        name: 'Database Read',
        status: 'failed',
        duration: readDuration,
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });
      console.error('[Test 4] Failed:', error);
    }

    results.totalDuration = Date.now() - startTime;
    results.summary = {
      totalTests: results.tests.length,
      successCount: results.tests.filter((t: any) => t.status === 'success').length,
      failedCount: results.tests.filter((t: any) => t.status === 'failed').length,
    };

    console.log('=== Interpret Debug Test Completed ===', results.summary);

    return NextResponse.json(results);
  } catch (error) {
    console.error('[Interpret Debug Test Error]', error);
    return NextResponse.json(
      {
        error: 'Debug test failed',
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        results,
      },
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
