"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import Header from "@/components/Header"
import { Plus, Users, Calendar, Clock, Video, VideoOff, ExternalLink, UserPlus, X, ChevronRight, Loader2, Copy, Check } from "lucide-react"

interface Meeting {
  id: number
  title: string
  description: string | null
  meet_uri: string
  meet_code: string
  meet_space_name: string
  host_user_id: number
  host_username: string
  host_first_name: string
  host_last_name: string
  network_id: number | null
  network_name: string | null
  meeting_type: string
  scheduled_start: string | null
  scheduled_end: string | null
  status: string
  participant_count: number
  created_at: string
}

interface Network {
  id: number
  name: string
  slug: string
}

interface NetworkMember {
  user_id: number
  username: string
  firstName: string
  lastName: string
}

export default function ChalkboardPage() {
  const router = useRouter()
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [meetings, setMeetings] = useState<Meeting[]>([])
  const [filter, setFilter] = useState("all")
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [inviteMeetingId, setInviteMeetingId] = useState<number | null>(null)
  const [networks, setNetworks] = useState<Network[]>([])
  const [networkMembers, setNetworkMembers] = useState<NetworkMember[]>([])
  const [selectedNetwork, setSelectedNetwork] = useState<number | null>(null)
  const [creating, setCreating] = useState(false)
  const [copiedId, setCopiedId] = useState<number | null>(null)
  const [newMeeting, setNewMeeting] = useState({
    title: "",
    description: "",
    meetingType: "instant",
    scheduledStart: "",
    scheduledEnd: "",
    networkId: "",
  })

  useEffect(() => {
    const stored = localStorage.getItem("currentUser")
    if (!stored) {
      router.push("/login")
      return
    }
    setCurrentUser(JSON.parse(stored))
  }, [router])

  const fetchMeetings = useCallback(async () => {
    if (!currentUser) return
    try {
      const res = await fetch(`/api/chalkboard?userId=${currentUser.id}&filter=${filter}`)
      const data = await res.json()
      setMeetings(data.meetings || [])
    } catch (e) {
      console.error("Failed to fetch meetings:", e)
    } finally {
      setLoading(false)
    }
  }, [currentUser, filter])

  useEffect(() => {
    fetchMeetings()
  }, [fetchMeetings])

  useEffect(() => {
    if (!currentUser) return
    fetch(`/api/networks/mine?userId=${currentUser.id}`)
      .then((r) => r.json())
      .then((data) => setNetworks(data.networks || []))
      .catch(() => {})
  }, [currentUser])

  const handleCreateMeeting = async () => {
    if (!newMeeting.title.trim() || !currentUser) return
    setCreating(true)
    try {
      const res = await fetch("/api/chalkboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: currentUser.id,
          title: newMeeting.title,
          description: newMeeting.description,
          meetingType: newMeeting.meetingType,
          scheduledStart: newMeeting.scheduledStart || null,
          scheduledEnd: newMeeting.scheduledEnd || null,
          networkId: newMeeting.networkId ? parseInt(newMeeting.networkId) : null,
        }),
      })
      const data = await res.json()
      if (data.meeting) {
        setShowCreateModal(false)
        setNewMeeting({ title: "", description: "", meetingType: "instant", scheduledStart: "", scheduledEnd: "", networkId: "" })
        fetchMeetings()
        if (data.meeting.meet_uri && newMeeting.meetingType === "instant") {
          window.open(data.meeting.meet_uri, "_blank")
        }
      }
    } catch (e) {
      console.error("Create meeting error:", e)
    } finally {
      setCreating(false)
    }
  }

  const handleJoinMeeting = async (meeting: Meeting) => {
    if (!currentUser) return
    await fetch("/api/chalkboard", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: currentUser.id, meetingId: meeting.id, action: "join" }),
    })
    if (meeting.meet_uri) {
      window.open(meeting.meet_uri, "_blank")
    }
    fetchMeetings()
  }

  const handleEndMeeting = async (meetingId: number) => {
    if (!currentUser) return
    await fetch("/api/chalkboard", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: currentUser.id, meetingId, action: "end" }),
    })
    fetchMeetings()
  }

  const handleCopyLink = (meeting: Meeting) => {
    navigator.clipboard.writeText(meeting.meet_uri || "")
    setCopiedId(meeting.id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const openInviteModal = async (meetingId: number, networkId: number | null) => {
    setInviteMeetingId(meetingId)
    setShowInviteModal(true)
    if (networkId) {
      setSelectedNetwork(networkId)
      const net = networks.find((n) => n.id === networkId)
      if (net) {
        try {
          const res = await fetch(`/api/networks/${net.slug}?userId=${currentUser?.id}`)
          const data = await res.json()
          setNetworkMembers(data.members || [])
        } catch {}
      }
    }
  }

  const handleInvite = async (inviteeId: number) => {
    if (!currentUser || !inviteMeetingId) return
    await fetch("/api/chalkboard", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: currentUser.id, meetingId: inviteMeetingId, action: "invite", inviteUserIds: [inviteeId] }),
    })
  }

  const loadNetworkMembers = async (networkId: number) => {
    setSelectedNetwork(networkId)
    try {
      const net = networks.find((n) => n.id === networkId)
      if (net) {
        const res = await fetch(`/api/networks/${net.slug}?userId=${currentUser?.id}`)
        const data = await res.json()
        setNetworkMembers(data.members || [])
      }
    } catch {}
  }

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr)
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-500"
      case "scheduled": return "bg-yellow-500"
      case "ended": return "bg-gray-500"
      default: return "bg-gray-500"
    }
  }

  const getStatusLabel = (meeting: Meeting) => {
    if (meeting.status === "active") return "LIVE"
    if (meeting.status === "scheduled") return "UPCOMING"
    return "ENDED"
  }

  if (!currentUser) return null

  const filters = [
    { key: "all", label: "All Rooms" },
    { key: "active", label: "Live Now" },
    { key: "scheduled", label: "Upcoming" },
    { key: "my", label: "My Rooms" },
    { key: "invited", label: "Invited" },
  ]

  return (
    <div className="min-h-screen" style={{ background: "#1a1a1a" }}>
      <Header currentPage="Chalkboard" />

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="relative rounded-2xl overflow-hidden shadow-2xl" style={{ background: "linear-gradient(145deg, #2d4a2d, #1e3a1e, #2a3d2a)", border: "12px solid #5a3a1a", borderRadius: "20px", boxShadow: "inset 0 0 60px rgba(0,0,0,0.4), 0 10px 40px rgba(0,0,0,0.6)" }}>
          <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100' height='100' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E\")" }}></div>

          <div className="absolute top-0 left-0 right-0 h-1" style={{ background: "linear-gradient(90deg, transparent 5%, rgba(255,255,255,0.06) 20%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.06) 80%, transparent 95%)" }}></div>

          <div className="relative z-10 p-6 md:p-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold mb-1" style={{ fontFamily: "'Caveat', 'Shadows Into Light', 'Patrick Hand', cursive", color: "rgba(255,255,255,0.85)", textShadow: "2px 2px 4px rgba(0,0,0,0.3)" }}>
                  YsUp Chalkboard
                </h1>
                <p className="text-sm" style={{ fontFamily: "'Caveat', cursive", color: "rgba(200,220,200,0.6)" }}>
                  Virtual Study Rooms & Online Classes
                </p>
              </div>

              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium transition-all hover:scale-105"
                style={{
                  fontFamily: "'Caveat', cursive",
                  fontSize: "18px",
                  background: "rgba(255,255,255,0.1)",
                  border: "2px dashed rgba(255,255,255,0.3)",
                  color: "rgba(255,255,255,0.85)",
                }}
              >
                <Plus className="w-5 h-5" />
                New Room
              </button>
            </div>

            <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
              {filters.map((f) => (
                <button
                  key={f.key}
                  onClick={() => { setFilter(f.key); setLoading(true) }}
                  className="whitespace-nowrap px-4 py-1.5 rounded-full text-sm transition-all"
                  style={{
                    fontFamily: "'Caveat', cursive",
                    fontSize: "16px",
                    background: filter === f.key ? "rgba(255,255,255,0.15)" : "transparent",
                    color: filter === f.key ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.5)",
                    border: filter === f.key ? "1px solid rgba(255,255,255,0.3)" : "1px solid transparent",
                  }}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin" style={{ color: "rgba(255,255,255,0.4)" }} />
              </div>
            ) : meetings.length === 0 ? (
              <div className="text-center py-20">
                <Video className="w-16 h-16 mx-auto mb-4" style={{ color: "rgba(255,255,255,0.2)" }} />
                <p className="text-xl mb-2" style={{ fontFamily: "'Caveat', cursive", color: "rgba(255,255,255,0.5)" }}>No rooms yet</p>
                <p className="text-sm mb-6" style={{ fontFamily: "'Caveat', cursive", color: "rgba(255,255,255,0.3)" }}>Create a study room or class to get started</p>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="px-6 py-2 rounded-lg transition-all hover:scale-105"
                  style={{ fontFamily: "'Caveat', cursive", fontSize: "18px", background: "rgba(255,255,255,0.1)", border: "2px dashed rgba(255,255,255,0.3)", color: "rgba(255,255,255,0.7)" }}
                >
                  + Create First Room
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {meetings.map((meeting) => (
                  <div
                    key={meeting.id}
                    className="rounded-xl p-4 transition-all hover:scale-[1.02] group"
                    style={{
                      background: "rgba(0,0,0,0.25)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      boxShadow: "inset 0 1px 0 rgba(255,255,255,0.05)",
                    }}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`w-2 h-2 rounded-full ${getStatusColor(meeting.status)} ${meeting.status === "active" ? "animate-pulse" : ""}`}></span>
                          <span className="text-[10px] font-bold tracking-wider" style={{ color: meeting.status === "active" ? "#4ade80" : meeting.status === "scheduled" ? "#facc15" : "rgba(255,255,255,0.4)" }}>
                            {getStatusLabel(meeting)}
                          </span>
                        </div>
                        <h3 className="text-lg font-bold truncate" style={{ fontFamily: "'Caveat', cursive", color: "rgba(255,255,255,0.85)" }}>
                          {meeting.title}
                        </h3>
                      </div>
                    </div>

                    {meeting.description && (
                      <p className="text-xs mb-3 line-clamp-2" style={{ fontFamily: "'Caveat', cursive", color: "rgba(255,255,255,0.4)" }}>
                        {meeting.description}
                      </p>
                    )}

                    <div className="flex flex-wrap gap-3 mb-3 text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
                      <span className="flex items-center gap-1" style={{ fontFamily: "'Caveat', cursive" }}>
                        <Users className="w-3 h-3" /> {meeting.participant_count || 0} in room
                      </span>
                      <span className="flex items-center gap-1" style={{ fontFamily: "'Caveat', cursive" }}>
                        <Clock className="w-3 h-3" /> {formatDate(meeting.created_at)}
                      </span>
                    </div>

                    {meeting.network_name && (
                      <div className="mb-3">
                        <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: "rgba(139,92,246,0.2)", color: "rgba(167,139,250,0.8)", fontFamily: "'Caveat', cursive", fontSize: "13px" }}>
                          {meeting.network_name}
                        </span>
                      </div>
                    )}

                    {meeting.scheduled_start && (
                      <div className="mb-3 text-xs flex items-center gap-1" style={{ fontFamily: "'Caveat', cursive", color: "rgba(250,204,21,0.7)" }}>
                        <Calendar className="w-3 h-3" />
                        {formatDate(meeting.scheduled_start)}
                        {meeting.scheduled_end && ` - ${formatDate(meeting.scheduled_end)}`}
                      </div>
                    )}

                    <div className="flex items-center gap-2 text-xs" style={{ color: "rgba(255,255,255,0.4)", fontFamily: "'Caveat', cursive", fontSize: "13px" }}>
                      Host: {meeting.host_first_name} {meeting.host_last_name} (@{meeting.host_username})
                    </div>

                    <div className="flex items-center gap-2 mt-4 pt-3" style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
                      {meeting.status === "active" && (
                        <button
                          onClick={() => handleJoinMeeting(meeting)}
                          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-medium transition-all hover:scale-105"
                          style={{ fontFamily: "'Caveat', cursive", fontSize: "16px", background: "rgba(74,222,128,0.2)", color: "#4ade80", border: "1px solid rgba(74,222,128,0.3)" }}
                        >
                          <Video className="w-4 h-4" /> Join Room
                        </button>
                      )}

                      {meeting.status === "scheduled" && (
                        <button
                          onClick={() => handleJoinMeeting(meeting)}
                          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-medium transition-all hover:scale-105"
                          style={{ fontFamily: "'Caveat', cursive", fontSize: "16px", background: "rgba(250,204,21,0.15)", color: "#facc15", border: "1px solid rgba(250,204,21,0.3)" }}
                        >
                          <ExternalLink className="w-4 h-4" /> Open
                        </button>
                      )}

                      {meeting.meet_uri && meeting.status !== "ended" && (
                        <button
                          onClick={() => handleCopyLink(meeting)}
                          className="p-2 rounded-lg transition-all hover:scale-110"
                          style={{ background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.5)" }}
                          title="Copy meeting link"
                        >
                          {copiedId === meeting.id ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                        </button>
                      )}

                      {meeting.status !== "ended" && (
                        <button
                          onClick={() => openInviteModal(meeting.id, meeting.network_id)}
                          className="p-2 rounded-lg transition-all hover:scale-110"
                          style={{ background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.5)" }}
                          title="Invite members"
                        >
                          <UserPlus className="w-4 h-4" />
                        </button>
                      )}

                      {meeting.host_user_id === currentUser?.id && meeting.status === "active" && (
                        <button
                          onClick={() => handleEndMeeting(meeting.id)}
                          className="p-2 rounded-lg transition-all hover:scale-110"
                          style={{ background: "rgba(239,68,68,0.15)", color: "#ef4444" }}
                          title="End meeting"
                        >
                          <VideoOff className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="relative h-8" style={{ background: "linear-gradient(to bottom, transparent, rgba(90,58,26,0.3))" }}>
            <div className="absolute bottom-0 left-0 right-0 h-3 flex items-end justify-center gap-4 px-8">
              <div className="w-16 h-2 rounded-t-sm" style={{ background: "rgba(255,255,255,0.15)" }}></div>
              <div className="w-12 h-1.5 rounded-t-sm" style={{ background: "rgba(255,200,100,0.2)" }}></div>
              <div className="w-20 h-1 rounded-t-sm" style={{ background: "rgba(200,200,255,0.15)" }}></div>
              <div className="w-8 h-3 rounded-sm" style={{ background: "rgba(255,255,255,0.08)" }}></div>
            </div>
          </div>
        </div>
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={() => setShowCreateModal(false)}>
          <div
            className="w-full max-w-lg rounded-2xl p-6 relative"
            onClick={(e) => e.stopPropagation()}
            style={{ background: "linear-gradient(145deg, #2d4a2d, #1e3a1e)", border: "8px solid #5a3a1a", boxShadow: "0 20px 60px rgba(0,0,0,0.5)" }}
          >
            <button onClick={() => setShowCreateModal(false)} className="absolute top-3 right-3 p-1 rounded-full hover:bg-white/10" style={{ color: "rgba(255,255,255,0.5)" }}>
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-2xl font-bold mb-6" style={{ fontFamily: "'Caveat', cursive", color: "rgba(255,255,255,0.85)" }}>
              Create a Room
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm mb-1" style={{ fontFamily: "'Caveat', cursive", color: "rgba(255,255,255,0.6)", fontSize: "16px" }}>Room Name</label>
                <input
                  type="text"
                  value={newMeeting.title}
                  onChange={(e) => setNewMeeting({ ...newMeeting, title: e.target.value })}
                  placeholder="e.g., Bio 101 Study Group"
                  className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                  style={{ background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.85)", fontFamily: "'Caveat', cursive", fontSize: "16px" }}
                />
              </div>

              <div>
                <label className="block text-sm mb-1" style={{ fontFamily: "'Caveat', cursive", color: "rgba(255,255,255,0.6)", fontSize: "16px" }}>Description (optional)</label>
                <textarea
                  value={newMeeting.description}
                  onChange={(e) => setNewMeeting({ ...newMeeting, description: e.target.value })}
                  placeholder="What's this room for?"
                  rows={2}
                  className="w-full px-3 py-2 rounded-lg text-sm outline-none resize-none"
                  style={{ background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.85)", fontFamily: "'Caveat', cursive", fontSize: "16px" }}
                />
              </div>

              <div>
                <label className="block text-sm mb-1" style={{ fontFamily: "'Caveat', cursive", color: "rgba(255,255,255,0.6)", fontSize: "16px" }}>Room Type</label>
                <div className="flex gap-3">
                  <button
                    onClick={() => setNewMeeting({ ...newMeeting, meetingType: "instant" })}
                    className="flex-1 py-2 rounded-lg text-sm transition-all"
                    style={{
                      fontFamily: "'Caveat', cursive", fontSize: "16px",
                      background: newMeeting.meetingType === "instant" ? "rgba(74,222,128,0.2)" : "rgba(0,0,0,0.2)",
                      color: newMeeting.meetingType === "instant" ? "#4ade80" : "rgba(255,255,255,0.5)",
                      border: `1px solid ${newMeeting.meetingType === "instant" ? "rgba(74,222,128,0.4)" : "rgba(255,255,255,0.1)"}`,
                    }}
                  >
                    Start Now
                  </button>
                  <button
                    onClick={() => setNewMeeting({ ...newMeeting, meetingType: "scheduled" })}
                    className="flex-1 py-2 rounded-lg text-sm transition-all"
                    style={{
                      fontFamily: "'Caveat', cursive", fontSize: "16px",
                      background: newMeeting.meetingType === "scheduled" ? "rgba(250,204,21,0.2)" : "rgba(0,0,0,0.2)",
                      color: newMeeting.meetingType === "scheduled" ? "#facc15" : "rgba(255,255,255,0.5)",
                      border: `1px solid ${newMeeting.meetingType === "scheduled" ? "rgba(250,204,21,0.4)" : "rgba(255,255,255,0.1)"}`,
                    }}
                  >
                    Schedule
                  </button>
                </div>
              </div>

              {newMeeting.meetingType === "scheduled" && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm mb-1" style={{ fontFamily: "'Caveat', cursive", color: "rgba(255,255,255,0.6)", fontSize: "14px" }}>Start</label>
                    <input
                      type="datetime-local"
                      value={newMeeting.scheduledStart}
                      onChange={(e) => setNewMeeting({ ...newMeeting, scheduledStart: e.target.value })}
                      className="w-full px-2 py-1.5 rounded-lg text-xs outline-none"
                      style={{ background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.85)" }}
                    />
                  </div>
                  <div>
                    <label className="block text-sm mb-1" style={{ fontFamily: "'Caveat', cursive", color: "rgba(255,255,255,0.6)", fontSize: "14px" }}>End</label>
                    <input
                      type="datetime-local"
                      value={newMeeting.scheduledEnd}
                      onChange={(e) => setNewMeeting({ ...newMeeting, scheduledEnd: e.target.value })}
                      className="w-full px-2 py-1.5 rounded-lg text-xs outline-none"
                      style={{ background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.85)" }}
                    />
                  </div>
                </div>
              )}

              {networks.length > 0 && (
                <div>
                  <label className="block text-sm mb-1" style={{ fontFamily: "'Caveat', cursive", color: "rgba(255,255,255,0.6)", fontSize: "16px" }}>Link to Network (optional)</label>
                  <select
                    value={newMeeting.networkId}
                    onChange={(e) => setNewMeeting({ ...newMeeting, networkId: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                    style={{ background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.85)" }}
                  >
                    <option value="">None</option>
                    {networks.map((n) => (
                      <option key={n.id} value={n.id}>{n.name}</option>
                    ))}
                  </select>
                </div>
              )}

              <button
                onClick={handleCreateMeeting}
                disabled={!newMeeting.title.trim() || creating}
                className="w-full py-3 rounded-lg font-medium transition-all hover:scale-[1.02] disabled:opacity-50 flex items-center justify-center gap-2"
                style={{ fontFamily: "'Caveat', cursive", fontSize: "20px", background: "rgba(74,222,128,0.2)", color: "#4ade80", border: "2px solid rgba(74,222,128,0.4)" }}
              >
                {creating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Video className="w-5 h-5" />}
                {creating ? "Creating..." : newMeeting.meetingType === "instant" ? "Create & Join" : "Schedule Room"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showInviteModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={() => { setShowInviteModal(false); setNetworkMembers([]) }}>
          <div
            className="w-full max-w-md rounded-2xl p-6 relative max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
            style={{ background: "linear-gradient(145deg, #2d4a2d, #1e3a1e)", border: "8px solid #5a3a1a", boxShadow: "0 20px 60px rgba(0,0,0,0.5)" }}
          >
            <button onClick={() => { setShowInviteModal(false); setNetworkMembers([]) }} className="absolute top-3 right-3 p-1 rounded-full hover:bg-white/10" style={{ color: "rgba(255,255,255,0.5)" }}>
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-2xl font-bold mb-4" style={{ fontFamily: "'Caveat', cursive", color: "rgba(255,255,255,0.85)" }}>
              Invite to Room
            </h2>

            {networks.length > 0 && (
              <div className="mb-4">
                <label className="block text-sm mb-2" style={{ fontFamily: "'Caveat', cursive", color: "rgba(255,255,255,0.6)", fontSize: "16px" }}>Select Network</label>
                <div className="flex flex-wrap gap-2">
                  {networks.map((n) => (
                    <button
                      key={n.id}
                      onClick={() => loadNetworkMembers(n.id)}
                      className="px-3 py-1 rounded-full text-sm transition-all"
                      style={{
                        fontFamily: "'Caveat', cursive", fontSize: "14px",
                        background: selectedNetwork === n.id ? "rgba(139,92,246,0.2)" : "rgba(0,0,0,0.2)",
                        color: selectedNetwork === n.id ? "#a78bfa" : "rgba(255,255,255,0.5)",
                        border: `1px solid ${selectedNetwork === n.id ? "rgba(139,92,246,0.4)" : "rgba(255,255,255,0.1)"}`,
                      }}
                    >
                      {n.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {networkMembers.length > 0 ? (
              <div className="space-y-2">
                {networkMembers.filter((m) => m.user_id !== currentUser?.id).map((member) => (
                  <div key={member.user_id} className="flex items-center justify-between p-2 rounded-lg" style={{ background: "rgba(0,0,0,0.2)" }}>
                    <span className="text-sm" style={{ fontFamily: "'Caveat', cursive", color: "rgba(255,255,255,0.7)", fontSize: "16px" }}>
                      {member.firstName} {member.lastName} (@{member.username})
                    </span>
                    <button
                      onClick={() => handleInvite(member.user_id)}
                      className="px-3 py-1 rounded text-xs transition-all hover:scale-105"
                      style={{ fontFamily: "'Caveat', cursive", fontSize: "14px", background: "rgba(74,222,128,0.15)", color: "#4ade80", border: "1px solid rgba(74,222,128,0.3)" }}
                    >
                      Invite
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center py-8" style={{ fontFamily: "'Caveat', cursive", color: "rgba(255,255,255,0.3)", fontSize: "16px" }}>
                {networks.length > 0 ? "Select a network to see members" : "Join a network first to invite members"}
              </p>
            )}
          </div>
        </div>
      )}

      <link href="https://fonts.googleapis.com/css2?family=Caveat:wght@400;500;600;700&family=Shadows+Into+Light&family=Patrick+Hand&display=swap" rel="stylesheet" />
    </div>
  )
}
