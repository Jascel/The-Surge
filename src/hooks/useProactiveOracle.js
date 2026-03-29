import { useState, useEffect } from 'react'

// Module-level so it persists across remounts
const firedSet = new Set()
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
  {
    id: 'time_6',
    check: (state) => state.world.phase === 'gathering' && state.world.timeUntilLandfall <= 6,
    message: 'Six hours to landfall. Start thinking about shelter.',
  },
  {
    id: 'time_3',
    check: (state) => state.world.phase === 'gathering' && state.world.timeUntilLandfall <= 3,
    message: 'Three hours. Get to high ground NOW.',
  },
  {
    id: 'time_1',
    check: (state) => state.world.phase === 'gathering' && state.world.timeUntilLandfall <= 1,
    message: "Final hour. If you're not sheltered, you won't make it.",
  },
]

export function useProactiveOracle(state) {
  const [activeDispatch, setActiveDispatch] = useState(null)

  useEffect(() => {
    const now = Date.now()
    if (now - lastAlertTime < 30000) return

    for (const trigger of PROACTIVE_TRIGGERS) {
      if (firedSet.has(trigger.id)) continue
      if (trigger.check(state)) {
        firedSet.add(trigger.id)
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
  ])

  const dismissDispatch = () => setActiveDispatch(null)

  return { activeDispatch, dismissDispatch }
}
