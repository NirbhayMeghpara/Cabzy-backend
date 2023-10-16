const mongoose = require('mongoose')
const CreateRide = require('../models/createRide')

async function create(req, res) {
  try {
    if (Object.keys(req.body).length === 0) {
      throw new Error("Please enter a valid city")
    }
    req.body.stops = JSON.parse(req.body.stops)

    const ride = new CreateRide(req.body)
    if (!ride) throw new Error("Something went wrong. Please try again !")

    await ride.save()
    res.send({ msg: `Ride is created successfully !!` })
  } catch (error) {
    res.status(500).send({ error: error.message })
  }
}

async function fetch(req, res) {
  try {
    const currentPage = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 4
    const searchValue = req.query.search ? req.query.search.trim() : ""
    const sortBy = req.query.sort ? req.query.sort.trim() : "createdBy" // Default sorting field is 'createdBy'
    const sortOrder = req.query.sortOrder === "desc" ? -1 : 1 // Default is ascending order

    const pipeline = []

    if (searchValue) {
      const regex = new RegExp(searchValue, "i")
      pipeline.push({
        $match: {
          $or: [{ name: regex }, { email: regex }, { phoneCode: regex }, { phone: regex }],
        },
      })
    }

    pipeline.push({
      $sort: {
        [sortBy]: sortOrder,
      },
    });

    pipeline.push({
      $facet: {
        data: [{ $count: "rideCount" }],
        rides: [{ $skip: (currentPage - 1) * limit }, { $limit: limit }],
      },
    })

    const result = await CreateRide.aggregate(pipeline)

    if (!result[0].rides.length) {
      res.status(404).send({ msg: `No rides found !!` })
      return
    }

    const rideCount = result[0].data[0].rideCount
    const pageCount = Math.ceil(rideCount / limit)
    const rides = result[0].rides

    res.send({ rideCount, pageCount, rides })
  } catch (error) {
    res.status(500).send({ error: error.message })
  }
}

async function deleteRide(req, res) {
  try {
    const _id = new mongoose.Types.ObjectId(req.params.id);
    const driver = await Driver.findById(_id)
    if (!driver) {
      res.status(404).send({ msg: `No such driver found !!` })
      return
    }

    const uploadPath = path.join(__dirname, "../../uploads")
    fs.unlinkSync(`${uploadPath}/${driver.profile}`)

    const deletedDriver = await Driver.findByIdAndDelete(_id);
    res.send({ msg: `${deletedDriver.name} deleted successfully :(` })
  } catch (error) {
    res.status(500).send({ error: error.message })
  }
}

module.exports = { create, fetch, deleteRide }