import { NextRequest } from 'next/server';
import { supabase } from '@/lib/supabase-client';
import { createErrorResponse, createSuccessResponse } from '@/lib/auth-utils';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Get top players by diamonds
    const { data: players, error } = await supabase
      .from('profiles')
      .select('id, username, avatar_url, diamonds, total_bets, won_bets')
      .order('diamonds', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Leaderboard fetch error:', error);
      return createErrorResponse('Failed to fetch leaderboard', 500);
    }

    // Add rank and win rate
    const leaderboard = (players || []).map((player, index) => ({
      rank: offset + index + 1,
      id: player.id,
      username: player.username,
      avatar_url: player.avatar_url,
      diamonds: player.diamonds,
      total_bets: player.total_bets,
      won_bets: player.won_bets,
      win_rate: player.total_bets > 0
        ? Math.round((player.won_bets / player.total_bets) * 100)
        : 0,
    }));

    return createSuccessResponse({
      leaderboard,
      total: leaderboard.length,
      offset,
      limit,
    });

  } catch (error: any) {
    console.error('Leaderboard error:', error);
    return createErrorResponse('Internal server error', 500);
  }
}
