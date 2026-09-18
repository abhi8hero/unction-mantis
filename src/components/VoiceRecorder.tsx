import { useState, useRef, useEffect, useCallback } from 'react';
import { Mic, MicOff, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';

export type VoiceState = 'idle' | 'recording' | 'processing';

interface VoiceRecorderProps {
  onTranscript: (text: string) => void;
  onError: (msg: string) => void;
  onStateChange?: (state: VoiceState) => void;
  disabled?: boolean;
}

const MAX_RECORD_MS = 60_000; // 1 minute cap

export function VoiceRecorder({
  onTranscript,
  onError,
  onStateChange,
  disabled,
}: VoiceRecorderProps) {
  const [voiceState, setVoiceState] = useState<VoiceState>('idle');
  const [amplitude, setAmplitude] = useState(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number>(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const setState = useCallback(
    (s: VoiceState) => {
      setVoiceState(s);
      onStateChange?.(s);
    },
    [onStateChange]
  );

  // Amplitude polling for waveform visual
  const pollAmplitude = useCallback(() => {
    if (!analyserRef.current) return;
    const data = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteTimeDomainData(data);
    let sum = 0;
    for (const v of data) sum += Math.abs(v - 128);
    setAmplitude(Math.min(1, (sum / data.length) / 20));
    animFrameRef.current = requestAnimationFrame(pollAmplitude);
  }, []);

  const stopRecording = useCallback(() => {
    clearTimeout(timeoutRef.current);
    cancelAnimationFrame(animFrameRef.current);
    setAmplitude(0);
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }, []);

  // Cleanup on unmount
  useEffect(() => () => stopRecording(), [stopRecording]);

  const handleToggle = useCallback(async () => {
    if (disabled) return;

    if (voiceState === 'recording') {
      stopRecording();
      // onstop handler takes over
      return;
    }

    if (voiceState !== 'idle') return;

    // Request mic
    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch {
      onError('Microphone access denied. Please allow microphone in your browser settings.');
      return;
    }

    streamRef.current = stream;
    chunksRef.current = [];

    // Set up analyser for waveform
    const ctx = new AudioContext();
    const src = ctx.createMediaStreamSource(stream);
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 256;
    src.connect(analyser);
    analyserRef.current = analyser;

    // Choose best supported MIME type
    const mimeType = ['audio/webm;codecs=opus', 'audio/webm', 'audio/ogg;codecs=opus', 'audio/mp4'].find(
      (m) => MediaRecorder.isTypeSupported(m)
    ) ?? '';

    const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
    mediaRecorderRef.current = recorder;

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };

    recorder.onstop = async () => {
      cancelAnimationFrame(animFrameRef.current);
      setAmplitude(0);
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;

      if (chunksRef.current.length === 0) {
        setState('idle');
        return;
      }

      setState('processing');

      const blob = new Blob(chunksRef.current, { type: mimeType || 'audio/webm' });
      chunksRef.current = [];

      try {
        // Dynamically import to avoid top-level Supabase init issues
        const { transcribeAudioBlob } = await import('@/services/speechToText');
        const text = await transcribeAudioBlob(blob);
        onTranscript(text);
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Transcription failed';
        onError(msg);
      } finally {
        setState('idle');
      }
    };

    recorder.start(200); // collect chunks every 200 ms
    setState('recording');
    pollAmplitude();

    // Auto-stop after MAX_RECORD_MS
    timeoutRef.current = setTimeout(() => {
      if (mediaRecorderRef.current?.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
    }, MAX_RECORD_MS);
  }, [disabled, voiceState, stopRecording, onTranscript, onError, setState, pollAmplitude]);

  const isRecording = voiceState === 'recording';
  const isProcessing = voiceState === 'processing';

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={disabled || isProcessing}
      title={isRecording ? 'Stop recording' : isProcessing ? 'Transcribing…' : 'Voice input'}
      className={cn(
        'relative flex shrink-0 items-center justify-center rounded-xl transition-all duration-200',
        'h-10 w-10',
        isProcessing && 'cursor-not-allowed opacity-70',
        !isProcessing && !disabled && 'hover:bg-muted',
        isRecording ? 'text-primary' : 'text-muted-foreground'
      )}
    >
      {/* Pulse ring while recording */}
      <AnimatePresence>
        {isRecording && (
          <motion.span
            key="ring"
            initial={{ scale: 0.8, opacity: 0.6 }}
            animate={{ scale: 1.6 + amplitude * 1.2, opacity: 0.15 + amplitude * 0.2 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.1 }}
            className="absolute inset-0 rounded-xl bg-primary"
          />
        )}
      </AnimatePresence>

      {/* Icon */}
      {isProcessing ? (
        <Loader2 size={17} className="animate-spin text-primary" />
      ) : isRecording ? (
        <MicOff size={17} />
      ) : (
        <Mic size={17} />
      )}

      {/* Recording duration dot */}
      {isRecording && (
        <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-primary shadow-[0_0_6px_hsl(340_80%_49%)]" />
      )}
    </button>
  );
}
