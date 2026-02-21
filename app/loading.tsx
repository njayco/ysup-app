"use client"

import { useState, useEffect } from "react"

export default function Loading() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [progress, setProgress] = useState(0)
  const [fadeState, setFadeState] = useState<"in" | "out">("in")
  const [logoVisible, setLogoVisible] = useState(false)

  const slides = [
    {
      title: "Welcome to YsUp",
      subtitle: "The Campus Network Revolution",
      content: "Transforming education through engagement, one classroom at a time.",
      color: "from-amber-600 to-yellow-700",
    },
    {
      title: "The Problem",
      subtitle: "Education is Losing the Battle",
      content:
        "Netflix, TikTok, Instagram dominate screen time with addictive experiences. Educational tools? Often difficult, disjointed, and boring.",
      color: "from-red-700 to-orange-600",
    },
    {
      title: "Our Solution",
      subtitle: "Super-Addictive Learning",
      content: "YsUp.co is the companion app education has been missing. We make learning as engaging as social media.",
      color: "from-green-700 to-teal-600",
    },
    {
      title: "YsUp Classroom Game",
      subtitle: "$50 Game Set = 3 Months Access",
      content: "Turn lectures into team sports. Earn YBUCKS for asking questions and helping classmates find answers.",
      color: "from-yellow-600 to-amber-700",
    },
    {
      title: "Campus Dashboard",
      subtitle: "All-in-One Platform",
      content: "Canvas, Blackboard, PowerSchool, and more - all integrated into one seamless experience.",
      color: "from-amber-800 to-yellow-600",
    },
    {
      title: "Class Networks",
      subtitle: "Connect & Collaborate",
      content: "Dedicated group chats for every course. Study together, share resources, build community.",
      color: "from-teal-700 to-cyan-600",
    },
    {
      title: "YsUp Academy",
      subtitle: "Edutainment Library",
      content: "Educational videos, movies, and original content. Learning that feels like entertainment.",
      color: "from-amber-700 to-orange-600",
    },
    {
      title: "Ready to Level Up?",
      subtitle: "Your Campus Awaits",
      content: "Join the movement that's revolutionizing education culture, one student at a time.",
      color: "from-emerald-700 to-teal-600",
    },
  ]

  useEffect(() => {
    setLogoVisible(true)
  }, [])

  useEffect(() => {
    const slideInterval = setInterval(() => {
      setFadeState("out")
      setTimeout(() => {
        setCurrentSlide((prev) => (prev + 1) % slides.length)
        setFadeState("in")
      }, 400)
    }, 1000)

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) return 100
        return prev + 1.25
      })
    }, 100)

    return () => {
      clearInterval(slideInterval)
      clearInterval(progressInterval)
    }
  }, [slides.length])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-stone-900 via-amber-950 to-stone-900">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -inset-10 opacity-20">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-600 rounded-full mix-blend-multiply blur-xl animate-pulse" />
          <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-yellow-700 rounded-full mix-blend-multiply blur-xl animate-pulse [animation-delay:1s]" />
          <div className="absolute bottom-1/4 left-1/2 w-96 h-96 bg-orange-600 rounded-full mix-blend-multiply blur-xl animate-pulse [animation-delay:2s]" />
        </div>
      </div>

      <div className="relative z-10 text-center max-w-4xl mx-auto px-6">
        {/* YsUp Logo */}
        <div
          className={`mb-8 transition-all duration-700 ease-out ${
            logoVisible ? "scale-100 opacity-100" : "scale-50 opacity-0"
          }`}
        >
          <h1 className="text-8xl font-bold bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-500 bg-clip-text text-transparent">
            YsUp
          </h1>
          <p className="text-2xl text-white/80 mt-2">The Campus Network</p>
        </div>

        {/* Content Slides */}
        <div className="h-80 flex items-center justify-center">
          <div
            className={`text-center transition-all duration-400 ease-in-out ${
              fadeState === "in" ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
            }`}
          >
            <div
              className={`inline-block px-8 py-4 rounded-2xl bg-gradient-to-r ${slides[currentSlide].color} mb-6 shadow-lg`}
            >
              <h2 className="text-3xl font-bold text-white mb-2">{slides[currentSlide].title}</h2>
              <h3 className="text-xl text-white/90">{slides[currentSlide].subtitle}</h3>
            </div>

            <p className="text-lg text-white/80 max-w-2xl mx-auto leading-relaxed">
              {slides[currentSlide].content}
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-12">
          <div className="w-full bg-white/20 rounded-full h-3 mb-4">
            <div
              className="bg-gradient-to-r from-yellow-400 to-amber-500 h-3 rounded-full transition-all duration-100 ease-linear"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-white/60 text-sm">
            {"Loading your campus experience... " + Math.round(progress) + "%"}
          </p>
        </div>

        {/* Feature Labels */}
        <div className="mt-8 flex justify-center gap-6 flex-wrap">
          {["Game", "Academy", "Chat", "Media", "Board", "Calendar", "Store"].map((label, index) => (
            <span
              key={index}
              className="text-sm font-medium text-amber-300/70 px-3 py-1 rounded-full border border-amber-500/30 animate-pulse"
              style={{ animationDelay: `${index * 0.3}s` }}
            >
              {label}
            </span>
          ))}
        </div>

        {/* Tagline */}
        <p
          className={`mt-6 text-white/70 text-lg italic transition-opacity duration-1000 ${
            progress > 40 ? "opacity-100" : "opacity-0"
          }`}
        >
          {"\"Making education as addictive as social media\""}
        </p>
      </div>
    </div>
  )
}
