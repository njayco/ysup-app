"use client"

import { Document, Page, pdfjs } from "react-pdf"
import "react-pdf/dist/Page/AnnotationLayer.css"
import "react-pdf/dist/Page/TextLayer.css"

pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs"

interface PdfThumbnailProps {
  fileData: string
}

export default function PdfThumbnail({ fileData }: PdfThumbnailProps) {
  return (
    <Document
      file={fileData}
      loading={<div className="w-full h-full bg-gray-100 animate-pulse" />}
      error={<div className="w-full h-full bg-gray-200 flex items-center justify-center text-xs text-gray-500">PDF</div>}
    >
      <Page
        pageNumber={1}
        width={200}
        renderTextLayer={false}
        renderAnnotationLayer={false}
      />
    </Document>
  )
}
