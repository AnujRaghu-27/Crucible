import { useState } from 'react'

function ResultPage({
  selectedFile,
  ocrText,
  selectedModel,
  isAnalyzing,
  onReanalyze,
  onChangeImage
}) {
  const [modelToUse, setModelToUse] = useState(selectedModel)

  const handleReanalyze = () => {
    onReanalyze(modelToUse)
  }

  return (
    <main className="result-container">
      <div className="result-left">
        <h2>Uploaded Image</h2>

        <img src={URL.createObjectURL(selectedFile)} alt="Uploaded handwritten answer" className="result-image"/>

        <button type="button" className="btn-change-image" onClick={onChangeImage} disabled={isAnalyzing}>
          Change Image
        </button>
      </div>

      <div className="result-right">
        <h2>Recognition Result</h2>

        <div className="result-model-controls">
          <label htmlFor="result-model-select">
            Recognition Model
          </label>

          <select id="result-model-select" value={modelToUse} onChange={(e) => setModelToUse(e.target.value)} disabled={isAnalyzing}>
            <option value="paddle">PaddleOCR PP-OCRv6</option>
            <option value="surya">Surya 2</option>
          </select>
        </div>

        <button type="button" className="btn-reanalyze" onClick={handleReanalyze} disabled={isAnalyzing}>
          {isAnalyzing ? 'Analyzing...' : 'Re-analyze'}
        </button>

        <div className="result-text">
          {isAnalyzing ? 'Analyzing...' : ocrText}
        </div>
      </div>
    </main>
  )
}

export default ResultPage