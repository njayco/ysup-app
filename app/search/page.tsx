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

interface AmazonBook {
  id: string
  title: string
  authors: string[]
  description: string
  publishedDate: string
  pageCount: number
  rating: number
  ratingsCount: number
  isbn: string
  amazonUrl: string
  categories: string[]
}

interface DictionaryDefinition {
  definition: string
  example: string
  synonyms: string[]
  antonyms: string[]
}

interface DictionaryMeaning {
  partOfSpeech: string
  definitions: DictionaryDefinition[]
  synonyms: string[]
  antonyms: string[]
}

interface DictionaryResult {
  word: string
  phonetic: string
  audioUrl: string
  origin: string
  meanings: DictionaryMeaning[]
  sourceUrl: string
}

interface CampusUser {
  id: number
  username: string
  firstName: string
  lastName: string
  college: string
}

interface ImageResult {
  id: string
  title: string
  image: string
  thumbnail: string
  url: string
  width: number
  height: number
  source: string
}

interface VideoResult {
  id: string
  title: string
  description: string
  url: string
  embedUrl: string
  thumbnail: string
  duration: string
  published: string
  publisher: string
  viewCount: number
}

interface NewsResult {
  id: string
  title: string
  snippet: string
  url: string
  source: string
  date: string
  image: string
}

type TabType = "all" | "web" | "scholar" | "books" | "amazon" | "wikipedia" | "dictionary" | "users" | "images" | "videos" | "news" | "maps" | "shopping"

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

function StarRating({ rating, count }: { rating: number; count: number }) {
  const stars = []
  for (let i = 1; i <= 5; i++) {
    if (i <= Math.floor(rating)) {
      stars.push(<span key={i} className="text-yellow-400 text-xs">★</span>)
    } else if (i - 0.5 <= rating) {
      stars.push(<span key={i} className="text-yellow-400 text-xs">★</span>)
    } else {
      stars.push(<span key={i} className="text-yellow-700 text-xs">★</span>)
    }
  }
  return (
    <div className="flex items-center gap-1">
      <div className="flex">{stars}</div>
      {rating > 0 && <span className="text-yellow-300 text-[10px]">{rating.toFixed(1)}</span>}
      {count > 0 && <span className="text-yellow-500 text-[9px]">({count.toLocaleString()})</span>}
    </div>
  )
}

function AmazonBookPlaceholder({ title, authors, rating, isFocused }: { title: string; authors: string[]; rating: number; isFocused: boolean }) {
  const authorText = authors.length > 0 ? authors[0] : ""
  return (
    <div
      className="w-40 h-56 rounded-lg border-2 border-yellow-600 flex flex-col items-center justify-between overflow-hidden relative"
      style={{
        background: "linear-gradient(135deg, #4a3a0a 0%, #7a6a1d 40%, #5a4a10 60%, #3a2a05 100%)",
        boxShadow: isFocused
          ? "0 20px 60px rgba(0,0,0,0.6), 0 0 20px rgba(234,179,8,0.3), inset -3px 0 8px rgba(0,0,0,0.3)"
          : "0 10px 30px rgba(0,0,0,0.4), inset -3px 0 8px rgba(0,0,0,0.3)",
      }}
    >
      <div className="absolute inset-0 opacity-10" style={{ background: "repeating-linear-gradient(90deg, transparent, transparent 8px, rgba(255,255,255,0.03) 8px, rgba(255,255,255,0.03) 9px)" }} />
      <div className="absolute left-0 top-0 bottom-0 w-3" style={{ background: "linear-gradient(90deg, rgba(0,0,0,0.3) 0%, transparent 100%)" }} />
      <div className="w-full px-3 pt-2.5 z-10">
        <div className="flex items-center gap-1 mb-1">
          <span className="text-[9px]">📦</span>
          <p className="text-yellow-400 text-[8px] uppercase tracking-wider opacity-70">Amazon</p>
        </div>
        <div className="w-full h-0.5 bg-yellow-500 opacity-30 rounded-full" />
      </div>
      <div className="flex-1 flex flex-col items-center justify-center px-3 py-1 z-10">
        <p className="text-yellow-100 text-xs text-center font-bold leading-tight line-clamp-3" style={{ textShadow: "1px 1px 2px rgba(0,0,0,0.6)" }}>
          {title}
        </p>
        {rating > 0 && (
          <div className="mt-1">
            <StarRating rating={rating} count={0} />
          </div>
        )}
      </div>
      {authorText && (
        <div className="w-full px-3 pb-2.5 z-10">
          <div className="w-full h-0.5 bg-yellow-500 opacity-30 rounded-full mb-1" />
          <p className="text-yellow-300 text-[10px] text-center opacity-80 line-clamp-2" style={{ textShadow: "1px 1px 2px rgba(0,0,0,0.6)" }}>
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
  const [amazonBooks, setAmazonBooks] = useState<AmazonBook[]>([])
  const [amazonCarouselIndex, setAmazonCarouselIndex] = useState(0)
  const [selectedAmazon, setSelectedAmazon] = useState<AmazonBook | null>(null)
  const [dictionaryResults, setDictionaryResults] = useState<DictionaryResult[]>([])
  const [imageResults, setImageResults] = useState<ImageResult[]>([])
  const [videoResults, setVideoResults] = useState<VideoResult[]>([])
  const [newsResults, setNewsResults] = useState<NewsResult[]>([])
  const [hoveredVideo, setHoveredVideo] = useState<string | null>(null)
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
    setAmazonCarouselIndex(0)
    setSelectedBook(null)
    setSelectedScholar(null)
    setSelectedAmazon(null)
    setFailedImages(new Set())
    setAiOverview("")
    const startTime = Date.now()

    try {
      const [booksRes, scholarRes, wikiRes, usersRes, webRes, amazonRes, dictRes, imageRes, videoRes, newsRes] = await Promise.allSettled([
        fetch(`/api/books?q=${encodeURIComponent(searchQuery)}`).then((r) => r.json()),
        fetch(`/api/scholar?q=${encodeURIComponent(searchQuery)}`).then((r) => r.json()),
        fetch(`/api/wiki?q=${encodeURIComponent(searchQuery)}`).then((r) => r.json()),
        fetch(`/api/search-users?q=${encodeURIComponent(searchQuery)}`).then((r) => r.json()),
        fetch(`/api/web-search?q=${encodeURIComponent(searchQuery)}`).then((r) => r.json()),
        fetch(`/api/amazon-books?q=${encodeURIComponent(searchQuery)}`).then((r) => r.json()),
        fetch(`/api/dictionary?q=${encodeURIComponent(searchQuery)}`).then((r) => r.json()),
        fetch(`/api/image-search?q=${encodeURIComponent(searchQuery)}`).then((r) => r.json()),
        fetch(`/api/video-search?q=${encodeURIComponent(searchQuery)}`).then((r) => r.json()),
        fetch(`/api/news-search?q=${encodeURIComponent(searchQuery)}`).then((r) => r.json()),
      ])

      const booksData = booksRes.status === "fulfilled" && Array.isArray(booksRes.value) ? booksRes.value : []
      const scholarData = scholarRes.status === "fulfilled" && Array.isArray(scholarRes.value) ? scholarRes.value : []
      const wikiData = wikiRes.status === "fulfilled" && Array.isArray(wikiRes.value) ? wikiRes.value : []
      const usersData = usersRes.status === "fulfilled" && Array.isArray(usersRes.value) ? usersRes.value : []
      const webData = webRes.status === "fulfilled" && Array.isArray(webRes.value) ? webRes.value : []
      const amazonData = amazonRes.status === "fulfilled" && Array.isArray(amazonRes.value) ? amazonRes.value : []
      const dictData = dictRes.status === "fulfilled" && Array.isArray(dictRes.value) ? dictRes.value : []
      const imageData = imageRes.status === "fulfilled" && Array.isArray(imageRes.value) ? imageRes.value : []
      const videoData = videoRes.status === "fulfilled" && Array.isArray(videoRes.value) ? videoRes.value : []
      const newsData = newsRes.status === "fulfilled" && Array.isArray(newsRes.value) ? newsRes.value : []

      setBooks(booksData)
      setScholarArticles(scholarData)
      setWikiArticles(wikiData)
      setCampusUsers(usersData)
      setWebResults(webData)
      setAmazonBooks(amazonData)
      setDictionaryResults(dictData)
      setImageResults(imageData)
      setVideoResults(videoData)
      setNewsResults(newsData)

      if (booksData.length > 0) setSelectedBook(booksData[0])
      if (scholarData.length > 0) setSelectedScholar(scholarData[0])
      if (amazonData.length > 0) setSelectedAmazon(amazonData[0])

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
      performSearch(query.trim())
      window.history.pushState({}, "", `/search?q=${encodeURIComponent(query.trim())}`)
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

  const totalResults = books.length + scholarArticles.length + wikiArticles.length + campusUsers.length + webResults.length + amazonBooks.length + dictionaryResults.length + imageResults.length + videoResults.length + newsResults.length

  const sidebarCategories = [
    { label: "Everything", icon: <Search className="w-4 h-4" />, tab: "all" as TabType, count: totalResults },
    { label: "Books", icon: <BookOpen className="w-4 h-4" />, tab: "books" as TabType, count: books.length },
    { label: "Amazon Books", icon: <span className="text-sm">📦</span>, tab: "amazon" as TabType, count: amazonBooks.length },
    { label: "Dictionary", icon: <span className="text-sm">📖</span>, tab: "dictionary" as TabType, count: dictionaryResults.length },
    { label: "Scholarly Articles", icon: <GraduationCap className="w-4 h-4" />, tab: "scholar" as TabType, count: scholarArticles.length },
    { label: "Web", icon: <Monitor className="w-4 h-4" />, tab: "web" as TabType, count: webResults.length },
    { label: "Images", icon: <span className="text-sm">🖼️</span>, tab: "images" as TabType, count: imageResults.length },
    { label: "Videos", icon: <Video className="w-4 h-4" />, tab: "videos" as TabType, count: videoResults.length },
    { label: "News", icon: <FileText className="w-4 h-4" />, tab: "news" as TabType, count: newsResults.length },
    { label: "Maps", icon: <span className="text-sm">🗺️</span>, tab: "maps" as TabType, count: 0 },
    { label: "Shopping", icon: <span className="text-sm">🛒</span>, tab: "shopping" as TabType, count: 0 },
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

  const scrollAmazonCarousel = (direction: "left" | "right") => {
    if (direction === "left" && amazonCarouselIndex > 0) {
      setAmazonCarouselIndex(amazonCarouselIndex - 1)
    } else if (direction === "right" && amazonCarouselIndex < amazonBooks.length - 1) {
      setAmazonCarouselIndex(amazonCarouselIndex + 1)
    }
  }

  useEffect(() => {
    if (amazonBooks.length > 0 && amazonCarouselIndex < amazonBooks.length) {
      setSelectedAmazon(amazonBooks[amazonCarouselIndex])
    }
  }, [amazonCarouselIndex, amazonBooks])

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
                  placeholder="Search mad stuff like articles, books, or classmates...."
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
            {!loading && hasSearched && totalResults > 0 && activeTab !== "all" && activeTab !== "maps" && activeTab !== "shopping" && (
              (activeTab === "web" && webResults.length === 0) ||
              (activeTab === "books" && books.length === 0) ||
              (activeTab === "amazon" && amazonBooks.length === 0) ||
              (activeTab === "dictionary" && dictionaryResults.length === 0) ||
              (activeTab === "scholar" && scholarArticles.length === 0) ||
              (activeTab === "wikipedia" && wikiArticles.length === 0) ||
              (activeTab === "users" && campusUsers.length === 0) ||
              (activeTab === "images" && imageResults.length === 0) ||
              (activeTab === "videos" && videoResults.length === 0) ||
              (activeTab === "news" && newsResults.length === 0)
            ) && (
              <div className="text-center py-20">
                <FolderSearch className="w-16 h-16 text-amber-400 mx-auto mb-4 opacity-60" />
                <p className="text-amber-200 text-lg" style={{ textShadow: "1px 1px 3px rgba(0,0,0,0.5)" }}>
                  No {activeTab === "web" ? "web results" : activeTab === "books" ? "books" : activeTab === "amazon" ? "Amazon books" : activeTab === "dictionary" ? "dictionary definitions" : activeTab === "scholar" ? "scholarly articles" : activeTab === "wikipedia" ? "encyclopedia articles" : activeTab === "images" ? "images" : activeTab === "videos" ? "videos" : activeTab === "news" ? "news articles" : "campus users"} found for &ldquo;{query}&rdquo;
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

                {/* 3D Amazon Book Carousel */}
                {(activeTab === "all" || activeTab === "amazon") && amazonBooks.length > 0 && (
                  <section>
                    <h2
                      className="text-xl font-bold text-amber-200 mb-2 flex items-center gap-2 max-w-3xl mx-auto"
                      style={{ textShadow: "1px 1px 3px rgba(0,0,0,0.5)" }}
                    >
                      <span className="text-lg">📦</span>
                      Amazon Books ({amazonBooks.length})
                    </h2>
                    <div className="relative">
                      <div className="relative flex items-center justify-center py-4 overflow-hidden" style={{ perspective: "1200px", minHeight: "240px" }}>
                        {amazonCarouselIndex > 0 && (
                          <button
                            onClick={() => scrollAmazonCarousel("left")}
                            className="absolute left-0 z-30 bg-yellow-900 bg-opacity-70 hover:bg-opacity-90 text-yellow-200 p-1.5 md:p-2 rounded-full shadow-lg transition-all"
                          >
                            <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
                          </button>
                        )}

                        <div className="flex items-center justify-center" style={{ transformStyle: "preserve-3d" }}>
                          {amazonBooks.map((book, index) => {
                            const offset = index - amazonCarouselIndex
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
                                  setAmazonCarouselIndex(index)
                                  setSelectedAmazon(book)
                                }}
                                className="absolute cursor-pointer transition-all duration-500 ease-out"
                                style={{
                                  transform: `translateX(${translateX}px) translateZ(${translateZ}px) rotateY(${rotateY}deg) scale(${scale})`,
                                  zIndex,
                                  opacity,
                                }}
                              >
                                <div className="relative group">
                                  <AmazonBookPlaceholder title={book.title} authors={book.authors} rating={book.rating} isFocused={isFocused} />
                                  {isFocused && (
                                    <div className="absolute -left-2 top-1/2 -translate-y-1/2 hidden md:block">
                                      <div className="w-0 h-0 border-t-[10px] border-t-transparent border-b-[10px] border-b-transparent border-l-[14px] border-l-yellow-400"></div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )
                          })}
                        </div>

                        {amazonCarouselIndex < amazonBooks.length - 1 && (
                          <button
                            onClick={() => scrollAmazonCarousel("right")}
                            className="absolute right-0 z-30 bg-yellow-900 bg-opacity-70 hover:bg-opacity-90 text-yellow-200 p-1.5 md:p-2 rounded-full shadow-lg transition-all"
                          >
                            <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
                          </button>
                        )}
                      </div>

                      {selectedAmazon && (
                        <div className="mt-2 max-w-3xl mx-auto">
                          <div className="bg-yellow-950 bg-opacity-60 rounded-xl p-4 border border-yellow-800">
                            <p className="text-yellow-100 text-sm leading-relaxed" style={{ textShadow: "1px 1px 2px rgba(0,0,0,0.3)" }}>
                              <span className="text-yellow-300 font-semibold">
                                &ldquo;{selectedAmazon.title}&rdquo;
                              </span>
                              {selectedAmazon.authors.length > 0 && (
                                <span> by {selectedAmazon.authors.join(", ")}</span>
                              )}
                              {selectedAmazon.publishedDate && (
                                <span> &middot; {selectedAmazon.publishedDate}</span>
                              )}
                              {selectedAmazon.pageCount > 0 && (
                                <span> &middot; {selectedAmazon.pageCount} pages</span>
                              )}
                            </p>
                            {selectedAmazon.rating > 0 && (
                              <div className="mt-1.5">
                                <StarRating rating={selectedAmazon.rating} count={selectedAmazon.ratingsCount} />
                              </div>
                            )}
                            {selectedAmazon.description && (
                              <p className="text-yellow-200 text-sm mt-2 line-clamp-3 opacity-80">
                                {selectedAmazon.description}
                              </p>
                            )}
                            {selectedAmazon.categories.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {selectedAmazon.categories.map((cat, i) => (
                                  <span key={i} className="px-2 py-0.5 bg-yellow-800 bg-opacity-50 text-yellow-300 text-[10px] rounded-full">
                                    {cat}
                                  </span>
                                ))}
                              </div>
                            )}
                            <div className="flex flex-wrap gap-2 mt-3">
                              <a
                                href={selectedAmazon.amazonUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 px-3 py-1.5 bg-yellow-600 hover:bg-yellow-500 text-yellow-950 rounded-lg text-sm font-bold transition-colors"
                              >
                                <span>📦</span>
                                View on Amazon
                              </a>
                              <button
                                onClick={() =>
                                  handleSummarize(
                                    selectedAmazon.title,
                                    selectedAmazon.description,
                                    "amazon",
                                    selectedAmazon.id
                                  )
                                }
                                className="flex items-center gap-1 px-3 py-1.5 bg-yellow-800 hover:bg-yellow-700 text-yellow-100 rounded-lg text-sm font-medium transition-colors"
                              >
                                {loadingSummaries[`amazon-${selectedAmazon.id}`] ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <Sparkles className="w-4 h-4" />
                                )}
                                AI Summary
                              </button>
                            </div>

                            {expandedSummaries[`amazon-${selectedAmazon.id}`] && (
                              <div className="mt-3 bg-yellow-900 bg-opacity-50 border border-yellow-700 rounded-lg p-4">
                                {loadingSummaries[`amazon-${selectedAmazon.id}`] ? (
                                  <div className="flex items-center gap-2 text-yellow-300">
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Generating AI summary...
                                  </div>
                                ) : (
                                  <p className="text-yellow-200 text-sm leading-relaxed">
                                    {summaries[`amazon-${selectedAmazon.id}`]}
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
                {/* Dictionary Definitions */}
                {(activeTab === "all" || activeTab === "dictionary") && dictionaryResults.length > 0 && (
                  <section className="max-w-3xl mx-auto">
                    <h2
                      className="text-xl font-bold text-amber-200 mb-4 flex items-center gap-2"
                      style={{ textShadow: "1px 1px 3px rgba(0,0,0,0.5)" }}
                    >
                      <span className="text-lg">📖</span>
                      Dictionary ({dictionaryResults.length})
                    </h2>
                    <div className="space-y-4">
                      {dictionaryResults.map((entry) => (
                        <div
                          key={entry.word}
                          className="bg-amber-950 bg-opacity-50 border border-amber-800 rounded-xl p-5 hover:bg-opacity-60 transition-all"
                        >
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 bg-violet-800 rounded-lg flex items-center justify-center flex-shrink-0">
                              <span className="text-lg">📖</span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-3 flex-wrap">
                                <h3 className="text-2xl font-bold text-amber-100" style={{ textShadow: "1px 1px 2px rgba(0,0,0,0.4)" }}>
                                  {entry.word}
                                </h3>
                                {entry.phonetic && (
                                  <span className="text-violet-300 text-sm italic">{entry.phonetic}</span>
                                )}
                                {entry.audioUrl && (
                                  <button
                                    onClick={() => {
                                      const audio = new Audio(entry.audioUrl)
                                      audio.play().catch(() => {})
                                    }}
                                    className="w-7 h-7 bg-violet-700 hover:bg-violet-600 rounded-full flex items-center justify-center transition-colors"
                                    title="Listen to pronunciation"
                                  >
                                    <span className="text-xs">🔊</span>
                                  </button>
                                )}
                              </div>

                              {entry.origin && (
                                <p className="text-amber-400 text-xs mt-1 italic opacity-70">
                                  Origin: {entry.origin}
                                </p>
                              )}

                              <div className="mt-3 space-y-3">
                                {entry.meanings.map((meaning, mi) => (
                                  <div key={mi}>
                                    <span className="inline-block px-2 py-0.5 bg-violet-800 bg-opacity-60 text-violet-200 text-xs font-semibold rounded-full mb-1.5">
                                      {meaning.partOfSpeech}
                                    </span>
                                    <ol className="space-y-1.5 ml-1">
                                      {meaning.definitions.map((def, di) => (
                                        <li key={di} className="flex gap-2">
                                          <span className="text-amber-500 text-sm font-bold mt-0.5 flex-shrink-0">{di + 1}.</span>
                                          <div>
                                            <p className="text-amber-200 text-sm leading-relaxed">{def.definition}</p>
                                            {def.example && (
                                              <p className="text-amber-400 text-xs mt-0.5 italic opacity-70">
                                                &ldquo;{def.example}&rdquo;
                                              </p>
                                            )}
                                          </div>
                                        </li>
                                      ))}
                                    </ol>
                                    {meaning.synonyms.length > 0 && (
                                      <div className="flex flex-wrap gap-1 mt-2 ml-1">
                                        <span className="text-amber-500 text-[10px] uppercase tracking-wider font-semibold">Synonyms:</span>
                                        {meaning.synonyms.map((s, si) => (
                                          <span key={si} className="px-1.5 py-0.5 bg-emerald-900 bg-opacity-40 text-emerald-300 text-[10px] rounded">
                                            {s}
                                          </span>
                                        ))}
                                      </div>
                                    )}
                                    {meaning.antonyms.length > 0 && (
                                      <div className="flex flex-wrap gap-1 mt-1 ml-1">
                                        <span className="text-amber-500 text-[10px] uppercase tracking-wider font-semibold">Antonyms:</span>
                                        {meaning.antonyms.map((a, ai) => (
                                          <span key={ai} className="px-1.5 py-0.5 bg-red-900 bg-opacity-40 text-red-300 text-[10px] rounded">
                                            {a}
                                          </span>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>

                              <div className="flex flex-wrap gap-2 mt-3">
                                <a
                                  href={entry.sourceUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-1 px-3 py-1.5 bg-violet-800 hover:bg-violet-700 text-violet-100 rounded-lg text-sm font-medium transition-colors"
                                >
                                  <ExternalLink className="w-4 h-4" />
                                  Full Entry
                                </a>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

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

                {/* Images - Wooden Picture Frame Collage */}
                {(activeTab === "all" || activeTab === "images") && imageResults.length > 0 && (
                  <section className="max-w-4xl mx-auto">
                    <h2
                      className="text-xl font-bold text-amber-200 mb-4 flex items-center gap-2"
                      style={{ textShadow: "1px 1px 3px rgba(0,0,0,0.5)" }}
                    >
                      <span>🖼️</span>
                      Images ({imageResults.length})
                    </h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5">
                      {(activeTab === "images" ? imageResults : imageResults.slice(0, 8)).map((img) => (
                        <div key={img.id} className="group relative">
                          <div
                            className="relative rounded-sm overflow-hidden"
                            style={{
                              padding: "10px",
                              background: "linear-gradient(145deg, #8B6914 0%, #A0782C 15%, #6B4F10 30%, #8B6914 50%, #A0782C 70%, #6B4F10 85%, #8B6914 100%)",
                              boxShadow: "inset 0 0 8px rgba(0,0,0,0.5), 4px 4px 12px rgba(0,0,0,0.6), -1px -1px 3px rgba(255,215,0,0.1)",
                              borderRadius: "4px",
                            }}
                          >
                            <div
                              className="absolute inset-0 pointer-events-none"
                              style={{
                                background: "repeating-linear-gradient(90deg, transparent 0%, transparent 48%, rgba(0,0,0,0.15) 49%, transparent 50%, transparent 98%, rgba(0,0,0,0.15) 99%, transparent 100%)",
                                backgroundSize: "8px 8px",
                              }}
                            />
                            <div
                              style={{
                                border: "2px solid #5A3E0A",
                                boxShadow: "inset 0 0 6px rgba(0,0,0,0.4), inset 0 0 1px rgba(255,215,0,0.2)",
                              }}
                            >
                              <img
                                src={img.thumbnail || img.image}
                                alt={img.title}
                                className="w-full aspect-square object-cover block"
                                loading="lazy"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Crect fill='%23331a00' width='200' height='200'/%3E%3Ctext fill='%23a08040' x='50%25' y='50%25' text-anchor='middle' dy='.3em' font-size='14'%3ENo Image%3C/text%3E%3C/svg%3E"
                                }}
                              />
                            </div>
                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-300 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100" style={{ margin: "10px" }}>
                              <a
                                href={img.image}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 bg-amber-800 bg-opacity-90 rounded-lg text-amber-100 hover:bg-amber-700 transition-colors"
                                title="View full size"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <ExternalLink className="w-4 h-4" />
                              </a>
                              <a
                                href={img.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 bg-amber-800 bg-opacity-90 rounded-lg text-amber-100 hover:bg-amber-700 transition-colors"
                                title="Visit source"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <Globe className="w-4 h-4" />
                              </a>
                            </div>
                          </div>
                          <p className="text-amber-300 text-xs mt-2 line-clamp-1 text-center opacity-80">{img.title}</p>
                        </div>
                      ))}
                    </div>
                    {activeTab === "all" && imageResults.length > 8 && (
                      <button
                        onClick={() => setActiveTab("images")}
                        className="mt-4 text-amber-400 hover:text-amber-300 text-sm font-medium transition-colors"
                      >
                        View all {imageResults.length} images →
                      </button>
                    )}
                  </section>
                )}

                {/* Videos - CRT TV Screen Collage */}
                {(activeTab === "all" || activeTab === "videos") && videoResults.length > 0 && (
                  <section className="max-w-4xl mx-auto">
                    <h2
                      className="text-xl font-bold text-amber-200 mb-4 flex items-center gap-2"
                      style={{ textShadow: "1px 1px 3px rgba(0,0,0,0.5)" }}
                    >
                      <Video className="w-5 h-5" />
                      Videos ({videoResults.length})
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
                      {(activeTab === "videos" ? videoResults : videoResults.slice(0, 6)).map((vid) => (
                        <div
                          key={vid.id}
                          className="group relative"
                          onMouseEnter={() => setHoveredVideo(vid.id)}
                          onMouseLeave={() => setHoveredVideo(null)}
                        >
                          <div
                            className="relative rounded-lg overflow-hidden"
                            style={{
                              padding: "16px 16px 30px 16px",
                              background: "linear-gradient(145deg, #2a2a2a 0%, #3d3d3d 20%, #1a1a1a 50%, #2d2d2d 80%, #1a1a1a 100%)",
                              boxShadow: "inset 0 0 15px rgba(0,0,0,0.6), 6px 6px 16px rgba(0,0,0,0.7), -2px -2px 4px rgba(80,80,80,0.1)",
                              borderRadius: "12px",
                            }}
                          >
                            <div
                              className="absolute top-2 left-1/2 -translate-x-1/2 flex items-center gap-1"
                            >
                              <div className="w-1.5 h-1.5 rounded-full bg-red-500" style={{ boxShadow: hoveredVideo === vid.id ? "0 0 6px rgba(255,0,0,0.8)" : "none" }} />
                              <span className="text-[8px] text-gray-500 font-mono uppercase tracking-widest">rec</span>
                            </div>
                            <div
                              className="relative overflow-hidden"
                              style={{
                                borderRadius: "8px",
                                border: "3px solid #111",
                                boxShadow: "inset 0 0 20px rgba(0,0,0,0.8), 0 0 2px rgba(100,100,100,0.3)",
                              }}
                            >
                              <a href={vid.url} target="_blank" rel="noopener noreferrer" className="block relative">
                                <img
                                  src={vid.thumbnail}
                                  alt={vid.title}
                                  className="w-full aspect-video object-cover block transition-all duration-300"
                                  style={{
                                    filter: hoveredVideo === vid.id
                                      ? "saturate(0.7) contrast(1.15) brightness(1.1) sepia(0.25)"
                                      : "saturate(0.85) contrast(1.05)",
                                  }}
                                  loading="lazy"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='320' height='180'%3E%3Crect fill='%23111' width='320' height='180'/%3E%3Ctext fill='%23555' x='50%25' y='50%25' text-anchor='middle' dy='.3em' font-size='14'%3ENo Preview%3C/text%3E%3C/svg%3E"
                                  }}
                                />
                                {hoveredVideo === vid.id && (
                                  <div
                                    className="absolute inset-0 pointer-events-none"
                                    style={{
                                      background: "repeating-linear-gradient(0deg, transparent 0px, transparent 2px, rgba(0,0,0,0.08) 2px, rgba(0,0,0,0.08) 4px)",
                                      mixBlendMode: "multiply",
                                    }}
                                  />
                                )}
                                {hoveredVideo === vid.id && (
                                  <div className="absolute bottom-2 right-2 text-[10px] font-mono text-green-400 bg-black bg-opacity-70 px-1.5 py-0.5 rounded" style={{ textShadow: "0 0 4px rgba(0,255,0,0.5)" }}>
                                    {new Date().toLocaleTimeString()} REC
                                  </div>
                                )}
                                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all">
                                  <div className="w-12 h-12 rounded-full bg-white bg-opacity-0 group-hover:bg-opacity-90 flex items-center justify-center transition-all transform scale-75 group-hover:scale-100">
                                    <div className="w-0 h-0 border-l-[16px] border-l-gray-800 border-t-[10px] border-t-transparent border-b-[10px] border-b-transparent ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                                  </div>
                                </div>
                              </a>
                              {vid.duration && (
                                <div className="absolute bottom-2 left-2 bg-black bg-opacity-80 text-white text-xs px-1.5 py-0.5 rounded font-mono">
                                  {vid.duration}
                                </div>
                              )}
                            </div>
                            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-3">
                              <div className="w-3 h-3 rounded-full border border-gray-600" style={{ background: "radial-gradient(circle at 30% 30%, #555, #222)" }} />
                              <div className="w-6 h-1.5 rounded-full bg-gray-700" />
                              <div className="w-3 h-3 rounded-full border border-gray-600" style={{ background: "radial-gradient(circle at 30% 30%, #555, #222)" }} />
                            </div>
                          </div>
                          <div className="mt-2 px-1">
                            <a href={vid.url} target="_blank" rel="noopener noreferrer" className="text-amber-200 text-sm font-medium line-clamp-2 hover:text-amber-100 transition-colors" style={{ textShadow: "1px 1px 2px rgba(0,0,0,0.4)" }}>
                              {vid.title}
                            </a>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-amber-500 text-xs">{vid.publisher}</span>
                              {vid.viewCount > 0 && (
                                <span className="text-amber-600 text-xs">{vid.viewCount.toLocaleString()} views</span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    {activeTab === "all" && videoResults.length > 6 && (
                      <button
                        onClick={() => setActiveTab("videos")}
                        className="mt-4 text-amber-400 hover:text-amber-300 text-sm font-medium transition-colors"
                      >
                        View all {videoResults.length} videos →
                      </button>
                    )}
                  </section>
                )}

                {/* News */}
                {(activeTab === "all" || activeTab === "news") && newsResults.length > 0 && (
                  <section className="max-w-3xl mx-auto">
                    <h2
                      className="text-xl font-bold text-amber-200 mb-4 flex items-center gap-2"
                      style={{ textShadow: "1px 1px 3px rgba(0,0,0,0.5)" }}
                    >
                      <FileText className="w-5 h-5" />
                      News ({newsResults.length})
                    </h2>
                    <div className="space-y-3">
                      {(activeTab === "news" ? newsResults : newsResults.slice(0, 5)).map((article) => (
                        <a
                          key={article.id}
                          href={article.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block bg-amber-950 bg-opacity-50 border border-amber-800 rounded-xl p-4 hover:bg-opacity-60 hover:border-amber-600 transition-all group"
                        >
                          <div className="flex gap-4">
                            {article.image && (
                              <img
                                src={article.image}
                                alt={article.title}
                                className="w-24 h-20 sm:w-32 sm:h-24 object-cover rounded-lg flex-shrink-0"
                                loading="lazy"
                                onError={(e) => { (e.target as HTMLImageElement).style.display = "none" }}
                              />
                            )}
                            <div className="flex-1 min-w-0">
                              <h3 className="font-bold text-amber-200 group-hover:text-amber-100 line-clamp-2 transition-colors" style={{ textShadow: "1px 1px 2px rgba(0,0,0,0.4)" }}>
                                {article.title}
                              </h3>
                              <p className="text-amber-400 text-sm mt-1 line-clamp-2">{article.snippet}</p>
                              <div className="flex items-center gap-2 mt-2">
                                <span className="text-amber-500 text-xs font-medium">{article.source}</span>
                                {article.date && (
                                  <span className="text-amber-600 text-xs">
                                    {new Date(article.date).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </a>
                      ))}
                    </div>
                    {activeTab === "all" && newsResults.length > 5 && (
                      <button
                        onClick={() => setActiveTab("news")}
                        className="mt-4 text-amber-400 hover:text-amber-300 text-sm font-medium transition-colors"
                      >
                        View all {newsResults.length} news articles →
                      </button>
                    )}
                  </section>
                )}

                {/* Maps */}
                {activeTab === "maps" && hasSearched && query && (
                  <section className="max-w-3xl mx-auto">
                    <h2
                      className="text-xl font-bold text-amber-200 mb-4 flex items-center gap-2"
                      style={{ textShadow: "1px 1px 3px rgba(0,0,0,0.5)" }}
                    >
                      <span>🗺️</span>
                      Maps
                    </h2>
                    <div className="bg-amber-950 bg-opacity-50 border border-amber-800 rounded-xl overflow-hidden">
                      <iframe
                        src={`https://www.openstreetmap.org/export/embed.html?bbox=-180,-85,180,85&layer=mapnik&marker=&query=${encodeURIComponent(query)}`}
                        className="w-full h-[500px] border-0"
                        title="Map results"
                        loading="lazy"
                      />
                      <div className="p-4 border-t border-amber-800">
                        <a
                          href={`https://duckduckgo.com/?q=${encodeURIComponent(query)}&ia=maps&iaxm=maps`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-amber-300 hover:text-amber-200 text-sm font-medium transition-colors"
                        >
                          <ExternalLink className="w-4 h-4" />
                          Open full map on DuckDuckGo Maps
                        </a>
                      </div>
                    </div>
                  </section>
                )}

                {/* Shopping */}
                {activeTab === "shopping" && hasSearched && query && (
                  <section className="max-w-3xl mx-auto">
                    <h2
                      className="text-xl font-bold text-amber-200 mb-4 flex items-center gap-2"
                      style={{ textShadow: "1px 1px 3px rgba(0,0,0,0.5)" }}
                    >
                      <span>🛒</span>
                      Shopping
                    </h2>
                    <div className="bg-amber-950 bg-opacity-50 border border-amber-800 rounded-xl p-6 text-center">
                      <div className="text-4xl mb-4">🛒</div>
                      <p className="text-amber-200 text-lg mb-2" style={{ textShadow: "1px 1px 3px rgba(0,0,0,0.5)" }}>
                        Shop for &ldquo;{query}&rdquo;
                      </p>
                      <p className="text-amber-400 text-sm mb-4">
                        Browse shopping results on DuckDuckGo
                      </p>
                      <a
                        href={`https://duckduckgo.com/?q=${encodeURIComponent(query)}&ia=shopping&iax=shopping`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-amber-700 hover:bg-amber-600 text-amber-100 rounded-xl text-sm font-medium transition-colors shadow-lg"
                      >
                        <ExternalLink className="w-4 h-4" />
                        Open DuckDuckGo Shopping
                      </a>
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
                        <a
                          key={user.id}
                          href={`/${user.username.replace(/^\+/, "").toLowerCase()}`}
                          className="block bg-amber-950 bg-opacity-50 border border-amber-800 rounded-xl p-4 hover:bg-opacity-60 transition-all"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-amber-700 rounded-full flex items-center justify-center text-amber-100 text-lg font-bold flex-shrink-0 shadow-lg">
                              {(user.firstName?.[0] || user.username?.[0] || "?").toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-bold text-amber-200" style={{ textShadow: "1px 1px 2px rgba(0,0,0,0.4)" }}>
                                {user.firstName} {user.lastName}
                              </h3>
                              <p className="text-amber-400 text-sm">+{user.username.replace(/^\+/, "")}</p>
                              {user.college && (
                                <p className="text-amber-500 text-xs">{user.college}</p>
                              )}
                            </div>
                            <span className="flex items-center gap-1 px-3 py-1.5 bg-amber-700 hover:bg-amber-600 text-amber-100 rounded-lg text-sm font-medium transition-colors">
                              View Profile
                            </span>
                          </div>
                        </a>
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
