import { useState } from 'react'
import { useGame } from '../GameContext'
import StatsBar from '../ui/StatsBar'
import LocationCard from '../ui/LocationCard'
import MapPanel from '../ui/MapPanel'
import Inventory from '../ui/Inventory'
import ItemGuidePanel from '../ui/ItemGuidePanel'
import OracleChat from '../ui/OracleChat'

export default function GatheringPhase() {
  const { state } = useGame()
  const [selectedItem, setSelectedItem] = useState(null)
  const [oracleOpen, setOracleOpen] = useState(false)

  return (
    <div className="min-h-screen flex flex-col bg-gray-950">
      <StatsBar />

      {/* Notification bar */}
      {state.lastEvent && (
        <div className="bg-red-900/50 border-b border-red-800 px-4 py-2 text-sm text-red-300 text-center">
          {state.lastEvent}
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col lg:flex-row gap-0 overflow-hidden">
        {/* Left: Location card */}
        <div className="lg:w-[45%] overflow-y-auto border-r border-gray-800">
          <LocationCard />
        </div>

        {/* Right: Map */}
        <div className="lg:w-[55%] overflow-y-auto">
          <MapPanel />
        </div>
      </div>

      {/* Bottom: Inventory + Oracle toggle */}
      <div className="border-t border-gray-800 bg-gray-900/90">
        <Inventory onItemClick={setSelectedItem} />
        <div className="flex justify-end px-4 pb-2">
          <button
            onClick={() => setOracleOpen(!oracleOpen)}
            className="flex items-center gap-2 bg-green-900/50 hover:bg-green-800/50 border border-green-700/50 rounded px-3 py-1.5 text-sm text-green-400 transition-colors"
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
