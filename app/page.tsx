"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import Header from "@/components/Header"
import Link from "next/link"
import { Search, Sparkles } from "lucide-react"
import SplashScreen from "@/components/SplashScreen"

const weatherCodeLabels: Record<number, { label: string; icon: string }> = {
  0: { label: "Clear", icon: "☀️" },
  1: { label: "Mostly Clear", icon: "🌤️" },
  2: { label: "Partly Cloudy", icon: "⛅" },
  3: { label: "Overcast", icon: "☁️" },
  45: { label: "Fog", icon: "🌫️" },
  48: { label: "Rime Fog", icon: "🌫️" },
  51: { label: "Light Drizzle", icon: "🌦️" },
  53: { label: "Drizzle", icon: "🌦️" },
  55: { label: "Heavy Drizzle", icon: "🌧️" },
  61: { label: "Light Rain", icon: "🌧️" },
  63: { label: "Rain", icon: "🌧️" },
  65: { label: "Heavy Rain", icon: "🌧️" },
  71: { label: "Light Snow", icon: "🌨️" },
  73: { label: "Snow", icon: "❄️" },
  75: { label: "Heavy Snow", icon: "❄️" },
  77: { label: "Snow Grains", icon: "🌨️" },
  80: { label: "Light Showers", icon: "🌦️" },
  81: { label: "Showers", icon: "🌧️" },
  82: { label: "Heavy Showers", icon: "🌧️" },
  85: { label: "Snow Showers", icon: "🌨️" },
  86: { label: "Heavy Snow Showers", icon: "🌨️" },
  95: { label: "Thunderstorm", icon: "⛈️" },
  96: { label: "Thunderstorm + Hail", icon: "⛈️" },
  99: { label: "Thunderstorm + Heavy Hail", icon: "⛈️" },
}

function formatDateTime(date: Date): string {
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
  const day = days[date.getDay()]
  const month = months[date.getMonth()]
  const dateNum = date.getDate()
  const year = date.getFullYear()
  let hours = date.getHours()
  const minutes = date.getMinutes().toString().padStart(2, "0")
  const ampm = hours >= 12 ? "PM" : "AM"
  hours = hours % 12 || 12
  return `${day}, ${month} ${dateNum}, ${year} ${hours}:${minutes} ${ampm}`
}

export default function HomePage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [currentTime, setCurrentTime] = useState("")
  const [weather, setWeather] = useState<{ temp: number; code: number } | null>(null)
  const [showSplash, setShowSplash] = useState(false)
  const [splashChecked, setSplashChecked] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [lastPage, setLastPage] = useState<string | null>(null)

  useEffect(() => {
    const user = localStorage.getItem("currentUser")
    const hasSeenSplash = localStorage.getItem("ysup_splash_seen")

    if (user) {
      setIsLoggedIn(true)
      const saved = localStorage.getItem("ysup_last_page")
      if (saved && saved !== "/") {
        setLastPage(saved)
      }
      if (!hasSeenSplash) {
        setShowSplash(true)
        localStorage.setItem("ysup_splash_seen", "1")
      }
    } else {
      if (!hasSeenSplash) {
        setShowSplash(true)
        localStorage.setItem("ysup_splash_seen", "1")
      }
    }
    setSplashChecked(true)
  }, [])

  const fetchWeather = useCallback(async () => {
    try {
      const res = await fetch("https://api.open-meteo.com/v1/forecast?latitude=38.9072&longitude=-77.0369&current=temperature_2m,weather_code&temperature_unit=fahrenheit&timezone=America%2FNew_York")
      const data = await res.json()
      if (data.current) {
        setWeather({ temp: Math.round(data.current.temperature_2m), code: data.current.weather_code })
      }
    } catch {}
  }, [])

  useEffect(() => {
    setCurrentTime(formatDateTime(new Date()))
    fetchWeather()

    const timeInterval = setInterval(() => {
      setCurrentTime(formatDateTime(new Date()))
    }, 60000)

    const weatherInterval = setInterval(() => {
      fetchWeather()
    }, 900000)

    return () => {
      clearInterval(timeInterval)
      clearInterval(weatherInterval)
    }
  }, [fetchWeather])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchQuery.trim()) return
    window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`
  }

  if (!splashChecked) {
    return null
  }

  if (showSplash) {
    return (
      <SplashScreen
        onComplete={() => setShowSplash(false)}
        isLoggedIn={isLoggedIn}
        lastPage={lastPage}
      />
    )
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
              <img
                src="/ysup-logo.png"
                alt="YsUp"
                className="h-32 md:h-48 w-auto mx-auto mb-2 md:mb-4 drop-shadow-lg"
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden') }}
              />
              <div
                className="hidden text-5xl md:text-8xl font-bold text-yellow-400 mb-2 md:mb-4 relative"
                style={{
                  textShadow: "4px 4px 8px rgba(0,0,0,0.3), 2px 2px 4px rgba(0,0,0,0.2)",
                  filter: "drop-shadow(2px 2px 4px rgba(0,0,0,0.3))",
                }}
              >
                YsUp⭐
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

        {currentTime && (
          <div className="fixed bottom-4 left-4 z-50">
            <div className="bg-stone-900/80 backdrop-blur-sm border border-amber-700/30 rounded-lg px-4 py-2.5 shadow-lg">
              <div className="text-amber-100 text-xs sm:text-sm font-medium">{currentTime}</div>
              {weather && (
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="text-base">{weatherCodeLabels[weather.code]?.icon || "🌡️"}</span>
                  <span className="text-amber-200/80 text-xs sm:text-sm">
                    Washington, DC — {weather.temp}°F, {weatherCodeLabels[weather.code]?.label || "Unknown"}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
