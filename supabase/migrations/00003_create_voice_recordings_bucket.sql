
-- Create public storage bucket for temporary voice recordings
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'voice-recordings',
  'voice-recordings',
  true,
  10485760,  -- 10 MB limit
  ARRAY['audio/webm', 'audio/ogg', 'audio/mp4', 'audio/wav', 'audio/mpeg']
)
ON CONFLICT (id) DO NOTHING;

-- RLS policies: anon can upload and read (public bucket for temp files)
CREATE POLICY "anon_upload_voice" ON storage.objects
  FOR INSERT TO anon
  WITH CHECK (bucket_id = 'voice-recordings');

CREATE POLICY "anon_read_voice" ON storage.objects
  FOR SELECT TO anon
  USING (bucket_id = 'voice-recordings');

CREATE POLICY "anon_delete_voice" ON storage.objects
  FOR DELETE TO anon
  USING (bucket_id = 'voice-recordings');
