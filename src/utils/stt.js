/**
 * Start listening via Web Speech API.
 * Returns a Promise that resolves with the transcript string.
 * Rejects if mic is unavailable or no speech detected.
 */
export function startListening() {
  return new Promise((resolve, reject) => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      reject(new Error('Speech recognition not supported'))
      return
    }

    const recognition = new SpeechRecognition()
    recognition.lang = 'en-US'
    recognition.continuous = false
    recognition.interimResults = false

    recognition.onresult = (event) => {
      const transcript = event.results[0]?.[0]?.transcript
      if (transcript) {
        resolve(transcript)
      } else {
        reject(new Error('No speech detected'))
      }
    }

    recognition.onerror = (event) => {
      reject(new Error(`Speech error: ${event.error}`))
    }

    recognition.onnomatch = () => {
      reject(new Error('No speech match'))
    }

    recognition.start()

    // Expose stop method so push-to-talk can end it
    recognition._resolve = resolve
    startListening._activeRecognition = recognition
  })
}

export function stopListening() {
  if (startListening._activeRecognition) {
    startListening._activeRecognition.stop()
    startListening._activeRecognition = null
  }
}
