"use client"

import { useState, useEffect } from "react"
import Link from "next/link"

export default function UniversityBanner() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("currentUser")
      if (storedUser) {
        const user = JSON.parse(storedUser)
        if (user.college === "Howard University") {
          setShow(true)
        }
      }
    } catch {}
  }, [])

  if (!show) return null

  return (
    <Link
      href="/bison-homepage"
      className="fixed bottom-4 left-4 z-[9999] block hover:scale-105 transition-transform duration-200 shadow-2xl rounded-md overflow-hidden"
      style={{
        width: "220px",
      }}
    >
      <img
        src="/howard-banner.jpeg"
        alt="Howard University"
        className="w-full h-auto block"
        draggable={false}
      />
    </Link>
  )
}
