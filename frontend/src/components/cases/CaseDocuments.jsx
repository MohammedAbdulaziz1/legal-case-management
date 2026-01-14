import { useState, useEffect, forwardRef, useImperativeHandle } from 'react'
import Card from '../common/Card'
import Button from '../common/Button'
import { documentService } from '../../services/documentService'
import { formatFileSize, getFileIcon, getFileIconColor, validateFileType } from '../../utils/documentUtils'
import { useAuth } from '../../context/AuthContext'
import { USER_ROLES } from '../../utils/constants'

const CaseDocuments = forwardRef(({ caseType, caseId, className = '', onUploadComplete }, ref) => {
  const { user: currentUser } = useAuth()
  const [documents, setDocuments] = useState([])
  const [pendingFiles, setPendingFiles] = useState([]) // For new cases - files waiting to be uploaded
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState(null)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [uploadFile, setUploadFile] = useState(null)
  const [uploadName, setUploadName] = useState('')
  const [uploadDescription, setUploadDescription] = useState('')

  const canModify = currentUser?.role !== USER_ROLES.VIEWER
  const isNewCase = caseId === 'new' || !caseId

  // Expose method to upload pending files (for new cases after they're saved)
  useImperativeHandle(ref, () => ({
    uploadPendingFiles: async (actualCaseId) => {
      if (pendingFiles.length === 0) return { success: true, count: 0 }
      
      try {
        const typeMap = {
          'primary': 'App\\Models\\CaseRegistration',
          'appeal': 'App\\Models\\Appeal',
          'supreme': 'App\\Models\\SupremeCourt',
        }

        let successCount = 0
        const errors = []

        for (const fileItem of pendingFiles) {
          try {
            await documentService.upload(
              fileItem.file,
              fileItem.name,
              fileItem.description || null,
              typeMap[caseType],
              actualCaseId
            )
            successCount++
          } catch (err) {
            errors.push({ file: fileItem.name, error: err.message })
          }
        }

        // Clear pending files after upload attempt
        setPendingFiles([])
        
        if (onUploadComplete) {
          onUploadComplete(successCount, errors)
        }

        return { success: errors.length === 0, count: successCount, errors }
      } catch (err) {
        console.error('Error uploading pending files:', err)
        return { success: false, count: 0, errors: [err.message] }
      }
    }
  }))

  useEffect(() => {
    if (caseId && caseId !== 'new') {
      fetchDocuments()
    } else {
      setLoading(false)
    }
  }, [caseId, caseType])

  const fetchDocuments = async () => {
    try {
      setLoading(true)
      const response = await documentService.getCaseDocuments(caseType, caseId)
      if (response.data.success) {
        setDocuments(response.data.data || [])
      }
    } catch (err) {
      console.error('Error fetching case documents:', err)
      setDocuments([])
    } finally {
      setLoading(false)
    }
  }

  const handleFileSelect = (e) => {
    const file = e.target.files[0]
    if (!file) return

    const validation = validateFileType(file)
    if (!validation.valid) {
      setUploadError(validation.error)
      return
    }

    setUploadFile(file)
    setUploadName(file.name.replace(/\.[^/.]+$/, '')) // Remove extension
    setUploadError(null)
  }

  const handleUpload = async () => {
    if (!uploadFile || !uploadName.trim()) {
      setUploadError('يرجى تحديد ملف وإدخال اسم للمستند')
      return
    }

    // For new cases, add to pending files list
    if (isNewCase) {
      setPendingFiles(prev => [...prev, {
        file: uploadFile,
        name: uploadName.trim(),
        description: uploadDescription.trim() || null,
        id: Date.now() // temporary ID for UI
      }])
      
      // Reset form and close modal
      setUploadFile(null)
      setUploadName('')
      setUploadDescription('')
      setShowUploadModal(false)
      setUploadError(null)
      return
    }

    // For existing cases, upload immediately
    try {
      setUploading(true)
      setUploadError(null)

      const typeMap = {
        'primary': 'App\\Models\\CaseRegistration',
        'appeal': 'App\\Models\\Appeal',
        'supreme': 'App\\Models\\SupremeCourt',
      }

      await documentService.upload(
        uploadFile,
        uploadName.trim(),
        uploadDescription.trim() || null,
        typeMap[caseType],
        caseId
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

  const handleRemovePendingFile = (fileId) => {
    setPendingFiles(prev => prev.filter(f => f.id !== fileId))
  }

  const handleDownload = async (doc) => {
    try {
      const response = await documentService.download(doc.id)
      
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
      alert('فشل في تحميل المستند')
    }
  }

  const handleDelete = async (doc) => {
    if (!confirm(`هل أنت متأكد من حذف المستند "${doc.name}"؟`)) {
      return
    }

    try {
      await documentService.delete(doc.id)
      fetchDocuments()
    } catch (err) {
      console.error('Error deleting document:', err)
      alert(err.response?.data?.message || 'فشل في حذف المستند')
    }
  }

  // For new cases, show pending files interface
  if (isNewCase) {
    return (
      <>
        <Card title="المرفقات" className={className}>
          <div className="p-6">
            {canModify && (
              <div className="mb-4">
                <Button
                  onClick={() => setShowUploadModal(true)}
                  icon="add"
                  size="sm"
                  variant="secondary"
                  className="w-full"
                >
                  إضافة مستند
                </Button>
              </div>
            )}

            {pendingFiles.length === 0 ? (
              <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                <span className="material-symbols-outlined text-3xl mb-2">description</span>
                <p className="text-sm">لا توجد مستندات محددة</p>
                <p className="text-xs mt-2">سيتم رفع المستندات عند حفظ القضية</p>
              </div>
            ) : (
              <>
                <div className="mb-3 text-xs text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 p-2 rounded">
                  ⓘ سيتم رفع {pendingFiles.length} مستند(ات) عند حفظ القضية
                </div>
                <div className="space-y-3">
                  {pendingFiles.map((fileItem) => (
                    <div
                      key={fileItem.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <span className={`material-symbols-outlined ${getFileIconColor(fileItem.file.type)}`}>
                          {getFileIcon(fileItem.file.type)}
                        </span>
                        <div className="flex flex-col min-w-0 flex-1">
                          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 truncate">
                            {fileItem.name}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {formatFileSize(fileItem.file.size)}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemovePendingFile(fileItem.id)}
                        className="text-slate-400 hover:text-red-500 transition-colors p-1"
                        title="إزالة"
                      >
                        <span className="material-symbols-outlined text-lg">close</span>
                      </button>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </Card>

        {/* Upload Modal */}
        {showUploadModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-800 rounded-lg max-w-md w-full p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">إضافة مستند</h3>
                <button
                  onClick={() => {
                    setShowUploadModal(false)
                    setUploadFile(null)
                    setUploadName('')
                    setUploadDescription('')
                    setUploadError(null)
                  }}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    اختر ملف
                  </label>
                  <input
                    type="file"
                    onChange={handleFileSelect}
                    className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary/90 cursor-pointer"
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.jpg,.jpeg,.png,.gif"
                  />
                  {uploadFile && (
                    <p className="mt-2 text-xs text-slate-500">
                      {uploadFile.name} ({formatFileSize(uploadFile.size)})
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    اسم المستند <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={uploadName}
                    onChange={(e) => setUploadName(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                    placeholder="أدخل اسم المستند"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    الوصف (اختياري)
                  </label>
                  <textarea
                    value={uploadDescription}
                    onChange={(e) => setUploadDescription(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none resize-none"
                    rows="3"
                    placeholder="أدخل وصف المستند"
                  />
                </div>

                {uploadError && (
                  <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <p className="text-sm text-red-600 dark:text-red-400">{uploadError}</p>
                  </div>
                )}

                <div className="flex gap-3">
                  <Button
                    onClick={() => {
                      setShowUploadModal(false)
                      setUploadFile(null)
                      setUploadName('')
                      setUploadDescription('')
                      setUploadError(null)
                    }}
                    variant="secondary"
                    className="flex-1"
                  >
                    إلغاء
                  </Button>
                  <Button
                    onClick={handleUpload}
                    variant="primary"
                    icon="add"
                    className="flex-1"
                    disabled={!uploadFile}
                  >
                    إضافة
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </>
    )
  }

  return (
    <>
      <Card title="المرفقات" className={className}>
        <div className="p-6">
          {canModify && (
            <div className="mb-4">
              <Button
                onClick={() => setShowUploadModal(true)}
                icon="upload"
                size="sm"
                variant="secondary"
                className="w-full"
              >
                رفع مستند جديد
              </Button>
            </div>
          )}

          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">جاري تحميل المستندات...</p>
            </div>
          ) : documents.length === 0 ? (
            <div className="text-center py-8 text-slate-500 dark:text-slate-400">
              <span className="material-symbols-outlined text-3xl mb-2">description</span>
              <p className="text-sm">لا توجد مستندات مرفقة</p>
            </div>
          ) : (
            <div className="space-y-3">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 hover:border-primary/30 transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <span className={`material-symbols-outlined ${getFileIconColor(doc.mimeType)}`}>
                      {getFileIcon(doc.mimeType)}
                    </span>
                    <div className="flex flex-col min-w-0 flex-1">
                      <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 truncate">
                        {doc.name}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {doc.formattedFileSize || formatFileSize(doc.fileSize)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleDownload(doc)}
                      className="text-slate-400 hover:text-primary transition-colors p-1"
                      title="تحميل"
                    >
                      <span className="material-symbols-outlined text-lg">download</span>
                    </button>
                    {canModify && (
                      <button
                        onClick={() => handleDelete(doc)}
                        className="text-slate-400 hover:text-red-500 transition-colors p-1"
                        title="حذف"
                      >
                        <span className="material-symbols-outlined text-lg">delete</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-lg max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">رفع مستند جديد</h3>
              <button
                onClick={() => {
                  setShowUploadModal(false)
                  setUploadFile(null)
                  setUploadName('')
                  setUploadDescription('')
                  setUploadError(null)
                }}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  اختر ملف
                </label>
                <input
                  type="file"
                  onChange={handleFileSelect}
                  className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary/90 cursor-pointer"
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.jpg,.jpeg,.png,.gif"
                />
                {uploadFile && (
                  <p className="mt-2 text-xs text-slate-500">
                    {uploadFile.name} ({formatFileSize(uploadFile.size)})
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  اسم المستند <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={uploadName}
                  onChange={(e) => setUploadName(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                  placeholder="أدخل اسم المستند"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  الوصف (اختياري)
                </label>
                <textarea
                  value={uploadDescription}
                  onChange={(e) => setUploadDescription(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none resize-none"
                  rows="3"
                  placeholder="أدخل وصف المستند"
                />
              </div>

              {uploadError && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <p className="text-sm text-red-600 dark:text-red-400">{uploadError}</p>
                </div>
              )}

              <div className="flex gap-3">
                <Button
                  onClick={() => {
                    setShowUploadModal(false)
                    setUploadFile(null)
                    setUploadName('')
                    setUploadDescription('')
                    setUploadError(null)
                  }}
                  variant="secondary"
                  className="flex-1"
                  disabled={uploading}
                >
                  إلغاء
                </Button>
                <Button
                  onClick={handleUpload}
                  variant="primary"
                  icon={uploading ? '' : 'upload'}
                  className="flex-1"
                  disabled={uploading || !uploadFile}
                >
                  {uploading ? 'جاري الرفع...' : 'رفع'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
})

CaseDocuments.displayName = 'CaseDocuments'

export default CaseDocuments
