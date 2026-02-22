"use client"

import { useState, useEffect, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import Header from "@/components/Header"
import {
  Loader2,
  Edit3,
  Plus,
  Trash2,
  X,
  Camera,
  Heart,
  MessageCircle,
  ExternalLink,
  Check,
  GraduationCap,
  Briefcase,
  BookOpen,
  Link as LinkIcon,
  Star,
  Upload,
  ChevronLeft,
  ChevronRight,
  Lock,
  Globe,
  UserPlus,
  UserCheck,
  Clock,
  UserX,
  Users,
} from "lucide-react"

interface ProfileUser {
  id: number
  username: string
  firstName: string
  lastName: string
  college: string
  profileImage: string | null
  bio: string
  headline: string
  statusNote: string
  major: string
  graduationYear: string
  createdAt: string
  ybucks: number
  profileVisibility: string
}

interface NetworkItem {
  id: number
  name: string
  slug: string
  type: string
  privacy: string
  logo_url: string | null
  member_count: number
}

interface ResumeSection {
  id: number
  type: string
  title: string
  org: string
  start_date: string
  end_date: string
  is_current: boolean
  description: string
  url: string
  sort_order: number
}

interface MediaItem {
  id: number
  type: string
  data: string
  caption: string
  createdAt: string
  trueCount: number
  commentCount: number
}

interface Comment {
  id: number
  body: string
  mentions: string[]
  createdAt: string
  username: string
  firstName: string
  lastName: string
  profileImage: string | null
}

const RESERVED_ROUTES = [
  "dashboard", "login", "search", "academy", "bookstore", "bulletin-board",
  "bison-homepage", "hilltop", "the-game", "chalkboard", "onboarding",
  "verify-phone", "forgot-password", "privacy-policy", "terms-and-conditions",
  "api", "_next", "about",
]

const SECTION_TYPES = [
  { value: "headline", label: "Headline", icon: Star },
  { value: "about", label: "About", icon: BookOpen },
  { value: "experience", label: "Experience", icon: Briefcase },
  { value: "education", label: "Education", icon: GraduationCap },
  { value: "skill", label: "Skills", icon: Star },
  { value: "link", label: "Links", icon: LinkIcon },
]

function renderMentions(text: string) {
  const parts = text.split(/(\+[a-zA-Z0-9_.]+)/g)
  return parts.map((part, i) => {
    if (part.startsWith("+") && part.length > 1) {
      const usernameKey = part.slice(1).toLowerCase()
      return (
        <a key={i} href={`/${usernameKey}`} className="text-blue-700 hover:underline font-medium">
          {part}
        </a>
      )
    }
    return <span key={i}>{part}</span>
  })
}

export default function ProfilePage() {
  const params = useParams()
  const router = useRouter()
  const usernameParam = (params.username as string) || ""

  const [profileUser, setProfileUser] = useState<ProfileUser | null>(null)
  const [resume, setResume] = useState<ResumeSection[]>([])
  const [media, setMedia] = useState<MediaItem[]>([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [isOwner, setIsOwner] = useState(false)

  const [editingBio, setEditingBio] = useState(false)
  const [editBioValue, setEditBioValue] = useState("")
  const [editHeadline, setEditHeadline] = useState("")
  const [editMajor, setEditMajor] = useState("")
  const [editGradYear, setEditGradYear] = useState("")
  const [savingProfile, setSavingProfile] = useState(false)

  const [editingStatus, setEditingStatus] = useState(false)
  const [statusValue, setStatusValue] = useState("")

  const [showAddSection, setShowAddSection] = useState(false)
  const [newSection, setNewSection] = useState({ type: "experience", title: "", org: "", startDate: "", endDate: "", isCurrent: false, description: "", url: "" })
  const [editingSectionId, setEditingSectionId] = useState<number | null>(null)

  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [loadingComments, setLoadingComments] = useState(false)
  const [newComment, setNewComment] = useState("")
  const [trueState, setTrueState] = useState({ isTrued: false, trueCount: 0 })

  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [activeGalleryTab, setActiveGalleryTab] = useState<"posts" | "tagged">("posts")

  const [followStats, setFollowStats] = useState({ followersCount: 0, followingCount: 0, isFollowing: false, followStatus: null as string | null })
  const [followLoading, setFollowLoading] = useState(false)
  const [publicNetworks, setPublicNetworks] = useState<NetworkItem[]>([])
  const [canViewFullProfile, setCanViewFullProfile] = useState(true)
  const [pendingRequests, setPendingRequests] = useState<any[]>([])
  const [showFollowRequests, setShowFollowRequests] = useState(false)

  useEffect(() => {
    if (RESERVED_ROUTES.includes(usernameParam.toLowerCase())) {
      return
    }

    try {
      const stored = localStorage.getItem("currentUser")
      if (stored) {
        setCurrentUser(JSON.parse(stored))
      }
    } catch {}

    loadProfile()
  }, [usernameParam])

  useEffect(() => {
    if (profileUser && currentUser) {
      const normalizedProfile = profileUser.username.replace(/^\+/, "").toLowerCase()
      const normalizedCurrent = currentUser.username?.replace(/^\+/, "").toLowerCase()
      setIsOwner(normalizedProfile === normalizedCurrent || profileUser.id === currentUser.id)
    }
  }, [profileUser, currentUser])

  const loadProfile = async () => {
    setLoading(true)
    try {
      const stored = localStorage.getItem("currentUser")
      const viewerId = stored ? JSON.parse(stored).id : null
      const res = await fetch(`/api/profile?username=${encodeURIComponent(usernameParam)}&viewerId=${viewerId || ""}`)
      if (!res.ok) {
        setNotFound(true)
        return
      }
      const data = await res.json()
      if (data.error) {
        setNotFound(true)
        return
      }
      setProfileUser(data.user)
      setResume(data.resume || [])
      setMedia(data.media || [])
      setCanViewFullProfile(data.canViewFullProfile !== false)
      setEditBioValue(data.user.bio || "")
      setEditHeadline(data.user.headline || "")
      setEditMajor(data.user.major || "")
      setEditGradYear(data.user.graduationYear || "")
      setStatusValue(data.user.statusNote || "")

      loadFollowStats(data.user.id)
      loadPublicNetworks(data.user.id)
    } catch {
      setNotFound(true)
    } finally {
      setLoading(false)
    }
  }

  const loadFollowStats = async (userId: number) => {
    try {
      const stored = localStorage.getItem("currentUser")
      const viewerId = stored ? JSON.parse(stored).id : null
      const res = await fetch(`/api/follow?userId=${userId}&viewerId=${viewerId || ""}`)
      const data = await res.json()
      setFollowStats({
        followersCount: data.followersCount || 0,
        followingCount: data.followingCount || 0,
        isFollowing: data.isFollowing || false,
        followStatus: data.followStatus || null,
      })
    } catch {}
  }

  const loadPublicNetworks = async (userId: number) => {
    try {
      const res = await fetch(`/api/profile/networks?userId=${userId}`)
      const data = await res.json()
      if (data.success) setPublicNetworks(data.networks)
    } catch {}
  }

  const handleFollow = async () => {
    if (!currentUser || !profileUser || followLoading) return
    setFollowLoading(true)
    try {
      if (followStats.isFollowing || followStats.followStatus === "pending") {
        const res = await fetch(`/api/follow?followerId=${currentUser.id}&followingId=${profileUser.id}`, { method: "DELETE" })
        const data = await res.json()
        if (data.success) {
          setFollowStats({
            followersCount: data.followersCount || 0,
            followingCount: data.followingCount || 0,
            isFollowing: false,
            followStatus: null,
          })
          if (profileUser.profileVisibility === "private") {
            setCanViewFullProfile(false)
            setResume([])
            setMedia([])
          }
        }
      } else {
        const res = await fetch("/api/follow", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ followerId: currentUser.id, followingId: profileUser.id }),
        })
        const data = await res.json()
        if (data.success) {
          setFollowStats({
            followersCount: data.followersCount || 0,
            followingCount: data.followingCount || 0,
            isFollowing: data.followStatus === "accepted",
            followStatus: data.followStatus,
          })
          if (data.followStatus === "accepted") {
            loadProfile()
          }
        }
      }
    } catch {}
    setFollowLoading(false)
  }

  const toggleVisibility = async () => {
    if (!profileUser || !isOwner) return
    const newVis = profileUser.profileVisibility === "private" ? "public" : "private"
    try {
      const res = await fetch("/api/profile/visibility", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: profileUser.id, visibility: newVis }),
      })
      const data = await res.json()
      if (data.success) {
        setProfileUser({ ...profileUser, profileVisibility: newVis })
      }
    } catch {}
  }

  const loadPendingRequests = async () => {
    if (!currentUser) return
    try {
      const res = await fetch(`/api/follow/request?userId=${currentUser.id}`)
      const data = await res.json()
      if (data.success) setPendingRequests(data.requests)
    } catch {}
  }

  const handleFollowRequest = async (followId: number, action: "accept" | "deny") => {
    if (!currentUser) return
    try {
      const res = await fetch("/api/follow/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ followId, action, userId: currentUser.id }),
      })
      const data = await res.json()
      if (data.success) {
        setPendingRequests((prev) => prev.filter((r) => r.id !== followId))
        if (profileUser) loadFollowStats(profileUser.id)
      }
    } catch {}
  }

  const handleFollowBack = async (targetUserId: number) => {
    if (!currentUser) return
    try {
      await fetch("/api/follow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ followerId: currentUser.id, followingId: targetUserId }),
      })
      if (profileUser) loadFollowStats(profileUser.id)
    } catch {}
  }

  useEffect(() => {
    if (isOwner && currentUser) {
      loadPendingRequests()
    }
  }, [isOwner, currentUser])

  const saveProfile = async () => {
    if (!profileUser) return
    setSavingProfile(true)
    try {
      await fetch("/api/profile/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: profileUser.id,
          bio: editBioValue,
          headline: editHeadline,
          major: editMajor,
          graduationYear: editGradYear,
        }),
      })
      setProfileUser({ ...profileUser, bio: editBioValue, headline: editHeadline, major: editMajor, graduationYear: editGradYear })
      setEditingBio(false)
    } catch {}
    setSavingProfile(false)
  }

  const saveStatus = async () => {
    if (!profileUser) return
    try {
      await fetch("/api/profile/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: profileUser.id, statusNote: statusValue }),
      })
      setProfileUser({ ...profileUser, statusNote: statusValue })
      setEditingStatus(false)
    } catch {}
  }

  const addResumeSection = async () => {
    if (!profileUser) return
    try {
      const res = await fetch("/api/profile/resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: profileUser.id, ...newSection }),
      })
      const data = await res.json()
      if (data.success) {
        setResume([...resume, { id: data.id, ...newSection, start_date: newSection.startDate, end_date: newSection.endDate, is_current: newSection.isCurrent, sort_order: 0 }])
        setNewSection({ type: "experience", title: "", org: "", startDate: "", endDate: "", isCurrent: false, description: "", url: "" })
        setShowAddSection(false)
      }
    } catch {}
  }

  const deleteResumeSection = async (sectionId: number) => {
    if (!profileUser) return
    try {
      await fetch(`/api/profile/resume?id=${sectionId}&userId=${profileUser.id}`, { method: "DELETE" })
      setResume(resume.filter((s) => s.id !== sectionId))
    } catch {}
  }

  const handleMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !profileUser) return

    setUploading(true)
    try {
      const reader = new FileReader()
      reader.onload = async () => {
        const base64 = reader.result as string
        const res = await fetch("/api/profile/media", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: profileUser.id,
            type: file.type.startsWith("video") ? "video" : "image",
            data: base64,
            caption: "",
          }),
        })
        const data = await res.json()
        if (data.success) {
          setMedia([{ id: data.id, type: file.type.startsWith("video") ? "video" : "image", data: base64, caption: "", createdAt: new Date().toISOString(), trueCount: 0, commentCount: 0 }, ...media])
        }
        setUploading(false)
      }
      reader.readAsDataURL(file)
    } catch {
      setUploading(false)
    }
  }

  const deleteMedia = async (mediaId: number) => {
    if (!profileUser) return
    try {
      await fetch(`/api/profile/media?id=${mediaId}&userId=${profileUser.id}`, { method: "DELETE" })
      setMedia(media.filter((m) => m.id !== mediaId))
      setSelectedMedia(null)
    } catch {}
  }

  const openMediaModal = async (item: MediaItem) => {
    setSelectedMedia(item)
    setLoadingComments(true)
    try {
      const [commentsRes, trueRes] = await Promise.all([
        fetch(`/api/profile/media/comment?mediaId=${item.id}`).then((r) => r.json()),
        fetch(`/api/profile/media/true?mediaId=${item.id}&userId=${currentUser?.id || ""}`).then((r) => r.json()),
      ])
      setComments(Array.isArray(commentsRes) ? commentsRes : [])
      setTrueState(trueRes)
    } catch {}
    setLoadingComments(false)
  }

  const toggleTrue = async () => {
    if (!currentUser || !selectedMedia) return
    try {
      const res = await fetch("/api/profile/media/true", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mediaId: selectedMedia.id, userId: currentUser.id }),
      })
      const data = await res.json()
      setTrueState({ isTrued: data.isTrued, trueCount: data.trueCount })
    } catch {}
  }

  const postComment = async () => {
    if (!currentUser || !selectedMedia || !newComment.trim()) return
    try {
      const res = await fetch("/api/profile/media/comment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mediaId: selectedMedia.id, userId: currentUser.id, body: newComment }),
      })
      const data = await res.json()
      if (data.success) {
        setComments([...comments, data.comment])
        setNewComment("")
      }
    } catch {}
  }

  const displayUsername = profileUser?.username?.startsWith("+") ? profileUser.username : `+${profileUser?.username || ""}`

  if (RESERVED_ROUTES.includes(usernameParam.toLowerCase())) {
    return null
  }

  if (loading) {
    return (
      <div className="min-h-screen wood-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-amber-200" />
      </div>
    )
  }

  if (notFound) {
    return (
      <div className="min-h-screen wood-background">
        <Header />
        <div className="flex items-center justify-center pt-32">
          <div className="text-center">
            <div className="text-6xl mb-4">📖</div>
            <h1 className="text-2xl font-bold text-amber-200 mb-2" style={{ textShadow: "1px 1px 3px rgba(0,0,0,0.5)" }}>
              Profile Not Found
            </h1>
            <p className="text-amber-400">No student found with username &ldquo;{usernameParam}&rdquo;</p>
          </div>
        </div>
      </div>
    )
  }

  if (!profileUser) return null

  return (
    <div className="min-h-screen wood-background">
      <Header />
      <input type="file" ref={fileInputRef} className="hidden" accept="image/*,video/*" onChange={handleMediaUpload} />

      <main className="max-w-7xl mx-auto px-4 py-6">
        <div
          className="relative rounded-xl overflow-hidden"
          style={{
            background: "linear-gradient(135deg, #f5e6c8 0%, #e8d5a8 30%, #f0ddb8 50%, #e2c998 70%, #f5e6c8 100%)",
            boxShadow: "0 10px 40px rgba(0,0,0,0.5), inset 0 0 60px rgba(139,105,20,0.15)",
            minHeight: "700px",
          }}
        >
          <div
            className="absolute left-1/2 top-0 bottom-0 w-8 -translate-x-1/2 z-10 pointer-events-none hidden lg:block"
            style={{
              background: "linear-gradient(90deg, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.05) 30%, rgba(139,105,20,0.1) 50%, rgba(0,0,0,0.05) 70%, rgba(0,0,0,0.15) 100%)",
              boxShadow: "inset 2px 0 4px rgba(0,0,0,0.1), inset -2px 0 4px rgba(0,0,0,0.1)",
            }}
          />

          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100' height='100' filter='url(%23n)' opacity='0.03'/%3E%3C/svg%3E")`,
              opacity: 0.5,
            }}
          />

          <div className="flex flex-col lg:flex-row relative z-[1]">
            {/* LEFT PAGE - Profile + Resume */}
            <div className="flex-1 p-6 md:p-10 lg:pr-6 lg:border-r-0">
              <div className="flex flex-col items-center mb-6">
                <div
                  className="w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden border-4 border-amber-800 mb-4"
                  style={{ boxShadow: "0 4px 15px rgba(0,0,0,0.3), inset 0 0 10px rgba(0,0,0,0.1)" }}
                >
                  {profileUser.profileImage ? (
                    <img src={profileUser.profileImage} alt={profileUser.firstName} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-amber-700 flex items-center justify-center text-amber-100 text-4xl font-bold">
                      {(profileUser.firstName?.[0] || profileUser.username?.[0] || "?").toUpperCase()}
                    </div>
                  )}
                </div>

                <h1
                  className="text-2xl md:text-3xl font-bold text-amber-900 text-center"
                  style={{ fontFamily: "'Georgia', serif", textShadow: "1px 1px 2px rgba(0,0,0,0.1)" }}
                >
                  {profileUser.firstName} {profileUser.lastName}
                </h1>
                <p className="text-amber-700 text-lg font-medium" style={{ fontFamily: "'Georgia', serif" }}>
                  {displayUsername}
                </p>

                {/* Status Note */}
                <div className="mt-2 text-center">
                  {editingStatus && isOwner ? (
                    <div className="flex items-center gap-2">
                      <input
                        value={statusValue}
                        onChange={(e) => setStatusValue(e.target.value.slice(0, 80))}
                        className="px-3 py-1 rounded border border-amber-600 bg-amber-50 text-amber-900 text-sm w-48"
                        placeholder="What's on your mind?"
                        maxLength={80}
                        autoFocus
                      />
                      <button onClick={saveStatus} className="text-green-700 hover:text-green-900"><Check className="w-4 h-4" /></button>
                      <button onClick={() => setEditingStatus(false)} className="text-red-700 hover:text-red-900"><X className="w-4 h-4" /></button>
                    </div>
                  ) : (
                    <p
                      className="text-amber-600 text-sm italic cursor-pointer hover:text-amber-800 transition-colors"
                      onClick={() => isOwner && setEditingStatus(true)}
                    >
                      {profileUser.statusNote || (isOwner ? "Set a status..." : "")}
                    </p>
                  )}
                </div>

                <p className="text-amber-700 text-sm mt-1">{profileUser.college}</p>
                {profileUser.major && <p className="text-amber-600 text-sm">{profileUser.major}{profileUser.graduationYear ? ` '${profileUser.graduationYear}` : ""}</p>}

                {/* Headline */}
                {(profileUser.headline || isOwner) && (
                  <p className="text-amber-800 text-sm mt-2 text-center max-w-xs" style={{ fontFamily: "'Georgia', serif" }}>
                    {profileUser.headline || (isOwner ? "Add a headline..." : "")}
                  </p>
                )}

                {/* YBUCKS Display - own profile only */}
                {isOwner && (
                  <div className="mt-3 flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-100 border border-amber-300"
                    style={{ boxShadow: "inset 0 1px 3px rgba(0,0,0,0.1)" }}>
                    <span className="text-amber-600 text-xs font-semibold uppercase tracking-wide">YBucks</span>
                    <span className="text-amber-900 text-xl font-bold" style={{ fontFamily: "'Georgia', serif" }}>
                      {profileUser.ybucks?.toLocaleString() || 0}
                    </span>
                  </div>
                )}

                {/* Followers / Following Stats */}
                <div className="mt-3 flex items-center gap-6 text-center">
                  <div>
                    <p className="text-amber-900 text-lg font-bold" style={{ fontFamily: "'Georgia', serif" }}>
                      {followStats.followersCount}
                    </p>
                    <p className="text-amber-600 text-xs uppercase tracking-wide">Followers</p>
                  </div>
                  <div>
                    <p className="text-amber-900 text-lg font-bold" style={{ fontFamily: "'Georgia', serif" }}>
                      {followStats.followingCount}
                    </p>
                    <p className="text-amber-600 text-xs uppercase tracking-wide">Following</p>
                  </div>
                </div>

                {/* Follow / Unfollow Button */}
                {currentUser && !isOwner && (
                  <button
                    onClick={handleFollow}
                    disabled={followLoading}
                    className={`mt-3 px-6 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                      followStats.isFollowing
                        ? "bg-amber-200 text-amber-800 border border-amber-400 hover:bg-red-100 hover:text-red-700 hover:border-red-300"
                        : followStats.followStatus === "pending"
                        ? "bg-amber-100 text-amber-700 border border-amber-300 hover:bg-red-100 hover:text-red-700 hover:border-red-300"
                        : "bg-amber-800 text-amber-100 hover:bg-amber-700"
                    } disabled:opacity-50`}
                  >
                    {followLoading ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : followStats.isFollowing ? (
                      <><UserCheck className="w-3.5 h-3.5" /> Following</>
                    ) : followStats.followStatus === "pending" ? (
                      <><Clock className="w-3.5 h-3.5" /> Requested</>
                    ) : (
                      <><UserPlus className="w-3.5 h-3.5" /> Follow</>
                    )}
                  </button>
                )}

                {/* Visibility Toggle */}
                {isOwner && (
                  <button
                    onClick={toggleVisibility}
                    className="mt-3 flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-medium border border-amber-300 text-amber-700 hover:bg-amber-100 transition-colors"
                  >
                    {profileUser.profileVisibility === "private" ? (
                      <><Lock className="w-3.5 h-3.5" /> Private Profile</>
                    ) : (
                      <><Globe className="w-3.5 h-3.5" /> Public Profile</>
                    )}
                  </button>
                )}

                {/* Follow Requests Badge */}
                {isOwner && pendingRequests.length > 0 && (
                  <button
                    onClick={() => setShowFollowRequests(!showFollowRequests)}
                    className="mt-2 flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-medium bg-blue-100 text-blue-800 border border-blue-300 hover:bg-blue-200 transition-colors"
                  >
                    <Users className="w-3.5 h-3.5" />
                    {pendingRequests.length} Follow Request{pendingRequests.length !== 1 ? "s" : ""}
                  </button>
                )}
              </div>

              {/* Follow Requests Panel */}
              {isOwner && showFollowRequests && pendingRequests.length > 0 && (
                <div className="max-w-md mx-auto mb-4 bg-amber-50 rounded-lg border border-amber-300 p-4">
                  <h3 className="text-sm font-bold text-amber-900 mb-3 flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Follow Requests
                  </h3>
                  <div className="space-y-3">
                    {pendingRequests.map((req) => (
                      <div key={req.id} className="flex items-center gap-3">
                        <a href={`/${req.username}`} className="flex-shrink-0">
                          <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-amber-600 bg-amber-700 flex items-center justify-center text-amber-100 text-sm font-bold">
                            {req.profile_image ? (
                              <img src={req.profile_image} alt="" className="w-full h-full object-cover" />
                            ) : (
                              (req.first_name?.[0] || "?").toUpperCase()
                            )}
                          </div>
                        </a>
                        <div className="flex-1 min-w-0">
                          <a href={`/${req.username}`} className="text-amber-900 text-sm font-medium hover:underline">
                            {req.first_name} {req.last_name}
                          </a>
                          <p className="text-amber-600 text-xs">+{req.username}</p>
                        </div>
                        <div className="flex gap-1.5">
                          <button
                            onClick={() => handleFollowRequest(req.id, "accept")}
                            className="px-3 py-1 bg-amber-800 text-amber-100 rounded text-xs font-medium hover:bg-amber-700"
                          >
                            Accept
                          </button>
                          <button
                            onClick={() => handleFollowRequest(req.id, "deny")}
                            className="px-3 py-1 bg-red-100 text-red-700 rounded text-xs font-medium hover:bg-red-200 border border-red-300"
                          >
                            Deny
                          </button>
                          <button
                            onClick={() => { handleFollowRequest(req.id, "accept"); handleFollowBack(req.follower_id) }}
                            className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium hover:bg-blue-200 border border-blue-300"
                            title="Accept and follow back"
                          >
                            Follow Back
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Edit Profile Button */}
              {isOwner && (
                <div className="flex justify-center mb-4">
                  {editingBio ? (
                    <div className="w-full max-w-md space-y-3">
                      <input
                        value={editHeadline}
                        onChange={(e) => setEditHeadline(e.target.value)}
                        className="w-full px-3 py-2 rounded border border-amber-600 bg-amber-50 text-amber-900 text-sm"
                        placeholder="Headline (e.g. Aspiring Engineer)"
                      />
                      <div className="flex gap-2">
                        <input
                          value={editMajor}
                          onChange={(e) => setEditMajor(e.target.value)}
                          className="flex-1 px-3 py-2 rounded border border-amber-600 bg-amber-50 text-amber-900 text-sm"
                          placeholder="Major"
                        />
                        <input
                          value={editGradYear}
                          onChange={(e) => setEditGradYear(e.target.value)}
                          className="w-20 px-3 py-2 rounded border border-amber-600 bg-amber-50 text-amber-900 text-sm"
                          placeholder="Year"
                        />
                      </div>
                      <textarea
                        value={editBioValue}
                        onChange={(e) => setEditBioValue(e.target.value)}
                        className="w-full px-3 py-2 rounded border border-amber-600 bg-amber-50 text-amber-900 text-sm min-h-[80px]"
                        placeholder="About you..."
                      />
                      <div className="flex gap-2 justify-end">
                        <button onClick={() => setEditingBio(false)} className="px-3 py-1.5 text-amber-700 hover:text-amber-900 text-sm">Cancel</button>
                        <button onClick={saveProfile} disabled={savingProfile} className="px-4 py-1.5 bg-amber-800 text-amber-100 rounded text-sm hover:bg-amber-700 disabled:opacity-50">
                          {savingProfile ? "Saving..." : "Save"}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setEditingBio(true)}
                      className="flex items-center gap-1.5 px-4 py-1.5 border border-amber-700 text-amber-800 rounded-lg text-sm hover:bg-amber-100 transition-colors"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      Edit Profile
                    </button>
                  )}
                </div>
              )}

              {/* Private Profile Message */}
              {!canViewFullProfile && !isOwner && (
                <div className="max-w-md mx-auto mb-6 text-center py-8">
                  <Lock className="w-12 h-12 text-amber-400 mx-auto mb-3" />
                  <h3 className="text-amber-900 font-bold text-lg mb-1" style={{ fontFamily: "'Georgia', serif" }}>
                    This Account is Private
                  </h3>
                  <p className="text-amber-600 text-sm">
                    Follow this user to see their full profile, resume, and gallery.
                  </p>
                </div>
              )}

              {/* Bio */}
              {canViewFullProfile && profileUser.bio && !editingBio && (
                <div className="mb-6 max-w-md mx-auto">
                  <p className="text-amber-800 text-sm leading-relaxed whitespace-pre-wrap" style={{ fontFamily: "'Georgia', serif" }}>
                    {profileUser.bio}
                  </p>
                </div>
              )}

              {/* Resume Sections */}
              {canViewFullProfile && (
              <div className="max-w-md mx-auto space-y-4">
                {SECTION_TYPES.map((sType) => {
                  const sections = resume.filter((s) => s.type === sType.value)
                  if (sections.length === 0 && !isOwner) return null
                  const Icon = sType.icon

                  return (
                    <div key={sType.value}>
                      <div className="flex items-center gap-2 mb-2 border-b border-amber-300 pb-1">
                        <Icon className="w-4 h-4 text-amber-700" />
                        <h3 className="text-sm font-bold text-amber-900 uppercase tracking-wide" style={{ fontFamily: "'Georgia', serif" }}>
                          {sType.label}
                        </h3>
                      </div>
                      {sections.map((section) => (
                        <div key={section.id} className="ml-1 mb-3 relative group">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              {section.title && <p className="text-amber-900 text-sm font-semibold">{section.title}</p>}
                              {section.org && <p className="text-amber-700 text-xs">{section.org}</p>}
                              {(section.start_date || section.end_date) && (
                                <p className="text-amber-600 text-xs">
                                  {section.start_date}{section.start_date && section.end_date ? " - " : ""}{section.is_current ? "Present" : section.end_date}
                                </p>
                              )}
                              {section.description && <p className="text-amber-800 text-xs mt-1 whitespace-pre-wrap">{section.description}</p>}
                              {section.url && (
                                <a href={section.url} target="_blank" rel="noopener noreferrer" className="text-blue-700 text-xs hover:underline flex items-center gap-1 mt-1">
                                  <LinkIcon className="w-3 h-3" />{section.url}
                                </a>
                              )}
                            </div>
                            {isOwner && (
                              <button
                                onClick={() => deleteResumeSection(section.id)}
                                className="opacity-0 group-hover:opacity-100 text-red-600 hover:text-red-800 transition-opacity p-1"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                      {sections.length === 0 && isOwner && (
                        <p className="text-amber-500 text-xs ml-1 italic">No {sType.label.toLowerCase()} added yet</p>
                      )}
                    </div>
                  )
                })}

                {/* Add Section Button */}
                {isOwner && (
                  <div className="pt-2">
                    {showAddSection ? (
                      <div className="bg-amber-50 rounded-lg p-4 border border-amber-300 space-y-3">
                        <select
                          value={newSection.type}
                          onChange={(e) => setNewSection({ ...newSection, type: e.target.value })}
                          className="w-full px-3 py-2 rounded border border-amber-400 bg-white text-amber-900 text-sm"
                        >
                          {SECTION_TYPES.map((t) => (
                            <option key={t.value} value={t.value}>{t.label}</option>
                          ))}
                        </select>
                        <input
                          value={newSection.title}
                          onChange={(e) => setNewSection({ ...newSection, title: e.target.value })}
                          className="w-full px-3 py-2 rounded border border-amber-400 bg-white text-amber-900 text-sm"
                          placeholder="Title / Role"
                        />
                        <input
                          value={newSection.org}
                          onChange={(e) => setNewSection({ ...newSection, org: e.target.value })}
                          className="w-full px-3 py-2 rounded border border-amber-400 bg-white text-amber-900 text-sm"
                          placeholder="Organization / School"
                        />
                        <div className="flex gap-2">
                          <input
                            value={newSection.startDate}
                            onChange={(e) => setNewSection({ ...newSection, startDate: e.target.value })}
                            className="flex-1 px-3 py-2 rounded border border-amber-400 bg-white text-amber-900 text-sm"
                            placeholder="Start (e.g. Aug 2023)"
                          />
                          <input
                            value={newSection.endDate}
                            onChange={(e) => setNewSection({ ...newSection, endDate: e.target.value })}
                            className="flex-1 px-3 py-2 rounded border border-amber-400 bg-white text-amber-900 text-sm"
                            placeholder="End"
                            disabled={newSection.isCurrent}
                          />
                        </div>
                        <label className="flex items-center gap-2 text-amber-800 text-xs">
                          <input
                            type="checkbox"
                            checked={newSection.isCurrent}
                            onChange={(e) => setNewSection({ ...newSection, isCurrent: e.target.checked, endDate: "" })}
                          />
                          Currently here
                        </label>
                        <textarea
                          value={newSection.description}
                          onChange={(e) => setNewSection({ ...newSection, description: e.target.value })}
                          className="w-full px-3 py-2 rounded border border-amber-400 bg-white text-amber-900 text-sm min-h-[60px]"
                          placeholder="Description"
                        />
                        {newSection.type === "link" && (
                          <input
                            value={newSection.url}
                            onChange={(e) => setNewSection({ ...newSection, url: e.target.value })}
                            className="w-full px-3 py-2 rounded border border-amber-400 bg-white text-amber-900 text-sm"
                            placeholder="URL"
                          />
                        )}
                        <div className="flex gap-2 justify-end">
                          <button onClick={() => setShowAddSection(false)} className="px-3 py-1.5 text-amber-700 text-sm">Cancel</button>
                          <button onClick={addResumeSection} className="px-4 py-1.5 bg-amber-800 text-amber-100 rounded text-sm hover:bg-amber-700">Add</button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => setShowAddSection(true)}
                        className="flex items-center gap-1.5 px-4 py-1.5 border border-dashed border-amber-600 text-amber-700 rounded-lg text-sm hover:bg-amber-100 transition-colors w-full justify-center"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Add Section
                      </button>
                    )}
                  </div>
                )}
              </div>
              )}
              {/* Public Networks */}
              {canViewFullProfile && publicNetworks.length > 0 && (
                <div className="max-w-md mx-auto mt-6">
                  <div className="flex items-center gap-2 mb-3 border-b border-amber-300 pb-1">
                    <GraduationCap className="w-4 h-4 text-amber-700" />
                    <h3 className="text-sm font-bold text-amber-900 uppercase tracking-wide" style={{ fontFamily: "'Georgia', serif" }}>
                      Networks
                    </h3>
                  </div>
                  <div className="space-y-2">
                    {publicNetworks.map((net) => (
                      <a
                        key={net.id}
                        href={`/dashboard?network=${net.slug}`}
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-amber-100 transition-colors"
                      >
                        <div className="w-8 h-8 rounded-full bg-amber-700 flex items-center justify-center text-amber-100 text-xs font-bold flex-shrink-0">
                          {net.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-amber-900 text-sm font-medium truncate">{net.name}</p>
                          <p className="text-amber-600 text-xs capitalize">{net.type} &middot; {net.member_count} members</p>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* RIGHT PAGE - Gallery */}
            <div className="flex-1 p-6 md:p-10 lg:pl-6">
              {!canViewFullProfile && !isOwner && (
                <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-center">
                  <Lock className="w-16 h-16 text-amber-300 mb-4" />
                  <h3 className="text-amber-900 font-bold text-xl mb-2" style={{ fontFamily: "'Georgia', serif" }}>
                    This Account is Private
                  </h3>
                  <p className="text-amber-600 text-sm max-w-xs">
                    Follow this user to see their photos and posts.
                  </p>
                </div>
              )}
              {(canViewFullProfile || isOwner) && (<>
              <div className="flex items-center justify-between mb-4">
                <div className="flex gap-4">
                  <button
                    onClick={() => setActiveGalleryTab("posts")}
                    className={`text-sm font-bold uppercase tracking-wide pb-1 border-b-2 transition-colors ${activeGalleryTab === "posts" ? "text-amber-900 border-amber-800" : "text-amber-500 border-transparent hover:text-amber-700"}`}
                    style={{ fontFamily: "'Georgia', serif" }}
                  >
                    Posts ({media.length})
                  </button>
                </div>
                {isOwner && (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-800 text-amber-100 rounded-lg text-sm hover:bg-amber-700 transition-colors disabled:opacity-50"
                  >
                    {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Camera className="w-3.5 h-3.5" />}
                    {uploading ? "Uploading..." : "Upload"}
                  </button>
                )}
              </div>

              {/* Gallery Grid */}
              {media.length > 0 ? (
                <div className="grid grid-cols-3 gap-1.5">
                  {media.map((item) => (
                    <div
                      key={item.id}
                      className="aspect-square relative cursor-pointer group overflow-hidden rounded-sm"
                      onClick={() => openMediaModal(item)}
                    >
                      <img
                        src={item.data}
                        alt={item.caption || "Gallery photo"}
                        className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100">
                        <span className="text-white text-xs flex items-center gap-1">
                          <Heart className="w-3.5 h-3.5 fill-white" /> {item.trueCount}
                        </span>
                        <span className="text-white text-xs flex items-center gap-1">
                          <MessageCircle className="w-3.5 h-3.5 fill-white" /> {item.commentCount}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <Camera className="w-12 h-12 text-amber-400 mx-auto mb-3 opacity-50" />
                  <p className="text-amber-600 text-sm" style={{ fontFamily: "'Georgia', serif" }}>
                    {isOwner ? "Upload your first photo" : "No photos yet"}
                  </p>
                </div>
              )}
              </>)}
            </div>
          </div>

          {/* Page corners */}
          <div className="absolute top-2 left-2 w-6 h-6 pointer-events-none" style={{ background: "linear-gradient(135deg, rgba(139,105,20,0.2) 50%, transparent 50%)" }} />
          <div className="absolute top-2 right-2 w-6 h-6 pointer-events-none" style={{ background: "linear-gradient(225deg, rgba(139,105,20,0.2) 50%, transparent 50%)" }} />
          <div className="absolute bottom-2 left-2 w-6 h-6 pointer-events-none" style={{ background: "linear-gradient(45deg, rgba(139,105,20,0.2) 50%, transparent 50%)" }} />
          <div className="absolute bottom-2 right-2 w-6 h-6 pointer-events-none" style={{ background: "linear-gradient(315deg, rgba(139,105,20,0.2) 50%, transparent 50%)" }} />
        </div>
      </main>

      {/* Media Modal */}
      {selectedMedia && (
        <div className="fixed inset-0 bg-black bg-opacity-80 z-50 flex items-center justify-center p-4" onClick={() => setSelectedMedia(null)}>
          <div
            className="bg-white rounded-xl overflow-hidden max-w-4xl w-full max-h-[90vh] flex flex-col md:flex-row"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex-1 bg-black flex items-center justify-center min-h-[300px] md:min-h-0">
              <img
                src={selectedMedia.data}
                alt={selectedMedia.caption || "Photo"}
                className="max-w-full max-h-[60vh] md:max-h-[85vh] object-contain"
              />
            </div>
            <div className="w-full md:w-80 flex flex-col bg-white border-l border-gray-200 max-h-[40vh] md:max-h-none">
              {/* Header */}
              <div className="p-3 border-b border-gray-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full overflow-hidden bg-amber-700 flex items-center justify-center text-amber-100 text-sm font-bold">
                    {profileUser.profileImage ? (
                      <img src={profileUser.profileImage} className="w-full h-full object-cover" alt="" />
                    ) : (
                      (profileUser.firstName?.[0] || "?").toUpperCase()
                    )}
                  </div>
                  <span className="text-sm font-semibold text-gray-900">{displayUsername}</span>
                </div>
                <div className="flex items-center gap-2">
                  {isOwner && (
                    <button onClick={() => deleteMedia(selectedMedia.id)} className="text-red-500 hover:text-red-700 p-1">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                  <button onClick={() => setSelectedMedia(null)} className="text-gray-500 hover:text-gray-700 p-1">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* TRUE + actions */}
              <div className="p-3 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <button onClick={toggleTrue} className="flex items-center gap-1 group" disabled={!currentUser}>
                    <Heart className={`w-5 h-5 transition-colors ${trueState.isTrued ? "text-red-500 fill-red-500" : "text-gray-600 group-hover:text-red-400"}`} />
                  </button>
                  <MessageCircle className="w-5 h-5 text-gray-600" />
                </div>
                <p className="text-sm font-semibold text-gray-900 mt-1">
                  {trueState.trueCount} TRUE{trueState.trueCount !== 1 ? "s" : ""}
                </p>
                {selectedMedia.caption && (
                  <p className="text-sm text-gray-700 mt-1">
                    <span className="font-semibold">{displayUsername}</span>{" "}
                    {renderMentions(selectedMedia.caption)}
                  </p>
                )}
              </div>

              {/* Comments */}
              <div className="flex-1 overflow-y-auto p-3 space-y-3">
                {loadingComments ? (
                  <div className="flex justify-center py-4">
                    <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
                  </div>
                ) : (
                  comments.map((c) => (
                    <div key={c.id} className="flex gap-2">
                      <div className="w-7 h-7 rounded-full overflow-hidden bg-amber-700 flex items-center justify-center text-amber-100 text-xs font-bold flex-shrink-0">
                        {c.profileImage ? (
                          <img src={c.profileImage} className="w-full h-full object-cover" alt="" />
                        ) : (
                          (c.firstName?.[0] || "?").toUpperCase()
                        )}
                      </div>
                      <div>
                        <p className="text-sm text-gray-700">
                          <a href={`/${c.username.replace(/^\+/, "")}`} className="font-semibold text-gray-900 hover:underline">
                            +{c.username.replace(/^\+/, "")}
                          </a>{" "}
                          {renderMentions(c.body)}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {new Date(c.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Comment Input */}
              {currentUser && (
                <div className="p-3 border-t border-gray-200 flex gap-2">
                  <input
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && postComment()}
                    className="flex-1 text-sm px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
                    placeholder="Add a comment... (+username to mention)"
                  />
                  <button
                    onClick={postComment}
                    disabled={!newComment.trim()}
                    className="text-blue-600 text-sm font-semibold hover:text-blue-800 disabled:opacity-40"
                  >
                    Post
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
