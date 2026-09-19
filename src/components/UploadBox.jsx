import { useState, useRef, useEffect } from 'react'

const VALID_MIME_TYPES = ['image/png', 'image/jpeg', 'image/jpg']
const VALID_EXTENSIONS = ['.png', '.jpg', '.jpeg']

function UploadBox() {
  const [selectedFile, setSelectedFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [isDragging, setIsDragging] = useState(false)
  const [errorMessage, setErrorMessage] = useState(null)

  const fileInputRef = useRef(null)
  const dragCounter = useRef(0)

  // Clean up object URL when unmounting
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
      }
    }
  }, [previewUrl])

  const validateAndSetFile = (file) => {
    if (!file) return

    const fileType = file.type ? file.type.toLowerCase() : ''
    const fileName = file.name ? file.name.toLowerCase() : ''
    const isMimeValid = VALID_MIME_TYPES.includes(fileType)
    const isExtValid = VALID_EXTENSIONS.some((ext) => fileName.endsWith(ext))

    if (isMimeValid || isExtValid) {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
      }
      const newPreviewUrl = URL.createObjectURL(file)
      setSelectedFile(file)
      setPreviewUrl(newPreviewUrl)
      setErrorMessage(null)
    } else {
      setErrorMessage('Unsupported file format. Please choose a PNG, JPG, or JPEG image.')
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
    dragCounter.current += 1
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true)
    }
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    e.stopPropagation()
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
    dragCounter.current = 0
    setIsDragging(false)

    const files = e.dataTransfer.files
    if (files && files.length > 0) {
      validateAndSetFile(files[0])
    }
  }

  const handleBrowseClick = () => {
    fileInputRef.current?.click()
  }

  const handleRemove = (e) => {
    e.stopPropagation()
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
    }
    setSelectedFile(null)
    setPreviewUrl(null)
    setErrorMessage(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleReplace = (e) => {
    e.stopPropagation()
    handleBrowseClick()
  }

  const handleKeyDown = (e) => {
    if (!selectedFile && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault()
      handleBrowseClick()
    }
  }

  return (
    <div
      className={`upload-box ${isDragging ? 'is-dragging' : ''} ${selectedFile ? 'has-file' : ''}`}
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={!selectedFile ? handleBrowseClick : undefined}
      role={!selectedFile ? 'button' : undefined}
      tabIndex={!selectedFile ? 0 : undefined}
      onKeyDown={handleKeyDown}
      aria-label="Upload handwritten answer"
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png, image/jpeg, .png, .jpg, .jpeg"
        onChange={handleFileChange}
        className="upload-file-input"
        tabIndex={-1}
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
          <div className="upload-formats">PNG, JPG, JPEG</div>
        </>
      ) : (
        <div className="selected-state-container">
          <div className="preview-container">
            <img src={previewUrl} alt="Handwritten answer preview" className="preview-image" />
          </div>
          <div className="file-info-row">
            <span className="file-name" title={selectedFile.name}>
              {selectedFile.name}
            </span>
          </div>
          <div className="file-actions">
            <button type="button" className="btn-action btn-replace" onClick={handleReplace}>
              Replace file
            </button>
            <button type="button" className="btn-action btn-remove" onClick={handleRemove}>
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
