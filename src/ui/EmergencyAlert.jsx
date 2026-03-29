import { useState, useEffect } from 'react'

export default function EmergencyAlert({ message, onDismiss }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    // Slide in
    requestAnimationFrame(() => setVisible(true))

    const timer = setTimeout(() => {
      setVisible(false)
      setTimeout(onDismiss, 500)
    }, 6000)

    return () => clearTimeout(timer)
  }, [onDismiss])

  return (
    <div
      className={`absolute top-0 left-0 w-full z-[60] transition-transform duration-500 ${
        visible ? 'translate-y-0' : '-translate-y-full'
      }`}
      onClick={() => {
        setVisible(false)
        setTimeout(onDismiss, 500)
      }}
    >
      <div className="bg-amber-600/90 backdrop-blur-md border-b-2 border-amber-800 px-4 py-2 cursor-pointer shadow-lg">
        <div className="flex items-center gap-3">
          <span className="text-xl shrink-0">{'\u26A0\uFE0F'}</span>
          <div>
            <p className="text-[8px] text-amber-950 font-bold tracking-[0.2em] uppercase">
              Emergency Alert System
            </p>
            <p className="text-xs font-bold text-white font-mono tracking-wide">
              {message}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
