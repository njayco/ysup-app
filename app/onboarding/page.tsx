"use client"

import { useState, useEffect, useRef } from "react"
import Header from "@/components/Header"

interface ProfileData {
  firstName: string
  lastName: string
  username: string
  college: string
  phone: string
  major: string
  year: string
  bio: string
  profileImage?: string
}

const profileChecklist = [
  { id: "major", label: "Select your major", field: "major" },
  { id: "year", label: "Select your year", field: "year" },
  { id: "bio", label: "Write a short bio", field: "bio" },
]

const majorOptions = [
  "Computer Science",
  "Biology",
  "Chemistry",
  "Physics",
  "Mathematics",
  "English",
  "History",
  "Political Science",
  "Psychology",
  "Business Administration",
  "Communications",
  "Engineering",
  "Nursing",
  "Music",
  "Art",
  "Philosophy",
  "Sociology",
  "Economics",
  "Education",
  "Other",
]

const yearOptions = ["Freshman", "Sophomore", "Junior", "Senior", "Graduate"]

const featureWalkthroughs = [
  {
    id: "dashboard",
    title: "Your Dashboard",
    icon: "🏠",
    color: "from-amber-600 to-yellow-700",
    heading: "Welcome to Your Digital Desk",
    descriptions: [
      "Your Dashboard is your home base — think of it as your personal desk on campus. Everything you need is right here.",
      "You can upload and organize files like PDFs, presentations, and documents. Drag them around your desk just like real papers.",
      "Create sticky notes for quick reminders, and use folders to keep your files organized by class.",
      "Your student ID card is displayed in the top-left corner with your info, YBucks balance, and level.",
    ],
    tips: [
      "Click the + button to upload new files to your desk",
      "Use the Move Mode toggle to rearrange items on your desk",
      "Create folders to organize files by subject",
      "Click on sticky notes to edit them",
    ],
  },
  {
    id: "ysup-book",
    title: "The YsUp Book",
    icon: "📒",
    color: "from-yellow-500 to-amber-600",
    heading: "Your Campus Social Network",
    descriptions: [
      "The YsUp Book is your class network — a social space where you connect with classmates in each of your courses.",
      "Post questions, share study tips, or ask for help with homework. Your classmates in the same course will see your posts.",
      "When someone helps you or posts something useful, give them a TRUE (like a thumbs up). TRUEs earn the poster YBucks!",
      "Respond to classmates' questions to earn YBucks yourself. The more you help, the more you earn.",
    ],
    tips: [
      "TRUE helpful posts — it rewards the poster with YBucks",
      "Respond to questions to earn YBucks for yourself",
      "Switch between your different courses using the dropdown",
      "The YsUp Book is found inside your Dashboard notebook",
    ],
  },
  {
    id: "ybucks",
    title: "YBucks & Leveling Up",
    icon: "💰",
    color: "from-green-500 to-emerald-600",
    heading: "Earn Rewards for Helping Others",
    descriptions: [
      "YBucks are the currency of YsUp. You earn them by being an active, helpful member of your campus community.",
      "Every time you TRUE a classmate's post, respond to a question, or create a helpful post, you earn 100 YBucks.",
      "As you accumulate YBucks, you level up! Each level requires 1,000 YBucks. Higher levels unlock bragging rights and recognition.",
      "Your YBucks balance and current level are always visible on your student ID card on the Dashboard.",
    ],
    tips: [
      "Post a question = +100 YBucks",
      "Respond to a classmate = +100 YBucks",
      "TRUE a helpful post = +100 YBucks",
      "Every 1,000 YBucks = Level Up!",
    ],
  },
  {
    id: "bookstore",
    title: "HU Bookstore",
    icon: "📚",
    color: "from-orange-600 to-amber-700",
    heading: "Your Campus Bookstore, Online",
    descriptions: [
      "The HU Bookstore is where you browse and find textbooks, course materials, and campus merchandise.",
      "Search for books by title, author, or course. Find the materials you need for all your classes in one place.",
      "Check prices, compare editions, and find the best deals on both new and used textbooks.",
      "From study guides to lab manuals, everything you need for your courses is here.",
    ],
    tips: [
      "Search by course name to find required textbooks",
      "Check for used editions to save money",
      "Browse campus merchandise and gear",
      "Find digital resources and study guides",
    ],
  },
  {
    id: "bulletin-board",
    title: "Bulletin Board",
    icon: "📌",
    color: "from-purple-600 to-violet-700",
    heading: "Campus Events & Announcements",
    descriptions: [
      "The Bulletin Board is your go-to place for everything happening on campus — events, clubs, meetings, and announcements.",
      "Find study groups, club meetings, career fairs, social events, and more. Never miss out on what's happening.",
      "Post your own events and announcements. Whether it's a study session or a campus fundraiser, get the word out.",
      "Filter by category to find exactly what you're looking for — academics, social, sports, careers, and more.",
    ],
    tips: [
      "Check daily for new events and announcements",
      "Post about study groups to find classmates",
      "Filter events by category to find what interests you",
      "Share events with classmates through the platform",
    ],
  },
  {
    id: "hilltop",
    title: "The Hilltop",
    icon: "📰",
    color: "from-red-600 to-rose-700",
    heading: "Your Campus Newspaper, Digitized",
    descriptions: [
      "The Hilltop is your campus newspaper — bringing you the latest news, stories, and coverage of everything happening at your university.",
      "Read opinion pieces, sports coverage, campus politics, and feature stories written by student journalists.",
      "Stay informed about administrative decisions, student government actions, and campus-wide issues that affect you.",
      "From homecoming coverage to graduation stories, The Hilltop keeps you connected to campus life.",
    ],
    tips: [
      "Check regularly for campus news updates",
      "Read opinion pieces to understand different perspectives",
      "Follow sports coverage for your school's teams",
      "Stay informed about decisions that affect students",
    ],
  },
  {
    id: "the-game",
    title: "The Game",
    icon: "🎮",
    color: "from-green-600 to-emerald-700",
    heading: "Turn Learning Into a Game",
    descriptions: [
      "The Game transforms your academic experience into an exciting competition. Earn points, level up, and compete with classmates.",
      "Compete on leaderboards, earn badges, and see how you stack up against other students in your courses.",
      "The Game makes studying fun — answer trivia, complete challenges, and earn rewards while actually learning the material.",
    ],
    tips: [
      "Compete on leaderboards with classmates",
      "Earn badges for completing challenges",
      "Use The Game to make studying more engaging",
    ],
  },
  {
    id: "bison-homepage",
    title: "Bison Homepage",
    icon: "🌐",
    color: "from-blue-600 to-indigo-700",
    heading: "Howard.edu at Your Fingertips",
    descriptions: [
      "Bison Homepage brings all the relevant information and links from Howard.edu directly into YsUp — so you never have to hunt across multiple websites.",
      "Browse the latest Howard University news, upcoming campus events, academic programs, and admissions info all in one beautifully designed magazine-style reader.",
      "Explore sections like Campus Life, Research, and Legacy to stay connected with everything happening at Howard — from student activities to groundbreaking research.",
      "Every section links directly to the official Howard.edu pages, so you always have quick access to the full details when you need them.",
    ],
    tips: [
      "Browse Howard news, events, and academics in one place",
      "Flip through sections like a real magazine",
      "Links take you straight to official Howard.edu pages",
      "Stay up to date on campus life and research",
    ],
  },
  {
    id: "academy",
    title: "Academy",
    icon: "🎬",
    color: "from-teal-600 to-cyan-700",
    heading: "Edutainment — Learning Meets Entertainment",
    descriptions: [
      "The Academy is your edutainment library — educational videos and content that make learning feel like binge-watching your favorite show.",
      "Watch documentaries, tutorials, lectures, and original educational content created for students like you.",
      "From science explainers to history deep dives, the Academy covers subjects across all disciplines.",
      "Learn at your own pace. Pause, rewind, and rewatch. The Academy is your 24/7 learning companion.",
    ],
    tips: [
      "Browse by subject to find relevant content",
      "Watch supplementary videos for your courses",
      "Use the Academy to prepare for exams",
      "Explore new subjects and expand your knowledge",
    ],
  },
]

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(0)
  const [authChecked, setAuthChecked] = useState(false)
  const profileImageRef = useRef<HTMLInputElement>(null)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [honorCodeScrolled, setHonorCodeScrolled] = useState(false)
  const [honorCodeAgreed, setHonorCodeAgreed] = useState(false)
  const honorCodeRef = useRef<HTMLDivElement>(null)
  const [termsScrolled, setTermsScrolled] = useState(false)
  const [termsAgreed, setTermsAgreed] = useState(false)
  const termsRef = useRef<HTMLDivElement>(null)
  const [privacyScrolled, setPrivacyScrolled] = useState(false)
  const [privacyAgreed, setPrivacyAgreed] = useState(false)
  const privacyRef = useRef<HTMLDivElement>(null)
  const [profileData, setProfileData] = useState<ProfileData>({
    firstName: "",
    lastName: "",
    username: "",
    college: "",
    phone: "",
    major: "",
    year: "",
    bio: "",
    profileImage: "",
  })

  useEffect(() => {
    const user = localStorage.getItem("currentUser")
    if (!user) {
      window.location.href = "/login"
      return
    }
    try {
      const parsed = JSON.parse(user)
      setProfileData({
        firstName: parsed.firstName || "",
        lastName: parsed.lastName || "",
        username: parsed.username || "",
        college: parsed.college || "Howard University",
        phone: parsed.phone || "",
        major: parsed.major || "",
        year: parsed.year || "",
        bio: parsed.bio || "",
        profileImage: parsed.profileImage || "",
      })

      if (parsed.id) {
        fetch(`/api/profile-image?userId=${parsed.id}`)
          .then(r => r.json())
          .then(d => {
            if (d.success && d.profileImage) {
              setProfileData(prev => ({ ...prev, profileImage: d.profileImage }))
            }
          })
          .catch(() => {})
      }
    } catch {
      window.location.href = "/login"
      return
    }
    setAuthChecked(true)
  }, [])

  const totalSteps = 5 + featureWalkthroughs.length
  const isProfileStep = currentStep === 0
  const isHonorCodeStep = currentStep === 1 + featureWalkthroughs.length
  const isTermsStep = currentStep === 2 + featureWalkthroughs.length
  const isPrivacyStep = currentStep === 3 + featureWalkthroughs.length
  const isCompletionStep = currentStep === totalSteps - 1
  const walkthroughIndex = currentStep - 1

  const handleHonorCodeScroll = () => {
    const el = honorCodeRef.current
    if (!el) return
    const atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 20
    if (atBottom) setHonorCodeScrolled(true)
  }

  const handleTermsScroll = () => {
    const el = termsRef.current
    if (!el) return
    const atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 20
    if (atBottom) setTermsScrolled(true)
  }

  const handlePrivacyScroll = () => {
    const el = privacyRef.current
    if (!el) return
    const atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 20
    if (atBottom) setPrivacyScrolled(true)
  }

  const saveProfileToStorage = () => {
    const storedUser = localStorage.getItem("currentUser")
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser)
        const updated = { ...userData, ...profileData }
        localStorage.setItem("currentUser", JSON.stringify(updated))
      } catch {}
    }
  }

  const handleProfileImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith("image/")) return

    setUploadingImage(true)
    const reader = new FileReader()
    reader.onload = async (ev) => {
      const dataUrl = ev.target?.result as string
      setProfileData(prev => ({ ...prev, profileImage: dataUrl }))

      const storedUser = localStorage.getItem("currentUser")
      if (storedUser) {
        try {
          const userData = JSON.parse(storedUser)
          if (userData.id) {
            await fetch("/api/profile-image", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ userId: userData.id, imageData: dataUrl }),
            })
          }
          const updated = { ...userData, profileImage: dataUrl }
          localStorage.setItem("currentUser", JSON.stringify(updated))
        } catch {}
      }
      setUploadingImage(false)
    }
    reader.readAsDataURL(file)
  }

  const profileComplete = !!(profileData.major && profileData.year && profileData.bio.trim())

  const handleNext = () => {
    if (currentStep === 0) {
      if (!profileComplete) return
      saveProfileToStorage()
    }
    if (isHonorCodeStep && !honorCodeAgreed) return
    if (isTermsStep && !termsAgreed) return
    if (isPrivacyStep && !privacyAgreed) return
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
    saveProfileToStorage()
    window.location.href = "/dashboard"
  }

  const handleFinish = () => {
    const storedUser = localStorage.getItem("currentUser")
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser)
        const updated = { ...userData, ...profileData, onboardingComplete: true }
        localStorage.setItem("currentUser", JSON.stringify(updated))
      } catch {}
    }
    window.location.href = "/dashboard"
  }

  if (!authChecked) {
    return null
  }

  return (
    <div className="min-h-screen wood-background">
      <Header currentPage="Welcome" />

      <div className="flex items-center justify-center min-h-[calc(100vh-80px)] p-4 sm:p-6">
        <div className="w-full max-w-2xl">
          <div className="bg-stone-900/90 rounded-2xl shadow-2xl border border-amber-700/30 overflow-hidden">
            <div className="w-full bg-amber-900/50 h-2">
              <div
                className="bg-gradient-to-r from-yellow-400 to-amber-500 h-2 transition-all duration-500 ease-out"
                style={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
              />
            </div>

            <div className="p-6 sm:p-8">
              {isProfileStep && (
                <div>
                  <div className="text-center mb-6">
                    <div className="relative inline-block mb-3">
                      <div
                        onClick={() => profileImageRef.current?.click()}
                        className="w-24 h-24 rounded-full border-4 border-amber-500/60 overflow-hidden cursor-pointer hover:border-amber-400 transition-colors bg-amber-900/40 flex items-center justify-center mx-auto"
                      >
                        {profileData.profileImage ? (
                          <img src={profileData.profileImage} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-4xl">👤</span>
                        )}
                      </div>
                      <button
                        onClick={() => profileImageRef.current?.click()}
                        className="absolute -bottom-1 -right-1 w-8 h-8 bg-amber-500 hover:bg-amber-400 rounded-full flex items-center justify-center text-white text-lg shadow-md"
                      >
                        +
                      </button>
                      <input
                        ref={profileImageRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleProfileImageUpload}
                      />
                    </div>
                    {uploadingImage && <p className="text-xs text-amber-300">Uploading...</p>}
                    <p className="text-xs text-amber-200/50 mb-2">Tap to add a profile photo</p>
                    <h1 className="text-2xl md:text-3xl font-bold text-yellow-400 mb-2">
                      Set Up Your Profile, {profileData.firstName || "there"}!
                    </h1>
                    <p className="text-amber-100/60 text-sm">
                      Complete your student profile so classmates can find and connect with you.
                    </p>
                  </div>

                  <div className="space-y-4 mb-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-amber-200/70 mb-1">First Name</label>
                        <input
                          type="text"
                          value={profileData.firstName}
                          onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
                          className="w-full px-3 py-2 rounded-lg bg-amber-900/40 border border-amber-700/40 text-amber-100 placeholder-amber-400/40"
                          placeholder="First name"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-amber-200/70 mb-1">Last Name</label>
                        <input
                          type="text"
                          value={profileData.lastName}
                          onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })}
                          className="w-full px-3 py-2 rounded-lg bg-amber-900/40 border border-amber-700/40 text-amber-100 placeholder-amber-400/40"
                          placeholder="Last name"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm text-amber-200/70 mb-1">College/University</label>
                      <input
                        type="text"
                        value={profileData.college}
                        readOnly
                        className="w-full px-3 py-2 rounded-lg bg-amber-900/20 border border-amber-700/20 text-amber-100/50"
                      />
                    </div>

                    <div>
                      <label className="block text-sm text-amber-200/70 mb-1">
                        Major <span className="text-yellow-400">*</span>
                      </label>
                      <select
                        value={profileData.major}
                        onChange={(e) => setProfileData({ ...profileData, major: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg bg-amber-900/40 border border-amber-700/40 text-amber-100"
                      >
                        <option value="" className="bg-stone-800">Select your major</option>
                        {majorOptions.map((major) => (
                          <option key={major} value={major} className="bg-stone-800">{major}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm text-amber-200/70 mb-1">
                        Year <span className="text-yellow-400">*</span>
                      </label>
                      <select
                        value={profileData.year}
                        onChange={(e) => setProfileData({ ...profileData, year: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg bg-amber-900/40 border border-amber-700/40 text-amber-100"
                      >
                        <option value="" className="bg-stone-800">Select your year</option>
                        {yearOptions.map((year) => (
                          <option key={year} value={year} className="bg-stone-800">{year}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm text-amber-200/70 mb-1">
                        Short Bio <span className="text-yellow-400">*</span>
                      </label>
                      <textarea
                        value={profileData.bio}
                        onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg bg-amber-900/40 border border-amber-700/40 text-amber-100 placeholder-amber-400/40 resize-none"
                        placeholder="Tell your classmates a little about yourself..."
                        rows={3}
                        maxLength={200}
                      />
                      <div className="text-right text-xs text-amber-400/40 mt-1">{profileData.bio.length}/200</div>
                    </div>
                  </div>

                  <div className="mb-6 p-3 rounded-lg bg-amber-900/20 border border-amber-700/20">
                    <p className="text-sm text-amber-200/60 mb-2 font-medium">Profile Checklist</p>
                    {profileChecklist.map((item) => {
                      const isComplete = !!profileData[item.field as keyof ProfileData]
                      return (
                        <div key={item.id} className="flex items-center space-x-3 py-1.5">
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                            isComplete ? "bg-green-500 border-green-500" : "border-amber-500/40"
                          }`}>
                            {isComplete && (
                              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </div>
                          <span className={`text-sm ${isComplete ? "text-green-300 line-through" : "text-amber-100/70"}`}>
                            {item.label}
                          </span>
                        </div>
                      )
                    })}
                  </div>

                  <div className="flex items-center justify-between">
                    <button
                      onClick={handleSkip}
                      className="text-amber-300/50 hover:text-amber-200 transition-colors text-sm"
                    >
                      Skip for now
                    </button>
                    <div className="flex items-center space-x-3">
                      {!profileComplete && (
                        <span className="text-amber-400/50 text-xs">Complete required fields to continue</span>
                      )}
                      <button
                        onClick={handleNext}
                        disabled={!profileComplete}
                        className={`px-8 py-3 rounded-lg font-bold text-lg transition-all shadow-lg ${
                          profileComplete
                            ? "bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-400 hover:to-amber-500 text-white"
                            : "bg-amber-800/40 text-amber-400/40 cursor-not-allowed"
                        }`}
                      >
                        Next
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {!isProfileStep && !isHonorCodeStep && !isTermsStep && !isPrivacyStep && !isCompletionStep && walkthroughIndex >= 0 && walkthroughIndex < featureWalkthroughs.length && (
                <div>
                  <div className="text-center mb-2">
                    <span className="text-xs font-medium text-amber-400/50 uppercase tracking-wider">
                      Step {walkthroughIndex + 1} of {featureWalkthroughs.length}
                    </span>
                  </div>

                  <div className="text-center mb-5">
                    <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br ${featureWalkthroughs[walkthroughIndex].color} mb-3 shadow-lg`}>
                      <span className="text-3xl">{featureWalkthroughs[walkthroughIndex].icon}</span>
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-1">
                      {featureWalkthroughs[walkthroughIndex].title}
                    </h2>
                    <p className="text-yellow-400 font-medium text-sm">
                      {featureWalkthroughs[walkthroughIndex].heading}
                    </p>
                  </div>

                  <div className="space-y-3 mb-5">
                    {featureWalkthroughs[walkthroughIndex].descriptions.map((desc, i) => (
                      <div key={i} className="flex items-start space-x-3">
                        <div className="w-6 h-6 rounded-full bg-amber-700/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-xs text-amber-300 font-bold">{i + 1}</span>
                        </div>
                        <p className="text-amber-100/70 text-sm leading-relaxed">{desc}</p>
                      </div>
                    ))}
                  </div>

                  <div className="bg-amber-900/20 border border-amber-700/20 rounded-lg p-4 mb-6">
                    <p className="text-xs font-medium text-yellow-400/70 uppercase tracking-wider mb-2">Quick Tips</p>
                    <div className="space-y-1.5">
                      {featureWalkthroughs[walkthroughIndex].tips.map((tip, i) => (
                        <div key={i} className="flex items-center space-x-2">
                          <span className="text-yellow-400 text-xs">&#9679;</span>
                          <span className="text-amber-200/60 text-sm">{tip}</span>
                        </div>
                      ))}
                    </div>
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
                        className="text-amber-300/50 hover:text-amber-200 transition-colors text-sm"
                      >
                        Skip tour
                      </button>
                      <button
                        onClick={handleNext}
                        className="bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-400 hover:to-amber-500 text-white px-6 py-2.5 rounded-lg font-bold transition-all shadow-lg"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {isHonorCodeStep && (
                <div>
                  <div className="text-center mb-4">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-red-600 to-rose-700 mb-3 shadow-lg">
                      <span className="text-3xl">📜</span>
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-1">Honor Code</h2>
                    <p className="text-amber-200/60 text-sm">Please read the entire Honor Code and agree to continue</p>
                  </div>

                  <div
                    ref={honorCodeRef}
                    onScroll={handleHonorCodeScroll}
                    className="h-64 overflow-y-auto bg-amber-950/60 border border-amber-700/40 rounded-lg p-4 mb-4 text-sm text-amber-100/80 leading-relaxed scrollbar-thin"
                  >
                    <h3 className="text-lg font-bold text-yellow-400 mb-3 text-center">YsUp Campus Honor Code & Community Disclaimer</h3>
                    <p className="text-amber-200/50 text-xs mb-4 text-center">Effective Date: February 22, 2026</p>
                    <p className="mb-3">Welcome to YsUp Campus — a collaborative educational platform designed to promote independent learning, integrity, and positive community engagement.</p>
                    <p className="mb-4">By accessing or using YsUp Campus, you agree to uphold the following Honor Code and Community Standards.</p>

                    <h4 className="font-bold text-yellow-400 mb-2">1. Academic Integrity</h4>
                    <p className="mb-2">YsUp Campus is designed to promote independent thinking and learning. Users agree:</p>
                    <ul className="list-disc pl-5 mb-2 space-y-1">
                      <li>Not to use the platform to cheat on assignments, exams, quizzes, or academic evaluations.</li>
                      <li>Not to request or share direct answers for graded coursework when doing so violates school policies.</li>
                      <li>Not to impersonate another student or submit work on behalf of another person.</li>
                      <li>Not to use AI tools within YsUp to bypass learning objectives or academic rules set by instructors.</li>
                    </ul>
                    <p className="mb-2">YsUp encourages guidance, hints, collaboration, and critical thinking — not answer-sharing or academic dishonesty.</p>
                    <p className="mb-4">Violation of academic integrity may result in suspension or permanent removal from YsUp Campus, and notification to educators or institutions (if applicable).</p>

                    <h4 className="font-bold text-yellow-400 mb-2">2. Copyright & Intellectual Property Protection</h4>
                    <p className="mb-2">Users agree NOT to:</p>
                    <ul className="list-disc pl-5 mb-2 space-y-1">
                      <li>Upload, share, distribute, or reproduce copyrighted materials without proper authorization.</li>
                      <li>Share pirated textbooks, movies, music, software, exam banks, or proprietary academic materials.</li>
                      <li>Post protected content that violates U.S. or international copyright law.</li>
                    </ul>
                    <p className="mb-4">All users are responsible for ensuring the content they upload complies with copyright and intellectual property laws. YsUp Campus reserves the right to remove infringing content immediately, suspend or terminate accounts, and cooperate with legal authorities when required.</p>

                    <h4 className="font-bold text-yellow-400 mb-2">3. Anti-Bullying & Respect Policy</h4>
                    <p className="mb-2">YsUp Campus maintains a zero-tolerance policy for:</p>
                    <ul className="list-disc pl-5 mb-2 space-y-1">
                      <li>Cyberbullying</li>
                      <li>Harassment</li>
                      <li>Hate speech</li>
                      <li>Threats of violence</li>
                      <li>Discrimination based on race, ethnicity, gender, religion, nationality, disability, or identity</li>
                      <li>Encouraging in-person bullying or real-world harm</li>
                    </ul>
                    <p className="mb-2">Users must treat others with dignity and respect in Class Networks, direct messages, bulletin boards, public posts, online game sessions, and in-person interactions facilitated through YsUp.</p>
                    <p className="mb-4">Any behavior that creates a hostile, intimidating, or unsafe environment may result in immediate account suspension or permanent ban.</p>

                    <h4 className="font-bold text-yellow-400 mb-2">4. Illegal Activity Prohibition</h4>
                    <p className="mb-2">Users may not use YsUp Campus to:</p>
                    <ul className="list-disc pl-5 mb-2 space-y-1">
                      <li>Engage in fraud or identity theft</li>
                      <li>Sell or promote illegal goods or services</li>
                      <li>Coordinate harmful or unlawful activities</li>
                      <li>Distribute malware or attempt to hack the platform</li>
                      <li>Circumvent platform safeguards</li>
                    </ul>
                    <p className="mb-4">Illegal conduct may be reported to law enforcement authorities.</p>

                    <h4 className="font-bold text-yellow-400 mb-2">5. Responsible AI Usage</h4>
                    <p className="mb-2">Where YsUp integrates AI tools:</p>
                    <ul className="list-disc pl-5 mb-4 space-y-1">
                      <li>AI is designed to assist learning — not replace it.</li>
                      <li>Users agree not to manipulate or exploit AI systems for misconduct.</li>
                      <li>Users understand AI responses may not always be accurate and must use independent judgment.</li>
                    </ul>

                    <h4 className="font-bold text-yellow-400 mb-2">6. Reporting Violations</h4>
                    <p className="mb-4">If you witness behavior that violates this Honor Code, you are encouraged to report it through the platform's reporting system. Protecting the integrity of YsUp is a shared responsibility.</p>

                    <h4 className="font-bold text-yellow-400 mb-2">7. Platform Rights</h4>
                    <p className="mb-2">YsUp Campus reserves the right to:</p>
                    <ul className="list-disc pl-5 mb-4 space-y-1">
                      <li>Remove content</li>
                      <li>Suspend or terminate accounts</li>
                      <li>Restrict features</li>
                      <li>Update this Honor Code at any time</li>
                    </ul>
                    <p className="mb-4">Continued use of the platform constitutes acceptance of updated terms.</p>

                    <h4 className="font-bold text-yellow-400 mb-2">8. Agreement</h4>
                    <p className="mb-2">By checking the box below and creating or continuing to use a YsUp Campus account, you confirm that:</p>
                    <ul className="list-disc pl-5 mb-4 space-y-1">
                      <li>I have read and agree to the YsUp Campus Honor Code.</li>
                      <li>I commit to academic integrity, legal compliance, and respectful conduct.</li>
                      <li>I understand violations may result in suspension or removal from the platform.</li>
                    </ul>

                    <div className="text-center mt-4 pt-4 border-t border-amber-700/30">
                      <p className="text-yellow-400 font-bold italic">YsUp stands for growth, discipline, and independent mastery.</p>
                      <p className="text-amber-200/60 text-xs mt-1">The goal is not just to get answers — but to become someone who can discover them.</p>
                    </div>
                  </div>

                  {!honorCodeScrolled && (
                    <p className="text-amber-400/60 text-xs text-center mb-3">Scroll down to read the full Honor Code to enable the checkbox</p>
                  )}

                  <label className={`flex items-center space-x-3 p-3 rounded-lg border transition-all mb-4 ${
                    honorCodeScrolled
                      ? "border-amber-500/40 bg-amber-900/20 cursor-pointer"
                      : "border-amber-800/20 bg-amber-950/20 cursor-not-allowed opacity-50"
                  }`}>
                    <input
                      type="checkbox"
                      checked={honorCodeAgreed}
                      onChange={(e) => honorCodeScrolled && setHonorCodeAgreed(e.target.checked)}
                      disabled={!honorCodeScrolled}
                      className="w-5 h-5 rounded accent-yellow-500"
                    />
                    <span className="text-sm text-amber-100/80">
                      I have read and agree to the YsUp Campus Honor Code. I commit to academic integrity, legal compliance, and respectful conduct.
                    </span>
                  </label>

                  <div className="flex items-center justify-between">
                    <button
                      onClick={handlePrev}
                      className="text-amber-300/60 hover:text-amber-200 transition-colors px-4 py-2"
                    >
                      Back
                    </button>
                    <button
                      onClick={handleNext}
                      disabled={!honorCodeAgreed}
                      className={`px-8 py-3 rounded-lg font-bold text-lg transition-all shadow-lg ${
                        honorCodeAgreed
                          ? "bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-400 hover:to-amber-500 text-white"
                          : "bg-amber-800/40 text-amber-400/40 cursor-not-allowed"
                      }`}
                    >
                      I Agree — Continue
                    </button>
                  </div>
                </div>
              )}

              {isTermsStep && (
                <div>
                  <div className="text-center mb-4">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 mb-3 shadow-lg">
                      <span className="text-3xl">📋</span>
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-1">Terms & Conditions</h2>
                    <p className="text-amber-200/60 text-sm">Please read and accept the Terms & Conditions to continue</p>
                  </div>

                  <div
                    ref={termsRef}
                    onScroll={handleTermsScroll}
                    className="h-64 overflow-y-auto bg-amber-950/60 border border-amber-700/40 rounded-lg p-4 mb-4 text-sm text-amber-100/80 leading-relaxed scrollbar-thin"
                  >
                    <h3 className="text-lg font-bold text-yellow-400 mb-3 text-center">YsUp Campus Terms & Conditions</h3>
                    <p className="text-amber-200/50 text-xs mb-4 text-center">Effective Date: February 22, 2026</p>

                    <p className="mb-3">Welcome to YsUp Campus Network. These Terms and Conditions govern your access to and use of the YsUp Campus platform at YsUpCampus.com. By creating an account or using the Platform, you agree to be bound by these Terms.</p>

                    <h4 className="font-bold text-yellow-400 mb-2">1. Eligibility</h4>
                    <ul className="list-disc pl-5 mb-4 space-y-1">
                      <li>You must be at least 13 years of age to use the Platform.</li>
                      <li>You must be a current or prospective student, faculty member, or staff member of an HBCU.</li>
                      <li>All registration information you provide must be truthful and accurate.</li>
                    </ul>

                    <h4 className="font-bold text-yellow-400 mb-2">2. Account Registration</h4>
                    <ul className="list-disc pl-5 mb-4 space-y-1">
                      <li>You must provide a valid phone number, a unique username, and a password.</li>
                      <li>You are responsible for maintaining the confidentiality of your login credentials.</li>
                      <li>You are responsible for all activity that occurs under your account.</li>
                      <li>You must verify your phone number via SMS to complete registration.</li>
                    </ul>

                    <h4 className="font-bold text-yellow-400 mb-2">3. Acceptable Use</h4>
                    <p className="mb-2">You agree to use the Platform for lawful, educational, and community-building purposes. You agree NOT to:</p>
                    <ul className="list-disc pl-5 mb-4 space-y-1">
                      <li>Harass, bully, threaten, or intimidate others.</li>
                      <li>Post defamatory, obscene, hateful, or discriminatory content.</li>
                      <li>Upload copyrighted material without authorization.</li>
                      <li>Attempt to hack or compromise the Platform&apos;s security.</li>
                      <li>Impersonate another person or misrepresent your identity.</li>
                      <li>Use AI features for academic dishonesty.</li>
                    </ul>

                    <h4 className="font-bold text-yellow-400 mb-2">4. User Content</h4>
                    <ul className="list-disc pl-5 mb-4 space-y-1">
                      <li>You retain ownership of content you create and post.</li>
                      <li>You grant YsUp a non-exclusive, royalty-free license to display and store your content to operate the Platform.</li>
                      <li>We reserve the right to remove content that violates these Terms.</li>
                    </ul>

                    <h4 className="font-bold text-yellow-400 mb-2">5. YBucks Virtual Currency</h4>
                    <p className="mb-4">YBucks are virtual, non-transferable, and have no monetary value. They cannot be exchanged for real currency or goods outside the Platform.</p>

                    <h4 className="font-bold text-yellow-400 mb-2">6. AI-Powered Features</h4>
                    <p className="mb-4">AI content is provided for educational purposes only and may not always be accurate. YsUp is not liable for decisions made based on AI-generated content.</p>

                    <h4 className="font-bold text-yellow-400 mb-2">7. Disclaimers</h4>
                    <p className="mb-4">The Platform is provided &quot;AS IS&quot; without warranties of any kind. We do not guarantee uninterrupted service or accuracy of content.</p>

                    <h4 className="font-bold text-yellow-400 mb-2">8. Limitation of Liability</h4>
                    <p className="mb-4">YsUp shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the Platform.</p>

                    <h4 className="font-bold text-yellow-400 mb-2">9. Termination</h4>
                    <p className="mb-4">We may suspend or terminate your account at any time for violation of these Terms. You may request account deletion by contacting us.</p>

                    <p className="mb-2">For the full Terms & Conditions, visit: <a href="/terms-and-conditions" target="_blank" className="text-yellow-400 underline hover:text-yellow-300">/terms-and-conditions</a></p>

                    <div className="text-center mt-4 pt-4 border-t border-amber-700/30">
                      <p className="text-yellow-400 font-bold italic">By using YsUp, you agree to these Terms.</p>
                    </div>
                  </div>

                  {!termsScrolled && (
                    <p className="text-amber-400/60 text-xs text-center mb-3">Scroll down to read the full Terms to enable the checkbox</p>
                  )}

                  <label className={`flex items-center space-x-3 p-3 rounded-lg border transition-all mb-4 ${
                    termsScrolled
                      ? "border-amber-500/40 bg-amber-900/20 cursor-pointer"
                      : "border-amber-800/20 bg-amber-950/20 cursor-not-allowed opacity-50"
                  }`}>
                    <input
                      type="checkbox"
                      checked={termsAgreed}
                      onChange={(e) => termsScrolled && setTermsAgreed(e.target.checked)}
                      disabled={!termsScrolled}
                      className="w-5 h-5 rounded accent-yellow-500"
                    />
                    <span className="text-sm text-amber-100/80">
                      I have read and agree to the YsUp Campus Terms & Conditions.
                    </span>
                  </label>

                  <div className="flex items-center justify-between">
                    <button
                      onClick={handlePrev}
                      className="text-amber-300/60 hover:text-amber-200 transition-colors px-4 py-2"
                    >
                      Back
                    </button>
                    <button
                      onClick={handleNext}
                      disabled={!termsAgreed}
                      className={`px-8 py-3 rounded-lg font-bold text-lg transition-all shadow-lg ${
                        termsAgreed
                          ? "bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-400 hover:to-amber-500 text-white"
                          : "bg-amber-800/40 text-amber-400/40 cursor-not-allowed"
                      }`}
                    >
                      I Accept — Continue
                    </button>
                  </div>
                </div>
              )}

              {isPrivacyStep && (
                <div>
                  <div className="text-center mb-4">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 mb-3 shadow-lg">
                      <span className="text-3xl">🔒</span>
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-1">Privacy Policy</h2>
                    <p className="text-amber-200/60 text-sm">Please read and accept the Privacy Policy to continue</p>
                  </div>

                  <div
                    ref={privacyRef}
                    onScroll={handlePrivacyScroll}
                    className="h-64 overflow-y-auto bg-amber-950/60 border border-amber-700/40 rounded-lg p-4 mb-4 text-sm text-amber-100/80 leading-relaxed scrollbar-thin"
                  >
                    <h3 className="text-lg font-bold text-yellow-400 mb-3 text-center">YsUp Campus Privacy Policy</h3>
                    <p className="text-amber-200/50 text-xs mb-4 text-center">Effective Date: February 22, 2026</p>

                    <p className="mb-3">YsUp Campus Network is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use the Platform at YsUpCampus.com.</p>

                    <h4 className="font-bold text-yellow-400 mb-2">1. Information We Collect</h4>
                    <p className="font-semibold text-amber-200 mb-1">a. Information You Provide:</p>
                    <ul className="list-disc pl-5 mb-2 space-y-1">
                      <li>Account details: name, username, phone number, college, password (hashed)</li>
                      <li>Profile information: major, year, bio, profile photo</li>
                      <li>Content you create: posts, files, notes, calendar events</li>
                      <li>Phone verification data for SMS verification</li>
                    </ul>
                    <p className="font-semibold text-amber-200 mb-1">b. Information Collected Automatically:</p>
                    <ul className="list-disc pl-5 mb-2 space-y-1">
                      <li>Usage data, device/browser info, IP address</li>
                      <li>Cookies and similar tracking technologies</li>
                    </ul>
                    <p className="font-semibold text-amber-200 mb-1">c. Third-Party Information:</p>
                    <ul className="list-disc pl-5 mb-4 space-y-1">
                      <li>Google Workspace data when you connect via OAuth</li>
                      <li>Search results from third-party APIs</li>
                    </ul>

                    <h4 className="font-bold text-yellow-400 mb-2">2. How We Use Your Information</h4>
                    <ul className="list-disc pl-5 mb-4 space-y-1">
                      <li>To create, manage, and verify your account</li>
                      <li>To provide and improve Platform features</li>
                      <li>To power AI-assisted features via OpenAI</li>
                      <li>To send notifications and process search queries</li>
                      <li>To enforce our Terms and detect fraud or abuse</li>
                    </ul>

                    <h4 className="font-bold text-yellow-400 mb-2">3. How We Share Your Information</h4>
                    <p className="mb-2">We do not sell your personal information. We may share with:</p>
                    <ul className="list-disc pl-5 mb-4 space-y-1">
                      <li>Other users (your public profile and network activity)</li>
                      <li>Service providers (Twilio, OpenAI, Google, hosting)</li>
                      <li>Legal authorities if required by law</li>
                    </ul>

                    <h4 className="font-bold text-yellow-400 mb-2">4. Data Storage & Security</h4>
                    <ul className="list-disc pl-5 mb-4 space-y-1">
                      <li>Data stored in secure PostgreSQL databases</li>
                      <li>Passwords hashed with bcrypt, never stored in plaintext</li>
                      <li>SMS codes hashed with 10-minute expiry</li>
                      <li>OAuth tokens encrypted with AES-256-GCM</li>
                    </ul>

                    <h4 className="font-bold text-yellow-400 mb-2">5. Your Rights</h4>
                    <ul className="list-disc pl-5 mb-4 space-y-1">
                      <li>Access and view your profile information anytime</li>
                      <li>Update your profile, bio, and settings</li>
                      <li>Request account deletion by contacting us</li>
                      <li>Disconnect third-party integrations</li>
                    </ul>

                    <h4 className="font-bold text-yellow-400 mb-2">6. Children&apos;s Privacy</h4>
                    <p className="mb-4">We do not knowingly collect information from individuals under age 13.</p>

                    <p className="mb-2">For the full Privacy Policy, visit: <a href="/privacy-policy" target="_blank" className="text-yellow-400 underline hover:text-yellow-300">/privacy-policy</a></p>

                    <div className="text-center mt-4 pt-4 border-t border-amber-700/30">
                      <p className="text-yellow-400 font-bold italic">Your privacy matters to us.</p>
                      <p className="text-amber-200/60 text-xs mt-1">We are committed to protecting your personal information.</p>
                    </div>
                  </div>

                  {!privacyScrolled && (
                    <p className="text-amber-400/60 text-xs text-center mb-3">Scroll down to read the full Privacy Policy to enable the checkbox</p>
                  )}

                  <label className={`flex items-center space-x-3 p-3 rounded-lg border transition-all mb-4 ${
                    privacyScrolled
                      ? "border-amber-500/40 bg-amber-900/20 cursor-pointer"
                      : "border-amber-800/20 bg-amber-950/20 cursor-not-allowed opacity-50"
                  }`}>
                    <input
                      type="checkbox"
                      checked={privacyAgreed}
                      onChange={(e) => privacyScrolled && setPrivacyAgreed(e.target.checked)}
                      disabled={!privacyScrolled}
                      className="w-5 h-5 rounded accent-yellow-500"
                    />
                    <span className="text-sm text-amber-100/80">
                      I have read and agree to the YsUp Campus Privacy Policy.
                    </span>
                  </label>

                  <div className="flex items-center justify-between">
                    <button
                      onClick={handlePrev}
                      className="text-amber-300/60 hover:text-amber-200 transition-colors px-4 py-2"
                    >
                      Back
                    </button>
                    <button
                      onClick={handleNext}
                      disabled={!privacyAgreed}
                      className={`px-8 py-3 rounded-lg font-bold text-lg transition-all shadow-lg ${
                        privacyAgreed
                          ? "bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-400 hover:to-amber-500 text-white"
                          : "bg-amber-800/40 text-amber-400/40 cursor-not-allowed"
                      }`}
                    >
                      I Accept — Continue
                    </button>
                  </div>
                </div>
              )}

              {isCompletionStep && (
                <div className="text-center">
                  <div className="text-6xl mb-4">🎉</div>
                  <h2 className="text-3xl font-bold text-yellow-400 mb-3">
                    You're All Set!
                  </h2>
                  <p className="text-amber-100/70 mb-2 max-w-md mx-auto">
                    You've completed the YsUp tour. You're ready to start connecting with classmates, earning YBucks, and making the most of your campus experience.
                  </p>
                  <p className="text-amber-200/50 text-sm mb-8 max-w-sm mx-auto">
                    Remember: the more you help your classmates, the more YBucks you earn!
                  </p>

                  <div className="grid grid-cols-3 gap-3 mb-8 max-w-sm mx-auto">
                    <div className="bg-amber-900/30 rounded-lg p-3 border border-amber-700/20">
                      <div className="text-2xl mb-1">💬</div>
                      <p className="text-xs text-amber-200/50">Ask & Answer</p>
                    </div>
                    <div className="bg-amber-900/30 rounded-lg p-3 border border-amber-700/20">
                      <div className="text-2xl mb-1">👍</div>
                      <p className="text-xs text-amber-200/50">TRUE Posts</p>
                    </div>
                    <div className="bg-amber-900/30 rounded-lg p-3 border border-amber-700/20">
                      <div className="text-2xl mb-1">💰</div>
                      <p className="text-xs text-amber-200/50">Earn YBucks</p>
                    </div>
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

            <div className="px-8 pb-4">
              <div className="flex justify-center space-x-1.5">
                {Array.from({ length: totalSteps }).map((_, i) => (
                  <div
                    key={i}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      i === currentStep
                        ? "w-6 bg-yellow-400"
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
