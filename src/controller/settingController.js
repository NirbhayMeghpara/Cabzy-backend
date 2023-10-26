const mongoose = require('mongoose')
const Setting = require("../models/setting")

async function edit(req, res) {
  try {
    if (Object.keys(req.body).length === 0) {
      throw new Error("Please provide valid input")
    }

    const _id = new mongoose.Types.ObjectId(req.body.id)
    const setting = await Setting.findById(_id)
    if (!setting) {
      res.status(404).send({ msg: `No settings found !!` })
      return
    }

    const updates = Object.keys(req.body)
    updates.forEach(update => setting[update] = req.body[update])

    await setting.save()
    res.send(setting)
  } catch (error) {
    res.status(500).send({ error: error.message })
  }
}

async function fetch(req, res) {
  try {
    const setting = await Setting.find({})
    if (!setting.length) return res.status(404).send({ error: 'No settings found' })

    res.send(setting)
  } catch (error) {
    res.status(500).send({ error: error.message })
  }
}

module.exports = { edit, fetch }