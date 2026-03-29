import { useGame } from '../GameContext'
import { ITEMS } from '../data/items'

export default function ItemGuidePanel({ itemId, onClose }) {
  const { dispatch } = useGame()
  const item = ITEMS[itemId]
  if (!item) return null

  const handleDrop = () => {
    dispatch({ type: 'DROP_ITEM', payload: itemId })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity" />
      <div
        className="relative w-full max-w-sm bg-gray-900/95 backdrop-blur-md border-l border-gray-700 p-6 overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-white text-lg"
        >
          {'\u2715'}
        </button>

        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <span className="text-4xl">{item.emoji}</span>
            <div>
              <h3 className="text-xl font-bold text-white">{item.name}</h3>
              <span className="text-xs text-gray-500">Weight: {item.weight}</span>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <h4 className="text-xs text-cyan-400 uppercase tracking-wider mb-1">What It Does</h4>
              <p className="text-sm text-gray-300">{item.guide.use}</p>
            </div>
            <div>
              <h4 className="text-xs text-cyan-400 uppercase tracking-wider mb-1">How to Use</h4>
              <p className="text-sm text-gray-300">{item.guide.howTo}</p>
            </div>
            <div className="bg-blue-950/30 border border-blue-800/50 rounded p-3">
              <h4 className="text-xs text-blue-400 uppercase tracking-wider mb-1">FEMA Reference</h4>
              <p className="text-sm text-blue-200">{item.guide.femaRef}</p>
            </div>
          </div>

          <button
            onClick={handleDrop}
            className="w-full bg-red-900/30 hover:bg-red-900/50 border border-red-800/50 text-red-400 text-sm py-2 rounded transition-colors"
          >
            Drop Item
          </button>
        </div>
      </div>
    </div>
  )
}
