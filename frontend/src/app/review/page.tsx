'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import MemoryMap from '@/components/MemoryMap'
import ProgressBar from '@/components/ProgressBar'
import { getWeakTopics, getMemoryMap } from '@/lib/api'

interface MemoryItem {
  topic_id: number
  topic_name: string
  category: string
  strength: number
  last_reviewed: string | null
  next_review: string | null
  review_count: number
}

export default function ReviewPage() {
  const searchParams = useSearchParams()
  const mode = searchParams.get('mode')
  const [memoryData, setMemoryData] = useState<MemoryItem[]>([])
  const [weakTopics, setWeakTopics] = useState<MemoryItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const [mapData, weak] = await Promise.all([
          getMemoryMap(),
          getWeakTopics()
        ])
        setMemoryData(mapData)
        setWeakTopics(weak)
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-xl text-slate-400">جاري التحميل...</div>
      </div>
    )
  }

  const categories = [...new Set(memoryData.map(item => item.category))]
  const overallStrength = memoryData.length > 0
    ? Math.round(memoryData.reduce((acc, item) => acc + item.strength, 0) / memoryData.length)
    : 0

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-purple-400">
          {mode === 'tonight' ? '🌙 مراجعة الليلة' : '📊 خريطة الذاكرة'}
        </h1>
        <div className="text-left">
          <p className="text-sm text-slate-400">القوة الإجمالية</p>
          <p className="text-3xl font-bold text-blue-400">{overallStrength}%</p>
        </div>
      </div>

      <div className="bg-dark-100 border border-slate-700 rounded-xl p-6">
        <h2 className="text-lg font-semibold mb-4">التقدم حسب الفئة</h2>
        <div className="space-y-3">
          {categories.map(category => {
            const categoryItems = memoryData.filter(item => item.category === category)
            const avgStrength = Math.round(
              categoryItems.reduce((acc, item) => acc + item.strength, 0) / categoryItems.length
            )
            return (
              <ProgressBar
                key={category}
                label={category}
                value={avgStrength}
                max={100}
              />
            )
          })}
        </div>
      </div>

      <MemoryMap data={memoryData} />

      {weakTopics.length > 0 && (
        <div className="bg-dark-100 border border-red-900/30 rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4 text-red-400">⚠️ مواضيع تحتاج مراجعة</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {weakTopics.map(topic => (
              <div
                key={topic.topic_id}
                className="bg-dark-200 border border-slate-700 rounded-lg p-4 flex items-center justify-between"
              >
                <div>
                  <p className="font-medium">{topic.topic_name}</p>
                  <p className="text-sm text-slate-400">{topic.category}</p>
                </div>
                <span className={`text-sm font-bold px-3 py-1 rounded-full ${
                  topic.strength < 30
                    ? 'bg-red-900/30 text-red-400'
                    : 'bg-yellow-900/30 text-yellow-400'
                }`}>
                  {Math.round(topic.strength)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
