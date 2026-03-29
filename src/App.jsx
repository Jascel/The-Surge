import { GameProvider, useGame } from './GameContext'
import StartScreen from './phases/StartScreen'
import GatheringPhase from './phases/GatheringPhase'
import SprintPhase from './phases/SprintPhase'
import GauntletPhase from './phases/GauntletPhase'
import AuditPhase from './phases/AuditPhase'
import DeathScreen from './phases/DeathScreen'
import RainOverlay from './ui/RainOverlay'
import HealthVignette from './ui/HealthVignette'

function GameRouter() {
  const { state } = useGame()

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
