import { supabase } from '@/db/supabase';

/**
 * Upload a recorded audio blob to a temporary public URL via Supabase Storage,
 * then send that URL to the STT Edge Function for transcription.
 * Returns the transcribed text.
 */
export async function transcribeAudioBlob(blob: Blob): Promise<string> {
  // Upload blob to Supabase Storage (voice-recordings bucket, public)
  const filename = `voice_${Date.now()}.webm`;
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('voice-recordings')
    .upload(filename, blob, { contentType: blob.type || 'audio/webm', upsert: false });

  if (uploadError) throw new Error(`Upload failed: ${uploadError.message}`);

  const { data: urlData } = supabase.storage
    .from('voice-recordings')
    .getPublicUrl(uploadData.path);

  const fileUrl = urlData.publicUrl;

  // Call STT Edge Function with the public URL
  const { data, error } = await supabase.functions.invoke('speech-to-text', {
    body: { fileUrl, language: 'english' },
  });

  if (error) {
    const msg = await (error as { context?: { text?: () => Promise<string> } })?.context?.text?.();
    throw new Error(msg || error.message || 'Transcription failed');
  }

  const text: string = data?.text ?? '';
  if (!text.trim()) throw new Error('No speech detected');

  return text.trim();
}
