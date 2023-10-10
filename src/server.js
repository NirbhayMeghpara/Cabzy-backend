const express = require('express')
const adminRouter = require('./routers/adminRouter')
const vehicleTypeRouter = require('./routers/vehicleTypeRouter')
const countryRouter = require('./routers/countryRouter')
const cityRouter = require('./routers/cityRouter')
const vehiclePriceRouter = require('./routers/vehiclePriceRouter')
const settingRouter = require('./routers/settingRouter')
const userRouter = require('./routers/userRouter')
const cardRouter = require('./routers/cardRouter')
const driverRouter = require('./routers/driverRouter')

const cors = require('cors')
const path = require("path")
require('./db/mongoose')

const port = process.env.PORT || 3000

const app = express()

app.use(express.json())
app.use(cors())

const uploadPath = path.join(__dirname, "../uploads")
app.use(express.static(uploadPath))

// Routes
app.use(adminRouter)
app.use(vehicleTypeRouter)
app.use(countryRouter)
app.use(cityRouter)
app.use(vehiclePriceRouter)
app.use(settingRouter)
app.use(userRouter)
app.use(cardRouter)
app.use(driverRouter)

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}/`)
})
