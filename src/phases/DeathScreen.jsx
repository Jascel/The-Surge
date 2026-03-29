import { useGame } from '../GameContext'
import { getLocationImagePath } from '../utils/imagePaths'
import { playSound } from '../utils/audio'
import { useEffect } from 'react'

export default function DeathScreen() {
  const { state, dispatch } = useGame()

  useEffect(() => {
    playSound('gameOver', 0.7)
  }, [])

  const lastChoice = state.choices[state.choices.length - 1]
  const bgImage = getLocationImagePath(state.location, 'gauntlet', 0)

  return (
    <div className="h-[100dvh] flex items-center justify-center relative px-4">
      {bgImage && (
        <div 
          className="absolute inset-0 bg-cover bg-center z-0"
          style={{ backgroundImage: `url("${bgImage}")`, filter: 'grayscale(100%) brightness(30%)' }}
        />
      )}
      <div className="absolute inset-0 bg-black/80 z-0" />

      <div className="max-w-md text-center space-y-8 animate-[fadeIn_2s_ease-in] relative z-10">
        <div className="space-y-4">
          <h1 className="text-3xl font-bold text-red-600 tracking-wider">
            {state.playerName} Did Not Survive
          </h1>
          <h2 className="text-lg text-gray-500">Hurricane Helios</h2>
        </div>

        {lastChoice && (
          <p className="text-gray-500 text-sm leading-relaxed italic">
            {lastChoice.outcome}
          </p>
        )}

        <p className="text-gray-600 text-xs">
          Your choices still matter. See what could have saved you.
        </p>

        <div className="flex flex-col gap-3">
          <button
            onClick={() => dispatch({ type: 'SET_PHASE', payload: 'audit' })}
            className="bg-gray-800/80 hover:bg-gray-700/80 text-gray-300 py-3 px-8 rounded tracking-wider transition-all duration-300 hover:scale-105 hover:shadow-[0_0_15px_rgba(255,255,255,0.1)] backdrop-blur-sm"
          >
            View Your Resilience Report
          </button>
          <button
            onClick={() => dispatch({ type: 'RESET_GAME' })}
            className="text-gray-600 hover:text-gray-400 text-sm py-2 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  )
}
