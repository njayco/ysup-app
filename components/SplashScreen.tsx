"use client"

import { useState, useEffect } from "react"

const SLIDE_DURATION = 1200
const LOGGED_IN_DURATION = 2000

const slides = [
  {
    title: "YsUp",
    subtitle: "The Campus Network",
    description: "Where HBCU Excellence Meets Innovation",
    icon: "⭐",
    gradient: "from-amber-900 via-amber-800 to-yellow-900",
  },
  {
    title: "AI-Powered Search",
    subtitle: "Books, Articles & More",
    description: "Search across Google Books, scholarly articles, encyclopedias, and the web — all in one place",
    icon: "🔍",
    gradient: "from-amber-950 via-amber-900 to-amber-800",
  },
  {
    title: "Campus Life",
    subtitle: "Class Networks & Events",
    description: "Join class networks, organize study groups, and stay connected with your HBCU community",
    icon: "🎓",
    gradient: "from-yellow-900 via-amber-900 to-amber-950",
  },
  {
    title: "Welcome Home",
    subtitle: "Your HBCU Digital Hub",
    description: "Dashboard, Bookstore, Academy, The Game & more — built for students, by students",
    icon: "🏠",
    gradient: "from-amber-800 via-amber-900 to-yellow-900",
  },
]

interface SplashScreenProps {
  onComplete: () => void
  isLoggedIn: boolean
  lastPage?: string | null
}

export default function SplashScreen({ onComplete, isLoggedIn, lastPage }: SplashScreenProps) {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [fadeState, setFadeState] = useState<"in" | "out">("in")
  const [done, setDone] = useState(false)

  useEffect(() => {
    if (isLoggedIn) {
      const timer = setTimeout(() => {
        setDone(true)
        if (lastPage && lastPage !== "/") {
          window.location.href = lastPage
        } else {
          onComplete()
        }
      }, LOGGED_IN_DURATION)

      const fallback = setTimeout(() => {
        setDone(true)
        onComplete()
      }, LOGGED_IN_DURATION + 3000)

      return () => {
        clearTimeout(timer)
        clearTimeout(fallback)
      }
    }

    const FADE_DURATION = 200
    const totalSlides = slides.length
    const timers: ReturnType<typeof setTimeout>[] = []
    let elapsed = 0

    for (let i = 1; i < totalSlides; i++) {
      elapsed += SLIDE_DURATION
      const fadeOutAt = elapsed
      const fadeInAt = elapsed + FADE_DURATION

      timers.push(setTimeout(() => setFadeState("out"), fadeOutAt))
      timers.push(setTimeout(() => {
        setCurrentSlide(i)
        setFadeState("in")
      }, fadeInAt))
    }

    elapsed += SLIDE_DURATION
    timers.push(setTimeout(() => {
      setDone(true)
      onComplete()
    }, elapsed))

    setFadeState("in")

    return () => timers.forEach(clearTimeout)
  }, [isLoggedIn, lastPage, onComplete])

  if (done) return null

  if (isLoggedIn) {
    return (
      <div className="fixed inset-0 z-[9999] wood-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-6">
          <div className="w-16 h-16 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin" />
          <p className="text-amber-200/60 text-sm font-medium">Loading your campus...</p>
        </div>
      </div>
    )
  }

  const slide = slides[currentSlide]

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden">
      <div className={`absolute inset-0 bg-gradient-to-br ${slide.gradient} transition-opacity duration-300`} />

      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute inset-0" style={{
          backgroundImage: `repeating-linear-gradient(
            90deg,
            transparent,
            transparent 40px,
            rgba(139, 90, 43, 0.3) 40px,
            rgba(139, 90, 43, 0.3) 41px
          ),
          repeating-linear-gradient(
            0deg,
            transparent,
            transparent 2px,
            rgba(139, 90, 43, 0.15) 2px,
            rgba(139, 90, 43, 0.15) 4px
          )`
        }} />
      </div>

      <div className={`relative z-10 text-center px-8 max-w-lg transition-all duration-300 ${
        fadeState === "in" ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      }`}>
        <div className="text-6xl md:text-7xl mb-6 drop-shadow-lg"
          style={{ filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.4))" }}>
          {slide.icon}
        </div>

        <h1 className="text-4xl md:text-5xl font-bold text-yellow-400 mb-2"
          style={{ textShadow: "3px 3px 6px rgba(0,0,0,0.4)" }}>
          {slide.title}
        </h1>

        <p className="text-lg md:text-xl text-amber-200 font-serif mb-4"
          style={{ textShadow: "1px 1px 3px rgba(0,0,0,0.3)" }}>
          {slide.subtitle}
        </p>

        <p className="text-sm md:text-base text-amber-100/70 leading-relaxed max-w-md mx-auto">
          {slide.description}
        </p>

        <div className="flex justify-center gap-2 mt-8">
          {slides.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === currentSlide
                  ? "w-8 bg-yellow-400"
                  : i < currentSlide
                    ? "w-4 bg-yellow-400/50"
                    : "w-4 bg-amber-600/40"
              }`}
            />
          ))}
        </div>
      </div>

      <div className="absolute bottom-8 left-0 right-0 text-center">
        <p className="text-amber-300/40 text-xs tracking-widest uppercase">YsUpCampus.com</p>
      </div>
    </div>
  )
}
