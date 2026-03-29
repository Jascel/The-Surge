import { useState, useRef, useEffect } from 'react'
import { useGame } from '../GameContext'
import { callGemini } from '../api/gemini'
import { playSound, setGlobalDucking } from '../utils/audio'
import { speakAsDispatcher } from '../utils/tts'
import { startListening, stopListening } from '../utils/stt'

function buildOraclePrompt(state, history) {
  // Build dynamic location priorities based on game state
  const urgentNeeds = []
  if (state.stats.thirst < 30) urgentNeeds.push('WATER (Chick-fil-A has a water gallon)')
  if (state.stats.hunger < 30) urgentNeeds.push('FOOD (Chick-fil-A has canned food + energy bars)')
  if (state.stats.health < 40) urgentNeeds.push('MEDICAL (Library top floor has a first aid kit)')
  if (!state.inventory.includes('radio')) urgentNeeds.push('RADIO (MSC Security Desk has one)')
  if (state.world.timeUntilLandfall <= 4 && !state.shelter) urgentNeeds.push('SHELTER (Library or Beard Garage — elevation 5, highest on campus)')

  let prompt = `You are the Emergency Oracle — a FEMA-trained radio dispatcher with FULL KNOWLEDGE of USF Tampa campus.
The player's name is ${state.playerName}. Address them as ${state.playerName} occasionally.

CURRENT SITUATION:
- Location: ${state.location}
- Health: ${state.stats.health}/100 | Hunger: ${state.stats.hunger}/100 | Thirst: ${state.stats.thirst}/100
- Battery: ${state.stats.battery}/100 | Morale: ${state.stats.morale}/100
- Inventory: ${state.inventory.length > 0 ? state.inventory.join(', ') : 'empty'}
- Time until landfall: ${state.world.timeUntilLandfall} actions remaining (each move/action costs 1)
- Surge level: ${state.world.surgeLevel}/8
- Infrastructure completed: ${state.infrastructureDone.length > 0 ? state.infrastructureDone.join(', ') : 'none'}
${urgentNeeds.length > 0 ? `- URGENT NEEDS: ${urgentNeeds.join(', ')}` : ''}

YOUR CAMPUS KNOWLEDGE (use this to give SPECIFIC directions):

LOCATIONS & ELEVATION:
- MSC (Marshall Student Center) — Elevation 3. Central hub. Has: radio + flashlight (Security Desk), campus_map (Bulletin Board), energy bar (Vending Machine), food can (Break Room). The campus_map reveals the hidden FEMA shelter at Pizzo Elementary.
- LIBRARY (USF Library) — Elevation 5 (HIGHEST, SAFEST). Has: first_aid_kit + knowledge_binder (Librarian's Office, top floor), battery_pack (Supply Closet, top floor), sandbags (Basement — BUT basement has flood risk). Best shelter option.
- MUMA (Muma College of Business) — Elevation 1 (LOWEST, MOST DANGEROUS). Floods first. Has: sandbags + tarp (Maintenance Closet). Get supplies and GET OUT. Do NOT shelter here.
- CHICKFILA (Chick-fil-A) — Elevation 3. Has: water_gallon + food_can (Counter), energy_bar (Freezer), whistle (Staff Room). Best food/water source on campus.
- BEARD (Beard Garage, Floors 3-8) — Elevation 5 (HIGHEST, SAFEST). Parking structure. Good lookout point but no supplies. Safe shelter option.
- PIZZO (Pizzo Elementary) — Elevation 3. Hidden until campus_map is found at MSC. Official FEMA shelter. Has: water_gallon + first_aid_kit (Supply Room), battery_pack (Office).

ROUTES & FLOOD RISK:
- MSC ↔ Library: Safe (floods at surge 4+)
- MSC ↔ Chick-fil-A: Safe (floods at surge 4+)
- MSC ↔ MUMA: RISKY (floods at surge 2+, -10 health when flooded)
- Library ↔ Beard: Safe (floods at surge 3+)
- MUMA ↔ Beard: VERY DANGEROUS (floods at surge 1+, -15 health when flooded)
- Pizzo ↔ MSC: Safe (floods at surge 4+)

STRATEGIC ADVICE RULES:
- NEVER tell the player to shelter at MUMA. It's elevation 1, it floods first. This is a death trap.
- Best shelter locations: Library (elevation 5) or Beard Garage (elevation 5).
- Pizzo is the official FEMA shelter but only elevation 3 — good if found early, not ideal for late-game.
- If player needs food/water: direct them to Chick-fil-A specifically.
- If player needs medical: direct them to Library top floor specifically.
- If surge level is rising: warn about low-elevation routes (especially MUMA ↔ Beard).
- Each move costs 1 action + hunger/thirst. Plan routes efficiently.
- Weight limit is 8 units. Help prioritize what to carry.

CRITICAL FEMA PRINCIPLES TO WEAVE IN:
- 1 gallon water per person per day
- Seek highest ground during storm surge
- Never walk/drive through flood water
- 72-hour emergency kit essentials
- Interior rooms on highest floor for wind protection

Respond with SPECIFIC, ACTIONABLE advice referencing actual campus locations and what's there.
Max 3 sentences. Be urgent and direct like a real emergency dispatcher.
Do not break character. Do not invent locations or items that don't exist above.`

  if (history.length > 0) {
    prompt += '\n\nCONVERSATION SO FAR:\n'
    prompt += history.map(m =>
      `${m.role === 'user' ? 'SURVIVOR' : 'DISPATCH'}: ${m.text}`
    ).join('\n')
    prompt += '\n\nSURVIVOR\'s new message:'
  }

  return prompt
}

export default function OracleChat({ onClose }) {
  const { state, dispatch } = useGame()
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [speaking, setSpeaking] = useState(false)
  const [micState, setMicState] = useState('idle') // idle | listening | processing
  const chatEndRef = useRef(null)
  const staticAudioRef = useRef(null)

  const hasRadio = state.inventory.includes('radio')
  const hasBattery = state.stats.battery > 0
  const hasBatteryPack = state.inventory.includes('battery_pack')

  useEffect(() => {
    playSound('openDispatcher', 0.5)

    const staticAudio = playSound('dispatcherStatic', 0.2, true)
    staticAudioRef.current = staticAudio

    return () => {
      if (staticAudioRef.current) {
        staticAudioRef.current.pause()
      }
    }
  }, [])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async (userMsg) => {
    setMessages((prev) => [...prev, { role: 'user', text: userMsg }])

    // Battery cost — free if battery_pack in inventory
    if (!hasBatteryPack) {
      dispatch({ type: 'USE_BATTERY', payload: 15 })
    }
    setLoading(true)

    try {
      const systemPrompt = buildOraclePrompt(state, messages)
      const response = await callGemini(systemPrompt, userMsg)
      setMessages((prev) => [...prev, { role: 'oracle', text: response }])

      // Speak the response via TTS
      setSpeaking(true)
      try {
        await speakAsDispatcher(response)
      } catch {}
      setSpeaking(false)
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: 'oracle', text: '*static* ...radio interference. Try again, ' + state.playerName + '.' },
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleSend = async (e) => {
    e.preventDefault()
    if (!input.trim() || loading || !hasRadio || !hasBattery) return
    const userMsg = input.trim()
    setInput('')
    await sendMessage(userMsg)
  }

  const handleMicToggle = async () => {
    if (!hasRadio || !hasBattery || loading) return

    if (micState === 'listening') {
      // Click to stop — end recognition
      stopListening()
      return
    }

    if (micState !== 'idle') return

    setMicState('listening')
    setGlobalDucking(true)

    try {
      const transcript = await startListening()
      setMicState('processing')
      setGlobalDucking(false)
      if (transcript.trim()) {
        await sendMessage(transcript.trim())
      }
    } catch (err) {
      console.warn('Mic error:', err)
      setGlobalDucking(false)
    } finally {
      if (micState !== 'processing') {
        setGlobalDucking(false)
      }
      setMicState('idle')
    }
  }

  return (
    <div className="fixed bottom-0 right-0 w-full max-w-md z-50 m-4">
      <div className="bg-gray-950/90 backdrop-blur-md border border-green-800/50 rounded-lg shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between bg-green-950/50 px-4 py-2 border-b border-green-800/30">
          <div className="flex items-center gap-2">
            <span className="text-green-400">{'\u{1F4FB}'}</span>
            <span className="text-sm text-green-400 font-bold tracking-wider">EMERGENCY ORACLE</span>
            {hasRadio && hasBattery && (
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            )}
            {hasBatteryPack && (
              <span className="text-[10px] bg-green-800/60 text-green-300 px-1.5 py-0.5 rounded-full font-bold tracking-wider">
                EXTENDED FREQ
              </span>
            )}
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white">{'\u2715'}</button>
        </div>

        {/* Messages */}
        <div className="h-64 overflow-y-auto p-3 space-y-2 font-mono text-sm">
          {!hasRadio && (
            <p className="text-red-400 text-center italic">
              You need an emergency radio to contact the Oracle. Find one at the Security Desk in MSC.
            </p>
          )}
          {hasRadio && !hasBattery && (
            <p className="text-red-400 text-center italic">
              Battery dead. Oracle offline.
            </p>
          )}
          {hasRadio && hasBattery && messages.length === 0 && (
            <p className="text-green-600 text-center italic">
              Radio connected. Ask the dispatcher for guidance.
            </p>
          )}

          {messages.map((msg, i) => (
            <div
              key={i}
              className={`${
                msg.role === 'user'
                  ? 'text-gray-300 text-right'
                  : 'text-green-400'
              }`}
            >
              {msg.role === 'oracle' && (
                <span className="text-green-600 text-xs">DISPATCH &gt; </span>
              )}
              {msg.text}
            </div>
          ))}

          {loading && !speaking && (
            <div className="text-green-600 animate-pulse">Receiving transmission...</div>
          )}
          {speaking && (
            <div className="text-green-400 animate-pulse font-bold text-xs tracking-widest">
              TRANSMITTING...
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Input */}
        <form onSubmit={handleSend} className="border-t border-green-800/30 p-2 flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              !hasRadio || !hasBattery
                ? 'Radio unavailable'
                : hasBatteryPack
                  ? 'Extended frequency \u2014 unlimited'
                  : 'Ask the Oracle... (-15 battery)'
            }
            disabled={!hasRadio || !hasBattery || loading}
            className="flex-1 bg-gray-900 border border-gray-700 rounded px-3 py-1.5 text-sm text-green-400 placeholder-gray-600 focus:outline-none focus:border-green-600 disabled:opacity-50"
          />

          {/* Click-to-talk mic button */}
          <button
            type="button"
            onClick={handleMicToggle}
            disabled={!hasRadio || !hasBattery || loading}
            className={`px-3 rounded text-sm transition-colors ${
              micState === 'listening'
                ? 'bg-red-700 text-white animate-pulse'
                : micState === 'processing'
                  ? 'bg-yellow-700 text-white'
                  : 'bg-green-800 hover:bg-green-700 disabled:bg-gray-800 disabled:text-gray-600 text-white'
            }`}
            title={micState === 'listening' ? 'Click to stop' : 'Click to talk'}
          >
            {micState === 'listening' ? 'STOP' : micState === 'processing' ? '...' : '\u{1F3A4}'}
          </button>

          <button
            type="submit"
            disabled={!hasRadio || !hasBattery || loading || !input.trim()}
            className="bg-green-800 hover:bg-green-700 disabled:bg-gray-800 disabled:text-gray-600 text-white text-sm px-3 rounded transition-colors"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  )
}
