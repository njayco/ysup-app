"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Header from "@/components/Header"
import Link from "next/link"
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
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const formData = new FormData()
      formData.append("identifier", identifier)
      formData.append("password", password)

      const result = await loginUser(formData)

      if (result.success) {
        localStorage.setItem("currentUser", JSON.stringify(result.user))
        router.push("/dashboard")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed")
      setIsLoading(false)
    }
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

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

      if (result.success) {
        localStorage.setItem("currentUser", JSON.stringify(result.user))
        router.push("/dashboard?welcome=true")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Signup failed")
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen wood-background">
      <Header currentPage="Login" />

      <div className="flex items-center justify-center min-h-[calc(100vh-80px)] p-8">
        <div className="flex items-center space-x-12 max-w-6xl w-full">
          {/* Left Side - Login */}
          <div className="flex-1 text-amber-100">
            <div className="mb-8">
              <h1 className="text-6xl font-bold text-yellow-400 mb-4">YsUp</h1>
              <h2 className="text-3xl font-serif mb-6">The Campus Network</h2>
              <p className="text-lg mb-8 max-w-md">
                YsUp helps you connect and share information with classmates while staying productive.
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-lg font-serif mb-2">Username or Phone Number</label>
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="w-full max-w-xs px-4 py-3 rounded bg-amber-900 border border-amber-700 text-amber-100 placeholder-amber-400"
                  placeholder="+username or (555) 123-4567"
                  required
                />
              </div>

              <div>
                <label className="block text-lg font-serif mb-2">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full max-w-xs px-4 py-3 rounded bg-amber-900 border border-amber-700 text-amber-100 placeholder-amber-400"
                  placeholder="Enter password"
                  required
                />
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

              {error && <div className="bg-red-600 text-white p-3 rounded max-w-xs">{error}</div>}

              <div className="flex items-center space-x-4">
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
          <div className="flex-1 flex justify-center">
            <div className="relative">
              {/* Notebook Background with realistic spiral binding */}
              <div className="bg-yellow-200 p-8 rounded-lg shadow-2xl transform rotate-1 relative border-l-8 border-gray-400">
                {/* Spiral Holes */}
                <div className="notebook-holes"></div>

                {/* Red Margin Line */}
                <div className="absolute left-12 top-0 bottom-0 w-0.5 bg-red-500 opacity-60"></div>

                {/* Horizontal Lines */}
                <div
                  className="absolute left-12 right-4 top-0 bottom-0 opacity-20"
                  style={{
                    backgroundImage: "repeating-linear-gradient(transparent, transparent 23px, #666 23px, #666 24px)",
                    backgroundSize: "100% 24px",
                  }}
                ></div>

                <div className="ml-8 relative z-10">
                  <div className="text-right mb-4">
                    <span className="text-sm text-gray-600">it's free,</span>
                    <br />
                    <span className="text-sm text-gray-600">don't worry</span>
                    <h3 className="text-2xl font-bold text-gray-800 mt-2">SIGN UP</h3>
                    <p className="text-sm text-gray-600">Welcome to the Future</p>
                  </div>

                  <form onSubmit={handleSignup} className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">College/Univ.</label>
                      <select
                        value={signupData.college}
                        onChange={(e) => setSignupData({ ...signupData, college: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded bg-white text-gray-800 shadow-sm"
                        required
                      >
                        <option value="Howard University">Howard University</option>
                        <option value="Georgetown University">Georgetown University</option>
                        <option value="George Washington University">George Washington University</option>
                        <option value="American University">American University</option>
                        <option value="Other">Other University</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                      <input
                        type="tel"
                        value={signupData.phone}
                        onChange={(e) => setSignupData({ ...signupData, phone: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded bg-white text-gray-800 shadow-sm"
                        placeholder="(555) 123-4567"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-lg">
                          +
                        </span>
                        <input
                          type="text"
                          value={signupData.username}
                          onChange={(e) => setSignupData({ ...signupData, username: e.target.value })}
                          className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded bg-white text-gray-800 shadow-sm"
                          placeholder="username (min 4 characters)"
                          minLength={4}
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                      <input
                        type="password"
                        value={signupData.password}
                        onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded bg-white text-gray-800 shadow-sm"
                        placeholder="Create password"
                        minLength={6}
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                      <input
                        type="text"
                        value={signupData.firstName}
                        onChange={(e) => setSignupData({ ...signupData, firstName: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded bg-white text-gray-800 shadow-sm"
                        placeholder="First name"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                      <input
                        type="text"
                        value={signupData.lastName}
                        onChange={(e) => setSignupData({ ...signupData, lastName: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded bg-white text-gray-800 shadow-sm"
                        placeholder="Last name"
                        required
                      />
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
