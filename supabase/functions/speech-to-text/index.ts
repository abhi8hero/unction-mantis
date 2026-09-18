// Speech-to-Text Edge Function
// Accepts a public audio file URL, proxies to Whisper STT, returns { text }
import { serve } from "https://deno.land/std@0.208.0/http/server.ts";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: CORS_HEADERS });
  }
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405, headers: CORS_HEADERS });
  }

  const apiKey = Deno.env.get("INTEGRATIONS_API_KEY");
  if (!apiKey) {
    return new Response(JSON.stringify({ error: "Server configuration error" }), {
      status: 500,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  }

  let fileUrl: string;
  let language: string | undefined;

  try {
    const body = await req.json();
    fileUrl = body.fileUrl;
    language = body.language;
    if (!fileUrl) throw new Error("Missing fileUrl");
  } catch {
    return new Response(JSON.stringify({ error: "Invalid request body — provide { fileUrl }" }), {
      status: 400,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  }

  const params: Record<string, string> = {
    file: fileUrl,
    response_format: "json",
  };
  if (language) params.language = language;

  const upstream = await fetch(
    "https://app-ehpsa758kttt-api-DY8MNQoqOnMa.gateway.appmedo.com/v1/audio/transcriptions",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "X-Gateway-Authorization": `Bearer ${apiKey}`,
      },
      body: new URLSearchParams(params).toString(),
    }
  );

  if (upstream.status === 429 || upstream.status === 402) {
    const errText = await upstream.text();
    return new Response(errText, {
      status: upstream.status,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  }

  if (!upstream.ok) {
    return new Response(
      JSON.stringify({ error: `Upstream STT error: ${upstream.status}` }),
      { status: 502, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
    );
  }

  const data = await upstream.json();
  return new Response(JSON.stringify(data), {
    status: 200,
    headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
  });
});
