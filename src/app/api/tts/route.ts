import { NextResponse } from 'next/server'
import { checkRateLimit } from '@/lib/rate-limit'

const ELEVENLABS_API_URL = 'https://api.elevenlabs.io/v1/text-to-speech'
const VOICE_ID = process.env.ELEVENLABS_VOICE_ID ?? ''
const API_KEY = process.env.ELEVENLABS_API_KEY ?? ''

/**
 * POST /api/tts
 *
 * Server-side proxy to ElevenLabs TTS API.
 * Keeps the API key on the server; returns audio/mpeg binary to the client.
 *
 * Body: { text: string }
 * Response: audio/mpeg binary stream
 */
export async function POST(request: Request) {
  const rateLimited = checkRateLimit(request)
  if (rateLimited) return rateLimited

  if (!API_KEY || !VOICE_ID) {
    return NextResponse.json(
      { error: 'ElevenLabs not configured' },
      { status: 500 },
    )
  }

  const body = await request.json()
  const { text } = body as { text: string }

  if (!text || typeof text !== 'string') {
    return NextResponse.json({ error: 'text is required' }, { status: 400 })
  }

  const res = await fetch(`${ELEVENLABS_API_URL}/${VOICE_ID}`, {
    method: 'POST',
    headers: {
      'xi-api-key': API_KEY,
      'Content-Type': 'application/json',
      Accept: 'audio/mpeg',
    },
    body: JSON.stringify({
      text,
      model_id: 'eleven_turbo_v2_5',
      voice_settings: {
        stability: 0.5,
        similarity_boost: 0.75,
      },
    }),
  })

  if (!res.ok) {
    const detail = await res.text().catch(() => 'unknown error')
    return NextResponse.json(
      { error: 'ElevenLabs request failed', detail },
      { status: res.status },
    )
  }

  const audioBuffer = await res.arrayBuffer()

  return new NextResponse(audioBuffer, {
    status: 200,
    headers: {
      'Content-Type': 'audio/mpeg',
      'Cache-Control': 'no-store',
    },
  })
}
