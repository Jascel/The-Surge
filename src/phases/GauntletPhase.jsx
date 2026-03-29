import { useState, useEffect } from 'react'
import { useGame } from '../GameContext'
import { GAUNTLET_EVENTS } from '../data/events'
import { ITEMS } from '../data/items'
import StatsBar from '../ui/StatsBar'
import Inventory from '../ui/Inventory'
import ItemGuidePanel from '../ui/ItemGuidePanel'
import OracleChat from '../ui/OracleChat'
import EmergencyAlert from '../ui/EmergencyAlert'
import { getLocationImagePath } from '../utils/imagePaths'

export default function GauntletPhase() {
  const { state, dispatch, activeAlert, dismissAlert } = useGame()
  const [eventIndex, setEventIndex] = useState(0)
  const [outcome, setOutcome] = useState(null)
  const [shaking, setShaking] = useState(false)
  const [flashing, setFlashing] = useState(false)
  const [selectedItem, setSelectedItem] = useState(null)
  const [oracleOpen, setOracleOpen] = useState(false)

  const currentEvent = GAUNTLET_EVENTS[eventIndex]
  
  const bgImage = getLocationImagePath(state.shelter || state.location, 'gauntlet', 0)

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

    // Screen shake and lightning for dramatic events
    if (state.world.surgeLevel >= 4) {
      setShaking(true)
      setFlashing(true)
      setTimeout(() => setShaking(false), 300)
      setTimeout(() => setFlashing(false), 500)
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
  const bgOpacity = 0.5 + (state.world.surgeLevel / 8) * 0.4

  return (
    <div className={`h-[100dvh] flex flex-col relative ${shaking ? 'screen-shake' : ''}`}>
      {activeAlert && <EmergencyAlert message={activeAlert} onDismiss={dismissAlert} />}
      {/* Full-screen background image */}
      {bgImage && (
        <div 
          className="absolute inset-0 bg-cover bg-center z-0 ken-burns-bg"
          style={{ backgroundImage: `url("${bgImage}")` }}
        />
      )}
      
      {/* Heavy dark overlay for readability and gloom */}
      <div className="absolute inset-0 bg-gray-950/80 backdrop-blur-sm z-0" style={{ opacity: bgOpacity }} />
      
      {/* Lightning flash overlay */}
      {flashing && (
        <div className="absolute inset-0 bg-white z-10 lightning-flash pointer-events-none" />
      )}

      <div className="relative z-20">
        <StatsBar />
      </div>

      {/* Rising water bar at bottom */}
      <div
        className="fixed bottom-0 left-0 w-full transition-all duration-1000 z-10 pointer-events-none"
        style={{
          height: `${(state.world.surgeLevel / 8) * 30}%`,
          background: 'linear-gradient(to top, rgba(30, 64, 175, 0.4), transparent)',
        }}
      />

      <div className="flex-1 flex items-center justify-center px-4 relative z-20 pb-20">
        <div className="max-w-xl w-full">
          {/* Event card */}
          <div
            className="bg-gray-900/80 backdrop-blur-md border border-gray-700/50 rounded-lg overflow-hidden shadow-2xl"
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
                    className="w-full bg-gray-700/80 hover:bg-gray-600 text-white py-3 rounded font-bold tracking-wider transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_15px_rgba(255,255,255,0.1)] backdrop-blur-sm"
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
                        className={`w-full text-left rounded-lg p-4 border transition-all duration-300 hover:scale-[1.01] ${
                          choice.requiresItem
                            ? hasItem
                              ? 'bg-green-950/40 border-green-700/50 hover:border-green-400 hover:shadow-[0_0_15px_rgba(74,222,128,0.15)]'
                              : 'bg-red-950/30 border-red-900/30 hover:border-red-500 hover:shadow-[0_0_15px_rgba(239,68,68,0.15)]'
                            : 'bg-gray-800/60 border-gray-700 hover:border-gray-400 hover:shadow-[0_0_15px_rgba(156,163,175,0.15)]'
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
      
      {/* Bottom: Inventory + Oracle toggle */}
      <div className="absolute bottom-0 left-0 w-full border-t border-gray-800 bg-gray-900/80 backdrop-blur-md z-30">
        <Inventory onItemClick={setSelectedItem} />
        <div className="flex justify-end px-4 pb-2">
          <button
            onClick={() => setOracleOpen(!oracleOpen)}
            className="dispatcher-toggle flex items-center gap-2 bg-green-900/50 hover:bg-green-800/50 border border-green-700/50 hover:border-green-400 rounded px-3 py-1.5 text-sm text-green-400 transition-all duration-300 hover:scale-105 hover:shadow-[0_0_15px_rgba(74,222,128,0.2)]"
          >
            <span>{'\u{1F4FB}'}</span>
            <span>Oracle</span>
            {state.inventory.includes('radio') && state.stats.battery > 0 && (
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            )}
          </button>
        </div>
      </div>

      {/* Item Guide Panel */}
      {selectedItem && (
        <ItemGuidePanel
          itemId={selectedItem}
          onClose={() => setSelectedItem(null)}
        />
      )}

      {/* Oracle Chat */}
      {oracleOpen && (
        <OracleChat onClose={() => setOracleOpen(false)} />
      )}
    </div>
  )
}
