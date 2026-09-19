import Header from './components/Header'
import UploadBox from './components/UploadBox'
import ModelSelect from './components/ModelSelect'
import './App.css'

function App() {
  return (
    <div className="app-layout">
      <Header />

      <main className="main-container">
        <div className="content-wrapper">
          <section className="page-heading">
            <h1 className="heading-title">Evaluate a handwritten sample</h1>
            <p className="heading-subtitle">Choose a handwritten answer and a recognition model.</p>
          </section>

          <UploadBox />

          <ModelSelect />
        </div>
      </main>
    </div>
  )
}

export default App
