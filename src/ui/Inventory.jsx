import { useGame } from '../GameContext'
import { ITEMS, WEIGHT_LIMIT } from '../data/items'

export default function Inventory({ onItemClick }) {
  const { state } = useGame()
  const currentWeight = state.inventory.reduce((sum, id) => sum + (ITEMS[id]?.weight || 0), 0)

  return (
    <div className="px-4 py-2">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-gray-500 uppercase tracking-wider">Inventory</span>
        <span className={`text-xs tabular-nums ${currentWeight >= WEIGHT_LIMIT ? 'text-red-400' : 'text-gray-500'}`}>
          {currentWeight}/{WEIGHT_LIMIT} weight
        </span>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {state.inventory.length === 0 && (
          <span className="text-xs text-gray-600 italic">Empty -- search locations to find items</span>
        )}
        {state.inventory.map((itemId, idx) => {
          const item = ITEMS[itemId]
          if (!item) return null
          return (
            <button
              key={`${itemId}-${idx}`}
              onClick={() => onItemClick(itemId)}
              className="flex items-center gap-1 bg-gray-800/80 hover:bg-gray-700/80 border border-gray-700 hover:border-cyan-500 rounded px-2 py-1 text-xs transition-all duration-300 hover:scale-105 hover:shadow-[0_0_10px_rgba(6,182,212,0.2)] backdrop-blur-sm"
              title={item.name}
            >
              <span>{item.emoji}</span>
              <span className="text-gray-300">{item.name}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
