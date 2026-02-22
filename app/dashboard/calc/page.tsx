"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Header from "@/components/Header"
import { useAuth } from "@/lib/useAuth"
import { ArrowLeft, Plus, Search, ExternalLink, Upload, RefreshCw } from "lucide-react"

export default function CalcWorkspacePage() {
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
  const [gridRows, setGridRows] = useState(5)
  const [gridCols, setGridCols] = useState(5)
  const [gridData, setGridData] = useState<string[][]>(
    Array.from({ length: 5 }, () => Array.from({ length: 5 }, () => ""))
  )
  const [syncRange, setSyncRange] = useState("A1")

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
    const res = await fetch(`/api/workspace/recent?userId=${userId}&type=calc`)
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
        body: JSON.stringify({ userId, type: "calc", title: newTitle }),
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
        body: JSON.stringify({ userId, type: "calc", googleUrl: importUrl }),
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

  const updateCell = (row: number, col: number, value: string) => {
    setGridData(prev => {
      const newData = prev.map(r => [...r])
      newData[row][col] = value
      return newData
    })
  }

  const getColLetter = (i: number) => String.fromCharCode(65 + i)

  const handleSync = async () => {
    if (!selectedDoc) return
    const userId = getUserId()
    if (!userId) return
    const hasData = gridData.some(row => row.some(cell => cell.trim()))
    if (!hasData) return
    setSyncing(true)
    setSyncStatus("")
    const endCol = getColLetter(gridCols - 1)
    const range = `${syncRange}:${endCol}${gridRows}`
    try {
      const res = await fetch("/api/workspace/sync/calc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, sheetId: selectedDoc.google_file_id, range, values: gridData }),
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
        <div className="w-full lg:w-64 shrink-0 rounded-xl p-4" style={{ background: "linear-gradient(145deg, #f0f4f0, #e4ece4)", border: "2px solid #2a5a2a" }}>
          <button onClick={() => router.push("/dashboard")} className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4 text-sm">
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </button>
          <h2 className="font-bold text-gray-800 text-lg mb-3 flex items-center gap-2">📊 YsUp Calc</h2>
          <div className="relative mb-3">
            <Search className="w-4 h-4 absolute left-2 top-2 text-gray-400" />
            <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search sheets..." className="w-full pl-8 pr-3 py-1.5 text-sm border rounded-lg bg-white" />
          </div>
          <button onClick={() => setShowNewForm(!showNewForm)} className="w-full py-2 bg-green-700 text-white text-sm rounded-lg mb-2 hover:bg-green-600 flex items-center justify-center gap-1">
            <Plus className="w-4 h-4" /> New Spreadsheet
          </button>
          {showNewForm && (
            <div className="mb-3 space-y-2">
              <input value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="Sheet title..." className="w-full px-3 py-1.5 text-sm border rounded-lg" onKeyDown={e => e.key === "Enter" && handleCreate()} />
              <button onClick={handleCreate} disabled={creating} className="w-full py-1.5 bg-blue-600 text-white text-xs rounded-lg disabled:opacity-50">{creating ? "Creating..." : "Create"}</button>
            </div>
          )}
          <button onClick={() => setShowImport(!showImport)} className="w-full py-1.5 text-gray-600 text-xs rounded-lg mb-2 hover:bg-gray-100 flex items-center justify-center gap-1">
            <Upload className="w-3 h-3" /> Import by URL
          </button>
          {showImport && (
            <div className="mb-3 space-y-2">
              <input value={importUrl} onChange={e => setImportUrl(e.target.value)} placeholder="Google Sheets URL..." className="w-full px-3 py-1.5 text-sm border rounded-lg" />
              <button onClick={handleImport} className="w-full py-1.5 bg-green-600 text-white text-xs rounded-lg">Import</button>
            </div>
          )}
          <div className="text-xs font-semibold text-gray-500 mb-2">Recent Sheets</div>
          <div className="space-y-1 max-h-[300px] overflow-y-auto">
            {filteredDocs.map(doc => (
              <button key={doc.id} onClick={() => setSelectedDoc(doc)} className={`w-full text-left px-2 py-1.5 rounded-lg text-xs transition-colors ${selectedDoc?.id === doc.id ? "bg-green-100 text-green-800" : "hover:bg-gray-100 text-gray-700"}`}>
                <div className="font-medium truncate">{doc.title}</div>
                <div className="text-gray-400">{new Date(doc.created_at).toLocaleDateString()}</div>
              </button>
            ))}
            {filteredDocs.length === 0 && <p className="text-xs text-gray-400 text-center py-4">No sheets yet</p>}
          </div>
        </div>

        {/* Main Panel */}
        <div className="flex-1 rounded-xl overflow-hidden" style={{ border: "2px solid #2a5a2a", background: "#fff" }}>
          {selectedDoc ? (
            <div className="h-full flex flex-col">
              <div className="flex items-center justify-between p-3 bg-green-50 border-b">
                <h3 className="font-semibold text-sm truncate">{selectedDoc.title}</h3>
                <a href={selectedDoc.google_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-green-600 hover:underline">
                  <ExternalLink className="w-3 h-3" /> Open in Google
                </a>
              </div>
              <iframe src={selectedDoc.google_preview_url || selectedDoc.google_url?.replace(/\/edit.*$/, '/preview')} className="flex-1 w-full min-h-[500px]" sandbox="allow-same-origin allow-scripts allow-popups allow-forms" />
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-400 text-sm min-h-[500px]">
              Select a spreadsheet or create a new one
            </div>
          )}
        </div>

        {/* Right Sync Panel */}
        <div className="w-full lg:w-80 shrink-0 rounded-xl p-4" style={{ background: "linear-gradient(145deg, #f0f4f0, #e8ece8)", border: "2px solid #2a5a2a" }}>
          <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
            <RefreshCw className="w-4 h-4" /> YsUp Sync
          </h3>
          {selectedDoc ? (
            <div>
              <p className="text-xs text-gray-500 mb-2">Enter data in the grid below and sync to Google Sheets:</p>
              <div className="flex items-center gap-2 mb-2">
                <label className="text-xs text-gray-500">Start at:</label>
                <input value={syncRange} onChange={e => setSyncRange(e.target.value)} className="w-16 px-2 py-1 text-xs border rounded" />
              </div>
              <div className="overflow-auto max-h-[300px] border rounded-lg">
                <table className="text-xs w-full">
                  <thead>
                    <tr>
                      <th className="bg-gray-100 border px-1 py-0.5 w-6"></th>
                      {Array.from({ length: gridCols }, (_, i) => (
                        <th key={i} className="bg-gray-100 border px-2 py-0.5 font-bold text-gray-600">{getColLetter(i)}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {Array.from({ length: gridRows }, (_, row) => (
                      <tr key={row}>
                        <td className="bg-gray-100 border px-1 py-0.5 text-center font-bold text-gray-600">{row + 1}</td>
                        {Array.from({ length: gridCols }, (_, col) => (
                          <td key={col} className="border p-0">
                            <input
                              value={gridData[row]?.[col] || ""}
                              onChange={e => updateCell(row, col, e.target.value)}
                              className="w-full px-1 py-0.5 text-xs border-0 focus:ring-1 focus:ring-green-300 focus:outline-none"
                            />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex gap-2 mt-2">
                <button onClick={() => { setGridRows(r => r + 1); setGridData(prev => [...prev, Array(gridCols).fill("")]) }} className="text-[10px] text-green-600 hover:underline">+ Row</button>
                <button onClick={() => { setGridCols(c => c + 1); setGridData(prev => prev.map(r => [...r, ""])) }} className="text-[10px] text-green-600 hover:underline">+ Column</button>
              </div>
              <button onClick={handleSync} disabled={syncing} className="w-full py-2 bg-green-700 text-white text-sm rounded-lg mt-3 hover:bg-green-600 disabled:opacity-50 flex items-center justify-center gap-2">
                <RefreshCw className={`w-4 h-4 ${syncing ? "animate-spin" : ""}`} />
                {syncing ? "Syncing..." : "Sync to Google Sheets"}
              </button>
              {syncStatus && <p className={`text-xs mt-2 text-center ${syncStatus.includes("success") ? "text-green-600" : "text-red-500"}`}>{syncStatus}</p>}
            </div>
          ) : (
            <p className="text-xs text-gray-400 text-center py-8">Select a sheet to enable sync</p>
          )}
        </div>
      </div>
    </div>
  )
}
