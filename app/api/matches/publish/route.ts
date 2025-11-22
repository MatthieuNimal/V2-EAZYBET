import { NextRequest, NextResponse } from 'next/server';
import { importAllCompetitions } from '@/lib/odds-api-service';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 60;

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const expectedToken = process.env.CRON_SECRET || 'publish-matches-secret';

    if (authHeader && authHeader !== `Bearer ${expectedToken}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('[PUBLISH-MATCHES] Starting import from The Odds API...');

    const results = await importAllCompetitions();

    const totalImported = results.reduce((sum, r) => sum + r.imported, 0);
    const totalSkipped = results.reduce((sum, r) => sum + r.skipped, 0);
    const totalErrors = results.reduce((sum, r) => sum + r.errors.length, 0);

    console.log(`[PUBLISH-MATCHES] Import complete: ${totalImported} imported, ${totalSkipped} skipped, ${totalErrors} errors`);

    return NextResponse.json({
      success: true,
      summary: {
        total_imported: totalImported,
        total_skipped: totalSkipped,
        total_errors: totalErrors,
      },
      results,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('[PUBLISH-MATCHES] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to publish matches',
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  return GET(request);
}
