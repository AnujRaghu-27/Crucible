function ModelSelect() {
  return (
    <div className="model-select-group">
      <label htmlFor="model-select" className="model-select-label">
        Recognition Model
      </label>
      <select id="model-select" className="model-select-dropdown" defaultValue="">
        <option value="">Select a model</option>
        <option value="google">Google Document AI</option>
        <option value="azure">Azure Document Intelligence</option>
        <option value="aws">Amazon Textract</option>
        <option value="paddle">PaddleOCR PP-OCRv5</option>
        <option value="transkribus">Transkribus</option>
      </select>
    </div>
  )
}

export default ModelSelect
