const TTS_API_URL = 'https://texttospeech.googleapis.com/v1/text:synthesize'

let audioContext = null

function getAudioContext() {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)()
  }
  return audioContext
}

function applyRadioFilter(ctx, buffer) {
  const source = ctx.createBufferSource()
  source.buffer = buffer

  // Bandpass filter for radio compression effect
  const bandpass = ctx.createBiquadFilter()
  bandpass.type = 'bandpass'
  bandpass.frequency.value = 1500
  bandpass.Q.value = 0.7

  // Slight distortion for radio crackle
  const compressor = ctx.createDynamicsCompressor()
  compressor.threshold.value = -30
  compressor.knee.value = 10
  compressor.ratio.value = 12
  compressor.attack.value = 0
  compressor.release.value = 0.25

  const gain = ctx.createGain()
  gain.gain.value = 1.5

  source.connect(bandpass)
  bandpass.connect(compressor)
  compressor.connect(gain)
  gain.connect(ctx.destination)

  return source
}

async function speakWithGoogleTTS(text) {
  const apiKey = import.meta.env.VITE_GOOGLE_TTS_API_KEY
  if (!apiKey) throw new Error('No TTS API key')

  const res = await fetch(`${TTS_API_URL}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      input: { text },
      voice: { languageCode: 'en-US', name: 'en-US-Neural2-D' },
      audioConfig: { audioEncoding: 'MP3' },
    }),
  })

  if (!res.ok) throw new Error(`TTS API error: ${res.status}`)

  const data = await res.json()
  const binaryString = atob(data.audioContent)
  const bytes = new Uint8Array(binaryString.length)
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i)
  }

  const ctx = getAudioContext()
  const audioBuffer = await ctx.decodeAudioData(bytes.buffer)
  const source = applyRadioFilter(ctx, audioBuffer)

  return new Promise((resolve) => {
    source.onended = resolve
    source.start(0)
  })
}

function speakWithWebSpeech(text) {
  return new Promise((resolve, reject) => {
    if (!window.speechSynthesis) {
      reject(new Error('No speechSynthesis'))
      return
    }
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.pitch = 0.7
    utterance.rate = 0.85
    utterance.onend = resolve
    utterance.onerror = reject
    window.speechSynthesis.speak(utterance)
  })
}

/**
 * Speak text as the dispatcher through radio filter.
 * Falls back: Google TTS → Web Speech API → silent resolve.
 */
export async function speakAsDispatcher(text) {
  try {
    await speakWithGoogleTTS(text)
  } catch (e) {
    console.warn('Google TTS failed, falling back to Web Speech:', e)
    try {
      await speakWithWebSpeech(text)
    } catch (e2) {
      console.warn('Web Speech also failed:', e2)
      // Silent fallback — text still displays in chat
    }
  }
}
