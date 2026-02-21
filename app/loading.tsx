"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"

export default function Loading() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [progress, setProgress] = useState(0)

  const slides = [
    {
      title: "Welcome to YsUp",
      subtitle: "The Campus Network Revolution",
      content: "Transforming education through engagement, one classroom at a time.",
      color: "from-blue-600 to-purple-600",
    },
    {
      title: "The Problem",
      subtitle: "Education is Losing the Battle",
      content:
        "Netflix, TikTok, Instagram dominate screen time with addictive experiences. Educational tools? Often difficult, disjointed, and boring.",
      color: "from-red-500 to-orange-500",
    },
    {
      title: "Our Solution",
      subtitle: "Super-Addictive Learning",
      content: "YsUp.co is the companion app education has been missing. We make learning as engaging as social media.",
      color: "from-green-500 to-teal-500",
    },
    {
      title: "YsUp Classroom Game",
      subtitle: "$50 Game Set = 3 Months Access",
      content: "Turn lectures into team sports. Earn YBUCKS for asking questions and helping classmates find answers.",
      color: "from-yellow-500 to-orange-500",
    },
    {
      title: "Campus Dashboard",
      subtitle: "All-in-One Platform",
      content: "Canvas, Blackboard, PowerSchool, and more - all integrated into one seamless experience.",
      color: "from-purple-500 to-pink-500",
    },
    {
      title: "Class Networks",
      subtitle: "Connect & Collaborate",
      content: "Dedicated group chats for every course. Study together, share resources, build community.",
      color: "from-blue-500 to-cyan-500",
    },
    {
      title: "YsUp Academy",
      subtitle: "Edutainment Library",
      content: "Educational videos, movies, and original content. Learning that feels like entertainment.",
      color: "from-indigo-500 to-purple-500",
    },
    {
      title: "Ready to Level Up?",
      subtitle: "Your Campus Awaits",
      content: "Join the movement that's revolutionizing education culture, one student at a time.",
      color: "from-emerald-500 to-blue-500",
    },
  ]

  useEffect(() => {
    const slideInterval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length)
    }, 1000)

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) return 100
        return prev + 1.25 // 8 seconds total (100 / 80 intervals)
      })
    }, 100)

    return () => {
      clearInterval(slideInterval)
      clearInterval(progressInterval)
    }
  }, [slides.length])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -inset-10 opacity-20">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
          <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-1000"></div>
          <div className="absolute bottom-1/4 left-1/2 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-2000"></div>
        </div>
      </div>

      <div className="relative z-10 text-center max-w-4xl mx-auto px-6">
        {/* YsUp Logo */}
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="mb-8"
        >
          <h1 className="text-8xl font-bold bg-gradient-to-r from-yellow-400 via-red-500 to-pink-500 bg-clip-text text-transparent">
            YsUp
          </h1>
          <p className="text-2xl text-white/80 mt-2">The Campus Network</p>
        </motion.div>

        {/* Content Slides */}
        <div className="h-80 flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              transition={{ duration: 0.5 }}
              className="text-center"
            >
              <motion.div
                className={`inline-block px-8 py-4 rounded-2xl bg-gradient-to-r ${slides[currentSlide].color} mb-6`}
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <h2 className="text-3xl font-bold text-white mb-2">{slides[currentSlide].title}</h2>
                <h3 className="text-xl text-white/90">{slides[currentSlide].subtitle}</h3>
              </motion.div>

              <p className="text-lg text-white/80 max-w-2xl mx-auto leading-relaxed">{slides[currentSlide].content}</p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Progress Bar */}
        <div className="mt-12">
          <div className="w-full bg-white/20 rounded-full h-3 mb-4">
            <motion.div
              className="bg-gradient-to-r from-yellow-400 to-pink-500 h-3 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.1 }}
            />
          </div>
          <p className="text-white/60 text-sm">Loading your campus experience... {Math.round(progress)}%</p>
        </div>

        {/* Feature Icons */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 1 }}
          className="mt-8 flex justify-center space-x-8"
        >
          {["🎮", "📚", "💬", "🎬", "📋", "📅", "🛒"].map((icon, index) => (
            <motion.div
              key={index}
              className="text-3xl"
              animate={{
                y: [0, -10, 0],
                rotate: [0, 5, -5, 0],
              }}
              transition={{
                duration: 2,
                delay: index * 0.2,
                repeat: Number.POSITIVE_INFINITY,
                repeatDelay: 3,
              }}
            >
              {icon}
            </motion.div>
          ))}
        </motion.div>

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 4, duration: 1 }}
          className="mt-6 text-white/70 text-lg italic"
        >
          "Making education as addictive as social media"
        </motion.p>
      </div>
    </div>
  )
}
