import { useState, useEffect, useRef } from 'react'
import { useGame } from '../GameContext'
import { ITEMS } from '../data/items'
import { callGemini } from '../api/gemini'

function buildAuditPrompt(state) {
  const survived = state.stats.health > 0
  const itemsCollected = state.collectHistory.map((id) => ITEMS[id]?.name || id).join(', ')
  const decisionsLog = state.choices
    .map((c) => `Event: ${c.eventId} | Choice: "${c.choiceText}" | Outcome: ${c.outcome}`)
    .join('\n')

  return `You are a FEMA Resilience Analyst generating an official post-storm audit for ${state.playerName}.

OUTCOME: ${survived ? 'SURVIVED' : 'DID NOT SURVIVE'}

PLAYER DATA:
- Final stats: Health ${state.stats.health}/100, Hunger ${state.stats.hunger}/100, Thirst ${state.stats.thirst}/100, Battery ${state.stats.battery}/100, Morale ${state.stats.morale}/100
- Shelter chosen: ${state.shelter || 'none'}
- Vehicle status: ${state.vehicleParked === 'garage' ? 'Secured in Beard Garage (safe)' : state.vehicleParked === 'lot' ? 'Left in surface lot (destroyed)' : 'No vehicle decision made'}
- Items ever collected (full history): ${itemsCollected || 'none'}
- Infrastructure tasks completed: ${state.infrastructureDone.length > 0 ? state.infrastructureDone.join(', ') : 'none'}
- Decisions log:
${decisionsLog || 'No decisions recorded'}

Generate a full HTML resilience report with these sections:
1. **Overall Grade** (A-F) with 1-sentence summary for ${state.playerName}
2. **What You Did Right** - specific actions with FEMA praise
3. **Critical Gaps** - what items/tasks were missed and why they mattered
4. **Decision Review** - table of each gauntlet choice with outcome + FEMA rationale
5. **Vehicle Assessment** - surface lot vs. Beard Garage outcome + FEMA protocol
6. **General Tampa Bay Preparedness Guidelines** - always included:
   - 1 gallon water/person/day minimum
   - 72-hour emergency kit contents
   - NFIP flood insurance and the $1,000 loss-avoidance reimbursement
   - Pizzo Elementary as the on-campus FEMA shelter
   - NOAA Weather Radio importance
   - When to evacuate vs. shelter-in-place
7. **Actionable Next Steps** - 3-5 real things ${state.playerName} can do this week in Tampa Bay

Style the HTML with inline CSS. Use a dark theme (background: #0a0a0a, text: #e5e5e5).
Use professional formatting with clear section headers.
Output valid HTML only. No markdown. No code fences.
If player died: lead with cause of death and what single change would have saved them.
Cite FEMA guidelines by name where applicable.`
}

export default function AuditPhase() {
  const { state, dispatch } = useGame()
  const [reportHtml, setReportHtml] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const iframeRef = useRef(null)

  useEffect(() => {
    let cancelled = false

    async function generateReport() {
      try {
        const prompt = buildAuditPrompt(state)
        const html = await callGemini(prompt, 'Generate the report.')
        if (!cancelled) {
          setReportHtml(html)
          setLoading(false)
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message)
          setLoading(false)
        }
      }
    }

    generateReport()
    return () => { cancelled = true }
  }, [])

  const handleDownload = () => {
    if (!reportHtml) return
    const blob = new Blob([reportHtml], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `surge-resilience-report-${state.playerName}.html`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handlePlayAgain = () => {
    dispatch({ type: 'RESET_GAME' })
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-950">
      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-800 px-4 py-3 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-white tracking-wider">
            FEMA Resilience Report
          </h1>
          <p className="text-xs text-gray-500">
            {state.stats.health > 0 ? 'Survivor' : 'Post-Mortem'} Analysis for {state.playerName}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleDownload}
            disabled={!reportHtml}
            className="bg-cyan-700 hover:bg-cyan-600 disabled:bg-gray-700 text-white text-sm px-4 py-2 rounded transition-colors"
          >
            Download Report
          </button>
          <button
            onClick={handlePlayAgain}
            className="bg-gray-700 hover:bg-gray-600 text-white text-sm px-4 py-2 rounded transition-colors"
          >
            Play Again
          </button>
        </div>
      </div>

      {/* Report */}
      <div className="flex-1 overflow-auto">
        {loading && (
          <div className="flex items-center justify-center h-64">
            <div className="text-center space-y-4">
              <div className="animate-pulse text-cyan-400 text-lg">
                FEMA Resilience Analyst is reviewing your performance...
              </div>
              <div className="flex justify-center gap-1">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce"
                    style={{ animationDelay: `${i * 0.2}s` }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="p-8 text-center space-y-4">
            <p className="text-red-400">Failed to generate report: {error}</p>
            <button
              onClick={() => {
                setError(null)
                setLoading(true)
                // Retry
                callGemini(buildAuditPrompt(state), 'Generate the report.')
                  .then((html) => {
                    setReportHtml(html)
                    setLoading(false)
                  })
                  .catch((err) => {
                    setError(err.message)
                    setLoading(false)
                  })
              }}
              className="bg-cyan-700 hover:bg-cyan-600 text-white px-4 py-2 rounded"
            >
              Retry
            </button>
          </div>
        )}

        {reportHtml && (
          <iframe
            ref={iframeRef}
            srcDoc={reportHtml}
            className="w-full h-full min-h-screen border-0"
            title="Resilience Report"
            sandbox="allow-same-origin"
          />
        )}
      </div>
    </div>
  )
}
