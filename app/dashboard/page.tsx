"use client"

import type React from "react"

import { useState, useRef, useEffect, useCallback } from "react"
import dynamic from "next/dynamic"
import Header from "@/components/Header"
import { useAuth } from "@/lib/useAuth"

const PdfViewer = dynamic(() => import("@/components/PdfViewer"), { ssr: false, loading: () => <div className="text-white p-12">Loading PDF viewer...</div> })
const PdfThumbnail = dynamic(() => import("@/components/PdfThumbnail"), { ssr: false, loading: () => <div className="w-full h-full bg-gray-100 animate-pulse" /> })

import {
  Upload,
  Download,
  ThumbsUp,
  MessageCircle,
  X,
  Plus,
  Calendar,
  BookOpen,
  User,
  Trash2,
  Folder,
  FileText,
  StickyNoteIcon,
  Search,
  Users,
  Globe,
  Lock,
  Link2,
  Copy,
  Check,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"

interface PDFFile {
  id: string
  name: string
  thumbnail: string
  type: "pdf" | "doc" | "ppt" | "bluebook" | "notebook" | "note"
  position: { x: number; y: number; rotation: number }
  sharedBy?: string
  course?: string
  fileData?: string
}

interface Post {
  id: string
  author: string
  content: string
  timestamp: string
  cosigns: number
  responses: Response[]
  course: string
}

interface Response {
  id: string
  author: string
  content: string
  timestamp: string
}

interface StickyNote {
  id: string
  content: string
  position: { x: number; y: number; rotation: number }
  lastModified: string
}

export default function DashboardPage() {
  const { isAuthenticated, isLoading } = useAuth()
  const [currentFileIndex, setCurrentFileIndex] = useState(0)
  const [showNotebook, setShowNotebook] = useState(false)
  const [showBluebook, setShowBluebook] = useState(false)
  const [noteText, setNoteText] = useState("Do we have class tomorrow?....")
  const [selectedClassmate, setSelectedClassmate] = useState("Select classmate(s)")
  const [selectedCourse, setSelectedCourse] = useState("Calculus 2")
  const [currentPostPage, setCurrentPostPage] = useState(0)
  const [expandedResponses, setExpandedResponses] = useState<string[]>([])
  const [newResponse, setNewResponse] = useState<{ [key: string]: string }>({})
  const [userYBucks, setUserYBucks] = useState(950)
  const [currentUser, setCurrentUser] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    username: "",
    college: "",
  })
  const fileInputRef = useRef<HTMLInputElement>(null)
  const profileImageInputRef = useRef<HTMLInputElement>(null)
  const [uploadingProfileImage, setUploadingProfileImage] = useState(false)
  const [dashboardPage, setDashboardPage] = useState(0)
  const [itemsPerPage, setItemsPerPage] = useState(12)

  // Welcome message for new users
  const [showWelcome, setShowWelcome] = useState(false)

  // Add these new state variables after the existing useState declarations:
  const [showProfile, setShowProfile] = useState(false)
  const [profileData, setProfileData] = useState({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    phone: "",
    college: "",
    major: "",
    year: "",
    bio: "",
    profileImage: "/placeholder.svg?height=150&width=150",
  })
  const [fileSearchQuery, setFileSearchQuery] = useState("")

  const [showFileViewer, setShowFileViewer] = useState(false)
  const [selectedFile, setSelectedFile] = useState<PDFFile | null>(null)
  const [pdfNumPages, setPdfNumPages] = useState(0)
  const [pdfCurrentSpread, setPdfCurrentSpread] = useState(0)

  const [stickyNotes, setStickyNotes] = useState<StickyNote[]>([])

  useEffect(() => {
    const storedUser = localStorage.getItem("currentUser")
    if (storedUser) {
      const userData = JSON.parse(storedUser)
      if (userData.id) {
        fetch(`/api/notes?userId=${userData.id}`)
          .then((r) => r.json())
          .then((dbNotes) => {
            if (Array.isArray(dbNotes)) {
              setStickyNotes(dbNotes)
            }
          })
          .catch(() => {})
      }
    }
  }, [])

  const [showStickyNote, setShowStickyNote] = useState(false)
  const [selectedNote, setSelectedNote] = useState<StickyNote | null>(null)
  const [noteContent, setNoteContent] = useState("")

  const [moveMode, setMoveMode] = useState(false)
  const [showRecycleBin, setShowRecycleBin] = useState(false)
  const [recycleBin, setRecycleBin] = useState<PDFFile[]>([])
  const [draggedItem, setDraggedItem] = useState<string | null>(null)
  const [folders, setFolders] = useState<
    { id: string; name: string; position: { x: number; y: number; rotation: number }; files: string[] }[]
  >([])
  const [dragOverTrash, setDragOverTrash] = useState(false)
  const [dragOverFolder, setDragOverFolder] = useState<string | null>(null)
  const [isDraggingExternalFile, setIsDraggingExternalFile] = useState(false)
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [storageInfo, setStorageInfo] = useState<{ usedMB: number; limitMB: number; tier: string } | null>(null)

  const [showCreateFolder, setShowCreateFolder] = useState(false)
  const [newFolderName, setNewFolderName] = useState("")
  const [showFolderView, setShowFolderView] = useState(false)
  const [selectedFolder, setSelectedFolder] = useState<{ id: string; name: string; files: string[] } | null>(null)
  const [showRenameFolderModal, setShowRenameFolderModal] = useState(false)
  const [renameFolderValue, setRenameFolderValue] = useState("")

  // Add this state for mouse tracking
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const updateItemsPerPage = () => {
      if (window.innerWidth < 640) setItemsPerPage(6)
      else if (window.innerWidth < 1024) setItemsPerPage(9)
      else setItemsPerPage(12)
    }
    updateItemsPerPage()
    window.addEventListener("resize", updateItemsPerPage)
    return () => window.removeEventListener("resize", updateItemsPerPage)
  }, [])

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    if (urlParams.get("welcome") === "true") {
      setShowWelcome(true)
      // Remove the parameter from URL
      window.history.replaceState({}, "", "/dashboard")
    }
  }, [])

  useEffect(() => {
    const storedUser = localStorage.getItem("currentUser")
    if (storedUser) {
      const userData = JSON.parse(storedUser)
      setCurrentUser({
        firstName: userData.firstName || "",
        lastName: userData.lastName || "",
        phone: userData.phone || "",
        username: userData.username || "",
        college: userData.college || "",
      })
      setProfileData((prev) => ({
        ...prev,
        firstName: userData.firstName || "",
        lastName: userData.lastName || "",
        username: userData.username || "",
        email: userData.email || "",
        phone: userData.phone || "",
        college: userData.college || "",
        major: userData.major || "",
        year: userData.year || "",
        bio: userData.bio || "",
        profileImage: userData.profileImage || prev.profileImage,
      }))

      if (userData.id) {
        fetch(`/api/profile-image?userId=${userData.id}`)
          .then(r => r.json())
          .then(d => {
            if (d.success && d.profileImage) {
              setProfileData(prev => ({ ...prev, profileImage: d.profileImage }))
            }
          })
          .catch(() => {})
      }
    }
  }, [])

  // Add this effect to track mouse position during drag
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (moveMode && draggedItem) {
        setMousePosition({ x: e.clientX, y: e.clientY })
      }
    }

    if (moveMode && draggedItem) {
      document.addEventListener("mousemove", handleMouseMove)
      return () => document.removeEventListener("mousemove", handleMouseMove)
    }
  }, [moveMode, draggedItem])

  const defaultFiles: PDFFile[] = [
    {
      id: "bluebook",
      name: "YsUp Bluebook",
      thumbnail: "/placeholder.svg?height=200&width=150",
      type: "bluebook",
      position: { x: 30, y: 15, rotation: -2 },
    },
    {
      id: "notebook",
      name: "Class Network",
      thumbnail: "/placeholder.svg?height=200&width=150",
      type: "notebook",
      position: { x: 50, y: 15, rotation: 1 },
    },
  ]
  const [allFiles, setAllFiles] = useState<PDFFile[]>(defaultFiles)

  useEffect(() => {
    const storedUser = localStorage.getItem("currentUser")
    if (storedUser) {
      const userData = JSON.parse(storedUser)
      if (userData.id) {
        fetch(`/api/files?userId=${userData.id}`)
          .then((r) => r.json())
          .then((dbFiles) => {
            if (Array.isArray(dbFiles)) {
              setAllFiles([...defaultFiles, ...dbFiles])
            }
          })
          .catch(() => {})
        fetch(`/api/storage?userId=${userData.id}`)
          .then((r) => r.json())
          .then((info) => setStorageInfo(info))
          .catch(() => {})
      }
    }
  }, [])

  const [userLevel, setUserLevel] = useState(1)
  const [showCreatePost, setShowCreatePost] = useState(false)
  const [newPostContent, setNewPostContent] = useState("")

  // Class Networks - API-backed state
  interface NetworkData {
    id: number
    name: string
    slug: string
    description: string
    type: string
    privacy: string
    member_count: number
    is_moderator: boolean
    mod_first_name: string
    mod_last_name: string
  }
  const [myNetworks, setMyNetworks] = useState<NetworkData[]>([])
  const [networksLoading, setNetworksLoading] = useState(false)
  const [showCreateNetwork, setShowCreateNetwork] = useState(false)
  const [showSearchNetworks, setShowSearchNetworks] = useState(false)
  const [searchNetworkQuery, setSearchNetworkQuery] = useState("")
  const [searchNetworkResults, setSearchNetworkResults] = useState<NetworkData[]>([])
  const [searchingNetworks, setSearchingNetworks] = useState(false)
  const [newNetwork, setNewNetwork] = useState({
    name: "",
    description: "",
    type: "class" as "club" | "organization" | "class",
    privacy: "public" as "public" | "private",
  })
  const [creatingNetwork, setCreatingNetwork] = useState(false)
  const [inviteLinkCopied, setInviteLinkCopied] = useState("")
  const [joiningNetwork, setJoiningNetwork] = useState("")

  const fetchMyNetworks = async () => {
    const storedUser = localStorage.getItem("currentUser")
    if (!storedUser) return
    const userData = JSON.parse(storedUser)
    if (!userData.id) return
    setNetworksLoading(true)
    try {
      const res = await fetch(`/api/networks/mine?userId=${userData.id}`)
      const data = await res.json()
      if (data.success) {
        setMyNetworks(data.networks)
      }
    } catch (err) {
      console.error("Failed to fetch networks:", err)
    } finally {
      setNetworksLoading(false)
    }
  }

  useEffect(() => {
    if (showNotebook) {
      fetchMyNetworks()
    }
  }, [showNotebook])

  const handleCreateNetwork = async () => {
    const storedUser = localStorage.getItem("currentUser")
    if (!storedUser) return
    const userData = JSON.parse(storedUser)
    if (!newNetwork.name.trim() || !newNetwork.description.trim()) return
    setCreatingNetwork(true)
    try {
      const res = await fetch("/api/networks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...newNetwork, userId: userData.id }),
      })
      const data = await res.json()
      if (data.success) {
        setShowCreateNetwork(false)
        setNewNetwork({ name: "", description: "", type: "class", privacy: "public" })
        fetchMyNetworks()
      } else {
        alert(data.message || "Failed to create network")
      }
    } catch (err) {
      console.error("Create network error:", err)
      alert("Something went wrong. Please try again.")
    } finally {
      setCreatingNetwork(false)
    }
  }

  const handleSearchNetworks = async (query?: string) => {
    const q = query ?? searchNetworkQuery
    if (!q.trim()) {
      setSearchNetworkResults([])
      return
    }
    setSearchingNetworks(true)
    try {
      const res = await fetch(`/api/networks/search?query=${encodeURIComponent(q)}`)
      const data = await res.json()
      if (data.success) {
        setSearchNetworkResults(data.networks)
      }
    } catch (err) {
      console.error("Search networks error:", err)
    } finally {
      setSearchingNetworks(false)
    }
  }

  const handleJoinNetwork = async (slug: string) => {
    const storedUser = localStorage.getItem("currentUser")
    if (!storedUser) return
    const userData = JSON.parse(storedUser)
    setJoiningNetwork(slug)
    try {
      const res = await fetch(`/api/networks/${slug}/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: userData.id }),
      })
      const data = await res.json()
      if (data.success) {
        if (data.joined) {
          alert("You've joined the network!")
          fetchMyNetworks()
          handleSearchNetworks()
        } else if (data.requested) {
          alert("Join request sent! The moderator will review it.")
          handleSearchNetworks()
        }
      }
    } catch (err) {
      console.error("Join network error:", err)
    } finally {
      setJoiningNetwork("")
    }
  }

  const copyInviteLink = (slug: string) => {
    const domain = window.location.origin
    navigator.clipboard.writeText(`${domain}/invite/network/${slug}`)
    setInviteLinkCopied(slug)
    setTimeout(() => setInviteLinkCopied(""), 2000)
  }

  interface CalendarEvent {
    id: number
    title: string
    description: string | null
    event_date: string
    event_time: string
    location: string | null
    creator_id: number
    creator_first_name: string
    creator_last_name: string
    creator_username: string
    total_invited: string
    going_count: string
    maybe_count: string
    not_going_count: string
    my_rsvp: string | null
  }

  interface NetworkForInvite {
    id: number
    name: string
    slug: string
    type: string
    member_count: string
  }

  interface NetworkMember {
    id: number
    first_name: string
    last_name: string
    username: string
  }

  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([])
  const [eventsLoading, setEventsLoading] = useState(false)
  const [pendingInvites, setPendingInvites] = useState<any[]>([])

  const [showCreateEvent, setShowCreateEvent] = useState(false)
  const [newEvent, setNewEvent] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    location: "",
    selectedNetworkIds: [] as number[],
    selectedUserIds: [] as number[],
  })
  const [inviteNetworks, setInviteNetworks] = useState<NetworkForInvite[]>([])
  const [networkMembers, setNetworkMembers] = useState<{ [networkId: number]: NetworkMember[] }>({})
  const [expandedNetwork, setExpandedNetwork] = useState<number | null>(null)
  const [creatingEvent, setCreatingEvent] = useState(false)
  const [rsvpingEvent, setRsvpingEvent] = useState<number | null>(null)

  const fetchCalendarEvents = async () => {
    const storedUser = localStorage.getItem("currentUser")
    if (!storedUser) return
    const userData = JSON.parse(storedUser)
    if (!userData.id) return
    setEventsLoading(true)
    try {
      const res = await fetch(`/api/events?userId=${userData.id}`)
      const data = await res.json()
      if (data.success) setCalendarEvents(data.events)
    } catch (err) {
      console.error("Fetch events error:", err)
    } finally {
      setEventsLoading(false)
    }
  }

  const fetchPendingInvites = async () => {
    const storedUser = localStorage.getItem("currentUser")
    if (!storedUser) return
    const userData = JSON.parse(storedUser)
    if (!userData.id) return
    try {
      const res = await fetch(`/api/events/invites?userId=${userData.id}`)
      const data = await res.json()
      if (data.success) setPendingInvites(data.invites)
    } catch (err) {
      console.error("Fetch invites error:", err)
    }
  }

  const fetchInviteNetworks = async () => {
    const storedUser = localStorage.getItem("currentUser")
    if (!storedUser) return
    const userData = JSON.parse(storedUser)
    if (!userData.id) return
    try {
      const res = await fetch(`/api/events/network-members?userId=${userData.id}`)
      const data = await res.json()
      if (data.success) setInviteNetworks(data.networks)
    } catch (err) {
      console.error("Fetch invite networks error:", err)
    }
  }

  const fetchNetworkMembers = async (networkId: number) => {
    const storedUser = localStorage.getItem("currentUser")
    if (!storedUser) return
    const userData = JSON.parse(storedUser)
    if (!userData.id) return
    try {
      const res = await fetch(`/api/events/network-members?userId=${userData.id}&networkId=${networkId}`)
      const data = await res.json()
      if (data.success) {
        setNetworkMembers(prev => ({ ...prev, [networkId]: data.members }))
      }
    } catch (err) {
      console.error("Fetch members error:", err)
    }
  }

  useEffect(() => {
    if (showBluebook) {
      fetchCalendarEvents()
      fetchPendingInvites()
    }
  }, [showBluebook])

  useEffect(() => {
    if (showCreateEvent) {
      fetchInviteNetworks()
    }
  }, [showCreateEvent])

  const nextFile = () => {
    setCurrentFileIndex((prev) => (prev + 1) % allFiles.length)
  }

  const prevFile = () => {
    setCurrentFileIndex((prev) => (prev - 1 + allFiles.length) % allFiles.length)
  }

  const handleExternalFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDraggingExternalFile(false)
    if (e.dataTransfer.getData("text/plain")) return
    const files = e.dataTransfer.files
    if (files.length > 0) {
      const file = files[0]
      const validTypes = [".pdf", ".doc", ".docx", ".ppt", ".pptx"]
      const isValid = validTypes.some((ext) => file.name.toLowerCase().endsWith(ext))
      if (!isValid) return

      const fakeEvent = {
        target: { files: [file] },
      } as unknown as React.ChangeEvent<HTMLInputElement>
      handleFileUpload(fakeEvent)
    }
  }

  const handleExternalDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.dataTransfer.types.includes("Files")) {
      setIsDraggingExternalFile(true)
    }
  }

  const handleExternalDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDraggingExternalFile(false)
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = async (ev) => {
        const dataUrl = ev.target?.result as string
        const fileType = file.type.includes("pdf") ? "pdf" : file.name.endsWith(".ppt") || file.name.endsWith(".pptx") ? "ppt" : "doc"
        const position = { x: Math.random() * 60 + 10, y: Math.random() * 40 + 50, rotation: Math.random() * 10 - 5 }

        const storedUser = localStorage.getItem("currentUser")
        const userId = storedUser ? JSON.parse(storedUser).id : null

        if (userId) {
          try {
            const res = await fetch("/api/files", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                userId,
                name: file.name,
                type: fileType,
                fileData: dataUrl,
                thumbnail: "",
                position,
              }),
            })
            const result = await res.json()
            if (result.success) {
              const newFile: PDFFile = {
                id: result.id,
                name: file.name,
                thumbnail: "",
                type: fileType as PDFFile["type"],
                position,
                fileData: dataUrl,
              }
              setAllFiles((prev) => [...prev, newFile])
              fetch(`/api/storage?userId=${userId}`)
                .then((r) => r.json())
                .then((info) => setStorageInfo(info))
                .catch(() => {})
            } else if (result.error === "storage_limit_exceeded") {
              setShowUpgradeModal(true)
            }
          } catch {
            const newFile: PDFFile = {
              id: Date.now().toString(),
              name: file.name,
              thumbnail: "",
              type: fileType as PDFFile["type"],
              position,
              fileData: dataUrl,
            }
            setAllFiles((prev) => [...prev, newFile])
          }
        } else {
          const newFile: PDFFile = {
            id: Date.now().toString(),
            name: file.name,
            thumbnail: "",
            type: fileType as PDFFile["type"],
            position,
            fileData: dataUrl,
          }
          setAllFiles((prev) => [...prev, newFile])
        }
      }
      reader.readAsDataURL(file)
    }
  }

  const handleFileClick = async (file: PDFFile) => {
    if (file.type === "bluebook") {
      setShowBluebook(true)
    } else if (file.type === "notebook") {
      setShowNotebook(true)
    } else {
      if ((file as any).fromDb && !file.fileData) {
        const storedUser = localStorage.getItem("currentUser")
        const userId = storedUser ? JSON.parse(storedUser).id : null
        if (userId) {
          try {
            const res = await fetch(`/api/files?userId=${userId}&fileId=${file.id}`)
            const data = await res.json()
            if (data.fileData) {
              const updatedFile = { ...file, fileData: data.fileData }
              setAllFiles((prev) => prev.map((f) => (f.id === file.id ? updatedFile : f)))
              setSelectedFile(updatedFile)
              setShowFileViewer(true)
              return
            }
          } catch {}
        }
      }
      setSelectedFile(file)
      setShowFileViewer(true)
    }
  }

  const getProgressToNextLevel = () => {
    const currentLevelStart = (userLevel - 1) * 1000
    const nextLevelStart = userLevel * 1000
    const progress = userYBucks - currentLevelStart
    const total = nextLevelStart - currentLevelStart
    return { progress, total, percentage: (progress / total) * 100 }
  }

  const checkLevelUp = (newYBucks: number) => {
    const newLevel = Math.floor(newYBucks / 1000) + 1
    if (newLevel > userLevel) {
      setUserLevel(newLevel)
      alert(`🎉 Level Up! You've reached Level ${newLevel}!`)
    }
  }

  const handleCreatePost = () => {
    setNewPostContent("")
    setShowCreatePost(false)
  }

  const handleCreateStickyNote = async () => {
    const position = {
      x: Math.random() * 30 + 60,
      y: Math.random() * 30 + 50,
      rotation: Math.random() * 20 - 10,
    }
    const content = "New note..."
    const storedUser = localStorage.getItem("currentUser")
    const userId = storedUser ? JSON.parse(storedUser).id : null

    if (userId) {
      try {
        const res = await fetch("/api/notes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId, content, position }),
        })
        const result = await res.json()
        if (result.success) {
          const newNote: StickyNote = {
            id: result.id,
            content,
            position,
            lastModified: result.lastModified,
          }
          setStickyNotes((prev) => [...prev, newNote])
          return
        }
      } catch {}
    }
    const newNote: StickyNote = {
      id: Date.now().toString(),
      content,
      position,
      lastModified: new Date().toISOString().slice(0, 16).replace("T", " "),
    }
    setStickyNotes((prev) => [...prev, newNote])
  }

  const handleStickyNoteClick = (note: StickyNote) => {
    setSelectedNote(note)
    setNoteContent(note.content)
    setShowStickyNote(true)
  }

  const handleSaveNote = async () => {
    if (selectedNote) {
      const newLastModified = new Date().toISOString().slice(0, 16).replace("T", " ")
      const updatedNotes = stickyNotes.map((note) =>
        note.id === selectedNote.id
          ? { ...note, content: noteContent, lastModified: newLastModified }
          : note,
      )
      setStickyNotes(updatedNotes)

      const storedUser = localStorage.getItem("currentUser")
      const userId = storedUser ? JSON.parse(storedUser).id : null
      if (userId) {
        fetch("/api/notes", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ noteId: selectedNote.id, userId, content: noteContent }),
        }).catch(() => {})
      }
    }
    setShowStickyNote(false)
    setSelectedNote(null)
    setNoteContent("")
  }

  const handleDeleteNote = () => {
    if (selectedNote) {
      setStickyNotes(stickyNotes.filter((note) => note.id !== selectedNote.id))

      const storedUser = localStorage.getItem("currentUser")
      const userId = storedUser ? JSON.parse(storedUser).id : null
      if (userId) {
        fetch(`/api/notes?noteId=${selectedNote.id}&userId=${userId}`, { method: "DELETE" }).catch(() => {})
      }
    }
    setShowStickyNote(false)
    setSelectedNote(null)
    setNoteContent("")
  }

  const toggleNetworkInvite = (networkId: number) => {
    setNewEvent(prev => ({
      ...prev,
      selectedNetworkIds: prev.selectedNetworkIds.includes(networkId)
        ? prev.selectedNetworkIds.filter(id => id !== networkId)
        : [...prev.selectedNetworkIds, networkId],
    }))
  }

  const toggleUserInvite = (userId: number) => {
    setNewEvent(prev => ({
      ...prev,
      selectedUserIds: prev.selectedUserIds.includes(userId)
        ? prev.selectedUserIds.filter(id => id !== userId)
        : [...prev.selectedUserIds, userId],
    }))
  }

  const handleExpandNetwork = async (networkId: number) => {
    if (expandedNetwork === networkId) {
      setExpandedNetwork(null)
      return
    }
    setExpandedNetwork(networkId)
    if (!networkMembers[networkId]) {
      await fetchNetworkMembers(networkId)
    }
  }

  const handleCreateEvent = async () => {
    if (!newEvent.title || !newEvent.time || !newEvent.date) return
    const storedUser = localStorage.getItem("currentUser")
    if (!storedUser) return
    const userData = JSON.parse(storedUser)
    if (!userData.id) return

    setCreatingEvent(true)
    try {
      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newEvent.title,
          description: newEvent.description,
          eventDate: newEvent.date,
          eventTime: newEvent.time,
          location: newEvent.location,
          creatorId: userData.id,
          inviteNetworkIds: newEvent.selectedNetworkIds,
          inviteUserIds: newEvent.selectedUserIds,
        }),
      })
      const data = await res.json()
      if (data.success) {
        setNewEvent({ title: "", description: "", date: "", time: "", location: "", selectedNetworkIds: [], selectedUserIds: [] })
        setShowCreateEvent(false)
        setExpandedNetwork(null)
        fetchCalendarEvents()
      } else {
        alert(data.message || "Failed to create event")
      }
    } catch (err) {
      console.error("Create event error:", err)
    } finally {
      setCreatingEvent(false)
    }
  }

  const handleRsvp = async (eventId: number, rsvp: string) => {
    const storedUser = localStorage.getItem("currentUser")
    if (!storedUser) return
    const userData = JSON.parse(storedUser)
    if (!userData.id) return

    setRsvpingEvent(eventId)
    try {
      const res = await fetch("/api/events/rsvp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventId, userId: userData.id, rsvp }),
      })
      const data = await res.json()
      if (data.success) {
        fetchCalendarEvents()
        fetchPendingInvites()
      }
    } catch (err) {
      console.error("RSVP error:", err)
    } finally {
      setRsvpingEvent(null)
    }
  }

  const handleDeleteEvent = async (eventId: number) => {
    const storedUser = localStorage.getItem("currentUser")
    if (!storedUser) return
    const userData = JSON.parse(storedUser)
    if (!userData.id) return

    if (!confirm("Are you sure you want to delete this event?")) return

    try {
      const res = await fetch("/api/events/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventId, userId: userData.id }),
      })
      const data = await res.json()
      if (data.success) {
        fetchCalendarEvents()
      }
    } catch (err) {
      console.error("Delete event error:", err)
    }
  }

  const formatEventDate = (dateStr: string) => {
    const d = new Date(dateStr + "T00:00:00")
    return d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })
  }

  const formatEventTime = (timeStr: string) => {
    const [h, m] = timeStr.split(":")
    const hour = parseInt(h)
    const ampm = hour >= 12 ? "PM" : "AM"
    const h12 = hour % 12 || 12
    return `${h12}:${m} ${ampm}`
  }

  const handleCosign = (_postId: string) => {}
  const handleAddResponse = (_postId: string) => {}

  const toggleResponses = (postId: string) => {
    if (expandedResponses.includes(postId)) {
      setExpandedResponses(expandedResponses.filter((id) => id !== postId))
    } else {
      setExpandedResponses([...expandedResponses, postId])
    }
  }

  const getFileIcon = (file: PDFFile) => {
    switch (file.type) {
      case "bluebook":
        return <Calendar className="w-8 h-8 text-blue-600" />
      case "notebook":
        return <BookOpen className="w-8 h-8 text-yellow-600" />
      case "pdf":
        return <div className="bg-red-600 text-white text-xs px-1 rounded">PDF</div>
      case "ppt":
        return <div className="bg-orange-600 text-white text-xs px-1 rounded">PPT</div>
      default:
        return <div className="bg-blue-600 text-white text-xs px-1 rounded">DOC</div>
    }
  }

  const getFileBackground = (file: PDFFile) => {
    switch (file.type) {
      case "bluebook":
        return "bg-blue-200 border-blue-400"
      case "notebook":
        return "bg-yellow-200 border-yellow-400"
      default:
        return "bg-white border-gray-200"
    }
  }

  // Add this function before the return statement:
  const searchFiles = (query: string) => {
    if (!query.trim()) return allFiles

    return allFiles.filter((file) => {
      // Search by filename
      if (file.name.toLowerCase().includes(query.toLowerCase())) {
        return true
      }

      // Search by file type
      if (file.type.toLowerCase().includes(query.toLowerCase())) {
        return true
      }

      // Search by course (if available)
      if (file.course && file.course.toLowerCase().includes(query.toLowerCase())) {
        return true
      }

      // Search by shared by (if available)
      if (file.sharedBy && file.sharedBy.toLowerCase().includes(query.toLowerCase())) {
        return true
      }

      return false
    })
  }

  const filteredFiles = searchFiles(fileSearchQuery)

  useEffect(() => {
    const totalItems = filteredFiles.length + folders.length + stickyNotes.length
    const maxPage = Math.max(0, Math.ceil(totalItems / itemsPerPage) - 1)
    if (dashboardPage > maxPage) {
      setDashboardPage(maxPage)
    }
  }, [filteredFiles.length, folders.length, stickyNotes.length, itemsPerPage, dashboardPage])

  // Update the handleSaveProfile function:
  const handleSaveProfile = () => {
    setCurrentUser({
      firstName: profileData.firstName,
      lastName: profileData.lastName,
      username: profileData.username,
      phone: profileData.phone,
      college: profileData.college,
    })

    const existingUser = localStorage.getItem("currentUser")
    const existingId = existingUser ? JSON.parse(existingUser).id : Date.now().toString()

    localStorage.setItem(
      "currentUser",
      JSON.stringify({
        ...profileData,
        id: existingId,
      }),
    )

    setShowProfile(false)
    alert("Profile updated successfully!")
  }

  const handleProfileImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !file.type.startsWith("image/")) return

    setUploadingProfileImage(true)
    const reader = new FileReader()
    reader.onload = async (ev) => {
      try {
        const dataUrl = ev.target?.result as string
        setProfileData(prev => ({ ...prev, profileImage: dataUrl }))

        const storedUser = localStorage.getItem("currentUser")
        if (storedUser) {
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
        }
      } catch {
      } finally {
        setUploadingProfileImage(false)
      }
    }
    reader.readAsDataURL(file)
  }

  const handleDragStart = (e: React.DragEvent, itemId: string, itemType: "file" | "note" | "folder") => {
    if (!moveMode) return
    e.dataTransfer.setData("text/plain", JSON.stringify({ itemId, itemType }))
    setDraggedItem(itemId)
  }

  const handleDragEnd = () => {
    setDraggedItem(null)
    setDragOverTrash(false)
    setDragOverFolder(null)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (e: React.DragEvent, targetType: "desktop" | "trash" | "folder", folderId?: string) => {
    e.preventDefault()
    const data = JSON.parse(e.dataTransfer.getData("text/plain"))
    const { itemId, itemType } = data

    if (targetType === "trash") {
      handleMoveToTrash(itemId, itemType)
    } else if (targetType === "folder" && folderId) {
      handleMoveToFolder(itemId, folderId)
    } else if (targetType === "desktop") {
      // Move item to new position on desktop with more freedom
      const rect = e.currentTarget.getBoundingClientRect()
      const x = ((e.clientX - rect.left) / rect.width) * 100
      const y = ((e.clientY - rect.top) / rect.height) * 100

      // Allow much more freedom in positioning - only prevent going completely off-screen
      const constrainedX = Math.max(0, Math.min(95, x))
      const constrainedY = Math.max(0, Math.min(90, y))

      if (itemType === "file") {
        setAllFiles((files) =>
          files.map((file) =>
            file.id === itemId
              ? {
                  ...file,
                  position: { ...file.position, x: constrainedX, y: constrainedY },
                }
              : file,
          ),
        )
      } else if (itemType === "note") {
        setStickyNotes((notes) =>
          notes.map((note) =>
            note.id === itemId
              ? {
                  ...note,
                  position: { ...note.position, x: constrainedX, y: constrainedY },
                }
              : note,
          ),
        )
        const movedNote = stickyNotes.find((n) => n.id === itemId)
        if (movedNote) {
          const storedUser = localStorage.getItem("currentUser")
          const userId = storedUser ? JSON.parse(storedUser).id : null
          if (userId) {
            fetch("/api/notes", {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ noteId: itemId, userId, content: movedNote.content, position: { ...movedNote.position, x: constrainedX, y: constrainedY } }),
            }).catch(() => {})
          }
        }
      } else if (itemType === "folder") {
        setFolders((folders) =>
          folders.map((folder) =>
            folder.id === itemId
              ? {
                  ...folder,
                  position: { ...folder.position, x: constrainedX, y: constrainedY },
                }
              : folder,
          ),
        )
      }
    }

    setDraggedItem(null)
    setDragOverTrash(false)
    setDragOverFolder(null)
  }

  const handleMoveToFolder = (itemId: string, folderId: string) => {
    const file = allFiles.find((f) => f.id === itemId)
    if (file) {
      setFolders((folders) =>
        folders.map((folder) => (folder.id === folderId ? { ...folder, files: [...folder.files, itemId] } : folder)),
      )
      setAllFiles(allFiles.filter((f) => f.id !== itemId))
    }
  }

  const handleCreateFolder = () => {
    setShowCreateFolder(true)
  }

  const handleConfirmCreateFolder = () => {
    if (newFolderName.trim()) {
      const newFolder = {
        id: Date.now().toString(),
        name: newFolderName.trim(),
        position: { x: 30, y: 30, rotation: 0 },
        files: [],
      }
      setFolders([...folders, newFolder])
      setNewFolderName("")
      setShowCreateFolder(false)
    }
  }

  const handleFolderClick = (folder: { id: string; name: string; files: string[] }) => {
    if (!moveMode) {
      setSelectedFolder(folder)
      setShowFolderView(true)
    }
  }

  const handleMoveFileToDesktop = (fileId: string) => {
    if (selectedFolder) {
      const file =
        allFiles.find((f) => f.id === fileId) ||
        recycleBin.find((f) => f.id === fileId && selectedFolder.files.includes(fileId))

      if (file) {
        // Add file back to desktop
        setAllFiles((prev) => [
          ...prev,
          {
            ...file,
            position: { x: Math.random() * 60 + 10, y: Math.random() * 40 + 50, rotation: Math.random() * 10 - 5 },
          },
        ])

        // Remove from folder
        setFolders((folders) =>
          folders.map((f) => (f.id === selectedFolder.id ? { ...f, files: f.files.filter((id) => id !== fileId) } : f)),
        )
      }
    }
  }

  const handleDeleteFolder = () => {
    if (selectedFolder) {
      // Move all files back to desktop first
      selectedFolder.files.forEach((fileId) => {
        handleMoveFileToDesktop(fileId)
      })

      // Remove folder
      setFolders((folders) => folders.filter((f) => f.id !== selectedFolder.id))
      setShowFolderView(false)
      setSelectedFolder(null)
    }
  }

  const handleRenameFolder = () => {
    setRenameFolderValue(selectedFolder?.name || "")
    setShowRenameFolderModal(true)
  }

  const handleConfirmRenameFolder = () => {
    if (selectedFolder && renameFolderValue.trim()) {
      setFolders((folders) =>
        folders.map((f) => (f.id === selectedFolder.id ? { ...f, name: renameFolderValue.trim() } : f)),
      )
      setSelectedFolder((prev) => (prev ? { ...prev, name: renameFolderValue.trim() } : null))
      setShowRenameFolderModal(false)
      setRenameFolderValue("")
    }
  }

  const handleMoveToTrash = (itemId: string, itemType: string) => {
    if (itemType === "file") {
      const file = allFiles.find((f) => f.id === itemId)
      if (file && !["bluebook", "notebook"].includes(file.type)) {
        setRecycleBin([...recycleBin, file])
        setAllFiles(allFiles.filter((f) => f.id !== itemId))
        const storedUser = localStorage.getItem("currentUser")
        const userId = storedUser ? JSON.parse(storedUser).id : null
        if (userId) {
          fetch(`/api/files?fileId=${itemId}&userId=${userId}`, { method: "DELETE" }).catch(() => {})
        }
      }
    } else if (itemType === "note") {
      const note = stickyNotes.find((n) => n.id === itemId)
      if (note) {
        setRecycleBin([
          ...recycleBin,
          {
            id: note.id,
            name: `Sticky Note: ${note.content.slice(0, 20)}...`,
            type: "note" as any,
            thumbnail: "",
            position: note.position,
          },
        ])
        setStickyNotes(stickyNotes.filter((n) => n.id !== itemId))
        const storedUser = localStorage.getItem("currentUser")
        const userId = storedUser ? JSON.parse(storedUser).id : null
        if (userId) {
          fetch(`/api/notes?noteId=${itemId}&userId=${userId}`, { method: "DELETE" }).catch(() => {})
        }
      }
    } else if (itemType === "folder") {
      const folder = folders.find((f) => f.id === itemId)
      if (folder) {
        setRecycleBin([
          ...recycleBin,
          {
            id: folder.id,
            name: `Folder: ${folder.name}`,
            type: "folder" as any,
            thumbnail: "",
            position: folder.position,
            files: folder.files, // Store the files for restoration
          },
        ])
        setFolders(folders.filter((f) => f.id !== itemId))
      }
    }
  }

  const handleRestoreFromBin = (itemId: string) => {
    const item = recycleBin.find((i) => i.id === itemId)
    if (item) {
      if (item.type === "note") {
        const newNote: StickyNote = {
          id: item.id,
          content: item.name.replace("Sticky Note: ", "").replace("...", ""),
          position: item.position,
          lastModified: new Date().toISOString().slice(0, 16).replace("T", " "),
        }
        setStickyNotes([...stickyNotes, newNote])
      } else if (item.type === "folder") {
        const newFolder = {
          id: item.id,
          name: item.name.replace("Folder: ", ""),
          position: item.position,
          files: (item as any).files || [],
        }
        setFolders([...folders, newFolder])
      } else {
        setAllFiles([...allFiles, item])
      }
      setRecycleBin(recycleBin.filter((i) => i.id !== itemId))
    }
  }

  const handleDeleteForever = (itemId: string) => {
    setRecycleBin(recycleBin.filter((i) => i.id !== itemId))
  }

  if (isLoading || !isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen wood-background">
      <Header currentPage="Home" />

      {/* Welcome Modal for New Users */}
      {showWelcome && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-md w-full p-8">
            <div className="text-center">
              <div className="text-6xl mb-4">🎉</div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Welcome to YsUp!</h2>
              <p className="text-gray-600 mb-6">
                Hi {currentUser.firstName}! Your account has been created successfully. You're now part of The Campus
                Network at {currentUser.college}.
              </p>
              <div className="bg-yellow-100 border border-yellow-300 rounded-lg p-4 mb-6">
                <p className="text-sm text-yellow-800">
                  <strong>Getting Started:</strong>
                  <br />• Upload and share files with classmates
                  <br />• Use the yellow notebook for class discussions
                  <br />• Use the blue calendar for scheduling
                  <br />• Earn YBucks by participating in conversations
                </p>
              </div>
              <button
                onClick={() => setShowWelcome(false)}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                Start Exploring!
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sub Navigation */}
      <div className="bg-amber-700 px-3 md:px-4 py-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
        <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4">
          <span className="text-amber-100 font-medium text-sm md:text-base">
            {currentUser.firstName} {currentUser.lastName} (+{currentUser.username})
          </span>
          <span className="text-amber-200 text-xs md:text-base hidden sm:inline">Wednesday, March 21, 2012, 1:35 AM</span>
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <input
            type="text"
            placeholder="Search Files"
            value={fileSearchQuery}
            onChange={(e) => setFileSearchQuery(e.target.value)}
            className="px-3 py-1 rounded border border-amber-600 bg-amber-50 text-amber-900 placeholder-amber-600 flex-1 sm:flex-none text-sm"
          />
          <button className="bg-amber-600 text-white px-3 py-1 rounded hover:bg-amber-700 text-sm">search</button>
        </div>
      </div>

      <div className="p-4 md:p-6 lg:p-8">
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.doc,.docx,.ppt,.pptx"
          onChange={handleFileUpload}
          className="hidden"
        />

        {/* Top toolbar: ID card + action buttons */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
          {/* ID Card */}
          <div
            className="cursor-pointer transform hover:scale-[1.02] transition-all duration-200"
            onClick={() => setShowProfile(true)}
          >
            <div className="bg-white rounded-lg shadow-lg p-3 w-full sm:w-56 border-2 border-blue-500">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-full border-2 border-gray-300 flex-shrink-0 overflow-hidden bg-gray-100 flex items-center justify-center">
                  {profileData.profileImage && profileData.profileImage !== "/placeholder.svg?height=150&width=150" ? (
                    <img src={profileData.profileImage} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-5 h-5 text-gray-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-sm text-gray-800 truncate">
                    {profileData.firstName || profileData.lastName
                      ? `${profileData.firstName} ${profileData.lastName}`.trim()
                      : "Set up profile"}
                  </div>
                  <div className="text-xs text-gray-600 truncate">{profileData.username ? `+${profileData.username}` : ""}</div>
                  <div className="text-xs text-blue-600 truncate">{profileData.major || "Tap to add major"}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center flex-wrap gap-2">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg flex items-center space-x-1.5 text-sm"
            >
              <Upload className="w-4 h-4" />
              <span>Upload</span>
            </button>
            <button
              onClick={handleCreateFolder}
              className="bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-1.5 rounded-lg flex items-center space-x-1.5 text-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Folder</span>
            </button>
            <button
              onClick={() => handleCreateStickyNote()}
              className="bg-amber-500 hover:bg-amber-600 text-white px-3 py-1.5 rounded-lg flex items-center space-x-1.5 text-sm"
            >
              <StickyNoteIcon className="w-4 h-4" />
              <span>Note</span>
            </button>
            <button
              onClick={() => setShowRecycleBin(true)}
              className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1.5 rounded-lg flex items-center space-x-1.5 text-sm"
            >
              <Trash2 className="w-4 h-4" />
              <span>Trash</span>
            </button>
          </div>
        </div>

        {/* Grid Items: files + folders + sticky notes, paginated */}
        <div
          onDrop={handleExternalFileDrop}
          onDragOver={handleExternalDragOver}
          onDragLeave={handleExternalDragLeave}
          className={`relative rounded-xl transition-all duration-200 ${isDraggingExternalFile ? "ring-2 ring-dashed ring-amber-500 bg-amber-50/50" : ""}`}
        >
          {isDraggingExternalFile && (
            <div className="absolute inset-0 z-20 flex items-center justify-center bg-amber-50/80 rounded-xl pointer-events-none">
              <div className="text-center">
                <Upload className="w-12 h-12 mx-auto text-amber-600 mb-2" />
                <p className="text-amber-800 font-semibold text-lg">Drop your file here</p>
                <p className="text-amber-600 text-sm">PDF, DOC, DOCX, PPT, PPTX</p>
              </div>
            </div>
          )}
        {(() => {
          const gridItems: ({ type: "file"; data: PDFFile } | { type: "folder"; data: typeof folders[0] } | { type: "note"; data: StickyNote })[] = []

          filteredFiles.forEach((f) => gridItems.push({ type: "file", data: f }))
          folders.forEach((f) => gridItems.push({ type: "folder", data: f }))
          stickyNotes.forEach((n) => gridItems.push({ type: "note", data: n }))

          const totalPages = Math.max(1, Math.ceil(gridItems.length / itemsPerPage))
          const safePage = Math.min(dashboardPage, totalPages - 1)
          const pageItems = gridItems.slice(safePage * itemsPerPage, (safePage + 1) * itemsPerPage)

          return (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4">
                {pageItems.map((item) => {
                  if (item.type === "file") {
                    const file = item.data as PDFFile
                    const canTrash = !["bluebook", "notebook"].includes(file.type)
                    return (
                      <div
                        key={`file-${file.id}`}
                        className="cursor-pointer transform hover:scale-105 transition-all duration-200 group relative"
                        onClick={() => handleFileClick(file)}
                      >
                        {canTrash && (
                          <button
                            onClick={(e) => { e.stopPropagation(); handleMoveToTrash(file.id, "file") }}
                            className="absolute -top-1.5 -right-1.5 z-10 w-6 h-6 bg-gray-400 hover:bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                            title="Send to trash"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <div className={`rounded-lg shadow-lg overflow-hidden border-2 h-44 ${getFileBackground(file)} relative`}>
                          {file.type === "bluebook" ? (
                            <div className="p-2 h-full flex flex-col">
                              <div className="text-center mb-2">
                                <Calendar className="w-8 h-8 mx-auto text-blue-600" />
                                <div className="text-xs font-bold text-blue-800">YsUp Bluebook</div>
                              </div>
                              <div className="flex-1 text-xs space-y-1">
                                <div className="bg-blue-100 p-1 rounded">
                                  <div className="font-bold">{new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" })}</div>
                                  <div>Tap to view</div>
                                </div>
                              </div>
                            </div>
                          ) : file.type === "notebook" ? (
                            <div className="p-2 h-full flex flex-col relative">
                              <div className="absolute left-1 top-2 bottom-2 w-1">
                                <div className="h-full bg-gray-400 rounded-full opacity-60"></div>
                              </div>
                              <div className="ml-3">
                                <div className="text-center mb-2">
                                  <BookOpen className="w-6 h-6 mx-auto text-yellow-600" />
                                  <div className="text-xs font-bold text-gray-800">Class Networks</div>
                                </div>
                                <div className="flex-1 text-xs space-y-1">
                                  {myNetworks.length > 0 ? (
                                    myNetworks.slice(0, 2).map((net) => (
                                      <div key={net.id} className="bg-white p-1 rounded border">
                                        <div className="font-semibold truncate">{net.name}</div>
                                        <div className="text-gray-600">{net.member_count} member{Number(net.member_count) !== 1 ? "s" : ""}</div>
                                      </div>
                                    ))
                                  ) : (
                                    <div className="bg-white p-1 rounded border text-center">
                                      <div className="text-gray-500">No networks yet</div>
                                      <div className="text-gray-400">Tap to join</div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          ) : (
                            <>
                              <div className="relative h-32 overflow-hidden bg-gray-50">
                                {file.type === "pdf" && file.fileData ? (
                                  <div className="w-full h-full overflow-hidden flex items-start justify-center">
                                    <PdfThumbnail fileData={file.fileData} />
                                  </div>
                                ) : (
                                  <img
                                    src={file.thumbnail || "/placeholder.svg"}
                                    alt={file.name}
                                    className="w-full h-full object-cover"
                                  />
                                )}
                                {file.type === "pdf" && (
                                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-r from-gray-600 to-gray-400 opacity-80"></div>
                                )}
                              </div>
                              <div className="p-1.5 bg-white">
                                <div className="text-xs font-medium truncate text-gray-800">{file.name}</div>
                              </div>
                            </>
                          )}
                          <div className="absolute bottom-1 right-1">{getFileIcon(file)}</div>
                        </div>
                      </div>
                    )
                  }

                  if (item.type === "folder") {
                    const folder = item.data as typeof folders[0]
                    return (
                      <div
                        key={`folder-${folder.id}`}
                        className="cursor-pointer transform hover:scale-105 transition-all duration-200 group relative"
                        onClick={() => handleFolderClick(folder)}
                      >
                        <button
                          onClick={(e) => { e.stopPropagation(); handleMoveToTrash(folder.id, "folder") }}
                          className="absolute -top-1.5 -right-1.5 z-10 w-6 h-6 bg-gray-400 hover:bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                          title="Send to trash"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                        <div className="h-44 bg-yellow-400 border-2 border-yellow-600 rounded-lg shadow-lg">
                          <div className="p-3 h-full flex flex-col items-center justify-center">
                            <Folder className="w-10 h-10 text-yellow-800 mb-2" />
                            <div className="text-sm font-bold text-yellow-900 truncate w-full text-center">{folder.name}</div>
                            <div className="text-xs text-yellow-800 mt-1">{folder.files.length} files</div>
                          </div>
                        </div>
                      </div>
                    )
                  }

                  if (item.type === "note") {
                    const note = item.data as StickyNote
                    return (
                      <div
                        key={`note-${note.id}`}
                        className="cursor-pointer transform hover:scale-105 transition-all duration-200 group relative"
                        onClick={() => handleStickyNoteClick(note)}
                      >
                        <button
                          onClick={(e) => { e.stopPropagation(); handleMoveToTrash(note.id, "note") }}
                          className="absolute -top-1.5 -right-1.5 z-10 w-6 h-6 bg-gray-400 hover:bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                          title="Send to trash"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                        <div className="h-44 bg-yellow-300 border border-yellow-400 rounded-lg shadow-lg relative">
                          <div className="absolute top-0 right-0 w-5 h-5 bg-yellow-400 transform rotate-45 translate-x-1 -translate-y-1 rounded-sm"></div>
                          <div className="p-3 h-full overflow-hidden">
                            <StickyNoteIcon className="w-6 h-6 text-yellow-700 mb-2" />
                            <div className="text-xs text-gray-700 leading-relaxed">
                              {note.content.slice(0, 60)}
                              {note.content.length > 60 && "..."}
                            </div>
                            <div className="text-xs text-gray-500 mt-2">{note.lastModified}</div>
                          </div>
                        </div>
                      </div>
                    )
                  }

                  return null
                })}
              </div>

              {/* Pagination arrows */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-4 mt-6">
                  <button
                    onClick={() => setDashboardPage(Math.max(0, safePage - 1))}
                    disabled={safePage === 0}
                    className={`flex items-center space-x-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      safePage === 0
                        ? "bg-amber-800/30 text-amber-500/40 cursor-not-allowed"
                        : "bg-amber-700 hover:bg-amber-600 text-white"
                    }`}
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Previous</span>
                  </button>
                  <span className="text-amber-200 text-sm">
                    Page {safePage + 1} of {totalPages}
                  </span>
                  <button
                    onClick={() => setDashboardPage(Math.min(totalPages - 1, safePage + 1))}
                    disabled={safePage === totalPages - 1}
                    className={`flex items-center space-x-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      safePage === totalPages - 1
                        ? "bg-amber-800/30 text-amber-500/40 cursor-not-allowed"
                        : "bg-amber-700 hover:bg-amber-600 text-white"
                    }`}
                  >
                    <span>Next</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </>
          )
        })()}

        <div className="flex items-center justify-center py-6 mt-4 border-2 border-dashed border-amber-600/40 rounded-xl bg-amber-900/10 cursor-pointer hover:border-amber-500/60 hover:bg-amber-900/20 transition-all"
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="text-center">
            <Upload className="w-8 h-8 mx-auto text-amber-500/60 mb-1" />
            <p className="text-amber-400/80 font-medium text-sm">Drag and Drop Files Here (PDF, DOC, DOCX, PPT, or PPTX supported)</p>
            <p className="text-amber-500/40 text-xs mt-0.5">or click to browse</p>
          </div>
        </div>
        {storageInfo && (
          <div className="mt-3 px-1">
            <div className="flex items-center justify-between text-xs text-amber-400/70 mb-1">
              <span>{storageInfo.usedMB}MB of {storageInfo.limitMB}MB used</span>
              <span>{storageInfo.tier === "free" ? "Free" : "Honors"}</span>
            </div>
            <div className="w-full bg-amber-900/30 rounded-full h-1.5">
              <div
                className={`h-1.5 rounded-full transition-all ${storageInfo.usedMB / storageInfo.limitMB > 0.9 ? "bg-red-500" : "bg-amber-500"}`}
                style={{ width: `${Math.min((storageInfo.usedMB / storageInfo.limitMB) * 100, 100)}%` }}
              />
            </div>
          </div>
        )}
        </div>
      </div>

      {/* Expanded Bluebook Modal */}
      {showBluebook && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="wood-background rounded-lg w-full max-w-4xl h-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="bg-blue-700 p-3 md:p-4 flex items-center justify-between shrink-0">
              <h2 className="text-lg md:text-xl font-bold text-blue-100">YsUp Bluebook - Calendar</h2>
              <div className="flex items-center space-x-2">
                <span className="text-blue-200 text-sm hidden sm:inline">
                  {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
                </span>
                <button onClick={() => setShowBluebook(false)} className="text-blue-100 hover:text-white">
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-4 md:p-6 overflow-y-auto flex-1">
              <div className="mb-4 text-center">
                <button
                  onClick={() => setShowCreateEvent(true)}
                  className="bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-lg flex items-center space-x-2 mx-auto text-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create New Event</span>
                </button>
              </div>

              {/* Create Event Form */}
              {showCreateEvent && (
                <div className="mb-6 bg-blue-50 p-4 md:p-6 rounded-lg border border-blue-200">
                  <h3 className="text-lg font-bold text-blue-800 mb-4">Create New Event</h3>
                  <div className="space-y-3">
                    <input
                      type="text"
                      placeholder="Event Title *"
                      value={newEvent.title}
                      onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                      className="w-full px-3 py-2 border rounded text-sm"
                    />
                    <input
                      type="text"
                      placeholder="Description (optional)"
                      value={newEvent.description}
                      onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                      className="w-full px-3 py-2 border rounded text-sm"
                    />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Date *</label>
                        <input
                          type="date"
                          value={newEvent.date}
                          onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                          className="w-full px-3 py-2 border rounded text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Time *</label>
                        <input
                          type="time"
                          value={newEvent.time}
                          onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
                          className="w-full px-3 py-2 border rounded text-sm"
                        />
                      </div>
                    </div>
                    <input
                      type="text"
                      placeholder="Location (optional)"
                      value={newEvent.location}
                      onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                      className="w-full px-3 py-2 border rounded text-sm"
                    />

                    {/* Invite from Networks */}
                    <div>
                      <label className="block text-sm font-medium text-blue-800 mb-2">Invite from your Networks:</label>
                      {inviteNetworks.length === 0 ? (
                        <p className="text-sm text-gray-500 italic">Join a Class Network first to invite people to events.</p>
                      ) : (
                        <div className="border rounded bg-white max-h-64 overflow-y-auto">
                          {inviteNetworks.map((net) => (
                            <div key={net.id} className="border-b last:border-b-0">
                              <div className="flex items-center justify-between p-3">
                                <div className="flex items-center space-x-2">
                                  <input
                                    type="checkbox"
                                    checked={newEvent.selectedNetworkIds.includes(net.id)}
                                    onChange={() => toggleNetworkInvite(net.id)}
                                    className="w-4 h-4 text-blue-600"
                                  />
                                  <div>
                                    <span className="text-sm font-medium">{net.name}</span>
                                    <span className="text-xs text-gray-500 ml-2">({net.member_count} members)</span>
                                  </div>
                                </div>
                                <button
                                  onClick={() => handleExpandNetwork(net.id)}
                                  className="text-xs text-blue-600 hover:text-blue-800"
                                >
                                  {expandedNetwork === net.id ? "Hide Members" : "Pick Members"}
                                </button>
                              </div>

                              {expandedNetwork === net.id && networkMembers[net.id] && (
                                <div className="bg-gray-50 px-3 pb-3">
                                  {networkMembers[net.id].length === 0 ? (
                                    <p className="text-xs text-gray-500 py-2">No other members in this network yet.</p>
                                  ) : (
                                    <div className="space-y-1">
                                      {networkMembers[net.id].map((member) => (
                                        <div key={member.id} className="flex items-center space-x-2 py-1">
                                          <input
                                            type="checkbox"
                                            checked={newEvent.selectedUserIds.includes(member.id)}
                                            onChange={() => toggleUserInvite(member.id)}
                                            className="w-3.5 h-3.5 text-blue-600"
                                          />
                                          <span className="text-xs">{member.first_name} {member.last_name} (+{member.username})</span>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                      {(newEvent.selectedNetworkIds.length > 0 || newEvent.selectedUserIds.length > 0) && (
                        <div className="mt-2 text-xs text-blue-700">
                          {newEvent.selectedNetworkIds.length > 0 && <span>{newEvent.selectedNetworkIds.length} network(s) selected. </span>}
                          {newEvent.selectedUserIds.length > 0 && <span>{newEvent.selectedUserIds.length} individual(s) selected.</span>}
                        </div>
                      )}
                    </div>

                    <div className="flex space-x-2 pt-2">
                      <button
                        onClick={handleCreateEvent}
                        disabled={creatingEvent || !newEvent.title || !newEvent.date || !newEvent.time}
                        className={`px-4 py-2 rounded text-sm font-medium ${
                          creatingEvent || !newEvent.title || !newEvent.date || !newEvent.time
                            ? "bg-gray-400 text-gray-200 cursor-not-allowed"
                            : "bg-green-600 hover:bg-green-700 text-white"
                        }`}
                      >
                        {creatingEvent ? "Creating..." : "Create Event"}
                      </button>
                      <button
                        onClick={() => { setShowCreateEvent(false); setExpandedNetwork(null) }}
                        className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded text-sm"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Pending Invites */}
              {pendingInvites.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-sm font-bold text-blue-200 uppercase tracking-wider mb-3">Pending Invitations</h3>
                  <div className="space-y-3">
                    {pendingInvites.map((invite: any) => (
                      <div key={invite.invite_id} className="bg-blue-900/40 border border-blue-500/40 rounded-lg p-4">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                          <div>
                            <h4 className="font-bold text-blue-100">{invite.title}</h4>
                            <p className="text-xs text-blue-300">
                              {formatEventDate(invite.event_date)} at {formatEventTime(invite.event_time)}
                              {invite.location && ` - ${invite.location}`}
                            </p>
                            <p className="text-xs text-blue-400 mt-1">
                              Invited by {invite.creator_first_name} {invite.creator_last_name}
                            </p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleRsvp(invite.event_id, "going")}
                              disabled={rsvpingEvent === invite.event_id}
                              className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded text-xs font-medium"
                            >
                              I'm Going
                            </button>
                            <button
                              onClick={() => handleRsvp(invite.event_id, "maybe")}
                              disabled={rsvpingEvent === invite.event_id}
                              className="bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-1.5 rounded text-xs font-medium"
                            >
                              Maybe
                            </button>
                            <button
                              onClick={() => handleRsvp(invite.event_id, "not_going")}
                              disabled={rsvpingEvent === invite.event_id}
                              className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded text-xs font-medium"
                            >
                              Not Going
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Calendar Events */}
              <div>
                <h3 className="text-sm font-bold text-blue-200 uppercase tracking-wider mb-3">Your Events</h3>
                {eventsLoading ? (
                  <div className="text-center py-12 text-blue-200">Loading events...</div>
                ) : calendarEvents.length === 0 ? (
                  <div className="text-center py-12">
                    <Calendar className="w-12 h-12 mx-auto text-blue-400 mb-3" />
                    <p className="text-blue-200">No events yet. Create your first event above!</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {calendarEvents.map((event) => {
                      const isCreator = (() => {
                        try {
                          const u = JSON.parse(localStorage.getItem("currentUser") || "{}")
                          return u.id === event.creator_id
                        } catch { return false }
                      })()

                      return (
                        <div key={event.id} className="bg-blue-100 rounded-lg p-4 border border-blue-300">
                          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                            <div className="flex-1">
                              <h4 className="font-bold text-blue-800 text-base">{event.title}</h4>
                              {event.description && <p className="text-sm text-blue-700 mt-0.5">{event.description}</p>}
                              <p className="text-sm text-blue-600 mt-1">
                                {formatEventDate(event.event_date)} at {formatEventTime(event.event_time)}
                              </p>
                              {event.location && <p className="text-xs text-blue-500 mt-0.5">{event.location}</p>}
                              <p className="text-xs text-blue-500 mt-1">
                                Created by {event.creator_first_name} {event.creator_last_name}
                              </p>
                            </div>

                            {isCreator && (
                              <button
                                onClick={() => handleDeleteEvent(event.id)}
                                className="text-red-500 hover:text-red-700 text-xs self-start"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>

                          {/* RSVP Tallies */}
                          <div className="mt-3 flex flex-wrap gap-3 text-xs">
                            <span className="bg-blue-200 text-blue-800 px-2.5 py-1 rounded-full font-medium">
                              Invited: {event.total_invited}
                            </span>
                            <span className="bg-green-200 text-green-800 px-2.5 py-1 rounded-full font-medium">
                              Going: {event.going_count}
                            </span>
                            <span className="bg-yellow-200 text-yellow-800 px-2.5 py-1 rounded-full font-medium">
                              Maybe: {event.maybe_count}
                            </span>
                            <span className="bg-red-200 text-red-800 px-2.5 py-1 rounded-full font-medium">
                              Not Going: {event.not_going_count}
                            </span>
                          </div>

                          {/* My RSVP status (for invited events) */}
                          {event.my_rsvp && !isCreator && (
                            <div className="mt-3 flex items-center gap-2">
                              <span className="text-xs text-blue-600 font-medium">Your response:</span>
                              <div className="flex gap-1.5">
                                <button
                                  onClick={() => handleRsvp(event.id, "going")}
                                  className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                                    event.my_rsvp === "going"
                                      ? "bg-green-600 text-white"
                                      : "bg-green-100 text-green-700 hover:bg-green-200"
                                  }`}
                                >
                                  Going
                                </button>
                                <button
                                  onClick={() => handleRsvp(event.id, "maybe")}
                                  className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                                    event.my_rsvp === "maybe"
                                      ? "bg-yellow-600 text-white"
                                      : "bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
                                  }`}
                                >
                                  Maybe
                                </button>
                                <button
                                  onClick={() => handleRsvp(event.id, "not_going")}
                                  className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                                    event.my_rsvp === "not_going"
                                      ? "bg-red-600 text-white"
                                      : "bg-red-100 text-red-700 hover:bg-red-200"
                                  }`}
                                >
                                  Not Going
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Class Networks Modal */}
      {showNotebook && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="wood-background rounded-lg w-full max-w-4xl h-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="bg-amber-700 p-4 flex items-center justify-between shrink-0">
              <h2 className="text-xl font-bold text-amber-100">Class Networks</h2>
              <button onClick={() => setShowNotebook(false)} className="text-amber-100 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-2">
                  <div className="text-lg font-bold text-amber-100">Level {userLevel}</div>
                  <div className="text-sm text-amber-200">{userYBucks} YBucks</div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setShowSearchNetworks(true)}
                    className="bg-amber-600 hover:bg-amber-500 text-white px-4 py-2 rounded flex items-center space-x-2"
                  >
                    <Search className="w-4 h-4" />
                    <span>Find Networks</span>
                  </button>
                  <button
                    onClick={() => setShowCreateNetwork(true)}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded flex items-center space-x-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Create Network</span>
                  </button>
                </div>
              </div>

              {networksLoading ? (
                <div className="text-center py-12 text-amber-200">Loading your networks...</div>
              ) : myNetworks.length === 0 ? (
                <div className="text-center py-16">
                  <Users className="w-16 h-16 mx-auto text-amber-400 mb-4" />
                  <h3 className="text-xl font-bold text-amber-100 mb-2">No Class Networks Yet</h3>
                  <p className="text-amber-300 mb-6 max-w-md mx-auto">
                    Join or create a Class Network to connect with your classmates, share notes, and stay updated.
                  </p>
                  <div className="flex justify-center space-x-3">
                    <button
                      onClick={() => setShowSearchNetworks(true)}
                      className="bg-amber-600 hover:bg-amber-500 text-white px-6 py-3 rounded-lg flex items-center space-x-2"
                    >
                      <Search className="w-5 h-5" />
                      <span>Search Networks</span>
                    </button>
                    <button
                      onClick={() => setShowCreateNetwork(true)}
                      className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg flex items-center space-x-2"
                    >
                      <Plus className="w-5 h-5" />
                      <span>Create a Network</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {myNetworks.map((network) => (
                    <div
                      key={network.id}
                      className="bg-amber-900 bg-opacity-50 rounded-lg p-4 border border-amber-700 hover:border-amber-500 transition-colors cursor-pointer"
                      onClick={() => window.location.href = `/networks/${network.slug}`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <div className="w-10 h-10 rounded-full bg-amber-600 flex items-center justify-center text-white font-bold text-lg">
                            {network.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <h3 className="font-bold text-amber-100">{network.name}</h3>
                            <div className="flex items-center space-x-2 text-xs text-amber-300">
                              <span className="capitalize">{network.type}</span>
                              <span>•</span>
                              {network.privacy === "public" ? (
                                <span className="flex items-center space-x-1"><Globe className="w-3 h-3" /><span>Public</span></span>
                              ) : (
                                <span className="flex items-center space-x-1"><Lock className="w-3 h-3" /><span>Private</span></span>
                              )}
                            </div>
                          </div>
                        </div>
                        {network.is_moderator && (
                          <span className="text-xs bg-amber-600 text-white px-2 py-0.5 rounded">Mod</span>
                        )}
                      </div>
                      <p className="text-sm text-amber-200 mb-2 line-clamp-2">{network.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-amber-300">
                          <Users className="w-3 h-3 inline mr-1" />{network.member_count} members
                        </span>
                        <button
                          onClick={(e) => { e.stopPropagation(); copyInviteLink(network.slug); }}
                          className="text-xs text-amber-400 hover:text-amber-200 flex items-center space-x-1"
                        >
                          {inviteLinkCopied === network.slug ? (
                            <><Check className="w-3 h-3" /><span>Copied!</span></>
                          ) : (
                            <><Link2 className="w-3 h-3" /><span>Invite Link</span></>
                          )}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Search Networks Modal */}
      {showSearchNetworks && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
            <div className="bg-amber-700 p-4 flex items-center justify-between shrink-0">
              <h3 className="text-lg font-bold text-amber-100">Find Class Networks</h3>
              <button onClick={() => { setShowSearchNetworks(false); setSearchNetworkQuery(""); setSearchNetworkResults([]); }} className="text-amber-100 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 shrink-0">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={searchNetworkQuery}
                  onChange={(e) => {
                    setSearchNetworkQuery(e.target.value)
                    handleSearchNetworks(e.target.value)
                  }}
                  onKeyDown={(e) => e.key === "Enter" && handleSearchNetworks()}
                  placeholder="Search by network name..."
                  className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  autoFocus
                />
                <button
                  onClick={handleSearchNetworks}
                  disabled={searchingNetworks}
                  className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg"
                >
                  {searchingNetworks ? "Searching..." : "Search"}
                </button>
              </div>
            </div>
            <div className="p-4 overflow-y-auto flex-1">
              {searchNetworkResults.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  {searchNetworkQuery ? "No networks found. Try a different search." : "Search for networks to join."}
                </div>
              ) : (
                <div className="space-y-3">
                  {searchNetworkResults.map((network) => {
                    const alreadyJoined = myNetworks.some((n) => n.id === network.id)
                    return (
                      <div key={network.id} className="border rounded-lg p-4 flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-full bg-amber-600 flex items-center justify-center text-white font-bold">
                            {network.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-800">{network.name}</h4>
                            <div className="flex items-center space-x-2 text-xs text-gray-500">
                              <span className="capitalize">{network.type}</span>
                              <span>•</span>
                              {network.privacy === "public" ? (
                                <span className="flex items-center space-x-1"><Globe className="w-3 h-3" /><span>Public</span></span>
                              ) : (
                                <span className="flex items-center space-x-1"><Lock className="w-3 h-3" /><span>Private</span></span>
                              )}
                              <span>•</span>
                              <span>{network.member_count} members</span>
                            </div>
                            <p className="text-sm text-gray-600 mt-1 line-clamp-1">{network.description}</p>
                          </div>
                        </div>
                        {alreadyJoined ? (
                          <span className="text-sm text-green-600 font-medium">Joined</span>
                        ) : (
                          <button
                            onClick={() => handleJoinNetwork(network.slug)}
                            disabled={joiningNetwork === network.slug}
                            className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg text-sm disabled:opacity-50"
                          >
                            {joiningNetwork === network.slug ? "..." : network.privacy === "public" ? "Join" : "Request"}
                          </button>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Create Network Modal */}
      {showCreateNetwork && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-lg overflow-hidden">
            <div className="bg-amber-700 p-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-amber-100">Create a Class Network</h3>
              <button onClick={() => setShowCreateNetwork(false)} className="text-amber-100 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Network Name</label>
                <input
                  type="text"
                  value={newNetwork.name}
                  onChange={(e) => setNewNetwork({ ...newNetwork, name: e.target.value })}
                  placeholder="e.g. Calculus 2 - Spring 2026"
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={newNetwork.description}
                  onChange={(e) => setNewNetwork({ ...newNetwork, description: e.target.value })}
                  placeholder="What is this network about?"
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 h-20 resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <select
                    value={newNetwork.type}
                    onChange={(e) => setNewNetwork({ ...newNetwork, type: e.target.value as "club" | "organization" | "class" })}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="class">Class</option>
                    <option value="club">Club</option>
                    <option value="organization">Organization</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Privacy</label>
                  <select
                    value={newNetwork.privacy}
                    onChange={(e) => setNewNetwork({ ...newNetwork, privacy: e.target.value as "public" | "private" })}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="public">Public - Anyone can join</option>
                    <option value="private">Private - Requires approval</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end space-x-3 pt-2">
                <button
                  onClick={() => setShowCreateNetwork(false)}
                  className="px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateNetwork}
                  disabled={creatingNetwork || !newNetwork.name.trim() || !newNetwork.description.trim()}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg disabled:opacity-50"
                >
                  {creatingNetwork ? "Creating..." : "Create Network"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sticky Note Modal */}
      {showStickyNote && selectedNote && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-yellow-100 rounded-lg shadow-2xl w-full max-w-md h-96 relative">
            {/* Note header */}
            <div className="bg-yellow-200 p-4 rounded-t-lg flex items-center justify-between border-b border-yellow-300">
              <h3 className="text-lg font-bold text-gray-800">Sticky Note</h3>
              <button onClick={() => setShowStickyNote(false)} className="text-gray-600 hover:text-gray-800">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Note content */}
            <div className="p-4 h-full">
              <textarea
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                placeholder="Write your note here..."
                className="w-full h-48 p-3 bg-yellow-50 border border-yellow-300 rounded resize-none focus:outline-none focus:ring-2 focus:ring-yellow-400 text-gray-800"
                style={{ fontFamily: "Marker Felt, cursive" }}
              />

              <div className="text-xs text-gray-600 mb-4">Last modified: {selectedNote.lastModified}</div>

              {/* Action buttons */}
              <div className="flex space-x-2">
                <button
                  onClick={handleSaveNote}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded flex-1"
                >
                  Save
                </button>
                <button onClick={handleDeleteNote} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded">
                  Delete
                </button>
                <button
                  onClick={() => setShowStickyNote(false)}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Profile Modal */}
      {showProfile && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-blue-600 text-white p-6 rounded-t-lg">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Student Profile</h2>
                <button onClick={() => setShowProfile(false)} className="text-white hover:text-gray-200">
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="flex items-center space-x-6 mb-6">
                <div className="relative">
                  <div
                    onClick={() => profileImageInputRef.current?.click()}
                    className="w-32 h-32 rounded-full overflow-hidden border-4 border-gray-300 cursor-pointer hover:border-blue-400 transition-colors bg-gray-100 flex items-center justify-center"
                  >
                    {profileData.profileImage && profileData.profileImage !== "/placeholder.svg?height=150&width=150" ? (
                      <img src={profileData.profileImage} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-12 h-12 text-gray-400" />
                    )}
                  </div>
                  <button
                    onClick={() => profileImageInputRef.current?.click()}
                    className="absolute bottom-0 right-0 bg-blue-600 text-white rounded-full p-2 hover:bg-blue-700"
                  >
                    <Upload className="w-4 h-4" />
                  </button>
                  <input
                    ref={profileImageInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleProfileImageUpload}
                  />
                  {uploadingProfileImage && <p className="text-xs text-blue-600 text-center mt-1">Uploading...</p>}
                </div>

                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">
                    {profileData.firstName} {profileData.lastName}
                  </h3>
                  <p className="text-lg text-blue-600 mb-1">+{profileData.username}</p>
                  <p className="text-gray-600">
                    {profileData.major} • {profileData.year}
                  </p>
                  <p className="text-gray-600">{profileData.college}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                  <input
                    type="text"
                    value={profileData.firstName}
                    onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                  <input
                    type="text"
                    value={profileData.lastName}
                    onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">+</span>
                    <input
                      type="text"
                      value={profileData.username}
                      onChange={(e) => setProfileData({ ...profileData, username: e.target.value })}
                      className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    value={profileData.email}
                    onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                  <input
                    type="tel"
                    value={profileData.phone}
                    onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Major</label>
                  <input
                    type="text"
                    value={profileData.major}
                    onChange={(e) => setProfileData({ ...profileData, major: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Year</label>
                  <select
                    value={profileData.year}
                    onChange={(e) => setProfileData({ ...profileData, year: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Freshman">Freshman</option>
                    <option value="Sophomore">Sophomore</option>
                    <option value="Junior">Junior</option>
                    <option value="Senior">Senior</option>
                    <option value="Graduate">Graduate</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">College</label>
                  <input
                    type="text"
                    value={profileData.college}
                    onChange={(e) => setProfileData({ ...profileData, college: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                <textarea
                  value={profileData.bio}
                  onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Tell us about yourself..."
                />
              </div>

              <div className="flex space-x-4 mt-6">
                <button
                  onClick={handleSaveProfile}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-md font-medium transition-colors"
                >
                  Save Changes
                </button>
                <button
                  onClick={() => setShowProfile(false)}
                  className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-3 rounded-md font-medium transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* File Viewer Modal - Two-Page Book Reader */}
      {showFileViewer && selectedFile && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-2 md:p-4">
          <div className="bg-stone-800 rounded-lg w-full max-w-6xl h-full max-h-[95vh] overflow-hidden shadow-2xl flex flex-col">
            <div className="bg-gray-800 text-white p-3 flex items-center justify-between shrink-0">
              <div className="flex items-center space-x-3">
                <FileText className="w-5 h-5 text-gray-400" />
                <div className="text-sm md:text-base font-bold truncate max-w-[200px] md:max-w-none">{selectedFile.name}</div>
                <div className="text-xs text-gray-400 hidden sm:block">{selectedFile.type.toUpperCase()}</div>
              </div>
              <div className="flex items-center space-x-2">
                {selectedFile.fileData && (
                  <a
                    href={selectedFile.fileData}
                    download={selectedFile.name}
                    className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded flex items-center space-x-1.5 text-sm"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Download className="w-4 h-4" />
                    <span className="hidden sm:inline">Download</span>
                  </a>
                )}
                <button onClick={() => { setShowFileViewer(false); setPdfCurrentSpread(0); setPdfNumPages(0) }} className="text-white hover:text-gray-300">
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-hidden flex flex-col items-center justify-center bg-stone-700 p-4">
              {selectedFile.type === "pdf" && selectedFile.fileData ? (
                <>
                  <div className="flex-1 flex items-center justify-center w-full overflow-auto">
                    <div className="flex shadow-2xl rounded-lg overflow-hidden" style={{ perspective: "1200px" }}>
                      <div className="w-3 bg-gradient-to-r from-stone-900 via-stone-700 to-stone-500 shadow-inner hidden md:block"></div>

                      <PdfViewer
                        fileData={selectedFile.fileData}
                        pdfCurrentSpread={pdfCurrentSpread}
                        pdfNumPages={pdfNumPages}
                        onLoadSuccess={(numPages) => setPdfNumPages(numPages)}
                      />

                      <div className="w-3 bg-gradient-to-l from-stone-900 via-stone-700 to-stone-500 shadow-inner hidden md:block"></div>
                    </div>
                  </div>

                  {pdfNumPages > 0 && (
                    <div className="flex items-center justify-center gap-4 mt-4 shrink-0">
                      <button
                        onClick={() => setPdfCurrentSpread(Math.max(0, pdfCurrentSpread - 1))}
                        disabled={pdfCurrentSpread === 0}
                        className={`px-4 py-2 rounded text-sm font-medium ${pdfCurrentSpread === 0 ? "bg-gray-600 text-gray-400 cursor-not-allowed" : "bg-amber-700 hover:bg-amber-800 text-white"}`}
                      >
                        <ChevronLeft className="w-4 h-4 inline mr-1" />Previous
                      </button>
                      <span className="text-gray-300 text-sm">
                        Pages {pdfCurrentSpread * 2 + 1}-{Math.min(pdfCurrentSpread * 2 + 2, pdfNumPages)} of {pdfNumPages}
                      </span>
                      <button
                        onClick={() => setPdfCurrentSpread(pdfCurrentSpread + 1)}
                        disabled={pdfCurrentSpread * 2 + 2 >= pdfNumPages}
                        className={`px-4 py-2 rounded text-sm font-medium ${pdfCurrentSpread * 2 + 2 >= pdfNumPages ? "bg-gray-600 text-gray-400 cursor-not-allowed" : "bg-amber-700 hover:bg-amber-800 text-white"}`}
                      >
                        Next<ChevronRight className="w-4 h-4 inline ml-1" />
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center w-full">
                  <div className="bg-white rounded-lg shadow-2xl max-w-3xl w-full p-8 md:p-12 max-h-[75vh] overflow-y-auto">
                    <div className="text-center mb-6">
                      <FileText className="w-16 h-16 mx-auto text-gray-400 mb-3" />
                      <h1 className="text-2xl font-bold text-gray-800">{selectedFile.name}</h1>
                      <div className="w-16 h-1 bg-amber-500 mx-auto mt-2"></div>
                      <p className="text-sm text-gray-500 mt-2">{selectedFile.type.toUpperCase()} Document</p>
                    </div>
                    <div className="text-center text-gray-500">
                      <p>Upload a PDF file to view it in the book reader.</p>
                      <p className="text-sm mt-2">The two-page book view works with PDF files that contain actual content.</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Recycle Bin Modal */}
      {showRecycleBin && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
            <div className="bg-gray-700 text-white p-4 flex items-center justify-between">
              <h2 className="text-xl font-bold flex items-center space-x-2">
                <Trash2 className="w-6 h-6" />
                <span>Recycle Bin</span>
              </h2>
              <button onClick={() => setShowRecycleBin(false)} className="text-white hover:text-gray-300">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 max-h-96 overflow-y-auto">
              {recycleBin.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Trash2 className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>Recycle bin is empty</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recycleBin.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded border">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gray-300 rounded flex items-center justify-center">
                          {item.type === "note" ? (
                            <StickyNoteIcon className="w-4 h-4" />
                          ) : (
                            <FileText className="w-4 h-4" />
                          )}
                        </div>
                        <span className="font-medium">{item.name}</span>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleRestoreFromBin(item.id)}
                          className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm"
                        >
                          Restore
                        </button>
                        <button
                          onClick={() => handleDeleteForever(item.id)}
                          className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
                        >
                          Delete Forever
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Create Folder Modal */}
      {showCreateFolder && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-800">Create New Folder</h3>
              <button onClick={() => setShowCreateFolder(false)} className="text-gray-600 hover:text-gray-800">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Folder Name</label>
              <input
                type="text"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder="Enter folder name..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                onKeyPress={(e) => e.key === "Enter" && handleConfirmCreateFolder()}
                autoFocus
              />
            </div>

            <div className="flex space-x-3">
              <button
                onClick={handleConfirmCreateFolder}
                disabled={!newFolderName.trim()}
                className="flex-1 bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-400 text-white py-2 rounded-md font-medium transition-colors"
              >
                Create Folder
              </button>
              <button
                onClick={() => setShowCreateFolder(false)}
                className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-2 rounded-md font-medium transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Folder View Modal */}
      {showFolderView && selectedFolder && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[80vh] overflow-hidden">
            <div className="bg-yellow-600 text-white p-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Folder className="w-6 h-6" />
                <h2 className="text-xl font-bold">{selectedFolder.name}</h2>
                <span className="text-yellow-200">({selectedFolder.files.length} files)</span>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleRenameFolder}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"
                >
                  Rename
                </button>
                <button
                  onClick={handleDeleteFolder}
                  className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
                >
                  Delete Folder
                </button>
                <button onClick={() => setShowFolderView(false)} className="text-white hover:text-gray-300">
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6 max-h-96 overflow-y-auto">
              {selectedFolder.files.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Folder className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>This folder is empty</p>
                  <p className="text-sm">Drag files here to organize them</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {selectedFolder.files.map((fileId) => {
                    const file = allFiles.find((f) => f.id === fileId) || recycleBin.find((f) => f.id === fileId)
                    if (!file) return null

                    return (
                      <div key={fileId} className="bg-gray-50 rounded-lg p-3 border hover:shadow-md transition-shadow">
                        <div className="text-center mb-2">
                          <div className="w-12 h-12 bg-gray-200 rounded mx-auto mb-2 flex items-center justify-center">
                            {getFileIcon(file)}
                          </div>
                          <div className="text-xs font-medium truncate">{file.name}</div>
                        </div>
                        <button
                          onClick={() => handleMoveFileToDesktop(fileId)}
                          className="w-full bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded text-xs"
                        >
                          Move to Desktop
                        </button>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Rename Folder Modal */}
      {showRenameFolderModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-800">Rename Folder</h3>
              <button onClick={() => setShowRenameFolderModal(false)} className="text-gray-600 hover:text-gray-800">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">New Folder Name</label>
              <input
                type="text"
                value={renameFolderValue}
                onChange={(e) => setRenameFolderValue(e.target.value)}
                placeholder="Enter new folder name..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                onKeyPress={(e) => e.key === "Enter" && handleConfirmRenameFolder()}
                autoFocus
              />
            </div>

            <div className="flex space-x-3">
              <button
                onClick={handleConfirmRenameFolder}
                disabled={!renameFolderValue.trim()}
                className="flex-1 bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-400 text-white py-2 rounded-md font-medium transition-colors"
              >
                Rename
              </button>
              <button
                onClick={() => setShowRenameFolderModal(false)}
                className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-2 rounded-md font-medium transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {showUpgradeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-800">Storage Limit Reached</h3>
              <button onClick={() => setShowUpgradeModal(false)} className="text-gray-600 hover:text-gray-800">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="mb-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <p className="text-red-700 text-sm font-medium">You have reached your {storageInfo?.limitMB || 100}MB free storage limit.</p>
              </div>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="font-bold text-yellow-800 mb-2">Upgrade to YsUp Honors</h4>
                <ul className="text-sm text-yellow-700 space-y-1 mb-3">
                  <li>- 10GB file storage</li>
                  <li>- Full access to YsUp Academy</li>
                  <li>- Priority support</li>
                </ul>
                <p className="text-lg font-bold text-yellow-800">$5/month</p>
              </div>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowUpgradeModal(false)
                  window.location.href = "/bookstore"
                }}
                className="flex-1 bg-yellow-600 hover:bg-yellow-700 text-white py-2 rounded-md font-medium transition-colors"
              >
                Upgrade Now
              </button>
              <button
                onClick={() => setShowUpgradeModal(false)}
                className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-2 rounded-md font-medium transition-colors"
              >
                Maybe Later
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
