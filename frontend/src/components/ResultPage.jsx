import { useState } from 'react'
import katex from 'katex'
import 'katex/dist/katex.min.css'

function ResultPage({
  selectedFile,
  ocrResult,
  selectedModel,
  isAnalyzing,
  onReanalyze,
  onChangeImage,
  pdfPages,
  pdfProcessing
}) {
  const [modelToUse, setModelToUse] = useState(selectedModel)

  const isPdf = selectedFile?.type === 'application/pdf'

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
    const match = html?.match(
      /<math[^>]*>([\s\S]*?)<\/math>/
    )

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

  const renderBlocks = (blocks) => {
    return blocks.map((block, index) => {
      if (block.label === 'Equation') {
        return (
          <div
            key={index}
            className="recognized-block"
          >
            {renderEquation(block.html)}
          </div>
        )
      }

      if (block.label === 'Table') {
        return (
          <div
            key={index}
            className="recognized-block"
          >
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
    })
  }

  return (
    <main className="result-container">
      <div className="result-left">
        <h2>
          {isPdf ? 'Uploaded PDF' : 'Uploaded Image'}
        </h2>

        {isPdf ? (
          <iframe
            src={URL.createObjectURL(selectedFile)}
            title="Uploaded PDF"
            className="result-pdf"
          />
        ) : (
          <img
            src={URL.createObjectURL(selectedFile)}
            alt="Uploaded handwritten answer"
            className="result-image"
          />
        )}

        <button
          type="button"
          className="btn-change-image"
          onClick={onChangeImage}
          disabled={isAnalyzing || pdfProcessing}
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
            disabled={isAnalyzing || pdfProcessing}
          >
            <option value="paddle">
              PaddleOCR PP-OCRv6
            </option>

            <option value="surya">
              Surya 2
            </option>
          </select>
        </div>

        <button
          type="button"
          className="btn-reanalyze"
          onClick={handleReanalyze}
          disabled={isAnalyzing || pdfProcessing}
        >
          {isAnalyzing || pdfProcessing
            ? 'Analyzing...'
            : 'Re-analyze'}
        </button>

        {isPdf ? (
          <div className="pdf-results">
            {pdfPages.map((pdfPage) => {
              const pageBlocks =
                pdfPage.result?.blocks || []

              return (
                <div
                  key={pdfPage.page}
                  className="pdf-page-result"
                >
                  <h3>
                    Page {pdfPage.page}
                  </h3>

                  {pdfPage.status === 'processing' ? (
                    <div className="result-text">
                      Processing Page {pdfPage.page}...
                    </div>
                  ) : (
                    <>
                      <div className="processing-time">
                        Processing time:{' '}
                        {(
                          pdfPage.processingTime / 1000
                        ).toFixed(2)} seconds
                      </div>

                      <div className="recognized-page">
                        {renderBlocks(pageBlocks)}
                      </div>
                    </>
                  )}
                </div>
              )
            })}

            {pdfProcessing && (
              <div className="pdf-processing-status">
                Processing next page...
              </div>
            )}
          </div>
        ) : isAnalyzing ? (
          <div className="result-text">
            Analyzing...
          </div>
        ) : selectedModel === 'surya' ? (
          <div className="recognized-page">
            {renderBlocks(blocks)}
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