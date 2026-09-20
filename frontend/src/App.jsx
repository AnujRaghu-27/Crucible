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
  const [ocrText, setOcrText] = useState('')
  const [showResult, setShowResult] = useState(false)

  const isAnalyzeReady = Boolean(selectedFile && selectedModel)

  const analyzeImage = async (model = selectedModel) => {
    if (!selectedFile || !model || isAnalyzing) return

    setIsAnalyzing(true)

    try {
      const formData = new FormData()

      formData.append('image', selectedFile)
      formData.append('model', model)

      const response = await fetch('/api/analyze', {
        method: 'POST',
        body: formData
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Analysis failed')
      }

      setOcrText(data.text)
      setSelectedModel(model)
      setShowResult(true)
    } catch (error) {
      console.error('Analyze request failed:', error)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleAnalyze = () => {
    if (!isAnalyzeReady) return

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

        <ResultPage selectedFile={selectedFile} ocrText={ocrText} selectedModel={selectedModel} isAnalyzing={isAnalyzing} onReanalyze={handleReanalyze} onChangeImage={() => setShowResult(false)}/>
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

          <UploadBox selectedFile={selectedFile} onFileSelect={setSelectedFile} onFileRemove={() => setSelectedFile(null)} disabled={isAnalyzing}/>

          <ModelSelect selectedModel={selectedModel} onModelChange={setSelectedModel} disabled={isAnalyzing}/>

          <button type="button" className="btn-analyze" disabled={!isAnalyzeReady || isAnalyzing} onClick={handleAnalyze}>
            {isAnalyzing ? 'Analyzing...' : 'Analyze'}
          </button>
        </div>
      </main>
    </div>
  )
}

export default App