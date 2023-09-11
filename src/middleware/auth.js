const jwt = require('jsonwebtoken')
const Admin = require('../models/admin')

async function auth(req, res, next) {
  try {
    const token = req.header('Authorization').replace('Bearer ', '')
    const msg = jwt.verify(token, 'nirbhay@cabzy')
    const admin = await Admin.findOne({
      _id: msg._id,
      "tokens.token": token,  // This will verify that the token exists in tokens array
    })

    if (!admin) throw new Error()

    req.token = token
    req.admin = admin
    next()

  } catch (e) {
    res.status(401).send({ error: 'Unauthorized Access' })
  }
}

module.exports = auth