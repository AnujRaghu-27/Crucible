function ModelSelect({ selectedModel, onModelChange, disabled = false }) {
  return (
    <div className="model-select-group">
      <label htmlFor="model-select" className="model-select-label">
        Recognition Model
      </label>
      <select
        id="model-select"
        className="model-select-dropdown"
        value={selectedModel}
        onChange={(e) => onModelChange?.(e.target.value)}
        disabled={disabled}
      >
        <option value="">Select a model</option>
        <option value="paddle">PaddleOCR PP-OCRv6</option>
        <option value="surya">Surya 2</option>
      </select>
    </div>
  )
}

export default ModelSelect
