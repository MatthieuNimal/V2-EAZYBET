import { NextRequest } from 'next/server';
import { supabase } from '@/lib/supabase-client';
import { createErrorResponse, createSuccessResponse } from '@/lib/auth-utils';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Validation
    if (!email || !password) {
      return createErrorResponse('Email and password are required', 400);
    }

    // Sign in
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return createErrorResponse('Invalid email or password', 401);
    }

    if (!data.user || !data.session) {
      return createErrorResponse('Login failed', 500);
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .maybeSingle();

    if (profileError) {
      console.error('Profile fetch error:', profileError);
    }

    return createSuccessResponse({
      message: 'Login successful',
      user: {
        id: data.user.id,
        email: data.user.email,
        username: profile?.username,
        tokens: profile?.tokens,
        diamonds: profile?.diamonds,
      },
      session: data.session,
      access_token: data.session.access_token,
    });

  } catch (error: any) {
    console.error('Login error:', error);
    return createErrorResponse('Internal server error', 500);
  }
}
