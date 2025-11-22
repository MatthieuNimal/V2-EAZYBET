import { NextRequest, NextResponse } from 'next/server';
import { processFinishedMatches } from '@/lib/bet-resolution-service';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    console.log('[CRON] Auto-resolve matches triggered');

    const results = await processFinishedMatches();

    return NextResponse.json({
      success: true,
      message: `Resolved ${results.length} matches`,
      results,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('[CRON] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to resolve matches',
      },
      { status: 500 }
    );
  }
}
