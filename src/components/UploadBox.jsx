function UploadBox() {
  return (
    <div className="upload-box">
      <div className="upload-title">Upload handwritten answer</div>
      <div className="upload-icon-wrapper">
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
    </div>
  )
}

export default UploadBox
