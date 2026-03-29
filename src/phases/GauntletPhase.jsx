import { useState } from 'react'
import { useGame } from '../GameContext'
import { GAUNTLET_EVENTS } from '../data/events'
import { ITEMS } from '../data/items'
import StatsBar from '../ui/StatsBar'

export default function GauntletPhase() {
  const { state, dispatch } = useGame()
  const [eventIndex, setEventIndex] = useState(0)
  const [outcome, setOutcome] = useState(null)
  const [shaking, setShaking] = useState(false)

  const currentEvent = GAUNTLET_EVENTS[eventIndex]

  if (!currentEvent) {
    // All events done
    dispatch({ type: 'SET_PHASE', payload: 'audit' })
    return null
  }

  const replaceName = (text) => text.replace(/\{name\}/g, state.playerName)

  const handleChoice = (choice) => {
    let result
    let consumed = false

    if (choice.requiresItem) {
      const hasItem = state.inventory.includes(choice.requiresItem)
      if (hasItem) {
        result = choice.onSuccess
        dispatch({ type: 'CONSUME_ITEM', payload: choice.requiresItem })
        consumed = true
      } else {
        result = choice.onFail
      }
    } else {
      result = choice.outcome
    }

    // Apply stat changes
    const statChanges = {}
    for (const [key, value] of Object.entries(result)) {
      if (['health', 'hunger', 'thirst', 'battery', 'morale'].includes(key)) {
        statChanges[key] = value
      }
    }
    if (Object.keys(statChanges).length > 0) {
      dispatch({ type: 'APPLY_STAT_CHANGE', payload: statChanges })
    }

    // Log the choice
    dispatch({
      type: 'LOG_CHOICE',
      payload: {
        eventId: currentEvent.id,
        choiceText: choice.text,
        outcome: replaceName(result.note),
        hadItem: choice.requiresItem ? state.inventory.includes(choice.requiresItem) || consumed : null,
      },
    })

    // Increment surge
    dispatch({ type: 'INCREMENT_SURGE' })

    // Screen shake for dramatic events
    if (state.world.surgeLevel >= 4) {
      setShaking(true)
      setTimeout(() => setShaking(false), 300)
    }

    setOutcome({ text: replaceName(result.note), statChanges })
  }

  const handleContinue = () => {
    setOutcome(null)
    if (eventIndex + 1 >= GAUNTLET_EVENTS.length) {
      dispatch({ type: 'SET_PHASE', payload: 'audit' })
    } else {
      setEventIndex(eventIndex + 1)
    }
  }

  // Background darkness increases with surge
  const bgOpacity = 0.3 + (state.world.surgeLevel / 8) * 0.5

  return (
    <div className={`min-h-screen flex flex-col bg-gray-950 ${shaking ? 'screen-shake' : ''}`}>
      <StatsBar />

      {/* Rising water bar at bottom */}
      <div
        className="fixed bottom-0 left-0 w-full transition-all duration-1000 z-10 pointer-events-none"
        style={{
          height: `${(state.world.surgeLevel / 8) * 30}%`,
          background: 'linear-gradient(to top, rgba(30, 64, 175, 0.3), transparent)',
        }}
      />

      <div className="flex-1 flex items-center justify-center px-4 relative z-20">
        <div className="max-w-xl w-full">
          {/* Event card */}
          <div
            className="bg-gray-900/90 border border-gray-700 rounded-lg overflow-hidden"
            style={{ boxShadow: `0 0 60px rgba(0,0,0,${bgOpacity})` }}
          >
            {/* Surge indicator */}
            <div className="bg-blue-950/50 px-4 py-2 flex items-center justify-between border-b border-gray-800">
              <span className="text-xs text-gray-500 uppercase tracking-wider">
                Event {eventIndex + 1} of {GAUNTLET_EVENTS.length}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-blue-400">Surge Level:</span>
                <div className="flex gap-0.5">
                  {Array.from({ length: 8 }, (_, i) => (
                    <div
                      key={i}
                      className={`w-2 h-3 rounded-sm ${
                        i < state.world.surgeLevel ? 'bg-blue-500' : 'bg-gray-700'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <h2 className="text-2xl font-bold text-white">{currentEvent.title}</h2>
              <p className="text-gray-300 leading-relaxed">
                {replaceName(currentEvent.description)}
              </p>

              {/* Outcome display */}
              {outcome ? (
                <div className="space-y-4">
                  <div className="bg-gray-800/50 border border-gray-700 rounded p-4">
                    <p className="text-gray-200">{outcome.text}</p>
                    {outcome.statChanges && Object.keys(outcome.statChanges).length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {Object.entries(outcome.statChanges).map(([key, val]) => (
                          <span
                            key={key}
                            className={`text-xs px-2 py-0.5 rounded ${
                              val > 0
                                ? 'bg-green-900/50 text-green-400'
                                : 'bg-red-900/50 text-red-400'
                            }`}
                          >
                            {key}: {val > 0 ? '+' : ''}{val}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={handleContinue}
                    className="w-full bg-gray-700 hover:bg-gray-600 text-white py-3 rounded font-bold tracking-wider transition-colors"
                  >
                    {eventIndex + 1 >= GAUNTLET_EVENTS.length ? 'Face the Dawn' : 'Continue'}
                  </button>
                </div>
              ) : (
                /* Choice buttons */
                <div className="space-y-2">
                  {currentEvent.choices.map((choice, i) => {
                    const hasItem = choice.requiresItem
                      ? state.inventory.includes(choice.requiresItem)
                      : null
                    const item = choice.requiresItem ? ITEMS[choice.requiresItem] : null

                    return (
                      <button
                        key={i}
                        onClick={() => handleChoice(choice)}
                        className={`w-full text-left rounded-lg p-4 border transition-all ${
                          choice.requiresItem
                            ? hasItem
                              ? 'bg-green-950/30 border-green-700/50 hover:border-green-500'
                              : 'bg-red-950/20 border-red-900/30 hover:border-red-700'
                            : 'bg-gray-800/50 border-gray-700 hover:border-gray-500'
                        }`}
                      >
                        <p className="font-medium text-gray-200">{choice.text}</p>
                        {item && (
                          <p className={`text-xs mt-1 ${hasItem ? 'text-green-500' : 'text-red-500'}`}>
                            {hasItem
                              ? `${item.emoji} ${item.name} ready`
                              : `${item.emoji} ${item.name} -- you don't have this`}
                          </p>
                        )}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
