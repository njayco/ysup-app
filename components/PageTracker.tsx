"use client"

import { useEffect } from "react"
import { usePathname } from "next/navigation"

const EXCLUDED_PATHS = ["/", "/login", "/onboarding", "/verify-phone", "/forgot-password", "/privacy-policy", "/terms-and-conditions"]

export default function PageTracker() {
  const pathname = usePathname()

  useEffect(() => {
    if (!pathname) return
    if (EXCLUDED_PATHS.includes(pathname)) return
    const user = localStorage.getItem("currentUser")
    if (user) {
      localStorage.setItem("ysup_last_page", pathname)
    }
  }, [pathname])

  return null
}
