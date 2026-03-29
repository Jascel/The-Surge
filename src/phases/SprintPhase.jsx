import { useState } from 'react'
import { useGame } from '../GameContext'
import { LOCATIONS } from '../data/locations'
import { getHopDistance } from '../data/routes'
import StatsBar from '../ui/StatsBar'

export default function SprintPhase() {
  const { state, dispatch } = useGame()
  const [step, setStep] = useState('alert') // 'alert' | 'vehicle' | 'shelter'

  const handleVehicle = (choice) => {
    dispatch({ type: 'SET_VEHICLE', payload: choice })
    setStep('shelter')
  }

  const handleShelter = (locationId) => {
    dispatch({ type: 'SET_SHELTER', payload: locationId })

    // Calculate HP penalty by hop distance
    const hops = getHopDistance(state.location, locationId)
    let hpPenalty = 0
    if (hops === 1) hpPenalty = -5
    else if (hops === 2) hpPenalty = -15
    else if (hops >= 3) hpPenalty = -25

    if (hpPenalty < 0) {
      dispatch({ type: 'APPLY_STAT_CHANGE', payload: { health: hpPenalty } })
    }

    dispatch({ type: 'SET_PHASE', payload: 'gauntlet' })
  }

  if (step === 'alert') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <div className="text-center space-y-6 max-w-md px-4">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-red-500 tracking-wider uppercase animate-pulse">
              Hurricane Helios Has Arrived
            </h1>
            <p className="text-gray-400">
              The outer bands are hitting campus. You need to secure your vehicle and find shelter NOW.
            </p>
          </div>
          <button
            onClick={() => setStep('vehicle')}
            className="bg-red-700 hover:bg-red-600 text-white font-bold py-3 px-8 rounded tracking-wider transition-colors"
          >
            Proceed
          </button>
        </div>
      </div>
    )
  }

  if (step === 'vehicle') {
    return (
      <div className="min-h-screen flex flex-col bg-gray-950">
        <StatsBar />
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="max-w-lg w-full space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold text-white">Vehicle Protocol</h2>
              <p className="text-gray-400 text-sm">
                Where do you leave your car? This decision could save or destroy it.
              </p>
            </div>

            <div className="grid gap-4">
              <button
                onClick={() => handleVehicle('lot')}
                className="bg-gray-900 border border-gray-700 hover:border-red-600 rounded-lg p-4 text-left transition-colors group"
              >
                <h3 className="font-bold text-gray-200 group-hover:text-red-400">Surface Parking Lot</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Quick and easy. But the lot is at ground level...
                </p>
                <p className="text-xs text-red-600 mt-2">HIGH RISK: Vehicle will be exposed to surge</p>
              </button>

              <button
                onClick={() => handleVehicle('garage')}
                className="bg-gray-900 border border-gray-700 hover:border-green-600 rounded-lg p-4 text-left transition-colors group"
              >
                <h3 className="font-bold text-gray-200 group-hover:text-green-400">Beard Garage (Upper Floors)</h3>
                <p className="text-sm text-gray-500 mt-1">
                  High ground. Set emergency brake, close windows, park in reverse.
                </p>
                <p className="text-xs text-green-600 mt-2">FEMA RECOMMENDED: Park at elevation before storm</p>
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Shelter selection
  const shelterOptions = Object.values(LOCATIONS).filter((loc) => {
    if (loc.hidden && !state.collectHistory.includes('campus_map')) return false
    return true
  })

  return (
    <div className="min-h-screen flex flex-col bg-gray-950">
      <StatsBar />
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="max-w-lg w-full space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold text-white">Choose Your Shelter</h2>
            <p className="text-gray-400 text-sm">
              Pick a building to ride out the storm. Distance costs health.
            </p>
            <p className="text-xs text-gray-600">
              Current location: {LOCATIONS[state.location]?.name}
            </p>
          </div>

          <div className="grid gap-3">
            {shelterOptions.map((loc) => {
              const hops = getHopDistance(state.location, loc.id)
              const hpCost = hops === 0 ? 0 : hops === 1 ? 5 : hops === 2 ? 15 : 25

              return (
                <button
                  key={loc.id}
                  onClick={() => handleShelter(loc.id)}
                  className={`bg-gray-900 border rounded-lg p-3 text-left transition-colors ${
                    loc.elevation >= 4
                      ? 'border-green-800/50 hover:border-green-600'
                      : loc.elevation >= 3
                      ? 'border-yellow-800/50 hover:border-yellow-600'
                      : 'border-red-800/50 hover:border-red-600'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-gray-200">{loc.name}</h3>
                      <div className="flex items-center gap-3 mt-1 text-xs">
                        <span className="text-gray-500">Elevation: {loc.elevation}/5</span>
                        <span className="text-gray-500">Distance: {hops} hop{hops !== 1 ? 's' : ''}</span>
                      </div>
                    </div>
                    {hpCost > 0 && (
                      <span className="text-red-400 text-sm font-bold">-{hpCost} HP</span>
                    )}
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
