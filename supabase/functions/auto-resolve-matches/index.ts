import { createClient } from 'npm:@supabase/supabase-js@2.58.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface BetWithProfile {
  id: string;
  user_id: string;
  match_id: string;
  amount: number;
  choice: 'A' | 'Draw' | 'B';
  odds: number;
  potential_win: number;
  potential_diamonds: number;
  bet_currency: 'tokens' | 'diamonds';
  profiles: {
    id: string;
    tokens: number;
    diamonds: number;
    won_bets: number;
  };
}

interface ComboBetWithProfile {
  id: string;
  user_id: string;
  amount: number;
  bet_currency: 'tokens' | 'diamonds';
  potential_win: number;
  potential_diamonds: number;
  profiles: {
    id: string;
    tokens: number;
    diamonds: number;
    won_bets: number;
  };
}

interface SelectionWithMatch {
  id: string;
  combo_bet_id: string;
  match_id: string;
  choice: 'A' | 'Draw' | 'B';
  odds: number;
  matches: {
    id: string;
    status: 'upcoming' | 'live' | 'finished';
    result: 'A' | 'Draw' | 'B' | null;
  };
}

async function resolveMatchBets(
  supabase: any,
  matchId: string,
  result: 'A' | 'Draw' | 'B'
): Promise<{ processed: number; message: string }> {
  try {
    const { data: bets, error: betsError } = await supabase
      .from('bets')
      .select('*, profiles!inner(id, tokens, diamonds, won_bets)')
      .eq('match_id', matchId)
      .is('is_win', null);

    if (betsError || !bets || bets.length === 0) {
      return { processed: 0, message: 'No bets to process' };
    }

    let processed = 0;

    for (const bet of bets as BetWithProfile[]) {
      const isWin = bet.choice === result;
      const betCurrency = bet.bet_currency || 'tokens';

      if (isWin) {
        let tokensWon = 0;
        let diamondsWon = 0;

        if (betCurrency === 'tokens') {
          tokensWon = bet.potential_win;
          diamondsWon = bet.potential_diamonds;
        } else {
          tokensWon = 0;
          diamondsWon = bet.potential_win;
        }

        const newTokens = bet.profiles.tokens + tokensWon;
        const newDiamonds = bet.profiles.diamonds + diamondsWon;
        const newWonBets = bet.profiles.won_bets + 1;

        await supabase
          .from('profiles')
          .update({
            tokens: newTokens,
            diamonds: newDiamonds,
            won_bets: newWonBets,
          })
          .eq('id', bet.user_id);

        await supabase
          .from('bets')
          .update({
            is_win: true,
            tokens_won: tokensWon,
            diamonds_won: diamondsWon,
          })
          .eq('id', bet.id);
      } else {
        await supabase
          .from('bets')
          .update({
            is_win: false,
            tokens_won: 0,
            diamonds_won: 0,
          })
          .eq('id', bet.id);
      }

      processed++;
    }

    await supabase
      .from('matches')
      .update({
        status: 'finished',
        result: result,
      })
      .eq('id', matchId);

    await resolveAffectedComboBets(supabase, matchId);

    return {
      processed,
      message: `Successfully processed ${processed} bets`,
    };
  } catch (error) {
    console.error('Error resolving match bets:', error);
    throw error;
  }
}

async function resolveAffectedComboBets(
  supabase: any,
  matchId: string
): Promise<void> {
  const { data: comboSelections } = await supabase
    .from('combo_bet_selections')
    .select('combo_bet_id')
    .eq('match_id', matchId);

  if (!comboSelections || comboSelections.length === 0) {
    return;
  }

  const comboBetIds = Array.from(
    new Set(comboSelections.map((s: any) => s.combo_bet_id))
  );

  for (const comboBetId of comboBetIds) {
    await evaluateComboBet(supabase, comboBetId as string);
  }
}

async function evaluateComboBet(
  supabase: any,
  comboBetId: string
): Promise<void> {
  const { data: comboBet } = await supabase
    .from('combo_bets')
    .select('*, profiles!inner(id, tokens, diamonds, won_bets)')
    .eq('id', comboBetId)
    .is('is_win', null)
    .maybeSingle();

  if (!comboBet) {
    return;
  }

  const { data: selections } = await supabase
    .from('combo_bet_selections')
    .select(`
      *,
      matches!inner(id, status, result)
    `)
    .eq('combo_bet_id', comboBetId);

  if (!selections || selections.length === 0) {
    return;
  }

  const allMatchesFinished = selections.every(
    (sel: SelectionWithMatch) => sel.matches.status === 'finished'
  );

  if (!allMatchesFinished) {
    return;
  }

  const allSelectionsWon = selections.every(
    (sel: SelectionWithMatch) => sel.choice === sel.matches.result
  );
  const betCurrency = (comboBet as ComboBetWithProfile).bet_currency || 'tokens';

  if (allSelectionsWon) {
    let tokensWon = 0;
    let diamondsWon = 0;

    if (betCurrency === 'tokens') {
      tokensWon = (comboBet as ComboBetWithProfile).potential_win;
      diamondsWon = (comboBet as ComboBetWithProfile).potential_diamonds;
    } else {
      tokensWon = 0;
      diamondsWon = (comboBet as ComboBetWithProfile).potential_win;
    }

    const newTokens = (comboBet as ComboBetWithProfile).profiles.tokens + tokensWon;
    const newDiamonds = (comboBet as ComboBetWithProfile).profiles.diamonds + diamondsWon;
    const newWonBets = (comboBet as ComboBetWithProfile).profiles.won_bets + 1;

    await supabase
      .from('profiles')
      .update({
        tokens: newTokens,
        diamonds: newDiamonds,
        won_bets: newWonBets,
      })
      .eq('id', (comboBet as ComboBetWithProfile).user_id);

    await supabase
      .from('combo_bets')
      .update({
        is_win: true,
        tokens_won: tokensWon,
        diamonds_won: diamondsWon,
      })
      .eq('id', comboBetId);
  } else {
    await supabase
      .from('combo_bets')
      .update({
        is_win: false,
        tokens_won: 0,
        diamonds_won: 0,
      })
      .eq('id', comboBetId);
  }
}

async function simulateMatchResult(
  supabase: any,
  matchId: string
): Promise<{ processed: number; message: string; result: string }> {
  const { data: match } = await supabase
    .from('matches')
    .select('*')
    .eq('id', matchId)
    .maybeSingle();

  if (!match || match.status !== 'upcoming') {
    throw new Error('Match not available for simulation');
  }

  const totalOdds = match.odds_a + match.odds_draw + match.odds_b;
  const probA = match.odds_b / totalOdds;
  const probDraw = match.odds_draw / totalOdds;

  const random = Math.random();
  let result: 'A' | 'Draw' | 'B';

  if (random < probA) {
    result = 'A';
  } else if (random < probA + probDraw) {
    result = 'Draw';
  } else {
    result = 'B';
  }

  const resolutionResult = await resolveMatchBets(supabase, matchId, result);
  return { ...resolutionResult, result };
}

async function processFinishedMatches(supabase: any): Promise<any[]> {
  const now = new Date().toISOString();

  const { data: finishedMatches } = await supabase
    .from('matches')
    .select('*')
    .eq('status', 'upcoming')
    .eq('match_mode', 'fictif')
    .lte('match_date', now);

  if (!finishedMatches || finishedMatches.length === 0) {
    return [];
  }

  const results: any[] = [];

  for (const match of finishedMatches) {
    try {
      const result = await simulateMatchResult(supabase, match.id);
      results.push({
        matchId: match.id,
        ...result,
      });
    } catch (error) {
      console.error(`Failed to process match ${match.id}:`, error);
      results.push({
        matchId: match.id,
        processed: 0,
        message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
    }
  }

  return results;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase environment variables');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('[AUTO-RESOLVE] Starting automatic match resolution...');

    const results = await processFinishedMatches(supabase);

    console.log(`[AUTO-RESOLVE] Processed ${results.length} matches`);

    return new Response(
      JSON.stringify({
        success: true,
        results,
        timestamp: new Date().toISOString(),
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('[AUTO-RESOLVE] Error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to resolve matches',
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});