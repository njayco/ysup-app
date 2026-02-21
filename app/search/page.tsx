"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import Header from "@/components/Header"
import { useAuth } from "@/lib/useAuth"
import { Search, BookOpen, Globe, Users, Loader2, ExternalLink, MessageCircle, Sparkles, ChevronDown, ChevronUp } from "lucide-react"

interface Book {
  id: string
  title: string
  authors: string[]
  description: string
  thumbnail: string
  publishedDate: string
  pageCount: number
  previewLink: string
  infoLink: string
}

interface WikiArticle {
  pageid: number
  title: string
  snippet: string
  wordcount: number
  url: string
}

interface CampusUser {
  id: number
  username: string
  firstName: string
  lastName: string
  college: string
}

type TabType = "all" | "books" | "wikipedia" | "users"

function SearchContent() {
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const searchParams = useSearchParams()

  const [query, setQuery] = useState("")
  const [activeTab, setActiveTab] = useState<TabType>("all")
  const [books, setBooks] = useState<Book[]>([])
  const [wikiArticles, setWikiArticles] = useState<WikiArticle[]>([])
  const [campusUsers, setCampusUsers] = useState<CampusUser[]>([])
  const [loading, setLoading] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const [summaries, setSummaries] = useState<Record<string, string>>({})
  const [loadingSummaries, setLoadingSummaries] = useState<Record<string, boolean>>({})
  const [expandedSummaries, setExpandedSummaries] = useState<Record<string, boolean>>({})

  useEffect(() => {
    const q = searchParams.get("q")
    if (q) {
      setQuery(q)
      performSearch(q)
    }
  }, [searchParams])

  const performSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) return
    setLoading(true)
    setHasSearched(true)

    try {
      const fetches: Promise<any>[] = []

      if (activeTab === "all" || activeTab === "books") {
        fetches.push(
          fetch(`/api/books?q=${encodeURIComponent(searchQuery)}`)
            .then((r) => r.json())
            .then((data) => {
              if (Array.isArray(data)) setBooks(data)
              else setBooks([])
            })
            .catch(() => setBooks([]))
        )
      } else {
        setBooks([])
      }

      if (activeTab === "all" || activeTab === "wikipedia") {
        fetches.push(
          fetch(`/api/wiki?q=${encodeURIComponent(searchQuery)}`)
            .then((r) => r.json())
            .then((data) => {
              if (Array.isArray(data)) setWikiArticles(data)
              else setWikiArticles([])
            })
            .catch(() => setWikiArticles([]))
        )
      } else {
        setWikiArticles([])
      }

      if (activeTab === "all" || activeTab === "users") {
        fetches.push(
          fetch(`/api/search-users?q=${encodeURIComponent(searchQuery)}`)
            .then((r) => r.json())
            .then((data) => {
              if (Array.isArray(data)) setCampusUsers(data)
              else setCampusUsers([])
            })
            .catch(() => setCampusUsers([]))
        )
      } else {
        setCampusUsers([])
      }

      await Promise.all(fetches)
    } catch (error) {
      console.error("Search error:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      performSearch(query)
    }
  }

  const handleSummarize = async (
    title: string,
    description: string,
    source: string,
    itemId: string
  ) => {
    const key = `${source}-${itemId}`
    if (summaries[key]) {
      setExpandedSummaries((prev) => ({ ...prev, [key]: !prev[key] }))
      return
    }

    setLoadingSummaries((prev) => ({ ...prev, [key]: true }))
    setExpandedSummaries((prev) => ({ ...prev, [key]: true }))

    try {
      const res = await fetch("/api/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description, source, itemId }),
      })
      const data = await res.json()
      if (data.summary) {
        setSummaries((prev) => ({ ...prev, [key]: data.summary }))
      } else {
        setSummaries((prev) => ({ ...prev, [key]: "Unable to generate summary." }))
      }
    } catch {
      setSummaries((prev) => ({ ...prev, [key]: "Failed to generate summary. Please try again." }))
    } finally {
      setLoadingSummaries((prev) => ({ ...prev, [key]: false }))
    }
  }

  const tabs: { key: TabType; label: string; icon: React.ReactNode }[] = [
    { key: "all", label: "All", icon: <Search className="w-4 h-4" /> },
    { key: "books", label: "Books", icon: <BookOpen className="w-4 h-4" /> },
    { key: "wikipedia", label: "Wikipedia", icon: <Globe className="w-4 h-4" /> },
    { key: "users", label: "Campus Users", icon: <Users className="w-4 h-4" /> },
  ]

  const totalResults = books.length + wikiArticles.length + campusUsers.length

  if (authLoading) {
    return (
      <div className="min-h-screen bg-amber-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-amber-50">
      <Header currentPage="Search" />

      <main className="max-w-5xl mx-auto px-4 py-8">
        <form onSubmit={handleSubmit} className="mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-amber-600 w-6 h-6" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search books, articles, campus users..."
              className="w-full pl-14 pr-14 py-4 text-lg border-2 border-amber-600 rounded-xl bg-white text-amber-900 placeholder-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-700 shadow-md"
            />
            <button
              type="submit"
              className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-amber-600 hover:bg-amber-700 text-white p-2 rounded-lg transition-colors"
            >
              <Search className="w-5 h-5" />
            </button>
          </div>
        </form>

        <div className="flex flex-wrap gap-2 mb-8">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => {
                setActiveTab(tab.key)
                if (hasSearched && query.trim()) {
                  setTimeout(() => performSearch(query), 0)
                }
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === tab.key
                  ? "bg-amber-600 text-white shadow-md"
                  : "bg-amber-200 text-amber-800 hover:bg-amber-300"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-amber-600 mb-4" />
            <p className="text-amber-700 text-lg">Searching...</p>
          </div>
        )}

        {!loading && !hasSearched && (
          <div className="text-center py-20">
            <BookOpen className="w-16 h-16 text-amber-400 mx-auto mb-4" />
            <p className="text-amber-700 text-xl">
              Enter a search term to explore books, articles, and campus users
            </p>
          </div>
        )}

        {!loading && hasSearched && totalResults === 0 && (
          <div className="text-center py-20">
            <Search className="w-16 h-16 text-amber-400 mx-auto mb-4" />
            <p className="text-amber-700 text-xl">
              No results found for &ldquo;{query}&rdquo;. Try different keywords.
            </p>
          </div>
        )}

        {!loading && hasSearched && (
          <div className="space-y-8">
            {(activeTab === "all" || activeTab === "books") && books.length > 0 && (
              <section>
                <h2 className="text-2xl font-bold text-amber-900 mb-4 flex items-center gap-2">
                  <BookOpen className="w-6 h-6" />
                  Books ({books.length})
                </h2>
                <div className="space-y-4">
                  {books.map((book) => {
                    const summaryKey = `books-${book.id}`
                    return (
                      <div
                        key={book.id}
                        className="bg-white border border-amber-300 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow"
                      >
                        <div className="flex gap-4">
                          {book.thumbnail ? (
                            <img
                              src={book.thumbnail}
                              alt={book.title}
                              className="w-24 h-36 object-cover rounded-lg shadow-sm flex-shrink-0"
                            />
                          ) : (
                            <div className="w-24 h-36 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                              <BookOpen className="w-8 h-8 text-amber-400" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <h3 className="text-lg font-bold text-amber-900 mb-1">{book.title}</h3>
                            {book.authors.length > 0 && (
                              <p className="text-amber-700 text-sm mb-1">
                                by {book.authors.join(", ")}
                              </p>
                            )}
                            {book.publishedDate && (
                              <p className="text-amber-500 text-sm mb-2">
                                Published: {book.publishedDate}
                                {book.pageCount > 0 && ` · ${book.pageCount} pages`}
                              </p>
                            )}
                            {book.description && (
                              <p className="text-amber-800 text-sm line-clamp-2 mb-3">
                                {book.description}
                              </p>
                            )}
                            <div className="flex flex-wrap gap-2">
                              <button
                                onClick={() =>
                                  handleSummarize(
                                    book.title,
                                    book.description,
                                    "books",
                                    book.id
                                  )
                                }
                                className="flex items-center gap-1 px-3 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-800 rounded-lg text-sm font-medium transition-colors"
                              >
                                {loadingSummaries[summaryKey] ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <Sparkles className="w-4 h-4" />
                                )}
                                AI Summary
                                {summaries[summaryKey] &&
                                  (expandedSummaries[summaryKey] ? (
                                    <ChevronUp className="w-3 h-3" />
                                  ) : (
                                    <ChevronDown className="w-3 h-3" />
                                  ))}
                              </button>
                              {book.previewLink && (
                                <a
                                  href={book.previewLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-1 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-sm font-medium transition-colors"
                                >
                                  <ExternalLink className="w-4 h-4" />
                                  Preview
                                </a>
                              )}
                            </div>
                          </div>
                        </div>
                        {expandedSummaries[summaryKey] && (
                          <div className="mt-4 bg-amber-50 border border-amber-200 rounded-lg p-4">
                            {loadingSummaries[summaryKey] ? (
                              <div className="flex items-center gap-2 text-amber-700">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Generating AI summary...
                              </div>
                            ) : (
                              <p className="text-amber-700 text-sm leading-relaxed">
                                {summaries[summaryKey]}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </section>
            )}

            {(activeTab === "all" || activeTab === "wikipedia") && wikiArticles.length > 0 && (
              <section>
                <h2 className="text-2xl font-bold text-amber-900 mb-4 flex items-center gap-2">
                  <Globe className="w-6 h-6" />
                  Wikipedia ({wikiArticles.length})
                </h2>
                <div className="space-y-4">
                  {wikiArticles.map((article) => {
                    const summaryKey = `wiki-${article.pageid}`
                    return (
                      <div
                        key={article.pageid}
                        className="bg-white border border-amber-300 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow"
                      >
                        <div className="flex gap-4">
                          <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Globe className="w-6 h-6 text-amber-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-lg font-bold text-amber-900 mb-1">
                              {article.title}
                            </h3>
                            <p className="text-amber-500 text-sm mb-2">
                              {article.wordcount.toLocaleString()} words
                            </p>
                            <p className="text-amber-800 text-sm line-clamp-2 mb-3">
                              {article.snippet}
                            </p>
                            <div className="flex flex-wrap gap-2">
                              <button
                                onClick={() =>
                                  handleSummarize(
                                    article.title,
                                    article.snippet,
                                    "wiki",
                                    article.pageid.toString()
                                  )
                                }
                                className="flex items-center gap-1 px-3 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-800 rounded-lg text-sm font-medium transition-colors"
                              >
                                {loadingSummaries[summaryKey] ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <Sparkles className="w-4 h-4" />
                                )}
                                AI Summary
                                {summaries[summaryKey] &&
                                  (expandedSummaries[summaryKey] ? (
                                    <ChevronUp className="w-3 h-3" />
                                  ) : (
                                    <ChevronDown className="w-3 h-3" />
                                  ))}
                              </button>
                              <a
                                href={article.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-sm font-medium transition-colors"
                              >
                                <ExternalLink className="w-4 h-4" />
                                Read More
                              </a>
                            </div>
                          </div>
                        </div>
                        {expandedSummaries[summaryKey] && (
                          <div className="mt-4 bg-amber-50 border border-amber-200 rounded-lg p-4">
                            {loadingSummaries[summaryKey] ? (
                              <div className="flex items-center gap-2 text-amber-700">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Generating AI summary...
                              </div>
                            ) : (
                              <p className="text-amber-700 text-sm leading-relaxed">
                                {summaries[summaryKey]}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </section>
            )}

            {(activeTab === "all" || activeTab === "users") && campusUsers.length > 0 && (
              <section>
                <h2 className="text-2xl font-bold text-amber-900 mb-4 flex items-center gap-2">
                  <Users className="w-6 h-6" />
                  Campus Users ({campusUsers.length})
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {campusUsers.map((user) => (
                    <div
                      key={user.id}
                      className="bg-white border border-amber-300 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-amber-600 rounded-full flex items-center justify-center text-white text-lg font-bold flex-shrink-0">
                          {(user.firstName?.[0] || user.username?.[0] || "?").toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-amber-900">
                            {user.firstName} {user.lastName}
                          </h3>
                          <p className="text-amber-600 text-sm">@{user.username}</p>
                          {user.college && (
                            <p className="text-amber-500 text-sm">{user.college}</p>
                          )}
                        </div>
                        <button className="flex items-center gap-1 px-3 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-800 rounded-lg text-sm font-medium transition-colors">
                          <MessageCircle className="w-4 h-4" />
                          Message
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </main>
    </div>
  )
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-amber-50 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
        </div>
      }
    >
      <SearchContent />
    </Suspense>
  )
}
