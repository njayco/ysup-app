"use client"

import { useState, useEffect, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import Header from "@/components/Header"
import {
  ArrowLeft,
  Users,
  Globe,
  Lock,
  ThumbsUp,
  MessageCircle,
  Plus,
  X,
  Link2,
  Copy,
  Check,
  Shield,
  Send,
  Share2,
  Mail,
  MessageSquare,
  Upload,
  FileText,
  Download,
} from "lucide-react"

interface NetworkMember {
  id: number
  first_name: string
  last_name: string
  username: string
}

interface PostResponse {
  id: number
  content: string
  author_first_name: string
  author_last_name: string
  created_at: string
}

interface NetworkPost {
  id: number
  content: string
  cosigns: number
  author_first_name: string
  author_last_name: string
  author_username: string
  created_at: string
  responses: PostResponse[]
}

interface JoinRequest {
  id: number
  first_name: string
  last_name: string
  username: string
  college: string
  created_at: string
}

interface SharedFile {
  id: number
  file_name: string
  file_type: string
  file_size: number
  created_at: string
  uploader_username: string
  uploader_first_name: string
  uploader_last_name: string
}

interface NetworkDetail {
  id: number
  name: string
  slug: string
  description: string
  type: string
  privacy: string
  member_count: number
  mod_first_name: string
  mod_last_name: string
  mod_username: string
  moderator_user_id: number
}

export default function NetworkPage() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string

  const [network, setNetwork] = useState<NetworkDetail | null>(null)
  const [members, setMembers] = useState<NetworkMember[]>([])
  const [posts, setPosts] = useState<NetworkPost[]>([])
  const [isMember, setIsMember] = useState(false)
  const [joinStatus, setJoinStatus] = useState("none")
  const [canModerate, setCanModerate] = useState(false)
  const [loading, setLoading] = useState(true)
  const [newPostContent, setNewPostContent] = useState("")
  const [showCreatePost, setShowCreatePost] = useState(false)
  const [posting, setPosting] = useState(false)
  const [expandedResponses, setExpandedResponses] = useState<number[]>([])
  const [newResponse, setNewResponse] = useState<{ [key: number]: string }>({})
  const [showShareModal, setShowShareModal] = useState(false)
  const [linkCopied, setLinkCopied] = useState(false)
  const [showMembers, setShowMembers] = useState(false)
  const [showRequests, setShowRequests] = useState(false)
  const [joinRequests, setJoinRequests] = useState<JoinRequest[]>([])
  const [joiningNetwork, setJoiningNetwork] = useState(false)
  const [showSharedFiles, setShowSharedFiles] = useState(false)
  const [sharedFiles, setSharedFiles] = useState<SharedFile[]>([])
  const [uploadingFile, setUploadingFile] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const getUserId = () => {
    const stored = localStorage.getItem("currentUser")
    if (!stored) return null
    const user = JSON.parse(stored)
    return user.id
  }

  const fetchNetwork = async () => {
    const userId = getUserId()
    try {
      const res = await fetch(`/api/networks/${slug}?userId=${userId || ""}`)
      const data = await res.json()
      if (data.success) {
        setNetwork(data.network)
        setMembers(data.members)
        setIsMember(data.isMember)
        setJoinStatus(data.joinStatus)
        setCanModerate(data.canModerate)
        setPosts(data.posts || [])
      } else {
        router.push("/dashboard")
      }
    } catch (err) {
      console.error("Fetch network error:", err)
      router.push("/dashboard")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchNetwork()
  }, [slug])

  const handleJoin = async () => {
    const userId = getUserId()
    if (!userId) return router.push("/login")
    setJoiningNetwork(true)
    try {
      const res = await fetch(`/api/networks/${slug}/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      })
      const data = await res.json()
      if (data.success) {
        if (data.joined) {
          setIsMember(true)
          fetchNetwork()
        } else if (data.requested) {
          setJoinStatus("pending")
        }
      }
    } catch (err) {
      console.error("Join error:", err)
    } finally {
      setJoiningNetwork(false)
    }
  }

  const handleCreatePost = async () => {
    const userId = getUserId()
    if (!userId || !newPostContent.trim()) return
    setPosting(true)
    try {
      const res = await fetch(`/api/networks/${slug}/posts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, content: newPostContent }),
      })
      const data = await res.json()
      if (data.success) {
        setPosts([data.post, ...posts])
        setNewPostContent("")
        setShowCreatePost(false)
      }
    } catch (err) {
      console.error("Create post error:", err)
    } finally {
      setPosting(false)
    }
  }

  const handleCosign = async (postId: number) => {
    const userId = getUserId()
    if (!userId) return
    try {
      const res = await fetch(`/api/networks/posts/${postId}/cosign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      })
      const data = await res.json()
      if (data.success) {
        setPosts(posts.map((p) => (p.id === postId ? { ...p, cosigns: data.cosigns } : p)))
      }
    } catch (err) {
      console.error("Cosign error:", err)
    }
  }

  const handleAddResponse = async (postId: number) => {
    const userId = getUserId()
    const content = newResponse[postId]
    if (!userId || !content?.trim()) return
    try {
      const res = await fetch(`/api/networks/posts/${postId}/respond`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, content }),
      })
      const data = await res.json()
      if (data.success) {
        setPosts(
          posts.map((p) =>
            p.id === postId ? { ...p, responses: [...p.responses, data.response] } : p
          )
        )
        setNewResponse({ ...newResponse, [postId]: "" })
      }
    } catch (err) {
      console.error("Add response error:", err)
    }
  }

  const fetchRequests = async () => {
    const userId = getUserId()
    if (!userId) return
    try {
      const res = await fetch(`/api/networks/${slug}/requests?userId=${userId}`)
      const data = await res.json()
      if (data.success) {
        setJoinRequests(data.requests)
      }
    } catch (err) {
      console.error("Fetch requests error:", err)
    }
  }

  const handleApprove = async (requestId: number) => {
    const userId = getUserId()
    try {
      await fetch(`/api/networks/${slug}/requests/${requestId}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      })
      setJoinRequests(joinRequests.filter((r) => r.id !== requestId))
      fetchNetwork()
    } catch (err) {
      console.error("Approve error:", err)
    }
  }

  const handleDeny = async (requestId: number) => {
    const userId = getUserId()
    try {
      await fetch(`/api/networks/${slug}/requests/${requestId}/deny`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      })
      setJoinRequests(joinRequests.filter((r) => r.id !== requestId))
    } catch (err) {
      console.error("Deny error:", err)
    }
  }

  const getInviteLink = () => `${window.location.origin}/invite/network/${slug}`

  const copyLink = () => {
    navigator.clipboard.writeText(getInviteLink())
    setLinkCopied(true)
    setTimeout(() => setLinkCopied(false), 2000)
  }

  const shareViaSMS = () => {
    const msg = encodeURIComponent(`Join my class network "${network?.name}" on YsUp! ${getInviteLink()}`)
    window.open(`sms:?body=${msg}`, "_blank")
  }

  const shareViaEmail = () => {
    const subject = encodeURIComponent(`Join "${network?.name}" on YsUp Campus`)
    const body = encodeURIComponent(`Hey! Join my class network "${network?.name}" on YsUp Campus.\n\n${getInviteLink()}`)
    window.open(`mailto:?subject=${subject}&body=${body}`, "_blank")
  }

  const shareViaWhatsApp = () => {
    const msg = encodeURIComponent(`Join my class network "${network?.name}" on YsUp! ${getInviteLink()}`)
    window.open(`https://wa.me/?text=${msg}`, "_blank")
  }

  const shareViaInstagram = () => {
    navigator.clipboard.writeText(getInviteLink())
    setLinkCopied(true)
    setTimeout(() => setLinkCopied(false), 2000)
    alert("Link copied! Paste it in your Instagram DM or story.")
  }

  const shareViaX = () => {
    const msg = encodeURIComponent(`Join my class network "${network?.name}" on YsUp Campus! ${getInviteLink()}`)
    window.open(`https://twitter.com/intent/tweet?text=${msg}`, "_blank")
  }

  const fetchSharedFiles = async () => {
    const userId = getUserId()
    if (!userId) return
    try {
      const res = await fetch(`/api/networks/${slug}/files?userId=${userId}`)
      const data = await res.json()
      if (data.files) setSharedFiles(data.files)
    } catch (err) {
      console.error("Fetch shared files error:", err)
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const userId = getUserId()
    if (!userId) return

    setUploadingFile(true)
    try {
      const reader = new FileReader()
      reader.onload = async () => {
        const fileData = reader.result as string
        const res = await fetch(`/api/networks/${slug}/files`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId,
            fileName: file.name,
            fileType: file.type,
            fileSize: file.size,
            fileData,
          }),
        })
        const data = await res.json()
        if (data.id) {
          setSharedFiles([data, ...sharedFiles])
        }
        setUploadingFile(false)
      }
      reader.readAsDataURL(file)
    } catch (err) {
      console.error("File upload error:", err)
      setUploadingFile(false)
    }
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  const downloadSharedFile = async (fileId: number, fileName: string) => {
    const userId = getUserId()
    if (!userId) return
    try {
      const res = await fetch(`/api/networks/shared-files?userId=${userId}&fileId=${fileId}`)
      const data = await res.json()
      if (data.file_data) {
        const link = document.createElement("a")
        link.href = data.file_data
        link.download = fileName
        link.click()
      }
    } catch (err) {
      console.error("Download error:", err)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (!bytes) return ""
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const toggleResponses = (postId: number) => {
    setExpandedResponses(
      expandedResponses.includes(postId)
        ? expandedResponses.filter((id) => id !== postId)
        : [...expandedResponses, postId]
    )
  }

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr)
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })
  }

  if (loading) {
    return (
      <div className="min-h-screen wood-background flex items-center justify-center">
        <div className="text-amber-200 text-lg">Loading network...</div>
      </div>
    )
  }

  if (!network) {
    return (
      <div className="min-h-screen wood-background flex items-center justify-center">
        <div className="text-amber-200 text-lg">Network not found</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen wood-background">
      <Header />
      <div className="max-w-4xl mx-auto px-4 md:p-6 pt-16 md:pt-20">
        <button
          onClick={() => router.push("/dashboard")}
          className="flex items-center space-x-2 text-amber-300 hover:text-amber-100 mb-4 md:mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Dashboard</span>
        </button>

        <div className="bg-amber-900 bg-opacity-60 rounded-xl p-4 md:p-6 border border-amber-700 mb-4 md:mb-6">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
            <div className="flex items-start space-x-3 md:space-x-4">
              <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-amber-600 flex items-center justify-center text-white font-bold text-lg md:text-2xl flex-shrink-0">
                {network.name.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <h1 className="text-xl md:text-2xl font-bold text-amber-100">{network.name}</h1>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs md:text-sm text-amber-300 mt-1">
                  <span className="capitalize">{network.type}</span>
                  <span>•</span>
                  {network.privacy === "public" ? (
                    <span className="flex items-center space-x-1"><Globe className="w-3 h-3 md:w-4 md:h-4" /><span>Public</span></span>
                  ) : (
                    <span className="flex items-center space-x-1"><Lock className="w-3 h-3 md:w-4 md:h-4" /><span>Private</span></span>
                  )}
                  <span>•</span>
                  <span className="flex items-center space-x-1"><Users className="w-3 h-3 md:w-4 md:h-4" /><span>{network.member_count} members</span></span>
                </div>
                <p className="text-amber-200 mt-2 text-sm md:text-base">{network.description}</p>
                <p className="text-xs text-amber-400 mt-1">
                  Moderated by {network.mod_first_name} {network.mod_last_name}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2 flex-shrink-0">
              {isMember && (
                <button
                  onClick={() => setShowShareModal(true)}
                  className="bg-amber-700 hover:bg-amber-600 text-white px-3 py-2 rounded-lg flex items-center space-x-1 text-sm"
                >
                  <Share2 className="w-4 h-4" />
                  <span>Share</span>
                </button>
              )}
              {isMember && (
                <button
                  onClick={() => { setShowSharedFiles(!showSharedFiles); if (!showSharedFiles) fetchSharedFiles(); }}
                  className="bg-amber-700 hover:bg-amber-600 text-white px-3 py-2 rounded-lg flex items-center space-x-1 text-sm"
                >
                  <FileText className="w-4 h-4" />
                  <span>Share Files</span>
                </button>
              )}
              {isMember && (
                <button
                  onClick={() => setShowMembers(!showMembers)}
                  className="bg-amber-700 hover:bg-amber-600 text-white px-3 py-2 rounded-lg flex items-center space-x-1 text-sm"
                >
                  <Users className="w-4 h-4" />
                  <span>Members</span>
                </button>
              )}
              {canModerate && network.privacy === "private" && (
                <button
                  onClick={() => { setShowRequests(!showRequests); if (!showRequests) fetchRequests(); }}
                  className="bg-amber-700 hover:bg-amber-600 text-white px-3 py-2 rounded-lg flex items-center space-x-1 text-sm"
                >
                  <Shield className="w-4 h-4" />
                  <span>Requests</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {!isMember && (
          <div className="bg-amber-900 bg-opacity-60 rounded-xl p-8 border border-amber-700 text-center mb-6">
            {joinStatus === "pending" ? (
              <>
                <Lock className="w-12 h-12 mx-auto text-amber-400 mb-3" />
                <h3 className="text-lg font-bold text-amber-100 mb-2">Join Request Pending</h3>
                <p className="text-amber-300">The moderator will review your request.</p>
              </>
            ) : joinStatus === "denied" ? (
              <>
                <X className="w-12 h-12 mx-auto text-red-400 mb-3" />
                <h3 className="text-lg font-bold text-amber-100 mb-2">Request Denied</h3>
                <p className="text-amber-300">Your join request was not approved.</p>
              </>
            ) : (
              <>
                <Users className="w-12 h-12 mx-auto text-amber-400 mb-3" />
                <h3 className="text-lg font-bold text-amber-100 mb-2">
                  {network.privacy === "public" ? "Join this Network" : "Request to Join"}
                </h3>
                <p className="text-amber-300 mb-4">
                  {network.privacy === "public"
                    ? "This is a public network. Click below to join instantly."
                    : "This is a private network. Your request will be reviewed by the moderator."}
                </p>
                <button
                  onClick={handleJoin}
                  disabled={joiningNetwork}
                  className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg text-lg disabled:opacity-50"
                >
                  {joiningNetwork ? "Processing..." : network.privacy === "public" ? "Join Network" : "Request to Join"}
                </button>
              </>
            )}
          </div>
        )}

        {showShareModal && (
          <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4" onClick={() => setShowShareModal(false)}>
            <div className="bg-amber-950 border border-amber-700 rounded-xl p-6 w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-amber-100">Share Network</h3>
                <button onClick={() => setShowShareModal(false)} className="text-amber-400 hover:text-amber-100"><X className="w-5 h-5" /></button>
              </div>
              <p className="text-amber-300 text-sm mb-4">Invite others to join <span className="font-semibold text-amber-100">{network.name}</span></p>
              <div className="space-y-2">
                <button onClick={shareViaSMS} className="w-full flex items-center space-x-3 p-3 bg-amber-900 bg-opacity-60 hover:bg-opacity-80 rounded-lg text-amber-100 transition-colors">
                  <MessageSquare className="w-5 h-5 text-green-400" />
                  <span>SMS / Text Message</span>
                </button>
                <button onClick={shareViaEmail} className="w-full flex items-center space-x-3 p-3 bg-amber-900 bg-opacity-60 hover:bg-opacity-80 rounded-lg text-amber-100 transition-colors">
                  <Mail className="w-5 h-5 text-blue-400" />
                  <span>Email</span>
                </button>
                <button onClick={shareViaWhatsApp} className="w-full flex items-center space-x-3 p-3 bg-amber-900 bg-opacity-60 hover:bg-opacity-80 rounded-lg text-amber-100 transition-colors">
                  <svg className="w-5 h-5 text-green-500" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.625.846 5.059 2.284 7.034L.789 23.492a.5.5 0 00.611.611l4.458-1.495A11.943 11.943 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-2.37 0-4.567-.7-6.42-1.9l-.147-.097-3.064 1.027 1.027-3.064-.097-.147A9.953 9.953 0 012 12C2 6.486 6.486 2 12 2s10 4.486 10 10-4.486 10-10 10z"/></svg>
                  <span>WhatsApp</span>
                </button>
                <button onClick={shareViaInstagram} className="w-full flex items-center space-x-3 p-3 bg-amber-900 bg-opacity-60 hover:bg-opacity-80 rounded-lg text-amber-100 transition-colors">
                  <svg className="w-5 h-5 text-pink-400" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
                  <span>Instagram</span>
                </button>
                <button onClick={shareViaX} className="w-full flex items-center space-x-3 p-3 bg-amber-900 bg-opacity-60 hover:bg-opacity-80 rounded-lg text-amber-100 transition-colors">
                  <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                  <span>X (Twitter)</span>
                </button>
                <div className="border-t border-amber-800 my-2"></div>
                <button onClick={copyLink} className="w-full flex items-center space-x-3 p-3 bg-amber-800 hover:bg-amber-700 rounded-lg text-amber-100 transition-colors">
                  {linkCopied ? <><Check className="w-5 h-5 text-green-400" /><span>Link Copied!</span></> : <><Copy className="w-5 h-5 text-amber-300" /><span>Copy Link</span></>}
                </button>
              </div>
            </div>
          </div>
        )}

        {showSharedFiles && (
          <div className="bg-amber-900 bg-opacity-60 rounded-xl p-4 border border-amber-700 mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-amber-100">Shared Files</h3>
              <div>
                <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.jpg,.jpeg,.png,.gif,.xlsx,.csv" />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingFile}
                  className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg flex items-center space-x-1 text-sm disabled:opacity-50"
                >
                  <Upload className="w-4 h-4" />
                  <span>{uploadingFile ? "Uploading..." : "Share a File"}</span>
                </button>
              </div>
            </div>
            {sharedFiles.length === 0 ? (
              <p className="text-amber-300 text-sm">No files shared yet. Be the first to share a file!</p>
            ) : (
              <div className="space-y-2">
                {sharedFiles.map((f) => (
                  <div key={f.id} className="flex items-center justify-between bg-amber-800 bg-opacity-40 rounded p-3">
                    <div className="flex items-center space-x-3 min-w-0">
                      <FileText className="w-8 h-8 text-amber-300 flex-shrink-0" />
                      <div className="min-w-0">
                        <div className="text-amber-100 font-medium truncate">{f.file_name}</div>
                        <div className="text-xs text-amber-400">
                          Sent from +{f.uploader_username} {f.file_size ? `• ${formatFileSize(f.file_size)}` : ""} • {formatDate(f.created_at)}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => downloadSharedFile(f.id, f.file_name)}
                      className="text-amber-300 hover:text-amber-100 flex-shrink-0 ml-2"
                      title="Download"
                    >
                      <Download className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {showMembers && (
          <div className="bg-amber-900 bg-opacity-60 rounded-xl p-4 border border-amber-700 mb-6">
            <h3 className="font-bold text-amber-100 mb-3">Members ({members.length})</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {members.map((m) => (
                <div key={m.id} className="flex items-center space-x-2 text-amber-200 text-sm p-2 bg-amber-800 bg-opacity-40 rounded">
                  <div className="w-8 h-8 rounded-full bg-amber-600 flex items-center justify-center text-white text-xs font-bold">
                    {m.first_name.charAt(0)}{m.last_name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-medium">{m.first_name} {m.last_name}</div>
                    <div className="text-xs text-amber-400">+{m.username}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {showRequests && (
          <div className="bg-amber-900 bg-opacity-60 rounded-xl p-4 border border-amber-700 mb-6">
            <h3 className="font-bold text-amber-100 mb-3">Pending Join Requests</h3>
            {joinRequests.length === 0 ? (
              <p className="text-amber-300 text-sm">No pending requests.</p>
            ) : (
              <div className="space-y-2">
                {joinRequests.map((req) => (
                  <div key={req.id} className="flex items-center justify-between bg-amber-800 bg-opacity-40 rounded p-3">
                    <div>
                      <div className="text-amber-100 font-medium">{req.first_name} {req.last_name}</div>
                      <div className="text-xs text-amber-400">+{req.username} • {req.college}</div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleApprove(req.id)}
                        className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleDeny(req.id)}
                        className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
                      >
                        Deny
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {isMember && (
          <div>
            <div className="mb-4">
              {!showCreatePost ? (
                <button
                  onClick={() => setShowCreatePost(true)}
                  className="w-full bg-amber-900 bg-opacity-60 border border-amber-700 rounded-xl p-4 text-left text-amber-400 hover:text-amber-200 hover:border-amber-500 transition-colors"
                >
                  What&apos;s on your mind?
                </button>
              ) : (
                <div className="bg-amber-900 bg-opacity-60 border border-amber-700 rounded-xl p-4">
                  <textarea
                    value={newPostContent}
                    onChange={(e) => setNewPostContent(e.target.value)}
                    placeholder="Share something with your network..."
                    className="w-full h-24 bg-amber-800 bg-opacity-40 text-amber-100 rounded-lg p-3 resize-none focus:outline-none focus:ring-2 focus:ring-amber-500 placeholder-amber-500"
                    autoFocus
                  />
                  <div className="flex justify-end space-x-2 mt-2">
                    <button
                      onClick={() => { setShowCreatePost(false); setNewPostContent(""); }}
                      className="px-4 py-2 text-amber-300 hover:text-amber-100"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleCreatePost}
                      disabled={posting || !newPostContent.trim()}
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center space-x-1 disabled:opacity-50"
                    >
                      <Send className="w-4 h-4" />
                      <span>{posting ? "Posting..." : "Post"}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {posts.length === 0 ? (
              <div className="text-center py-12">
                <MessageCircle className="w-12 h-12 mx-auto text-amber-500 mb-3" />
                <p className="text-amber-300">No posts yet. Be the first to share something!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {posts.map((post) => (
                  <div key={post.id} className="bg-amber-900 bg-opacity-60 rounded-xl p-4 border border-amber-700">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-10 h-10 rounded-full bg-amber-600 flex items-center justify-center text-white font-bold">
                        {post.author_first_name.charAt(0)}{post.author_last_name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-semibold text-amber-100">
                          {post.author_first_name} {post.author_last_name}
                        </div>
                        <div className="text-xs text-amber-400">{formatDate(post.created_at)}</div>
                      </div>
                    </div>

                    <p className="text-amber-200 mb-3 whitespace-pre-wrap">{post.content}</p>

                    <div className="flex items-center space-x-4">
                      <button
                        onClick={() => handleCosign(post.id)}
                        className="bg-green-700 hover:bg-green-600 text-white px-3 py-1 rounded flex items-center space-x-1 text-sm"
                      >
                        <ThumbsUp className="w-4 h-4" />
                        <span>TRUE ({post.cosigns})</span>
                      </button>
                      <button
                        onClick={() => toggleResponses(post.id)}
                        className="bg-blue-700 hover:bg-blue-600 text-white px-3 py-1 rounded flex items-center space-x-1 text-sm"
                      >
                        <MessageCircle className="w-4 h-4" />
                        <span>Respond ({post.responses.length})</span>
                      </button>
                    </div>

                    {expandedResponses.includes(post.id) && (
                      <div className="mt-4 ml-8 space-y-2">
                        {post.responses.map((response) => (
                          <div key={response.id} className="bg-amber-800 bg-opacity-40 p-3 rounded-lg border-l-4 border-amber-500">
                            <div className="flex items-center space-x-2 mb-1">
                              <span className="font-semibold text-sm text-amber-100">
                                {response.author_first_name} {response.author_last_name}
                              </span>
                              <span className="text-xs text-amber-400">{formatDate(response.created_at)}</span>
                            </div>
                            <p className="text-sm text-amber-200">{response.content}</p>
                          </div>
                        ))}
                        <div className="flex space-x-2">
                          <input
                            type="text"
                            value={newResponse[post.id] || ""}
                            onChange={(e) => setNewResponse({ ...newResponse, [post.id]: e.target.value })}
                            onKeyDown={(e) => e.key === "Enter" && handleAddResponse(post.id)}
                            placeholder="Write a response..."
                            className="flex-1 px-3 py-2 bg-amber-800 bg-opacity-40 text-amber-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 placeholder-amber-500"
                          />
                          <button
                            onClick={() => handleAddResponse(post.id)}
                            className="bg-blue-700 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
                          >
                            <Send className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
