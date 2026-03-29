import { useGame } from '../GameContext'

const STAT_CONFIG = [
  { key: 'health', label: 'HP', color: 'bg-red-500', emoji: '\u{2764}\u{FE0F}' },
  { key: 'hunger', label: 'HGR', color: 'bg-orange-500', emoji: '\u{1F354}' },
  { key: 'thirst', label: 'THR', color: 'bg-blue-500', emoji: '\u{1F4A7}' },
  { key: 'battery', label: 'BAT', color: 'bg-yellow-500', emoji: '\u{1F50B}' },
  { key: 'morale', label: 'MRL', color: 'bg-purple-500', emoji: '\u{1F9E0}' },
]

function StatBar({ stat, value }) {
  const critical = value <= 25
  const danger = value <= 10
  const pulseClass = danger ? 'stat-danger' : critical ? 'stat-critical' : ''

  return (
    <div className={`flex items-center gap-2 ${pulseClass}`}>
      <span className="text-sm">{stat.emoji}</span>
      <div className="flex flex-col min-w-[60px]">
        <span className="text-[10px] text-gray-400 uppercase tracking-wider">{stat.label}</span>
        <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
          <div
            className={`h-full ${stat.color} rounded-full transition-all duration-500`}
            style={{ width: `${value}%` }}
          />
        </div>
      </div>
      <span className={`text-xs tabular-nums ${critical ? 'text-red-400' : 'text-gray-400'}`}>
        {value}
      </span>
    </div>
  )
}

export default function StatsBar() {
  const { state } = useGame()

  return (
    <div className="bg-gray-900/80 backdrop-blur-md border-b border-gray-800 px-4 py-2 flex items-center justify-between gap-4 z-30 relative shadow-md">
      <div className="flex items-center gap-4 flex-wrap">
        {STAT_CONFIG.map((stat) => (
          <StatBar key={stat.key} stat={stat} value={state.stats[stat.key]} />
        ))}
      </div>

      {state.world.phase === 'gathering' && (
        <div className="flex items-center gap-2 text-sm">
          <span className="text-gray-500">LANDFALL IN:</span>
          <span className={`font-bold tabular-nums ${state.world.timeUntilLandfall <= 3 ? 'text-red-400 stat-critical' : 'text-cyan-400'}`}>
            {state.world.timeUntilLandfall}
          </span>
          <span className="text-gray-600 text-xs">actions</span>
        </div>
      )}

      {state.world.phase === 'gauntlet' && (
        <div className="flex items-center gap-2 text-sm">
          <span className="text-gray-500">SURGE:</span>
          <span className="font-bold text-blue-400 tabular-nums">
            {state.world.surgeLevel}/8
          </span>
        </div>
      )}
    </div>
  )
}
