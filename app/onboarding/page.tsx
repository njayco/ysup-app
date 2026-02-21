"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Header from "@/components/Header"

const features = [
  {
    title: "Dashboard",
    icon: "🏠",
    description: "Your home base on campus. See announcements, upcoming events, quick links to all your classes, and stay connected with everything happening at your university.",
    color: "from-amber-600 to-yellow-700",
    page: "/dashboard",
  },
  {
    title: "The Game",
    icon: "🎮",
    description: "Turn your classes into a competition! Earn YBUCKS by asking questions, helping classmates, and participating in classroom challenges. Buy the $50 Game Set for 3 months of access.",
    color: "from-green-600 to-emerald-700",
    page: "/the-game",
  },
  {
    title: "Bison Web",
    icon: "🌐",
    description: "Your campus portal — access class schedules, grades, financial aid info, and university resources all in one place. Everything you need from your school's systems, simplified.",
    color: "from-blue-600 to-indigo-700",
    page: "/bison-web",
  },
  {
    title: "The Hilltop",
    icon: "📰",
    description: "Your campus newspaper, digitized. Read the latest stories, opinion pieces, sports coverage, and campus news. Stay informed about what matters on your campus.",
    color: "from-red-600 to-rose-700",
    page: "/hilltop",
  },
  {
    title: "Bulletin Board",
    icon: "📌",
    description: "The campus bulletin board — find and post about events, club meetings, study groups, job opportunities, and campus announcements. Never miss what's happening around you.",
    color: "from-purple-600 to-violet-700",
    page: "/bulletin-board",
  },
  {
    title: "HU Bookstore",
    icon: "📚",
    description: "Browse and purchase textbooks, course materials, and campus merchandise. Find deals on used books and digital resources for all your classes.",
    color: "from-orange-600 to-amber-700",
    page: "/bookstore",
  },
  {
    title: "Academy",
    icon: "🎬",
    description: "Your edutainment library — educational videos, documentaries, and original content that makes learning feel like entertainment. Binge-worthy knowledge.",
    color: "from-teal-600 to-cyan-700",
    page: "/academy",
  },
]

const profileChecklist = [
  { id: "photo", label: "Add a profile photo", icon: "📷" },
  { id: "bio", label: "Write a short bio", icon: "✏️" },
  { id: "major", label: "Add your major", icon: "🎓" },
  { id: "classes", label: "Add your current classes", icon: "📖" },
  { id: "interests", label: "Select your interests", icon: "⭐" },
]

export default function OnboardingPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)
  const [userName, setUserName] = useState<string | null>(null)
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set())
  const [authChecked, setAuthChecked] = useState(false)

  useEffect(() => {
    const user = localStorage.getItem("currentUser")
    if (!user) {
      window.location.href = "/login"
      return
    }
    try {
      const parsed = JSON.parse(user)
      setUserName(parsed.firstName || parsed.username || "there")
    } catch {
      window.location.href = "/login"
      return
    }
    setAuthChecked(true)
  }, [])

  const totalSteps = features.length + 2
  const isWelcomeStep = currentStep === 0
  const isChecklistStep = currentStep === totalSteps - 1
  const featureIndex = currentStep - 1

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSkip = () => {
    window.location.href = "/dashboard"
  }

  const handleFinish = () => {
    window.location.href = "/dashboard"
  }

  const toggleCheckItem = (id: string) => {
    const next = new Set(checkedItems)
    if (next.has(id)) {
      next.delete(id)
    } else {
      next.add(id)
    }
    setCheckedItems(next)
  }

  if (!authChecked) {
    return null
  }

  return (
    <div className="min-h-screen wood-background">
      <Header currentPage="Welcome" />

      <div className="flex items-center justify-center min-h-[calc(100vh-80px)] p-6">
        <div className="w-full max-w-2xl">
          <div className="bg-stone-900/90 rounded-2xl shadow-2xl border border-amber-700/30 overflow-hidden">
            <div className="w-full bg-amber-900/50 h-2">
              <div
                className="bg-gradient-to-r from-yellow-400 to-amber-500 h-2 transition-all duration-500 ease-out"
                style={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
              />
            </div>

            <div className="p-8">
              {isWelcomeStep && (
                <div className="text-center">
                  <div className="text-6xl mb-6">🎉</div>
                  <h1 className="text-4xl font-bold text-yellow-400 mb-3">
                    Welcome to YsUp, {userName}!
                  </h1>
                  <p className="text-xl text-amber-100/80 mb-2">
                    The Campus Network
                  </p>
                  <p className="text-amber-200/60 mb-8 max-w-md mx-auto leading-relaxed">
                    Let's take a quick tour of everything YsUp has to offer. We'll show you all the features that will make your campus life easier and more connected.
                  </p>
                  <div className="flex items-center justify-center space-x-4">
                    <button
                      onClick={handleNext}
                      className="bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-400 hover:to-amber-500 text-white px-8 py-3 rounded-lg font-bold text-lg transition-all shadow-lg"
                    >
                      Start Tour
                    </button>
                    <button
                      onClick={handleSkip}
                      className="text-amber-300/60 hover:text-amber-200 transition-colors text-sm"
                    >
                      Skip for now
                    </button>
                  </div>
                </div>
              )}

              {!isWelcomeStep && !isChecklistStep && featureIndex >= 0 && featureIndex < features.length && (
                <div>
                  <div className="text-center mb-6">
                    <span className="text-xs font-medium text-amber-400/60 uppercase tracking-wider">
                      Feature {featureIndex + 1} of {features.length}
                    </span>
                  </div>

                  <div className="text-center">
                    <div className={`inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br ${features[featureIndex].color} mb-6 shadow-lg`}>
                      <span className="text-4xl">{features[featureIndex].icon}</span>
                    </div>

                    <h2 className="text-3xl font-bold text-white mb-4">
                      {features[featureIndex].title}
                    </h2>

                    <p className="text-amber-100/70 text-lg leading-relaxed max-w-lg mx-auto mb-8">
                      {features[featureIndex].description}
                    </p>
                  </div>

                  <div className="flex items-center justify-between">
                    <button
                      onClick={handlePrev}
                      className="text-amber-300/60 hover:text-amber-200 transition-colors px-4 py-2"
                    >
                      Back
                    </button>
                    <div className="flex items-center space-x-4">
                      <button
                        onClick={handleSkip}
                        className="text-amber-300/60 hover:text-amber-200 transition-colors text-sm"
                      >
                        Skip tour
                      </button>
                      <button
                        onClick={handleNext}
                        className="bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-400 hover:to-amber-500 text-white px-6 py-2.5 rounded-lg font-bold transition-all shadow-lg"
                      >
                        {featureIndex === features.length - 1 ? "Almost Done" : "Next"}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {isChecklistStep && (
                <div>
                  <div className="text-center mb-6">
                    <div className="text-5xl mb-4">✅</div>
                    <h2 className="text-3xl font-bold text-white mb-2">
                      Set Up Your Profile
                    </h2>
                    <p className="text-amber-100/60">
                      Complete these steps to get the most out of YsUp. You can always do this later from your profile.
                    </p>
                  </div>

                  <div className="space-y-3 mb-8">
                    {profileChecklist.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => toggleCheckItem(item.id)}
                        className={`w-full flex items-center space-x-4 p-4 rounded-xl border transition-all text-left ${
                          checkedItems.has(item.id)
                            ? "bg-green-900/30 border-green-600/40"
                            : "bg-amber-900/20 border-amber-700/30 hover:border-amber-600/50"
                        }`}
                      >
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                          checkedItems.has(item.id)
                            ? "bg-green-500 border-green-500"
                            : "border-amber-500/50"
                        }`}>
                          {checkedItems.has(item.id) && (
                            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                        <span className="text-2xl">{item.icon}</span>
                        <span className={`text-lg ${
                          checkedItems.has(item.id) ? "text-green-300 line-through" : "text-amber-100"
                        }`}>
                          {item.label}
                        </span>
                      </button>
                    ))}
                  </div>

                  <div className="text-center text-sm text-amber-300/40 mb-6">
                    {checkedItems.size} of {profileChecklist.length} completed
                  </div>

                  <div className="flex items-center justify-between">
                    <button
                      onClick={handlePrev}
                      className="text-amber-300/60 hover:text-amber-200 transition-colors px-4 py-2"
                    >
                      Back
                    </button>
                    <button
                      onClick={handleFinish}
                      className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white px-8 py-3 rounded-lg font-bold text-lg transition-all shadow-lg"
                    >
                      Go to Dashboard
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="px-8 pb-6">
              <div className="flex justify-center space-x-1.5">
                {Array.from({ length: totalSteps }).map((_, i) => (
                  <div
                    key={i}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      i === currentStep
                        ? "w-8 bg-yellow-400"
                        : i < currentStep
                        ? "w-1.5 bg-yellow-400/50"
                        : "w-1.5 bg-amber-700/30"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
