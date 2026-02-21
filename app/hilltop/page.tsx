"use client"

import type React from "react"

import { useState, useRef } from "react"
import Header from "@/components/Header"
import { useAuth } from "@/lib/useAuth"
import { ChevronLeft, ChevronRight, Upload, Download, Eye, EyeOff, User, Lock } from "lucide-react"

export default function HilltopPage() {
  const { isAuthenticated, isLoading } = useAuth()
  const [isAdminMode, setIsAdminMode] = useState(false)
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages] = useState(13)
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
      setCurrentPage(1)
      alert("PDF published successfully!")
    }
  }

  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1)
    }
  }

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1)
    }
  }

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
    }
  }

  if (isLoading || !isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen wood-background">
      <Header currentPage="The Hilltop" />

      <div className="bg-amber-700 px-3 md:px-4 py-2 md:py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
        <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-1 sm:space-y-0 sm:space-x-6">
          <h2 className="text-base md:text-xl font-bold text-amber-100">The Hilltop - Howard University</h2>
          <span className="text-xs md:text-sm text-amber-200 hidden sm:inline">Thursday, November 9, 2006</span>
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

      <div className="p-4 md:p-8">
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
          <div className="max-w-6xl mx-auto">
            <div className="relative">
              <div className="absolute inset-0 bg-black opacity-20 transform translate-x-2 translate-y-2 rounded-lg"></div>

              <div className="relative bg-white rounded-lg shadow-2xl overflow-hidden transform sm:-rotate-1">
                <div className="bg-gray-100 border-b-4 border-gray-800 p-3 md:p-4">
                  <div className="text-center">
                    <h1 className="text-2xl md:text-4xl font-bold text-gray-800 mb-1 md:mb-2">THE HILLTOP</h1>
                    <p className="text-sm md:text-lg text-gray-600">The Daily Student Voice of Howard University</p>
                    <div className="flex flex-col sm:flex-row justify-between items-center mt-2 text-xs md:text-sm text-gray-500 gap-1">
                      <span>VOLUME 90, NO. 52</span>
                      <span>THURSDAY, NOVEMBER 9, 2006</span>
                      <span className="hidden sm:inline">WWW.THEHILLTOPONLINE.COM</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-4 md:p-8">
                  <div className="aspect-[8.5/11] bg-gray-50 border border-gray-300 rounded shadow-inner flex items-center justify-center">
                    <div className="w-full h-full p-3 md:p-6 overflow-hidden">
                      {currentPage === 1 && (
                        <div className="space-y-3 md:space-y-4">
                          <div className="text-center border-b-2 border-black pb-3 md:pb-4">
                            <h2 className="text-lg md:text-3xl font-bold">
                              Campus Organizations Initiate Protest Against Supreme Court
                            </h2>
                            <p className="text-sm md:text-lg text-gray-600 mt-1 md:mt-2">BY BRITTANY HUTSON</p>
                            <p className="text-xs md:text-sm text-gray-500">Campus Editor</p>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-6 text-xs md:text-sm">
                            <div className="space-y-2">
                              <p>
                                At 1 p.m. Wednesday afternoon, students who were casually walking past the Blackburn
                                Center were stopped by students dressed in all black with their faces painted in black
                                and white.
                              </p>
                              <p>
                                Holding signs that read "WHITE ONLY" and "COLORED ONLY" in black letters, those dressed
                                in black asked "Do you know what's going on?"
                              </p>
                            </div>

                            <div className="space-y-2">
                              <p>
                                On Dec. 4, 2006, two lawsuits, Meredith v. Jefferson County Public Schools and Parents
                                Involved in Community Schools v. Seattle School District No. 1, will go before the
                                Supreme Court to determine whether desegregation in public schools for grades K-12 and
                                affirmative action will remain legal.
                              </p>
                            </div>

                            <div className="space-y-2 hidden md:block">
                              <p>
                                In order to increase awareness around the campus, UGSA participants and volunteers
                                willingly dressed in their respective wardrobes and took on the Yard to inform students
                                about the implications of the Supreme Court's ruling.
                              </p>
                            </div>
                          </div>

                          <div className="mt-4 md:mt-6 text-right">
                            <span className="text-xs md:text-sm text-gray-500">1 of 13</span>
                          </div>
                        </div>
                      )}

                      {currentPage !== 1 && (
                        <div className="flex items-center justify-center h-full">
                          <div className="text-center">
                            <h3 className="text-xl md:text-2xl font-bold text-gray-600 mb-4">Page {currentPage}</h3>
                            <p className="text-sm md:text-base text-gray-500">PDF content would be displayed here</p>
                            <p className="text-xs md:text-sm text-gray-400 mt-2">
                              In a real implementation, this would show the actual PDF page content
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="bg-gray-100 border-t border-gray-300 p-3 md:p-4">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={prevPage}
                        disabled={currentPage === 1}
                        className="flex items-center space-x-1 px-3 md:px-4 py-1.5 md:py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded transition-colors text-sm md:text-base"
                      >
                        <ChevronLeft className="w-4 h-4" />
                        <span className="hidden sm:inline">Previous</span>
                      </button>

                      <button
                        onClick={nextPage}
                        disabled={currentPage === totalPages}
                        className="flex items-center space-x-1 px-3 md:px-4 py-1.5 md:py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded transition-colors text-sm md:text-base"
                      >
                        <span className="hidden sm:inline">Next</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex items-center space-x-2 md:space-x-4">
                      <span className="text-xs md:text-sm text-gray-600">
                        Page {currentPage} of {totalPages}
                      </span>

                      <div className="flex items-center space-x-1 md:space-x-2">
                        <span className="text-xs md:text-sm text-gray-600 hidden sm:inline">Go to page:</span>
                        <input
                          type="number"
                          min="1"
                          max={totalPages}
                          value={currentPage}
                          onChange={(e) => goToPage(Number.parseInt(e.target.value) || 1)}
                          className="w-14 md:w-16 px-2 py-1 border border-gray-300 rounded text-center text-sm"
                        />
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button className="flex items-center space-x-1 px-3 md:px-4 py-1.5 md:py-2 bg-green-600 hover:bg-green-700 text-white rounded transition-colors text-sm md:text-base">
                        <Download className="w-4 h-4" />
                        <span className="hidden sm:inline">Download PDF</span>
                      </button>
                    </div>
                  </div>

                  <div className="mt-3 md:mt-4 flex space-x-1 md:space-x-2 overflow-x-auto pb-2">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => goToPage(page)}
                        className={`flex-shrink-0 w-8 h-10 md:w-12 md:h-16 border-2 rounded text-xs font-medium transition-colors ${
                          currentPage === page
                            ? "border-blue-500 bg-blue-100 text-blue-700"
                            : "border-gray-300 bg-white text-gray-600 hover:border-gray-400"
                        }`}
                      >
                        {page}
                      </button>
                    ))}
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
