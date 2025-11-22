import { NextRequest, NextResponse } from 'next/server';
import { processFinishedMatches } from '@/lib/bet-resolution-service';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const expectedToken = process.env.CRON_SECRET || 'auto-resolve-secret-key';

    if (authHeader !== `Bearer ${expectedToken}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('[AUTO-RESOLVE] Starting automatic match resolution...');

    const results = await processFinishedMatches();

    console.log(`[AUTO-RESOLVE] Processed ${results.length} matches`);

    return NextResponse.json({
      success: true,
      results,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('[AUTO-RESOLVE] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to resolve matches',
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  return GET(request);
}
