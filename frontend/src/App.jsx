import { useState } from 'react'
import Header from './components/Header'
import UploadBox from './components/UploadBox'
import ModelSelect from './components/ModelSelect'
import './App.css'

function App() {
  const [selectedFile, setSelectedFile] = useState(null)
  const [selectedModel, setSelectedModel] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  const isAnalyzeReady = Boolean(selectedFile && selectedModel)

  const handleAnalyze = async () => {
    if (!isAnalyzeReady || isAnalyzing) return

    setIsAnalyzing(true)

    try {
      const formData = new FormData()

      formData.append('image', selectedFile)
      formData.append('model', selectedModel)

      const response = await fetch('/api/analyze', {
        method: 'POST',
        body: formData
      })

      const data = await response.json()

      console.log(data)
    } catch (error) {
      console.error('Analyze request failed:', error)
    } finally {
      setIsAnalyzing(false)
    }
  }

  return (
    <div className="app-layout">
      <Header />

      <main className="main-container">
        <div className="content-wrapper">
          <section className="page-heading">
            <h1 className="heading-title">Evaluate a handwritten sample</h1>
            <p className="heading-subtitle">Choose a handwritten answer and a recognition model.</p>
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
