const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export async function sendMessage(message: string) {
  const res = await fetch(`${API_URL}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message }),
  })
  if (!res.ok) throw new Error('Failed to send message')
  return res.json()
}

export async function getMemoryMap() {
  const res = await fetch(`${API_URL}/memory-map`)
  if (!res.ok) throw new Error('Failed to fetch memory map')
  return res.json()
}

export async function submitAnswer(topicId: string, answer: string, timeSeconds: number) {
  const res = await fetch(`${API_URL}/answer`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      topic_id: parseInt(topicId),
      answer,
      time_seconds: timeSeconds,
    }),
  })
  if (!res.ok) throw new Error('Failed to submit answer')
  return res.json()
}

export async function getWeakTopics() {
  const res = await fetch(`${API_URL}/weak-topics`)
  if (!res.ok) throw new Error('Failed to fetch weak topics')
  return res.json()
}

export async function getTonightReview() {
  const res = await fetch(`${API_URL}/tonight-review`)
  if (!res.ok) throw new Error('Failed to fetch tonight review')
  return res.json()
}

export async function getTopics() {
  const res = await fetch(`${API_URL}/topics`)
  if (!res.ok) throw new Error('Failed to fetch topics')
  return res.json()
}

export async function resetChat() {
  const res = await fetch(`${API_URL}/chat/reset`, { method: 'POST' })
  if (!res.ok) throw new Error('Failed to reset chat')
  return res.json()
}
