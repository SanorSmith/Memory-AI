import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Memory AI - مدرب الذاكرة الذكي',
  description: 'تطبيق ذكي لتعزيز الذاكرة والتحضير لشهادة AZ-900',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ar" dir="rtl">
      <body className="min-h-screen bg-dark-300 text-white">
        <nav className="border-b border-slate-700 bg-dark-200/80 backdrop-blur-sm sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🧠</span>
                <span className="text-xl font-bold bg-gradient-to-l from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  Memory AI
                </span>
              </div>
              <div className="flex gap-6">
                <a href="/" className="text-slate-300 hover:text-white transition-colors">
                  الرئيسية
                </a>
                <a href="/study" className="text-slate-300 hover:text-white transition-colors">
                  الدراسة
                </a>
                <a href="/review" className="text-slate-300 hover:text-white transition-colors">
                  المراجعة
                </a>
              </div>
            </div>
          </div>
        </nav>
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
      </body>
    </html>
  )
}
