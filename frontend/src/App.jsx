import { useState } from 'react'
import Header from './components/Header'
import UploadBox from './components/UploadBox'
import ModelSelect from './components/ModelSelect'
import ResultPage from './components/ResultPage'
import './App.css'

function App() {
  const [selectedFile, setSelectedFile] = useState(null)
  const [selectedModel, setSelectedModel] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [ocrResult, setOcrResult] = useState(null)
  const [showResult, setShowResult] = useState(false)
  const [pdfPages, setPdfPages] = useState([])
  const [pdfProcessing, setPdfProcessing] = useState(false)

  const isAnalyzeReady = Boolean(selectedFile && selectedModel)

  const analyzeImage = async (model = selectedModel) => {
    if (!selectedFile || !model || isAnalyzing) return

    setIsAnalyzing(true)

    try {
      const formData = new FormData()

      formData.append('image', selectedFile)
      formData.append('model', model)

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/analyze`,
        {
          method: 'POST',
          body: formData
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Analysis failed')
      }

      setOcrResult(data)
      setSelectedModel(model)
      setShowResult(true)
    } catch (error) {
      console.error('Analyze request failed:', error)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const analyzePdf = async () => {
  if (!selectedFile || selectedModel !== 'surya' || pdfProcessing) {
    return
  }

  setPdfPages([])
  setPdfProcessing(true)
  setShowResult(true)

  const formData = new FormData()

  formData.append('image', selectedFile)
  formData.append('model', selectedModel)

  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/api/analyze-pdf`,
      {
        method: 'POST',
        body: formData
      }
    )

    if (!response.ok) {
      throw new Error('PDF analysis failed')
    }

    const reader = response.body.getReader()
    const decoder = new TextDecoder()

    let buffer = ''

    while (true) {
      const { value, done } = await reader.read()

      if (done) {
        break
      }

      buffer += decoder.decode(value, {
        stream: true
      })

      const events = buffer.split('\n\n')

      buffer = events.pop()

      for (const event of events) {
        if (!event.startsWith('data: ')) {
          continue
        }

        const data = JSON.parse(
          event.replace('data: ', '')
        )

        if (data.type === 'page-start') {
          setPdfPages((pages) => [
            ...pages,
            {
              page: data.page,
              status: 'processing'
            }
          ])
        }

        if (data.type === 'page-result') {
          setPdfPages((pages) =>
            pages.map((page) =>
              page.page === data.page
                ? {
                    ...page,
                    status: 'complete',
                    result: data.result,
                    processingTime: data.processingTime
                  }
                : page
            )
          )
        }

        if (data.type === 'complete') {
          setPdfProcessing(false)
        }

        if (data.type === 'error') {
          console.error(
            `Page ${data.page} failed:`,
            data.message
          )

          setPdfProcessing(false)
        }
      }
    }
  } catch (error) {
    console.error('PDF analysis failed:', error)
    setPdfProcessing(false)
  }
}

  const handleAnalyze = () => {
  if (!isAnalyzeReady) return

  if (selectedFile.type === 'application/pdf') {
    analyzePdf()
    return
  }

  analyzeImage(selectedModel)
}

  const handleReanalyze = (newModel) => {
    setSelectedModel(newModel)
    analyzeImage(newModel)
  }

  if (showResult) {
    return (
      <div className="app-layout">
        <Header />

        <ResultPage
          selectedFile={selectedFile}
          ocrResult={ocrResult}
          selectedModel={selectedModel}
          isAnalyzing={isAnalyzing}
          onReanalyze={handleReanalyze}
          onChangeImage={() => setShowResult(false)}
          pdfPages={pdfPages}
          pdfProcessing={pdfProcessing}
        />
      </div>
    )
  }

  return (
    <div className="app-layout">
      <Header />

      <main className="main-container">
        <div className="content-wrapper">
          <section className="page-heading">
            <h1 className="heading-title">
              Evaluate a handwritten sample
            </h1>

            <p className="heading-subtitle">
              Choose a handwritten answer and a recognition model.
            </p>
          </section>

          <UploadBox
            selectedFile={selectedFile}
            onFileSelect={setSelectedFile}
            onFileRemove={() => setSelectedFile(null)}
            disabled={isAnalyzing}
          />

          <ModelSelect
            selectedModel={selectedModel}
            onModelChange={setSelectedModel}
            disabled={isAnalyzing}
          />

          <button
            type="button"
            className="btn-analyze"
            disabled={!isAnalyzeReady || isAnalyzing || pdfProcessing}
            onClick={handleAnalyze}
          >
            {isAnalyzing || pdfProcessing ? 'Analyzing...' : 'Analyze'}
          </button>
        </div>
      </main>
    </div>
  )
}

export default App