/**
 * Format file size from bytes to human-readable format
 * @param {number} bytes - File size in bytes
 * @returns {string} Formatted file size (e.g., "1.5 MB")
 */
export const formatFileSize = (bytes) => {
  if (!bytes || bytes === 0) return '0 B'
  
  const units = ['B', 'KB', 'MB', 'GB']
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  
  let size = bytes
  let unitIndex = 0
  
  while (size >= k && unitIndex < sizes.length - 1) {
    size /= k
    unitIndex++
  }
  
  return `${parseFloat(size.toFixed(2))} ${sizes[unitIndex]}`
}

/**
 * Get Material Icons icon name based on MIME type
 * @param {string} mimeType - MIME type of the file
 * @returns {string} Material Icons icon name
 */
export const getFileIcon = (mimeType) => {
  if (!mimeType) return 'description'
  
  if (mimeType.startsWith('image/')) {
    return 'image'
  }
  
  if (mimeType.includes('pdf')) {
    return 'picture_as_pdf'
  }
  
  if (mimeType.includes('word') || mimeType.includes('document')) {
    return 'description'
  }
  
  if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) {
    return 'table_chart'
  }
  
  if (mimeType.includes('powerpoint') || mimeType.includes('presentation')) {
    return 'slideshow'
  }
  
  if (mimeType.includes('text')) {
    return 'text_snippet'
  }
  
  if (mimeType.includes('zip') || mimeType.includes('rar') || mimeType.includes('archive')) {
    return 'folder_zip'
  }
  
  return 'description'
}

/**
 * Get file extension from filename or MIME type
 * @param {string} filename - Filename
 * @param {string} mimeType - MIME type (optional)
 * @returns {string} File extension
 */
export const getFileExtension = (filename, mimeType = '') => {
  if (filename && filename.includes('.')) {
    return filename.split('.').pop().toLowerCase()
  }
  
  // Fallback to MIME type
  const mimeToExt = {
    'application/pdf': 'pdf',
    'application/msword': 'doc',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
    'application/vnd.ms-excel': 'xls',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
    'application/vnd.ms-powerpoint': 'ppt',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'pptx',
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/gif': 'gif',
    'text/plain': 'txt',
  }
  
  return mimeToExt[mimeType] || 'file'
}

/**
 * Validate file type before upload
 * @param {File} file - File object to validate
 * @returns {object} { valid: boolean, error?: string }
 */
export const validateFileType = (file) => {
  const allowedMimeTypes = [
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
  
  if (!allowedMimeTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'نوع الملف غير مدعوم. يُسمح فقط بملفات PDF، Word، Excel، PowerPoint، الصور، والنصوص.',
    }
  }
  
  // Check file size (20MB max)
  const maxSize = 20 * 1024 * 1024 // 20MB in bytes
  if (file.size > maxSize) {
    return {
      valid: false,
      error: 'حجم الملف كبير جداً. الحد الأقصى هو 20 ميجابايت.',
    }
  }
  
  return { valid: true }
}

/**
 * Get color class for file type icon
 * @param {string} mimeType - MIME type of the file
 * @returns {string} Tailwind CSS color class
 */
export const getFileIconColor = (mimeType) => {
  if (!mimeType) return 'text-slate-500'
  
  if (mimeType.startsWith('image/')) {
    return 'text-blue-500'
  }
  
  if (mimeType.includes('pdf')) {
    return 'text-red-500'
  }
  
  if (mimeType.includes('word') || mimeType.includes('document')) {
    return 'text-blue-600'
  }
  
  if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) {
    return 'text-emerald-600'
  }
  
  if (mimeType.includes('powerpoint') || mimeType.includes('presentation')) {
    return 'text-orange-500'
  }
  
  return 'text-slate-500'
}
