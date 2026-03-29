import { useMemo } from 'react'

export default function RainOverlay({ phase }) {
  const intensity = phase === 'gauntlet' ? 80 : phase === 'gathering' ? 30 : 15

  const drops = useMemo(() => {
    return Array.from({ length: intensity }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      height: `${15 + Math.random() * 25}px`,
      duration: `${0.4 + Math.random() * 0.6}s`,
      delay: `${Math.random() * 2}s`,
      opacity: 0.2 + Math.random() * 0.4,
    }))
  }, [intensity])

  if (phase === 'start' || phase === 'audit') return null

  return (
    <div className="rain-overlay">
      {drops.map((drop) => (
        <div
          key={drop.id}
          className="rain-drop"
          style={{
            left: drop.left,
            height: drop.height,
            animationDuration: drop.duration,
            animationDelay: drop.delay,
            opacity: drop.opacity,
          }}
        />
      ))}
    </div>
  )
}
