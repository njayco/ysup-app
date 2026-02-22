"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Header from "@/components/Header"
import { useAuth } from "@/lib/useAuth"
import { ArrowLeft, Plus, Search, ExternalLink, Upload, RefreshCw } from "lucide-react"

export default function PadWorkspacePage() {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const [connected, setConnected] = useState(false)
  const [docs, setDocs] = useState<any[]>([])
  const [selectedDoc, setSelectedDoc] = useState<any>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [creating, setCreating] = useState(false)
  const [newTitle, setNewTitle] = useState("")
  const [showNewForm, setShowNewForm] = useState(false)
  const [syncContent, setSyncContent] = useState("")
  const [syncing, setSyncing] = useState(false)
  const [syncStatus, setSyncStatus] = useState("")
  const [importUrl, setImportUrl] = useState("")
  const [showImport, setShowImport] = useState(false)

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
    const res = await fetch(`/api/workspace/recent?userId=${userId}&type=pad`)
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
        body: JSON.stringify({ userId, type: "pad", title: newTitle }),
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
        body: JSON.stringify({ userId, type: "pad", googleUrl: importUrl }),
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

  const handleSync = async () => {
    if (!selectedDoc || !syncContent.trim()) return
    const userId = getUserId()
    if (!userId) return
    setSyncing(true)
    setSyncStatus("")
    try {
      const res = await fetch("/api/workspace/sync/pad", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, docId: selectedDoc.google_file_id, content: syncContent }),
      })
      const data = await res.json()
      setSyncStatus(data.success ? "Synced successfully!" : data.error || "Sync failed")
    } catch { setSyncStatus("Sync failed") } finally { setSyncing(false) }
  }

  const filteredDocs = docs.filter(d => d.title?.toLowerCase().includes(searchQuery.toLowerCase()))

  if (isLoading || !isAuthenticated) return null

  return (
    <div className="min-h-screen wood-background flex flex-col">
      <Header currentPage="Home" />
      <div className="flex-1 flex flex-col lg:flex-row p-4 gap-4">
        {/* Left Sidebar */}
        <div className="w-full lg:w-64 shrink-0 rounded-xl p-4" style={{ background: "linear-gradient(145deg, #f5f5f0, #e8e4da)", border: "2px solid #2a2a2a" }}>
          <button onClick={() => router.push("/dashboard")} className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4 text-sm">
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </button>
          <h2 className="font-bold text-gray-800 text-lg mb-3 flex items-center gap-2">📓 YsUp Pad</h2>
          <div className="relative mb-3">
            <Search className="w-4 h-4 absolute left-2 top-2 text-gray-400" />
            <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search docs..." className="w-full pl-8 pr-3 py-1.5 text-sm border rounded-lg bg-white" />
          </div>
          <button onClick={() => setShowNewForm(!showNewForm)} className="w-full py-2 bg-gray-800 text-white text-sm rounded-lg mb-2 hover:bg-gray-700 flex items-center justify-center gap-1">
            <Plus className="w-4 h-4" /> New Document
          </button>
          {showNewForm && (
            <div className="mb-3 space-y-2">
              <input value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="Document title..." className="w-full px-3 py-1.5 text-sm border rounded-lg" onKeyDown={e => e.key === "Enter" && handleCreate()} />
              <button onClick={handleCreate} disabled={creating} className="w-full py-1.5 bg-blue-600 text-white text-xs rounded-lg disabled:opacity-50">
                {creating ? "Creating..." : "Create"}
              </button>
            </div>
          )}
          <button onClick={() => setShowImport(!showImport)} className="w-full py-1.5 text-gray-600 text-xs rounded-lg mb-2 hover:bg-gray-100 flex items-center justify-center gap-1">
            <Upload className="w-3 h-3" /> Import by URL
          </button>
          {showImport && (
            <div className="mb-3 space-y-2">
              <input value={importUrl} onChange={e => setImportUrl(e.target.value)} placeholder="Google Docs URL..." className="w-full px-3 py-1.5 text-sm border rounded-lg" />
              <button onClick={handleImport} className="w-full py-1.5 bg-green-600 text-white text-xs rounded-lg">Import</button>
            </div>
          )}
          <div className="text-xs font-semibold text-gray-500 mb-2">Recent Documents</div>
          <div className="space-y-1 max-h-[300px] overflow-y-auto">
            {filteredDocs.map(doc => (
              <button key={doc.id} onClick={() => setSelectedDoc(doc)} className={`w-full text-left px-2 py-1.5 rounded-lg text-xs transition-colors ${selectedDoc?.id === doc.id ? "bg-blue-100 text-blue-800" : "hover:bg-gray-100 text-gray-700"}`}>
                <div className="font-medium truncate">{doc.title}</div>
                <div className="text-gray-400">{new Date(doc.created_at).toLocaleDateString()}</div>
              </button>
            ))}
            {filteredDocs.length === 0 && <p className="text-xs text-gray-400 text-center py-4">No documents yet</p>}
          </div>
        </div>

        {/* Main Panel */}
        <div className="flex-1 rounded-xl overflow-hidden" style={{ border: "2px solid #333", background: "#fff" }}>
          {selectedDoc ? (
            <div className="h-full flex flex-col">
              <div className="flex items-center justify-between p-3 bg-gray-50 border-b">
                <h3 className="font-semibold text-sm truncate">{selectedDoc.title}</h3>
                <a href={selectedDoc.google_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-blue-600 hover:underline">
                  <ExternalLink className="w-3 h-3" /> Open in Google
                </a>
              </div>
              <iframe src={selectedDoc.google_url} className="flex-1 w-full min-h-[500px]" sandbox="allow-same-origin allow-scripts allow-popups allow-forms" />
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-400 text-sm min-h-[500px]">
              Select a document or create a new one
            </div>
          )}
        </div>

        {/* Right Sync Panel */}
        <div className="w-full lg:w-72 shrink-0 rounded-xl p-4" style={{ background: "linear-gradient(145deg, #faf9f6, #f0ede6)", border: "2px solid #2a2a2a" }}>
          <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
            <RefreshCw className="w-4 h-4" /> YsUp Sync
          </h3>
          {selectedDoc ? (
            <div>
              <p className="text-xs text-gray-500 mb-2">Write content below and sync it into your Google Doc:</p>
              <textarea
                value={syncContent}
                onChange={e => setSyncContent(e.target.value)}
                placeholder="Type your content here..."
                className="w-full h-48 p-3 text-sm border rounded-lg resize-none focus:ring-2 focus:ring-blue-300 focus:outline-none"
                style={{ fontFamily: "'Georgia', serif", lineHeight: "1.6", backgroundImage: "repeating-linear-gradient(transparent, transparent 23px, #e8e4da 23px, #e8e4da 24px)", backgroundSize: "100% 24px", paddingTop: "8px" }}
              />
              <button onClick={handleSync} disabled={syncing || !syncContent.trim()} className="w-full py-2 bg-amber-600 text-white text-sm rounded-lg mt-2 hover:bg-amber-500 disabled:opacity-50 flex items-center justify-center gap-2">
                <RefreshCw className={`w-4 h-4 ${syncing ? "animate-spin" : ""}`} />
                {syncing ? "Syncing..." : "Sync to Google Doc"}
              </button>
              {syncStatus && <p className={`text-xs mt-2 text-center ${syncStatus.includes("success") ? "text-green-600" : "text-red-500"}`}>{syncStatus}</p>}
            </div>
          ) : (
            <p className="text-xs text-gray-400 text-center py-8">Select a document to enable sync</p>
          )}
        </div>
      </div>
    </div>
  )
}
