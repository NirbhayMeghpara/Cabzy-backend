const express = require('express')
const adminRouter = require('./routers/adminRouter')
const cors = require('cors')
const auth = require('./middleware/auth')
require('./db/mongoose')

const port = process.env.PORT || 3000

const app = express()

app.use(express.json())
app.use(cors())
app.use(adminRouter)

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}/`)
})
