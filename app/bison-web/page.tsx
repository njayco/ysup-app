"use client"

import type React from "react"

import { useState } from "react"
import Header from "@/components/Header"
import { useAuth } from "@/lib/useAuth"
import { Calendar, Clock, User, BookOpen, GraduationCap } from "lucide-react"

export default function BisonWebPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [loginData, setLoginData] = useState({
    userId: "",
    pin: "",
  })
  const [activeTab, setActiveTab] = useState("schedule")

  const currentSchedule = [
    {
      courseCode: "MATH 151",
      courseName: "Calculus I",
      instructor: "Dr. Johnson",
      time: "MWF 9:00-9:50 AM",
      location: "Science Hall 201",
      credits: 4,
    },
    {
      courseCode: "CHEM 141",
      courseName: "General Chemistry I",
      instructor: "Prof. Williams",
      time: "TTh 11:00-12:15 PM",
      location: "Chemistry Building 105",
      credits: 4,
    },
    {
      courseCode: "ENGL 101",
      courseName: "Freshman Composition",
      instructor: "Dr. Davis",
      time: "MWF 2:00-2:50 PM",
      location: "Liberal Arts 301",
      credits: 3,
    },
    {
      courseCode: "HIST 105",
      courseName: "World History",
      instructor: "Prof. Brown",
      time: "TTh 3:30-4:45 PM",
      location: "Humanities 210",
      credits: 3,
    },
  ]

  const availableCourses = [
    {
      courseCode: "PHYS 201",
      courseName: "Physics I",
      instructor: "Dr. Thompson",
      time: "MWF 10:00-10:50 AM",
      location: "Physics Lab 101",
      credits: 4,
      seats: "12/25",
      status: "Open",
    },
    {
      courseCode: "MATH 152",
      courseName: "Calculus II",
      instructor: "Dr. Johnson",
      time: "MWF 11:00-11:50 AM",
      location: "Science Hall 201",
      credits: 4,
      seats: "8/30",
      status: "Open",
    },
    {
      courseCode: "PSYC 101",
      courseName: "Introduction to Psychology",
      instructor: "Prof. Wilson",
      time: "TTh 1:00-2:15 PM",
      location: "Social Sciences 150",
      credits: 3,
      seats: "0/35",
      status: "Waitlist",
    },
  ]

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (loginData.userId && loginData.pin) {
      setIsLoggedIn(true)
    }
  }

  const handleLogout = () => {
    setIsLoggedIn(false)
    setLoginData({ userId: "", pin: "" })
  }

  if (authLoading || !isAuthenticated) {
    return null
  }

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen chalkboard-background">
        <Header currentPage="Bison Web" />

        <div className="flex items-center justify-center min-h-[calc(100vh-80px)] p-4 md:p-8">
          <div className="max-w-md w-full">
            <div className="text-center mb-6 md:mb-8">
              <div className="bg-blue-900 text-white p-4 md:p-6 rounded-lg mb-4 md:mb-6 shadow-lg">
                <div className="flex items-center justify-center mb-4">
                  <GraduationCap className="w-10 h-10 md:w-12 md:h-12 mr-3" />
                  <div>
                    <h1 className="text-xl md:text-2xl font-bold">HOWARD</h1>
                    <h2 className="text-base md:text-lg">UNIVERSITY</h2>
                  </div>
                </div>
              </div>

              <div className="chalk-text mb-4 md:mb-6">
                <h3 className="text-xl md:text-2xl font-bold mb-2">Banner Web Student Access</h3>
                <p className="text-base md:text-lg">Howard University Student Information System</p>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-2xl p-6 md:p-8">
              <div className="bg-blue-900 text-white p-3 md:p-4 rounded-t-lg -mx-6 md:-mx-8 -mt-6 md:-mt-8 mb-4 md:mb-6">
                <h3 className="text-lg md:text-xl font-bold text-center">Student Login</h3>
              </div>

              <div className="mb-4 md:mb-6 p-3 md:p-4 bg-blue-50 rounded border-l-4 border-blue-500">
                <h4 className="font-bold text-blue-800 mb-2 text-sm md:text-base">Instructions:</h4>
                <p className="text-xs md:text-sm text-blue-700">
                  Please enter your User Identification Number which is your 9 digit Howard University ID including @.
                  Example: @12345678 ) Enter your 6 digit PIN which is usually your birth date without dashes, unless
                  you have changed it to something else.)
                </p>
              </div>

              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label htmlFor="userId" className="block text-sm font-medium text-gray-700 mb-2">
                    User ID:
                  </label>
                  <input
                    type="text"
                    id="userId"
                    value={loginData.userId}
                    onChange={(e) => setLoginData({ ...loginData, userId: e.target.value })}
                    placeholder="@02625680"
                    className="w-full px-3 md:px-4 py-2.5 md:py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm md:text-base"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="pin" className="block text-sm font-medium text-gray-700 mb-2">
                    PIN:
                  </label>
                  <input
                    type="password"
                    id="pin"
                    value={loginData.pin}
                    onChange={(e) => setLoginData({ ...loginData, pin: e.target.value })}
                    placeholder="******"
                    className="w-full px-3 md:px-4 py-2.5 md:py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm md:text-base"
                    required
                  />
                </div>

                <div className="flex space-x-4">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2.5 md:py-3 px-4 md:px-6 rounded-md font-medium transition-colors text-sm md:text-base"
                  >
                    Login
                  </button>
                  <button
                    type="button"
                    className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-2.5 md:py-3 px-4 md:px-6 rounded-md font-medium transition-colors text-sm md:text-base"
                  >
                    Forgot PIN?
                  </button>
                </div>
              </form>

              <div className="mt-6 text-center text-xs md:text-sm text-gray-600">
                <p>RELEASE 8.3.1</p>
                <p className="mt-2">Powered by SunGard Learning Center</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen chalkboard-background">
      <Header currentPage="Bison Web" />

      <div className="bg-green-800 px-3 md:px-4 py-2 md:py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
        <div className="flex items-center space-x-2 md:space-x-6 overflow-x-auto w-full sm:w-auto">
          <button
            onClick={() => setActiveTab("schedule")}
            className={`px-3 md:px-4 py-1.5 md:py-2 rounded transition-colors text-sm md:text-base whitespace-nowrap ${
              activeTab === "schedule" ? "bg-green-600 text-white" : "text-green-100 hover:bg-green-700"
            }`}
          >
            My Schedule
          </button>
          <button
            onClick={() => setActiveTab("register")}
            className={`px-3 md:px-4 py-1.5 md:py-2 rounded transition-colors text-sm md:text-base whitespace-nowrap ${
              activeTab === "register" ? "bg-green-600 text-white" : "text-green-100 hover:bg-green-700"
            }`}
          >
            Register for Classes
          </button>
          <button
            onClick={() => setActiveTab("grades")}
            className={`px-3 md:px-4 py-1.5 md:py-2 rounded transition-colors text-sm md:text-base whitespace-nowrap ${
              activeTab === "grades" ? "bg-green-600 text-white" : "text-green-100 hover:bg-green-700"
            }`}
          >
            View Grades
          </button>
        </div>

        <div className="flex items-center space-x-2 md:space-x-4">
          <span className="text-green-100 text-xs md:text-base">Welcome, Student</span>
          <button
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 text-white px-3 md:px-4 py-1.5 md:py-2 rounded transition-colors text-sm md:text-base"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="p-4 md:p-8 flex justify-center">
        <div className="max-w-4xl w-full">
          <div className="clipboard rounded-lg shadow-2xl">
            <div className="clipboard-paper rounded clipboard-lines">
              <div className="ml-4 md:ml-12">
                {activeTab === "schedule" && (
                  <div>
                    <div className="flex items-center mb-4 md:mb-6">
                      <Calendar className="w-5 h-5 md:w-6 md:h-6 mr-2 md:mr-3 text-blue-600" />
                      <h2 className="text-xl md:text-2xl font-bold text-gray-800">My Class Schedule - Spring 2024</h2>
                    </div>

                    <div className="space-y-3 md:space-y-4">
                      {currentSchedule.map((course, index) => (
                        <div key={index} className="bg-blue-50 border border-blue-200 rounded-lg p-3 md:p-4">
                          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                            <div className="flex-1">
                              <div className="flex items-center mb-2 flex-wrap">
                                <BookOpen className="w-4 h-4 md:w-5 md:h-5 mr-2 text-blue-600 flex-shrink-0" />
                                <h3 className="text-sm md:text-lg font-bold text-gray-800">
                                  {course.courseCode} - {course.courseName}
                                </h3>
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 md:gap-4 text-xs md:text-sm text-gray-600">
                                <div className="flex items-center">
                                  <User className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2 flex-shrink-0" />
                                  <span>{course.instructor}</span>
                                </div>
                                <div className="flex items-center">
                                  <Clock className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2 flex-shrink-0" />
                                  <span>{course.time}</span>
                                </div>
                                <div>
                                  <strong>Location:</strong> {course.location}
                                </div>
                                <div>
                                  <strong>Credits:</strong> {course.credits}
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <button className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-xs md:text-sm transition-colors">
                                Drop
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-4 md:mt-6 p-3 md:p-4 bg-gray-100 rounded-lg">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-gray-800 text-sm md:text-base">Total Credits:</span>
                        <span className="text-lg md:text-xl font-bold text-blue-600">
                          {currentSchedule.reduce((total, course) => total + course.credits, 0)}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "register" && (
                  <div>
                    <div className="flex items-center mb-4 md:mb-6">
                      <GraduationCap className="w-5 h-5 md:w-6 md:h-6 mr-2 md:mr-3 text-green-600" />
                      <h2 className="text-xl md:text-2xl font-bold text-gray-800">Course Registration - Spring 2024</h2>
                    </div>

                    <div className="mb-4 md:mb-6">
                      <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4 mb-4">
                        <input
                          type="text"
                          placeholder="Search by course code or name..."
                          className="flex-1 px-3 md:px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-sm md:text-base"
                        />
                        <button className="bg-green-600 hover:bg-green-700 text-white px-4 md:px-6 py-2 rounded-md transition-colors text-sm md:text-base">
                          Search
                        </button>
                      </div>
                    </div>

                    <div className="space-y-3 md:space-y-4">
                      {availableCourses.map((course, index) => (
                        <div key={index} className="bg-green-50 border border-green-200 rounded-lg p-3 md:p-4">
                          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                            <div className="flex-1">
                              <div className="flex items-center mb-2 flex-wrap gap-1">
                                <BookOpen className="w-4 h-4 md:w-5 md:h-5 mr-1 md:mr-2 text-green-600 flex-shrink-0" />
                                <h3 className="text-sm md:text-lg font-bold text-gray-800">
                                  {course.courseCode} - {course.courseName}
                                </h3>
                                <span
                                  className={`ml-1 md:ml-3 px-2 py-0.5 md:py-1 rounded text-xs font-bold ${
                                    course.status === "Open"
                                      ? "bg-green-200 text-green-800"
                                      : "bg-yellow-200 text-yellow-800"
                                  }`}
                                >
                                  {course.status}
                                </span>
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 md:gap-4 text-xs md:text-sm text-gray-600">
                                <div className="flex items-center">
                                  <User className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2 flex-shrink-0" />
                                  <span>{course.instructor}</span>
                                </div>
                                <div className="flex items-center">
                                  <Clock className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2 flex-shrink-0" />
                                  <span>{course.time}</span>
                                </div>
                                <div>
                                  <strong>Location:</strong> {course.location}
                                </div>
                                <div>
                                  <strong>Credits:</strong> {course.credits}
                                </div>
                                <div>
                                  <strong>Available Seats:</strong> {course.seats}
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <button
                                className={`px-3 md:px-4 py-1.5 md:py-2 rounded font-medium transition-colors text-sm md:text-base ${
                                  course.status === "Open"
                                    ? "bg-green-600 hover:bg-green-700 text-white"
                                    : "bg-yellow-600 hover:bg-yellow-700 text-white"
                                }`}
                              >
                                {course.status === "Open" ? "Register" : "Join Waitlist"}
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === "grades" && (
                  <div>
                    <div className="flex items-center mb-4 md:mb-6">
                      <GraduationCap className="w-5 h-5 md:w-6 md:h-6 mr-2 md:mr-3 text-purple-600" />
                      <h2 className="text-xl md:text-2xl font-bold text-gray-800">Academic Record</h2>
                    </div>

                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 md:p-6">
                      <h3 className="text-base md:text-lg font-bold text-gray-800 mb-3 md:mb-4">Fall 2023 Semester</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center py-2 border-b border-purple-200">
                          <span className="font-medium text-sm md:text-base">MATH 150 - Pre-Calculus</span>
                          <span className="font-bold text-green-600">A</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-purple-200">
                          <span className="font-medium text-sm md:text-base">ENGL 100 - English Composition</span>
                          <span className="font-bold text-green-600">B+</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-purple-200">
                          <span className="font-medium text-sm md:text-base">HIST 104 - American History</span>
                          <span className="font-bold text-blue-600">B</span>
                        </div>
                        <div className="flex justify-between items-center py-2">
                          <span className="font-medium text-sm md:text-base">BIOL 101 - General Biology</span>
                          <span className="font-bold text-green-600">A-</span>
                        </div>
                      </div>
                      <div className="mt-4 pt-4 border-t border-purple-300">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-gray-800 text-sm md:text-base">Semester GPA:</span>
                          <span className="text-lg md:text-xl font-bold text-purple-600">3.67</span>
                        </div>
                        <div className="flex justify-between items-center mt-2">
                          <span className="font-bold text-gray-800 text-sm md:text-base">Cumulative GPA:</span>
                          <span className="text-lg md:text-xl font-bold text-purple-600">3.52</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
