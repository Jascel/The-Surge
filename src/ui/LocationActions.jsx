import { useState } from 'react'
import { useGame } from '../GameContext'
import { LOCATIONS } from '../data/locations'
import { ITEMS } from '../data/items'
import { INFRASTRUCTURE_TASKS } from '../data/infrastructure'
import { playSound } from '../utils/audio'

export default function LocationActions() {
  const { state, dispatch } = useGame()
  const location = LOCATIONS[state.location]
  const [discoveredItem, setDiscoveredItem] = useState(null)
  const [areaMessage, setAreaMessage] = useState(null)

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
    <div className="p-4 space-y-6">
      {/* Scavenge areas */}
      <div className="space-y-2">
        <h3 className="text-xs text-gray-500 uppercase tracking-wider">Search Areas</h3>
        {location.areas.map((area) => {
          const isLooted = state.lootedAreas.includes(area.id)
          const isDiscovering = discoveredItem?.areaId === area.id
          const hasMessage = areaMessage?.areaId === area.id

          return (
            <div key={area.id} className="space-y-1">
              <button
                onClick={() => handleSearchArea(area)}
                disabled={isLooted}
                className={`w-full text-left rounded-lg p-3 border transition-all duration-300 ${
                  isLooted
                    ? 'bg-gray-900/50 border-gray-800 opacity-50 cursor-default'
                    : area.isRisky
                    ? 'bg-red-950/30 border-red-900/50 hover:border-red-500 hover:bg-red-950/50 hover:scale-[1.01] hover:shadow-[0_0_15px_rgba(239,68,68,0.15)] cursor-pointer'
                    : 'bg-gray-900/50 border-gray-700/50 hover:border-cyan-500 hover:bg-gray-800/50 hover:scale-[1.01] hover:shadow-[0_0_15px_rgba(6,182,212,0.15)] cursor-pointer'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`font-medium ${isLooted ? 'text-gray-600' : 'text-gray-200'}`}>
                    {area.name}
                  </span>
                  {isLooted && <span className="text-green-600 text-xs">{'\u2713'} Searched</span>}
                  {area.isRisky && !isLooted && (
                    <span className="text-red-400 text-xs">{'\u26A0'} Risky</span>
                  )}
                </div>
                <p className={`text-xs mt-1 ${isLooted ? 'text-gray-700' : 'text-gray-500'}`}>
                  {area.description}
                </p>
              </button>

              {/* Found item display */}
              {isDiscovering && discoveredItem.items[discoveredItem.currentIndex] && (
                <ItemDiscovery
                  itemId={discoveredItem.items[discoveredItem.currentIndex]}
                  onPickUp={handlePickUp}
                  onLeave={handleLeave}
                />
              )}

              {/* Empty area message */}
              {hasMessage && (
                <div className="ml-4 text-sm text-gray-500 italic">
                  {areaMessage.text}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Infrastructure tasks */}
      {availableTasks.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-xs text-amber-500 uppercase tracking-wider">Infrastructure Tasks</h3>
          {availableTasks.map((task) => {
            const hasItem = !task.requiresItem || state.inventory.includes(task.requiresItem)
            return (
              <button
                key={task.id}
                onClick={() => handleInfraTask(task)}
                disabled={!hasItem}
                className={`w-full text-left rounded-lg p-3 border transition-all duration-300 ${
                  hasItem
                    ? 'bg-amber-950/20 border-amber-700/50 hover:border-amber-400 hover:bg-amber-950/40 hover:scale-[1.01] hover:shadow-[0_0_15px_rgba(251,191,36,0.15)] cursor-pointer'
                    : 'bg-gray-900/30 border-gray-800 opacity-50 cursor-default'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-amber-300">{task.name}</span>
                  {task.requiresItem && (
                    <span className={`text-xs ${hasItem ? 'text-amber-500' : 'text-gray-600'}`}>
                      Requires: {ITEMS[task.requiresItem]?.name}
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1">{task.description}</p>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

function ItemDiscovery({ itemId, onPickUp, onLeave }) {
  const item = ITEMS[itemId]
  if (!item) return null

  return (
    <div className="ml-4 bg-cyan-950/30 border border-cyan-700/50 rounded-lg p-3 space-y-2">
      <div className="flex items-center gap-2">
        <span className="text-xl">{item.emoji}</span>
        <div>
          <p className="text-cyan-300 font-medium">Found: {item.name}!</p>
          <p className="text-xs text-gray-400">Weight: {item.weight} | {item.guide.femaRef}</p>
        </div>
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => onPickUp(itemId)}
          className="pickup-button bg-cyan-700 hover:bg-cyan-600 text-white text-sm px-3 py-1 rounded transition-colors"
        >
          Pick Up
        </button>
        <button
          onClick={onLeave}
          className="bg-gray-700 hover:bg-gray-600 text-gray-300 text-sm px-3 py-1 rounded transition-colors"
        >
          Leave
        </button>
      </div>
    </div>
  )
}
