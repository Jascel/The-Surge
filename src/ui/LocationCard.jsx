import { useState, useEffect } from 'react'
import { useGame } from '../GameContext'
import { LOCATIONS } from '../data/locations'
import { ITEMS } from '../data/items'
import { INFRASTRUCTURE_TASKS } from '../data/infrastructure'
import { getLocationImagePath, getLocationOverlayStyle } from '../utils/imagePaths'
import { playSound } from '../utils/audio'
import EmergencyAlert from './EmergencyAlert'

export default function LocationCard() {
  const { state, dispatch, activeAlert, dismissAlert } = useGame()
  const location = LOCATIONS[state.location]
  const [discoveredItem, setDiscoveredItem] = useState(null)
  const [areaMessage, setAreaMessage] = useState(null)
  
  // For smooth transitions between locations
  const [currentImage, setCurrentImage] = useState(null)
  const [fadeKey, setFadeKey] = useState(state.location)

  useEffect(() => {
    const newImage = getLocationImagePath(state.location, state.world.phase, state.world.timeUntilLandfall)
    setCurrentImage(newImage)
    setFadeKey(state.location + state.world.timeUntilLandfall)
  }, [state.location, state.world.phase, state.world.timeUntilLandfall])

  if (!location) return null

  const handleSearchArea = (area) => {
    if (state.lootedAreas.includes(area.id)) return

    dispatch({ type: 'LOOT_AREA', payload: area.id })

    // Roll for loot
    const foundItems = []
    for (const loot of area.lootTable) {
      if (Math.random() <= loot.chance) {
        foundItems.push(loot.itemId)
      }
    }

    if (foundItems.length > 0) {
      setDiscoveredItem({ areaId: area.id, items: foundItems, currentIndex: 0 })
      setAreaMessage(null)
    } else {
      setDiscoveredItem(null)
      setAreaMessage({
        areaId: area.id,
        text: area.flavorText || 'Nothing useful here.',
      })
      setTimeout(() => setAreaMessage(null), 3000)
    }
  }

  const handlePickUp = (itemId) => {
    playSound('takeItem', 0.6)
    dispatch({ type: 'PICK_UP_ITEM', payload: itemId })

    if (discoveredItem) {
      const nextIndex = discoveredItem.currentIndex + 1
      if (nextIndex < discoveredItem.items.length) {
        setDiscoveredItem({ ...discoveredItem, currentIndex: nextIndex })
      } else {
        setDiscoveredItem(null)
      }
    }
  }

  const handleLeave = () => {
    if (discoveredItem) {
      const nextIndex = discoveredItem.currentIndex + 1
      if (nextIndex < discoveredItem.items.length) {
        setDiscoveredItem({ ...discoveredItem, currentIndex: nextIndex })
      } else {
        setDiscoveredItem(null)
      }
    }
  }

  const handleInfraTask = (task) => {
    if (task.requiresItem && !state.inventory.includes(task.requiresItem)) return
    dispatch({ type: 'DO_INFRA_TASK', payload: task.id })
    if (task.requiresItem) {
      dispatch({ type: 'CONSUME_ITEM', payload: task.requiresItem })
    }
    if (task.morale) {
      dispatch({ type: 'APPLY_STAT_CHANGE', payload: { morale: task.morale } })
    }
  }

  // Get available infra tasks at this location
  const availableTasks = INFRASTRUCTURE_TASKS.filter(
    (t) => t.locations.includes(state.location) && !state.infrastructureDone.includes(t.id)
  )

  return (
    <div className="p-4 h-full flex flex-col">
      {/* Location header (takes up remaining space) */}
      <div className="relative rounded-lg overflow-hidden flex-1 border border-gray-800 shadow-lg min-h-[300px]">
        {/* Emergency Alert (slides down from top of card) */}
        {activeAlert && <EmergencyAlert message={activeAlert} onDismiss={dismissAlert} />}

        {/* Background Image with Ken Burns effect */}
        {currentImage ? (
          <div 
            key={fadeKey}
            className="absolute inset-0 bg-cover bg-center ken-burns-bg phase-fade-enter-active"
            style={{ 
              backgroundImage: `url("${currentImage}")`,
              ...getLocationOverlayStyle(state.location, state.world.phase, state.world.timeUntilLandfall)
            }}
          />
        ) : (
          <div className={`absolute inset-0 bg-gradient-to-r ${location.gradient}`} />
        )}
        
        {/* Gradient overlay to ensure text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/40 to-transparent" />

        {/* Header Content */}
        <div className="absolute bottom-0 left-0 w-full p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl sm:text-4xl font-bold text-white drop-shadow-lg">{location.name}</h2>
            <div className="flex items-center gap-2 bg-gray-950/70 px-3 py-1.5 rounded-lg backdrop-blur-md border border-gray-800">
              <span className="text-sm text-gray-300 font-medium">Elevation:</span>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className={`w-2.5 h-4 rounded-sm ${
                      i <= location.elevation ? 'bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.6)]' : 'bg-gray-700'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
          <p className="text-lg text-gray-200 mt-3 drop-shadow-md max-w-2xl">{location.description}</p>
        </div>
      </div>
    </div>
  )
}
