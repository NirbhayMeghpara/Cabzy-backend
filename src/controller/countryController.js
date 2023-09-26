const Country = require("../models/country")

async function add(req, res) {
  console.log(req.body)
  try {
    if (Object.keys(req.body).length === 0) {
      throw new Error("Please provide valid input")
    }

    req.body.latLong = JSON.parse(req.body.latLong)

    const country = await Country(req.body)
    await country.save()
    res.send({ msg: `${req.body.name} added successfully` })
  } catch (error) {
    if (error.keyValue) {
      error.message = `${error.keyValue.name} is already added !!`
      return res.status(409).send({ error: error.message })
    }
    res.status(500).send({ error: error.message })
  }
}

async function fetch(req, res) {
  try {
    const countryData = await Country.find({})
    if (!countryData.length) {
      return res.send({ msg: 'No country data found' })
    }
    res.send(countryData)
  } catch (error) {
    res.status(500).send({ error: error.message })
  }
}

module.exports = { add, fetch }