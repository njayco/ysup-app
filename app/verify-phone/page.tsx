"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import Header from "@/components/Header"
import { sendVerificationCode, verifyCode } from "../actions/sms"

export default function VerifyPhonePage() {
  const router = useRouter()
  const [code, setCode] = useState(["", "", "", "", "", ""])
  const [isLoading, setIsLoading] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [maskedPhone, setMaskedPhone] = useState("")
  const [phone, setPhone] = useState("")
  const [userId, setUserId] = useState<number | null>(null)
  const [cooldown, setCooldown] = useState(0)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    const stored = localStorage.getItem("pendingPhoneVerification")
    if (stored) {
      const data = JSON.parse(stored)
      setPhone(data.phone)
      setUserId(data.userId)
      setMaskedPhone(data.maskedPhone || `(•••) •••-${data.phone.slice(-4)}`)
    } else {
      router.push("/login")
    }
  }, [router])

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [cooldown])

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

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    const fullCode = code.join("")
    if (fullCode.length !== 6) {
      setError("Please enter the full 6-digit code")
      return
    }

    setIsLoading(true)
    setError("")

    const result = await verifyCode(phone, fullCode, "signup")

    if (result.success) {
      setSuccess("Phone verified! Redirecting...")
      localStorage.removeItem("pendingPhoneVerification")
      setTimeout(() => {
        router.push("/onboarding")
      }, 1000)
    } else {
      setError(result.error || "Verification failed")
      setCode(["", "", "", "", "", ""])
      inputRefs.current[0]?.focus()
    }
    setIsLoading(false)
  }

  const handleResend = async () => {
    if (cooldown > 0) return
    setIsResending(true)
    setError("")

    const result = await sendVerificationCode(phone, "signup", userId || undefined)

    if (result.success) {
      setSuccess("New code sent!")
      setCooldown(60)
      setTimeout(() => setSuccess(""), 3000)
    } else {
      setError(result.error || "Failed to resend code")
    }
    setIsResending(false)
  }

  return (
    <div className="min-h-screen wood-background">
      <Header currentPage="Verify Phone" />

      <div className="flex items-center justify-center min-h-[calc(100vh-80px)] px-4 py-6">
        <div className="w-full max-w-md">
          <div className="bg-amber-950/80 border border-amber-700/50 rounded-2xl p-8 shadow-2xl backdrop-blur">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-amber-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-amber-100 mb-2">Verify Your Phone</h1>
              <p className="text-amber-300/70 text-sm">
                We sent a 6-digit code to <span className="text-amber-200 font-medium">{maskedPhone}</span>
              </p>
            </div>

            <form onSubmit={handleVerify} className="space-y-6">
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
                    className="w-12 h-14 text-center text-2xl font-bold rounded-lg bg-amber-900/60 border border-amber-700/50 text-amber-100 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
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
                {isLoading ? "Verifying..." : "Verify Phone"}
              </button>

              <div className="text-center">
                <p className="text-amber-400/60 text-sm mb-2">Didn't receive the code?</p>
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={isResending || cooldown > 0}
                  className="text-amber-300 hover:text-amber-200 disabled:text-amber-600 text-sm font-medium transition-colors"
                >
                  {isResending
                    ? "Sending..."
                    : cooldown > 0
                      ? `Resend code in ${cooldown}s`
                      : "Resend Code"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
