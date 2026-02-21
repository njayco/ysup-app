"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Mail, Globe, X, Send, Search, Menu, LogOut, LogIn } from "lucide-react"

interface HeaderProps {
  currentPage?: string
}

interface Message {
  id: string
  from: string
  to: string
  content: string
  timestamp: string
  read: boolean
  readBy: { [username: string]: string } // username -> timestamp when read
}

interface Notification {
  id: string
  type: "message" | "cosign" | "response" | "event_invite"
  from: string
  content: string
  timestamp: string
  read: boolean
  eventId?: number
}

export default function Header({ currentPage = "Home" }: HeaderProps) {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [showMessaging, setShowMessaging] = useState(false)
  const [showSearch, setShowSearch] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [messageRecipient, setMessageRecipient] = useState("")
  const [messageContent, setMessageContent] = useState("")
  const [searchResults, setSearchResults] = useState<string[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [currentUser, setCurrentUser] = useState({
    username: "najeejeremiah",
    firstName: "Najee",
    lastName: "Jeremiah",
  })
  const [conversations, setConversations] = useState<{ [key: string]: Message[] }>({})
  const [activeConversation, setActiveConversation] = useState<string>("")
  const [groupChatRecipients, setGroupChatRecipients] = useState<string[]>([])
  const [unreadNotifications, setUnreadNotifications] = useState<number>(0)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  // Mock users for search
  const [allUsers] = useState([
    "+najeejeremiah",
    "+nickfisher",
    "+amandawinston",
    "+nickharper",
    "+garyjackson",
    "+annwashington",
    "+theorobinson",
    "+sarahjohnson",
    "+mikedavis",
    "+lisachen",
    "+davidbrown",
    "+emmawilson",
  ])

  useEffect(() => {
    const storedUser = localStorage.getItem("currentUser")
    if (storedUser) {
      const userData = JSON.parse(storedUser)
      setCurrentUser({
        username: userData.username,
        firstName: userData.firstName,
        lastName: userData.lastName,
      })
      setIsLoggedIn(true)

      if (userData.id) {
        fetch(`/api/events/invites?userId=${userData.id}`)
          .then(res => res.json())
          .then(data => {
            if (data.success && data.invites.length > 0) {
              const eventNotifs: Notification[] = data.invites.map((inv: any) => ({
                id: `event-${inv.event_id}`,
                type: "event_invite" as const,
                from: `${inv.creator_first_name} ${inv.creator_last_name}`,
                content: `invited you to "${inv.title}"`,
                timestamp: inv.invited_at,
                read: false,
                eventId: inv.event_id,
              }))
              setNotifications(eventNotifs)
              setUnreadNotifications(eventNotifs.length)
            } else {
              setNotifications([])
              setUnreadNotifications(0)
            }
          })
          .catch(() => {
            setNotifications([])
            setUnreadNotifications(0)
          })
      }
    } else {
      setIsLoggedIn(false)
    }
  }, [])

  const markMessagesAsRead = (conversationId: string) => {
    setConversations((prev) => ({
      ...prev,
      [conversationId]:
        prev[conversationId]?.map((message) => {
          if (message.from !== `+${currentUser.username}` && !message.readBy[currentUser.username]) {
            return {
              ...message,
              read: true,
              readBy: {
                ...message.readBy,
                [currentUser.username]: new Date().toISOString(),
              },
            }
          }
          return message
        }) || [],
    }))
  }

  const unreadMessages = Object.values(conversations)
    .flat()
    .filter((m) => !m.readBy[currentUser.username] && m.from !== `+${currentUser.username}`).length

  const handleUserSearch = (query: string) => {
    if (query.length > 0) {
      const filtered = allUsers.filter((user) => user.toLowerCase().includes(query.toLowerCase()))
      setSearchResults(filtered.slice(0, 5))
    } else {
      setSearchResults([])
    }
  }

  const sendMessage = () => {
    if (activeConversation && messageContent.trim()) {
      const newMessage: Message = {
        id: Date.now().toString(),
        from: `+${currentUser.username}`,
        to: activeConversation,
        content: messageContent,
        timestamp: new Date().toISOString(),
        read: false,
        readBy: {}, // Initialize empty readBy object
      }

      setConversations((prev) => ({
        ...prev,
        [activeConversation]: [...(prev[activeConversation] || []), newMessage],
      }))

      setMessageContent("")

      // Simulate responses for demo
      setTimeout(() => {
        const participants = activeConversation.split(",").filter((p) => p !== `+${currentUser.username}`)
        const randomParticipant = participants[Math.floor(Math.random() * participants.length)]

        const response: Message = {
          id: (Date.now() + 1).toString(),
          from: randomParticipant,
          to: activeConversation,
          content: "Thanks for the message! I'll get back to you soon.",
          timestamp: new Date().toISOString(),
          read: false,
          readBy: {}, // Initialize empty readBy object
        }

        setConversations((prev) => ({
          ...prev,
          [activeConversation]: [...(prev[activeConversation] || []), response],
        }))

        // Simulate the other user reading the message after 3 seconds
        setTimeout(() => {
          setConversations((prev) => ({
            ...prev,
            [activeConversation]:
              prev[activeConversation]?.map((msg) => {
                if (msg.from === `+${currentUser.username}` && !msg.readBy[randomParticipant.replace("+", "")]) {
                  return {
                    ...msg,
                    readBy: {
                      ...msg.readBy,
                      [randomParticipant.replace("+", "")]: new Date().toISOString(),
                    },
                  }
                }
                return msg
              }) || [],
          }))
        }, 3000)

        // Add notification
        const notification: Notification = {
          id: (Date.now() + 2).toString(),
          type: "message",
          from: randomParticipant,
          content: "sent you a message",
          timestamp: new Date().toISOString(),
          read: false,
        }
        setNotifications((prev) => [...prev, notification])

        // Update unread notifications count
        setUnreadNotifications((prev) => prev + 1)
      }, 2000)
    }
  }

  const navItems = [
    { name: "Dashboard", href: "/dashboard" },
    { name: "The Game", href: "/the-game" },
    { name: "Bison Web", href: "/bison-web" },
    { name: "The Hilltop", href: "/hilltop" },
    { name: "Bulletin Board", href: "/bulletin-board" },
    { name: "HU Bookstore", href: "/bookstore" },
    { name: "Academy", href: "/academy", badge: "NEW" },
    { name: "About Us", href: "https://ysup.co", external: true },
  ]

  const handleLogout = () => {
    localStorage.removeItem("currentUser")
    localStorage.removeItem("onboardingComplete")
    window.location.href = "/login"
  }

  const handleMobileNavClick = (href: string) => {
    setShowMobileMenu(false)
  }

  return (
    <header className="wood-background border-b-4 border-amber-800">
      {/* Desktop Navigation */}
      <div className="hidden md:flex items-center justify-between px-4 py-2">
        <div className="flex items-center space-x-4">
          <Link href="/" className="flex items-center space-x-2">
            <div className="text-2xl font-bold text-yellow-400 bg-amber-900 px-3 py-1 rounded">YsUp</div>
          </Link>
          <div className="flex items-center space-x-2">
            <div className="relative flex items-center">
              {unreadMessages > 0 && (
                <div className="bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs mr-1">
                  {unreadMessages}
                </div>
              )}
              <button
                onClick={() => setShowMessaging(true)}
                className="text-amber-100 w-6 h-6 hover:text-white transition-colors"
              >
                <Mail className="w-6 h-6" />
              </button>
            </div>
            <div className="bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">
              {unreadNotifications}
            </div>
            <Globe className="text-amber-100 w-6 h-6" />
          </div>
        </div>

        <nav className="flex items-center space-x-1">
          {navItems.map((item) =>
            item.external ? (
              <a
                key={item.name}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 text-amber-100 hover:bg-amber-800 rounded transition-colors relative"
              >
                {item.name}
              </a>
            ) : (
              <Link
                key={item.name}
                href={item.href}
                className={`px-4 py-2 text-amber-100 hover:bg-amber-800 rounded transition-colors relative ${
                  currentPage === item.name ? "bg-amber-800" : ""
                }`}
              >
                {item.name}
                {item.badge && (
                  <span className="absolute -top-1 -right-1 bg-green-500 text-white text-xs px-1 rounded">
                    {item.badge}
                  </span>
                )}
              </Link>
            )
          )}
        </nav>

        <div className="flex items-center space-x-2">
          <div className="relative flex items-center">
            {/* Expandable Search */}
            <div className="flex items-center">
              <div
                className={`transition-all duration-300 ease-in-out overflow-hidden ${
                  showSearch ? "w-64 opacity-100" : "w-0 opacity-0"
                }`}
              >
                <input
                  type="text"
                  placeholder="Search YsUp"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value)
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && searchQuery.trim()) {
                      router.push(`/search?q=${encodeURIComponent(searchQuery)}`)
                    }
                  }}
                  className="w-full px-3 py-1 rounded border border-amber-600 bg-amber-50 text-amber-900 placeholder-amber-600"
                  onBlur={() => {
                    if (!searchQuery.trim()) {
                      setTimeout(() => setShowSearch(false), 150)
                    }
                  }}
                  autoFocus={showSearch}
                />
              </div>
              <button
                onClick={() => {
                  if (showSearch && searchQuery.trim()) {
                    router.push(`/search?q=${encodeURIComponent(searchQuery)}`)
                  } else {
                    setShowSearch(!showSearch)
                  }
                }}
                className="bg-amber-600 text-white p-2 rounded hover:bg-amber-700 transition-colors ml-2"
              >
                <Search className="w-4 h-4" />
              </button>
            </div>
          </div>
          {isLoggedIn ? (
            <button
              onClick={handleLogout}
              className="flex items-center space-x-1 text-amber-100 hover:text-white hover:bg-amber-800 px-3 py-2 rounded transition-colors ml-2"
              title="Log Out"
            >
              <LogOut className="w-5 h-5" />
              <span className="text-sm">Log Out</span>
            </button>
          ) : (
            <Link
              href="/login"
              className="flex items-center space-x-1 text-amber-100 hover:text-white hover:bg-amber-800 px-3 py-2 rounded transition-colors ml-2"
              title="Log In"
            >
              <LogIn className="w-5 h-5" />
              <span className="text-sm">Log In</span>
            </Link>
          )}
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden flex items-center justify-between px-4 py-2">
        {/* Left side - YsUp logo, mail, and notifications */}
        <div className="flex items-center space-x-4">
          <Link href="/" className="flex items-center space-x-2">
            <div className="text-xl font-bold text-yellow-400 bg-amber-900 px-2 py-1 rounded">YsUp</div>
          </Link>
          <div className="flex items-center space-x-2">
            <div className="relative flex items-center">
              {unreadMessages > 0 && (
                <div className="bg-red-600 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs mr-1">
                  {unreadMessages}
                </div>
              )}
              <button
                onClick={() => setShowMessaging(true)}
                className="text-amber-100 w-5 h-5 hover:text-white transition-colors"
              >
                <Mail className="w-5 h-5" />
              </button>
            </div>
            <div className="bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
              {unreadNotifications}
            </div>
          </div>
        </div>

        {/* Right side - Hamburger menu */}
        <button
          onClick={() => setShowMobileMenu(!showMobileMenu)}
          className="text-amber-100 hover:text-white transition-colors p-2"
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {showMobileMenu && (
        <div className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-50" onClick={() => setShowMobileMenu(false)}>
          <div
            className="absolute top-0 right-0 w-80 h-full bg-amber-900 shadow-2xl transform transition-transform duration-300 ease-in-out"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Mobile Menu Header */}
            <div className="bg-amber-800 p-4 flex items-center justify-between border-b border-amber-700">
              <h2 className="text-xl font-bold text-amber-100">Menu</h2>
              <button
                onClick={() => setShowMobileMenu(false)}
                className="text-amber-100 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Mobile Search */}
            <div className="p-4 border-b border-amber-700">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search YsUp"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value)
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && searchQuery.trim()) {
                      router.push(`/search?q=${encodeURIComponent(searchQuery)}`)
                    }
                  }}
                  className="w-full px-3 py-2 rounded border border-amber-600 bg-amber-50 text-amber-900 placeholder-amber-600"
                />
                <button
                  onClick={() => {
                    if (searchQuery.trim()) {
                      router.push(`/search?q=${encodeURIComponent(searchQuery)}`)
                    }
                  }}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-amber-600 hover:text-amber-800"
                >
                  <Search className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Mobile Navigation Items */}
            <nav className="flex flex-col">
              {navItems.map((item) =>
                item.external ? (
                  <a
                    key={item.name}
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => handleMobileNavClick(item.href)}
                    className="px-6 py-4 text-amber-100 hover:bg-amber-800 transition-colors border-b border-amber-700 relative"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-lg">{item.name}</span>
                    </div>
                  </a>
                ) : (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => handleMobileNavClick(item.href)}
                    className={`px-6 py-4 text-amber-100 hover:bg-amber-800 transition-colors border-b border-amber-700 relative ${
                      currentPage === item.name ? "bg-amber-800" : ""
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-lg">{item.name}</span>
                      {item.badge && (
                        <span className="bg-green-500 text-white text-xs px-2 py-1 rounded">{item.badge}</span>
                      )}
                    </div>
                  </Link>
                )
              )}
            </nav>

            {/* Mobile Menu Footer */}
            <div className="absolute bottom-0 left-0 right-0 bg-amber-800 border-t border-amber-700">
              {isLoggedIn ? (
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center space-x-3 px-6 py-4 text-amber-100 hover:bg-amber-700 transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                  <span className="text-lg">Log Out</span>
                </button>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setShowMobileMenu(false)}
                  className="w-full flex items-center space-x-3 px-6 py-4 text-amber-100 hover:bg-amber-700 transition-colors"
                >
                  <LogIn className="w-5 h-5" />
                  <span className="text-lg">Log In</span>
                </Link>
              )}
              <div className="flex items-center space-x-2 text-amber-100 px-6 py-3 border-t border-amber-700">
                <Globe className="w-5 h-5" />
                <span className="text-sm">Connected to Campus Network</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Messaging Modal */}
      {showMessaging && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-6xl h-[90vh] md:h-[700px] flex flex-col md:flex-row">
            {/* Conversations Sidebar */}
            <div className="w-full md:w-1/3 border-b md:border-b-0 md:border-r border-gray-200 flex flex-col max-h-[40vh] md:max-h-none">
              <div className="bg-blue-600 text-white p-4 rounded-tl-lg flex items-center justify-between">
                <h2 className="text-xl font-bold">Conversations</h2>
                <button
                  onClick={() => setShowMessaging(false)}
                  className="text-white hover:text-gray-200 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* New Chat Section */}
              <div className="p-4 border-b border-gray-200">
                <div className="mb-3">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start New Chat (separate multiple usernames with commas)
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={messageRecipient}
                      onChange={(e) => {
                        setMessageRecipient(e.target.value)
                        handleUserSearch(e.target.value.split(",").pop()?.trim() || "")
                      }}
                      placeholder="Enter +username or +user1, +user2 for group"
                      className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {searchResults.length > 0 && (
                      <div className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-b shadow-lg z-10 max-h-40 overflow-y-auto">
                        {searchResults.map((user) => (
                          <button
                            key={user}
                            onClick={() => {
                              const currentRecipients = messageRecipient
                                .split(",")
                                .map((r) => r.trim())
                                .filter((r) => r)
                              const lastRecipient = currentRecipients[currentRecipients.length - 1]
                              if (lastRecipient && !lastRecipient.startsWith("+")) {
                                currentRecipients[currentRecipients.length - 1] = user
                              } else {
                                currentRecipients.push(user)
                              }
                              setMessageRecipient(currentRecipients.join(", "))
                              setSearchResults([])
                            }}
                            className="w-full text-left px-3 py-2 hover:bg-gray-100"
                          >
                            {user}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => {
                    const recipients = messageRecipient
                      .split(",")
                      .map((r) => r.trim())
                      .filter((r) => r && r.startsWith("+"))
                    if (recipients.length > 0) {
                      const conversationId = recipients.sort().join(",")
                      setActiveConversation(conversationId)
                      if (!conversations[conversationId]) {
                        setConversations((prev) => ({
                          ...prev,
                          [conversationId]: [],
                        }))
                      }
                      setMessageRecipient("")
                    }
                  }}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded"
                >
                  Start Chat
                </button>
              </div>

              {/* Conversations List */}
              <div className="flex-1 overflow-y-auto">
                {Object.keys(conversations).map((conversationId) => {
                  const participants = conversationId.split(",")
                  const conversationMessages = conversations[conversationId] || []
                  const lastMessage = conversationMessages[conversationMessages.length - 1]
                  const unreadCount = conversationMessages.filter(
                    (m) => !m.readBy[currentUser.username] && m.to.includes(currentUser.username),
                  ).length

                  return (
                    <button
                      key={conversationId}
                      onClick={() => {
                        setActiveConversation(conversationId)
                        markMessagesAsRead(conversationId)
                      }}
                      className={`w-full p-4 text-left border-b border-gray-100 hover:bg-gray-50 ${
                        activeConversation === conversationId ? "bg-blue-50 border-l-4 border-l-blue-500" : ""
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="font-medium text-sm">
                          {participants.length > 2
                            ? `Group: ${participants.slice(0, 2).join(", ")}${participants.length > 2 ? "..." : ""}`
                            : participants.filter((p) => p !== `+${currentUser.username}`).join(", ")}
                        </div>
                        {unreadCount > 0 && (
                          <div className="bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                            {unreadCount}
                          </div>
                        )}
                      </div>
                      {lastMessage && (
                        <div className="text-xs text-gray-500 truncate">
                          {lastMessage.from}: {lastMessage.content}
                        </div>
                      )}
                      <div className="text-xs text-gray-400 mt-1">
                        {participants.length} participant{participants.length > 1 ? "s" : ""}
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Chat Window */}
            <div className="flex-1 flex flex-col">
              {activeConversation ? (
                <>
                  {/* Chat Header */}
                  <div className="bg-blue-600 text-white p-4 flex items-center justify-between rounded-tr-lg">
                    <div>
                      <h3 className="font-bold">
                        {activeConversation.split(",").length > 2
                          ? `Group Chat (${activeConversation.split(",").length} members)`
                          : activeConversation
                              .split(",")
                              .filter((p) => p !== `+${currentUser.username}`)
                              .join(", ")}
                      </h3>
                      <div className="text-sm opacity-75">{activeConversation.split(",").join(", ")}</div>
                    </div>
                    <button onClick={() => setShowMessaging(false)} className="text-white hover:text-gray-200">
                      <X className="w-6 h-6" />
                    </button>
                  </div>

                  {/* Messages Display */}
                  <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
                    <div className="space-y-3">
                      {(conversations[activeConversation] || []).map((message) => {
                        const participants = activeConversation.split(",").filter((p) => p !== message.from)
                        const readByCount = Object.keys(message.readBy).length
                        const isFromCurrentUser = message.from === `+${currentUser.username}`

                        return (
                          <div
                            key={message.id}
                            className={`flex ${isFromCurrentUser ? "justify-end" : "justify-start"}`}
                          >
                            <div
                              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                                isFromCurrentUser ? "bg-blue-600 text-white" : "bg-white text-gray-800 shadow"
                              }`}
                            >
                              <div className="text-xs opacity-75 mb-1">{message.from}</div>
                              <div>{message.content}</div>
                              <div className="flex items-center justify-between mt-1">
                                <div className="text-xs opacity-75">
                                  {new Date(message.timestamp).toLocaleTimeString()}
                                </div>
                                {isFromCurrentUser && (
                                  <div className="text-xs opacity-75 ml-2">
                                    {readByCount === 0 ? (
                                      <span className="text-gray-300">✓</span>
                                    ) : readByCount === participants.length ? (
                                      <span className="text-green-400">✓✓ Read by all</span>
                                    ) : (
                                      <span className="text-blue-300">✓✓ Read by {readByCount}</span>
                                    )}
                                  </div>
                                )}
                              </div>
                              {isFromCurrentUser && readByCount > 0 && (
                                <div className="text-xs opacity-60 mt-1">
                                  {Object.entries(message.readBy).map(([username, timestamp]) => (
                                    <div key={username} className="text-xs">
                                      Read by +{username} at {new Date(timestamp).toLocaleTimeString()}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {/* Message Input */}
                  <div className="p-4 border-t bg-white">
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={messageContent}
                        onChange={(e) => setMessageContent(e.target.value)}
                        placeholder="Type your message..."
                        className="flex-1 px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                      />
                      <button
                        onClick={sendMessage}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center space-x-2"
                      >
                        <Send className="w-4 h-4" />
                        <span>Send</span>
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center bg-gray-50">
                  <div className="text-center text-gray-500">
                    <Mail className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <h3 className="text-lg font-medium mb-2">Select a conversation</h3>
                    <p>Choose a conversation from the sidebar or start a new chat</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
