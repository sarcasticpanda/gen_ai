import { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { useDocuments } from '../hooks/useDocuments'

export default function DocumentUpload() {
  const { uploading, uploadProgress, uploadDocument } = useDocuments()

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    for (const file of acceptedFiles) {
      await uploadDocument(file)
    }
  }, [uploadDocument])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt'],
    },
    maxSize: 50 * 1024 * 1024,
    disabled: uploading,
  })

  return (
    <div className="space-y-4">
      {/* Drop Zone */}
      <div
        {...getRootProps()}
        className={`w-full border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center text-center cursor-pointer group transition-colors ${
          isDragActive ? 'border-primary-container bg-primary-container/5' : 'border-primary-container/50 bg-surface-container hover:bg-surface-container-high'
        } ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <input {...getInputProps()} />
        <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
          <span className="material-symbols-outlined text-[32px]" style={{ fontVariationSettings: "'FILL' 1" }}>cloud_upload</span>
        </div>
        <h3 className="font-heading text-heading text-on-surface mb-1">
          {isDragActive ? 'Drop files here' : 'Drag & drop files here'}
        </h3>
        <p className="font-body text-body text-on-surface-variant max-w-md">
          Upload financial reports, statements, or raw data. Supported: PDF, DOCX, TXT (max 50MB)
        </p>
      </div>

      {/* Upload Progress */}
      {uploading && (
        <div className="card p-4 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-[2px] bg-primary/40" />
          <div className="flex justify-between items-center mb-2">
            <span className="font-data-tabular text-data-tabular text-on-surface">Processing document...</span>
            <span className="font-label-caps text-label-caps text-primary">{uploadProgress}</span>
          </div>
          <div className="w-full h-1.5 bg-surface-container-highest rounded-full overflow-hidden">
            <div className="h-full bg-primary rounded-full animate-pulse" style={{ width: uploadProgress === 'Done!' ? '100%' : '65%' }} />
          </div>
        </div>
      )}
    </div>
  )
}
