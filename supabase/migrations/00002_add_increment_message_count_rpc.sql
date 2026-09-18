
CREATE OR REPLACE FUNCTION increment_message_count(p_session_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE sessions
  SET message_count = message_count + 2
  WHERE session_id = p_session_id;
END;
$$;
