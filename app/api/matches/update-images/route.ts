import { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createErrorResponse, createSuccessResponse } from '@/lib/auth-utils';
import { getTeamImagesFromWikimedia } from '@/lib/wikimedia-service';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return createErrorResponse('Unauthorized', 401);
    }

    const token = authHeader.replace('Bearer ', '');

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: authHeader
        }
      }
    });

    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return createErrorResponse('Unauthorized', 401);
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle();

    if (profileError || !profile || profile.role !== 'admin') {
      return createErrorResponse('Access denied: Admin role required', 403);
    }

    const { data: matches, error: matchesError } = await supabase
      .from('matches')
      .select('id, team_a, team_b')
      .is('team_a_banner', null)
      .is('team_a_stadium', null);

    if (matchesError) {
      console.error('Error fetching matches:', matchesError);
      return createErrorResponse('Failed to fetch matches', 500);
    }

    if (!matches || matches.length === 0) {
      return createSuccessResponse({
        message: 'All matches already have images',
        updated: 0,
      });
    }

    let updatedCount = 0;
    let errorCount = 0;

    for (const match of matches) {
      try {
        const teamAImages = await getTeamImagesFromWikimedia(match.team_a, supabase);
        const teamBImages = await getTeamImagesFromWikimedia(match.team_b, supabase);

        const { error: updateError } = await supabase
          .from('matches')
          .update({
            team_a_badge: teamAImages?.badge || null,
            team_a_banner: teamAImages?.banner || null,
            team_a_stadium: teamAImages?.stadium || null,
            team_b_badge: teamBImages?.badge || null,
            team_b_banner: teamBImages?.banner || null,
            team_b_stadium: teamBImages?.stadium || null,
          })
          .eq('id', match.id);

        if (updateError) {
          console.error(`Error updating match ${match.id}:`, updateError);
          errorCount++;
        } else {
          console.log(`Updated images for ${match.team_a} vs ${match.team_b}`);
          updatedCount++;
        }
      } catch (err) {
        console.error(`Error processing match ${match.id}:`, err);
        errorCount++;
      }
    }

    return createSuccessResponse({
      message: `Images updated successfully`,
      stats: {
        updated: updatedCount,
        errors: errorCount,
      },
    });

  } catch (error) {
    console.error('Update images error:', error);
    return createErrorResponse('Internal server error', 500);
  }
}
