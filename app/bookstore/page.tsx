"use client"

import { useState } from "react"
import Header from "@/components/Header"
import { useAuth } from "@/lib/useAuth"
import { Search, ShoppingCart, Star, Download, Eye, Filter, DollarSign, X } from "lucide-react"

interface PDFBook {
  id: string
  title: string
  author: string
  subject: string
  price: number
  rating: number
  reviews: number
  thumbnail: string
  description: string
  pages: number
  fileSize: string
  bestseller?: boolean
  newRelease?: boolean
}

export default function BookstorePage() {
  const { isAuthenticated, isLoading } = useAuth()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [cartItems, setCartItems] = useState<string[]>([])
  const [selectedBook, setSelectedBook] = useState<PDFBook | null>(null)
  const [showPreview, setShowPreview] = useState(false)

  const categories = [
    "All",
    "Mathematics",
    "Science",
    "Engineering",
    "Literature",
    "History",
    "Psychology",
    "Business",
    "Computer Science",
    "Medicine",
  ]

  const [pdfBooks] = useState<PDFBook[]>([
    {
      id: "1",
      title: "Calculus Early Transcendentals",
      author: "James Stewart",
      subject: "Mathematics",
      price: 79.99,
      rating: 4.8,
      reviews: 1247,
      thumbnail: "/placeholder.svg?height=300&width=200",
      description:
        "The most successful calculus book of its generation, offering clear coverage of calculus concepts with mathematical precision.",
      pages: 1368,
      fileSize: "45.2 MB",
      bestseller: true,
    },
    {
      id: "2",
      title: "Principles of Chemistry",
      author: "Peter Atkins & Loretta Jones",
      subject: "Science",
      price: 89.99,
      rating: 4.6,
      reviews: 892,
      thumbnail: "/placeholder.svg?height=300&width=200",
      description: "A comprehensive introduction to chemistry with clear explanations and practical applications.",
      pages: 1024,
      fileSize: "52.8 MB",
    },
    {
      id: "3",
      title: "Physics for Scientists and Engineers",
      author: "Raymond Serway & John Jewett",
      subject: "Science",
      price: 94.99,
      rating: 4.7,
      reviews: 1156,
      thumbnail: "/placeholder.svg?height=300&width=200",
      description: "Comprehensive physics textbook covering mechanics, thermodynamics, and modern physics.",
      pages: 1312,
      fileSize: "68.4 MB",
      bestseller: true,
    },
    {
      id: "4",
      title: "Introduction to Algorithms",
      author: "Thomas Cormen",
      subject: "Computer Science",
      price: 99.99,
      rating: 4.9,
      reviews: 2341,
      thumbnail: "/placeholder.svg?height=300&width=200",
      description: "The definitive guide to algorithms and data structures for computer science students.",
      pages: 1292,
      fileSize: "38.7 MB",
      bestseller: true,
    },
    {
      id: "5",
      title: "Organic Chemistry",
      author: "Paula Bruice",
      subject: "Science",
      price: 84.99,
      rating: 4.5,
      reviews: 743,
      thumbnail: "/placeholder.svg?height=300&width=200",
      description: "Clear explanations of organic chemistry concepts with real-world applications.",
      pages: 1248,
      fileSize: "41.3 MB",
    },
    {
      id: "6",
      title: "Microeconomics",
      author: "Robert Pindyck",
      subject: "Business",
      price: 74.99,
      rating: 4.4,
      reviews: 567,
      thumbnail: "/placeholder.svg?height=300&width=200",
      description: "Modern approach to microeconomic theory with practical examples and case studies.",
      pages: 896,
      fileSize: "28.9 MB",
      newRelease: true,
    },
    {
      id: "7",
      title: "Linear Algebra and Its Applications",
      author: "David Lay",
      subject: "Mathematics",
      price: 69.99,
      rating: 4.6,
      reviews: 934,
      thumbnail: "/placeholder.svg?height=300&width=200",
      description: "Comprehensive coverage of linear algebra with applications across multiple disciplines.",
      pages: 768,
      fileSize: "32.1 MB",
    },
    {
      id: "8",
      title: "Campbell Biology",
      author: "Jane Reece",
      subject: "Science",
      price: 109.99,
      rating: 4.8,
      reviews: 1876,
      thumbnail: "/placeholder.svg?height=300&width=200",
      description: "The world's most successful biology textbook with cutting-edge research and applications.",
      pages: 1464,
      fileSize: "78.6 MB",
      bestseller: true,
    },
  ])

  const filteredBooks = pdfBooks.filter((book) => {
    const matchesSearch =
      book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.subject.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === "All" || book.subject === selectedCategory
    return matchesSearch && matchesCategory
  })

  const addToCart = (bookId: string) => {
    if (!cartItems.includes(bookId)) {
      setCartItems([...cartItems, bookId])
    }
  }

  const removeFromCart = (bookId: string) => {
    setCartItems(cartItems.filter((id) => id !== bookId))
  }

  const getTotalPrice = () => {
    return cartItems.reduce((total, bookId) => {
      const book = pdfBooks.find((b) => b.id === bookId)
      return total + (book?.price || 0)
    }, 0)
  }

  const handlePreview = (book: PDFBook) => {
    setSelectedBook(book)
    setShowPreview(true)
  }

  const handlePurchase = (book: PDFBook) => {
    alert(`Purchase initiated for "${book.title}" - $${book.price}`)
  }

  if (isLoading || !isAuthenticated) {
    return null
  }

  return (
    <div
      className="min-h-screen"
      style={{
        background: `
        linear-gradient(to bottom, 
          #8B4513 0%, 
          #A0522D 20%, 
          #CD853F 40%, 
          #DEB887 60%, 
          #F4A460 80%, 
          #8B4513 100%
        )
      `,
      }}
    >
      <Header currentPage="HU Bookstore" />

      {/* Store Header */}
      <div className="bg-amber-700 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="text-white">
            <span className="text-lg">YsUp Digital Bookstore - PDF Textbooks</span>
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <ShoppingCart className="w-6 h-6 text-white" />
              {cartItems.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                  {cartItems.length}
                </span>
              )}
            </div>
            <span className="text-white font-medium">${getTotalPrice().toFixed(2)}</span>
          </div>
        </div>
      </div>

      <div className="relative min-h-[calc(100vh-140px)]">
        {/* Bookstore Interior Background */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `
              repeating-linear-gradient(
                90deg,
                transparent 0px,
                transparent 80px,
                rgba(139, 69, 19, 0.3) 80px,
                rgba(139, 69, 19, 0.3) 100px
              ),
              repeating-linear-gradient(
                0deg,
                transparent 0px,
                transparent 200px,
                rgba(160, 82, 45, 0.2) 200px,
                rgba(160, 82, 45, 0.2) 220px
              )
            `,
          }}
        />

        <div className="relative z-10 p-8">
          {/* Search Section */}
          <div className="max-w-4xl mx-auto mb-8">
            <div className="bg-white rounded-lg shadow-2xl p-6">
              <div className="flex items-center space-x-4 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search for textbooks, authors, subjects..."
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
                  />
                </div>
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors">
                  Search
                </button>
              </div>

              {/* Category Filter */}
              <div className="flex items-center space-x-2 overflow-x-auto pb-2">
                <Filter className="w-5 h-5 text-gray-500 flex-shrink-0" />
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors flex-shrink-0 ${
                      selectedCategory === category
                        ? "bg-blue-600 text-white"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Popular/Featured Section */}
          <div className="max-w-7xl mx-auto mb-8">
            <div className="bg-white bg-opacity-95 rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">📚 Popular Textbooks</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {filteredBooks.slice(0, 8).map((book) => (
                  <div
                    key={book.id}
                    className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
                  >
                    {/* Book Cover */}
                    <div className="relative">
                      <img
                        src={book.thumbnail || "/placeholder.svg"}
                        alt={book.title}
                        className="w-full h-64 object-cover"
                      />

                      {/* Badges */}
                      <div className="absolute top-2 left-2 space-y-1">
                        {book.bestseller && (
                          <span className="bg-red-500 text-white text-xs px-2 py-1 rounded">BESTSELLER</span>
                        )}
                        {book.newRelease && (
                          <span className="bg-green-500 text-white text-xs px-2 py-1 rounded">NEW</span>
                        )}
                      </div>

                      {/* Quick Actions */}
                      <div className="absolute top-2 right-2 space-y-1">
                        <button
                          onClick={() => handlePreview(book)}
                          className="bg-black bg-opacity-70 text-white p-2 rounded-full hover:bg-opacity-90 transition-all"
                          title="Preview"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Book Info */}
                    <div className="p-4">
                      <h3 className="font-bold text-gray-800 mb-1 line-clamp-2">{book.title}</h3>
                      <p className="text-sm text-gray-600 mb-2">by {book.author}</p>

                      {/* Rating */}
                      <div className="flex items-center space-x-1 mb-2">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < Math.floor(book.rating) ? "text-yellow-400 fill-current" : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-sm text-gray-600">({book.reviews})</span>
                      </div>

                      {/* File Info */}
                      <div className="text-xs text-gray-500 mb-3">
                        <div>
                          {book.pages} pages • {book.fileSize}
                        </div>
                        <div>Subject: {book.subject}</div>
                      </div>

                      {/* Price and Actions */}
                      <div className="flex items-center justify-between">
                        <div className="text-xl font-bold text-green-600">${book.price}</div>

                        <div className="flex space-x-2">
                          {cartItems.includes(book.id) ? (
                            <button
                              onClick={() => removeFromCart(book.id)}
                              className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm transition-colors"
                            >
                              Remove
                            </button>
                          ) : (
                            <button
                              onClick={() => addToCart(book.id)}
                              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm transition-colors"
                            >
                              Add to Cart
                            </button>
                          )}

                          <button
                            onClick={() => handlePurchase(book)}
                            className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm transition-colors"
                          >
                            Buy Now
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Shopping Cart Summary */}
          {cartItems.length > 0 && (
            <div className="max-w-7xl mx-auto">
              <div className="bg-white bg-opacity-95 rounded-lg shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4">🛒 Shopping Cart ({cartItems.length} items)</h3>

                <div className="space-y-3 mb-4">
                  {cartItems.map((bookId) => {
                    const book = pdfBooks.find((b) => b.id === bookId)
                    if (!book) return null

                    return (
                      <div key={bookId} className="flex items-center justify-between bg-gray-50 p-3 rounded">
                        <div className="flex items-center space-x-3">
                          <img
                            src={book.thumbnail || "/placeholder.svg"}
                            alt={book.title}
                            className="w-12 h-16 object-cover rounded"
                          />
                          <div>
                            <div className="font-medium">{book.title}</div>
                            <div className="text-sm text-gray-600">by {book.author}</div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <span className="font-bold text-green-600">${book.price}</span>
                          <button onClick={() => removeFromCart(bookId)} className="text-red-600 hover:text-red-800">
                            Remove
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>

                <div className="border-t pt-4 flex items-center justify-between">
                  <div className="text-xl font-bold">Total: ${getTotalPrice().toFixed(2)}</div>
                  <button className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center space-x-2">
                    <DollarSign className="w-5 h-5" />
                    <span>Proceed to Checkout</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Bookstore Shelves Background Elements */}
        <div className="absolute left-0 top-20 bottom-0 w-16 bg-gradient-to-r from-amber-800 to-amber-700 opacity-60"></div>
        <div className="absolute right-0 top-20 bottom-0 w-16 bg-gradient-to-l from-amber-800 to-amber-700 opacity-60"></div>

        {/* Floor */}
        <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-red-900 to-red-700 opacity-40"></div>
      </div>

      {/* Preview Modal */}
      {showPreview && selectedBook && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-blue-600 text-white p-4 rounded-t-lg">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">Preview: {selectedBook.title}</h2>
                <button onClick={() => setShowPreview(false)} className="text-white hover:text-gray-200">
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <img
                    src={selectedBook.thumbnail || "/placeholder.svg"}
                    alt={selectedBook.title}
                    className="w-full max-w-sm mx-auto rounded shadow-lg"
                  />
                </div>

                <div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">{selectedBook.title}</h3>
                  <p className="text-lg text-gray-600 mb-4">by {selectedBook.author}</p>

                  <div className="space-y-3 mb-6">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">Subject:</span>
                      <span>{selectedBook.subject}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">Pages:</span>
                      <span>{selectedBook.pages}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">File Size:</span>
                      <span>{selectedBook.fileSize}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">Rating:</span>
                      <div className="flex items-center space-x-1">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < Math.floor(selectedBook.rating) ? "text-yellow-400 fill-current" : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                        <span>({selectedBook.reviews} reviews)</span>
                      </div>
                    </div>
                  </div>

                  <p className="text-gray-700 mb-6">{selectedBook.description}</p>

                  <div className="flex items-center justify-between">
                    <div className="text-3xl font-bold text-green-600">${selectedBook.price}</div>

                    <div className="flex space-x-3">
                      <button
                        onClick={() => addToCart(selectedBook.id)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                      >
                        Add to Cart
                      </button>
                      <button
                        onClick={() => handlePurchase(selectedBook)}
                        className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center space-x-2"
                      >
                        <Download className="w-5 h-5" />
                        <span>Buy & Download</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
