const express = require('express')

const router = new express.Router()

router.get('/', (req, res) => {
  res.send('Hello')
})

router.post('/register', (req, res) => {

})

module.exports = router