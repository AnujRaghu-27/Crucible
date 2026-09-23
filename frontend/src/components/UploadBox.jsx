import { useState, useRef, useEffect } from 'react'

const VALID_MIME_TYPES = [
  'image/png',
  'image/jpeg',
  'image/jpg',
  'application/pdf'
]

const VALID_EXTENSIONS = [
  '.png',
  '.jpg',
  '.jpeg',
  '.pdf'
]

function UploadBox({ selectedFile, onFileSelect, onFileRemove, disabled = false }) {
  const [previewUrl, setPreviewUrl] = useState(null)
  const [isDragging, setIsDragging] = useState(false)
  const [errorMessage, setErrorMessage] = useState(null)

  const fileInputRef = useRef(null)
  const dragCounter = useRef(0)

  // Manage object URL lifecycle for selectedFile
  useEffect(() => {
    if (!selectedFile) {
      setPreviewUrl(null)
      return
    }

    const url = URL.createObjectURL(selectedFile)
    setPreviewUrl(url)

    return () => {
      URL.revokeObjectURL(url)
    }
  }, [selectedFile])

  const validateAndSetFile = (file) => {
    if (!file || disabled) return

    const fileType = file.type ? file.type.toLowerCase() : ''
    const fileName = file.name ? file.name.toLowerCase() : ''
    const isMimeValid = VALID_MIME_TYPES.includes(fileType)
    const isExtValid = VALID_EXTENSIONS.some((ext) => fileName.endsWith(ext))

    if (isMimeValid || isExtValid) {
      setErrorMessage(null)
      onFileSelect?.(file)
    } else {
      setErrorMessage('Unsupported file format. Please choose a PNG, JPG, JPEG, or PDF file.')
    }
  }

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      validateAndSetFile(file)
    }
    // Reset file input value so selecting the same file again triggers onChange
    e.target.value = ''
  }

  const handleDragEnter = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (disabled) return
    dragCounter.current += 1
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true)
    }
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (disabled) return
    dragCounter.current -= 1
    if (dragCounter.current <= 0) {
      dragCounter.current = 0
      setIsDragging(false)
    }
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (disabled) return
    dragCounter.current = 0
    setIsDragging(false)

    const files = e.dataTransfer.files
    if (files && files.length > 0) {
      validateAndSetFile(files[0])
    }
  }

  const handleBrowseClick = () => {
    if (disabled) return
    fileInputRef.current?.click()
  }

  const handleRemove = (e) => {
    e.stopPropagation()
    if (disabled) return
    setErrorMessage(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    onFileRemove?.()
  }

  const handleReplace = (e) => {
    e.stopPropagation()
    if (disabled) return
    handleBrowseClick()
  }

  const handleKeyDown = (e) => {
    if (!selectedFile && !disabled && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault()
      handleBrowseClick()
    }
  }

  return (
    <div
      className={`upload-box ${isDragging ? 'is-dragging' : ''} ${selectedFile ? 'has-file' : ''} ${disabled ? 'is-disabled' : ''}`}
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={!selectedFile && !disabled ? handleBrowseClick : undefined}
      role={!selectedFile && !disabled ? 'button' : undefined}
      tabIndex={!selectedFile && !disabled ? 0 : undefined}
      onKeyDown={handleKeyDown}
      aria-label="Upload handwritten answer"
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png, image/jpeg, application/pdf, .png, .jpg, .jpeg, .pdf"
        onChange={handleFileChange}
        className="upload-file-input"
        tabIndex={-1}
        disabled={disabled}
        aria-hidden="true"
      />

      {!selectedFile ? (
        <>
          <div className="upload-title">Upload handwritten answer</div>
          <div className="upload-icon-wrapper" aria-hidden="true">
            <svg
              className="upload-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
          </div>
          <div className="upload-instruction">Drop file here or browse</div>
          <div className="upload-formats">PNG, JPG, JPEG, PDF</div>
        </>
      ) : (
        <div className="selected-state-container">
          <div className="preview-container">
            {selectedFile?.type === 'application/pdf' ? (
              <div className="pdf-preview">
                PDF
              </div>
            ) : (
              previewUrl && (
                <img
                  src={previewUrl}
                  alt="Handwritten answer preview"
                  className="preview-image"
                />
              )
            )}
          </div>
          <div className="file-info-row">
            <span className="file-name" title={selectedFile.name}>
              {selectedFile.name}
            </span>
          </div>
          <div className="file-actions">
            <button
              type="button"
              className="btn-action btn-replace"
              onClick={handleReplace}
              disabled={disabled}
            >
              Replace file
            </button>
            <button
              type="button"
              className="btn-action btn-remove"
              onClick={handleRemove}
              disabled={disabled}
            >
              Remove
            </button>
          </div>
        </div>
      )}

      {errorMessage && <div className="upload-error-text">{errorMessage}</div>}
    </div>
  )
}

export default UploadBox
