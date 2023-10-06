const express = require("express")
const auth = require("../middleware/auth")
const cardController = require('../controller/cardController')
const multer = require('multer')

const router = new express.Router()

const upload = multer()

//------------------------------------ Adding card details into stripe ------------------------------------ //

router.post('/card/add', auth, upload.none(), cardController.add, (err, req, res, next) => {
  res.status(400).send({ error: err.message })
})

//---------------------------------- Fetching users profile from stripe ---------------------------------- //

router.post('/card', auth, upload.none(), cardController.fetchCards)

//---------------------------------- Deleting card details from stripe ----------------------------------//

router.post('/card/delete', auth, upload.none(), cardController.deleteCard)

//---------------------------------- Change default card  ----------------------------------//

router.post('/card/changeDefault', auth, upload.none(), cardController.changeDefaultCard)

module.exports = router
