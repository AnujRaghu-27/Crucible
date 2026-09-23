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

      cb(
        null,
        Date.now() + extension
      )
    }
  })
})


// --------------------------------------------------
// IMAGE ANALYSIS
// --------------------------------------------------

app.post(
  '/api/analyze',
  upload.single('image'),
  (req, res) => {
    console.log('Analyze request received')
    console.log('File:', req.file)
    console.log('Model:', req.body.model)

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      })
    }

    const fileExtension = path
      .extname(req.file.originalname)
      .toLowerCase()

    const isPdf = fileExtension === '.pdf'

    console.log(
      'File type:',
      isPdf ? 'PDF' : 'Image'
    )

    // PDFs are handled by /api/analyze-pdf
    if (isPdf) {
      return res.json({
        success: true,
        type: 'pdf',
        message: 'PDF received successfully'
      })
    }

    const runner =
      req.body.model === 'surya'
        ? 'icr/suryaRunner.py'
        : 'icr/paddleRunner.py'

    exec(
      `./venv/bin/python "${runner}" "${req.file.path}"`,
      (error, stdout, stderr) => {
        if (error) {
          console.error(
            'Python error:',
            error
          )

          console.error(
            'Python stderr:',
            stderr
          )

          return res.status(500).json({
            success: false,
            message:
              stderr ||
              'Python execution failed'
          })
        }

        console.log(
          'Python output:',
          stdout
        )

        // Surya returns JSON
        if (req.body.model === 'surya') {
          try {
            const result =
              JSON.parse(stdout)

            return res.json({
              success: true,
              model: 'surya',
              result
            })
          } catch (parseError) {
            console.error(
              'Surya JSON parse error:',
              parseError
            )

            return res.status(500).json({
              success: false,
              message:
                'Invalid JSON returned by Surya'
            })
          }
        }

        // Paddle returns plain text
        return res.json({
          success: true,
          model: 'paddle',
          text: stdout
        })
      }
    )
  }
)


// --------------------------------------------------
// PDF ANALYSIS
// --------------------------------------------------

app.post(
  '/api/analyze-pdf',
  upload.single('image'),
  (req, res) => {
    console.log(
      'PDF analyze request received'
    )

    console.log(
      'File:',
      req.file
    )

    console.log(
      'Model:',
      req.body.model
    )

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No PDF uploaded'
      })
    }

    // Currently PDF supports Surya only
    if (req.body.model !== 'surya') {
      return res.status(400).json({
        success: false,
        message:
          'PDF currently supports Surya only'
      })
    }

    // SSE headers
    res.setHeader(
      'Content-Type',
      'text/event-stream'
    )

    res.setHeader(
      'Cache-Control',
      'no-cache'
    )

    res.setHeader(
      'Connection',
      'keep-alive'
    )

    res.flushHeaders()


    // --------------------------------------------------
    // GET PDF PAGE COUNT
    // --------------------------------------------------

    exec(
      `./venv/bin/python -c "import pymupdf; d=pymupdf.open('${req.file.path}'); print(len(d))"`,
      (
        countError,
        countStdout,
        countStderr
      ) => {

        if (countError) {
          console.error(
            'Page count error:',
            countStderr
          )

          res.write(
            `data: ${JSON.stringify({
              type: 'error',
              message:
                'Could not determine PDF page count'
            })}\n\n`
          )

          return res.end()
        }

        const pageCount =
          parseInt(
            countStdout.trim(),
            10
          )

        if (!pageCount) {
          res.write(
            `data: ${JSON.stringify({
              type: 'error',
              message:
                'Invalid PDF page count'
            })}\n\n`
          )

          return res.end()
        }

        console.log(
          'PDF page count:',
          pageCount
        )

        // Start processing from page 1
        processNextPage(1)


        // --------------------------------------------------
        // PROCESS PDF PAGES SEQUENTIALLY
        // --------------------------------------------------

        function processNextPage(
          pageNumber
        ) {

          // All pages completed
          if (
            pageNumber >
            pageCount
          ) {

            console.log(
              'All PDF pages processed'
            )

            res.write(
              `data: ${JSON.stringify({
                type: 'complete',
                pageCount
              })}\n\n`
            )

            return res.end()
          }


          console.log(
            `Processing PDF page ${pageNumber}/${pageCount}`
          )

          const startTime =
            Date.now()


          // Tell frontend that this page started
          res.write(
            `data: ${JSON.stringify({
              type: 'page-start',
              page: pageNumber
            })}\n\n`
          )


          // --------------------------------------------------
          // RUN SURYA FOR THIS PAGE
          // --------------------------------------------------

          exec(
            `./venv/bin/python "icr/pdfSuryaRunner.py" "${req.file.path}" ${pageNumber}`,
            (
              error,
              stdout,
              stderr
            ) => {

              if (error) {

                console.error(
                  `Page ${pageNumber} Surya error:`,
                  stderr
                )

                res.write(
                  `data: ${JSON.stringify({
                    type: 'error',
                    page: pageNumber,
                    message:
                      stderr ||
                      'Page processing failed'
                  })}\n\n`
                )

                return res.end()
              }


              const processingTime =
                Date.now() -
                startTime


              // --------------------------------------------------
              // PARSE SURYA RESULT
              // --------------------------------------------------

              try {

                const result =
                  JSON.parse(stdout)


                console.log(
                  `Page ${pageNumber} completed in ${processingTime} ms`
                )


                // Send completed page
                // immediately to frontend
                res.write(
                  `data: ${JSON.stringify({
                    type: 'page-result',
                    page: pageNumber,
                    processingTime,
                    result
                  })}\n\n`
                )


                // Process next page
                processNextPage(
                  pageNumber + 1
                )

              } catch (
                parseError
              ) {

                console.error(
                  `Page ${pageNumber} JSON parse error:`,
                  parseError
                )

                res.write(
                  `data: ${JSON.stringify({
                    type: 'error',
                    page: pageNumber,
                    message:
                      'Invalid JSON returned by Surya'
                  })}\n\n`
                )

                res.end()
              }
            }
          )
        }
      }
    )
  }
)


// --------------------------------------------------
// START SERVER
// --------------------------------------------------

const PORT =
  process.env.PORT || 5001

app.listen(
  PORT,
  '0.0.0.0',
  () => {
    console.log(
      `Server running on port ${PORT}`
    )
  }
)