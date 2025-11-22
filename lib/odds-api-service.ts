import { getSupabaseAdminClient } from './supabase/admin';

const ODDS_API_KEY = process.env.ODDS_API_KEY || '';
const ODDS_API_BASE_URL = 'https://api.the-odds-api.com/v4';

export const SUPPORTED_COMPETITIONS = [
  'soccer_france_ligue_one',
  'soccer_epl',
  'soccer_germany_bundesliga',
  'soccer_italy_serie_a',
  'soccer_spain_la_liga',
  'soccer_uefa_champions_league',
  'soccer_uefa_europa_league',
  'soccer_uefa_europa_conference_league',
] as const;

export const COMPETITION_NAMES: Record<string, string> = {
  'soccer_france_ligue_one': 'Ligue 1',
  'soccer_epl': 'Premier League',
  'soccer_germany_bundesliga': 'Bundesliga',
  'soccer_italy_serie_a': 'Serie A',
  'soccer_spain_la_liga': 'La Liga',
  'soccer_uefa_champions_league': 'Champions League',
  'soccer_uefa_europa_league': 'Europa League',
  'soccer_uefa_europa_conference_league': 'Conference League',
};

interface OddsApiMatch {
  id: string;
  sport_key: string;
  sport_title: string;
  commence_time: string;
  home_team: string;
  away_team: string;
  bookmakers?: Array<{
    key: string;
    title: string;
    markets: Array<{
      key: string;
      outcomes: Array<{
        name: string;
        price: number;
      }>;
    }>;
  }>;
}

interface ImportResult {
  competition: string;
  imported: number;
  skipped: number;
  errors: string[];
}

export async function fetchMatchesFromOddsApi(sportKey: string): Promise<OddsApiMatch[]> {
  if (!ODDS_API_KEY) {
    console.warn('[ODDS-API] No API key configured, skipping import for', sportKey);
    return [];
  }

  const url = new URL(`${ODDS_API_BASE_URL}/sports/${sportKey}/odds`);
  url.searchParams.append('apiKey', ODDS_API_KEY);
  url.searchParams.append('regions', 'eu');
  url.searchParams.append('markets', 'h2h');
  url.searchParams.append('oddsFormat', 'decimal');

  try {
    console.log(`[ODDS-API] Fetching matches for ${sportKey}...`);

    const response = await fetch(url.toString());

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const matches: OddsApiMatch[] = await response.json();
    console.log(`[ODDS-API] Fetched ${matches.length} matches for ${sportKey}`);

    return matches;
  } catch (error) {
    console.error(`[ODDS-API] Error fetching ${sportKey}:`, error);
    return [];
  }
}

export function extractOddsFromMatch(match: OddsApiMatch): {
  odds_a: number;
  odds_draw: number;
  odds_b: number;
} {
  if (!match.bookmakers || match.bookmakers.length === 0) {
    return {
      odds_a: 2.0,
      odds_draw: 3.0,
      odds_b: 2.5,
    };
  }

  const h2hMarket = match.bookmakers[0].markets.find(m => m.key === 'h2h');

  if (!h2hMarket || !h2hMarket.outcomes) {
    return {
      odds_a: 2.0,
      odds_draw: 3.0,
      odds_b: 2.5,
    };
  }

  const homeOutcome = h2hMarket.outcomes.find(o => o.name === match.home_team);
  const awayOutcome = h2hMarket.outcomes.find(o => o.name === match.away_team);
  const drawOutcome = h2hMarket.outcomes.find(o => o.name === 'Draw');

  return {
    odds_a: homeOutcome?.price || 2.0,
    odds_draw: drawOutcome?.price || 3.0,
    odds_b: awayOutcome?.price || 2.5,
  };
}

export async function importMatchesForCompetition(sportKey: string): Promise<ImportResult> {
  const result: ImportResult = {
    competition: COMPETITION_NAMES[sportKey] || sportKey,
    imported: 0,
    skipped: 0,
    errors: [],
  };

  try {
    const matches = await fetchMatchesFromOddsApi(sportKey);

    if (matches.length === 0) {
      result.errors.push('No matches found');
      return result;
    }

    const next7Matches = matches.slice(0, 7);

    const supabase = getSupabaseAdminClient();

    for (const match of next7Matches) {
      try {
        const { data: existingMatch } = await supabase
          .from('matches')
          .select('id')
          .eq('external_api_id', match.id)
          .maybeSingle();

        if (existingMatch) {
          result.skipped++;
          continue;
        }

        const odds = extractOddsFromMatch(match);

        const { error: insertError } = await supabase
          .from('matches')
          .insert({
            team_a: match.home_team,
            team_b: match.away_team,
            league: COMPETITION_NAMES[sportKey] || sportKey,
            competition: COMPETITION_NAMES[sportKey] || sportKey,
            odds_a: odds.odds_a,
            odds_draw: odds.odds_draw,
            odds_b: odds.odds_b,
            match_date: match.commence_time,
            status: 'upcoming',
            match_mode: 'real',
            external_api_id: match.id,
            api_provider: 'the-odds-api',
          });

        if (insertError) {
          result.errors.push(`${match.home_team} vs ${match.away_team}: ${insertError.message}`);
        } else {
          result.imported++;
        }
      } catch (error: any) {
        result.errors.push(`${match.home_team} vs ${match.away_team}: ${error.message}`);
      }
    }

    return result;
  } catch (error: any) {
    result.errors.push(`Competition error: ${error.message}`);
    return result;
  }
}

export async function importAllCompetitions(): Promise<ImportResult[]> {
  const results: ImportResult[] = [];

  for (const sportKey of SUPPORTED_COMPETITIONS) {
    console.log(`[ODDS-API] Processing ${sportKey}...`);
    const result = await importMatchesForCompetition(sportKey);
    results.push(result);

    await new Promise(resolve => setTimeout(resolve, 500));
  }

  return results;
}
