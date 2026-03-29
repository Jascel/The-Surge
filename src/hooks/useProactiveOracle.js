import { useState, useEffect } from 'react'

function getFired() {
  try { return new Set(JSON.parse(sessionStorage.getItem('oracleFired') || '[]')) } catch { return new Set() }
}
function markFired(id) {
  const s = getFired(); s.add(id); sessionStorage.setItem('oracleFired', JSON.stringify([...s]))
}
let lastAlertTime = 0

const PROACTIVE_TRIGGERS = [
  {
    id: 'health_critical',
    check: (state) => state.stats.health < 30,
    message: 'Your vitals are critical. Find medical supplies immediately.',
  },
  {
    id: 'thirst_zero',
    check: (state) => state.stats.thirst <= 0,
    message: 'Dehydration alert. Water is priority one, survivor.',
  },
  {
    id: 'hunger_zero',
    check: (state) => state.stats.hunger <= 0,
    message: 'You need calories. Search for food now.',
  },
]

export function useProactiveOracle(state) {
  const [activeDispatch, setActiveDispatch] = useState(null)

  useEffect(() => {
    const now = Date.now()
    if (now - lastAlertTime < 30000) return
    if (activeDispatch) return // don't queue another while one is showing

    for (const trigger of PROACTIVE_TRIGGERS) {
      if (getFired().has(trigger.id)) continue
      if (trigger.check(state)) {
        markFired(trigger.id)
        lastAlertTime = now
        setActiveDispatch(trigger.message)
        break
      }
    }
  }, [
    state.stats.health,
    state.stats.thirst,
    state.stats.hunger,
    state.world.timeUntilLandfall,
    state.world.phase,
    activeDispatch,
  ])

  const dismissDispatch = () => setActiveDispatch(null)

  return { activeDispatch, dismissDispatch }
}
