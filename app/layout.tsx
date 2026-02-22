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
      <body>{children}</body>
    </html>
  )
}
