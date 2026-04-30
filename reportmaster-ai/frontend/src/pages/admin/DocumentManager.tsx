import { useEffect, useState } from 'react'
import Sidebar from '../../components/Sidebar'
import DocumentUpload from '../../components/DocumentUpload'
import { useDocuments } from '../../hooks/useDocuments'

export default function DocumentManager() {
  const { documents, fetchDocuments, deleteDocument } = useDocuments()
  const [search, setSearch] = useState('')
  const [showDeleteModal, setShowDeleteModal] = useState<string | null>(null)

  useEffect(() => { fetchDocuments() }, [])

  const filtered = documents.filter(d => d.file_name.toLowerCase().includes(search.toLowerCase()) || d.title.toLowerCase().includes(search.toLowerCase()))

  const formatSize = (bytes: number) => {
    if (!bytes) return '—'
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  return (
    <div className="min-h-screen bg-transparent">
      <Sidebar isAdmin />
      <div className="ml-[260px] flex flex-col min-h-screen">
        <header className="flex justify-between items-center px-6 py-3 sticky top-0 z-40 bg-background/55 backdrop-blur-md border-b border-border">
          <span className="text-lg font-bold bg-gradient-to-br from-indigo-500 to-violet-600 bg-clip-text text-transparent">ReportMaster AI</span>
        </header>
        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          <h1 className="font-display text-display text-on-surface">Document Library</h1>
          <DocumentUpload />

          {/* Search */}
          <div className="relative w-full max-w-md">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">search</span>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search documents..." className="input-field pl-10" />
          </div>

          {/* Documents Table */}
          <div className="card overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead className="bg-surface-container-highest text-on-surface-variant font-label-caps text-label-caps border-b border-border">
                <tr>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Size</th>
                  <th className="px-4 py-3">Chunks</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border font-data-tabular text-data-tabular text-on-surface bg-surface">
                {filtered.map(doc => (
                  <tr key={doc.id} className="hover:bg-surface-container-low transition-colors group">
                    <td className="px-4 py-3 flex items-center gap-2">
                      <span className="material-symbols-outlined text-error text-[18px]">description</span>
                      <span className="truncate max-w-[200px]">{doc.file_name}</span>
                    </td>
                    <td className="px-4 py-3 text-on-surface-variant">{doc.file_name.split('.').pop()?.toUpperCase()}</td>
                    <td className="px-4 py-3 text-on-surface-variant">{formatSize(doc.file_size)}</td>
                    <td className="px-4 py-3 text-on-surface-variant">{doc.chunk_count}</td>
                    <td className="px-4 py-3 text-on-surface-variant">{new Date(doc.created_at).toLocaleDateString()}</td>
                    <td className="px-4 py-3"><span className="status-chip status-active">Active</span></td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => setShowDeleteModal(doc.id)} className="text-on-surface-variant hover:text-error transition-colors p-1 opacity-0 group-hover:opacity-100">
                        <span className="material-symbols-outlined text-[18px]">delete</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && <div className="p-8 text-center text-on-surface-variant">No documents found.</div>}
          </div>
        </main>
      </div>

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100]" onClick={() => setShowDeleteModal(null)}>
          <div className="bg-surface-container border border-border rounded-lg p-6 max-w-sm w-full mx-4" onClick={e => e.stopPropagation()}>
            <h3 className="font-heading text-heading text-on-surface mb-2">Delete Document</h3>
            <p className="text-on-surface-variant mb-6">Are you sure? This action cannot be undone.</p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setShowDeleteModal(null)} className="btn-secondary">Cancel</button>
              <button onClick={() => { deleteDocument(showDeleteModal); setShowDeleteModal(null) }} className="btn-danger">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
