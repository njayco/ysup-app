"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Header from "@/components/Header"
import { useAuth } from "@/lib/useAuth"
import { ArrowLeft, Plus, Search, ExternalLink, Upload, RefreshCw, Trash2 } from "lucide-react"

interface SlideData {
  title: string
  body: string
}

export default function SlideshowWorkspacePage() {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const [connected, setConnected] = useState(false)
  const [docs, setDocs] = useState<any[]>([])
  const [selectedDoc, setSelectedDoc] = useState<any>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [creating, setCreating] = useState(false)
  const [newTitle, setNewTitle] = useState("")
  const [showNewForm, setShowNewForm] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [syncStatus, setSyncStatus] = useState("")
  const [importUrl, setImportUrl] = useState("")
  const [showImport, setShowImport] = useState(false)
  const [slides, setSlides] = useState<SlideData[]>([{ title: "", body: "" }])

  const getUserId = () => {
    const stored = localStorage.getItem("currentUser")
    return stored ? JSON.parse(stored).id : null
  }

  useEffect(() => {
    const userId = getUserId()
    if (!userId) return
    fetch(`/api/workspace/status?userId=${userId}`)
      .then(r => r.json())
      .then(d => { if (d.connected) { setConnected(true); loadDocs() } })
      .catch(() => {})
  }, [])

  const loadDocs = async () => {
    const userId = getUserId()
    if (!userId) return
    const res = await fetch(`/api/workspace/recent?userId=${userId}&type=slideshow`)
    const data = await res.json()
    if (Array.isArray(data)) setDocs(data)
  }

  const handleCreate = async () => {
    const userId = getUserId()
    if (!userId || !newTitle.trim()) return
    setCreating(true)
    try {
      const res = await fetch("/api/workspace/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, type: "slideshow", title: newTitle }),
      })
      const doc = await res.json()
      if (doc.id) {
        setDocs(prev => [doc, ...prev])
        setSelectedDoc(doc)
        setShowNewForm(false)
        setNewTitle("")
      }
    } catch {} finally { setCreating(false) }
  }

  const handleImport = async () => {
    const userId = getUserId()
    if (!userId || !importUrl.trim()) return
    try {
      const res = await fetch("/api/workspace/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, type: "slideshow", googleUrl: importUrl }),
      })
      const doc = await res.json()
      if (doc.id) {
        setDocs(prev => [doc, ...prev])
        setSelectedDoc(doc)
        setShowImport(false)
        setImportUrl("")
      }
    } catch {}
  }

  const addSlide = () => setSlides(prev => [...prev, { title: "", body: "" }])
  const removeSlide = (i: number) => setSlides(prev => prev.filter((_, idx) => idx !== i))
  const updateSlide = (i: number, field: keyof SlideData, value: string) => {
    setSlides(prev => prev.map((s, idx) => idx === i ? { ...s, [field]: value } : s))
  }

  const handleSync = async () => {
    if (!selectedDoc) return
    const userId = getUserId()
    if (!userId) return
    const validSlides = slides.filter(s => s.title.trim() || s.body.trim())
    if (validSlides.length === 0) return
    setSyncing(true)
    setSyncStatus("")
    try {
      const res = await fetch("/api/workspace/sync/slideshow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, presentationId: selectedDoc.google_file_id, slides: validSlides }),
      })
      const data = await res.json()
      setSyncStatus(data.success ? "Slides synced successfully!" : data.error || "Sync failed")
    } catch { setSyncStatus("Sync failed") } finally { setSyncing(false) }
  }

  const filteredDocs = docs.filter(d => d.title?.toLowerCase().includes(searchQuery.toLowerCase()))

  if (isLoading || !isAuthenticated) return null

  return (
    <div className="min-h-screen wood-background flex flex-col">
      <Header currentPage="Home" />
      <div className="flex-1 flex flex-col lg:flex-row p-4 gap-4">
        {/* Left Sidebar */}
        <div className="w-full lg:w-64 shrink-0 rounded-xl p-4" style={{ background: "linear-gradient(145deg, #1a1a2e, #16213e)", border: "2px solid #0f3460", color: "white" }}>
          <button onClick={() => router.push("/dashboard")} className="flex items-center gap-2 text-blue-300 hover:text-blue-200 mb-4 text-sm">
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </button>
          <h2 className="font-bold text-lg mb-3 flex items-center gap-2">📽️ YsUp Slideshow</h2>
          <div className="relative mb-3">
            <Search className="w-4 h-4 absolute left-2 top-2 text-blue-400" />
            <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search presentations..." className="w-full pl-8 pr-3 py-1.5 text-sm border border-blue-800 rounded-lg bg-blue-900/50 text-white placeholder-blue-400" />
          </div>
          <button onClick={() => setShowNewForm(!showNewForm)} className="w-full py-2 bg-orange-500 text-white text-sm rounded-lg mb-2 hover:bg-orange-400 flex items-center justify-center gap-1">
            <Plus className="w-4 h-4" /> New Presentation
          </button>
          {showNewForm && (
            <div className="mb-3 space-y-2">
              <input value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="Presentation title..." className="w-full px-3 py-1.5 text-sm border border-blue-800 rounded-lg bg-blue-900/50 text-white placeholder-blue-400" onKeyDown={e => e.key === "Enter" && handleCreate()} />
              <button onClick={handleCreate} disabled={creating} className="w-full py-1.5 bg-blue-600 text-white text-xs rounded-lg disabled:opacity-50">{creating ? "Creating..." : "Create"}</button>
            </div>
          )}
          <button onClick={() => setShowImport(!showImport)} className="w-full py-1.5 text-blue-300 text-xs rounded-lg mb-2 hover:bg-blue-900/50 flex items-center justify-center gap-1">
            <Upload className="w-3 h-3" /> Import by URL
          </button>
          {showImport && (
            <div className="mb-3 space-y-2">
              <input value={importUrl} onChange={e => setImportUrl(e.target.value)} placeholder="Google Slides URL..." className="w-full px-3 py-1.5 text-sm border border-blue-800 rounded-lg bg-blue-900/50 text-white placeholder-blue-400" />
              <button onClick={handleImport} className="w-full py-1.5 bg-orange-500 text-white text-xs rounded-lg">Import</button>
            </div>
          )}
          <div className="text-xs font-semibold text-blue-300 mb-2">Recent Presentations</div>
          <div className="space-y-1 max-h-[300px] overflow-y-auto">
            {filteredDocs.map(doc => (
              <button key={doc.id} onClick={() => setSelectedDoc(doc)} className={`w-full text-left px-2 py-1.5 rounded-lg text-xs transition-colors ${selectedDoc?.id === doc.id ? "bg-blue-800 text-blue-200" : "hover:bg-blue-900/50 text-blue-300"}`}>
                <div className="font-medium truncate">{doc.title}</div>
                <div className="text-blue-500">{new Date(doc.created_at).toLocaleDateString()}</div>
              </button>
            ))}
            {filteredDocs.length === 0 && <p className="text-xs text-blue-500 text-center py-4">No presentations yet</p>}
          </div>
        </div>

        {/* Main Panel */}
        <div className="flex-1 rounded-xl overflow-hidden" style={{ border: "2px solid #0f3460", background: "#111" }}>
          {selectedDoc ? (
            <div className="h-full flex flex-col">
              <div className="flex items-center justify-between p-3 border-b border-blue-900" style={{ background: "#1a1a2e" }}>
                <h3 className="font-semibold text-sm truncate text-white">{selectedDoc.title}</h3>
                <a href={selectedDoc.google_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-orange-400 hover:underline">
                  <ExternalLink className="w-3 h-3" /> Open in Google
                </a>
              </div>
              <iframe src={selectedDoc.google_url} className="flex-1 w-full min-h-[500px]" allow="clipboard-read; clipboard-write" />
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-blue-500 text-sm min-h-[500px]">
              Select a presentation or create a new one
            </div>
          )}
        </div>

        {/* Right Sync Panel */}
        <div className="w-full lg:w-80 shrink-0 rounded-xl p-4" style={{ background: "linear-gradient(145deg, #1a1a2e, #16213e)", border: "2px solid #0f3460", color: "white" }}>
          <h3 className="font-bold mb-3 flex items-center gap-2">
            <RefreshCw className="w-4 h-4" /> Slide Builder
          </h3>
          {selectedDoc ? (
            <div>
              <p className="text-xs text-blue-300 mb-3">Build slides below and sync them into your presentation:</p>
              <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
                {slides.map((slide, i) => (
                  <div key={i} className="rounded-lg p-3 border border-blue-800" style={{ background: "rgba(255,255,255,0.05)" }}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-orange-400">Slide {i + 1}</span>
                      {slides.length > 1 && (
                        <button onClick={() => removeSlide(i)} className="text-red-400 hover:text-red-300">
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                    <input
                      value={slide.title}
                      onChange={e => updateSlide(i, "title", e.target.value)}
                      placeholder="Slide title..."
                      className="w-full px-2 py-1.5 text-sm rounded bg-blue-900/50 border border-blue-700 text-white placeholder-blue-500 mb-2"
                    />
                    <textarea
                      value={slide.body}
                      onChange={e => updateSlide(i, "body", e.target.value)}
                      placeholder="Slide content..."
                      className="w-full px-2 py-1.5 text-sm rounded bg-blue-900/50 border border-blue-700 text-white placeholder-blue-500 h-16 resize-none"
                    />
                  </div>
                ))}
              </div>
              <button onClick={addSlide} className="w-full py-1.5 text-blue-300 text-xs rounded-lg mt-2 hover:bg-blue-900/50 border border-dashed border-blue-700">
                + Add Slide
              </button>
              <button onClick={handleSync} disabled={syncing} className="w-full py-2 bg-orange-500 text-white text-sm rounded-lg mt-3 hover:bg-orange-400 disabled:opacity-50 flex items-center justify-center gap-2">
                <RefreshCw className={`w-4 h-4 ${syncing ? "animate-spin" : ""}`} />
                {syncing ? "Syncing..." : "Sync to Google Slides"}
              </button>
              {syncStatus && <p className={`text-xs mt-2 text-center ${syncStatus.includes("success") ? "text-green-400" : "text-red-400"}`}>{syncStatus}</p>}
            </div>
          ) : (
            <p className="text-xs text-blue-500 text-center py-8">Select a presentation to build slides</p>
          )}
        </div>
      </div>
    </div>
  )
}
