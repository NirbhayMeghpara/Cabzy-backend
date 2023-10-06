const express = require("express")
const auth = require("../middleware/auth")
const driverController = require('../controller/driverController')
const multer = require('multer')

const router = new express.Router()

//------------------------------------ Adding driver data into database ------------------------------------ //

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    return cb(null, './uploads/driver')
  },
  filename: function (req, file, cb) {
    const extension = file.originalname.split(".").pop()

    const driverName = req.body.name.toLowerCase()

    return cb(null, `${Date.now()}_${driverName}.${extension}`)
  }
})

const upload = multer({
  limits: {
    fileSize: 5000000,
  },
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
      return cb(new Error("Please upload file with jpg, jpeg or png format"))
    }
    cb(undefined, true)
  },
  storage,
})

router.post('/driver/add', auth, upload.single("profile"), driverController.add, (err, req, res, next) => {
  res.status(400).send({ error: err.message })
})

//---------------------------------- Fetching drivers profile from database ---------------------------------- //

router.get('/driver', auth, driverController.fetch)

//--------------------------------- Updating driver profile and saving to database --------------------------------- //

router.patch('/driver/edit', auth, upload.single("profile"), driverController.edit, (err, req, res, next) => {
  res.status(400).send({ error: err.message })
})

//---------------------------------- Deleting driver profile from database ----------------------------------//

router.delete('/driver/delete/:id', auth, driverController.deleteDriver)

//---------------------------------- Change driver status ----------------------------------//

router.post('/driver/changeStatus', auth, upload.none(), driverController.changeDriverStatus)

//---------------------------------- Assign serviceType to driver ----------------------------------//

router.post('/driver/serviceType', auth, upload.none(), driverController.setServiceType)

//---------------------------------- Unassign serviceType from driver ----------------------------------//

router.post('/driver/serviceType/remove', auth, upload.none(), driverController.removeServiceType)

module.exports = router
