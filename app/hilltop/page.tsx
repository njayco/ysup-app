"use client"

import type React from "react"
import { useState, useRef, useEffect, useCallback } from "react"
import Header from "@/components/Header"
import { useAuth } from "@/lib/useAuth"
import { ChevronLeft, ChevronRight, Upload, Download, Eye, EyeOff, User, Lock } from "lucide-react"

declare global {
  interface Window {
    pdfjsLib: any
  }
}

export default function HilltopPage() {
  const { isAuthenticated, isLoading } = useAuth()
  const [isAdminMode, setIsAdminMode] = useState(false)
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false)
  const [adminCredentials, setAdminCredentials] = useState({ username: "", password: "" })
  const [showPassword, setShowPassword] = useState(false)
  const [currentPDF, setCurrentPDF] = useState("The Daily Student Voice of Howard University")
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [pdfDoc, setPdfDoc] = useState<any>(null)
  const [numPages, setNumPages] = useState(0)
  const [pageNum, setPageNum] = useState(1)
  const [pdfLoading, setPdfLoading] = useState(true)
  const [pdfError, setPdfError] = useState("")
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const renderTaskRef = useRef<any>(null)
  const [libLoaded, setLibLoaded] = useState(false)

  useEffect(() => {
    if (typeof window !== "undefined" && window.pdfjsLib) {
      setLibLoaded(true)
      return
    }
    const script = document.createElement("script")
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"
    script.onload = () => {
      window.pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js"
      setLibLoaded(true)
    }
    script.onerror = () => {
      setPdfError("Failed to load PDF viewer")
      setPdfLoading(false)
    }
    document.head.appendChild(script)
  }, [])

  useEffect(() => {
    if (!libLoaded) return
    let cancelled = false
    const loadPdf = async () => {
      try {
        setPdfLoading(true)
        setPdfError("")
        const pdf = await window.pdfjsLib.getDocument("/hilltop-current.pdf").promise
        if (!cancelled) {
          setPdfDoc(pdf)
          setNumPages(pdf.numPages)
          setPdfLoading(false)
        }
      } catch (err: any) {
        if (!cancelled) {
          setPdfError("Failed to load newspaper PDF")
          setPdfLoading(false)
        }
      }
    }
    loadPdf()
    return () => { cancelled = true }
  }, [libLoaded])

  const renderPage = useCallback(async () => {
    if (!pdfDoc || !canvasRef.current || !containerRef.current) return
    try {
      if (renderTaskRef.current) {
        renderTaskRef.current.cancel()
        renderTaskRef.current = null
      }
      const page = await pdfDoc.getPage(pageNum)
      const container = containerRef.current
      const containerWidth = container.clientWidth - 48
      const unscaledViewport = page.getViewport({ scale: 1 })
      const scale = Math.min(containerWidth / unscaledViewport.width, 2)
      const viewport = page.getViewport({ scale })
      const canvas = canvasRef.current
      const context = canvas.getContext("2d")
      if (!context) return
      canvas.width = viewport.width
      canvas.height = viewport.height
      const task = page.render({ canvasContext: context, viewport })
      renderTaskRef.current = task
      await task.promise
    } catch (err: any) {
      if (err?.name !== "RenderingCancelledException") {
        console.error("PDF render error:", err)
      }
    }
  }, [pdfDoc, pageNum])

  useEffect(() => {
    renderPage()
  }, [renderPage])

  useEffect(() => {
    if (!pdfDoc) return
    const handleResize = () => renderPage()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [pdfDoc, renderPage])

  const nextPage = () => { if (pageNum < numPages) setPageNum(pageNum + 1) }
  const prevPage = () => { if (pageNum > 1) setPageNum(pageNum - 1) }

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

  if (isLoading || !isAuthenticated) return null

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
            className={`px-3 md:px-4 py-1.5 md:py-2 rounded transition-colors text-sm md:text-base ${isAdminMode ? "bg-blue-600 text-white" : "bg-amber-600 text-white hover:bg-amber-500"}`}
          >
            {isAdminMode ? "Reader Mode" : "Admin Mode"}
          </button>
          {isAdminLoggedIn && (
            <button
              onClick={() => { setIsAdminLoggedIn(false); setIsAdminMode(false); setAdminCredentials({ username: "", password: "" }) }}
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
                  <input type="text" value={adminCredentials.username} onChange={(e) => setAdminCredentials({ ...adminCredentials, username: e.target.value })} className="w-full px-3 md:px-4 py-2.5 md:py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm md:text-base" placeholder="Enter username" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                  <div className="relative">
                    <input type={showPassword ? "text" : "password"} value={adminCredentials.password} onChange={(e) => setAdminCredentials({ ...adminCredentials, password: e.target.value })} className="w-full px-3 md:px-4 py-2.5 md:py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 pr-12 text-sm md:text-base" placeholder="Enter password" required />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700">
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
                <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 md:py-3 rounded-md font-medium transition-colors flex items-center justify-center space-x-2 text-sm md:text-base">
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
                  <button onClick={() => fileInputRef.current?.click()} className="bg-blue-600 hover:bg-blue-700 text-white px-4 md:px-6 py-2 md:py-3 rounded-md font-medium transition-colors text-sm md:text-base">Choose PDF File</button>
                  {uploadedFile && (
                    <div className="mt-4 p-3 md:p-4 bg-green-50 border border-green-200 rounded">
                      <p className="text-green-800 font-medium text-sm md:text-base">File Selected:</p>
                      <p className="text-green-700 text-sm md:text-base">{uploadedFile.name}</p>
                      <p className="text-xs md:text-sm text-green-600">Size: {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                  )}
                </div>
                <div className="flex space-x-4">
                  <button onClick={handlePublishPDF} disabled={!uploadedFile} className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white py-2.5 md:py-3 rounded-md font-medium transition-colors text-sm md:text-base">Publish Edition</button>
                  <button onClick={() => setUploadedFile(null)} className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-2.5 md:py-3 rounded-md font-medium transition-colors text-sm md:text-base">Clear</button>
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
          <div className="max-w-5xl mx-auto w-full flex flex-col items-center">
            <div className="w-full flex flex-col md:flex-row gap-4 md:gap-6 items-start">

              <div ref={containerRef} className="flex-1 w-full">
                <div className="relative">
                  <div className="absolute inset-0 bg-black/30 translate-x-3 translate-y-3 rounded-sm pointer-events-none" style={{ zIndex: 0 }}></div>

                  <div className="relative bg-amber-50 rounded-sm overflow-hidden" style={{ zIndex: 1, boxShadow: "0 0 30px rgba(0,0,0,0.4), inset 0 0 60px rgba(139,90,43,0.15)" }}>
                    <div className="bg-gradient-to-b from-amber-100 to-amber-50 border-b-2 border-amber-800 px-4 md:px-6 py-3 md:py-4">
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-2 mb-1">
                          <div className="h-px flex-1 bg-amber-800"></div>
                          <h1 className="text-2xl md:text-4xl font-serif font-black text-amber-900 tracking-wider">THE HILLTOP</h1>
                          <div className="h-px flex-1 bg-amber-800"></div>
                        </div>
                        <p className="text-xs md:text-sm text-amber-700 font-serif italic">The Daily Student Voice of Howard University</p>
                        <div className="flex justify-between items-center mt-2 text-xs text-amber-600 font-serif">
                          <span>VOL. 93, NO. 101</span>
                          <span className="font-semibold">FRIDAY, APRIL 2, 2010</span>
                          <span className="hidden sm:inline">THEHILLTOPONLINE.COM</span>
                        </div>
                      </div>
                    </div>

                    <div className="relative bg-amber-50 flex items-center justify-center overflow-auto" style={{ minHeight: "60vh" }}>
                      {pdfLoading && (
                        <div className="absolute inset-0 flex items-center justify-center bg-amber-50/80 z-10">
                          <div className="text-center">
                            <div className="w-10 h-10 border-4 border-amber-300 border-t-amber-700 rounded-full animate-spin mx-auto mb-3"></div>
                            <p className="text-amber-700 font-serif">Loading newspaper...</p>
                          </div>
                        </div>
                      )}
                      {pdfError && (
                        <div className="text-center p-8">
                          <p className="text-red-600 font-serif text-lg">{pdfError}</p>
                        </div>
                      )}
                      <div className="p-3 md:p-6 w-full flex justify-center">
                        <canvas
                          ref={canvasRef}
                          className="max-w-full"
                          style={{
                            filter: "sepia(8%) contrast(1.02)",
                            boxShadow: "0 2px 12px rgba(0,0,0,0.15)",
                          }}
                        />
                      </div>
                    </div>

                    <div className="bg-gradient-to-t from-amber-100 to-amber-50 border-t-2 border-amber-800 px-4 md:px-6 py-3">
                      <div className="flex items-center justify-between">
                        <button
                          onClick={prevPage}
                          disabled={pageNum <= 1}
                          className="flex items-center gap-1 px-3 md:px-5 py-2 bg-amber-800 hover:bg-amber-900 disabled:bg-amber-400 disabled:cursor-not-allowed text-amber-50 rounded transition-colors text-sm md:text-base font-serif"
                        >
                          <ChevronLeft className="w-4 h-4" />
                          <span className="hidden sm:inline">Previous</span>
                        </button>

                        <span className="text-amber-800 font-serif text-sm md:text-base font-semibold">
                          Page {pageNum} of {numPages}
                        </span>

                        <button
                          onClick={nextPage}
                          disabled={pageNum >= numPages}
                          className="flex items-center gap-1 px-3 md:px-5 py-2 bg-amber-800 hover:bg-amber-900 disabled:bg-amber-400 disabled:cursor-not-allowed text-amber-50 rounded transition-colors text-sm md:text-base font-serif"
                        >
                          <span className="hidden sm:inline">Next</span>
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex justify-center">
                  <a
                    href="/hilltop-current.pdf"
                    download="The_Hilltop_4-2-2010.pdf"
                    className="flex items-center gap-2 px-4 py-2 bg-amber-700 hover:bg-amber-800 text-amber-50 rounded transition-colors text-sm font-serif"
                  >
                    <Download className="w-4 h-4" />
                    Download Full PDF
                  </a>
                </div>
              </div>

              <div className="w-full md:w-48 lg:w-56 flex-shrink-0">
                <div className="bg-amber-100/80 rounded-sm p-3 border border-amber-300" style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.15)" }}>
                  <h3 className="text-xs font-serif font-bold text-amber-900 mb-2 text-center border-b border-amber-400 pb-1">PAGES</h3>
                  <div className="grid grid-cols-4 md:grid-cols-2 gap-1.5 max-h-[60vh] overflow-y-auto">
                    {Array.from({ length: numPages }, (_, i) => i + 1).map((pg) => (
                      <button
                        key={pg}
                        onClick={() => setPageNum(pg)}
                        className={`aspect-[3/4] rounded-sm text-xs font-serif font-bold transition-all border ${
                          pageNum === pg
                            ? "bg-amber-800 text-amber-50 border-amber-900 shadow-md scale-105"
                            : "bg-amber-50 text-amber-700 border-amber-300 hover:bg-amber-200 hover:border-amber-500"
                        }`}
                      >
                        {pg}
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
