"use client"

interface PdfViewerProps {
  fileData: string
  pdfCurrentSpread: number
  pdfNumPages: number
  onLoadSuccess: (numPages: number) => void
}

export default function PdfViewer({ fileData, pdfCurrentSpread, pdfNumPages, onLoadSuccess }: PdfViewerProps) {
  return (
    <div className="flex items-center justify-center w-full h-full">
      <iframe
        src={fileData}
        className="w-full h-full min-h-[500px] md:min-h-[700px] border-0 bg-white rounded"
        title="PDF Viewer"
        onLoad={() => {
          if (pdfNumPages === 0) onLoadSuccess(1)
        }}
      />
    </div>
  )
}
