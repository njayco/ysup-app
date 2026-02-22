"use client"

interface PdfThumbnailProps {
  fileData: string
}

export default function PdfThumbnail({ fileData }: PdfThumbnailProps) {
  return (
    <div className="w-full h-full bg-red-50 flex items-center justify-center">
      <div className="text-center">
        <div className="text-3xl mb-1">📄</div>
        <div className="text-xs text-gray-500 font-medium">PDF</div>
      </div>
    </div>
  )
}
