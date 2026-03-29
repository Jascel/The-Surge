import { useState, useEffect } from 'react'
import { playSound } from '../utils/audio'
import { speakAsDispatcher } from '../utils/tts'

export default function DispatchAlert({ message, onDismiss }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true))

    playSound('openDispatcher', 0.4)

    // Speak the alert, then auto-dismiss
    ;(async () => {
      try {
        await speakAsDispatcher(message)
      } catch {}
      // Linger 2s after voice ends
      setTimeout(() => {
        setVisible(false)
        setTimeout(onDismiss, 500)
      }, 2000)
    })()
  }, [message, onDismiss])

  return (
    <div
      className={`fixed bottom-24 right-4 z-[55] max-w-sm transition-all duration-500 ${
        visible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      }`}
      onClick={() => {
        setVisible(false)
        setTimeout(onDismiss, 500)
      }}
    >
      <div className="bg-gray-950/90 backdrop-blur-md border border-green-700/60 rounded-lg shadow-2xl overflow-hidden cursor-pointer">
        <div className="bg-green-950/60 px-3 py-1.5 border-b border-green-800/30 flex items-center gap-2">
          <span className="text-green-400">{'\u{1F4FB}'}</span>
          <span className="text-[10px] text-green-400 font-bold tracking-[0.15em] uppercase animate-pulse">
            Incoming Transmission
          </span>
        </div>
        <div className="px-3 py-2">
          <p className="text-sm text-green-300 font-mono">{message}</p>
        </div>
      </div>
    </div>
  )
}
