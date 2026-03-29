export const ROUTES = [
  { from: 'MSC', to: 'LIBRARY', floodThreshold: 4, statCost: { hunger: -5, thirst: -8 }, floodPenalty: { health: 0 } },
  { from: 'MSC', to: 'CHICKFILA', floodThreshold: 4, statCost: { hunger: -5, thirst: -8 }, floodPenalty: { health: 0 } },
  { from: 'MSC', to: 'MUMA', floodThreshold: 2, statCost: { hunger: -5, thirst: -8 }, floodPenalty: { health: -10 } },
  { from: 'LIBRARY', to: 'BEARD', floodThreshold: 3, statCost: { hunger: -5, thirst: -8 }, floodPenalty: { health: 0 } },
  { from: 'MUMA', to: 'BEARD', floodThreshold: 1, statCost: { hunger: -5, thirst: -8 }, floodPenalty: { health: -15 } },
  { from: 'CHICKFILA', to: 'MSC', floodThreshold: 4, statCost: { hunger: -5, thirst: -8 }, floodPenalty: { health: 0 } },
  { from: 'PIZZO', to: 'MSC', floodThreshold: 4, statCost: { hunger: -5, thirst: -8 }, floodPenalty: { health: 0 } },
]

// Get all connections for a location (bidirectional)
export function getConnections(locationId) {
  const connections = new Set()
  for (const route of ROUTES) {
    if (route.from === locationId) connections.add(route.to)
    if (route.to === locationId) connections.add(route.from)
  }
  return [...connections]
}

// Get route between two locations
export function getRoute(from, to) {
  return ROUTES.find(
    (r) => (r.from === from && r.to === to) || (r.from === to && r.to === from)
  )
}

// Check if a route is flooded at a given surge level
export function isRouteFlooded(from, to, surgeLevel) {
  const route = getRoute(from, to)
  if (!route) return false
  return surgeLevel > route.floodThreshold
}

// BFS shortest path between two locations
export function getHopDistance(from, to) {
  if (from === to) return 0
  const visited = new Set([from])
  const queue = [[from, 0]]
  while (queue.length > 0) {
    const [current, dist] = queue.shift()
    for (const neighbor of getConnections(current)) {
      if (neighbor === to) return dist + 1
      if (!visited.has(neighbor)) {
        visited.add(neighbor)
        queue.push([neighbor, dist + 1])
      }
    }
  }
  return Infinity
}
