'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { sendMessage } from '@/lib/api'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

export default function StudyPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [showQuickReplies, setShowQuickReplies] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Auto-start conversation on mount
  useEffect(() => {
    const startSession = async () => {
      setLoading(true)
      try {
        const data = await sendMessage("ابدأ الجلسة التعليمية وسل الطالب عن مستواه")
        setMessages([{ role: 'assistant', content: data.response }])
        setShowQuickReplies(true)
      } catch {
        setMessages([{ role: 'assistant', content: 'مرحباً! 👋 أنا أزور، مدرّبك الذكي لـ AZ-900!\nما مستواك الحالي؟' }])
        setShowQuickReplies(true)
      } finally {
        setLoading(false)
      }
    }
    startSession()
  }, [])

  const handleSend = async (text?: string) => {
    const userMessage = text || input.trim()
    if (!userMessage || loading) return

    setInput('')
    setShowQuickReplies(false)
    setMessages(prev => [...prev, { role: 'user', content: userMessage }])
    setLoading(true)

    try {
      const data = await sendMessage(userMessage)
      setMessages(prev => [...prev, { role: 'assistant', content: data.response }])
    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'عذراً، حدث خطأ في الاتصال. حاول مرة أخرى.'
      }])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const quickReplies = [
    "أ) مبتدئ تماماً",
    "ب) سمعت عنه قليلاً",
    "ج) درست لكن أنسى",
    "د) أعرفه جيداً"
  ]

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-blue-400">💬 الدراسة مع المدرب الذكي</h1>
        <Link
          href="/exam"
          className="px-4 py-2 rounded-xl font-bold text-dark-200 bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-300 hover:to-amber-400 transition-all"
        >
          📝 Exam
        </Link>
      </div>

      {/* Chat Area */}
      <div className="bg-dark-100 border border-slate-700 rounded-xl flex flex-col h-[600px]">
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && !loading && (
            <div className="text-center text-slate-400 mt-20">
              <span className="text-5xl block mb-4">🧠</span>
              <p className="text-lg">جاري تحميل الجلسة...</p>
            </div>
          )}

          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.role === 'user' ? 'justify-start' : 'justify-end'}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                  msg.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-700 text-slate-100'
                }`}
              >
                <p className="whitespace-pre-wrap text-sm leading-relaxed">{msg.content}</p>
              </div>
            </div>
          ))}

          {/* Quick Reply Buttons */}
          {showQuickReplies && !loading && (
            <div className="flex flex-wrap gap-2 justify-center mt-4">
              {quickReplies.map((reply, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(reply)}
                  className="px-4 py-2 bg-slate-700 hover:bg-slate-600 border border-slate-500 rounded-xl text-sm text-white transition-colors"
                >
                  {reply}
                </button>
              ))}
            </div>
          )}

          {loading && (
            <div className="flex justify-end">
              <div className="bg-slate-700 rounded-2xl px-4 py-3">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></span>
                  <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></span>
                  <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="border-t border-slate-700 p-4">
          <div className="flex gap-3">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="اكتب رسالتك هنا..."
              className="flex-1 bg-dark-200 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-400 resize-none focus:outline-none focus:border-blue-500 transition-colors"
              rows={1}
              dir="rtl"
            />
            <button
              onClick={() => handleSend()}
              disabled={loading || !input.trim()}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white px-6 py-3 rounded-xl transition-colors font-medium"
            >
              إرسال
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
