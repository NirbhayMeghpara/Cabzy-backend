const express = require("express")
const auth = require("../middleware/auth")
const userController = require('../controller/userController')
const multer = require('multer')

const router = new express.Router()

//------------------------------------ Adding user data into database ------------------------------------ //

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    return cb(null, './uploads/user')
  },
  filename: function (req, file, cb) {
    const extension = file.originalname.split(".").pop()

    const userName = req.body.name.toLowerCase()

    return cb(null, `${Date.now()}_${userName}.${extension}`)
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

router.post('/user/add', auth, upload.single("profile"), userController.add, (err, req, res, next) => {
  res.status(400).send({ error: err.message })
})

//---------------------------------- Fetching users profile from database ---------------------------------- //

router.get('/user', auth, userController.fetch)

//---------------------------------- Fetching users profile from database ---------------------------------- //

router.post('/user/phone', auth, upload.none(), userController.fetchUserByPhone)

//--------------------------------- Updating user profile and saving to database --------------------------------- //

router.patch('/user/edit', auth, upload.single("profile"), userController.edit, (err, req, res, next) => {
  res.status(400).send({ error: err.message })
})

//---------------------------------- Deleting user profile from database ----------------------------------//

router.delete('/user/delete/:id', auth, userController.deleteUser)

//---------------------------------- Stripe intent ----------------------------------//
router.post('/user/createStripeIntent', auth, upload.none(), userController.setupIntent)

module.exports = router
