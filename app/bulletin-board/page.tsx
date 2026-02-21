"use client"

import type React from "react"

import { useState, useRef } from "react"
import Header from "@/components/Header"
import { useAuth } from "@/lib/useAuth"
import { X, RotateCcw, Upload, CreditCard, DollarSign, Pin } from "lucide-react"

interface Flyer {
  id: string
  title: string
  frontImage: string
  backImage: string
  position: { x: number; y: number; rotation: number }
  size: "small" | "medium" | "large"
  isPremium?: boolean
}

export default function BulletinBoardPage() {
  const { isAuthenticated, isLoading } = useAuth()
  const [selectedFlyer, setSelectedFlyer] = useState<Flyer | null>(null)
  const [showingBack, setShowingBack] = useState(false)
  const [showAdForm, setShowAdForm] = useState(false)
  const [adFormData, setAdFormData] = useState({
    title: "",
    frontImage: null as File | null,
    backImage: null as File | null,
    email: "",
    phone: "",
  })
  const [showPayment, setShowPayment] = useState(false)
  const frontImageRef = useRef<HTMLInputElement>(null)
  const backImageRef = useRef<HTMLInputElement>(null)

  const [flyers] = useState<Flyer[]>([
    {
      id: "1",
      title: "Spring Concert",
      frontImage: "/placeholder.svg?height=300&width=200",
      backImage: "/placeholder.svg?height=300&width=200",
      position: { x: 10, y: 15, rotation: -5 },
      size: "medium",
    },
    {
      id: "2",
      title: "Study Group",
      frontImage: "/placeholder.svg?height=250&width=180",
      backImage: "/placeholder.svg?height=250&width=180",
      position: { x: 25, y: 40, rotation: 3 },
      size: "small",
    },
    {
      id: "3",
      title: "Job Fair",
      frontImage: "/placeholder.svg?height=350&width=250",
      backImage: "/placeholder.svg?height=350&width=250",
      position: { x: 45, y: 20, rotation: -2 },
      size: "large",
    },
    {
      id: "4",
      title: "Basketball Game",
      frontImage: "/placeholder.svg?height=280&width=200",
      backImage: "/placeholder.svg?height=280&width=200",
      position: { x: 70, y: 45, rotation: 4 },
      size: "medium",
    },
    {
      id: "5",
      title: "Tutoring Services",
      frontImage: "/placeholder.svg?height=240&width=170",
      backImage: "/placeholder.svg?height=240&width=170",
      position: { x: 15, y: 70, rotation: -3 },
      size: "small",
    },
    {
      id: "6",
      title: "Greek Life Rush",
      frontImage: "/placeholder.svg?height=320&width=220",
      backImage: "/placeholder.svg?height=320&width=220",
      position: { x: 60, y: 75, rotation: 1 },
      size: "medium",
    },
  ])

  const [premiumFlyer] = useState<Flyer>({
    id: "premium",
    title: "Howard University Homecoming 2024",
    frontImage: "/placeholder.svg?height=400&width=300",
    backImage: "/placeholder.svg?height=400&width=300",
    position: { x: 0, y: 0, rotation: 0 },
    size: "large",
    isPremium: true,
  })

  const openFlyer = (flyer: Flyer) => {
    setSelectedFlyer(flyer)
    setShowingBack(false)
  }

  const closeFlyer = () => {
    setSelectedFlyer(null)
    setShowingBack(false)
  }

  const toggleSide = () => {
    setShowingBack(!showingBack)
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, side: "front" | "back") => {
    const file = e.target.files?.[0]
    if (file && file.type.startsWith("image/")) {
      setAdFormData({
        ...adFormData,
        [side === "front" ? "frontImage" : "backImage"]: file,
      })
    } else {
      alert("Please select a valid image file (JPG, PNG, etc.)")
    }
  }

  const handleAdSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!adFormData.frontImage || !adFormData.backImage) {
      alert("Please upload both front and back images")
      return
    }
    setShowPayment(true)
  }

  const handlePayment = () => {
    alert("Payment processed successfully! Your flyer will be reviewed and posted within 24 hours.")
    setShowAdForm(false)
    setShowPayment(false)
    setAdFormData({
      title: "",
      frontImage: null,
      backImage: null,
      email: "",
      phone: "",
    })
  }

  const getFlyerSize = (size: string) => {
    switch (size) {
      case "small":
        return "w-20 h-28 md:w-32 md:h-40"
      case "medium":
        return "w-28 h-36 md:w-40 md:h-52"
      case "large":
        return "w-32 h-44 md:w-48 md:h-64"
      default:
        return "w-28 h-36 md:w-40 md:h-52"
    }
  }

  if (isLoading || !isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen wood-background">
      <Header currentPage="Bulletin Board" />

      <div className="bg-amber-700 px-3 md:px-4 py-2 md:py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
        <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-1 sm:space-y-0 sm:space-x-6">
          <h2 className="text-base md:text-xl font-bold text-amber-100">YsUp Bulletin Board</h2>
          <span className="text-xs md:text-sm text-amber-200">Community Events & Announcements</span>
        </div>

        <div className="flex items-center space-x-4">
          <button
            onClick={() => setShowAdForm(true)}
            className="bg-green-600 hover:bg-green-700 text-white px-3 md:px-4 py-1.5 md:py-2 rounded transition-colors flex items-center space-x-2 text-sm md:text-base"
          >
            <DollarSign className="w-4 h-4" />
            <span>Post Ad - $5</span>
          </button>
        </div>
      </div>

      <div className="p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 md:gap-8">
            <div className="lg:col-span-1">
              <div className="bg-yellow-400 border-4 border-yellow-600 rounded-lg p-3 md:p-4 shadow-2xl transform rotate-1">
                <div className="bg-red-600 text-white text-center py-1.5 md:py-2 rounded mb-3 md:mb-4">
                  <span className="font-bold text-sm md:text-base">PREMIUM SPONSOR</span>
                </div>
                <div
                  className="cursor-pointer transform hover:scale-105 transition-transform"
                  onClick={() => openFlyer(premiumFlyer)}
                >
                  <img
                    src={premiumFlyer.frontImage || "/placeholder.svg"}
                    alt={premiumFlyer.title}
                    className="w-full h-48 md:h-80 object-cover rounded shadow-lg"
                  />
                  <div className="mt-2 text-center">
                    <h3 className="font-bold text-gray-800 text-sm md:text-base">{premiumFlyer.title}</h3>
                    <p className="text-xs md:text-sm text-gray-600">Click to view details</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-3">
              <div
                className="relative w-full h-[400px] md:h-[800px] rounded-lg shadow-2xl overflow-hidden"
                style={{
                  background: `
                    radial-gradient(circle at 20% 20%, rgba(139, 69, 19, 0.8) 2px, transparent 2px),
                    radial-gradient(circle at 80% 20%, rgba(139, 69, 19, 0.8) 2px, transparent 2px),
                    radial-gradient(circle at 20% 80%, rgba(139, 69, 19, 0.8) 2px, transparent 2px),
                    radial-gradient(circle at 80% 80%, rgba(139, 69, 19, 0.8) 2px, transparent 2px),
                    linear-gradient(45deg, #D2691E 0%, #CD853F 25%, #DEB887 50%, #F4A460 75%, #D2691E 100%)
                  `,
                  backgroundSize: "100px 100px, 100px 100px, 100px 100px, 100px 100px, 200px 200px",
                }}
              >
                <div
                  className="absolute inset-0 opacity-30"
                  style={{
                    backgroundImage: `
                      repeating-linear-gradient(45deg, transparent, transparent 2px, rgba(0,0,0,0.1) 2px, rgba(0,0,0,0.1) 4px),
                      repeating-linear-gradient(-45deg, transparent, transparent 2px, rgba(0,0,0,0.1) 2px, rgba(0,0,0,0.1) 4px)
                    `,
                  }}
                ></div>

                <div className="absolute top-4 left-4 w-3 h-3 md:w-4 md:h-4 bg-red-500 rounded-full shadow-lg"></div>
                <div className="absolute top-4 right-4 w-3 h-3 md:w-4 md:h-4 bg-blue-500 rounded-full shadow-lg"></div>
                <div className="absolute bottom-4 left-4 w-3 h-3 md:w-4 md:h-4 bg-green-500 rounded-full shadow-lg"></div>
                <div className="absolute bottom-4 right-4 w-3 h-3 md:w-4 md:h-4 bg-yellow-500 rounded-full shadow-lg"></div>

                {flyers.map((flyer) => (
                  <div
                    key={flyer.id}
                    className={`absolute cursor-pointer transform hover:scale-105 transition-all duration-200 ${getFlyerSize(
                      flyer.size,
                    )}`}
                    style={{
                      left: `${flyer.position.x}%`,
                      top: `${flyer.position.y}%`,
                      transform: `rotate(${flyer.position.rotation}deg)`,
                    }}
                    onClick={() => openFlyer(flyer)}
                  >
                    <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 z-10">
                      <Pin className="w-4 h-4 md:w-6 md:h-6 text-red-600 drop-shadow-lg" />
                    </div>

                    <div className="bg-white rounded shadow-lg overflow-hidden border-2 border-gray-200">
                      <img
                        src={flyer.frontImage || "/placeholder.svg"}
                        alt={flyer.title}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="absolute inset-0 bg-black opacity-20 transform translate-x-1 translate-y-1 rounded -z-10"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {selectedFlyer && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-2 md:p-4">
          <div className="relative max-w-4xl max-h-full w-full">
            <button
              onClick={closeFlyer}
              className="absolute -top-2 -right-2 md:-top-4 md:-right-4 bg-red-600 hover:bg-red-700 text-white rounded-full p-1.5 md:p-2 z-10 transition-colors"
            >
              <X className="w-5 h-5 md:w-6 md:h-6" />
            </button>

            <div className="bg-white rounded-lg shadow-2xl overflow-hidden">
              <img
                src={showingBack ? selectedFlyer.backImage : selectedFlyer.frontImage}
                alt={`${selectedFlyer.title} - ${showingBack ? "Back" : "Front"}`}
                className="max-w-full max-h-[60vh] md:max-h-[80vh] object-contain mx-auto"
              />

              <div className="bg-gray-100 p-3 md:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <h3 className="text-base md:text-xl font-bold text-gray-800">{selectedFlyer.title}</h3>
                <div className="flex items-center space-x-2 md:space-x-4">
                  <span className="text-xs md:text-sm text-gray-600">Showing: {showingBack ? "Back" : "Front"}</span>
                  <button
                    onClick={toggleSide}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 md:px-4 py-1.5 md:py-2 rounded transition-colors flex items-center space-x-2 text-sm md:text-base"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Flip to {showingBack ? "Front" : "Back"}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showAdForm && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-2 md:p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-green-600 text-white p-3 md:p-4 rounded-t-lg">
              <div className="flex items-center justify-between">
                <h2 className="text-xl md:text-2xl font-bold">Post Your Ad - $5</h2>
                <button
                  onClick={() => setShowAdForm(false)}
                  className="text-white hover:text-gray-200 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <form onSubmit={handleAdSubmit} className="p-4 md:p-6 space-y-4 md:space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Ad Title</label>
                <input
                  type="text"
                  value={adFormData.title}
                  onChange={(e) => setAdFormData({ ...adFormData, title: e.target.value })}
                  className="w-full px-3 md:px-4 py-2 md:py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-sm md:text-base"
                  placeholder="Enter your ad title"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Front Image (JPG)</label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 md:p-6 text-center">
                    <Upload className="w-8 h-8 md:w-12 md:h-12 mx-auto mb-2 md:mb-4 text-gray-400" />
                    <input
                      ref={frontImageRef}
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, "front")}
                      className="hidden"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => frontImageRef.current?.click()}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-3 md:px-4 py-1.5 md:py-2 rounded transition-colors text-sm md:text-base"
                    >
                      Choose Front Image
                    </button>
                    {adFormData.frontImage && (
                      <p className="mt-2 text-xs md:text-sm text-green-600">{adFormData.frontImage.name}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Back Image (JPG)</label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 md:p-6 text-center">
                    <Upload className="w-8 h-8 md:w-12 md:h-12 mx-auto mb-2 md:mb-4 text-gray-400" />
                    <input
                      ref={backImageRef}
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, "back")}
                      className="hidden"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => backImageRef.current?.click()}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-3 md:px-4 py-1.5 md:py-2 rounded transition-colors text-sm md:text-base"
                    >
                      Choose Back Image
                    </button>
                    {adFormData.backImage && <p className="mt-2 text-xs md:text-sm text-green-600">{adFormData.backImage.name}</p>}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    value={adFormData.email}
                    onChange={(e) => setAdFormData({ ...adFormData, email: e.target.value })}
                    className="w-full px-3 md:px-4 py-2 md:py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-sm md:text-base"
                    placeholder="your@email.com"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone (Optional)</label>
                  <input
                    type="tel"
                    value={adFormData.phone}
                    onChange={(e) => setAdFormData({ ...adFormData, phone: e.target.value })}
                    className="w-full px-3 md:px-4 py-2 md:py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-sm md:text-base"
                    placeholder="(555) 123-4567"
                  />
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 md:p-4">
                <h4 className="font-medium text-yellow-800 mb-2 text-sm md:text-base">Ad Guidelines:</h4>
                <ul className="text-xs md:text-sm text-yellow-700 space-y-1">
                  <li>• Images must be appropriate for a university environment</li>
                  <li>• Ads will be reviewed before posting (24-48 hours)</li>
                  <li>• Ads remain posted for 30 days</li>
                  <li>• No refunds after payment is processed</li>
                </ul>
              </div>

              <button
                type="submit"
                className="w-full bg-green-600 hover:bg-green-700 text-white py-2.5 md:py-3 rounded-md font-medium transition-colors flex items-center justify-center space-x-2 text-sm md:text-base"
              >
                <CreditCard className="w-4 h-4 md:w-5 md:h-5" />
                <span>Proceed to Payment - $5.00</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {showPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-2 md:p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-md w-full">
            <div className="bg-blue-600 text-white p-3 md:p-4 rounded-t-lg">
              <h2 className="text-lg md:text-xl font-bold">Payment - $5.00</h2>
            </div>

            <div className="p-4 md:p-6 space-y-4">
              <div className="text-center">
                <CreditCard className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-3 md:mb-4 text-blue-600" />
                <h3 className="text-base md:text-lg font-bold text-gray-800 mb-2">Secure Payment</h3>
                <p className="text-sm md:text-base text-gray-600">Your ad: "{adFormData.title}"</p>
              </div>

              <div className="bg-gray-100 rounded-lg p-3 md:p-4">
                <div className="flex justify-between items-center text-sm md:text-base">
                  <span>Ad Posting Fee:</span>
                  <span className="font-bold">$5.00</span>
                </div>
              </div>

              <div className="flex space-x-4">
                <button
                  onClick={() => setShowPayment(false)}
                  className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-2.5 md:py-3 rounded transition-colors text-sm md:text-base"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePayment}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2.5 md:py-3 rounded transition-colors text-sm md:text-base"
                >
                  Pay Now
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
