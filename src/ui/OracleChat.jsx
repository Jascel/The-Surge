import { useState, useRef, useEffect } from 'react'
import { useGame } from '../GameContext'
import { callGemini } from '../api/gemini'

function buildOraclePrompt(state) {
  return `You are the Emergency Oracle — a FEMA-trained radio dispatcher connected to USF Emergency Management.
The player's name is ${state.playerName}. Address them as ${state.playerName} occasionally.

CURRENT SITUATION:
- Location: ${state.location}
- Health: ${state.stats.health}/100 | Hunger: ${state.stats.hunger}/100 | Thirst: ${state.stats.thirst}/100
- Battery: ${state.stats.battery}/100 | Morale: ${state.stats.morale}/100
- Inventory: ${state.inventory.length > 0 ? state.inventory.join(', ') : 'empty'}
- Time until landfall: ${state.world.timeUntilLandfall} actions remaining
- Surge level: ${state.world.surgeLevel}
- Infrastructure completed: ${state.infrastructureDone.length > 0 ? state.infrastructureDone.join(', ') : 'none'}

Respond ONLY with real FEMA guidelines and USF-specific survival advice.
Max 3 sentences. Be urgent and direct. Never invent items or game mechanics not listed above.
Do not break character. Prioritize the player's immediate situation.`
}

export default function OracleChat({ onClose }) {
  const { state, dispatch } = useGame()
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const chatEndRef = useRef(null)

  const hasRadio = state.inventory.includes('radio')
  const hasBattery = state.stats.battery > 0

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async (e) => {
    e.preventDefault()
    if (!input.trim() || loading || !hasRadio || !hasBattery) return

    const userMsg = input.trim()
    setInput('')
    setMessages((prev) => [...prev, { role: 'user', text: userMsg }])

    dispatch({ type: 'USE_BATTERY', payload: 15 })
    setLoading(true)

    try {
      const systemPrompt = buildOraclePrompt(state)
      const response = await callGemini(systemPrompt, userMsg)
      setMessages((prev) => [...prev, { role: 'oracle', text: response }])
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: 'oracle', text: '*static* ...radio interference. Try again, ' + state.playerName + '.' },
      ])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed bottom-0 right-0 w-full max-w-md z-50 m-4">
      <div className="bg-gray-950 border border-green-800/50 rounded-lg shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between bg-green-950/50 px-4 py-2 border-b border-green-800/30">
          <div className="flex items-center gap-2">
            <span className="text-green-400">{'\u{1F4FB}'}</span>
            <span className="text-sm text-green-400 font-bold tracking-wider">EMERGENCY ORACLE</span>
            {hasRadio && hasBattery && (
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
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

          {loading && (
            <div className="text-green-600 animate-pulse">Receiving transmission...</div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Input */}
        <form onSubmit={handleSend} className="border-t border-green-800/30 p-2 flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={hasRadio && hasBattery ? 'Ask the Oracle... (-15 battery)' : 'Radio unavailable'}
            disabled={!hasRadio || !hasBattery || loading}
            className="flex-1 bg-gray-900 border border-gray-700 rounded px-3 py-1.5 text-sm text-green-400 placeholder-gray-600 focus:outline-none focus:border-green-600 disabled:opacity-50"
          />
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
