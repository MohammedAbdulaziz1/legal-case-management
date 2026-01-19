import { useState, useEffect } from 'react'
import Card from '../common/Card'
import Button from '../common/Button'
import Input from '../common/Input'
import Select from '../common/Select'
import Pagination from '../ui/Pagination'
import { documentService } from '../../services/documentService'
import { formatFileSize, getFileIcon, getFileIconColor } from '../../utils/documentUtils'
import { formatDateTime } from '../../utils/helpers'
import { useAuth } from '../../context/AuthContext'

const DocumentsSection = () => {
  const { user: currentUser } = useAuth()
  const [documents, setDocuments] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const [itemsPerPage] = useState(10)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState('created_at')
  const [sortOrder, setSortOrder] = useState('desc')
  
  // Upload modal state
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadFile, setUploadFile] = useState(null)
  const [uploadName, setUploadName] = useState('')
  const [uploadDescription, setUploadDescription] = useState('')
  const [uploadError, setUploadError] = useState(null)
  
  // Edit modal state
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingDocument, setEditingDocument] = useState(null)
  const [editName, setEditName] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [updating, setUpdating] = useState(false)
  
  // Delete confirmation state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deletingDocument, setDeletingDocument] = useState(null)

  useEffect(() => {
    fetchDocuments()
  }, [currentPage, search, sortBy, sortOrder])

  const fetchDocuments = async () => {
    try {
      setLoading(true)
      setError(null)
      const params = {
        page: currentPage,
        per_page: itemsPerPage,
        sort_by: sortBy,
        order: sortOrder,
      }
      if (search) {
        params.search = search
      }

      const response = await documentService.getAll(params)
      if (response.data.success) {
        setDocuments(response.data.data || [])
        setTotalItems(response.data.meta?.total || 0)
      }
    } catch (err) {
      console.error('Error fetching documents:', err)
      setError('فشل في تحميل المستندات')
      setDocuments([])
    } finally {
      setLoading(false)
    }
  }

  const handleFileSelect = (e) => {
    const file = e.target.files[0]
    if (!file) return

    // Validate file type and size
    const maxSize = 20 * 1024 * 1024 // 20MB
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'image/jpeg',
      'image/png',
      'image/gif',
      'text/plain',
      'application/rtf',
      'application/vnd.oasis.opendocument.text',
      'application/vnd.oasis.opendocument.spreadsheet',
      'application/vnd.oasis.opendocument.presentation',
    ]

    if (!allowedTypes.includes(file.type)) {
      setUploadError('نوع الملف غير مدعوم. يُسمح فقط بملفات PDF، Word، Excel، PowerPoint، الصور، والنصوص.')
      return
    }

    if (file.size > maxSize) {
      setUploadError('حجم الملف كبير جداً. الحد الأقصى هو 20 ميجابايت.')
      return
    }

    setUploadFile(file)
    setUploadName(file.name.replace(/\.[^/.]+$/, '')) // Remove extension for name
    setUploadError(null)
  }

  const handleUpload = async () => {
    if (!uploadFile || !uploadName.trim()) {
      setUploadError('يرجى تحديد ملف وإدخال اسم للمستند')
      return
    }

    try {
      setUploading(true)
      setUploadError(null)

      await documentService.upload(
        uploadFile,
        uploadName.trim(),
        uploadDescription.trim() || null
      )

      // Reset form and close modal
      setUploadFile(null)
      setUploadName('')
      setUploadDescription('')
      setShowUploadModal(false)
      
      // Refresh documents list
      fetchDocuments()
    } catch (err) {
      console.error('Error uploading document:', err)
      setUploadError(err.response?.data?.message || 'فشل في رفع المستند. يرجى المحاولة مرة أخرى.')
    } finally {
      setUploading(false)
    }
  }

  const handleEdit = (document) => {
    setEditingDocument(document)
    setEditName(document.name)
    setEditDescription(document.description || '')
    setShowEditModal(true)
  }

  const handleUpdate = async () => {
    if (!editName.trim()) {
      return
    }

    try {
      setUpdating(true)
      await documentService.update(editingDocument.id, {
        name: editName.trim(),
        description: editDescription.trim() || null,
      })

      setShowEditModal(false)
      setEditingDocument(null)
      fetchDocuments()
    } catch (err) {
      console.error('Error updating document:', err)
      alert(err.response?.data?.message || 'فشل في تحديث المستند')
    } finally {
      setUpdating(false)
    }
  }

  const handleDeleteClick = (document) => {
    setDeletingDocument(document)
    setShowDeleteConfirm(true)
  }

  const handleDelete = async () => {
    if (!deletingDocument) return

    try {
      await documentService.delete(deletingDocument.id)
      setShowDeleteConfirm(false)
      setDeletingDocument(null)
      fetchDocuments()
    } catch (err) {
      console.error('Error deleting document:', err)
      alert(err.response?.data?.message || 'فشل في حذف المستند')
    }
  }

  const handleDownload = async (doc) => {
    try {
      const response = await documentService.download(doc.id)
      
      // Check if response is actually a blob
      if (!response.data) {
        throw new Error('No data received from server')
      }

      const blob = new Blob([response.data], { type: doc.mimeType || response.headers['content-type'] })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = doc.originalFilename || doc.name
      link.style.display = 'none'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Error downloading document:', err)
      const errorMessage = err.response?.data?.message || 
                          (err.response?.data?.error || err.message) || 
                          'فشل في تحميل المستند'
      alert(errorMessage)
    }
  }

  const canModify = currentUser?.role !== 'viewer'
  const totalPages = Math.ceil(totalItems / itemsPerPage)

  return (
    <div className="mt-8">
      <Card>
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50/50 dark:bg-slate-800/30">
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">folder</span>
            المستندات
          </h3>
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            {canModify && (
              <Button
                onClick={() => setShowUploadModal(true)}
                icon="upload"
                size="sm"
              >
                رفع مستند
              </Button>
            )}
            <Input
              type="text"
              placeholder="بحث في المستندات..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setCurrentPage(1)
              }}
              icon="search"
              className="flex-1 sm:w-64"
            />
            <Select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              options={[
                { value: 'created_at', label: 'تاريخ الرفع' },
                { value: 'name', label: 'الاسم' },
                { value: 'file_size', label: 'الحجم' },
                { value: 'mime_type', label: 'النوع' },
              ]}
              className="w-full sm:w-auto"
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              icon={sortOrder === 'asc' ? 'arrow_upward' : 'arrow_downward'}
            >
              {sortOrder === 'asc' ? 'تصاعدي' : 'تنازلي'}
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-12 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent"></div>
              <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">جاري التحميل...</p>
            </div>
          ) : error ? (
            <div className="p-12 text-center">
              <span className="material-symbols-outlined text-red-500 text-4xl mb-4">error</span>
              <p className="text-sm text-red-600 dark:text-red-400 mb-4">{error}</p>
              <Button onClick={fetchDocuments} size="sm" variant="secondary">
                إعادة المحاولة
              </Button>
            </div>
          ) : documents.length === 0 ? (
            <div className="p-12 text-center">
              <span className="material-symbols-outlined text-slate-400 text-5xl mb-4">folder_open</span>
              <p className="text-sm text-slate-500 dark:text-slate-400">لا توجد مستندات</p>
              {canModify && (
                <Button
                  onClick={() => setShowUploadModal(true)}
                  className="mt-4"
                  size="sm"
                  icon="upload"
                >
                  رفع مستند جديد
                </Button>
              )}
            </div>
          ) : (
            <>
              <table className="w-full">
                <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      المستند
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      الحجم
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      رفع بواسطة
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      تاريخ الرفع
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      الإجراءات
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                  {documents.map((doc) => (
                    <tr key={doc.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <span className={`material-symbols-outlined text-2xl ${getFileIconColor(doc.mimeType)}`}>
                            {getFileIcon(doc.mimeType)}
                          </span>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-slate-900 dark:text-white truncate">
                              {doc.name}
                            </div>
                            {doc.description && (
                              <div className="text-xs text-slate-500 dark:text-slate-400 truncate mt-1">
                                {doc.description}
                              </div>
                            )}
                            <div className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                              {doc.originalFilename}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                        {doc.formattedFileSize || formatFileSize(doc.fileSize)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                        {doc.uploadedBy?.name || 'غير معروف'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                        {formatDateTime(doc.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex items-center gap-2 justify-end">
                          <button
                            onClick={() => handleDownload(doc)}
                            className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                            title="تحميل"
                          >
                            <span className="material-symbols-outlined text-xl">download</span>
                          </button>
                          {canModify && (
                            <>
                              <button
                                onClick={() => handleEdit(doc)}
                                className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                                title="تعديل"
                              >
                                <span className="material-symbols-outlined text-xl">edit</span>
                              </button>
                              <button
                                onClick={() => handleDeleteClick(doc)}
                                className="p-2 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                title="حذف"
                              >
                                <span className="material-symbols-outlined text-xl">delete</span>
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {totalPages > 1 && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                  totalItems={totalItems}
                  itemsPerPage={itemsPerPage}
                />
              )}
            </>
          )}
        </div>
      </Card>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">رفع مستند جديد</h3>
              <button
                onClick={() => {
                  setShowUploadModal(false)
                  setUploadFile(null)
                  setUploadName('')
                  setUploadDescription('')
                  setUploadError(null)
                }}
                className="p-2 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  الملف <span className="text-red-500">*</span>
                </label>
                <input
                  type="file"
                  onChange={handleFileSelect}
                  className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary/90"
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png,.gif,.txt,.rtf,.odt,.ods,.odp"
                />
                {uploadFile && (
                  <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                    المحدد: {uploadFile.name} ({formatFileSize(uploadFile.size)})
                  </p>
                )}
              </div>
              <Input
                label="اسم المستند"
                value={uploadName}
                onChange={(e) => setUploadName(e.target.value)}
                placeholder="أدخل اسم المستند"
                required
                icon="description"
              />
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  الوصف (اختياري)
                </label>
                <textarea
                  value={uploadDescription}
                  onChange={(e) => setUploadDescription(e.target.value)}
                  placeholder="أدخل وصفاً للمستند"
                  rows="3"
                  className="w-full rounded-lg border py-2.5 pr-4 pl-4 text-sm text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-primary/50 focus:border-primary transition-shadow"
                />
              </div>
              {uploadError && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <p className="text-sm text-red-600 dark:text-red-400">{uploadError}</p>
                </div>
              )}
              <div className="flex gap-2 justify-end pt-4">
                <Button
                  variant="secondary"
                  onClick={() => {
                    setShowUploadModal(false)
                    setUploadFile(null)
                    setUploadName('')
                    setUploadDescription('')
                    setUploadError(null)
                  }}
                  disabled={uploading}
                >
                  إلغاء
                </Button>
                <Button
                  onClick={handleUpload}
                  disabled={uploading || !uploadFile || !uploadName.trim()}
                  icon="upload"
                >
                  {uploading ? 'جاري الرفع...' : 'رفع'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && editingDocument && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl max-w-md w-full">
            <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">تعديل المستند</h3>
              <button
                onClick={() => {
                  setShowEditModal(false)
                  setEditingDocument(null)
                }}
                className="p-2 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <Input
                label="اسم المستند"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="أدخل اسم المستند"
                required
                icon="description"
              />
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  الوصف (اختياري)
                </label>
                <textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  placeholder="أدخل وصفاً للمستند"
                  rows="3"
                  className="w-full rounded-lg border py-2.5 pr-4 pl-4 text-sm text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-primary/50 focus:border-primary transition-shadow"
                />
              </div>
              <div className="flex gap-2 justify-end pt-4">
                <Button
                  variant="secondary"
                  onClick={() => {
                    setShowEditModal(false)
                    setEditingDocument(null)
                  }}
                  disabled={updating}
                >
                  إلغاء
                </Button>
                <Button
                  onClick={handleUpdate}
                  disabled={updating || !editName.trim()}
                  icon="save"
                >
                  {updating ? 'جاري الحفظ...' : 'حفظ'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && deletingDocument && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl max-w-md w-full">
            <div className="p-6 border-b border-slate-200 dark:border-slate-700">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">تأكيد الحذف</h3>
            </div>
            <div className="p-6">
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                هل أنت متأكد من حذف المستند "{deletingDocument.name}"؟ لا يمكن التراجع عن هذا الإجراء.
              </p>
              <div className="flex gap-2 justify-end">
                <Button
                  variant="secondary"
                  onClick={() => {
                    setShowDeleteConfirm(false)
                    setDeletingDocument(null)
                  }}
                >
                  إلغاء
                </Button>
                <Button
                  variant="danger"
                  onClick={handleDelete}
                  icon="delete"
                >
                  حذف
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default DocumentsSection
