"use client"

import { useEffect, useRef, useState, useCallback } from "react"

interface PdfViewerProps {
  fileData: string
  pdfCurrentSpread: number
  pdfNumPages: number
  onLoadSuccess: (numPages: number) => void
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

export default function PdfViewer({ fileData, pdfCurrentSpread, pdfNumPages, onLoadSuccess }: PdfViewerProps) {
  const leftCanvasRef = useRef<HTMLCanvasElement>(null)
  const rightCanvasRef = useRef<HTMLCanvasElement>(null)
  const [pdfDoc, setPdfDoc] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    const loadPdf = async () => {
      try {
        const pdfjsLib = await loadPdfjsScript()
        const loadingTask = pdfjsLib.getDocument(fileData)
        const pdf = await loadingTask.promise
        if (cancelled) return

        setPdfDoc(pdf)
        onLoadSuccess(pdf.numPages)
        setLoading(false)
      } catch (err) {
        console.error("Failed to load PDF:", err)
        setLoading(false)
      }
    }

    loadPdf()
    return () => { cancelled = true }
  }, [fileData])

  const renderPage = useCallback(async (pageNum: number, canvas: HTMLCanvasElement | null) => {
    if (!pdfDoc || !canvas || pageNum < 1 || pageNum > pdfDoc.numPages) {
      if (canvas) {
        const ctx = canvas.getContext("2d")
        if (ctx) {
          canvas.width = 0
          canvas.height = 0
        }
      }
      return
    }

    try {
      const page = await pdfDoc.getPage(pageNum)
      const isMobile = typeof window !== "undefined" && window.innerWidth < 768
      const desiredWidth = isMobile ? window.innerWidth - 60 : 380
      const viewport = page.getViewport({ scale: 1 })
      const scale = desiredWidth / viewport.width
      const scaledViewport = page.getViewport({ scale })

      canvas.width = scaledViewport.width
      canvas.height = scaledViewport.height

      const ctx = canvas.getContext("2d")
      if (!ctx) return

      ctx.clearRect(0, 0, canvas.width, canvas.height)
      await page.render({ canvasContext: ctx, viewport: scaledViewport }).promise
    } catch (err) {
      console.error(`Failed to render page ${pageNum}:`, err)
    }
  }, [pdfDoc])

  useEffect(() => {
    if (!pdfDoc) return

    const leftPage = pdfCurrentSpread * 2 + 1
    const rightPage = pdfCurrentSpread * 2 + 2

    renderPage(leftPage, leftCanvasRef.current)
    if (rightPage <= pdfDoc.numPages) {
      renderPage(rightPage, rightCanvasRef.current)
    } else if (rightCanvasRef.current) {
      rightCanvasRef.current.width = 0
      rightCanvasRef.current.height = 0
    }
  }, [pdfDoc, pdfCurrentSpread, renderPage])

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-white text-lg">Loading PDF...</div>
      </div>
    )
  }

  if (!pdfDoc) {
    return (
      <div className="flex flex-col items-center justify-center p-12">
        <div className="text-6xl mb-4">📄</div>
        <p className="text-gray-300 mb-4">Could not load this PDF.</p>
        <a
          href={fileData}
          download="document.pdf"
          className="bg-amber-700 hover:bg-amber-800 text-white px-6 py-3 rounded-lg font-medium"
        >
          Download PDF
        </a>
      </div>
    )
  }

  const leftPage = pdfCurrentSpread * 2 + 1
  const rightPage = pdfCurrentSpread * 2 + 2

  return (
    <div className="flex">
      <div className="bg-white relative" style={{ boxShadow: "inset -10px 0 20px -10px rgba(0,0,0,0.15)" }}>
        <canvas ref={leftCanvasRef} />
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-xs text-gray-400">
          {leftPage}
        </div>
      </div>
      {rightPage <= pdfDoc.numPages && (
        <div className="bg-white relative hidden md:block" style={{ boxShadow: "inset 10px 0 20px -10px rgba(0,0,0,0.1)" }}>
          <canvas ref={rightCanvasRef} />
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-xs text-gray-400">
            {rightPage}
          </div>
        </div>
      )}
    </div>
  )
}
