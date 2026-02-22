import type React from "react"
import type { Viewport } from "next"
import "./globals.css"
import PageTracker from "@/components/PageTracker"

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
}

export const metadata = {
  title: "The YsUp Campus Network by Naww G",
  description: "An innovative educational platform designed to transform the learning experience",
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <PageTracker />
        {children}
        <footer className="w-full py-4 px-4 text-center border-t border-amber-900/30 bg-amber-950/40">
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-amber-200/60">
            <a href="/privacy-policy" className="hover:text-amber-100 transition-colors">Privacy Policy</a>
            <span className="hidden sm:inline">|</span>
            <a href="/terms-and-conditions" className="hover:text-amber-100 transition-colors">Terms & Conditions</a>
            <span className="hidden sm:inline">|</span>
            <a
              href="https://ysup.replit.app/about"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-amber-100 transition-colors"
            >
              Created by Najee &ldquo;Naww G&rdquo; Jeremiah
            </a>
          </div>
        </footer>
      </body>
    </html>
  )
}
