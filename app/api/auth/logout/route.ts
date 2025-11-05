import { NextRequest } from 'next/server';
import { supabase } from '@/lib/supabase-client';
import { createErrorResponse, createSuccessResponse } from '@/lib/auth-utils';

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return createErrorResponse('No authorization token provided', 401);
    }

    const token = authHeader.replace('Bearer ', '');

    const { error } = await supabase.auth.admin.signOut(token);

    if (error) {
      console.error('Logout error:', error);
      // Even if there's an error, we'll consider it successful on client side
    }

    return createSuccessResponse({
      message: 'Logout successful',
    });

  } catch (error: any) {
    console.error('Logout error:', error);
    return createErrorResponse('Internal server error', 500);
  }
}
