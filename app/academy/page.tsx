"use client"

import { useState } from "react"
import Header from "@/components/Header"
import { useAuth } from "@/lib/useAuth"
import { Play, ChevronLeft, ChevronRight } from "lucide-react"

export default function AcademyPage() {
  const { isAuthenticated, isLoading } = useAuth()
  const [currentVideo, setCurrentVideo] = useState({
    title: "MIT Calculus Fall 2007",
    subtitle: "Massachusetts Institute of Technology (Lec 29) Integration by Partial Fractions",
    thumbnail: "/placeholder.svg?height=400&width=600",
  })

  const tabs = [
    { name: "My Courses", active: false },
    { name: "Browse Videos", active: true },
    { name: "Most Popular", active: false },
    { name: "Recently Added", active: false },
  ]

  if (isLoading || !isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen brick-background">
      <Header currentPage="Academy" />

      {/* Sub Navigation */}
      <div className="bg-amber-700 px-4 py-3 flex items-center space-x-8">
        {tabs.map((tab, index) => (
          <button
            key={index}
            className={`px-4 py-2 rounded transition-colors ${
              tab.active ? "bg-amber-600 text-white" : "text-amber-100 hover:bg-amber-600"
            }`}
          >
            {tab.name}
          </button>
        ))}

        <div className="ml-auto flex items-center space-x-2">
          <input
            type="text"
            placeholder="Search Online"
            className="px-3 py-1 rounded border border-amber-600 bg-amber-50 text-amber-900 placeholder-amber-600"
          />
          <button className="bg-amber-600 text-white px-3 py-1 rounded hover:bg-amber-700">search</button>
        </div>
      </div>

      <div className="flex items-center justify-center min-h-[calc(100vh-140px)] p-8">
        <div className="max-w-6xl w-full">
          {/* Video Player Section */}
          <div className="relative bg-black rounded-lg overflow-hidden shadow-2xl">
            {/* MIT Logo */}
            <div className="absolute top-4 left-4 z-10">
              <div className="bg-white p-2 rounded">
                <div className="text-red-600 font-bold text-lg">MIT</div>
                <div className="text-xs text-gray-600">Massachusetts Institute of Technology</div>
              </div>
            </div>

            {/* Video Content */}
            <div className="relative aspect-video bg-gray-800">
              <img
                src="/placeholder.svg?height=400&width=800"
                alt="MIT Calculus Lecture"
                className="w-full h-full object-cover"
              />

              {/* Play Button Overlay */}
              <div className="absolute inset-0 flex items-center justify-center">
                <button className="bg-black bg-opacity-50 hover:bg-opacity-70 rounded-full p-4 transition-all">
                  <Play className="w-12 h-12 text-white ml-1" />
                </button>
              </div>

              {/* Navigation Arrows */}
              <button className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-70 rounded-full p-3 transition-all">
                <ChevronLeft className="w-8 h-8 text-white" />
              </button>

              <button className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-70 rounded-full p-3 transition-all">
                <ChevronRight className="w-8 h-8 text-white" />
              </button>
            </div>

            {/* Video Info */}
            <div className="bg-gray-900 text-white p-6">
              <h2 className="text-2xl font-bold mb-2">{currentVideo.title}</h2>
              <p className="text-gray-300 mb-4">{currentVideo.subtitle}</p>

              <button className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded flex items-center space-x-2 transition-colors">
                <Play className="w-4 h-4" />
                <span>watch now</span>
              </button>
            </div>
          </div>

          {/* Additional Content */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white bg-opacity-90 rounded-lg p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Featured Courses</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-blue-500 rounded flex items-center justify-center">
                    <span className="text-white font-bold">C</span>
                  </div>
                  <div>
                    <div className="font-semibold">Calculus I</div>
                    <div className="text-sm text-gray-600">MIT OpenCourseWare</div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-green-500 rounded flex items-center justify-center">
                    <span className="text-white font-bold">P</span>
                  </div>
                  <div>
                    <div className="font-semibold">Physics</div>
                    <div className="text-sm text-gray-600">Khan Academy</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white bg-opacity-90 rounded-lg p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Recent Activity</h3>
              <div className="space-y-3">
                <div className="text-sm">
                  <div className="font-semibold">Linear Algebra</div>
                  <div className="text-gray-600">Watched 2 hours ago</div>
                </div>
                <div className="text-sm">
                  <div className="font-semibold">Chemistry Basics</div>
                  <div className="text-gray-600">Watched yesterday</div>
                </div>
              </div>
            </div>

            <div className="bg-white bg-opacity-90 rounded-lg p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Study Groups</h3>
              <div className="space-y-3">
                <div className="text-sm">
                  <div className="font-semibold">Calculus Study Group</div>
                  <div className="text-gray-600">5 members online</div>
                </div>
                <div className="text-sm">
                  <div className="font-semibold">Physics Lab Partners</div>
                  <div className="text-gray-600">3 members online</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
