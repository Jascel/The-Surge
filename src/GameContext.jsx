import { createContext, useContext, useReducer } from 'react'
import { ITEMS, WEIGHT_LIMIT } from './data/items'
import { LOCATIONS } from './data/locations'
import { getRoute, isRouteFlooded } from './data/routes'

const GameContext = createContext(null)

const initialState = {
  playerName: '',

  stats: {
    health: 100,
    hunger: 100,
    thirst: 100,
    battery: 100,
    morale: 100,
  },

  world: {
    surgeLevel: 0,
    timeUntilLandfall: 12,
    phase: 'start', // 'start' | 'gathering' | 'sprint' | 'gauntlet' | 'audit' | 'death'
  },

  inventory: [],        // item IDs currently held
  collectHistory: [],   // ALL items ever picked up (never removed)

  location: 'MSC',
  shelter: null,
  vehicleParked: null,  // 'garage' | 'lot' | null
  choices: [],          // { eventId, choiceText, outcome }
  infrastructureDone: [],
  lootedAreas: [],      // area IDs that have been searched

  // UI state
  lastEvent: null,      // last notification/event text
}

function clampStat(value) {
  return Math.max(0, Math.min(100, value))
}

function applyStatChanges(stats, changes) {
  const newStats = { ...stats }
  for (const [key, delta] of Object.entries(changes)) {
    if (key in newStats) {
      newStats[key] = clampStat(newStats[key] + delta)
    }
  }
  return newStats
}

function checkDeath(state) {
  if (state.stats.health <= 0 && state.world.phase !== 'death' && state.world.phase !== 'audit') {
    return { ...state, world: { ...state.world, phase: 'death' } }
  }
  return state
}

function drainFromDepletedNeeds(state) {
  let healthDrain = 0
  if (state.stats.hunger <= 0) healthDrain -= 5
  if (state.stats.thirst <= 0) healthDrain -= 8
  if (healthDrain < 0) {
    return {
      ...state,
      stats: {
        ...state.stats,
        health: clampStat(state.stats.health + healthDrain),
      },
    }
  }
  return state
}

function getInventoryWeight(inventory) {
  return inventory.reduce((sum, id) => sum + (ITEMS[id]?.weight || 0), 0)
}

function gameReducer(state, action) {
  let newState = state

  switch (action.type) {
    case 'SET_NAME':
      newState = { ...state, playerName: action.payload }
      break

    case 'SET_PHASE':
      newState = { ...state, world: { ...state.world, phase: action.payload } }
      break

    case 'MOVE_TO': {
      const destination = action.payload
      const route = getRoute(state.location, destination)
      if (!route) break

      const statChanges = { ...route.statCost }

      // Apply flood penalty if route is flooded
      if (isRouteFlooded(state.location, destination, state.world.surgeLevel)) {
        for (const [key, val] of Object.entries(route.floodPenalty)) {
          statChanges[key] = (statChanges[key] || 0) + val
        }
      }

      newState = {
        ...state,
        location: destination,
        stats: applyStatChanges(state.stats, statChanges),
        world: {
          ...state.world,
          timeUntilLandfall: Math.max(0, state.world.timeUntilLandfall - 1),
        },
      }

      // Drain health if hunger/thirst depleted
      newState = drainFromDepletedNeeds(newState)

      // Check if time ran out
      if (newState.world.timeUntilLandfall <= 0 && newState.world.phase === 'gathering') {
        newState = { ...newState, world: { ...newState.world, phase: 'sprint' } }
      }
      break
    }

    case 'LOOT_AREA': {
      const areaId = action.payload
      if (state.lootedAreas.includes(areaId)) break

      newState = {
        ...state,
        lootedAreas: [...state.lootedAreas, areaId],
        world: {
          ...state.world,
          timeUntilLandfall: Math.max(0, state.world.timeUntilLandfall - 1),
        },
      }

      // Check if time ran out
      if (newState.world.timeUntilLandfall <= 0 && newState.world.phase === 'gathering') {
        newState = { ...newState, world: { ...newState.world, phase: 'sprint' } }
      }
      break
    }

    case 'PICK_UP_ITEM': {
      const itemId = action.payload
      const item = ITEMS[itemId]
      if (!item) break

      const currentWeight = getInventoryWeight(state.inventory)
      if (currentWeight + item.weight > WEIGHT_LIMIT) {
        newState = { ...state, lastEvent: `Can't carry ${item.name} -- inventory full (${currentWeight}/${WEIGHT_LIMIT})` }
        break
      }

      newState = {
        ...state,
        inventory: [...state.inventory, itemId],
        collectHistory: state.collectHistory.includes(itemId)
          ? state.collectHistory
          : [...state.collectHistory, itemId],
        lastEvent: null,
      }
      break
    }

    case 'DROP_ITEM': {
      const itemId = action.payload
      const idx = state.inventory.indexOf(itemId)
      if (idx === -1) break
      const newInv = [...state.inventory]
      newInv.splice(idx, 1)
      newState = { ...state, inventory: newInv }
      break
    }

    case 'CONSUME_ITEM': {
      const itemId = action.payload
      const idx = state.inventory.indexOf(itemId)
      if (idx === -1) break
      const newInv = [...state.inventory]
      newInv.splice(idx, 1)
      newState = { ...state, inventory: newInv }
      break
    }

    case 'DO_INFRA_TASK': {
      const taskId = action.payload
      if (state.infrastructureDone.includes(taskId)) break

      newState = {
        ...state,
        infrastructureDone: [...state.infrastructureDone, taskId],
        world: {
          ...state.world,
          timeUntilLandfall: Math.max(0, state.world.timeUntilLandfall - 1),
        },
      }

      // Check if time ran out
      if (newState.world.timeUntilLandfall <= 0 && newState.world.phase === 'gathering') {
        newState = { ...newState, world: { ...newState.world, phase: 'sprint' } }
      }
      break
    }

    case 'APPLY_STAT_CHANGE': {
      const changes = action.payload // e.g. { health: -10, morale: 5 }
      newState = {
        ...state,
        stats: applyStatChanges(state.stats, changes),
      }
      break
    }

    case 'LOG_CHOICE': {
      newState = {
        ...state,
        choices: [...state.choices, action.payload],
      }
      break
    }

    case 'SET_VEHICLE':
      newState = { ...state, vehicleParked: action.payload }
      break

    case 'SET_SHELTER':
      newState = { ...state, shelter: action.payload }
      break

    case 'INCREMENT_SURGE':
      newState = {
        ...state,
        world: { ...state.world, surgeLevel: state.world.surgeLevel + 1 },
      }
      break

    case 'USE_BATTERY': {
      const cost = action.payload || 15
      newState = {
        ...state,
        stats: { ...state.stats, battery: clampStat(state.stats.battery - cost) },
      }
      break
    }

    case 'RESET_GAME':
      newState = { ...initialState }
      break

    case 'CLEAR_EVENT':
      newState = { ...state, lastEvent: null }
      break

    default:
      break
  }

  // Always check for death after state changes
  newState = checkDeath(newState)
  return newState
}

export function GameProvider({ children }) {
  const [state, dispatch] = useReducer(gameReducer, initialState)

  return (
    <GameContext.Provider value={{ state, dispatch }}>
      {children}
    </GameContext.Provider>
  )
}

export function useGame() {
  const context = useContext(GameContext)
  if (!context) {
    throw new Error('useGame must be used within a GameProvider')
  }
  return context
}
