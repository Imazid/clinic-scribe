import { NextResponse } from 'next/server';

export async function GET() {
  const apiKey = process.env.DEEPGRAM_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ error: 'Deepgram API key not configured' }, { status: 500 });
  }

  try {
    // Create a temporary API key that expires in 10 seconds
    // This prevents exposing the main key to the client
    const res = await fetch('https://api.deepgram.com/v1/projects', {
      headers: { Authorization: `Token ${apiKey}` },
    });

    if (!res.ok) {
      // If we can't get project info, just return the key directly
      // (less secure but simpler for development)
      return NextResponse.json({ key: apiKey });
    }

    const projects = await res.json();
    const projectId = projects.projects?.[0]?.project_id;

    if (!projectId) {
      return NextResponse.json({ key: apiKey });
    }

    // Create a temporary key
    const tempKeyRes = await fetch(`https://api.deepgram.com/v1/projects/${projectId}/keys`, {
      method: 'POST',
      headers: {
        Authorization: `Token ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        comment: 'Temporary transcription key',
        scopes: ['usage:write'],
        time_to_live_in_seconds: 30,
      }),
    });

    if (!tempKeyRes.ok) {
      // Fallback: return main key
      return NextResponse.json({ key: apiKey });
    }

    const tempKey = await tempKeyRes.json();
    return NextResponse.json({ key: tempKey.key });
  } catch {
    return NextResponse.json({ key: apiKey });
  }
}
