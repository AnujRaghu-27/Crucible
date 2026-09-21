import { useState } from 'react'
import katex from 'katex'
import 'katex/dist/katex.min.css'

function ResultPage({
  selectedFile,
  ocrResult,
  selectedModel,
  isAnalyzing,
  onReanalyze,
  onChangeImage
}) {
  const [modelToUse, setModelToUse] = useState(selectedModel)

  const handleReanalyze = () => {
    onReanalyze(modelToUse)
  }

  const suryaPages =
    selectedModel === 'surya'
      ? Object.values(ocrResult?.result || {}).flat()
      : []

  const page = suryaPages[0]
  const blocks = page?.blocks || []

  const renderEquation = (html) => {
    const match = html.match(/<math[^>]*>([\s\S]*?)<\/math>/)

    if (!match) {
      return null
    }

    const latex = match[1]

    return (
      <div
        className="recognized-equation"
        dangerouslySetInnerHTML={{
          __html: katex.renderToString(latex, {
            displayMode: true,
            throwOnError: false
          })
        }}
      />
    )
  }

  return (
    <main className="result-container">
      <div className="result-left">
        <h2>Uploaded Image</h2>

        <img
          src={URL.createObjectURL(selectedFile)}
          alt="Uploaded handwritten answer"
          className="result-image"
        />

        <button
          type="button"
          className="btn-change-image"
          onClick={onChangeImage}
          disabled={isAnalyzing}
        >
          Change Image
        </button>
      </div>

      <div className="result-right">
        <h2>Recognition Result</h2>

        <div className="result-model-controls">
          <label htmlFor="result-model-select">
            Recognition Model
          </label>

          <select
            id="result-model-select"
            value={modelToUse}
            onChange={(e) => setModelToUse(e.target.value)}
            disabled={isAnalyzing}
          >
            <option value="paddle">PaddleOCR PP-OCRv6</option>
            <option value="surya">Surya 2</option>
          </select>
        </div>

        <button
          type="button"
          className="btn-reanalyze"
          onClick={handleReanalyze}
          disabled={isAnalyzing}
        >
          {isAnalyzing ? 'Analyzing...' : 'Re-analyze'}
        </button>

        {isAnalyzing ? (
          <div className="result-text">
            Analyzing...
          </div>
        ) : selectedModel === 'surya' ? (
          <div className="recognized-page">
            {blocks.map((block, index) => {
              if (block.label === 'Equation') {
                return (
                  <div key={index} className="recognized-block">
                    {renderEquation(block.html)}
                  </div>
                )
              }

              if (block.label === 'Table') {
                return (
                  <div key={index} className="recognized-block">
                    <div
                      className="surya-table"
                      dangerouslySetInnerHTML={{
                        __html: block.html || ''
                      }}
                    />
                  </div>
                )
              }

              return (
                <div
                  key={index}
                  className={`recognized-block recognized-${block.label?.toLowerCase()}`}
                  dangerouslySetInnerHTML={{
                    __html: block.html || ''
                  }}
                />
              )
            })}
          </div>
        ) : (
          <div className="result-text">
            {ocrResult?.text}
          </div>
        )}
      </div>
    </main>
  )
}

export default ResultPage