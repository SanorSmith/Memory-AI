'use client'

interface MemoryItem {
  topic_id: number
  topic_name: string
  category: string
  strength: number
  last_reviewed: string | null
  next_review: string | null
  review_count: number
}

interface MemoryMapProps {
  data: MemoryItem[]
}

export default function MemoryMap({ data }: MemoryMapProps) {
  const categories = Array.from(new Set(data.map(item => item.category)))

  const getStrengthColor = (strength: number) => {
    if (strength >= 80) return 'bg-green-500'
    if (strength >= 60) return 'bg-blue-500'
    if (strength >= 40) return 'bg-yellow-500'
    if (strength >= 20) return 'bg-orange-500'
    return 'bg-red-500'
  }

  const getStrengthBorder = (strength: number) => {
    if (strength >= 80) return 'border-green-500/30'
    if (strength >= 60) return 'border-blue-500/30'
    if (strength >= 40) return 'border-yellow-500/30'
    if (strength >= 20) return 'border-orange-500/30'
    return 'border-red-500/30'
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-blue-400">🗺️ خريطة الذاكرة البصرية</h2>

      {categories.map(category => (
        <div key={category} className="bg-dark-100 border border-slate-700 rounded-xl p-5">
          <h3 className="text-lg font-semibold mb-4 text-slate-200">{category}</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {data
              .filter(item => item.category === category)
              .map(item => (
                <div
                  key={item.topic_id}
                  className={`border ${getStrengthBorder(item.strength)} rounded-lg p-3 relative overflow-hidden transition-all hover:scale-105`}
                >
                  {/* Strength indicator bar */}
                  <div
                    className={`absolute bottom-0 left-0 h-1 ${getStrengthColor(item.strength)} transition-all`}
                    style={{ width: `${item.strength}%` }}
                  />

                  <p className="text-sm font-medium text-slate-200 mb-1">{item.topic_name}</p>
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-bold ${
                      item.strength >= 60 ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {Math.round(item.strength)}%
                    </span>
                    <span className="text-xs text-slate-500">
                      {item.review_count > 0 ? `${item.review_count} مراجعة` : 'لم يُراجع'}
                    </span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      ))}

      {/* Legend */}
      <div className="flex items-center gap-4 justify-center text-sm text-slate-400">
        <div className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-full bg-green-500"></span>
          <span>ممتاز (80%+)</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-full bg-blue-500"></span>
          <span>جيد (60%+)</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
          <span>متوسط (40%+)</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-full bg-red-500"></span>
          <span>ضعيف</span>
        </div>
      </div>
    </div>
  )
}
