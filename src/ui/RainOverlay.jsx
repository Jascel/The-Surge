import { useMemo } from 'react'
import { useGame } from '../GameContext'

export default function RainOverlay({ phase }) {
  const { state } = useGame()
  
  const intensity = useMemo(() => {
    if (phase === 'gauntlet') return 0; // Indoors during gauntlet
    if (phase !== 'gathering' && phase !== 'sprint') return 0;
    
    const time = state.world.timeUntilLandfall;
    if (time >= 8) return 20; // Stage 1
    if (time >= 4) return 40; // Stage 2
    return 60; // Stage 3
  }, [phase, state.world.timeUntilLandfall])

  const drops = useMemo(() => {
    if (intensity === 0) return [];
    return Array.from({ length: intensity }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      height: `${15 + Math.random() * 25}px`,
      duration: `${0.4 + Math.random() * 0.6}s`,
      delay: `${Math.random() * 2}s`,
      opacity: 0.2 + Math.random() * 0.4,
    }))
  }, [intensity])

  if (intensity === 0) return null

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
