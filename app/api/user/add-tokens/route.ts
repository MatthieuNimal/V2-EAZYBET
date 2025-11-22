import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';
import { requireAuth, createErrorResponse, createSuccessResponse } from '@/lib/auth-utils';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { user, response } = await requireAuth(request);
    if (response) return response;

    const body = await request.json();
    const { amount } = body;

    if (!amount || typeof amount !== 'number') {
      return createErrorResponse('Amount is required and must be a number', 400);
    }

    if (amount < 1 || amount > 100) {
      return createErrorResponse('Amount must be between 1 and 100', 400);
    }

    const { data, error } = await supabaseServer
      .rpc('increment_tokens', { amount_to_add: amount });

    if (error) {
      console.error('[ADD-TOKENS] Error:', error);
      return createErrorResponse(error.message || 'Failed to add tokens', 500);
    }

    console.log(`[ADD-TOKENS] User ${user!.id} earned ${amount} tokens. New balance: ${data.tokens}`);

    return createSuccessResponse({
      message: `Successfully added ${amount} tokens`,
      tokens: data.tokens,
      diamonds: data.diamonds,
      added: data.added,
    });

  } catch (error: any) {
    console.error('[ADD-TOKENS] Caught error:', error);
    return createErrorResponse(error.message || 'Internal server error', 500);
  }
}
