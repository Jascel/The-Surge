import { useState, useEffect } from 'react'
import { useGame } from '../GameContext'
import { GAUNTLET_EVENTS } from '../data/events'
import { ITEMS } from '../data/items'
import StatsBar from '../ui/StatsBar'
import Inventory from '../ui/Inventory'
import ItemGuidePanel from '../ui/ItemGuidePanel'
import OracleChat from '../ui/OracleChat'
import EmergencyAlert from '../ui/EmergencyAlert'
import { getLocationImagePath, getLocationOverlayStyle } from '../utils/imagePaths'
import { callGemini } from '../api/gemini'
import { speakAsDispatcher } from '../utils/tts'
import { playSound } from '../utils/audio'

function buildGauntletDispatchPrompt(state, event) {
  return `You are the Emergency Oracle — a FEMA-trained radio dispatcher guiding a survivor through Hurricane Milton at USF Tampa.
The survivor's name is ${state.playerName}.

CURRENT CRISIS:
- Event: "${event.title}" — ${event.dispatchContext}
- Shelter location: ${state.shelter || state.location}
- Health: ${state.stats.health}/100 | Morale: ${state.stats.morale}/100
- Battery: ${state.stats.battery}/100
- Inventory: ${state.inventory.length > 0 ? state.inventory.join(', ') : 'empty'}
- Surge level: ${state.world.surgeLevel}/8

THE SURVIVOR'S OPTIONS:
${event.choices.map((c, i) => `${i + 1}. "${c.text}" ${c.requiresItem ? `(needs ${ITEMS[c.requiresItem]?.name || c.requiresItem}${state.inventory.includes(c.requiresItem) ? ' — THEY HAVE IT' : ' — THEY DON\'T HAVE IT'})` : '(always available)'}`).join('\n')}
${event.improvise ? `${event.choices.length + 1}. "${event.improvise.text}" (improvise using: ${event.improvise.useItems.filter(id => state.inventory.includes(id)).map(id => ITEMS[id]?.name || id).join(', ') || 'nothing useful in inventory'})` : ''}

RULES:
- Give SPECIFIC advice based on what they actually have in their inventory.
- If they have the required item for the best choice, tell them to use it.
- If they DON'T have it, suggest the best improvise option based on what they DO carry.
- If they have nothing useful, be honest — tell them the safest fallback.
- Reference FEMA principles when relevant.
- Be urgent, direct, 2-3 sentences max. Like a real emergency dispatcher.
- Do NOT break character.`
}

export default function GauntletPhase() {
  const { state, dispatch, activeAlert, dismissAlert } = useGame()
  const [eventIndex, setEventIndex] = useState(0)
  const [outcome, setOutcome] = useState(null)
  const [shaking, setShaking] = useState(false)
  const [flashing, setFlashing] = useState(false)
  const [selectedItem, setSelectedItem] = useState(null)
  const [oracleOpen, setOracleOpen] = useState(false)
  const [dispatchAdvice, setDispatchAdvice] = useState(null)
  const [dispatchLoading, setDispatchLoading] = useState(false)
  const [dispatchSpeaking, setDispatchSpeaking] = useState(false)

  const currentEvent = GAUNTLET_EVENTS[eventIndex]

  const bgImage = getLocationImagePath(state.shelter || state.location, 'gauntlet', 0)

  const hasRadio = state.inventory.includes('radio')
  const hasBattery = state.stats.battery > 0
  const hasBatteryPack = state.inventory.includes('battery_pack')

  if (!currentEvent) {
    // All events done
    dispatch({ type: 'SET_PHASE', payload: 'audit' })
    return null
  }

  const replaceName = (text) => text.replace(/\{name\}/g, state.playerName).replace(/\{location\}/g, state.shelter || state.location)

  const handleRadioDispatcher = async () => {
    if (!hasRadio || !hasBattery || dispatchLoading || dispatchAdvice) return

    if (!hasBatteryPack) {
      dispatch({ type: 'USE_BATTERY', payload: 15 })
    }

    setDispatchLoading(true)
    playSound('openDispatcher', 0.5)

    try {
      const prompt = buildGauntletDispatchPrompt(state, currentEvent)
      const response = await callGemini(prompt, `${state.playerName} here. What should I do?`)
      setDispatchAdvice(response)

      // Speak it
      setDispatchSpeaking(true)
      try {
        await speakAsDispatcher(response)
      } catch {}
      setDispatchSpeaking(false)
    } catch {
      setDispatchAdvice('*static* ...radio interference. Trust your instincts, ' + state.playerName + '.')
    } finally {
      setDispatchLoading(false)
    }
  }

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

    applyOutcome(result, choice.text, choice.requiresItem, consumed)
  }

  const handleImprovise = () => {
    const improvise = currentEvent.improvise
    if (!improvise) return

    // Find the first matching item the player has
    const matchedItem = improvise.useItems.find(id => state.inventory.includes(id))

    let result
    let consumed = false

    if (matchedItem && improvise.outcomes[matchedItem]) {
      result = improvise.outcomes[matchedItem]
      dispatch({ type: 'CONSUME_ITEM', payload: matchedItem })
      consumed = true
    } else {
      result = improvise.fallback
    }

    applyOutcome(result, improvise.text, matchedItem, consumed)
  }

  const applyOutcome = (result, choiceText, itemId, consumed) => {
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
        choiceText: choiceText,
        outcome: replaceName(result.note),
        hadItem: itemId ? state.inventory.includes(itemId) || consumed : null,
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
    setDispatchAdvice(null)
    setDispatchSpeaking(false)
    if (eventIndex + 1 >= GAUNTLET_EVENTS.length) {
      dispatch({ type: 'SET_PHASE', payload: 'audit' })
    } else {
      setEventIndex(eventIndex + 1)
    }
  }

  // Background darkness increases with surge
  const bgOpacity = 0.5 + (state.world.surgeLevel / 8) * 0.4

  // Check which improvise items the player has
  const improvise = currentEvent.improvise
  const improviseItems = improvise
    ? improvise.useItems.filter(id => state.inventory.includes(id))
    : []

  return (
    <div className={`h-[100dvh] flex flex-col relative ${shaking ? 'screen-shake' : ''}`}>
      {activeAlert && <EmergencyAlert message={activeAlert} onDismiss={dismissAlert} />}
      {/* Full-screen background image */}
      {bgImage && (
        <div 
          className="absolute inset-0 bg-cover bg-center z-0 ken-burns-bg"
          style={{ 
            backgroundImage: `url("${bgImage}")`,
            ...getLocationOverlayStyle(state.shelter || state.location, 'gauntlet', 0)
          }}
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

              {/* Dispatcher advice box */}
              {(dispatchAdvice || dispatchLoading) && !outcome && (
                <div className="bg-green-950/40 border border-green-800/50 rounded-lg p-3 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-green-400 text-sm">{'\u{1F4FB}'}</span>
                    <span className="text-[10px] text-green-600 font-bold tracking-[0.15em] uppercase">
                      Dispatch Advisory
                    </span>
                    {dispatchSpeaking && (
                      <span className="text-[10px] text-green-400 animate-pulse font-bold tracking-widest">
                        TRANSMITTING...
                      </span>
                    )}
                  </div>
                  {dispatchLoading && !dispatchAdvice ? (
                    <p className="text-green-600 text-sm animate-pulse font-mono">Receiving transmission...</p>
                  ) : (
                    <p className="text-green-400 text-sm font-mono leading-relaxed">{dispatchAdvice}</p>
                  )}
                </div>
              )}

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

                  {/* Improvise choice (3rd option) */}
                  {improvise && (
                    <button
                      onClick={handleImprovise}
                      className={`w-full text-left rounded-lg p-4 border transition-all duration-300 hover:scale-[1.01] ${
                        improviseItems.length > 0
                          ? 'bg-amber-950/30 border-amber-700/40 hover:border-amber-400 hover:shadow-[0_0_15px_rgba(245,158,11,0.15)]'
                          : 'bg-gray-800/40 border-gray-700/40 hover:border-gray-500 hover:shadow-[0_0_15px_rgba(156,163,175,0.1)]'
                      }`}
                    >
                      <p className="font-medium text-amber-200">{improvise.text}</p>
                      {improviseItems.length > 0 ? (
                        <p className="text-xs mt-1 text-amber-500">
                          {improviseItems.map(id => `${ITEMS[id]?.emoji} ${ITEMS[id]?.name}`).join(', ')} available
                        </p>
                      ) : (
                        <p className="text-xs mt-1 text-gray-500">No useful items — risky</p>
                      )}
                    </button>
                  )}

                  {/* Radio Dispatcher button */}
                  {hasRadio && hasBattery && !dispatchAdvice && (
                    <button
                      onClick={handleRadioDispatcher}
                      disabled={dispatchLoading}
                      className="w-full flex items-center justify-center gap-2 rounded-lg p-3 border border-green-800/40 bg-green-950/20 hover:bg-green-950/40 hover:border-green-600 text-green-400 text-sm transition-all duration-300 hover:shadow-[0_0_15px_rgba(74,222,128,0.1)] disabled:opacity-50"
                    >
                      <span>{'\u{1F4FB}'}</span>
                      <span className="font-bold tracking-wider">
                        {dispatchLoading ? 'CONTACTING DISPATCH...' : 'RADIO THE DISPATCHER'}
                      </span>
                      {!hasBatteryPack && (
                        <span className="text-xs text-green-700">(-15 battery)</span>
                      )}
                    </button>
                  )}
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
