"use client"

import { useState, useEffect } from "react"
import Header from "@/components/Header"
import { useAuth } from "@/lib/useAuth"
import {
  Plus,
  Minus,
  Trophy,
  Users,
  Target,
  HelpCircle,
  X,
  Download,
  RotateCcw,
  Crown,
  Star,
  Award,
} from "lucide-react"

interface Student {
  id: string
  name: string
  ybucks: number
  assists: number
  questions: number
  correctAnswers: number
  isCaptain: boolean
}

interface GameSession {
  id: string
  teacherName: string
  subject: string
  className: string
  students: Student[]
  teacherYBucks: number
  totalClassYBucks: number
  date: string
  isActive: boolean
}

export default function TheGamePage() {
  const { isAuthenticated, isLoading } = useAuth()
  const [showRules, setShowRules] = useState(false)
  const [showCreateSession, setShowCreateSession] = useState(false)
  const [currentSession, setCurrentSession] = useState<GameSession | null>(null)
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  const [customPoints, setCustomPoints] = useState<{ [key: string]: string }>({})
  const [classCustomPoints, setClassCustomPoints] = useState("")
  const [newSessionData, setNewSessionData] = useState({
    teacherName: "",
    subject: "",
    className: "",
    studentNames: [""],
  })

  // Load saved sessions from localStorage
  useEffect(() => {
    const savedSessions = localStorage.getItem("ysupGameSessions")
    if (savedSessions) {
      const sessions = JSON.parse(savedSessions)
      const activeSession = sessions.find((s: GameSession) => s.isActive)
      if (activeSession) {
        setCurrentSession(activeSession)
      }
    }
  }, [])

  // Save sessions to localStorage
  const saveSessions = (sessions: GameSession[]) => {
    localStorage.setItem("ysupGameSessions", JSON.stringify(sessions))
  }

  const addStudentField = () => {
    setNewSessionData({
      ...newSessionData,
      studentNames: [...newSessionData.studentNames, ""],
    })
  }

  const removeStudentField = (index: number) => {
    const newNames = newSessionData.studentNames.filter((_, i) => i !== index)
    setNewSessionData({
      ...newSessionData,
      studentNames: newNames.length > 0 ? newNames : [""],
    })
  }

  const updateStudentName = (index: number, name: string) => {
    const newNames = [...newSessionData.studentNames]
    newNames[index] = name
    setNewSessionData({
      ...newSessionData,
      studentNames: newNames,
    })
  }

  const createGameSession = () => {
    if (!newSessionData.teacherName || !newSessionData.subject || !newSessionData.className) {
      alert("Please fill in all required fields")
      return
    }

    const validStudentNames = newSessionData.studentNames.filter((name) => name.trim() !== "")
    if (validStudentNames.length === 0) {
      alert("Please add at least one student")
      return
    }

    const students: Student[] = validStudentNames.map((name, index) => ({
      id: `student-${Date.now()}-${index}`,
      name: name.trim(),
      ybucks: 0,
      assists: 0,
      questions: 0,
      correctAnswers: 0,
      isCaptain: index === 0, // First student is captain by default
    }))

    const newSession: GameSession = {
      id: `session-${Date.now()}`,
      teacherName: newSessionData.teacherName,
      subject: newSessionData.subject,
      className: newSessionData.className,
      students,
      teacherYBucks: 0,
      totalClassYBucks: 0,
      date: new Date().toLocaleDateString(),
      isActive: true,
    }

    // Deactivate any existing sessions and add new one
    const savedSessions = JSON.parse(localStorage.getItem("ysupGameSessions") || "[]")
    const updatedSessions = savedSessions.map((s: GameSession) => ({ ...s, isActive: false }))
    updatedSessions.push(newSession)

    saveSessions(updatedSessions)
    setCurrentSession(newSession)
    setShowCreateSession(false)
    setNewSessionData({
      teacherName: "",
      subject: "",
      className: "",
      studentNames: [""],
    })
  }

  const updateStudentPoints = (studentId: string, action: "assist" | "question" | "correct") => {
    if (!currentSession) return

    const points = {
      assist: 100,
      question: 10,
      correct: 10,
    }

    const updatedStudents = currentSession.students.map((student) => {
      if (student.id === studentId) {
        const newStudent = { ...student }
        newStudent.ybucks += points[action]

        if (action === "assist") newStudent.assists += 1
        if (action === "question") newStudent.questions += 1
        if (action === "correct") newStudent.correctAnswers += 1

        return newStudent
      }
      return student
    })

    const newTotalClassYBucks = updatedStudents.reduce((total, student) => total + student.ybucks, 0)

    const updatedSession = {
      ...currentSession,
      students: updatedStudents,
      totalClassYBucks: newTotalClassYBucks,
    }

    setCurrentSession(updatedSession)
    updateSessionInStorage(updatedSession)
  }

  const addCustomPoints = (studentId: string) => {
    const points = Number.parseInt(customPoints[studentId] || "0")
    if (points === 0) return

    const updatedStudents = currentSession!.students.map((student) => {
      if (student.id === studentId) {
        return { ...student, ybucks: student.ybucks + points }
      }
      return student
    })

    const newTotalClassYBucks = updatedStudents.reduce((total, student) => total + student.ybucks, 0)

    const updatedSession = {
      ...currentSession!,
      students: updatedStudents,
      totalClassYBucks: newTotalClassYBucks,
    }

    setCurrentSession(updatedSession)
    updateSessionInStorage(updatedSession)
    setCustomPoints({ ...customPoints, [studentId]: "" })
  }

  const addClassPoints = () => {
    const points = Number.parseInt(classCustomPoints || "0")
    if (points === 0) return

    const updatedStudents = currentSession!.students.map((student) => ({
      ...student,
      ybucks: student.ybucks + points,
    }))

    const newTotalClassYBucks = updatedStudents.reduce((total, student) => total + student.ybucks, 0)

    const updatedSession = {
      ...currentSession!,
      students: updatedStudents,
      totalClassYBucks: newTotalClassYBucks,
    }

    setCurrentSession(updatedSession)
    updateSessionInStorage(updatedSession)
    setClassCustomPoints("")
  }

  const addTeacherPoints = () => {
    const updatedSession = {
      ...currentSession!,
      teacherYBucks: currentSession!.teacherYBucks + 250,
    }

    setCurrentSession(updatedSession)
    updateSessionInStorage(updatedSession)
  }

  const setCaptain = (studentId: string) => {
    const updatedStudents = currentSession!.students.map((student) => ({
      ...student,
      isCaptain: student.id === studentId,
    }))

    const updatedSession = {
      ...currentSession!,
      students: updatedStudents,
    }

    setCurrentSession(updatedSession)
    updateSessionInStorage(updatedSession)
  }

  const updateSessionInStorage = (session: GameSession) => {
    const savedSessions = JSON.parse(localStorage.getItem("ysupGameSessions") || "[]")
    const updatedSessions = savedSessions.map((s: GameSession) => (s.id === session.id ? session : s))
    saveSessions(updatedSessions)
  }

  const getSortedStudents = () => {
    if (!currentSession) return []

    return [...currentSession.students].sort((a, b) => {
      if (sortOrder === "desc") {
        return b.ybucks - a.ybucks
      } else {
        return a.ybucks - b.ybucks
      }
    })
  }

  const resetSession = () => {
    if (!currentSession) return

    if (confirm("Are you sure you want to reset all scores? This cannot be undone.")) {
      const resetStudents = currentSession.students.map((student) => ({
        ...student,
        ybucks: 0,
        assists: 0,
        questions: 0,
        correctAnswers: 0,
      }))

      const updatedSession = {
        ...currentSession,
        students: resetStudents,
        teacherYBucks: 0,
        totalClassYBucks: 0,
      }

      setCurrentSession(updatedSession)
      updateSessionInStorage(updatedSession)
    }
  }

  const exportData = () => {
    if (!currentSession) return

    const data = {
      session: currentSession,
      exportDate: new Date().toISOString(),
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `ysup-game-${currentSession.className}-${currentSession.date}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (isLoading || !isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen wood-background">
      <Header currentPage="The Game" />

      {/* Sub Navigation */}
      <div className="bg-amber-700 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-6">
          <h2 className="text-xl font-bold text-amber-100">YsUp The Game</h2>
          <span className="text-amber-200">Transform Learning Into Competition</span>
        </div>

        <div className="flex items-center space-x-4">
          <button
            onClick={() => setShowRules(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors flex items-center space-x-2"
          >
            <HelpCircle className="w-4 h-4" />
            <span>How to Play</span>
          </button>

          {!currentSession && (
            <button
              onClick={() => setShowCreateSession(true)}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded transition-colors flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Start New Game</span>
            </button>
          )}
        </div>
      </div>

      <div className="p-8">
        {!currentSession ? (
          /* Welcome Screen */
          <div className="max-w-4xl mx-auto text-center">
            <div className="bg-white rounded-lg shadow-2xl p-12 mb-8">
              <div className="text-6xl mb-6">🎮</div>
              <h1 className="text-4xl font-bold text-gray-800 mb-6">Welcome to YsUp The Game</h1>
              <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                Transform your classroom into an engaging learning environment where students earn YBucks for
                participation, asking questions, and helping each other learn.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-blue-50 p-6 rounded-lg">
                  <Target className="w-12 h-12 mx-auto mb-4 text-blue-600" />
                  <h3 className="text-lg font-bold text-gray-800 mb-2">Point Tracking</h3>
                  <p className="text-gray-600">Real-time YBucks tracking for student actions and achievements</p>
                </div>

                <div className="bg-green-50 p-6 rounded-lg">
                  <Users className="w-12 h-12 mx-auto mb-4 text-green-600" />
                  <h3 className="text-lg font-bold text-gray-800 mb-2">Team Competition</h3>
                  <p className="text-gray-600">Students vs Teacher scoring system with daily captains</p>
                </div>

                <div className="bg-purple-50 p-6 rounded-lg">
                  <Trophy className="w-12 h-12 mx-auto mb-4 text-purple-600" />
                  <h3 className="text-lg font-bold text-gray-800 mb-2">Leaderboards</h3>
                  <p className="text-gray-600">Sort and track top performers to motivate learning</p>
                </div>
              </div>

              <div className="flex justify-center space-x-4">
                <button
                  onClick={() => setShowCreateSession(true)}
                  className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-lg text-lg font-medium transition-colors flex items-center space-x-2"
                >
                  <Plus className="w-5 h-5" />
                  <span>Start New Game Session</span>
                </button>

                <button
                  onClick={() => setShowRules(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg text-lg font-medium transition-colors flex items-center space-x-2"
                >
                  <HelpCircle className="w-5 h-5" />
                  <span>Learn the Rules</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Game Dashboard */
          <div className="max-w-7xl mx-auto">
            {/* Session Header */}
            <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">{currentSession.subject}</h2>
                  <p className="text-gray-600">
                    {currentSession.className} • Teacher: {currentSession.teacherName}
                  </p>
                  <p className="text-sm text-gray-500">Session Date: {currentSession.date}</p>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{currentSession.totalClassYBucks}</div>
                    <div className="text-sm text-gray-600">Class Total</div>
                  </div>

                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">{currentSession.teacherYBucks}</div>
                    <div className="text-sm text-gray-600">Teacher Score</div>
                  </div>

                  <div className="flex flex-col space-y-2">
                    <button
                      onClick={addTeacherPoints}
                      className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded text-sm"
                    >
                      +250 Teacher YBucks
                    </button>

                    <button
                      onClick={() => setShowCreateSession(true)}
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-sm"
                    >
                      New Session
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-800">Game Controls</h3>

                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <label className="text-sm text-gray-600">Sort by YBucks:</label>
                    <select
                      value={sortOrder}
                      onChange={(e) => setSortOrder(e.target.value as "asc" | "desc")}
                      className="px-3 py-1 border rounded"
                    >
                      <option value="desc">Highest First</option>
                      <option value="asc">Lowest First</option>
                    </select>
                  </div>

                  <button
                    onClick={exportData}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center space-x-2"
                  >
                    <Download className="w-4 h-4" />
                    <span>Export</span>
                  </button>

                  <button
                    onClick={resetSession}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded flex items-center space-x-2"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Reset</span>
                  </button>
                </div>
              </div>

              {/* Class-wide Points */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-800 mb-2">Add Points to Entire Class</h4>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    value={classCustomPoints}
                    onChange={(e) => setClassCustomPoints(e.target.value)}
                    placeholder="Points (e.g., 250 for good behavior)"
                    className="flex-1 px-3 py-2 border rounded"
                  />
                  <button
                    onClick={addClassPoints}
                    className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded"
                  >
                    Add to All Students
                  </button>
                </div>
              </div>
            </div>

            {/* Student Roster */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="bg-gray-50 px-6 py-4 border-b">
                <h3 className="text-lg font-bold text-gray-800">Student Roster & Scoring</h3>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Student
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        YBucks
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Stats
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Custom Points
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Captain
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {getSortedStudents().map((student, index) => (
                      <tr key={student.id} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {student.isCaptain && <Crown className="w-5 h-5 text-yellow-500 mr-2" />}
                            <div>
                              <div className="text-sm font-medium text-gray-900">{student.name}</div>
                              {student.isCaptain && <div className="text-xs text-yellow-600">Team Captain</div>}
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <div className="text-2xl font-bold text-green-600">{student.ybucks}</div>
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <div className="flex justify-center space-x-2">
                            <button
                              onClick={() => updateStudentPoints(student.id, "assist")}
                              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"
                              title="Student provided assistance (+100 YBucks)"
                            >
                              Assist
                            </button>
                            <button
                              onClick={() => updateStudentPoints(student.id, "question")}
                              className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded text-sm"
                              title="Student raised hand/asked question (+10 YBucks)"
                            >
                              Raised Hand
                            </button>
                            <button
                              onClick={() => updateStudentPoints(student.id, "correct")}
                              className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm"
                              title="Student gave correct answer (+10 YBucks)"
                            >
                              Correct Answer
                            </button>
                          </div>
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-600">
                          <div className="space-y-1">
                            <div>Assists: {student.assists}</div>
                            <div>Questions: {student.questions}</div>
                            <div>Correct: {student.correctAnswers}</div>
                          </div>
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <div className="flex items-center space-x-2">
                            <input
                              type="number"
                              value={customPoints[student.id] || ""}
                              onChange={(e) => setCustomPoints({ ...customPoints, [student.id]: e.target.value })}
                              placeholder="Points"
                              className="w-20 px-2 py-1 border rounded text-sm"
                            />
                            <button
                              onClick={() => addCustomPoints(student.id)}
                              className="bg-orange-600 hover:bg-orange-700 text-white px-2 py-1 rounded text-sm"
                            >
                              Add
                            </button>
                          </div>
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <button
                            onClick={() => setCaptain(student.id)}
                            className={`px-3 py-1 rounded text-sm ${
                              student.isCaptain
                                ? "bg-yellow-500 text-white"
                                : "bg-gray-200 hover:bg-gray-300 text-gray-700"
                            }`}
                          >
                            {student.isCaptain ? "Captain" : "Make Captain"}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Leaderboard Summary */}
            <div className="mt-6 bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Today's Leaderboard</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {getSortedStudents()
                  .slice(0, 3)
                  .map((student, index) => (
                    <div
                      key={student.id}
                      className={`p-4 rounded-lg ${
                        index === 0
                          ? "bg-yellow-100 border-2 border-yellow-400"
                          : index === 1
                            ? "bg-gray-100 border-2 border-gray-400"
                            : "bg-orange-100 border-2 border-orange-400"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {index === 0 && <Trophy className="w-6 h-6 text-yellow-500" />}
                          {index === 1 && <Award className="w-6 h-6 text-gray-500" />}
                          {index === 2 && <Star className="w-6 h-6 text-orange-500" />}
                          <div>
                            <div className="font-bold">{student.name}</div>
                            <div className="text-sm text-gray-600">
                              {index === 0 ? "🥇 1st Place" : index === 1 ? "🥈 2nd Place" : "🥉 3rd Place"}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold">{student.ybucks}</div>
                          <div className="text-sm text-gray-600">YBucks</div>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Rules Modal */}
      {showRules && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-blue-600 text-white p-6 rounded-t-lg">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">YsUp Game Rules - How to Play</h2>
                <button onClick={() => setShowRules(false)} className="text-white hover:text-gray-200">
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Objective */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="text-xl font-bold text-green-800 mb-2">🎯 Objective</h3>
                <p className="text-green-700">
                  The objective of the YsUp game is to learn everything taught in class before the bell rings by asking
                  questions and scoring more YBUCKS as a team than the teacher.
                </p>
              </div>

              {/* Rules */}
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-4">📋 Game Rules</h3>
                <div className="space-y-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-bold text-blue-800 mb-2">1. Ask</h4>
                    <p className="text-blue-700">
                      Students are encouraged to ask questions about the lecture without fear. They can write down their
                      questions and answers before asking for assistance.
                    </p>
                  </div>

                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <h4 className="font-bold text-purple-800 mb-2">2. Assistance</h4>
                    <p className="text-purple-700">
                      The first student to raise their hand with the correct answer, or the team captain or teacher, can
                      assist the student with their question. However, players cannot give away any answers. Instead,
                      they must use clever questions, hints, examples, formulas, etc. to help the student arrive at the
                      answer on their own.
                    </p>
                  </div>

                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <h4 className="font-bold text-red-800 mb-2">3. No Cheating</h4>
                    <p className="text-red-700">
                      Cheating is not allowed in the game. Players cannot give away any answers, and they must use
                      clever questions, hints, examples, formulas, etc. to help the student arrive at the answer on
                      their own.
                    </p>
                  </div>
                </div>
              </div>

              {/* Scoring */}
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-4">💰 Scoring Points (YBucks)</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <h4 className="font-bold text-red-800 mb-3">Teacher (Coach)</h4>
                    <ul className="space-y-2 text-red-700">
                      <li>
                        • <strong>250 YBucks</strong> if no questions are asked after prompting "Are There Any Questions
                        Class?" throughout the lecture
                      </li>
                    </ul>
                  </div>

                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h4 className="font-bold text-green-800 mb-3">Students (Team)</h4>
                    <ul className="space-y-2 text-green-700">
                      <li>
                        • <strong>10 YBucks</strong> for correct answers
                      </li>
                      <li>
                        • <strong>10 YBucks</strong> for low-level commissions (homework)
                      </li>
                      <li>
                        • <strong>100 YBucks</strong> for assisting
                      </li>
                      <li>
                        • <strong>10-250 YBucks</strong> for good behavior
                      </li>
                      <li>
                        • <strong>250 YBucks</strong> for 100% attendance
                      </li>
                      <li>
                        • <strong>50-100 YBucks</strong> for graded commissions
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Terminology */}
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-4">📚 Terminology</h3>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <ul className="space-y-2 text-gray-700">
                    <li>
                      • <strong>Tests/Midterms</strong> are high-level commissions
                    </li>
                    <li>
                      • <strong>Homework</strong> is low-level commissions
                    </li>
                    <li>
                      • <strong>Finals/State Exams</strong> are final commissions
                    </li>
                    <li>
                      • <strong>Teachers</strong> are coaches
                    </li>
                    <li>
                      • <strong>Class</strong> is the team
                    </li>
                    <li>
                      • <strong>Written answer</strong> is proof
                    </li>
                  </ul>
                </div>
              </div>

              {/* Team Captains */}
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-4">👑 Team Captains</h3>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <ul className="space-y-2 text-yellow-800">
                    <li>• Teachers must select a new team captain every day</li>
                    <li>• Captains must prepare at least two questions to ask the team</li>
                    <li>
                      • Captains must also make the first or second assist attempt for every question asked by a player
                    </li>
                  </ul>
                </div>
              </div>

              {/* App Features */}
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-4">📱 Using This App</h3>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <ul className="space-y-2 text-blue-700">
                    <li>
                      • Click <strong>"Assist"</strong> when a student helps another (+100 YBucks)
                    </li>
                    <li>
                      • Click <strong>"Raised Hand"</strong> when a student asks a question (+10 YBucks)
                    </li>
                    <li>
                      • Click <strong>"Correct Answer"</strong> when a student answers correctly (+10 YBucks)
                    </li>
                    <li>
                      • Use <strong>"Custom Points"</strong> for special achievements or behavior
                    </li>
                    <li>• Add points to the entire class for group achievements</li>
                    <li>• Set daily team captains using the captain button</li>
                    <li>• Export session data for record keeping</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Session Modal */}
      {showCreateSession && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-green-600 text-white p-6 rounded-t-lg">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Create New Game Session</h2>
                <button onClick={() => setShowCreateSession(false)} className="text-white hover:text-gray-200">
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Teacher Name *</label>
                  <input
                    type="text"
                    value={newSessionData.teacherName}
                    onChange={(e) => setNewSessionData({ ...newSessionData, teacherName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Enter teacher name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Subject *</label>
                  <input
                    type="text"
                    value={newSessionData.subject}
                    onChange={(e) => setNewSessionData({ ...newSessionData, subject: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="e.g., Mathematics, Science"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Class Name *</label>
                <input
                  type="text"
                  value={newSessionData.className}
                  onChange={(e) => setNewSessionData({ ...newSessionData, className: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="e.g., Period 3, Room 101, Grade 10A"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-4">
                  <label className="block text-sm font-medium text-gray-700">Student Names</label>
                  <button
                    onClick={addStudentField}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm flex items-center space-x-1"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Student</span>
                  </button>
                </div>

                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {newSessionData.studentNames.map((name, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => updateStudentName(index, e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder={`Student ${index + 1} name`}
                      />
                      {newSessionData.studentNames.length > 1 && (
                        <button
                          onClick={() => removeStudentField(index)}
                          className="bg-red-600 hover:bg-red-700 text-white p-2 rounded"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                      )}
                      {index === 0 && <span className="text-xs text-yellow-600 font-medium">Captain</span>}
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-2">First student will be set as team captain by default</p>
              </div>

              <div className="flex space-x-4">
                <button
                  onClick={createGameSession}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-md font-medium transition-colors"
                >
                  Create Game Session
                </button>
                <button
                  onClick={() => setShowCreateSession(false)}
                  className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-3 rounded-md font-medium transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
