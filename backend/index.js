const express = require('express')
const multer = require('multer')
const path = require('path')
const { exec } = require('child_process')

const app = express()

const upload = multer({
  storage: multer.diskStorage({
    destination: 'uploads/',
    filename: (req, file, cb) => {
      const extension = path.extname(file.originalname)
      cb(null, Date.now() + extension)
    }
  })
})

app.post('/api/analyze', upload.single('image'), (req, res) => {
  console.log('Analyze request received')

  console.log('Image:', req.file)
  console.log('Model:', req.body.model)

  exec(`./venv/bin/python icr/paddleRunner.py "${req.file.path}"`, (error, stdout, stderr) => {
    if (error) {
      console.error('Python error:', error)
      return res.status(500).json({
        success: false,
        message: 'Python execution failed'
      })
    }

    console.log('Python output:', stdout)

    res.json({
      success: true,
      text: stdout
    })
  })
})

app.listen(5001, () => {
  console.log('Server running on http://localhost:5001')
})