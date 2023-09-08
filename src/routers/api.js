const express = require('express')
const Admin = require('../models/admin')

const router = new express.Router()

router.post('/login', async (req, res) => {
  try {
    const admin = await Admin.findByCredentials(req.body.email, req.body.password)


    res.send(admin)

  } catch (error) {
    res.status(401).send({ error })
  }
})

module.exports = router