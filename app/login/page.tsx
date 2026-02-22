"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Header from "@/components/Header"
import Link from "next/link"
import { Eye, EyeOff } from "lucide-react"
import { signupUser, loginUser } from "../actions/auth"

export default function LoginPage() {
  const router = useRouter()
  const [identifier, setIdentifier] = useState("")
  const [password, setPassword] = useState("")
  const [rememberMe, setRememberMe] = useState(false)
  const [signupData, setSignupData] = useState({
    college: "Howard University",
    phone: "",
    username: "",
    password: "",
    firstName: "",
    lastName: "",
    agreeTerms: false,
  })
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showLoginPassword, setShowLoginPassword] = useState(false)
  const [showSignupPassword, setShowSignupPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const formatPhoneNumber = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 10)
    if (digits.length === 0) return ""
    if (digits.length <= 3) return `(${digits}`
    if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value)
    setSignupData({ ...signupData, phone: formatted })
  }

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^a-zA-Z0-9_.]/g, "")
    setSignupData({ ...signupData, username: value })
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const formData = new FormData()
      formData.append("identifier", identifier)
      formData.append("password", password)

      const result = await loginUser(formData)

      if (result.success && result.user) {
        localStorage.setItem("currentUser", JSON.stringify(result.user))
        const pendingJoin = localStorage.getItem("pendingNetworkJoin")
        if (pendingJoin) {
          localStorage.removeItem("pendingNetworkJoin")
          window.location.href = `/invite/network/${pendingJoin}`
          return
        }
        window.location.href = "/dashboard"
        return
      } else {
        setError(result.error || "Login failed")
      }
    } catch (err) {
      setError("Login failed. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    const phoneDigits = signupData.phone.replace(/\D/g, "")
    if (phoneDigits.length !== 10) {
      setError("Please enter a valid 10-digit phone number")
      setIsLoading(false)
      return
    }

    if (!/^[a-zA-Z0-9_.]+$/.test(signupData.username)) {
      setError("Username can only contain letters, numbers, underscores, and dots")
      setIsLoading(false)
      return
    }

    if (signupData.password !== confirmPassword) {
      setError("Passwords do not match")
      setIsLoading(false)
      return
    }

    try {
      const formData = new FormData()
      formData.append("college", signupData.college)
      formData.append("phone", signupData.phone)
      formData.append("username", signupData.username)
      formData.append("password", signupData.password)
      formData.append("firstName", signupData.firstName)
      formData.append("lastName", signupData.lastName)
      if (signupData.agreeTerms) {
        formData.append("agreeTerms", "on")
      }

      const result = await signupUser(formData)

      if (result.success && result.user) {
        localStorage.setItem("currentUser", JSON.stringify(result.user))

        if (result.requiresVerification) {
          const phoneDigits = signupData.phone.replace(/\D/g, "")
          localStorage.setItem("pendingPhoneVerification", JSON.stringify({
            phone: phoneDigits,
            userId: parseInt(result.user.id),
            maskedPhone: result.smsResult?.maskedPhone || `(•••) •••-${phoneDigits.slice(-4)}`,
          }))
          window.location.href = "/verify-phone"
        } else {
          window.location.href = "/onboarding"
        }
        return
      } else {
        setError(result.error || "Signup failed")
      }
    } catch (err) {
      setError("Signup failed. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen wood-background">
      <Header currentPage="Login" />

      <div className="flex items-center justify-center min-h-[calc(100vh-80px)] px-4 py-6 md:p-8">
        <div className="flex flex-col lg:flex-row items-center lg:items-start lg:space-x-12 max-w-6xl w-full gap-8 lg:gap-0">
          {/* Left Side - Login */}
          <div className="w-full lg:flex-1 text-amber-100 text-center lg:text-left">
            <div className="mb-6 md:mb-8">
              <h1 className="text-4xl md:text-6xl font-bold text-yellow-400 mb-2 md:mb-4">YsUp</h1>
              <h2 className="text-xl md:text-3xl font-serif mb-3 md:mb-6">The Campus Network</h2>
              <p className="text-sm md:text-lg mb-4 md:mb-8 max-w-md mx-auto lg:mx-0">
                YsUp helps you connect and share information with classmates while staying productive.
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-3 md:space-y-4 max-w-sm mx-auto lg:mx-0">
              <div>
                <label className="block text-base md:text-lg font-serif mb-1 md:mb-2">Username or Phone Number</label>
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="w-full px-4 py-3 rounded bg-amber-900 border border-amber-700 text-amber-100 placeholder-amber-400"
                  placeholder="+username or (555) 123-4567"
                  required
                />
              </div>

              <div>
                <label className="block text-base md:text-lg font-serif mb-1 md:mb-2">Password</label>
                <div className="relative">
                  <input
                    type={showLoginPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 pr-12 rounded bg-amber-900 border border-amber-700 text-amber-100 placeholder-amber-400"
                    placeholder="Enter password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-amber-400 hover:text-amber-200"
                  >
                    {showLoginPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="remember"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4"
                />
                <label htmlFor="remember" className="text-amber-100">
                  Remember me.
                </label>
              </div>

              {error && <div className="bg-red-600 text-white p-3 rounded">{error}</div>}

              <div className="flex items-center space-x-4 justify-center lg:justify-start">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white px-8 py-3 rounded font-bold transition-colors"
                >
                  {isLoading ? "Logging in..." : "Log In"}
                </button>
                <Link href="/forgot-password" className="text-amber-200 hover:text-amber-100">
                  Forgot it?
                </Link>
              </div>
            </form>
          </div>

          {/* Right Side - Signup Notepad */}
          <div className="w-full lg:flex-1 flex justify-center overflow-hidden">
            <div className="relative w-full max-w-sm md:max-w-md">
              {/* Notebook Background with realistic spiral binding */}
              <div className="bg-yellow-200 p-5 md:p-8 rounded-lg shadow-2xl transform md:rotate-1 relative border-l-8 border-gray-400">
                {/* Spiral Holes */}
                <div className="notebook-holes"></div>

                {/* Red Margin Line */}
                <div className="absolute left-10 md:left-12 top-0 bottom-0 w-0.5 bg-red-500 opacity-60"></div>

                {/* Horizontal Lines */}
                <div
                  className="absolute left-10 md:left-12 right-4 top-0 bottom-0 opacity-20"
                  style={{
                    backgroundImage: "repeating-linear-gradient(transparent, transparent 23px, #666 23px, #666 24px)",
                    backgroundSize: "100% 24px",
                  }}
                ></div>

                <div className="ml-5 md:ml-8 relative z-10">
                  <div className="text-right mb-3 md:mb-4">
                    <span className="text-xs md:text-sm text-gray-600">it's free,</span>
                    <br />
                    <span className="text-xs md:text-sm text-gray-600">don't worry</span>
                    <h3 className="text-xl md:text-2xl font-bold text-gray-800 mt-1 md:mt-2">SIGN UP</h3>
                    <p className="text-xs md:text-sm text-gray-600">Welcome to the Future</p>
                  </div>

                  <form onSubmit={handleSignup} className="space-y-2 md:space-y-3">
                    <div>
                      <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">College/Univ.</label>
                      <select
                        value={signupData.college}
                        onChange={(e) => setSignupData({ ...signupData, college: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded bg-white text-gray-800 shadow-sm"
                        required
                      >
                        <option value="Howard University">Howard University</option>
                        <option value="Alabama A&M University">Alabama A&M University</option>
                        <option value="Alabama State University">Alabama State University</option>
                        <option value="Albany State University">Albany State University</option>
                        <option value="Alcorn State University">Alcorn State University</option>
                        <option value="Allen University">Allen University</option>
                        <option value="American Baptist College">American Baptist College</option>
                        <option value="Arkansas Baptist College">Arkansas Baptist College</option>
                        <option value="Benedict College">Benedict College</option>
                        <option value="Bennett College">Bennett College</option>
                        <option value="Bethune-Cookman University">Bethune-Cookman University</option>
                        <option value="Bishop State Community College">Bishop State Community College</option>
                        <option value="Bluefield State University">Bluefield State University</option>
                        <option value="Bowie State University">Bowie State University</option>
                        <option value="Central State University">Central State University</option>
                        <option value="Cheyney University of Pennsylvania">Cheyney University of Pennsylvania</option>
                        <option value="Claflin University">Claflin University</option>
                        <option value="Clark Atlanta University">Clark Atlanta University</option>
                        <option value="Clinton College">Clinton College</option>
                        <option value="Coahoma Community College">Coahoma Community College</option>
                        <option value="Concordia College Alabama">Concordia College Alabama</option>
                        <option value="Coppin State University">Coppin State University</option>
                        <option value="Delaware State University">Delaware State University</option>
                        <option value="Denmark Technical College">Denmark Technical College</option>
                        <option value="Dillard University">Dillard University</option>
                        <option value="Edward Waters University">Edward Waters University</option>
                        <option value="Elizabeth City State University">Elizabeth City State University</option>
                        <option value="Fayetteville State University">Fayetteville State University</option>
                        <option value="Fisk University">Fisk University</option>
                        <option value="Florida A&M University">Florida A&M University</option>
                        <option value="Florida Memorial University">Florida Memorial University</option>
                        <option value="Fort Valley State University">Fort Valley State University</option>
                        <option value="Gadsden State Community College">Gadsden State Community College</option>
                        <option value="Grambling State University">Grambling State University</option>
                        <option value="H Councill Trenholm State Community College">H Councill Trenholm State Community College</option>
                        <option value="Hampton University">Hampton University</option>
                        <option value="Harris-Stowe State University">Harris-Stowe State University</option>
                        <option value="Hinds Community College - Utica">Hinds Community College - Utica</option>
                        <option value="Huston-Tillotson University">Huston-Tillotson University</option>
                        <option value="Interdenominational Theological Center">Interdenominational Theological Center</option>
                        <option value="J.F. Drake State Community and Technical College">J.F. Drake State Community and Technical College</option>
                        <option value="Jackson State University">Jackson State University</option>
                        <option value="Jarvis Christian College">Jarvis Christian College</option>
                        <option value="Johnson C. Smith University">Johnson C. Smith University</option>
                        <option value="Kentucky State University">Kentucky State University</option>
                        <option value="Knoxville College">Knoxville College</option>
                        <option value="Lane College">Lane College</option>
                        <option value="Langston University">Langston University</option>
                        <option value="Lawson State Community College">Lawson State Community College</option>
                        <option value="LeMoyne-Owen College">LeMoyne-Owen College</option>
                        <option value="Lincoln University (MO)">Lincoln University (MO)</option>
                        <option value="Lincoln University (PA)">Lincoln University (PA)</option>
                        <option value="Livingstone College">Livingstone College</option>
                        <option value="Meharry Medical College">Meharry Medical College</option>
                        <option value="Miles College">Miles College</option>
                        <option value="Mississippi Valley State University">Mississippi Valley State University</option>
                        <option value="Morehouse College">Morehouse College</option>
                        <option value="Morehouse School of Medicine">Morehouse School of Medicine</option>
                        <option value="Morgan State University">Morgan State University</option>
                        <option value="Morris Brown College">Morris Brown College</option>
                        <option value="Morris College">Morris College</option>
                        <option value="Norfolk State University">Norfolk State University</option>
                        <option value="North Carolina A&T State University">North Carolina A&T State University</option>
                        <option value="North Carolina Central University">North Carolina Central University</option>
                        <option value="Oakwood University">Oakwood University</option>
                        <option value="Paine College">Paine College</option>
                        <option value="Paul Quinn College">Paul Quinn College</option>
                        <option value="Philander Smith University">Philander Smith University</option>
                        <option value="Prairie View A&M University">Prairie View A&M University</option>
                        <option value="Rust College">Rust College</option>
                        <option value="Saint Augustine's University">Saint Augustine's University</option>
                        <option value="Savannah State University">Savannah State University</option>
                        <option value="Selma University">Selma University</option>
                        <option value="Shaw University">Shaw University</option>
                        <option value="Shorter College">Shorter College</option>
                        <option value="Simmons College of Kentucky">Simmons College of Kentucky</option>
                        <option value="South Carolina State University">South Carolina State University</option>
                        <option value="Southern University and A&M College">Southern University and A&M College</option>
                        <option value="Southern University at New Orleans">Southern University at New Orleans</option>
                        <option value="Southern University at Shreveport">Southern University at Shreveport</option>
                        <option value="Southwestern Christian College">Southwestern Christian College</option>
                        <option value="Spelman College">Spelman College</option>
                        <option value="St. Philip's College">St. Philip's College</option>
                        <option value="Stillman College">Stillman College</option>
                        <option value="Talladega College">Talladega College</option>
                        <option value="Tennessee State University">Tennessee State University</option>
                        <option value="Texas College">Texas College</option>
                        <option value="Texas Southern University">Texas Southern University</option>
                        <option value="Tougaloo College">Tougaloo College</option>
                        <option value="Tuskegee University">Tuskegee University</option>
                        <option value="University of Arkansas at Pine Bluff">University of Arkansas at Pine Bluff</option>
                        <option value="University of Maryland Eastern Shore">University of Maryland Eastern Shore</option>
                        <option value="University of the District of Columbia">University of the District of Columbia</option>
                        <option value="University of the Virgin Islands">University of the Virgin Islands</option>
                        <option value="Virginia State University">Virginia State University</option>
                        <option value="Virginia Union University">Virginia Union University</option>
                        <option value="Virginia University of Lynchburg">Virginia University of Lynchburg</option>
                        <option value="Voorhees University">Voorhees University</option>
                        <option value="West Virginia State University">West Virginia State University</option>
                        <option value="Wilberforce University">Wilberforce University</option>
                        <option value="Wiley College">Wiley College</option>
                        <option value="Winston-Salem State University">Winston-Salem State University</option>
                        <option value="Xavier University of Louisiana">Xavier University of Louisiana</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                      <input
                        type="tel"
                        value={signupData.phone}
                        onChange={handlePhoneChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded bg-white text-gray-800 shadow-sm text-sm md:text-base"
                        placeholder="(555) 123-4567"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">Username</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-lg">
                          +
                        </span>
                        <input
                          type="text"
                          value={signupData.username}
                          onChange={handleUsernameChange}
                          className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded bg-white text-gray-800 shadow-sm"
                          placeholder="letters, numbers, _ and . only"
                          minLength={4}
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">Password</label>
                      <div className="relative">
                        <input
                          type={showSignupPassword ? "text" : "password"}
                          value={signupData.password}
                          onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                          className="w-full px-3 py-2 pr-10 border border-gray-300 rounded bg-white text-gray-800 shadow-sm text-sm md:text-base"
                          placeholder="Create password"
                          minLength={6}
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowSignupPassword(!showSignupPassword)}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        >
                          {showSignupPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                      <div className="relative">
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className={`w-full px-3 py-2 pr-10 border rounded bg-white text-gray-800 shadow-sm text-sm md:text-base ${confirmPassword && confirmPassword !== signupData.password ? "border-red-500" : "border-gray-300"}`}
                          placeholder="Confirm password"
                          minLength={6}
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        >
                          {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      {confirmPassword && confirmPassword !== signupData.password && (
                        <p className="text-red-500 text-xs mt-1">Passwords do not match</p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">First Name</label>
                        <input
                          type="text"
                          value={signupData.firstName}
                          onChange={(e) => setSignupData({ ...signupData, firstName: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded bg-white text-gray-800 shadow-sm text-sm md:text-base"
                          placeholder="First name"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">Last Name</label>
                        <input
                          type="text"
                          value={signupData.lastName}
                          onChange={(e) => setSignupData({ ...signupData, lastName: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded bg-white text-gray-800 shadow-sm text-sm md:text-base"
                          placeholder="Last name"
                          required
                        />
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="terms"
                        checked={signupData.agreeTerms}
                        onChange={(e) => setSignupData({ ...signupData, agreeTerms: e.target.checked })}
                        className="w-4 h-4"
                        required
                      />
                      <label htmlFor="terms" className="text-xs text-gray-600">
                        I have read and agree with the Terms & Conditions
                      </label>
                    </div>

                    {error && (
                      <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded text-sm">
                        {error}
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white py-2 rounded font-bold transition-colors shadow-md"
                    >
                      {isLoading ? "Creating Account..." : "Sign Up"}
                    </button>

                    <p className="text-xs text-center text-gray-600 mt-4">
                      Create an Ad for an Event, Business or Cause
                    </p>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
