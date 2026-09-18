# How to Run — Twin AI (Abhishek's Digital Professional Twin)

An AI-powered professional digital twin chatbot web application representing **Abhishek Ugare**. Built with React, Vite, TypeScript, Tailwind CSS, Supabase (Database + Storage + Edge Functions), and Gemini 2.5 Flash LLM with Whisper STT.

---

## 📋 Prerequisites

Ensure you have the following installed on your machine:

- **Node.js**: `v18.0.0` or higher (recommended: Node 20+)
- **pnpm** (recommended) or **npm** / **yarn**
- **Git** (optional, for version control)
- A **Supabase** project (free tier at [supabase.com](https://supabase.com))

---

## 🚀 Quick Start (Local Development)

### 1. Extract & Navigate to Project Directory

```bash
unzip twin-ai-abhishek-ugare.zip -d twin-ai
cd twin-ai
```

### 2. Install Dependencies

Using `pnpm` (fastest):
```bash
pnpm install
```

Or using `npm`:
```bash
npm install
```

---

## ⚙️ Environment Configuration

Create a `.env` file in the project root by copying the template:

```bash
cp .env.example .env   # Or create .env manually
```

Fill in your Supabase configuration:

```env
# Supabase Project URL & Anon Key (from Supabase Dashboard -> Settings -> API)
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOi...your-anon-key-here...
```

---

## 🗄️ Database & Storage Setup (Supabase)

If you are setting up your own Supabase project, run the following SQL queries in your **Supabase SQL Editor**:

### 1. Database Tables & RLS Policies

```sql
-- 1. Sessions Table
CREATE TABLE IF NOT EXISTS public.sessions (
  session_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  visitor_id UUID NOT NULL,
  start_time TIMESTAMPTZ NOT NULL DEFAULT now(),
  end_time TIMESTAMPTZ,
  channel TEXT NOT NULL DEFAULT 'text',
  message_count INTEGER NOT NULL DEFAULT 0,
  title TEXT NOT NULL DEFAULT 'New Conversation',
  status TEXT NOT NULL DEFAULT 'active'
);

-- 2. Messages Table
CREATE TABLE IF NOT EXISTS public.messages (
  message_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.sessions(session_id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
  message_type TEXT NOT NULL DEFAULT 'text',
  privacy_classification TEXT NOT NULL DEFAULT 'public'
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_sessions_visitor ON public.sessions(visitor_id);
CREATE INDEX IF NOT EXISTS idx_messages_session ON public.messages(session_id);

-- Enable RLS
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Anonymous visitor access policies
CREATE POLICY "anon_select_sessions" ON public.sessions FOR SELECT TO anon USING (true);
CREATE POLICY "anon_insert_sessions" ON public.sessions FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "anon_update_sessions" ON public.sessions FOR UPDATE TO anon USING (true);
CREATE POLICY "anon_delete_sessions" ON public.sessions FOR DELETE TO anon USING (true);

CREATE POLICY "anon_select_messages" ON public.messages FOR SELECT TO anon USING (true);
CREATE POLICY "anon_insert_messages" ON public.messages FOR INSERT TO anon WITH CHECK (true);

-- Atomic message count increment helper function
CREATE OR REPLACE FUNCTION public.increment_message_count(p_session_id UUID)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
AS $$
  UPDATE public.sessions
  SET message_count = message_count + 1
  WHERE session_id = p_session_id;
$$;
```

### 2. Voice Recordings Storage Bucket

```sql
-- Create public storage bucket for voice recordings
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'voice-recordings',
  'voice-recordings',
  true,
  10485760,  -- 10 MB limit
  ARRAY['audio/webm', 'audio/ogg', 'audio/mp4', 'audio/wav', 'audio/mpeg']
)
ON CONFLICT (id) DO NOTHING;

-- RLS policies for storage bucket
CREATE POLICY "anon_upload_voice" ON storage.objects
  FOR INSERT TO anon
  WITH CHECK (bucket_id = 'voice-recordings');

CREATE POLICY "anon_read_voice" ON storage.objects
  FOR SELECT TO anon
  USING (bucket_id = 'voice-recordings');

CREATE POLICY "anon_delete_voice" ON storage.objects
  FOR DELETE TO anon
  USING (bucket_id = 'voice-recordings');
```

---

## ⚡ Edge Functions (Backend)

The project includes two Supabase Edge Functions located in `supabase/functions/`:

1. **`chat`** — Streaming Gemini 2.5 Flash LLM completions with Abhishek's complete knowledge base and conversation persistence.
2. **`speech-to-text`** — Audio-to-text transcription powered by Whisper v3.

To deploy Edge Functions via Supabase CLI:

```bash
# Login to Supabase CLI
supabase login

# Link your project
supabase link --project-ref your-project-ref

# Deploy Edge Functions
supabase functions deploy chat --no-verify-jwt
supabase functions deploy speech-to-text --no-verify-jwt

# Set Secret for LLM & STT API Gateway
supabase secrets set INTEGRATIONS_API_KEY=your_gateway_api_key
```

---

## 🖥️ Running the Application

### Start Development Server

```bash
pnpm run dev
# or: npm run dev
```

Open your browser and navigate to:
```
http://localhost:5173
```

### Build for Production

```bash
pnpm run build
# or: npm run build
```

Preview production build locally:
```bash
pnpm run preview
# or: npm run preview
```

### Linting & Code Quality

```bash
pnpm run lint
# or: npm run lint
```

---

## 📁 Project Structure

```
twin-ai/
├── src/
│   ├── components/            # UI & feature components
│   │   ├── ChatHeader.tsx     # App header + session/profile toggles
│   │   ├── ChatInput.tsx      # Text input + voice recorder + send/stop
│   │   ├── ConversationHistory.tsx # Past session list
│   │   ├── MessageBubble.tsx  # Message item + Markdown renderer + copy
│   │   ├── ProfilePanel.tsx   # Abhishek's bio, links & quick contact
│   │   ├── SuggestionChips.tsx # Quick-start prompt buttons
│   │   ├── TwinAvatar.tsx     # Animated Twin AI avatar
│   │   ├── VoiceRecorder.tsx  # Real-time microphone audio recording
│   │   └── ui/                # shadcn/ui primitives
│   ├── db/
│   │   └── supabase.ts        # Supabase client singleton
│   ├── lib/
│   │   ├── sse.ts             # Server-Sent Events streaming parser
│   │   └── utils.ts           # Class merging utilities
│   ├── pages/
│   │   └── ChatPage.tsx       # Main chat layout & state management
│   ├── services/
│   │   ├── api.ts             # Database queries & session management
│   │   └── speechToText.ts    # Voice recording upload & transcription
│   ├── types/
│   │   └── types.ts           # TypeScript interfaces & types
│   ├── App.tsx                # App root with router
│   ├── main.tsx               # DOM mount entry
│   └── index.css              # Pink Noir Gallery design tokens
├── supabase/
│   └── functions/
│       ├── chat/index.ts      # LLM chat streaming Edge Function
│       └── speech-to-text/index.ts # Whisper STT Edge Function
├── HOW_TO_RUN.md              # Setup & run guide (this file)
├── package.json               # Project dependencies & scripts
├── tailwind.config.js         # Tailwind styling config
├── tsconfig.json              # TypeScript config
└── vite.config.ts             # Vite build configuration
```

---

## 💡 Key Features Included

- 💬 **Streaming AI Chat** with Gemini 2.5 Flash via SSE (Server-Sent Events)
- 🎙️ **Voice-to-Text Input** with live visual waveform and Whisper v3 transcription
- 🧠 **Complete Abhishek Ugare Knowledge Base** (Education, Projects, Skills, Certifications, Contact links)
- 🔒 **Privacy Protection** preventing jailbreaks, prompt extraction, and confidential data leaks
- 🗄️ **Persistent Conversations** with anonymous visitor UUIDs in `localStorage`
- 📱 **Fully Responsive Layout** (desktop dual-sidebar + mobile bottom sheets)
- 🎨 **Pink Noir Gallery Theme** (Deep black, vivid pink accents, sharp editorial look)
