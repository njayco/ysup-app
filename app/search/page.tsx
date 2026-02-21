"use client"

import { useState, useEffect, useRef, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import Header from "@/components/Header"
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
  Monitor,
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

interface ScholarArticle {
  id: string
  title: string
  authors: string
  snippet: string
  url: string
  citedBy: number
  year: string
  source: string
  pdfUrl: string
}

interface WebResult {
  id: string
  title: string
  snippet: string
  url: string
  displayUrl: string
}

interface CampusUser {
  id: number
  username: string
  firstName: string
  lastName: string
  college: string
}

type TabType = "all" | "web" | "scholar" | "books" | "wikipedia" | "users"

function BookPlaceholder({ title, authors, isFocused }: { title: string; authors: string[]; isFocused: boolean }) {
  const authorText = authors.length > 0 ? authors[0] : ""
  return (
    <div
      className="w-40 h-56 rounded-lg border-2 border-blue-700 flex flex-col items-center justify-between overflow-hidden relative"
      style={{
        background: "linear-gradient(135deg, #1a2a4a 0%, #2d4a7a 40%, #1e3a6a 60%, #0f2040 100%)",
        boxShadow: isFocused
          ? "0 20px 60px rgba(0,0,0,0.6), 0 0 20px rgba(59,130,246,0.3), inset -3px 0 8px rgba(0,0,0,0.3)"
          : "0 10px 30px rgba(0,0,0,0.4), inset -3px 0 8px rgba(0,0,0,0.3)",
      }}
    >
      <div className="absolute inset-0 opacity-10" style={{ background: "repeating-linear-gradient(90deg, transparent, transparent 8px, rgba(255,255,255,0.03) 8px, rgba(255,255,255,0.03) 9px)" }} />
      <div className="absolute left-0 top-0 bottom-0 w-3" style={{ background: "linear-gradient(90deg, rgba(0,0,0,0.3) 0%, transparent 100%)" }} />
      <div className="w-full px-3 pt-3 z-10">
        <div className="flex items-center gap-1 mb-1">
          <BookOpen className="w-3 h-3 text-blue-400 opacity-70" />
          <p className="text-blue-400 text-[8px] uppercase tracking-wider opacity-70">Book</p>
        </div>
        <div className="w-full h-0.5 bg-blue-500 opacity-30 rounded-full" />
      </div>
      <div className="flex-1 flex flex-col items-center justify-center px-3 py-2 z-10">
        <p className="text-blue-100 text-xs text-center font-bold leading-tight line-clamp-4" style={{ textShadow: "1px 1px 2px rgba(0,0,0,0.6)" }}>
          {title}
        </p>
      </div>
      {authorText && (
        <div className="w-full px-3 pb-3 z-10">
          <div className="w-full h-0.5 bg-blue-500 opacity-30 rounded-full mb-1" />
          <p className="text-blue-300 text-[10px] text-center opacity-80 line-clamp-2" style={{ textShadow: "1px 1px 2px rgba(0,0,0,0.6)" }}>
            {authorText}
          </p>
        </div>
      )}
    </div>
  )
}

function JournalPlaceholder({ title, authors, isFocused }: { title: string; authors: string; isFocused: boolean }) {
  return (
    <div
      className="w-40 h-56 rounded-lg border-2 border-emerald-700 flex flex-col items-center justify-between overflow-hidden relative"
      style={{
        background: "linear-gradient(135deg, #1a3a2a 0%, #2d5a3d 40%, #1e4a30 60%, #0f2e1d 100%)",
        boxShadow: isFocused
          ? "0 20px 60px rgba(0,0,0,0.6), 0 0 20px rgba(16,185,129,0.3), inset -3px 0 8px rgba(0,0,0,0.3)"
          : "0 10px 30px rgba(0,0,0,0.4), inset -3px 0 8px rgba(0,0,0,0.3)",
      }}
    >
      <div className="absolute inset-0 opacity-10" style={{ background: "repeating-linear-gradient(90deg, transparent, transparent 8px, rgba(255,255,255,0.03) 8px, rgba(255,255,255,0.03) 9px)" }} />
      <div className="absolute left-0 top-0 bottom-0 w-3" style={{ background: "linear-gradient(90deg, rgba(0,0,0,0.3) 0%, transparent 100%)" }} />
      <div className="w-full px-3 pt-3 z-10">
        <div className="flex items-center gap-1 mb-1">
          <GraduationCap className="w-3 h-3 text-emerald-400 opacity-70" />
          <p className="text-emerald-400 text-[8px] uppercase tracking-wider opacity-70">Journal</p>
        </div>
        <div className="w-full h-0.5 bg-emerald-500 opacity-30 rounded-full" />
      </div>
      <div className="flex-1 flex flex-col items-center justify-center px-3 py-2 z-10">
        <p className="text-emerald-100 text-xs text-center font-bold leading-tight line-clamp-4" style={{ textShadow: "1px 1px 2px rgba(0,0,0,0.6)" }}>
          {title}
        </p>
      </div>
      {authors && (
        <div className="w-full px-3 pb-3 z-10">
          <div className="w-full h-0.5 bg-emerald-500 opacity-30 rounded-full mb-1" />
          <p className="text-emerald-300 text-[10px] text-center opacity-80 line-clamp-2" style={{ textShadow: "1px 1px 2px rgba(0,0,0,0.6)" }}>
            {authors}
          </p>
        </div>
      )}
    </div>
  )
}

function SearchContent() {
  const searchParams = useSearchParams()

  const [query, setQuery] = useState("")
  const [activeTab, setActiveTab] = useState<TabType>("all")
  const [books, setBooks] = useState<Book[]>([])
  const [scholarArticles, setScholarArticles] = useState<ScholarArticle[]>([])
  const [wikiArticles, setWikiArticles] = useState<WikiArticle[]>([])
  const [webResults, setWebResults] = useState<WebResult[]>([])
  const [campusUsers, setCampusUsers] = useState<CampusUser[]>([])
  const [loading, setLoading] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const [summaries, setSummaries] = useState<Record<string, string>>({})
  const [loadingSummaries, setLoadingSummaries] = useState<Record<string, boolean>>({})
  const [expandedSummaries, setExpandedSummaries] = useState<Record<string, boolean>>({})
  const [selectedBook, setSelectedBook] = useState<Book | null>(null)
  const [carouselIndex, setCarouselIndex] = useState(0)
  const [scholarCarouselIndex, setScholarCarouselIndex] = useState(0)
  const [selectedScholar, setSelectedScholar] = useState<ScholarArticle | null>(null)
  const [searchTime, setSearchTime] = useState(0)
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set())
  const [aiOverview, setAiOverview] = useState("")
  const [loadingOverview, setLoadingOverview] = useState(false)
  const searchedQueryRef = useRef<string>("")

  const performSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) return
    if (searchedQueryRef.current === searchQuery.trim()) return
    searchedQueryRef.current = searchQuery.trim()

    setLoading(true)
    setHasSearched(true)
    setCarouselIndex(0)
    setScholarCarouselIndex(0)
    setSelectedBook(null)
    setSelectedScholar(null)
    setFailedImages(new Set())
    setAiOverview("")
    const startTime = Date.now()

    try {
      const [booksRes, scholarRes, wikiRes, usersRes, webRes] = await Promise.allSettled([
        fetch(`/api/books?q=${encodeURIComponent(searchQuery)}`).then((r) => r.json()),
        fetch(`/api/scholar?q=${encodeURIComponent(searchQuery)}`).then((r) => r.json()),
        fetch(`/api/wiki?q=${encodeURIComponent(searchQuery)}`).then((r) => r.json()),
        fetch(`/api/search-users?q=${encodeURIComponent(searchQuery)}`).then((r) => r.json()),
        fetch(`/api/web-search?q=${encodeURIComponent(searchQuery)}`).then((r) => r.json()),
      ])

      const booksData = booksRes.status === "fulfilled" && Array.isArray(booksRes.value) ? booksRes.value : []
      const scholarData = scholarRes.status === "fulfilled" && Array.isArray(scholarRes.value) ? scholarRes.value : []
      const wikiData = wikiRes.status === "fulfilled" && Array.isArray(wikiRes.value) ? wikiRes.value : []
      const usersData = usersRes.status === "fulfilled" && Array.isArray(usersRes.value) ? usersRes.value : []
      const webData = webRes.status === "fulfilled" && Array.isArray(webRes.value) ? webRes.value : []

      setBooks(booksData)
      setScholarArticles(scholarData)
      setWikiArticles(wikiData)
      setCampusUsers(usersData)
      setWebResults(webData)

      if (booksData.length > 0) setSelectedBook(booksData[0])
      if (scholarData.length > 0) setSelectedScholar(scholarData[0])

      setSearchTime((Date.now() - startTime) / 1000)

      fetchAiOverview(searchQuery)
    } catch (error) {
      console.error("Search error:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchAiOverview = async (searchQuery: string) => {
    setLoadingOverview(true)
    try {
      const res = await fetch("/api/ai-overview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: searchQuery }),
      })
      const data = await res.json()
      if (data.overview) {
        setAiOverview(data.overview)
      }
    } catch {
      console.error("Failed to fetch AI overview")
    } finally {
      setLoadingOverview(false)
    }
  }

  const urlQuery = searchParams.get("q") || ""

  useEffect(() => {
    if (urlQuery) {
      searchedQueryRef.current = ""
      setQuery(urlQuery)
      performSearch(urlQuery)
    }
  }, [urlQuery])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      searchedQueryRef.current = ""
      const newUrl = `/search?q=${encodeURIComponent(query.trim())}`
      window.location.href = newUrl
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

  const totalResults = books.length + scholarArticles.length + wikiArticles.length + campusUsers.length + webResults.length

  const sidebarCategories = [
    { label: "Everything", icon: <Search className="w-4 h-4" />, tab: "all" as TabType, count: totalResults },
    { label: "Books", icon: <BookOpen className="w-4 h-4" />, tab: "books" as TabType, count: books.length },
    { label: "Scholarly Articles", icon: <GraduationCap className="w-4 h-4" />, tab: "scholar" as TabType, count: scholarArticles.length },
    { label: "Web", icon: <Monitor className="w-4 h-4" />, tab: "web" as TabType, count: webResults.length },
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

  const scrollScholarCarousel = (direction: "left" | "right") => {
    if (direction === "left" && scholarCarouselIndex > 0) {
      setScholarCarouselIndex(scholarCarouselIndex - 1)
    } else if (direction === "right" && scholarCarouselIndex < scholarArticles.length - 1) {
      setScholarCarouselIndex(scholarCarouselIndex + 1)
    }
  }

  useEffect(() => {
    if (books.length > 0 && carouselIndex < books.length) {
      setSelectedBook(books[carouselIndex])
    }
  }, [carouselIndex, books])

  useEffect(() => {
    if (scholarArticles.length > 0 && scholarCarouselIndex < scholarArticles.length) {
      setSelectedScholar(scholarArticles[scholarCarouselIndex])
    }
  }, [scholarCarouselIndex, scholarArticles])

  const handleImageError = (bookId: string) => {
    setFailedImages((prev) => new Set(prev).add(bookId))
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
                  onClick={() => setActiveTab(cat.tab)}
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
                    <p className="text-xs text-amber-400 mt-0.5 ml-6">{cat.count} results</p>
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
                  placeholder="Search the Web, Books, Scholarly Articles or find classmates"
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
                  onClick={() => setActiveTab(cat.tab)}
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
                  Search the Web, Books, Scholarly Articles or find classmates
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

            {/* Per-tab empty state */}
            {!loading && hasSearched && totalResults > 0 && activeTab !== "all" && (
              (activeTab === "web" && webResults.length === 0) ||
              (activeTab === "books" && books.length === 0) ||
              (activeTab === "scholar" && scholarArticles.length === 0) ||
              (activeTab === "wikipedia" && wikiArticles.length === 0) ||
              (activeTab === "users" && campusUsers.length === 0)
            ) && (
              <div className="text-center py-20">
                <FolderSearch className="w-16 h-16 text-amber-400 mx-auto mb-4 opacity-60" />
                <p className="text-amber-200 text-lg" style={{ textShadow: "1px 1px 3px rgba(0,0,0,0.5)" }}>
                  No {activeTab === "web" ? "web results" : activeTab === "books" ? "books" : activeTab === "scholar" ? "scholarly articles" : activeTab === "wikipedia" ? "encyclopedia articles" : "campus users"} found for &ldquo;{query}&rdquo;
                </p>
                <p className="text-amber-400 text-sm mt-2 opacity-70">Try checking other categories for results</p>
              </div>
            )}

            {/* AI Overview */}
            {!loading && hasSearched && (aiOverview || loadingOverview) && (
              <div className="max-w-3xl mx-auto mb-6">
                <div className="bg-gradient-to-br from-amber-950 via-amber-900 to-amber-950 bg-opacity-80 rounded-xl p-5 border border-amber-700 shadow-lg">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-7 h-7 bg-amber-700 rounded-lg flex items-center justify-center">
                      <Sparkles className="w-4 h-4 text-amber-200" />
                    </div>
                    <h3 className="text-lg font-bold text-amber-200" style={{ textShadow: "1px 1px 3px rgba(0,0,0,0.5)" }}>
                      AI Overview
                    </h3>
                  </div>
                  {loadingOverview ? (
                    <div className="flex items-center gap-2 text-amber-300 py-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="text-sm">Generating overview...</span>
                    </div>
                  ) : (
                    <p className="text-amber-100 text-sm leading-relaxed" style={{ textShadow: "1px 1px 2px rgba(0,0,0,0.3)" }}>
                      {aiOverview}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Results */}
            {!loading && hasSearched && totalResults > 0 && (
              <div className="space-y-8">
                {/* Web Results */}
                {(activeTab === "all" || activeTab === "web") && webResults.length > 0 && (
                  <section className="max-w-3xl mx-auto">
                    <h2
                      className="text-xl font-bold text-amber-200 mb-4 flex items-center gap-2"
                      style={{ textShadow: "1px 1px 3px rgba(0,0,0,0.5)" }}
                    >
                      <Monitor className="w-5 h-5" />
                      Web Results ({webResults.length})
                    </h2>
                    <div className="space-y-3">
                      {webResults.map((result) => (
                        <div
                          key={result.id}
                          className="bg-amber-950 bg-opacity-50 border border-amber-800 rounded-xl p-4 hover:bg-opacity-60 transition-all"
                        >
                          <div className="flex gap-3">
                            <div className="w-10 h-10 bg-blue-900 rounded-lg flex items-center justify-center flex-shrink-0">
                              <Monitor className="w-5 h-5 text-blue-300" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-amber-500 text-xs mb-0.5 truncate">{result.displayUrl}</p>
                              <h3 className="text-lg font-bold text-amber-200 mb-1" style={{ textShadow: "1px 1px 2px rgba(0,0,0,0.4)" }}>
                                <a href={result.url} target="_blank" rel="noopener noreferrer" className="hover:text-amber-100 transition-colors">
                                  {result.title}
                                </a>
                              </h3>
                              <p className="text-amber-200 text-sm line-clamp-2 opacity-80">
                                {result.snippet}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {/* 3D Book Carousel */}
                {(activeTab === "all" || activeTab === "books") && books.length > 0 && (
                  <section>
                    <div className="relative">
                      <div className="relative flex items-center justify-center py-4 overflow-hidden" style={{ perspective: "1200px", minHeight: "240px" }}>
                        {carouselIndex > 0 && (
                          <button
                            onClick={() => scrollCarousel("left")}
                            className="absolute left-0 z-30 bg-blue-900 bg-opacity-70 hover:bg-opacity-90 text-blue-200 p-1.5 md:p-2 rounded-full shadow-lg transition-all"
                          >
                            <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
                          </button>
                        )}

                        <div className="flex items-center justify-center" style={{ transformStyle: "preserve-3d" }}>
                          {books.map((book, index) => {
                            const offset = index - carouselIndex
                            const absOffset = Math.abs(offset)
                            const isMobile = typeof window !== "undefined" && window.innerWidth < 768
                            if (absOffset > (isMobile ? 2 : 3)) return null

                            const mobileScale = isMobile ? 0.75 : 1
                            const translateX = offset * (isMobile ? 100 : 140)
                            const translateZ = -absOffset * (isMobile ? 70 : 100)
                            const rotateY = offset * -15
                            const scale = (1 - absOffset * 0.12) * mobileScale
                            const opacity = 1 - absOffset * 0.25
                            const zIndex = 10 - absOffset
                            const isFocused = offset === 0

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
                                  <BookPlaceholder title={book.title} authors={book.authors} isFocused={isFocused} />
                                  {isFocused && (
                                    <div className="absolute -left-2 top-1/2 -translate-y-1/2 hidden md:block">
                                      <div className="w-0 h-0 border-t-[10px] border-t-transparent border-b-[10px] border-b-transparent border-l-[14px] border-l-blue-300"></div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )
                          })}
                        </div>

                        {carouselIndex < books.length - 1 && (
                          <button
                            onClick={() => scrollCarousel("right")}
                            className="absolute right-0 z-30 bg-blue-900 bg-opacity-70 hover:bg-opacity-90 text-blue-200 p-1.5 md:p-2 rounded-full shadow-lg transition-all"
                          >
                            <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
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

                {/* 3D Scholar Journal Carousel */}
                {(activeTab === "all" || activeTab === "scholar") && scholarArticles.length > 0 && (
                  <section>
                    <h2
                      className="text-xl font-bold text-amber-200 mb-2 flex items-center gap-2 max-w-3xl mx-auto"
                      style={{ textShadow: "1px 1px 3px rgba(0,0,0,0.5)" }}
                    >
                      <GraduationCap className="w-5 h-5" />
                      Scholarly Articles ({scholarArticles.length})
                    </h2>
                    <div className="relative">
                      <div className="relative flex items-center justify-center py-4 overflow-hidden" style={{ perspective: "1200px", minHeight: "240px" }}>
                        {scholarCarouselIndex > 0 && (
                          <button
                            onClick={() => scrollScholarCarousel("left")}
                            className="absolute left-0 z-30 bg-emerald-900 bg-opacity-70 hover:bg-opacity-90 text-emerald-200 p-1.5 md:p-2 rounded-full shadow-lg transition-all"
                          >
                            <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
                          </button>
                        )}

                        <div className="flex items-center justify-center" style={{ transformStyle: "preserve-3d" }}>
                          {scholarArticles.map((article, index) => {
                            const offset = index - scholarCarouselIndex
                            const absOffset = Math.abs(offset)
                            const isMobile = typeof window !== "undefined" && window.innerWidth < 768
                            if (absOffset > (isMobile ? 2 : 3)) return null

                            const mobileScale = isMobile ? 0.75 : 1
                            const translateX = offset * (isMobile ? 100 : 140)
                            const translateZ = -absOffset * (isMobile ? 70 : 100)
                            const rotateY = offset * -15
                            const scale = (1 - absOffset * 0.12) * mobileScale
                            const opacity = 1 - absOffset * 0.25
                            const zIndex = 10 - absOffset
                            const isFocused = offset === 0

                            return (
                              <div
                                key={article.id}
                                onClick={() => {
                                  setScholarCarouselIndex(index)
                                  setSelectedScholar(article)
                                }}
                                className="absolute cursor-pointer transition-all duration-500 ease-out"
                                style={{
                                  transform: `translateX(${translateX}px) translateZ(${translateZ}px) rotateY(${rotateY}deg) scale(${scale})`,
                                  zIndex,
                                  opacity,
                                }}
                              >
                                <div className="relative group">
                                  <JournalPlaceholder title={article.title} authors={article.authors} isFocused={isFocused} />
                                  {isFocused && (
                                    <div className="absolute -left-2 top-1/2 -translate-y-1/2 hidden md:block">
                                      <div className="w-0 h-0 border-t-[10px] border-t-transparent border-b-[10px] border-b-transparent border-l-[14px] border-l-emerald-300"></div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )
                          })}
                        </div>

                        {scholarCarouselIndex < scholarArticles.length - 1 && (
                          <button
                            onClick={() => scrollScholarCarousel("right")}
                            className="absolute right-0 z-30 bg-emerald-900 bg-opacity-70 hover:bg-opacity-90 text-emerald-200 p-1.5 md:p-2 rounded-full shadow-lg transition-all"
                          >
                            <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
                          </button>
                        )}
                      </div>

                      {/* Selected Scholar Details */}
                      {selectedScholar && (
                        <div className="mt-2 max-w-3xl mx-auto">
                          <div className="bg-emerald-950 bg-opacity-60 rounded-xl p-4 border border-emerald-800">
                            <p className="text-emerald-100 text-sm leading-relaxed" style={{ textShadow: "1px 1px 2px rgba(0,0,0,0.3)" }}>
                              <span className="text-emerald-300 font-semibold">
                                &ldquo;{selectedScholar.title}&rdquo;
                              </span>
                              {selectedScholar.authors && (
                                <span> by {selectedScholar.authors}</span>
                              )}
                              {selectedScholar.year && (
                                <span> &middot; {selectedScholar.year}</span>
                              )}
                              {selectedScholar.source && (
                                <span> &middot; {selectedScholar.source}</span>
                              )}
                            </p>
                            {selectedScholar.citedBy > 0 && (
                              <p className="text-emerald-400 text-xs mt-1">
                                Cited by {selectedScholar.citedBy.toLocaleString()}
                              </p>
                            )}
                            {selectedScholar.snippet && (
                              <p className="text-emerald-200 text-sm mt-2 line-clamp-3 opacity-80">
                                {selectedScholar.snippet}
                              </p>
                            )}
                            <div className="flex flex-wrap gap-2 mt-3">
                              <button
                                onClick={() =>
                                  handleSummarize(
                                    selectedScholar.title,
                                    selectedScholar.snippet,
                                    "scholar",
                                    selectedScholar.id
                                  )
                                }
                                className="flex items-center gap-1 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-emerald-100 rounded-lg text-sm font-medium transition-colors"
                              >
                                {loadingSummaries[`scholar-${selectedScholar.id}`] ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <Sparkles className="w-4 h-4" />
                                )}
                                AI Summary
                              </button>
                              {selectedScholar.url && (
                                <a
                                  href={selectedScholar.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-1 px-3 py-1.5 bg-emerald-800 hover:bg-emerald-700 text-emerald-200 rounded-lg text-sm font-medium transition-colors"
                                >
                                  <ExternalLink className="w-4 h-4" />
                                  View Article
                                </a>
                              )}
                              {selectedScholar.pdfUrl && (
                                <a
                                  href={selectedScholar.pdfUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-1 px-3 py-1.5 bg-green-800 hover:bg-green-700 text-green-100 rounded-lg text-sm font-medium transition-colors"
                                >
                                  <FileText className="w-4 h-4" />
                                  PDF
                                </a>
                              )}
                            </div>

                            {expandedSummaries[`scholar-${selectedScholar.id}`] && (
                              <div className="mt-3 bg-emerald-900 bg-opacity-50 border border-emerald-700 rounded-lg p-4">
                                {loadingSummaries[`scholar-${selectedScholar.id}`] ? (
                                  <div className="flex items-center gap-2 text-emerald-300">
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Generating AI summary...
                                  </div>
                                ) : (
                                  <p className="text-emerald-200 text-sm leading-relaxed">
                                    {summaries[`scholar-${selectedScholar.id}`]}
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
