const City = require("../models/city")

async function add(req, res) {
  try {
    if (Object.keys(req.body).length === 0) {
      throw new Error("Please enter a valid city")
    }

    const city = await City(req.body)
    await city.save()
    res.send({ msg: `${req.body.name} created successfully !!` })
  } catch (error) {
    if (error.keyValue) {
      error.message = `${error.keyValue.name} is already created !!`
      return res.status(409).send({ error: error.message })
    }
    res.status(500).send({ error: error.message })
  }
}

module.exports = { add }