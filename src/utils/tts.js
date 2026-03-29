import { setGlobalDucking } from './audio'

const TTS_API_URL = 'https://texttospeech.googleapis.com/v1/text:synthesize'

let audioContext = null
let currentSource = null

export function stopDispatcherSpeech() {
  if (currentSource) {
    try {
      currentSource.stop()
    } catch (e) {}
    currentSource = null
  }
  if (window.speechSynthesis) {
    window.speechSynthesis.cancel()
  }
  setGlobalDucking(false)
}

function getAudioContext() {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)()
  }
  return audioContext
}

function applyRadioFilter(ctx, buffer) {
  const source = ctx.createBufferSource()
  source.buffer = buffer

  // Light highpass to cut mud
  const highpass = ctx.createBiquadFilter()
  highpass.type = 'highpass'
  highpass.frequency.value = 250
  highpass.Q.value = 0.3

  // Very gentle bandpass — just a hint of radio color
  const bandpass = ctx.createBiquadFilter()
  bandpass.type = 'peaking'
  bandpass.frequency.value = 2000
  bandpass.Q.value = 0.5
  bandpass.gain.value = 3

  // Minimal compression for broadcast feel
  const compressor = ctx.createDynamicsCompressor()
  compressor.threshold.value = -18
  compressor.knee.value = 20
  compressor.ratio.value = 3
  compressor.attack.value = 0.003
  compressor.release.value = 0.25

  const gain = ctx.createGain()
  gain.gain.value = 1.2

  source.connect(highpass)
  highpass.connect(bandpass)
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
      audioConfig: { audioEncoding: 'MP3', speakingRate: 1.2 },
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

  currentSource = source

  return new Promise((resolve) => {
    source.onended = () => {
      if (currentSource === source) {
        currentSource = null
      }
      resolve()
    }
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
  stopDispatcherSpeech()
  setGlobalDucking(true)

  try {
    await speakWithGoogleTTS(text)
  } catch (e) {
    console.warn('Google TTS failed, falling back to Web Speech:', e)
    try {
      await speakWithWebSpeech(text)
    } catch (e2) {
      console.warn('Web Speech also failed:', e2)
    }
  } finally {
    setGlobalDucking(false)
  }
}
