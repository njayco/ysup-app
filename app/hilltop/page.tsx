"use client"

import type React from "react"

import { useState, useRef } from "react"
import Header from "@/components/Header"
import { useAuth } from "@/lib/useAuth"
import { Upload, Download, Eye, EyeOff, User, Lock } from "lucide-react"

export default function HilltopPage() {
  const { isAuthenticated, isLoading } = useAuth()
  const [isAdminMode, setIsAdminMode] = useState(false)
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false)
  const [adminCredentials, setAdminCredentials] = useState({
    username: "",
    password: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [currentPDF, setCurrentPDF] = useState("The Daily Student Voice of Howard University")
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (adminCredentials.username === "editor" && adminCredentials.password === "hilltop2024") {
      setIsAdminLoggedIn(true)
    } else {
      alert("Invalid credentials")
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.type === "application/pdf") {
      setUploadedFile(file)
    } else {
      alert("Please select a valid PDF file")
    }
  }

  const handlePublishPDF = () => {
    if (uploadedFile) {
      setCurrentPDF(`New Edition - ${uploadedFile.name}`)
      setUploadedFile(null)
      alert("PDF published successfully!")
    }
  }

  if (isLoading || !isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen wood-background flex flex-col">
      <Header currentPage="The Hilltop" />

      <div className="bg-amber-700 px-3 md:px-4 py-2 md:py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
        <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-1 sm:space-y-0 sm:space-x-6">
          <h2 className="text-base md:text-xl font-bold text-amber-100">The Hilltop - Howard University</h2>
          <span className="text-xs md:text-sm text-amber-200 hidden sm:inline">Friday, April 2, 2010</span>
          <span className="text-xs md:text-sm text-amber-200 hidden md:inline">WWW.THEHILLTOPONLINE.COM</span>
        </div>

        <div className="flex items-center space-x-2 md:space-x-4">
          <button
            onClick={() => setIsAdminMode(!isAdminMode)}
            className={`px-3 md:px-4 py-1.5 md:py-2 rounded transition-colors text-sm md:text-base ${
              isAdminMode ? "bg-blue-600 text-white" : "bg-amber-600 text-white hover:bg-amber-500"
            }`}
          >
            {isAdminMode ? "Reader Mode" : "Admin Mode"}
          </button>
          {isAdminLoggedIn && (
            <button
              onClick={() => {
                setIsAdminLoggedIn(false)
                setIsAdminMode(false)
                setAdminCredentials({ username: "", password: "" })
              }}
              className="bg-red-600 hover:bg-red-700 text-white px-3 md:px-4 py-1.5 md:py-2 rounded transition-colors text-sm md:text-base"
            >
              Logout
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 p-4 md:p-8 flex flex-col">
        {isAdminMode && !isAdminLoggedIn ? (
          <div className="flex justify-center">
            <div className="bg-white rounded-lg shadow-2xl p-6 md:p-8 max-w-md w-full">
              <div className="text-center mb-4 md:mb-6">
                <User className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-3 md:mb-4 text-blue-600" />
                <h2 className="text-xl md:text-2xl font-bold text-gray-800">Editor-in-Chief Login</h2>
                <p className="text-sm md:text-base text-gray-600">Access administrative controls</p>
              </div>

              <form onSubmit={handleAdminLogin} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
                  <input
                    type="text"
                    value={adminCredentials.username}
                    onChange={(e) => setAdminCredentials({ ...adminCredentials, username: e.target.value })}
                    className="w-full px-3 md:px-4 py-2.5 md:py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm md:text-base"
                    placeholder="Enter username"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={adminCredentials.password}
                      onChange={(e) => setAdminCredentials({ ...adminCredentials, password: e.target.value })}
                      className="w-full px-3 md:px-4 py-2.5 md:py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 pr-12 text-sm md:text-base"
                      placeholder="Enter password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 md:py-3 rounded-md font-medium transition-colors flex items-center justify-center space-x-2 text-sm md:text-base"
                >
                  <Lock className="w-4 h-4 md:w-5 md:h-5" />
                  <span>Login</span>
                </button>
              </form>

              <div className="mt-4 md:mt-6 p-3 md:p-4 bg-gray-100 rounded text-xs md:text-sm text-gray-600">
                <p className="font-medium mb-2">Demo Credentials:</p>
                <p>Username: editor</p>
                <p>Password: hilltop2024</p>
              </div>
            </div>
          </div>
        ) : isAdminMode && isAdminLoggedIn ? (
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-lg shadow-2xl p-6 md:p-8">
              <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-4 md:mb-6 text-center">Upload New Edition</h2>

              <div className="space-y-4 md:space-y-6">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 md:p-8 text-center">
                  <Upload className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-3 md:mb-4 text-gray-400" />
                  <h3 className="text-base md:text-lg font-medium text-gray-800 mb-2">Upload PDF File</h3>
                  <p className="text-sm md:text-base text-gray-600 mb-4">Select the master PDF copy of The Hilltop newspaper</p>

                  <input ref={fileInputRef} type="file" accept=".pdf" onChange={handleFileUpload} className="hidden" />

                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 md:px-6 py-2 md:py-3 rounded-md font-medium transition-colors text-sm md:text-base"
                  >
                    Choose PDF File
                  </button>

                  {uploadedFile && (
                    <div className="mt-4 p-3 md:p-4 bg-green-50 border border-green-200 rounded">
                      <p className="text-green-800 font-medium text-sm md:text-base">File Selected:</p>
                      <p className="text-green-700 text-sm md:text-base">{uploadedFile.name}</p>
                      <p className="text-xs md:text-sm text-green-600">Size: {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                  )}
                </div>

                <div className="flex space-x-4">
                  <button
                    onClick={handlePublishPDF}
                    disabled={!uploadedFile}
                    className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white py-2.5 md:py-3 rounded-md font-medium transition-colors text-sm md:text-base"
                  >
                    Publish Edition
                  </button>
                  <button
                    onClick={() => setUploadedFile(null)}
                    className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-2.5 md:py-3 rounded-md font-medium transition-colors text-sm md:text-base"
                  >
                    Clear
                  </button>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 md:p-4">
                  <h4 className="font-medium text-blue-800 mb-2 text-sm md:text-base">Current Published Edition:</h4>
                  <p className="text-blue-700 text-sm md:text-base">{currentPDF}</p>
                  <p className="text-xs md:text-sm text-blue-600 mt-1">Last updated: Today at 2:30 PM</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="max-w-6xl mx-auto flex-1 flex flex-col">
            <div className="relative flex-1 flex flex-col">
              <div className="absolute inset-0 bg-black opacity-20 transform translate-x-2 translate-y-2 rounded-lg pointer-events-none"></div>

              <div className="relative bg-white rounded-lg shadow-2xl overflow-hidden flex-1 flex flex-col">
                <div className="bg-gray-100 border-b-4 border-gray-800 p-3 md:p-4">
                  <div className="text-center">
                    <h1 className="text-2xl md:text-4xl font-bold text-gray-800 mb-1 md:mb-2">THE HILLTOP</h1>
                    <p className="text-sm md:text-lg text-gray-600">The Daily Student Voice of Howard University</p>
                    <div className="flex flex-col sm:flex-row justify-between items-center mt-2 text-xs md:text-sm text-gray-500 gap-1">
                      <span>VOLUME 93, NO. 101</span>
                      <span>FRIDAY, APRIL 2, 2010</span>
                      <span className="hidden sm:inline">WWW.THEHILLTOPONLINE.COM</span>
                    </div>
                  </div>
                </div>

                <div className="flex-1 bg-white" style={{ minHeight: "70vh" }}>
                  <iframe
                    src="/hilltop-current.pdf"
                    className="w-full h-full border-0"
                    style={{ minHeight: "70vh" }}
                    title="The Hilltop - Friday, April 2, 2010"
                  />
                </div>

                <div className="bg-gray-100 border-t border-gray-300 p-3 md:p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs md:text-sm text-gray-600">The Hilltop - Friday, April 2, 2010</span>
                    <a
                      href="/hilltop-current.pdf"
                      download="The_Hilltop_4-2-2010.pdf"
                      className="flex items-center space-x-1 px-3 md:px-4 py-1.5 md:py-2 bg-green-600 hover:bg-green-700 text-white rounded transition-colors text-sm md:text-base"
                    >
                      <Download className="w-4 h-4" />
                      <span className="hidden sm:inline">Download PDF</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
