"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Header from "@/components/Header"
import Link from "next/link"
import { Search, Book, Globe, Sparkles } from "lucide-react"

export default function HomePage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [showResults, setShowResults] = useState(false)

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchQuery.trim()) return

    setIsSearching(true)
    setShowResults(true)

    // Simulate AI search results
    setTimeout(() => {
      const mockResults = [
        {
          type: "scholarly",
          title: "Understanding Machine Learning: From Theory to Algorithms",
          author: "Shai Shalev-Shwartz, Shai Ben-David",
          source: "Cambridge University Press",
          snippet:
            "Machine learning is one of the fastest growing areas of computer science, with far-reaching applications...",
          image: "/placeholder.svg?height=120&width=80&text=ML+Book",
          url: "#",
        },
        {
          type: "book",
          title: "Introduction to Algorithms",
          author: "Thomas H. Cormen",
          source: "Google Books",
          snippet: "This book provides a comprehensive introduction to the modern study of computer algorithms...",
          image: "/placeholder.svg?height=120&width=80&text=Algorithms",
          url: "#",
        },
        {
          type: "user",
          username: "+emmettill",
          name: "Emmett Till",
          college: "Howard University",
          major: "Computer Science",
          image: "/placeholder.svg?height=40&width=40",
          online: true,
        },
        {
          type: "user",
          username: "+sarahjohnson",
          name: "Sarah Johnson",
          college: "Howard University",
          major: "Mathematics",
          image: "/placeholder.svg?height=40&width=40",
          online: false,
        },
      ]
      setSearchResults(mockResults)
      setIsSearching(false)
    }, 1500)
  }

  const handleUserMessage = (username: string) => {
    // This would open the messaging system with the selected user
    router.push(`/dashboard?message=${username}`)
  }

  return (
    <div className="min-h-screen wood-background">
      <Header currentPage="Home" />

      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] p-8 relative">
        {/* Carved Background Elements */}
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          {/* Giraffe */}
          <div className="absolute top-1/4 left-1/4 text-6xl transform -rotate-12">🦒</div>

          {/* Flowers */}
          <div className="absolute top-1/3 left-1/2 text-4xl transform rotate-12">🌸</div>
          <div className="absolute top-1/2 left-1/3 text-3xl transform -rotate-6">🌼</div>

          {/* Spring Text */}
          <div className="absolute bottom-1/3 left-1/2 transform -translate-x-1/2 rotate-3">
            <div className="text-2xl font-bold text-amber-800 opacity-60" style={{ fontFamily: "serif" }}>
              SPRING HAS SPRUNG
            </div>
          </div>

          {/* Sun */}
          <div className="absolute top-1/4 right-1/3 text-5xl transform rotate-45">☀️</div>

          {/* Superhero */}
          <div className="absolute bottom-1/4 right-1/4 text-6xl transform -rotate-12">🦸‍♂️</div>
        </div>

        {/* Main Content */}
        <div className="relative z-10 w-full max-w-4xl">
          {/* YsUp Logo */}
          <div className="text-center mb-12">
            <div className="inline-block">
              <div
                className="text-8xl font-bold text-yellow-400 mb-4 relative"
                style={{
                  textShadow: "4px 4px 8px rgba(0,0,0,0.3), 2px 2px 4px rgba(0,0,0,0.2)",
                  filter: "drop-shadow(2px 2px 4px rgba(0,0,0,0.3))",
                }}
              >
                YsUp
                <div className="absolute -top-2 -left-4 text-yellow-300 text-4xl">⭐</div>
              </div>
            </div>
            <p className="text-xl text-amber-100 font-serif">AI-Powered Academic Search Engine</p>
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="mb-8">
            <div className="relative max-w-2xl mx-auto">
              <div className="flex items-center bg-amber-900 border-2 border-amber-700 rounded-full shadow-2xl overflow-hidden">
                <div className="flex items-center px-4 py-3 flex-1">
                  <Sparkles className="w-5 h-5 text-yellow-400 mr-3" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search scholarly articles, books, or find classmates..."
                    className="flex-1 bg-transparent text-amber-100 placeholder-amber-400 text-lg focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSearching}
                  className="bg-yellow-500 hover:bg-yellow-400 disabled:bg-yellow-600 text-amber-900 px-6 py-3 transition-colors"
                >
                  {isSearching ? (
                    <div className="animate-spin w-6 h-6 border-2 border-amber-900 border-t-transparent rounded-full"></div>
                  ) : (
                    <Search className="w-6 h-6" />
                  )}
                </button>
              </div>
            </div>
          </form>

          {/* Search Results */}
          {showResults && (
            <div className="max-w-4xl mx-auto bg-amber-50 rounded-lg shadow-2xl p-6 max-h-96 overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-amber-900">Search Results</h3>
                <button onClick={() => setShowResults(false)} className="text-amber-700 hover:text-amber-900">
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                {searchResults.map((result, index) => (
                  <div key={index} className="border-b border-amber-200 pb-4 last:border-b-0">
                    {result.type === "user" ? (
                      // User Profile Result
                      <div className="flex items-center justify-between p-3 bg-white rounded-lg shadow">
                        <div className="flex items-center space-x-3">
                          <img
                            src={result.image || "/placeholder.svg"}
                            alt={result.name}
                            className="w-10 h-10 rounded-full"
                          />
                          <div>
                            <div className="font-semibold text-gray-800">{result.name}</div>
                            <div className="text-sm text-gray-600">{result.username}</div>
                            <div className="text-xs text-gray-500">
                              {result.major} • {result.college}
                            </div>
                          </div>
                          {result.online && <div className="w-3 h-3 bg-green-500 rounded-full"></div>}
                        </div>
                        <button
                          onClick={() => handleUserMessage(result.username)}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm"
                        >
                          Message
                        </button>
                      </div>
                    ) : (
                      // Book/Article Result
                      <div className="flex space-x-4 p-3 bg-white rounded-lg shadow">
                        <img
                          src={result.image || "/placeholder.svg"}
                          alt={result.title}
                          className="w-16 h-20 object-cover rounded"
                        />
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            {result.type === "book" ? (
                              <Book className="w-4 h-4 text-blue-600" />
                            ) : (
                              <Globe className="w-4 h-4 text-green-600" />
                            )}
                            <span className="text-xs font-medium text-gray-500 uppercase">{result.source}</span>
                          </div>
                          <h4 className="font-semibold text-gray-800 mb-1">{result.title}</h4>
                          <p className="text-sm text-gray-600 mb-1">by {result.author}</p>
                          <p className="text-sm text-gray-700">{result.snippet}</p>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {searchResults.length === 0 && !isSearching && (
                <div className="text-center py-8 text-gray-500">No results found. Try a different search term.</div>
              )}
            </div>
          )}

          {/* Quick Access Buttons */}
          <div className="flex justify-center space-x-6 mt-12">
            <Link
              href="/dashboard"
              className="bg-amber-700 hover:bg-amber-600 text-amber-100 px-6 py-3 rounded-lg font-medium transition-colors shadow-lg"
            >
              Go to Dashboard
            </Link>
            <Link
              href="/bookstore"
              className="bg-blue-700 hover:bg-blue-600 text-blue-100 px-6 py-3 rounded-lg font-medium transition-colors shadow-lg"
            >
              Browse Bookstore
            </Link>
            <Link
              href="/academy"
              className="bg-green-700 hover:bg-green-600 text-green-100 px-6 py-3 rounded-lg font-medium transition-colors shadow-lg"
            >
              YsUp Academy
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
