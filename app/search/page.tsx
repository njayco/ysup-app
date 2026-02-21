"use client"

import { useState, useEffect, useRef, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import Header from "@/components/Header"
import { useAuth } from "@/lib/useAuth"
import {
  Search,
  BookOpen,
  Globe,
  Users,
  Loader2,
  ExternalLink,
  MessageCircle,
  Sparkles,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  FileText,
  Video,
  FolderSearch,
} from "lucide-react"

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
  const [selectedBook, setSelectedBook] = useState<Book | null>(null)
  const [carouselIndex, setCarouselIndex] = useState(0)
  const [searchTime, setSearchTime] = useState(0)

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
    setCarouselIndex(0)
    setSelectedBook(null)
    const startTime = Date.now()

    try {
      const fetches: Promise<any>[] = []

      if (activeTab === "all" || activeTab === "books") {
        fetches.push(
          fetch(`/api/books?q=${encodeURIComponent(searchQuery)}`)
            .then((r) => r.json())
            .then((data) => {
              if (Array.isArray(data)) {
                setBooks(data)
                if (data.length > 0) setSelectedBook(data[0])
              } else {
                setBooks([])
              }
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
      setSearchTime(((Date.now() - startTime) / 1000))
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
      setSummaries((prev) => ({
        ...prev,
        [key]: "Failed to generate summary. Please try again.",
      }))
    } finally {
      setLoadingSummaries((prev) => ({ ...prev, [key]: false }))
    }
  }

  const totalResults = books.length + wikiArticles.length + campusUsers.length

  const sidebarCategories = [
    { label: "Everything", icon: <Search className="w-4 h-4" />, tab: "all" as TabType, count: totalResults },
    { label: "Scholarly Sources", icon: <GraduationCap className="w-4 h-4" />, tab: "books" as TabType, count: books.length },
    { label: "Encyclopedia", icon: <Globe className="w-4 h-4" />, tab: "wikipedia" as TabType, count: wikiArticles.length },
    { label: "Campus Users", icon: <Users className="w-4 h-4" />, tab: "users" as TabType, count: campusUsers.length },
  ]

  const scrollCarousel = (direction: "left" | "right") => {
    if (direction === "left" && carouselIndex > 0) {
      setCarouselIndex(carouselIndex - 1)
    } else if (direction === "right" && carouselIndex < books.length - 1) {
      setCarouselIndex(carouselIndex + 1)
    }
  }

  useEffect(() => {
    if (books.length > 0 && carouselIndex < books.length) {
      setSelectedBook(books[carouselIndex])
    }
  }, [carouselIndex, books])

  if (authLoading) {
    return (
      <div className="min-h-screen wood-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-amber-200" />
      </div>
    )
  }

  return (
    <div className="min-h-screen wood-background">
      <Header currentPage="Search" />

      <main className="relative z-10">
        <div className="flex">
          {/* Left Sidebar */}
          <div className="hidden md:block w-64 min-h-[calc(100vh-60px)] p-6 flex-shrink-0">
            <h1 className="text-3xl font-bold text-amber-100 mb-2" style={{ textShadow: "2px 2px 4px rgba(0,0,0,0.5)" }}>
              Search
            </h1>
            {hasSearched && !loading && (
              <p className="text-amber-200 text-sm mb-6" style={{ textShadow: "1px 1px 2px rgba(0,0,0,0.5)" }}>
                About {totalResults.toLocaleString()} Results ({searchTime.toFixed(2)}s)
              </p>
            )}

            <nav className="space-y-1 mt-4">
              {sidebarCategories.map((cat) => (
                <button
                  key={cat.label}
                  onClick={() => {
                    setActiveTab(cat.tab)
                    if (hasSearched && query.trim()) {
                      setTimeout(() => performSearch(query), 0)
                    }
                  }}
                  className={`w-full text-left px-3 py-2 rounded transition-colors ${
                    activeTab === cat.tab
                      ? "bg-amber-900 bg-opacity-60 text-yellow-300 font-bold"
                      : "text-amber-100 hover:bg-amber-900 hover:bg-opacity-30"
                  }`}
                  style={{ textShadow: "1px 1px 2px rgba(0,0,0,0.4)" }}
                >
                  <div className="flex items-center gap-2">
                    {cat.icon}
                    <span className="font-semibold">{cat.label}</span>
                  </div>
                  {hasSearched && (
                    <div className="text-sm opacity-80 ml-6">{cat.count.toLocaleString()} Results</div>
                  )}
                </button>
              ))}
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1 p-4 md:p-6">
            {/* Search Bar */}
            <form onSubmit={handleSubmit} className="mb-6 max-w-3xl mx-auto">
              <div className="relative">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search books, articles, campus users..."
                  className="w-full pl-5 pr-14 py-3 text-lg rounded-full bg-amber-950 bg-opacity-70 border-2 border-amber-700 text-amber-100 placeholder-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-500 shadow-lg"
                  style={{ textShadow: "1px 1px 2px rgba(0,0,0,0.3)" }}
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-amber-700 hover:bg-amber-600 text-white p-2 rounded-full transition-colors"
                >
                  <Search className="w-5 h-5" />
                </button>
              </div>
            </form>

            {/* Mobile Category Tabs */}
            <div className="md:hidden flex flex-wrap gap-2 mb-4 px-2">
              {sidebarCategories.map((cat) => (
                <button
                  key={cat.label}
                  onClick={() => {
                    setActiveTab(cat.tab)
                    if (hasSearched && query.trim()) {
                      setTimeout(() => performSearch(query), 0)
                    }
                  }}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    activeTab === cat.tab
                      ? "bg-amber-700 text-white shadow-md"
                      : "bg-amber-900 bg-opacity-50 text-amber-200 hover:bg-amber-800"
                  }`}
                >
                  {cat.icon}
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Loading State */}
            {loading && (
              <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="w-10 h-10 animate-spin text-amber-300 mb-4" />
                <p className="text-amber-200 text-lg" style={{ textShadow: "1px 1px 2px rgba(0,0,0,0.5)" }}>
                  Searching...
                </p>
              </div>
            )}

            {/* Pre-Search State */}
            {!loading && !hasSearched && (
              <div className="text-center py-20">
                <BookOpen className="w-20 h-20 text-amber-400 mx-auto mb-4 opacity-60" />
                <p className="text-amber-200 text-xl" style={{ textShadow: "1px 1px 3px rgba(0,0,0,0.5)" }}>
                  Enter a search term to explore books, articles, and campus users
                </p>
              </div>
            )}

            {/* No Results */}
            {!loading && hasSearched && totalResults === 0 && (
              <div className="text-center py-20">
                <Search className="w-20 h-20 text-amber-400 mx-auto mb-4 opacity-60" />
                <p className="text-amber-200 text-xl" style={{ textShadow: "1px 1px 3px rgba(0,0,0,0.5)" }}>
                  No results found for &ldquo;{query}&rdquo;. Try different keywords.
                </p>
              </div>
            )}

            {/* Results */}
            {!loading && hasSearched && totalResults > 0 && (
              <div className="space-y-8">
                {/* 3D Book Carousel */}
                {(activeTab === "all" || activeTab === "books") && books.length > 0 && (
                  <section>
                    <div className="relative">
                      {/* Carousel Container */}
                      <div className="relative flex items-center justify-center py-4 overflow-hidden" style={{ perspective: "1200px", minHeight: "340px" }}>
                        {/* Left Arrow */}
                        {carouselIndex > 0 && (
                          <button
                            onClick={() => scrollCarousel("left")}
                            className="absolute left-0 z-30 bg-amber-900 bg-opacity-70 hover:bg-opacity-90 text-amber-200 p-2 rounded-full shadow-lg transition-all"
                          >
                            <ChevronLeft className="w-6 h-6" />
                          </button>
                        )}

                        {/* Books */}
                        <div className="flex items-center justify-center" style={{ transformStyle: "preserve-3d" }}>
                          {books.map((book, index) => {
                            const offset = index - carouselIndex
                            const absOffset = Math.abs(offset)
                            if (absOffset > 3) return null

                            const translateX = offset * 140
                            const translateZ = -absOffset * 100
                            const rotateY = offset * -15
                            const scale = 1 - absOffset * 0.12
                            const opacity = 1 - absOffset * 0.25
                            const zIndex = 10 - absOffset

                            return (
                              <div
                                key={book.id}
                                onClick={() => {
                                  setCarouselIndex(index)
                                  setSelectedBook(book)
                                }}
                                className="absolute cursor-pointer transition-all duration-500 ease-out"
                                style={{
                                  transform: `translateX(${translateX}px) translateZ(${translateZ}px) rotateY(${rotateY}deg) scale(${scale})`,
                                  zIndex,
                                  opacity,
                                }}
                              >
                                <div className="relative group">
                                  {book.thumbnail ? (
                                    <img
                                      src={book.thumbnail}
                                      alt={book.title}
                                      className="w-40 h-56 object-cover rounded-lg shadow-2xl border-2 border-amber-800"
                                      style={{
                                        boxShadow: offset === 0
                                          ? "0 20px 60px rgba(0,0,0,0.6), 0 0 20px rgba(255,193,7,0.3)"
                                          : "0 10px 30px rgba(0,0,0,0.4)",
                                      }}
                                    />
                                  ) : (
                                    <div
                                      className="w-40 h-56 bg-amber-800 rounded-lg flex flex-col items-center justify-center border-2 border-amber-700 shadow-2xl"
                                      style={{
                                        boxShadow: offset === 0
                                          ? "0 20px 60px rgba(0,0,0,0.6), 0 0 20px rgba(255,193,7,0.3)"
                                          : "0 10px 30px rgba(0,0,0,0.4)",
                                      }}
                                    >
                                      <BookOpen className="w-10 h-10 text-amber-400 mb-2" />
                                      <p className="text-amber-200 text-xs text-center px-2 line-clamp-3">
                                        {book.title}
                                      </p>
                                    </div>
                                  )}
                                  {offset === 0 && (
                                    <div className="absolute -left-2 top-1/2 -translate-y-1/2">
                                      <div className="w-0 h-0 border-t-[10px] border-t-transparent border-b-[10px] border-b-transparent border-l-[14px] border-l-amber-300"></div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )
                          })}
                        </div>

                        {/* Right Arrow */}
                        {carouselIndex < books.length - 1 && (
                          <button
                            onClick={() => scrollCarousel("right")}
                            className="absolute right-0 z-30 bg-amber-900 bg-opacity-70 hover:bg-opacity-90 text-amber-200 p-2 rounded-full shadow-lg transition-all"
                          >
                            <ChevronRight className="w-6 h-6" />
                          </button>
                        )}
                      </div>

                      {/* Selected Book Details */}
                      {selectedBook && (
                        <div className="mt-2 max-w-3xl mx-auto">
                          <div className="bg-amber-950 bg-opacity-60 rounded-xl p-4 border border-amber-800">
                            <p className="text-amber-100 text-sm leading-relaxed" style={{ textShadow: "1px 1px 2px rgba(0,0,0,0.3)" }}>
                              <span className="text-amber-300 font-semibold">
                                &ldquo;{selectedBook.title}&rdquo;
                              </span>
                              {selectedBook.authors.length > 0 && (
                                <span> by {selectedBook.authors.join(", ")}</span>
                              )}
                              {selectedBook.publishedDate && (
                                <span> &middot; {selectedBook.publishedDate}</span>
                              )}
                              {selectedBook.previewLink && (
                                <span> &middot; <a href={selectedBook.previewLink} target="_blank" rel="noopener noreferrer" className="text-amber-400 underline hover:text-amber-300">books.google.com</a></span>
                              )}
                            </p>
                            {selectedBook.description && (
                              <p className="text-amber-200 text-sm mt-2 line-clamp-3 opacity-80">
                                {selectedBook.description}
                              </p>
                            )}
                            <div className="flex flex-wrap gap-2 mt-3">
                              <button
                                onClick={() =>
                                  handleSummarize(
                                    selectedBook.title,
                                    selectedBook.description,
                                    "books",
                                    selectedBook.id
                                  )
                                }
                                className="flex items-center gap-1 px-3 py-1.5 bg-amber-700 hover:bg-amber-600 text-amber-100 rounded-lg text-sm font-medium transition-colors"
                              >
                                {loadingSummaries[`books-${selectedBook.id}`] ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <Sparkles className="w-4 h-4" />
                                )}
                                AI Summary
                              </button>
                              {selectedBook.previewLink && (
                                <a
                                  href={selectedBook.previewLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-1 px-3 py-1.5 bg-amber-800 hover:bg-amber-700 text-amber-200 rounded-lg text-sm font-medium transition-colors"
                                >
                                  <ExternalLink className="w-4 h-4" />
                                  Preview
                                </a>
                              )}
                            </div>

                            {/* AI Summary for selected book */}
                            {expandedSummaries[`books-${selectedBook.id}`] && (
                              <div className="mt-3 bg-amber-900 bg-opacity-50 border border-amber-700 rounded-lg p-4">
                                {loadingSummaries[`books-${selectedBook.id}`] ? (
                                  <div className="flex items-center gap-2 text-amber-300">
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Generating AI summary...
                                  </div>
                                ) : (
                                  <p className="text-amber-200 text-sm leading-relaxed">
                                    {summaries[`books-${selectedBook.id}`]}
                                  </p>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </section>
                )}

                {/* Wikipedia Results */}
                {(activeTab === "all" || activeTab === "wikipedia") && wikiArticles.length > 0 && (
                  <section className="max-w-3xl mx-auto">
                    <h2
                      className="text-xl font-bold text-amber-200 mb-4 flex items-center gap-2"
                      style={{ textShadow: "1px 1px 3px rgba(0,0,0,0.5)" }}
                    >
                      <Globe className="w-5 h-5" />
                      Encyclopedia ({wikiArticles.length})
                    </h2>
                    <div className="space-y-3">
                      {wikiArticles.map((article) => {
                        const summaryKey = `wiki-${article.pageid}`
                        return (
                          <div
                            key={article.pageid}
                            className="bg-amber-950 bg-opacity-50 border border-amber-800 rounded-xl p-4 hover:bg-opacity-60 transition-all"
                          >
                            <div className="flex gap-3">
                              <div className="w-10 h-10 bg-amber-800 rounded-lg flex items-center justify-center flex-shrink-0">
                                <Globe className="w-5 h-5 text-amber-300" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3 className="text-lg font-bold text-amber-200 mb-1" style={{ textShadow: "1px 1px 2px rgba(0,0,0,0.4)" }}>
                                  {article.title}
                                </h3>
                                <p className="text-amber-400 text-xs mb-2">
                                  {article.wordcount.toLocaleString()} words
                                </p>
                                <p className="text-amber-200 text-sm line-clamp-2 mb-3 opacity-80">
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
                                    className="flex items-center gap-1 px-3 py-1.5 bg-amber-700 hover:bg-amber-600 text-amber-100 rounded-lg text-sm font-medium transition-colors"
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
                                    className="flex items-center gap-1 px-3 py-1.5 bg-amber-800 hover:bg-amber-700 text-amber-200 rounded-lg text-sm font-medium transition-colors"
                                  >
                                    <ExternalLink className="w-4 h-4" />
                                    Read More
                                  </a>
                                </div>
                              </div>
                            </div>
                            {expandedSummaries[summaryKey] && (
                              <div className="mt-3 bg-amber-900 bg-opacity-50 border border-amber-700 rounded-lg p-4">
                                {loadingSummaries[summaryKey] ? (
                                  <div className="flex items-center gap-2 text-amber-300">
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Generating AI summary...
                                  </div>
                                ) : (
                                  <p className="text-amber-200 text-sm leading-relaxed">
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

                {/* Campus Users */}
                {(activeTab === "all" || activeTab === "users") && campusUsers.length > 0 && (
                  <section className="max-w-3xl mx-auto">
                    <h2
                      className="text-xl font-bold text-amber-200 mb-4 flex items-center gap-2"
                      style={{ textShadow: "1px 1px 3px rgba(0,0,0,0.5)" }}
                    >
                      <Users className="w-5 h-5" />
                      Campus Users ({campusUsers.length})
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {campusUsers.map((user) => (
                        <div
                          key={user.id}
                          className="bg-amber-950 bg-opacity-50 border border-amber-800 rounded-xl p-4 hover:bg-opacity-60 transition-all"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-amber-700 rounded-full flex items-center justify-center text-amber-100 text-lg font-bold flex-shrink-0 shadow-lg">
                              {(user.firstName?.[0] || user.username?.[0] || "?").toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-bold text-amber-200" style={{ textShadow: "1px 1px 2px rgba(0,0,0,0.4)" }}>
                                {user.firstName} {user.lastName}
                              </h3>
                              <p className="text-amber-400 text-sm">@{user.username}</p>
                              {user.college && (
                                <p className="text-amber-500 text-xs">{user.college}</p>
                              )}
                            </div>
                            <button className="flex items-center gap-1 px-3 py-1.5 bg-amber-700 hover:bg-amber-600 text-amber-100 rounded-lg text-sm font-medium transition-colors">
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
          </div>
        </div>
      </main>
    </div>
  )
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen wood-background flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-amber-200" />
        </div>
      }
    >
      <SearchContent />
    </Suspense>
  )
}
