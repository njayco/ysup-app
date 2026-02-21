"use client"

import { Document, Page, pdfjs } from "react-pdf"
import "react-pdf/dist/Page/AnnotationLayer.css"
import "react-pdf/dist/Page/TextLayer.css"

pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs"

interface PdfViewerProps {
  fileData: string
  pdfCurrentSpread: number
  pdfNumPages: number
  onLoadSuccess: (numPages: number) => void
}

export default function PdfViewer({ fileData, pdfCurrentSpread, pdfNumPages, onLoadSuccess }: PdfViewerProps) {
  const leftPage = pdfCurrentSpread * 2 + 1
  const rightPage = pdfCurrentSpread * 2 + 2

  return (
    <Document
      file={fileData}
      onLoadSuccess={({ numPages }) => onLoadSuccess(numPages)}
      loading={<div className="text-white p-12">Loading PDF...</div>}
      error={<div className="text-red-400 p-12">Failed to load PDF. The file may be corrupted.</div>}
      className="flex"
    >
      <div className="bg-white border-r border-gray-200 relative" style={{ boxShadow: "inset -10px 0 20px -10px rgba(0,0,0,0.15)" }}>
        <Page
          pageNumber={leftPage}
          width={typeof window !== "undefined" && window.innerWidth < 768 ? window.innerWidth - 60 : 380}
          renderTextLayer={true}
          renderAnnotationLayer={true}
        />
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-xs text-gray-400">
          {leftPage}
        </div>
      </div>
      {rightPage <= pdfNumPages && (
        <div className="bg-white relative hidden md:block" style={{ boxShadow: "inset 10px 0 20px -10px rgba(0,0,0,0.1)" }}>
          <Page
            pageNumber={rightPage}
            width={380}
            renderTextLayer={true}
            renderAnnotationLayer={true}
          />
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-xs text-gray-400">
            {rightPage}
          </div>
        </div>
      )}
    </Document>
  )
}
