"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Header from "@/components/Header"
import Link from "next/link"
import { Search, Sparkles } from "lucide-react"

export default function HomePage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchQuery.trim()) return
    window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`
  }

  return (
    <div className="min-h-screen wood-background">
      <Header currentPage="Home" />

      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] px-4 py-8 md:p-8 relative">
        {/* Carved Background Elements */}
        <div className="absolute inset-0 opacity-20 pointer-events-none hidden md:block">
          <div className="absolute top-1/4 left-1/4 text-6xl transform -rotate-12">🦒</div>
          <div className="absolute top-1/3 left-1/2 text-4xl transform rotate-12">🌸</div>
          <div className="absolute top-1/2 left-1/3 text-3xl transform -rotate-6">🌼</div>
          <div className="absolute bottom-1/3 left-1/2 transform -translate-x-1/2 rotate-3">
            <div className="text-2xl font-bold text-amber-800 opacity-60" style={{ fontFamily: "serif" }}>
              SPRING HAS SPRUNG
            </div>
          </div>
          <div className="absolute top-1/4 right-1/3 text-5xl transform rotate-45">☀️</div>
          <div className="absolute bottom-1/4 right-1/4 text-6xl transform -rotate-12">🦸‍♂️</div>
        </div>

        {/* Main Content */}
        <div className="relative z-10 w-full max-w-4xl">
          {/* YsUp Logo */}
          <div className="text-center mb-8 md:mb-12">
            <div className="inline-block">
              <div
                className="text-5xl md:text-8xl font-bold text-yellow-400 mb-2 md:mb-4 relative"
                style={{
                  textShadow: "4px 4px 8px rgba(0,0,0,0.3), 2px 2px 4px rgba(0,0,0,0.2)",
                  filter: "drop-shadow(2px 2px 4px rgba(0,0,0,0.3))",
                }}
              >
                YsUp
                <div className="absolute -top-1 -left-3 md:-top-2 md:-left-4 text-yellow-300 text-2xl md:text-4xl">⭐</div>
              </div>
            </div>
            <p className="text-base md:text-xl text-amber-100 font-serif">AI-Powered Academic Search Engine</p>
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="mb-6 md:mb-8">
            <div className="relative max-w-2xl mx-auto">
              <div className="flex items-center bg-amber-900 border-2 border-amber-700 rounded-full shadow-2xl overflow-hidden">
                <div className="flex items-center px-3 md:px-4 py-3 flex-1">
                  <Sparkles className="w-4 h-4 md:w-5 md:h-5 text-yellow-400 mr-2 md:mr-3 flex-shrink-0" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search articles, books, or classmates..."
                    className="flex-1 bg-transparent text-amber-100 placeholder-amber-400 text-sm md:text-lg focus:outline-none min-w-0"
                  />
                </div>
                <button
                  type="submit"
                  className="bg-yellow-500 hover:bg-yellow-400 text-amber-900 px-4 md:px-6 py-3 transition-colors flex-shrink-0"
                >
                  <Search className="w-5 h-5 md:w-6 md:h-6" />
                </button>
              </div>
            </div>
          </form>

          {/* Quick Access Buttons */}
          <div className="flex flex-col sm:flex-row justify-center items-center gap-3 sm:gap-4 md:gap-6 mt-8 md:mt-12">
            <Link
              href="/dashboard"
              className="w-full sm:w-auto text-center bg-amber-700 hover:bg-amber-600 text-amber-100 px-6 py-3 rounded-lg font-medium transition-colors shadow-lg"
            >
              Go to Dashboard
            </Link>
            <Link
              href="/bookstore"
              className="w-full sm:w-auto text-center bg-blue-700 hover:bg-blue-600 text-blue-100 px-6 py-3 rounded-lg font-medium transition-colors shadow-lg"
            >
              Browse Bookstore
            </Link>
            <Link
              href="/academy"
              className="w-full sm:w-auto text-center bg-green-700 hover:bg-green-600 text-green-100 px-6 py-3 rounded-lg font-medium transition-colors shadow-lg"
            >
              YsUp Academy
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
