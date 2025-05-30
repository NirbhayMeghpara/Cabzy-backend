const mongoose = require("mongoose")
const City = require("../models/city")

async function add(req, res) {
  try {
    if (Object.keys(req.body).length === 0) {
      throw new Error("Please enter a valid city")
    }
    const places = req.body.location.split(",")
    const cityName = places[0].trim()

    const arrayOfObjects = JSON.parse(req.body.coordinates)
    const linearRing = arrayOfObjects.map(point => [point.lng, point.lat])
    // Add the first point as the last point
    linearRing.push(linearRing[0])

    // GeoJSON Polygon type
    const coordinates = {
      type: 'Polygon',
      coordinates: [linearRing]
    }

    const city = await City({
      name: cityName,
      country: req.body.country,
      location: req.body.location,
      coordinates
    })
    await city.save()
    res.send({ msg: `${cityName} created successfully !!` })
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

async function fetchAllCity(req, res) {
  try {
    const country = decodeURIComponent(req.params.country).toLowerCase()

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

async function fetchCity(req, res) {
  try {
    const country = decodeURIComponent(req.params.country).toLowerCase()
    const page = parseInt(req.query.page) || 1
    const limit = 4
    const skip = (page - 1) * limit

    const result = await City.aggregate([
      { $match: { country } },
      {
        $facet: {
          data: [{ $count: "totalCities" }],
          cities: [{ $skip: skip }, { $limit: limit }],
        },
      },
    ])

    if (!result[0].cities.length) {
      res.status(404).send({ msg: "No City Available" })
      return
    }

    const convertedCities = result[0].cities.map(city => {
      // City has coordinates in GeoJSON Polygon format
      const arrayOfObjects = city.coordinates.coordinates[0].map(coord => ({
        lat: coord[1],
        lng: coord[0]
      }))
      return { ...city, coordinates: arrayOfObjects }
    })

    const cityCount = result[0].data[0].totalCities
    const cities = convertedCities

    res.send({ cityCount, cities })
  } catch (error) {
    res.status(500).send({ error: error.message })
  }
}

async function edit(req, res) {
  try {
    if (Object.keys(req.body).length === 0) {
      throw new Error("Please provide valid input")
    }

    const _id = new mongoose.Types.ObjectId(req.body.id)
    const city = await City.findById(_id)
    if (!city) {
      res.status(404).send({ msg: "No such city found !!" })
      return
    }

    const arrayOfObjects = JSON.parse(req.body.coordinates)
    const linearRing = arrayOfObjects.map(point => [point.lng, point.lat])

    // Add the first point as the last point
    linearRing.push(linearRing[0])

    // GeoJSON Polygon type
    const coordinates = {
      type: 'Polygon',
      coordinates: [linearRing]
    }

    city.coordinates = coordinates
    await city.save()
    res.send({ msg: `${city.name} edited successfully` })
  } catch (error) {
    res.status(500).send({ error: error.message })
  }
}

async function findCity(req, res) {
  try {
    const lat = parseFloat(req.body.lat)
    const lng = parseFloat(req.body.lng)

    const result = await City.find({
      coordinates: {
        $geoIntersects: {
          $geometry: {
            type: "Point",
            coordinates: [lng, lat],
          },
        },
      },
    })

    res.send(result)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

module.exports = { add, fetchAllCity, fetchCity, edit, findCity }
