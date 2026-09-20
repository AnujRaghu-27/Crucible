const express = require('express')
const multer = require('multer')

const app = express()

const upload = multer({ dest: 'uploads/' })

app.post('/api/analyze', upload.single('image'), (req, res) => {
  console.log('Analyze request received')

  console.log('Image:', req.file)
  console.log('Model:', req.body.model)

  res.json({
    success: true,
    message: 'Image received successfully',
    fileName: req.file.originalname,
    model: req.body.model
  })
})

app.listen(5001, () => {
  console.log('Server running on http://localhost:5001')
})