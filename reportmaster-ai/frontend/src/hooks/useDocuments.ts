import { useState, useCallback } from 'react'
import api from '../lib/api'
import toast from 'react-hot-toast'

export function useDocuments() {
  const [documents, setDocuments] = useState<any[]>([])
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<string>('')

  const fetchDocuments = useCallback(async () => {
    try {
      const { data } = await api.get('/documents/')
      setDocuments(data.documents || [])
      return data.documents
    } catch { return [] }
  }, [])

  const uploadDocument = useCallback(async (file: File, title?: string) => {
    if (file.size > 50 * 1024 * 1024) {
      toast.error('File too large. Maximum size is 50MB.')
      return null
    }

    const ext = file.name.split('.').pop()?.toLowerCase()
    if (!['pdf', 'docx', 'txt'].includes(ext || '')) {
      toast.error(`Unsupported file type: .${ext}. Use PDF, DOCX, or TXT.`)
      return null
    }

    setUploading(true)
    setUploadProgress('Uploading...')

    try {
      const formData = new FormData()
      formData.append('file', file)
      if (title) formData.append('title', title)

      setUploadProgress('Extracting text...')

      const { data } = await api.post('/documents/upload', formData, {
        headers: { 'Content-Type': undefined },
        timeout: 300000,
      })

      setUploadProgress('Done!')

      if (data.warning) {
        toast(data.warning, { icon: '⚠️' })
      } else {
        toast.success(`${data.chunks_created} chunks created from "${file.name}"`)
      }

      await fetchDocuments()
      return data
    } catch (err: any) {
      const msg = err.response?.data?.detail || 'Upload failed'
      toast.error(msg)
      return null
    } finally {
      setUploading(false)
      setTimeout(() => setUploadProgress(''), 2000)
    }
  }, [fetchDocuments])

  const deleteDocument = useCallback(async (docId: string) => {
    try {
      await api.delete(`/documents/${docId}`)
      toast.success('Document deleted')
      await fetchDocuments()
    } catch {
      toast.error('Failed to delete document')
    }
  }, [fetchDocuments])

  return { documents, uploading, uploadProgress, fetchDocuments, uploadDocument, deleteDocument }
}
