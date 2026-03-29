import { useGame } from '../GameContext'

export default function DeathScreen() {
  const { state, dispatch } = useGame()

  const lastChoice = state.choices[state.choices.length - 1]

  return (
    <div className="min-h-screen flex items-center justify-center bg-black px-4">
      <div className="max-w-md text-center space-y-8 animate-[fadeIn_2s_ease-in]">
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

        <button
          onClick={() => dispatch({ type: 'SET_PHASE', payload: 'audit' })}
          className="bg-gray-800 hover:bg-gray-700 text-gray-300 py-3 px-8 rounded tracking-wider transition-colors"
        >
          View Your Resilience Report
        </button>
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
