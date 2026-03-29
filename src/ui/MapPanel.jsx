import { useGame } from '../GameContext'
import { LOCATIONS } from '../data/locations'
import { ROUTES, getConnections, isRouteFlooded } from '../data/routes'

// Node positions (percentage-based for responsive layout)
const NODE_POSITIONS = {
  MSC: { x: 45, y: 50 },
  LIBRARY: { x: 65, y: 35 },
  MUMA: { x: 30, y: 30 },
  CHICKFILA: { x: 25, y: 65 },
  BEARD: { x: 75, y: 15 },
  PIZZO: { x: 12, y: 50 },
}

export default function MapPanel() {
  const { state, dispatch } = useGame()
  const connections = getConnections(state.location)

  const handleNodeClick = (locationId) => {
    if (!connections.includes(locationId)) return
    // Don't allow moving to hidden location unless campus_map is found
    if (LOCATIONS[locationId]?.hidden && !state.collectHistory.includes('campus_map')) return
    dispatch({ type: 'MOVE_TO', payload: locationId })
  }

  const visibleLocations = Object.entries(LOCATIONS).filter(([id, loc]) => {
    if (loc.hidden && !state.collectHistory.includes('campus_map')) return false
    return true
  })

  return (
    <div className="p-4 h-full">
      <h3 className="text-xs text-gray-500 uppercase tracking-wider mb-2">Campus Map</h3>
      <div className="relative bg-gray-900/50 rounded-lg border border-gray-800 aspect-[4/3] overflow-hidden">
        {/* Grid background */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.15) 1px, transparent 1px)',
            backgroundSize: '20px 20px',
          }}
        />

        {/* SVG routes */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          {ROUTES.map((route) => {
            // Don't render routes to hidden locations
            if (LOCATIONS[route.from]?.hidden && !state.collectHistory.includes('campus_map')) return null
            if (LOCATIONS[route.to]?.hidden && !state.collectHistory.includes('campus_map')) return null

            const from = NODE_POSITIONS[route.from]
            const to = NODE_POSITIONS[route.to]
            if (!from || !to) return null

            const flooded = isRouteFlooded(route.from, route.to, state.world.surgeLevel)
            const isActive =
              (route.from === state.location && connections.includes(route.to)) ||
              (route.to === state.location && connections.includes(route.from))

            return (
              <line
                key={`${route.from}-${route.to}`}
                x1={from.x}
                y1={from.y}
                x2={to.x}
                y2={to.y}
                stroke={flooded ? '#3B82F6' : isActive ? '#6B7280' : '#374151'}
                strokeWidth={flooded ? 0.6 : 0.4}
                strokeDasharray={flooded ? '0' : '2 1'}
                opacity={flooded ? 0.8 : isActive ? 0.6 : 0.3}
              />
            )
          })}
        </svg>

        {/* Location nodes */}
        {visibleLocations.map(([id, loc]) => {
          const pos = NODE_POSITIONS[id]
          if (!pos) return null

          const isCurrent = state.location === id
          const isConnected = connections.includes(id)
          const isFlooded = state.world.surgeLevel > loc.elevation

          return (
            <button
              key={id}
              onClick={() => handleNodeClick(id)}
              disabled={!isConnected || isCurrent}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 group"
              style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
            >
              {/* Node circle */}
              <div
                className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all text-[10px] font-bold ${
                  isCurrent
                    ? 'bg-cyan-600 border-cyan-400 text-white shadow-lg shadow-cyan-500/30'
                    : isConnected
                    ? isFlooded
                      ? 'bg-blue-900/60 border-blue-500 text-blue-300 hover:bg-blue-800/60 cursor-pointer'
                      : 'bg-gray-800 border-gray-500 text-gray-300 hover:bg-gray-700 hover:border-cyan-500 cursor-pointer'
                    : 'bg-gray-900 border-gray-700 text-gray-600'
                }`}
              >
                {loc.elevation}
              </div>

              {/* Label */}
              <div
                className={`absolute top-full mt-1 left-1/2 -translate-x-1/2 whitespace-nowrap text-[9px] font-medium tracking-wider ${
                  isCurrent ? 'text-cyan-400' : isConnected ? 'text-gray-400' : 'text-gray-600'
                }`}
              >
                {loc.name.length > 15 ? id : loc.name}
              </div>

              {/* Flood warning */}
              {isFlooded && isConnected && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full animate-pulse" />
              )}

              {/* Current location indicator */}
              {isCurrent && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-cyan-400 rounded-full animate-pulse" />
              )}
            </button>
          )
        })}

        {/* Legend */}
        <div className="absolute bottom-2 right-2 text-[8px] text-gray-600 space-y-0.5">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-cyan-600" />
            <span>Current</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-blue-500" />
            <span>Flooded</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-0.5 bg-gray-500" />
            <span># = Elevation</span>
          </div>
        </div>
      </div>
    </div>
  )
}
