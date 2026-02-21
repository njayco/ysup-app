"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Users, Globe, Lock, LogIn } from "lucide-react"

interface NetworkInfo {
  id: number
  name: string
  slug: string
  description: string
  type: string
  privacy: string
  member_count: number
  mod_first_name: string
  mod_last_name: string
}

export default function InvitePage() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string

  const [network, setNetwork] = useState<NetworkInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [joining, setJoining] = useState(false)
  const [joinResult, setJoinResult] = useState<string | null>(null)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem("currentUser")
    setIsLoggedIn(!!stored)

    const fetchNetwork = async () => {
      try {
        const userId = stored ? JSON.parse(stored).id : ""
        const res = await fetch(`/api/networks/${slug}?userId=${userId}`)
        const data = await res.json()
        if (data.success) {
          setNetwork(data.network)
          if (data.isMember) {
            router.push(`/networks/${slug}`)
            return
          }
        }
      } catch (err) {
        console.error("Fetch network error:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchNetwork()
  }, [slug, router])

  const handleJoin = async () => {
    const stored = localStorage.getItem("currentUser")
    if (!stored) {
      localStorage.setItem("pendingNetworkJoin", slug)
      router.push("/login")
      return
    }

    const userData = JSON.parse(stored)
    setJoining(true)

    try {
      const res = await fetch(`/api/networks/${slug}/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: userData.id }),
      })
      const data = await res.json()
      if (data.success) {
        if (data.joined) {
          router.push(`/networks/${slug}`)
        } else if (data.requested) {
          setJoinResult("pending")
        }
      }
    } catch (err) {
      console.error("Join error:", err)
    } finally {
      setJoining(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen wood-background flex items-center justify-center">
        <div className="text-amber-200 text-lg">Loading...</div>
      </div>
    )
  }

  if (!network) {
    return (
      <div className="min-h-screen wood-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold text-amber-100 mb-2">Network Not Found</h2>
          <p className="text-amber-300 mb-4">This invite link may be invalid or expired.</p>
          <button
            onClick={() => router.push("/login")}
            className="bg-amber-600 hover:bg-amber-500 text-white px-6 py-2 rounded-lg"
          >
            Go to Login
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen wood-background flex items-center justify-center p-4">
      <div className="bg-amber-900 bg-opacity-70 rounded-xl p-8 border border-amber-700 max-w-md w-full text-center">
        <div className="w-20 h-20 rounded-full bg-amber-600 flex items-center justify-center text-white font-bold text-3xl mx-auto mb-4">
          {network.name.charAt(0).toUpperCase()}
        </div>

        <h1 className="text-2xl font-bold text-amber-100 mb-2">
          You&apos;ve been invited to join
        </h1>

        <h2 className="text-xl text-amber-200 mb-2">{network.name}</h2>

        <div className="flex items-center justify-center space-x-3 text-sm text-amber-300 mb-4">
          <span className="capitalize">{network.type}</span>
          <span>•</span>
          {network.privacy === "public" ? (
            <span className="flex items-center space-x-1"><Globe className="w-4 h-4" /><span>Public</span></span>
          ) : (
            <span className="flex items-center space-x-1"><Lock className="w-4 h-4" /><span>Private</span></span>
          )}
          <span>•</span>
          <span><Users className="w-4 h-4 inline mr-1" />{network.member_count} members</span>
        </div>

        <p className="text-amber-300 mb-2">{network.description}</p>
        <p className="text-xs text-amber-400 mb-6">
          Moderated by {network.mod_first_name} {network.mod_last_name}
        </p>

        {joinResult === "pending" ? (
          <div className="bg-amber-800 bg-opacity-50 rounded-lg p-4">
            <Lock className="w-8 h-8 mx-auto text-amber-400 mb-2" />
            <p className="text-amber-100 font-medium">Request Sent!</p>
            <p className="text-sm text-amber-300 mt-1">The moderator will review your request.</p>
            <button
              onClick={() => router.push("/dashboard")}
              className="mt-4 text-amber-400 hover:text-amber-200 text-sm"
            >
              Go to Dashboard
            </button>
          </div>
        ) : (
          <>
            {isLoggedIn ? (
              <button
                onClick={handleJoin}
                disabled={joining}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg text-lg font-medium disabled:opacity-50"
              >
                {joining ? "Processing..." : network.privacy === "public" ? "Join Network" : "Request to Join"}
              </button>
            ) : (
              <div>
                <button
                  onClick={() => {
                    localStorage.setItem("pendingNetworkJoin", slug)
                    router.push("/login")
                  }}
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg text-lg font-medium flex items-center justify-center space-x-2"
                >
                  <LogIn className="w-5 h-5" />
                  <span>Log in to Join</span>
                </button>
                <p className="text-xs text-amber-400 mt-3">
                  Don&apos;t have an account?{" "}
                  <button
                    onClick={() => {
                      localStorage.setItem("pendingNetworkJoin", slug)
                      router.push("/")
                    }}
                    className="text-amber-200 hover:text-amber-100 underline"
                  >
                    Sign up
                  </button>
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
