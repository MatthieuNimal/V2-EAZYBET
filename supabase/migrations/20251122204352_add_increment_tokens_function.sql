/*
  # Add increment_tokens function for Tap-to-Earn

  ## Overview
  Creates a secure RPC function to atomically increment user tokens
  with validation and anti-abuse measures.

  ## Changes
  
  ### 1. SQL Function
  - `increment_tokens(amount)` - Safely increments authenticated user's tokens
  - Validates amount is between 1 and 100 (anti-abuse)
  - Updates tokens atomically
  - Returns new balance
  
  ## Security
  - Uses auth.uid() to ensure user can only update their own tokens
  - Input validation prevents abuse
  - Atomic operation prevents race conditions
*/

-- Function to safely increment user tokens
CREATE OR REPLACE FUNCTION increment_tokens(amount_to_add integer)
RETURNS jsonb AS $$
DECLARE
  new_balance integer;
  user_profile RECORD;
BEGIN
  -- Validate amount (between 1 and 100 to prevent abuse)
  IF amount_to_add < 1 OR amount_to_add > 100 THEN
    RAISE EXCEPTION 'Invalid amount: must be between 1 and 100';
  END IF;

  -- Get current user
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Update tokens atomically and return new balance
  UPDATE profiles
  SET tokens = tokens + amount_to_add
  WHERE id = auth.uid()
  RETURNING tokens, diamonds INTO user_profile;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Profile not found';
  END IF;

  -- Return new balances
  RETURN jsonb_build_object(
    'tokens', user_profile.tokens,
    'diamonds', user_profile.diamonds,
    'added', amount_to_add
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION increment_tokens(integer) TO authenticated;

-- Add comment
COMMENT ON FUNCTION increment_tokens IS 'Safely increments authenticated user tokens with validation (max 100 per call)';
