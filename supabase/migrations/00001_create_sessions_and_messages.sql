
-- Sessions table
CREATE TABLE IF NOT EXISTS sessions (
  session_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  visitor_id UUID NOT NULL,
  start_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  end_time TIMESTAMPTZ,
  channel TEXT NOT NULL DEFAULT 'text' CHECK (channel IN ('text', 'voice')),
  message_count INT NOT NULL DEFAULT 0,
  title TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Messages table
CREATE TABLE IF NOT EXISTS messages (
  message_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES sessions(session_id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  message_type TEXT NOT NULL DEFAULT 'text' CHECK (message_type IN ('text', 'voice')),
  privacy_classification TEXT NOT NULL DEFAULT 'public' CHECK (privacy_classification IN ('public', 'private', 'confidential')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_sessions_visitor_id ON sessions(visitor_id);
CREATE INDEX IF NOT EXISTS idx_sessions_created_at ON sessions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_session_id ON messages(session_id);
CREATE INDEX IF NOT EXISTS idx_messages_timestamp ON messages(timestamp ASC);

-- Enable RLS
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Sessions policies (anon can create and read their own sessions by visitor_id)
CREATE POLICY "anon_insert_sessions" ON sessions
  FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "anon_select_sessions" ON sessions
  FOR SELECT TO anon USING (true);

CREATE POLICY "anon_update_sessions" ON sessions
  FOR UPDATE TO anon USING (true) WITH CHECK (true);

-- Messages policies
CREATE POLICY "anon_insert_messages" ON messages
  FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "anon_select_messages" ON messages
  FOR SELECT TO anon USING (true);
