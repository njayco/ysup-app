"use client"

import { useState, useEffect } from "react"
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
  const [inviteCopied, setInviteCopied] = useState(false)
  const [showMembers, setShowMembers] = useState(false)
  const [showRequests, setShowRequests] = useState(false)
  const [joinRequests, setJoinRequests] = useState<JoinRequest[]>([])
  const [joiningNetwork, setJoiningNetwork] = useState(false)

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

  const copyInviteLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/invite/network/${slug}`)
    setInviteCopied(true)
    setTimeout(() => setInviteCopied(false), 2000)
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
      <div className="max-w-4xl mx-auto p-6 pt-20">
        <button
          onClick={() => router.push("/dashboard")}
          className="flex items-center space-x-2 text-amber-300 hover:text-amber-100 mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Dashboard</span>
        </button>

        <div className="bg-amber-900 bg-opacity-60 rounded-xl p-6 border border-amber-700 mb-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 rounded-full bg-amber-600 flex items-center justify-center text-white font-bold text-2xl">
                {network.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-amber-100">{network.name}</h1>
                <div className="flex items-center space-x-3 text-sm text-amber-300 mt-1">
                  <span className="capitalize">{network.type}</span>
                  <span>•</span>
                  {network.privacy === "public" ? (
                    <span className="flex items-center space-x-1"><Globe className="w-4 h-4" /><span>Public</span></span>
                  ) : (
                    <span className="flex items-center space-x-1"><Lock className="w-4 h-4" /><span>Private</span></span>
                  )}
                  <span>•</span>
                  <span className="flex items-center space-x-1"><Users className="w-4 h-4" /><span>{network.member_count} members</span></span>
                </div>
                <p className="text-amber-200 mt-2">{network.description}</p>
                <p className="text-xs text-amber-400 mt-1">
                  Moderated by {network.mod_first_name} {network.mod_last_name}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {isMember && (
                <button
                  onClick={copyInviteLink}
                  className="bg-amber-700 hover:bg-amber-600 text-white px-3 py-2 rounded-lg flex items-center space-x-1 text-sm"
                >
                  {inviteCopied ? <><Check className="w-4 h-4" /><span>Copied!</span></> : <><Link2 className="w-4 h-4" /><span>Invite</span></>}
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
                        <span>Co-sign ({post.cosigns})</span>
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
