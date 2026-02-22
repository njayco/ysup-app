"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import Header from "@/components/Header"
import Link from "next/link"
import { Eye, EyeOff } from "lucide-react"
import { sendResetCode, verifyCode, resetPassword } from "../actions/sms"

type Step = "phone" | "code" | "password"

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>("phone")
  const [phone, setPhone] = useState("")
  const [code, setCode] = useState(["", "", "", "", "", ""])
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [maskedPhone, setMaskedPhone] = useState("")
  const [cooldown, setCooldown] = useState(0)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [cooldown])

  const formatPhoneNumber = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 10)
    if (digits.length === 0) return ""
    if (digits.length <= 3) return `(${digits}`
    if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`
  }

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault()
    const digits = phone.replace(/\D/g, "")
    if (digits.length !== 10) {
      setError("Please enter a valid 10-digit phone number")
      return
    }

    setIsLoading(true)
    setError("")

    const result = await sendResetCode(digits)

    if (result.success) {
      setMaskedPhone(result.maskedPhone || `(•••) •••-${digits.slice(-4)}`)
      setStep("code")
      setCooldown(60)
      setSuccess("Verification code sent!")
      setTimeout(() => setSuccess(""), 3000)
    } else {
      setError(result.error || "Failed to send code")
    }
    setIsLoading(false)
  }

  const handleCodeChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return
    const newCode = [...code]
    newCode[index] = value.slice(-1)
    setCode(newCode)
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6)
    if (pasted.length > 0) {
      const newCode = [...code]
      for (let i = 0; i < 6; i++) {
        newCode[i] = pasted[i] || ""
      }
      setCode(newCode)
      const focusIndex = Math.min(pasted.length, 5)
      inputRefs.current[focusIndex]?.focus()
    }
  }

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault()
    const fullCode = code.join("")
    if (fullCode.length !== 6) {
      setError("Please enter the full 6-digit code")
      return
    }

    setIsLoading(true)
    setError("")

    const digits = phone.replace(/\D/g, "")
    const result = await verifyCode(digits, fullCode, "reset_password")

    if (result.success) {
      setStep("password")
      setSuccess("Code verified! Set your new password.")
      setTimeout(() => setSuccess(""), 3000)
    } else {
      setError(result.error || "Invalid code")
      setCode(["", "", "", "", "", ""])
      inputRefs.current[0]?.focus()
    }
    setIsLoading(false)
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters")
      return
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    setIsLoading(true)
    setError("")

    const digits = phone.replace(/\D/g, "")
    const result = await resetPassword(digits, newPassword)

    if (result.success && result.user) {
      localStorage.setItem("currentUser", JSON.stringify(result.user))
      setSuccess("Password reset! Redirecting to dashboard...")
      setTimeout(() => {
        window.location.href = "/dashboard"
      }, 1500)
    } else {
      setError(result.error || "Failed to reset password")
    }
    setIsLoading(false)
  }

  const handleResend = async () => {
    if (cooldown > 0) return
    setIsLoading(true)
    setError("")

    const digits = phone.replace(/\D/g, "")
    const result = await sendResetCode(digits)

    if (result.success) {
      setSuccess("New code sent!")
      setCooldown(60)
      setTimeout(() => setSuccess(""), 3000)
    } else {
      setError(result.error || "Failed to resend code")
    }
    setIsLoading(false)
  }

  return (
    <div className="min-h-screen wood-background">
      <Header currentPage="Reset Password" />

      <div className="flex items-center justify-center min-h-[calc(100vh-80px)] px-4 py-6">
        <div className="w-full max-w-md">
          <div className="bg-amber-950/80 border border-amber-700/50 rounded-2xl p-8 shadow-2xl backdrop-blur">
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold text-amber-100 mb-2">Reset Password</h1>
              <div className="flex justify-center gap-2 mb-4">
                {["phone", "code", "password"].map((s, i) => (
                  <div
                    key={s}
                    className={`h-1.5 rounded-full transition-all ${
                      i <= ["phone", "code", "password"].indexOf(step)
                        ? "bg-amber-500 w-12"
                        : "bg-amber-800 w-8"
                    }`}
                  />
                ))}
              </div>
              <p className="text-amber-300/70 text-sm">
                {step === "phone" && "Enter your phone number to receive a verification code"}
                {step === "code" && (
                  <>We sent a code to <span className="text-amber-200 font-medium">{maskedPhone}</span></>
                )}
                {step === "password" && "Create your new password"}
              </p>
            </div>

            {step === "phone" && (
              <form onSubmit={handleSendCode} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-amber-200 mb-2">Phone Number</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(formatPhoneNumber(e.target.value))}
                    className="w-full px-4 py-3 rounded-lg bg-amber-900/60 border border-amber-700/50 text-amber-100 placeholder-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    placeholder="(555) 123-4567"
                    required
                    aria-label="Phone number"
                  />
                </div>

                {error && (
                  <div className="bg-red-900/40 border border-red-700/50 text-red-300 px-4 py-3 rounded-lg text-sm">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-amber-600 hover:bg-amber-500 disabled:bg-amber-800 disabled:text-amber-500 text-white py-3 rounded-lg font-bold transition-colors"
                >
                  {isLoading ? "Sending..." : "Send Code"}
                </button>

                <div className="text-center">
                  <Link href="/login" className="text-amber-400 hover:text-amber-300 text-sm">
                    Back to Login
                  </Link>
                </div>
              </form>
            )}

            {step === "code" && (
              <form onSubmit={handleVerifyCode} className="space-y-5">
                <div className="flex justify-center gap-2" onPaste={handlePaste}>
                  {code.map((digit, index) => (
                    <input
                      key={index}
                      ref={(el) => { inputRefs.current[index] = el }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleCodeChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      className="w-12 h-14 text-center text-2xl font-bold rounded-lg bg-amber-900/60 border border-amber-700/50 text-amber-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                      aria-label={`Digit ${index + 1}`}
                    />
                  ))}
                </div>

                {error && (
                  <div className="bg-red-900/40 border border-red-700/50 text-red-300 px-4 py-3 rounded-lg text-sm text-center">
                    {error}
                  </div>
                )}

                {success && (
                  <div className="bg-green-900/40 border border-green-700/50 text-green-300 px-4 py-3 rounded-lg text-sm text-center">
                    {success}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading || code.join("").length !== 6}
                  className="w-full bg-amber-600 hover:bg-amber-500 disabled:bg-amber-800 disabled:text-amber-500 text-white py-3 rounded-lg font-bold transition-colors"
                >
                  {isLoading ? "Verifying..." : "Verify Code"}
                </button>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={isLoading || cooldown > 0}
                    className="text-amber-300 hover:text-amber-200 disabled:text-amber-600 text-sm font-medium"
                  >
                    {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend Code"}
                  </button>
                </div>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => { setStep("phone"); setError(""); setCode(["", "", "", "", "", ""]); }}
                    className="text-amber-400/60 hover:text-amber-300 text-sm"
                  >
                    Use a different number
                  </button>
                </div>
              </form>
            )}

            {step === "password" && (
              <form onSubmit={handleResetPassword} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-amber-200 mb-2">New Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full px-4 py-3 pr-12 rounded-lg bg-amber-900/60 border border-amber-700/50 text-amber-100 placeholder-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
                      placeholder="New password (min 6 chars)"
                      minLength={6}
                      required
                      aria-label="New password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-amber-500 hover:text-amber-300"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-amber-200 mb-2">Confirm Password</label>
                  <div className="relative">
                    <input
                      type={showConfirm ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className={`w-full px-4 py-3 pr-12 rounded-lg bg-amber-900/60 border text-amber-100 placeholder-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                        confirmPassword && confirmPassword !== newPassword
                          ? "border-red-500"
                          : "border-amber-700/50"
                      }`}
                      placeholder="Confirm new password"
                      minLength={6}
                      required
                      aria-label="Confirm new password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-amber-500 hover:text-amber-300"
                    >
                      {showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {confirmPassword && confirmPassword !== newPassword && (
                    <p className="text-red-400 text-xs mt-1">Passwords do not match</p>
                  )}
                </div>

                {error && (
                  <div className="bg-red-900/40 border border-red-700/50 text-red-300 px-4 py-3 rounded-lg text-sm">
                    {error}
                  </div>
                )}

                {success && (
                  <div className="bg-green-900/40 border border-green-700/50 text-green-300 px-4 py-3 rounded-lg text-sm text-center">
                    {success}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-green-600 hover:bg-green-500 disabled:bg-green-800 disabled:text-green-500 text-white py-3 rounded-lg font-bold transition-colors"
                >
                  {isLoading ? "Resetting..." : "Set New Password"}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
