"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import Header from "@/components/Header"
import { useAuth } from "@/lib/useAuth"
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
} from "lucide-react"

interface PDFFile {
  id: string
  name: string
  thumbnail: string
  type: "pdf" | "doc" | "ppt" | "bluebook" | "notebook" | "note"
  position: { x: number; y: number; rotation: number }
  sharedBy?: string
  course?: string
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

  // Add state for file viewing:
  const [showFileViewer, setShowFileViewer] = useState(false)
  const [selectedFile, setSelectedFile] = useState<PDFFile | null>(null)

  // Update the sticky notes positions to avoid overlapping with the Bluebook and notebook
  const [stickyNotes, setStickyNotes] = useState<StickyNote[]>([
    {
      id: "note1",
      content: "Remember to study for midterms!",
      position: { x: 75, y: 60, rotation: -5 }, // Moved to bottom right area
      lastModified: "2012-04-25 10:30",
    },
    {
      id: "note2",
      content: "Group project meeting tomorrow at 3pm",
      position: { x: 65, y: 75, rotation: 8 }, // Moved to bottom right area
      lastModified: "2012-04-25 09:15",
    },
  ])

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

  const [showCreateFolder, setShowCreateFolder] = useState(false)
  const [newFolderName, setNewFolderName] = useState("")
  const [showFolderView, setShowFolderView] = useState(false)
  const [selectedFolder, setSelectedFolder] = useState<{ id: string; name: string; files: string[] } | null>(null)
  const [showRenameFolderModal, setShowRenameFolderModal] = useState(false)
  const [renameFolderValue, setRenameFolderValue] = useState("")

  // Add this state for mouse tracking
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    // Check if this is a new user (in a real app, you'd check session/auth state)
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
      }))
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

  // Update the file positions to avoid overlapping with Bluebook and notebook
  const [allFiles, setAllFiles] = useState<PDFFile[]>([
    // Row 1 - Top row (avoiding ID card area)
    // Bluebook Calendar - first item in top row
    {
      id: "bluebook",
      name: "YsUp Bluebook",
      thumbnail: "/placeholder.svg?height=200&width=150",
      type: "bluebook",
      position: { x: 30, y: 15, rotation: -2 },
    },
    // Yellow Notebook - second item in top row
    {
      id: "notebook",
      name: "Class Network",
      thumbnail: "/placeholder.svg?height=200&width=150",
      type: "notebook",
      position: { x: 50, y: 15, rotation: 1 },
    },
    // PDF 1 - third item in top row
    {
      id: "1",
      name: "calc2-hw.pdf",
      thumbnail: "/placeholder.svg?height=200&width=150&text=Calculus%20Homework",
      type: "pdf",
      position: { x: 70, y: 15, rotation: -1 },
    },

    // Row 2 - Middle row
    // PDF 2 - first item in middle row
    {
      id: "2",
      name: "Calculus Transcendentals",
      thumbnail:
        "/placeholder.svg?height=250&width=180&text=CALCULUS%0AEarly%20Transcendentals%0A8th%20Edition%0AStewart",
      type: "pdf",
      position: { x: 15, y: 45, rotation: 2 },
    },
    // PDF 3 - second item in middle row
    {
      id: "3",
      name: "Chemistry: The Central Science",
      thumbnail:
        "/placeholder.svg?height=250&width=180&text=CHEMISTRY%0AThe%20Central%20Science%0A13th%20Edition%0ABrown%20LeMay%20Bursten",
      type: "pdf",
      position: { x: 40, y: 45, rotation: -1 },
    },
    // PDF 4 - third item in middle row
    {
      id: "4",
      name: "Physics For Scientists",
      thumbnail:
        "/placeholder.svg?height=250&width=180&text=PHYSICS%0AFor%20Scientists%20and%20Engineers%0A9th%20Edition%0ASerway%20Jewett",
      type: "pdf",
      position: { x: 65, y: 45, rotation: 1 },
    },

    // Row 3 - Bottom row
    // PPT 1 - first item in bottom row
    {
      id: "5",
      name: "Physics Presentation",
      thumbnail: "/placeholder.svg?height=200&width=150&text=Physics%0APresentation%0AChapter%205",
      type: "ppt",
      position: { x: 25, y: 75, rotation: -2 },
    },
    // PPT 2 - second item in bottom row
    {
      id: "6",
      name: "gen-physics1.ppt",
      thumbnail: "/placeholder.svg?height=150&width=120&text=General%0APhysics%201%0ASlides",
      type: "ppt",
      position: { x: 50, y: 75, rotation: 1 },
    },
  ])

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

  const handleSearchNetworks = async () => {
    if (!searchNetworkQuery.trim()) return
    setSearchingNetworks(true)
    try {
      const res = await fetch(`/api/networks/search?query=${encodeURIComponent(searchNetworkQuery)}`)
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

  const [events, setEvents] = useState([
    {
      id: "1",
      title: "Calculus 2 Lecture",
      time: "3:00pm",
      date: "December 19",
      attendees: ["You"],
      creator: "Professor Johnson",
    },
    {
      id: "2",
      title: "Movie Night: Harry Potter Part 2",
      time: "3:00pm",
      date: "December 20",
      attendees: ["You"],
      creator: "Student Center",
    },
  ])

  const [showCreateEvent, setShowCreateEvent] = useState(false)
  const [newEvent, setNewEvent] = useState({
    title: "",
    time: "",
    date: "",
    selectedInvitees: [] as string[],
  })

  const classmates = ["Nick Fisher", "Amanda Winston", "Nick Harper", "Gary Jackson", "Ann Washington", "Theo Robinson"]

  const nextFile = () => {
    setCurrentFileIndex((prev) => (prev + 1) % allFiles.length)
  }

  const prevFile = () => {
    setCurrentFileIndex((prev) => (prev - 1 + allFiles.length) % allFiles.length)
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const newFile: PDFFile = {
        id: Date.now().toString(),
        name: file.name,
        thumbnail: "/placeholder.svg?height=200&width=150",
        type: file.type.includes("pdf") ? "pdf" : "doc",
        position: { x: Math.random() * 60 + 10, y: Math.random() * 40 + 50, rotation: Math.random() * 10 - 5 },
      }
      setAllFiles([...allFiles, newFile])
    }
  }

  const handleFileClick = (file: PDFFile) => {
    if (file.type === "bluebook") {
      setShowBluebook(true)
    } else if (file.type === "notebook") {
      setShowNotebook(true)
    } else {
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

  // Update the handleCreateStickyNote function to create notes in safe areas
  const handleCreateStickyNote = () => {
    const newNote: StickyNote = {
      id: Date.now().toString(),
      content: "New note...",
      position: {
        x: Math.random() * 30 + 60, // Generate in right side area (60-90%)
        y: Math.random() * 30 + 50, // Generate in bottom area (50-80%)
        rotation: Math.random() * 20 - 10,
      },
      lastModified: new Date().toISOString().slice(0, 16).replace("T", " "),
    }
    setStickyNotes([...stickyNotes, newNote])
  }

  const handleStickyNoteClick = (note: StickyNote) => {
    setSelectedNote(note)
    setNoteContent(note.content)
    setShowStickyNote(true)
  }

  const handleSaveNote = () => {
    if (selectedNote) {
      const updatedNotes = stickyNotes.map((note) =>
        note.id === selectedNote.id
          ? { ...note, content: noteContent, lastModified: new Date().toISOString().slice(0, 16).replace("T", " ") }
          : note,
      )
      setStickyNotes(updatedNotes)
    }
    setShowStickyNote(false)
    setSelectedNote(null)
    setNoteContent("")
  }

  const handleDeleteNote = () => {
    if (selectedNote) {
      setStickyNotes(stickyNotes.filter((note) => note.id !== selectedNote.id))
    }
    setShowStickyNote(false)
    setSelectedNote(null)
    setNoteContent("")
  }

  const toggleInvitee = (studentName: string) => {
    const currentInvitees = newEvent.selectedInvitees
    if (currentInvitees.includes(studentName)) {
      setNewEvent({
        ...newEvent,
        selectedInvitees: currentInvitees.filter((name) => name !== studentName),
      })
    } else {
      setNewEvent({
        ...newEvent,
        selectedInvitees: [...currentInvitees, studentName],
      })
    }
  }

  const handleCreateEvent = () => {
    if (newEvent.title && newEvent.time && newEvent.date) {
      const event = {
        id: Date.now().toString(),
        title: newEvent.title,
        time: newEvent.time,
        date: newEvent.date,
        attendees: [currentUser.firstName + " " + currentUser.lastName, ...newEvent.selectedInvitees],
        creator: currentUser.firstName + " " + currentUser.lastName,
      }

      setEvents([...events, event])
      setNewEvent({ title: "", time: "", date: "", selectedInvitees: [] })
      setShowCreateEvent(false)
      alert(`Event created and invitations sent to ${newEvent.selectedInvitees.length} classmates!`)
    }
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

  // Update the handleSaveProfile function:
  const handleSaveProfile = () => {
    setCurrentUser({
      firstName: profileData.firstName,
      lastName: profileData.lastName,
      username: profileData.username,
      phone: profileData.phone,
      college: profileData.college,
    })

    // Save to localStorage
    localStorage.setItem(
      "currentUser",
      JSON.stringify({
        ...profileData,
        id: currentUser.id || Date.now().toString(),
      }),
    )

    setShowProfile(false)
    alert("Profile updated successfully!")
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

      <div
        className="p-4 md:p-8 relative min-h-[calc(100vh-140px)] transition-all duration-200"
        onDragOver={handleDragOver}
        onDrop={(e) => handleDrop(e, "desktop")}
        style={{
          background:
            moveMode && draggedItem
              ? "radial-gradient(circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(59, 130, 246, 0.1) 0%, transparent 50%)"
              : undefined,
        }}
      >
        {/* File Upload */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.doc,.docx,.ppt,.pptx"
          onChange={handleFileUpload}
          className="hidden"
        />

        {/* Upload Button */}
        <button
          onClick={() => fileInputRef.current?.click()}
          className="absolute top-2 md:top-4 right-2 md:right-4 bg-blue-600 hover:bg-blue-700 text-white px-3 md:px-4 py-1.5 md:py-2 rounded-lg flex items-center space-x-1 md:space-x-2 z-10 text-sm md:text-base"
        >
          <Upload className="w-4 h-4" />
          <span className="hidden sm:inline">Upload File</span>
          <span className="sm:hidden">Upload</span>
        </button>

        {/* Move Mode Toggle */}
        <button
          onClick={() => setMoveMode(!moveMode)}
          className={`absolute top-12 md:top-16 right-2 md:right-20 px-3 md:px-4 py-1.5 md:py-2 rounded-lg flex items-center space-x-1 md:space-x-2 z-10 transition-colors text-sm md:text-base ${
            moveMode ? "bg-green-600 hover:bg-green-700 text-white" : "bg-gray-500 hover:bg-gray-600 text-white"
          }`}
        >
          <span>{moveMode ? "Exit Move" : "Move"}</span>
        </button>

        {/* Add Folder Button */}
        <button
          onClick={handleCreateFolder}
          className="absolute top-28 right-4 bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 z-10"
        >
          <Plus className="w-4 h-4" />
          <span>Add Folder</span>
        </button>

        {/* Trash Can */}
        <div
          className={`absolute bottom-8 right-8 w-16 h-16 rounded-lg flex items-center justify-center cursor-pointer transition-all z-20 ${
            dragOverTrash ? "bg-red-600 scale-110" : "bg-gray-600 hover:bg-gray-700"
          }`}
          onDragOver={(e) => {
            e.preventDefault()
            setDragOverTrash(true)
          }}
          onDragLeave={() => setDragOverTrash(false)}
          onDrop={(e) => handleDrop(e, "trash")}
          onClick={() => setShowRecycleBin(true)}
        >
          <Trash2 className="w-8 h-8 text-white" />
        </div>

        {/* ID Card */}
        <div
          className="absolute top-4 left-4 cursor-pointer transform hover:scale-105 transition-all duration-200 z-10"
          onClick={() => setShowProfile(true)}
        >
          <div className="bg-white rounded-lg shadow-lg p-3 w-48 border-2 border-blue-500">
            <div className="flex items-center space-x-3">
              <img
                src={profileData.profileImage || "/placeholder.svg"}
                alt="Profile"
                className="w-12 h-12 rounded-full object-cover border-2 border-gray-300"
              />
              <div className="flex-1">
                <div className="font-bold text-sm text-gray-800">
                  {profileData.firstName || profileData.lastName
                    ? `${profileData.firstName} ${profileData.lastName}`.trim()
                    : "Set up profile"}
                </div>
                <div className="text-xs text-gray-600">{profileData.username ? `+${profileData.username}` : ""}</div>
                <div className="text-xs text-blue-600">{profileData.major || "Tap to add major"}</div>
              </div>
            </div>
            <div className="mt-2 text-xs text-gray-500 text-center">Click to edit profile</div>
          </div>
        </div>

        {/* All Files on Desk */}
        {filteredFiles.map((file, index) => (
          <div
            key={file.id}
            className={`absolute cursor-pointer transform transition-all duration-200 ${
              index === currentFileIndex && file.type !== "bluebook" && file.type !== "notebook"
                ? "z-20 ring-4 ring-blue-400"
                : "z-10"
            } ${moveMode ? "hover:scale-110" : "hover:scale-105"} ${draggedItem === file.id ? "opacity-50" : ""}`}
            style={{
              left: `${file.position.x}%`,
              top: `${file.position.y}%`,
              transform: `rotate(${file.position.rotation}deg)`,
              "--mouse-x": `${mousePosition.x}px`,
              "--mouse-y": `${mousePosition.y}px`,
            }}
            draggable={moveMode}
            onDragStart={(e) => handleDragStart(e, file.id, "file")}
            onDragEnd={handleDragEnd}
            onClick={() => !moveMode && handleFileClick(file)}
          >
            {/* File Content */}
            <div className={`rounded shadow-lg overflow-hidden border-2 w-32 h-40 ${getFileBackground(file)}`}>
              {/* File Content */}
              {file.type === "bluebook" ? (
                <div className="p-2 h-full flex flex-col">
                  <div className="text-center mb-2">
                    <Calendar className="w-8 h-8 mx-auto text-blue-600" />
                    <div className="text-xs font-bold text-blue-800">YsUp Bluebook</div>
                  </div>
                  <div className="flex-1 text-xs space-y-1">
                    <div className="bg-blue-100 p-1 rounded">
                      <div className="font-bold">Dec 19</div>
                      <div>3:00pm Calculus</div>
                    </div>
                    <div className="bg-blue-100 p-1 rounded">
                      <div className="font-bold">Dec 20</div>
                      <div>Movie Night</div>
                    </div>
                  </div>
                </div>
              ) : file.type === "notebook" ? (
                <div className="p-2 h-full flex flex-col relative">
                  {/* Spiral holes */}
                  <div className="absolute left-1 top-2 bottom-2 w-1">
                    <div className="h-full bg-gray-400 rounded-full opacity-60"></div>
                  </div>
                  <div className="ml-3">
                    <div className="text-center mb-2">
                      <BookOpen className="w-6 h-6 mx-auto text-yellow-600" />
                      <div className="text-xs font-bold text-gray-800">Class Network</div>
                    </div>
                    <div className="flex-1 text-xs space-y-1">
                      <div className="bg-white p-1 rounded border">
                        <div className="font-semibold">Nick Fisher</div>
                        <div className="text-gray-600">Did anybody...</div>
                      </div>
                      <div className="bg-white p-1 rounded border">
                        <div className="font-semibold">Amanda</div>
                        <div className="text-gray-600">What was...</div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <div className="relative h-32 overflow-hidden">
                    <img
                      src={file.thumbnail || "/placeholder.svg"}
                      alt={file.name}
                      className="w-full h-full object-cover"
                      style={{
                        filter: file.type === "pdf" ? "none" : "brightness(1.1) contrast(1.1)",
                      }}
                    />
                    {/* Textbook spine effect for PDFs */}
                    {file.type === "pdf" && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-r from-gray-600 to-gray-400 opacity-80"></div>
                    )}
                    {/* Glossy cover effect for textbooks */}
                    {file.type === "pdf" && (
                      <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent pointer-events-none"></div>
                    )}
                  </div>
                  <div className="p-1 bg-white">
                    <div className="text-xs font-medium truncate text-gray-800">{file.name}</div>
                  </div>
                </>
              )}

              {/* File Type Icon */}
              <div className="absolute bottom-1 right-1">{getFileIcon(file)}</div>
            </div>

            {/* Move Mode Indicator */}
            {moveMode && (
              <div className="absolute -top-2 -right-2 bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">
                ↔
              </div>
            )}
          </div>
        ))}

        {/* Folders */}
        {folders.map((folder) => (
          <div
            key={folder.id}
            className={`absolute cursor-pointer transform transition-all duration-200 z-10 ${
              moveMode ? "hover:scale-110" : "hover:scale-105"
            } ${draggedItem === folder.id ? "opacity-50" : ""} ${
              dragOverFolder === folder.id ? "ring-4 ring-yellow-400" : ""
            }`}
            style={{
              left: `${folder.position.x}%`,
              top: `${folder.position.y}%`,
              transform: `rotate(${folder.position.rotation}deg)`,
              "--mouse-x": `${mousePosition.x}px`,
              "--mouse-y": `${mousePosition.y}px`,
            }}
            draggable={moveMode}
            onDragStart={(e) => handleDragStart(e, folder.id, "folder")}
            onDragEnd={handleDragEnd}
            onDragOver={(e) => {
              e.preventDefault()
              setDragOverFolder(folder.id)
            }}
            onDragLeave={() => setDragOverFolder(null)}
            onDrop={(e) => {
              e.stopPropagation()
              handleDrop(e, "folder", folder.id)
            }}
            onClick={() => handleFolderClick(folder)}
          >
            <div className="w-32 h-40 bg-yellow-400 border-2 border-yellow-600 rounded shadow-lg relative">
              <div className="p-2 h-full flex flex-col">
                <div className="text-center mb-2">
                  <Folder className="w-8 h-8 mx-auto text-yellow-800" />
                  <div className="text-xs font-bold text-yellow-900 truncate">{folder.name}</div>
                </div>
                <div className="flex-1 text-xs text-yellow-800">{folder.files.length} files</div>
              </div>

              {/* Move Mode Indicator */}
              {moveMode && (
                <div className="absolute -top-2 -right-2 bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">
                  ↔
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Sticky Notes */}
        {stickyNotes.map((note) => (
          <div
            key={note.id}
            className={`absolute cursor-pointer transform transition-all duration-200 z-10 ${
              moveMode ? "hover:scale-110" : "hover:scale-110"
            } ${draggedItem === note.id ? "opacity-50" : ""}`}
            style={{
              left: `${note.position.x}%`,
              top: `${note.position.y}%`,
              transform: `rotate(${note.position.rotation}deg)`,
              "--mouse-x": `${mousePosition.x}px`,
              "--mouse-y": `${mousePosition.y}px`,
            }}
            draggable={moveMode}
            onDragStart={(e) => handleDragStart(e, note.id, "note")}
            onDragEnd={handleDragEnd}
            onClick={() => !moveMode && handleStickyNoteClick(note)}
          >
            <div className="w-16 h-16 bg-yellow-300 border border-yellow-400 shadow-lg relative">
              {/* Sticky note fold effect */}
              <div className="absolute top-0 right-0 w-3 h-3 bg-yellow-400 transform rotate-45 translate-x-1 -translate-y-1"></div>

              {/* Note content preview */}
              <div className="p-1 h-full overflow-hidden">
                <div className="text-xs text-gray-700 leading-tight">
                  {note.content.slice(0, 20)}
                  {note.content.length > 20 && "..."}
                </div>
              </div>

              {/* Move Mode Indicator */}
              {moveMode && (
                <div className="absolute -top-2 -right-2 bg-blue-600 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs">
                  ↔
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Media Items */}
        <div className="absolute right-8 top-32 w-48 space-y-4">
          <div className="bg-gray-900 rounded-lg overflow-hidden">
            <img src="/placeholder.svg?height=150&width=200" alt="Movie" className="w-full h-32 object-cover" />
            <div className="p-2 text-white text-sm">It All Ends Here</div>
          </div>

          <div className="bg-teal-400 rounded-lg overflow-hidden">
            <img
              src="/placeholder.svg?height=150&width=200"
              alt="Cipher Sessions"
              className="w-full h-32 object-cover"
            />
          </div>
        </div>
      </div>

      {/* Expanded Bluebook Modal */}
      {showBluebook && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="wood-background rounded-lg w-full max-w-6xl h-full max-h-[90vh] overflow-hidden">
            <div className="bg-blue-700 p-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-blue-100">YsUp Bluebook - Academic Calendar</h2>
              <button onClick={() => setShowBluebook(false)} className="text-blue-100 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-8 h-full overflow-y-auto">
              <div className="bg-blue-200 rounded-lg shadow-2xl p-8 border-l-8 border-blue-400 max-w-4xl mx-auto">
                <div className="notebook-holes"></div>

                <div className="ml-12">
                  {/* Create Event Section */}
                  <div className="mb-6 text-center">
                    <button
                      onClick={() => setShowCreateEvent(true)}
                      className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg flex items-center space-x-2 mx-auto"
                    >
                      <Plus className="w-5 h-5" />
                      <span>Create New Event</span>
                    </button>
                  </div>

                  {showCreateEvent && (
                    <div className="mb-6 bg-blue-50 p-6 rounded-lg border">
                      <h3 className="text-lg font-bold text-blue-800 mb-4">Create New Event</h3>
                      <div className="space-y-4">
                        <input
                          type="text"
                          placeholder="Event Title"
                          value={newEvent.title}
                          onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                          className="w-full px-3 py-2 border rounded"
                        />
                        <div className="grid grid-cols-2 gap-4">
                          <input
                            type="time"
                            value={newEvent.time}
                            onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
                            className="px-3 py-2 border rounded"
                          />
                          <input
                            type="date"
                            value={newEvent.date}
                            onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                            className="px-3 py-2 border rounded"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">Invite Classmates:</label>
                          <div className="max-h-48 overflow-y-auto border rounded p-3 bg-white">
                            {classmates.map((student) => (
                                <div key={student} className="flex items-center space-x-2 mb-2">
                                  <input
                                    type="checkbox"
                                    id={`invite-${student}`}
                                    checked={newEvent.selectedInvitees.includes(student)}
                                    onChange={() => toggleInvitee(student)}
                                    className="w-4 h-4 text-blue-600"
                                  />
                                  <label htmlFor={`invite-${student}`} className="text-sm cursor-pointer">
                                    {student}
                                  </label>
                                </div>
                              ))}
                          </div>
                          <div className="mt-2 text-sm text-gray-600">
                            Selected: {newEvent.selectedInvitees.length} classmates
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={handleCreateEvent}
                            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
                          >
                            Create Event
                          </button>
                          <button
                            onClick={() => setShowCreateEvent(false)}
                            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-8">
                    <div className="bg-blue-100 p-6 rounded-lg">
                      <div className="flex justify-between items-center mb-4">
                        <button className="text-blue-600 text-sm hover:underline">Back to Top</button>
                        <button className="text-blue-600 text-sm hover:underline">Previous Day</button>
                      </div>
                      <div className="space-y-4 text-sm">
                        <div className="bg-white p-3 rounded shadow">
                          <strong className="text-blue-800">3:00pm</strong>
                          <div>Calculus 2 Lecture</div>
                          <div className="text-gray-600">Professor Johnson - Science Hall 201</div>
                        </div>
                        <div className="bg-white p-3 rounded shadow">
                          <strong className="text-blue-800">5:00pm</strong>
                          <div>Principles of Economics 3 Lecture</div>
                          <div className="text-gray-600">Professor Smith - Business Building 105</div>
                        </div>
                      </div>
                      <div className="text-center mt-6 p-4 bg-blue-50 rounded">
                        <div className="text-2xl font-bold text-blue-800">December 19</div>
                        <div className="text-lg text-blue-600">Friday</div>
                      </div>
                    </div>

                    <div className="bg-blue-100 p-6 rounded-lg">
                      <div className="flex justify-between items-center mb-4">
                        <button className="text-blue-600 text-sm hover:underline">Back to Top</button>
                        <button className="text-blue-600 text-sm hover:underline">Next Day</button>
                      </div>
                      <div className="space-y-4 text-sm">
                        <div className="bg-white p-3 rounded shadow">
                          <strong className="text-blue-800">3:00pm</strong>
                          <div>Movie Night: Harry Potter Part 2</div>
                          <div className="text-gray-600">Student Center Theater</div>
                        </div>
                        <div className="bg-white p-3 rounded shadow">
                          <strong className="text-blue-800">5:30pm</strong>
                          <div>Freshman Composition Term Paper Due</div>
                          <div className="text-gray-600">Submit online via portal</div>
                        </div>
                        <div className="bg-white p-3 rounded shadow">
                          <strong className="text-blue-800">7:30pm</strong>
                          <div>Finish Laundry</div>
                          <div className="text-gray-600">Dormitory basement</div>
                        </div>
                        <div className="bg-white p-3 rounded shadow">
                          <strong className="text-blue-800">8:30pm</strong>
                          <div>Usher @ Ibiza Ladies Free</div>
                          <div className="text-gray-600">Downtown venue</div>
                        </div>
                      </div>
                      <div className="text-center mt-6 p-4 bg-blue-50 rounded">
                        <div className="text-2xl font-bold text-blue-800">December 20</div>
                        <div className="text-lg text-blue-600">Saturday</div>
                      </div>
                    </div>
                  </div>

                  {/* Calendar Navigation */}
                  <div className="flex justify-center items-center space-x-4 mt-8">
                    <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">
                      Previous Week
                    </button>
                    <span className="text-blue-800 font-medium">Week of December 19-25, 2012</span>
                    <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">Next Week</button>
                  </div>
                </div>
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
                  onChange={(e) => setSearchNetworkQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearchNetworks()}
                  placeholder="Search by network name..."
                  className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
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
                  <img
                    src={profileData.profileImage || "/placeholder.svg"}
                    alt="Profile"
                    className="w-32 h-32 rounded-full object-cover border-4 border-gray-300"
                  />
                  <button className="absolute bottom-0 right-0 bg-blue-600 text-white rounded-full p-2 hover:bg-blue-700">
                    <User className="w-4 h-4" />
                  </button>
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

      {/* File Viewer Modal */}
      {showFileViewer && selectedFile && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-6xl h-full max-h-[95vh] overflow-hidden shadow-2xl">
            {/* Header */}
            <div className="bg-gray-800 text-white p-4 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="text-lg font-bold">{selectedFile.name}</div>
                <div className="text-sm text-gray-300">{selectedFile.type.toUpperCase()} Document</div>
              </div>
              <div className="flex items-center space-x-2">
                <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded flex items-center space-x-2">
                  <Download className="w-4 h-4" />
                  <span>Download</span>
                </button>
                <button onClick={() => setShowFileViewer(false)} className="text-white hover:text-gray-300">
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* File Content */}
            <div className="h-full bg-gray-100 p-8 overflow-y-auto">
              {selectedFile.type === "pdf" ? (
                // Virtual Textbook View for PDFs
                <div className="max-w-4xl mx-auto">
                  <div
                    className="bg-white rounded-lg shadow-2xl overflow-hidden"
                    style={{
                      background:
                        "linear-gradient(45deg, #f8f9fa 25%, transparent 25%), linear-gradient(-45deg, #f8f9fa 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #f8f9fa 75%), linear-gradient(-45deg, transparent 75%, #f8f9fa 75%)",
                      backgroundSize: "20px 20px",
                      backgroundPosition: "0 0, 0 10px, 10px -10px, -10px 0px",
                    }}
                  >
                    {/* Book Spine Effect */}
                    <div className="flex">
                      <div className="w-8 bg-gradient-to-r from-gray-700 to-gray-600 shadow-inner"></div>
                      <div className="flex-1 bg-white">
                        {/* Page Content */}
                        <div className="p-8 min-h-[600px]">
                          <div className="text-center mb-8">
                            <h1 className="text-3xl font-bold text-gray-800 mb-2">{selectedFile.name}</h1>
                            <div className="w-24 h-1 bg-blue-600 mx-auto"></div>
                          </div>

                          {/* Sample PDF Content */}
                          <div className="space-y-6 text-gray-700 leading-relaxed">
                            <div className="text-xl font-semibold text-gray-800">Chapter 1: Introduction</div>
                            <p>
                              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt
                              ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation
                              ullamco laboris nisi ut aliquip ex ea commodo consequat.
                            </p>
                            <p>
                              Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat
                              nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia
                              deserunt mollit anim id est laborum.
                            </p>

                            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 my-6">
                              <div className="font-semibold text-blue-800">Key Concept:</div>
                              <div className="text-blue-700">
                                This is an important concept that students should remember for the exam.
                              </div>
                            </div>

                            <div className="text-lg font-semibold text-gray-800">1.1 Basic Principles</div>
                            <p>
                              Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque
                              laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi
                              architecto beatae vitae dicta sunt explicabo.
                            </p>

                            {/* Sample Math Equation */}
                            <div className="bg-gray-50 p-4 rounded-lg text-center my-6">
                              <div className="text-lg font-mono">f(x) = ax² + bx + c</div>
                            </div>

                            <p>
                              Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia
                              consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.
                            </p>
                          </div>

                          {/* Page Number */}
                          <div className="text-center mt-12 text-gray-500 text-sm">Page 1 of 247</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Page Navigation */}
                  <div className="flex justify-center items-center space-x-4 mt-6">
                    <button className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded">
                      Previous Page
                    </button>
                    <span className="text-gray-600">Page 1 of 247</span>
                    <button className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded">Next Page</button>
                  </div>
                </div>
              ) : selectedFile.type === "ppt" ? (
                // PowerPoint Presentation View
                <div className="max-w-4xl mx-auto">
                  <div className="bg-white rounded-lg shadow-2xl overflow-hidden">
                    <div className="bg-gradient-to-r from-orange-500 to-red-500 p-6 text-white">
                      <h1 className="text-2xl font-bold">{selectedFile.name}</h1>
                      <p className="text-orange-100">PowerPoint Presentation</p>
                    </div>
                    <div className="p-8 min-h-[500px]">
                      <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold text-gray-800 mb-4">Slide Title</h2>
                        <div className="space-y-4 text-left max-w-2xl mx-auto">
                          <div className="flex items-center space-x-3">
                            <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                            <span>First bullet point about the topic</span>
                          </div>
                          <div className="flex items-center space-x-3">
                            <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                            <span>Second important point to remember</span>
                          </div>
                          <div className="flex items-center space-x-3">
                            <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                            <span>Third key concept for understanding</span>
                          </div>
                        </div>
                      </div>

                      <div className="bg-orange-50 p-6 rounded-lg">
                        <img
                          src="/placeholder.svg?height=200&width=400"
                          alt="Presentation graphic"
                          className="mx-auto rounded"
                        />
                      </div>
                    </div>

                    {/* Slide Navigation */}
                    <div className="bg-gray-100 p-4 flex justify-between items-center">
                      <button className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded">
                        Previous Slide
                      </button>
                      <span className="text-gray-600">Slide 1 of 15</span>
                      <button className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded">
                        Next Slide
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                // Document View for DOC files
                <div className="max-w-4xl mx-auto">
                  <div className="bg-white rounded-lg shadow-2xl p-8 min-h-[600px]">
                    <div className="text-center mb-8">
                      <h1 className="text-2xl font-bold text-gray-800 mb-2">{selectedFile.name}</h1>
                      <div className="w-16 h-1 bg-blue-600 mx-auto"></div>
                    </div>

                    <div className="space-y-4 text-gray-700 leading-relaxed">
                      <p>
                        This is a sample document view. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
                        eiusmod tempor incididunt ut labore et dolore magna aliqua.
                      </p>
                      <p>
                        Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo
                        consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu
                        fugiat nulla pariatur.
                      </p>
                      <p>
                        Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim
                        id est laborum.
                      </p>
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
    </div>
  )
}
