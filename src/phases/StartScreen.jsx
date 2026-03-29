import { useState } from 'react'
import { useGame } from '../GameContext'

export default function StartScreen() {
  const { dispatch } = useGame()
  const [name, setName] = useState('')

  const handleStart = (e) => {
    e.preventDefault()
    if (!name.trim()) return
    dispatch({ type: 'SET_NAME', payload: name.trim() })
    dispatch({ type: 'SET_PHASE', payload: 'gathering' })
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-gradient-to-b from-gray-950 via-slate-900 to-gray-950">
      <div className="max-w-lg w-full text-center space-y-8">
        {/* Title */}
        <div className="space-y-2">
          <h1 className="text-5xl font-bold tracking-widest text-white uppercase">
            The Surge
          </h1>
          <p className="text-lg text-cyan-400 tracking-wider">
            USF Resilience Lab
          </p>
        </div>

        {/* Lore */}
        <div className="space-y-3 text-gray-400 text-sm leading-relaxed">
          <p>
            Category 5 Hurricane <span className="text-red-400 font-bold">Helios</span> is
            12 hours from landfall on Tampa Bay.
          </p>
          <p>
            Campus is evacuating. You stayed behind. The roads are already flooded.
          </p>
          <p className="text-gray-500">
            Gather supplies. Prepare defenses. Survive the surge.
          </p>
        </div>

        {/* Name input */}
        <form onSubmit={handleStart} className="space-y-4">
          <div>
            <label htmlFor="playerName" className="block text-xs text-gray-500 uppercase tracking-wider mb-2">
              Enter Your Name
            </label>
            <input
              id="playerName"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Survivor name..."
              maxLength={24}
              autoFocus
              className="w-full bg-gray-900 border border-gray-700 rounded px-4 py-3 text-center text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
            />
          </div>
          <button
            type="submit"
            disabled={!name.trim()}
            className="w-full bg-cyan-600 hover:bg-cyan-500 disabled:bg-gray-700 disabled:text-gray-500 text-white font-bold py-3 px-8 rounded tracking-wider uppercase transition-colors"
          >
            Begin
          </button>
        </form>

        {/* Footer */}
        <p className="text-xs text-gray-600">
          HackUSF 2026 | Climate Teach-In Challenge
        </p>
      </div>
    </div>
  )
}
