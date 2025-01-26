'use client'
import { FC, useState } from 'react'

const Insurance: FC = () => {
  const [messages, setMessages] = useState<Array<{text: string, sender: 'user' | 'ai'}>>([
    {text: "Hi! I'm here to help you with your insurance needs. What questions do you have?", sender: 'ai'}
  ])
  const [input, setInput] = useState('')

  const handleSend = () => {
    if (!input.trim()) return
    
    setMessages(prev => [...prev, {text: input, sender: 'user'}])
    setInput('')
    
    // Simulate AI response
    setTimeout(() => {
      setMessages(prev => [...prev, {
        text: "Thanks for your message! I'm a demo AI assistant. In the full version, I'll help analyze your insurance needs.",
        sender: 'ai'
      }])
    }, 1000)
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-yellow-300 via-white to-gray-200">
      <div className="max-w-3xl mx-auto p-4 pt-8">
        <div className="bg-white rounded-2xl shadow-lg p-4 min-h-[600px] flex flex-col">
          <div className="flex-1 overflow-y-auto mb-4">
            {messages.map((message, index) => (
              <div key={index} className={`mb-4 ${message.sender === 'user' ? 'text-right' : 'text-left'}`}>
                <div className={`inline-block p-3 rounded-2xl ${
                  message.sender === 'user' 
                    ? 'bg-yellow-300 text-gray-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {message.text}
                </div>
              </div>
            ))}
          </div>
          
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              className="flex-1 p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-yellow-300"
              placeholder="Type your message..."
            />
            <button
              onClick={handleSend}
              className="px-6 py-3 bg-yellow-300 rounded-xl font-semibold hover:bg-yellow-400 transition-colors"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </main>
  )
}

export default Insurance 