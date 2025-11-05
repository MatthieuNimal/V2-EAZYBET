import { NextRequest } from 'next/server';
import { supabase } from '@/lib/supabase-client';
import { requireAuth, createErrorResponse, createSuccessResponse } from '@/lib/auth-utils';

function calculateDiamonds(amount: number, odds: number): number {
  // Diamond formula: (amount × odds) / 10 rounded
  return Math.round((amount * odds) / 10);
}

export async function POST(request: NextRequest) {
  try {
    const { user, response } = await requireAuth(request);
    if (response) return response;

    const body = await request.json();
    const { match_id, amount, choice } = body;

    // Validation
    if (!match_id || !amount || !choice) {
      return createErrorResponse('Match ID, amount, and choice are required', 400);
    }

    if (!['A', 'Draw', 'B'].includes(choice)) {
      return createErrorResponse('Invalid choice. Must be A, Draw, or B', 400);
    }

    if (amount < 10) {
      return createErrorResponse('Minimum bet amount is 10 tokens', 400);
    }

    // Get match details
    const { data: match, error: matchError } = await supabase
      .from('matches')
      .select('*')
      .eq('id', match_id)
      .maybeSingle();

    if (matchError || !match) {
      return createErrorResponse('Match not found', 404);
    }

    if (match.status !== 'upcoming') {
      return createErrorResponse('Cannot bet on this match. It has already started or finished.', 400);
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('tokens')
      .eq('id', user!.id)
      .maybeSingle();

    if (profileError || !profile) {
      return createErrorResponse('Profile not found', 404);
    }

    if (profile.tokens < amount) {
      return createErrorResponse('Insufficient tokens', 400);
    }

    // Get appropriate odds
    const odds = choice === 'A' ? match.odds_a : choice === 'Draw' ? match.odds_draw : match.odds_b;
    const potentialDiamonds = calculateDiamonds(amount, odds);

    // Deduct tokens
    const { error: deductError } = await supabase
      .from('profiles')
      .update({ tokens: profile.tokens - amount })
      .eq('id', user!.id);

    if (deductError) {
      console.error('Token deduction error:', deductError);
      return createErrorResponse('Failed to place bet', 500);
    }

    // Create bet
    const { data: bet, error: betError } = await supabase
      .from('bets')
      .insert({
        user_id: user!.id,
        match_id,
        amount,
        choice,
        odds,
        potential_diamonds: potentialDiamonds,
      })
      .select()
      .single();

    if (betError) {
      console.error('Bet creation error:', betError);
      // Try to refund tokens
      await supabase
        .from('profiles')
        .update({ tokens: profile.tokens })
        .eq('id', user!.id);
      return createErrorResponse('Failed to place bet', 500);
    }

    // Update total_bets count
    const { data: currentProfile } = await supabase
      .from('profiles')
      .select('total_bets')
      .eq('id', user!.id)
      .maybeSingle();

    if (currentProfile) {
      await supabase
        .from('profiles')
        .update({ total_bets: currentProfile.total_bets + 1 })
        .eq('id', user!.id);
    }

    return createSuccessResponse({
      message: 'Bet placed successfully!',
      bet: {
        id: bet.id,
        match_id: bet.match_id,
        amount: bet.amount,
        choice: bet.choice,
        odds: bet.odds,
        potential_diamonds: bet.potential_diamonds,
        created_at: bet.created_at,
      },
      new_token_balance: profile.tokens - amount,
    }, 201);

  } catch (error: any) {
    console.error('Place bet error:', error);
    return createErrorResponse('Internal server error', 500);
  }
}

export async function GET(request: NextRequest) {
  try {
    const { user, response } = await requireAuth(request);
    if (response) return response;

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status'); // active or history

    let query = supabase
      .from('bets')
      .select(`
        *,
        matches:match_id (
          id,
          team_a,
          team_b,
          league,
          status,
          result,
          match_date
        )
      `)
      .eq('user_id', user!.id)
      .order('created_at', { ascending: false });

    if (status === 'active') {
      query = query.is('is_win', null);
    } else if (status === 'history') {
      query = query.not('is_win', 'is', null);
    }

    const { data: bets, error } = await query;

    if (error) {
      console.error('Fetch bets error:', error);
      return createErrorResponse('Failed to fetch bets', 500);
    }

    return createSuccessResponse({
      bets: bets || [],
    });

  } catch (error: any) {
    console.error('Fetch bets error:', error);
    return createErrorResponse('Internal server error', 500);
  }
}
