import { GameProvider, useGame } from './GameContext'
import StartScreen from './phases/StartScreen'
import GatheringPhase from './phases/GatheringPhase'
import SprintPhase from './phases/SprintPhase'
import GauntletPhase from './phases/GauntletPhase'
import AuditPhase from './phases/AuditPhase'
import DeathScreen from './phases/DeathScreen'
import RainOverlay from './ui/RainOverlay'
import HealthVignette from './ui/HealthVignette'
import { useWindSounds, playSound } from './utils/audio'
import { useEffect } from 'react'

function GameRouter() {
  const { state } = useGame()

  useWindSounds(state.world.phase, state.world.timeUntilLandfall)

  useEffect(() => {
    const handleClick = (e) => {
      const target = e.target
      const isButton = target.closest('button')
      if (!isButton) return

      // Exclusions: map node, dispatcher button, pick up item
      const isMapNode = target.closest('.map-node')
      const isDispatcherToggle = target.closest('.dispatcher-toggle')
      const isPickUp = target.closest('.pickup-button')

      if (!isMapNode && !isDispatcherToggle && !isPickUp) {
        playSound('buttonPress', 0.4)
      }
    }

    window.addEventListener('click', handleClick)
    return () => window.removeEventListener('click', handleClick)
  }, [])

  const renderPhase = () => {
    switch (state.world.phase) {
      case 'start':
        return <StartScreen />
      case 'gathering':
        return <GatheringPhase />
      case 'sprint':
        return <SprintPhase />
      case 'gauntlet':
        return <GauntletPhase />
      case 'audit':
        return <AuditPhase />
      case 'death':
        return <DeathScreen />
      default:
        return <StartScreen />
    }
  }

  return (
    <div className="min-h-screen relative">
      <RainOverlay phase={state.world.phase} />
      <HealthVignette health={state.stats.health} />
      {renderPhase()}
    </div>
  )
}

export default function App() {
  return (
    <GameProvider>
      <GameRouter />
    </GameProvider>
  )
}
