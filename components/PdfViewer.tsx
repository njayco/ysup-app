"use client"

import { useEffect, useRef } from "react"

interface PdfViewerProps {
  fileData: string
  pdfCurrentSpread: number
  pdfNumPages: number
  onLoadSuccess: (numPages: number) => void
}

export default function PdfViewer({ fileData, pdfCurrentSpread, pdfNumPages, onLoadSuccess }: PdfViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (pdfNumPages === 0) onLoadSuccess(1)
  }, [])

  return (
    <div ref={containerRef} className="w-full h-full flex items-center justify-center" style={{ minHeight: "500px" }}>
      <object
        data={fileData}
        type="application/pdf"
        className="w-full h-full rounded bg-white"
        style={{ minHeight: "600px" }}
      >
        <div className="flex flex-col items-center justify-center h-full p-8 text-center bg-white rounded">
          <div className="text-6xl mb-4">📄</div>
          <p className="text-gray-700 mb-4 text-lg font-medium">PDF Preview</p>
          <p className="text-gray-500 mb-6 text-sm">Your browser cannot display this PDF inline.</p>
          <a
            href={fileData}
            download="document.pdf"
            className="bg-amber-700 hover:bg-amber-800 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Download PDF
          </a>
        </div>
      </object>
    </div>
  )
}
