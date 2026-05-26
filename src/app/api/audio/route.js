import OpenAI from 'openai'

export async function POST(request) {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  try {
    const { text } = await request.json()

    if (!text) {
      return new Response('Missing text', { status: 400 })
    }

    // Clean text for TTS — strip HTML tags and truncate
    const clean = text
      .replace(/<[^>]+>/g, '')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 4096)

    // GPT TTS — 'alloy' is clear and neutral, great for briefings
    // Voices: alloy | echo | fable | onyx | nova | shimmer
    const mp3 = await openai.audio.speech.create({
      model: 'tts-1',       // tts-1-hd for higher quality (slower + costs more)
      voice: 'nova',        // Nova is warm and professional — good for news
      input: clean,
      response_format: 'mp3',
      speed: 0.95,          // Slightly slower = easier to absorb
    })

    const buffer = Buffer.from(await mp3.arrayBuffer())

    return new Response(buffer, {
      headers: {
        'Content-Type':  'audio/mpeg',
        'Cache-Control': 'public, max-age=86400', // cache 24h — same article = same audio
        'Content-Length': buffer.length.toString(),
      },
    })
  } catch (err) {
    console.error('TTS error:', err)
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}