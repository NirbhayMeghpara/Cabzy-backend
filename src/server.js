const express = require('express')
const apiRouter = require('./routers/api')
const cors = require('cors')
const mongoose = require('./db/mongoose')

const port = process.env.PORT || 3000

const app = express()

app.use(express.json())
app.use(apiRouter)

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}/`)
})
