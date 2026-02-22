"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter, useParams } from "next/navigation"
import Header from "@/components/Header"
import { useAuth } from "@/lib/useAuth"
import { Send, Lightbulb, Award, ArrowLeft, Loader2 } from "lucide-react"

interface ChatMessage {
  role: "user" | "coach"
  content: string
}

interface SessionSummary {
  totalYbucksEarned: number
  newBalance: number
}

export default function OnlineGameSessionPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const params = useParams()
  const sessionId = params.sessionId as string

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "coach",
      content:
        "Welcome to YsUp AI Coach! I'm here to help you learn — but I won't just hand you the answers. Instead, I'll guide you with questions, hints, and examples so YOU discover the answer yourself.\n\nWhat topic or question would you like to explore today?",
    },
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showArrivedModal, setShowArrivedModal] = useState(false)
  const [arrivedAnswer, setArrivedAnswer] = useState("")
  const [showEndModal, setShowEndModal] = useState(false)
  const [sessionSummary, setSessionSummary] = useState<SessionSummary | null>(null)
  const [ybucksEarned, setYbucksEarned] = useState(0)
  const [userId, setUserId] = useState<number | null>(null)

  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const storedUser = localStorage.getItem("currentUser")
    if (storedUser) {
      const userData = JSON.parse(storedUser)
      setUserId(userData.id)
    }
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const sendMessage = async () => {
    if (!input.trim() || isLoading || !userId) return

    const userMessage = input.trim()
    setInput("")
    setMessages((prev) => [...prev, { role: "user", content: userMessage }])
    setIsLoading(true)

    try {
      const response = await fetch(`/api/game/online/${sessionId}/message`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: userMessage, userId }),
      })

      const data = await response.json()

      if (data.success) {
        setMessages((prev) => [...prev, { role: "coach", content: data.reply }])
        if (data.ybucksAwarded) {
          setYbucksEarned((prev) => prev + data.ybucksAwarded)
        }
      } else {
        setMessages((prev) => [
          ...prev,
          { role: "coach", content: "Sorry, I had trouble processing that. Please try again." },
        ])
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "coach", content: "Something went wrong. Please try again." },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const arrivedAtAnswer = async () => {
    if (!arrivedAnswer.trim() || !userId) return

    setIsLoading(true)
    setShowArrivedModal(false)

    setMessages((prev) => [...prev, { role: "user", content: `My answer: ${arrivedAnswer}` }])

    try {
      const response = await fetch(`/api/game/online/${sessionId}/arrived`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, userAnswer: arrivedAnswer }),
      })

      const data = await response.json()

      if (data.success) {
        const earned = data.ybucksAwarded || 10
        setYbucksEarned((prev) => prev + earned)
        setMessages((prev) => [
          ...prev,
          {
            role: "coach",
            content: `Great work! You've shown real understanding by working through that on your own. That's what learning is all about! 🎉\n\n+${earned} YBucks earned!\n\nAre there any questions, class?`,
          },
        ])
      } else {
        setMessages((prev) => [
          ...prev,
          { role: "coach", content: data.message || "Let's keep working on this together!" },
        ])
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "coach", content: "Something went wrong. Please try again." },
      ])
    } finally {
      setArrivedAnswer("")
      setIsLoading(false)
    }
  }

  const endSession = async () => {
    if (!userId) return

    setIsLoading(true)

    try {
      const response = await fetch(`/api/game/online/${sessionId}/end`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      })

      const data = await response.json()

      if (data.success) {
        setSessionSummary({
          totalYbucksEarned: data.totalYbucksEarned || ybucksEarned,
          newBalance: data.newBalance || 0,
        })
        setShowEndModal(true)
      }
    } catch {
      alert("Failed to end session. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  if (authLoading || !isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen wood-background flex flex-col">
      <Header currentPage="The Game" />

      <div className="bg-[#1e3d1a] px-3 md:px-4 py-2 md:py-3 flex items-center justify-between border-b border-green-900">
        <div className="flex items-center space-x-3">
          <Lightbulb className="w-5 h-5 text-yellow-400" />
          <h2 className="text-base md:text-xl font-bold text-green-50">AI Coach Session</h2>
          {ybucksEarned > 0 && (
            <span className="bg-yellow-500 text-black text-xs md:text-sm font-bold px-2 py-1 rounded">
              +{ybucksEarned} YBucks
            </span>
          )}
        </div>
        <button
          onClick={() => router.push("/the-game")}
          className="flex items-center space-x-1 md:space-x-2 text-green-200 hover:text-white transition-colors text-sm md:text-base"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to The Game</span>
        </button>
      </div>

      <div className="flex-1 flex flex-col bg-[#2d5a27] overflow-hidden">
        <div className="flex-1 overflow-y-auto p-3 md:p-6 space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] md:max-w-[70%] rounded-lg px-4 py-3 ${
                  message.role === "user"
                    ? "bg-[#3a7a32] text-green-50"
                    : "bg-[#1e3d1a] text-green-50"
                }`}
              >
                {message.role === "coach" && (
                  <div className="flex items-center space-x-2 mb-1">
                    <Lightbulb className="w-4 h-4 text-yellow-400" />
                    <span className="text-xs text-yellow-400 font-semibold">AI Coach</span>
                  </div>
                )}
                <p className="text-sm md:text-base whitespace-pre-wrap">{message.content}</p>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-[#1e3d1a] text-green-50 rounded-lg px-4 py-3">
                <div className="flex items-center space-x-2">
                  <Loader2 className="w-4 h-4 animate-spin text-yellow-400" />
                  <span className="text-sm text-green-200">Coach is thinking...</span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        <div className="bg-[#1e3d1a] border-t border-green-900 p-3 md:p-4">
          <div className="flex flex-col space-y-2">
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask the AI Coach a question..."
                disabled={isLoading}
                className="flex-1 bg-[#2d5a27] text-green-50 placeholder-green-300 border border-green-700 rounded-lg px-4 py-2.5 text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent disabled:opacity-50"
              />
              <button
                onClick={sendMessage}
                disabled={isLoading || !input.trim()}
                className="bg-green-600 hover:bg-green-700 disabled:bg-green-800 disabled:opacity-50 text-white p-2.5 rounded-lg transition-colors"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
              <button
                onClick={() => setShowArrivedModal(true)}
                disabled={isLoading}
                className="flex-1 sm:flex-none bg-yellow-500 hover:bg-yellow-600 disabled:bg-yellow-700 disabled:opacity-50 text-black font-bold px-4 py-2.5 rounded-lg transition-colors flex items-center justify-center space-x-2 text-sm md:text-base"
              >
                <Award className="w-5 h-5" />
                <span>I Arrived At The Answer</span>
              </button>
              <button
                onClick={endSession}
                disabled={isLoading}
                className="sm:flex-none bg-red-600 hover:bg-red-700 disabled:bg-red-800 disabled:opacity-50 text-white font-medium px-4 py-2.5 rounded-lg transition-colors text-sm md:text-base"
              >
                End Session
              </button>
            </div>
          </div>
        </div>
      </div>

      {showArrivedModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1e3d1a] border border-green-700 rounded-xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Award className="w-6 h-6 text-yellow-400" />
              <h3 className="text-xl font-bold text-green-50">Submit Your Answer</h3>
            </div>
            <p className="text-green-200 text-sm mb-4">
              Type the answer you arrived at. The AI Coach will review it and you may earn YBucks!
            </p>
            <textarea
              value={arrivedAnswer}
              onChange={(e) => setArrivedAnswer(e.target.value)}
              placeholder="Type your answer here..."
              rows={4}
              className="w-full bg-[#2d5a27] text-green-50 placeholder-green-300 border border-green-700 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 mb-4 resize-none"
            />
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowArrivedModal(false)
                  setArrivedAnswer("")
                }}
                className="flex-1 bg-green-800 hover:bg-green-700 text-green-100 py-2.5 rounded-lg transition-colors text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={arrivedAtAnswer}
                disabled={!arrivedAnswer.trim()}
                className="flex-1 bg-yellow-500 hover:bg-yellow-600 disabled:bg-yellow-700 disabled:opacity-50 text-black font-bold py-2.5 rounded-lg transition-colors text-sm"
              >
                Submit Answer
              </button>
            </div>
          </div>
        </div>
      )}

      {showEndModal && sessionSummary && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1e3d1a] border border-green-700 rounded-xl shadow-2xl w-full max-w-md p-6 text-center">
            <div className="text-5xl mb-4">🎓</div>
            <h3 className="text-2xl font-bold text-green-50 mb-2">Session Complete!</h3>
            <p className="text-green-200 text-sm mb-6">Great learning session! Here's your summary:</p>

            <div className="bg-[#2d5a27] rounded-lg p-4 mb-6 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-green-200">YBucks Earned</span>
                <span className="text-yellow-400 font-bold text-xl">+{sessionSummary.totalYbucksEarned}</span>
              </div>
              <div className="border-t border-green-700" />
              <div className="flex items-center justify-between">
                <span className="text-green-200">New Balance</span>
                <span className="text-green-50 font-bold text-xl">{sessionSummary.newBalance} YBucks</span>
              </div>
            </div>

            <button
              onClick={() => router.push("/the-game")}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg transition-colors flex items-center justify-center space-x-2"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to The Game</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
