"use client"

import { useEffect, useRef, useState } from "react"

interface PdfThumbnailProps {
  fileData: string
}

declare global {
  interface Window {
    pdfjsLib: any
  }
}

function loadPdfjsScript(): Promise<any> {
  return new Promise((resolve, reject) => {
    if (typeof window !== "undefined" && window.pdfjsLib) {
      resolve(window.pdfjsLib)
      return
    }
    const existing = document.getElementById("pdfjs-script")
    if (existing) {
      const check = setInterval(() => {
        if (window.pdfjsLib) { clearInterval(check); resolve(window.pdfjsLib) }
      }, 50)
      return
    }
    const script = document.createElement("script")
    script.id = "pdfjs-script"
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"
    script.onload = () => {
      window.pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js"
      resolve(window.pdfjsLib)
    }
    script.onerror = reject
    document.head.appendChild(script)
  })
}

export default function PdfThumbnail({ fileData }: PdfThumbnailProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [error, setError] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    const renderThumbnail = async () => {
      try {
        const pdfjsLib = await loadPdfjsScript()
        const loadingTask = pdfjsLib.getDocument(fileData)
        const pdf = await loadingTask.promise
        if (cancelled) return

        const page = await pdf.getPage(1)
        const canvas = canvasRef.current
        if (!canvas) return

        const desiredWidth = 200
        const viewport = page.getViewport({ scale: 1 })
        const scale = desiredWidth / viewport.width
        const scaledViewport = page.getViewport({ scale })

        canvas.width = scaledViewport.width
        canvas.height = scaledViewport.height

        const ctx = canvas.getContext("2d")
        if (!ctx) return

        await page.render({ canvasContext: ctx, viewport: scaledViewport }).promise
        setLoading(false)
      } catch {
        if (!cancelled) {
          setError(true)
          setLoading(false)
        }
      }
    }

    renderThumbnail()
    return () => { cancelled = true }
  }, [fileData])

  if (error) {
    return (
      <div className="w-full h-full bg-red-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-3xl mb-1">📄</div>
          <div className="text-xs text-gray-500 font-medium">PDF</div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full h-full flex items-center justify-center bg-white overflow-hidden relative">
      {loading && <div className="absolute inset-0 bg-gray-100 animate-pulse" />}
      <canvas ref={canvasRef} className="max-w-full max-h-full object-contain" />
    </div>
  )
}
