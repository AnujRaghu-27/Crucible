function ResultPage({ selectedFile, ocrText, selectedModel, onChangeImage }) {
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
        >
          Change Image
        </button>
      </div>

      <div className="result-right">
        <h2>Recognition Result</h2>

        <div className="result-text">
          {ocrText}
        </div>
      </div>
    </main>
  )
}

export default ResultPage