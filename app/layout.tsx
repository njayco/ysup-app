import type React from "react"
import "./globals.css"

export const metadata = {
  title: "YsUpCampus.com | The HBCU Network",
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
        {children}
        <a
          href="https://ysup.replit.app/about"
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-3 right-3 z-50 text-amber-200/60 hover:text-amber-100 text-xs transition-colors"
          style={{ textDecoration: "none" }}
        >
          Created by Najee &ldquo;Naww G&rdquo; Jeremiah
        </a>
      </body>
    </html>
  )
}
