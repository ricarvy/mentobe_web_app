import { NextRequest, NextResponse } from 'next/server';
import { tarotInterpretationManager } from '@/storage/database';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'Missing userId' },
        { status: 400 }
      );
    }

    const interpretations = await tarotInterpretationManager.getInterpretationsByUserId(userId, 20);

    return NextResponse.json({ interpretations });
  } catch (error) {
    console.error('Error fetching history:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack');

    return NextResponse.json(
      { error: 'Failed to fetch history' },
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
