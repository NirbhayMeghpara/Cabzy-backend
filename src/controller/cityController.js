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
      const places = req.body.location.split(",")
      const city = places[0].trim()

      error.message = `${city} is already created !!`
      return res.status(409).send({ error: error.message })
    }
    res.status(500).send({ error: error.message })
  }
}

async function fetchCity(req, res) {
  try {
    const country = decodeURIComponent(req.params.country).toLowerCase();

    const cities = await City.aggregate([{ $match: { country } }])
    if (!cities.length) {
      res.status(404).send({ msg: "No City Available" })
      return
    }

    res.send(cities)
  } catch (error) {
    res.status(500).send({ error: error.message })
  }
}

module.exports = { add, fetchCity }