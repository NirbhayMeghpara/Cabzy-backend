const express = require("express")
const Admin = require("../models/admin")
const auth = require("../middleware/auth")

const router = new express.Router()

router.post("/login", async (req, res) => {
  try {
    const admin = await Admin.findByCredentials(req.body.email, req.body.password)
    const token = await admin.genToken()

    res.send({ admin, token })
  } catch (error) {
    res.status(401).send({ error: error.message })
  }
})

router.get("/logout", auth, async (req, res) => {
  try {
    req.admin.tokens = req.admin.tokens.filter((item) => item.token !== req.token)
    await req.admin.save()

    res.send({ msg: "Admin logout successfully !!" })
  } catch (error) {
    res.status(500).send("Internal error occurred while logging out")
  }
})

router.post('/logoutAll', auth, async (req, res) => {
  try {
    req.admin.tokens = []
    await req.admin.save()
    res.send({ msg: "All session logged out successfully" })
  } catch (error) {
    res.status(500).send("Internal error occurred while logging out")
  }
})

module.exports = router
