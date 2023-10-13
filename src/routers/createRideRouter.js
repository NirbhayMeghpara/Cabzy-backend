const express = require("express")
const auth = require("../middleware/auth")
const createRideController = require('../controller/createRideController')
const multer = require('multer')

const router = new express.Router()

//------------------------------------ Creating ride data into database ------------------------------------ //

const upload = multer();

router.post('/ride/create', auth, upload.none(), createRideController.create)

//---------------------------------- Fetching ride from database ---------------------------------- //

router.get('/rides', auth, createRideController.fetch)

//---------------------------------- Deleting ride data from database ----------------------------------//

router.delete('/ride/delete/:id', auth, createRideController.deleteRide)

module.exports = router
