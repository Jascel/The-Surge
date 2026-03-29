import { useState, useRef, useEffect } from 'react'

const ALERT_TRIGGERS = [
  {
    id: 'gathering_start',
    check: (state) => state.world.phase === 'gathering',
    message: 'HURRICANE WARNING \u2014 HILLSBOROUGH COUNTY \u2014 CAT 5 \u2014 LANDFALL IN 12 HOURS',
  },
  {
    id: 'flood_watch',
    check: (state) => state.world.phase === 'gathering' && state.world.timeUntilLandfall <= 8,
    message: 'FLASH FLOOD WATCH \u2014 LOW-LYING AREAS EXPECT 2-4 FT SURGE',
  },
  {
    id: 'flood_warning',
    check: (state) => state.world.phase === 'gathering' && state.world.timeUntilLandfall <= 4,
    message: 'FLASH FLOOD WARNING \u2014 SEEK HIGH GROUND IMMEDIATELY',
  },
  {
    id: 'sprint_start',
    check: (state) => state.world.phase === 'sprint',
    message: 'EXTREME WIND WARNING \u2014 SUSTAINED WINDS 140+ MPH \u2014 TAKE SHELTER NOW',
  },
  {
    id: 'gauntlet_start',
    check: (state) => state.world.phase === 'gauntlet',
    message: 'STORM SURGE WARNING \u2014 8-12 FT SURGE \u2014 LIFE-THREATENING',
  },
]

export function useEmergencyAlerts(state) {
  const firedRef = useRef(new Set())
  const [activeAlert, setActiveAlert] = useState(null)

  useEffect(() => {
    for (const trigger of ALERT_TRIGGERS) {
      if (firedRef.current.has(trigger.id)) continue
      if (trigger.check(state)) {
        firedRef.current.add(trigger.id)
        setActiveAlert(trigger.message)
        break
      }
    }
  }, [state.world.phase, state.world.timeUntilLandfall])

  const dismissAlert = () => setActiveAlert(null)

  return { activeAlert, dismissAlert }
}
