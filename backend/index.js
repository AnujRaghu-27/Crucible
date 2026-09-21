const express = require('express')
const multer = require('multer')
const path = require('path')
const { exec } = require('child_process')
const cors = require('cors')

const app = express()

app.use(cors())

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

  const runner =
    req.body.model === 'surya'
      ? 'icr/suryaRunner.py'
      : 'icr/paddleRunner.py'

  exec(
    `./venv/bin/python "${runner}" "${req.file.path}"`,
    (error, stdout, stderr) => {
      if (error) {
        console.error('Python error:', error)
        console.error('Python stderr:', stderr)

        return res.status(500).json({
          success: false,
          message: stderr || 'Python execution failed'
        })
      }

      console.log('Python output:', stdout)

      if (req.body.model === 'surya') {
        try {
          const result = JSON.parse(stdout)

          return res.json({
            success: true,
            model: 'surya',
            result
          })
        } catch (parseError) {
          console.error('Surya JSON parse error:', parseError)

          return res.status(500).json({
            success: false,
            message: 'Invalid JSON returned by Surya'
          })
        }
      }

      res.json({
        success: true,
        model: 'paddle',
        text: stdout
      })
    }
  )
})

const PORT = process.env.PORT || 5001

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`)
})