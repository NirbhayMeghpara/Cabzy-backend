const mongoose = require('mongoose')
const CreateRide = require('../models/createRide')
const Counter = require('../models/counter')

async function create(req, res) {
  try {
    if (Object.keys(req.body).length === 0) {
      throw new Error("Please enter a valid city")
    }
    req.body.stops = JSON.parse(req.body.stops)
    req.body.rideID = await getNextSequenceValue('ride_id')

    const ride = new CreateRide(req.body)
    if (!ride) throw new Error("Something went wrong. Please try again !")

    await ride.save()
    res.send({ msg: `Ride is created successfully !!` })
  } catch (error) {
    res.status(500).send({ error: error.message })
  }
}

async function fetchAll(req, res) {
  try {
    const rideStatus = req.query.rideStatus ? JSON.parse(req.query.rideStatus) : null
    const pipeline = []

    if (rideStatus) {
      pipeline.push({
        $match: {
          status: { $in: rideStatus }
        }
      })
    }

    pipeline.push(
      {
        $lookup: {
          from: "users",
          localField: "userID",
          foreignField: "_id",
          as: "user"
        }
      },
      {
        $unwind: "$user"
      }
    )

    pipeline.push(
      {
        $lookup: {
          from: "cities",
          localField: "cityID",
          foreignField: "_id",
          as: "city"
        }
      },
      {
        $unwind: "$city"
      }
    )

    pipeline.push(
      {
        $lookup: {
          from: "vehicleprices",
          localField: "serviceTypeID",
          foreignField: "_id",
          as: "serviceType"
        }
      },
      {
        $unwind: "$serviceType"
      }
    )

    pipeline.push(
      {
        $lookup: {
          from: "drivers",
          localField: "driverID",
          foreignField: "_id",
          as: "driver"
        }
      },
      {
        $unwind: {
          path: "$driver",
          preserveNullAndEmptyArrays: true
        }
      }
    )

    const result = await CreateRide.aggregate(pipeline)

    res.send(result)
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
    const rideStatus = req.query.rideStatus ? JSON.parse(req.query.rideStatus) : null

    const pipeline = []

    if (rideStatus) {
      pipeline.push({
        $match: {
          status: { $in: rideStatus }
        }
      })
    }

    pipeline.push(
      {
        $lookup: {
          from: "users",
          localField: "userID",
          foreignField: "_id",
          as: "user"
        }
      },
      {
        $unwind: "$user"
      }
    )

    pipeline.push(
      {
        $lookup: {
          from: "cities",
          localField: "cityID",
          foreignField: "_id",
          as: "city"
        }
      },
      {
        $unwind: "$city"
      }
    )

    pipeline.push(
      {
        $lookup: {
          from: "vehicleprices",
          localField: "serviceTypeID",
          foreignField: "_id",
          as: "serviceType"
        }
      },
      {
        $unwind: "$serviceType"
      }
    )

    pipeline.push(
      {
        $lookup: {
          from: "drivers",
          localField: "driverID",
          foreignField: "_id",
          as: "driver"
        }
      },
      {
        $unwind: {
          path: "$driver",
          preserveNullAndEmptyArrays: true
        }
      }
    )

    const filter = []

    const from = req.query.rideDateFrom ? req.query.rideDateFrom.trim() : null
    const to = req.query.rideDateTo ? req.query.rideDateTo.trim() : null

    if (from && to) {
      filter.push({
        rideDate: {
          $gte: from,
          $lte: to
        }
      })
    } else if (from) {
      filter.push({
        rideDate: {
          $gte: from
        }
      })
    } else if (to) {
      filter.push({
        rideDate: {
          $lte: to
        }
      })
    }

    const vehicleType = req.query.vehicleType ? req.query.vehicleType.trim() : null
    if (vehicleType) {
      filter.push({
        "serviceType.vehicleType": vehicleType,
      })
    }

    const status = req.query.status ? parseInt(req.query.status.trim()) : null
    if (status) {
      filter.push({
        status: status,
      })
    }

    if (filter.length > 0) {
      pipeline.push({
        $match: {
          $and: filter,
        },
      })
    }

    if (searchValue) {
      const regex = new RegExp(searchValue, "i")
      pipeline.push({
        $match: {
          $or: [{ userName: regex }, { rideID: regex }, { pickUp: regex }, { dropOff: regex }, { "user.phone": regex }],
        },
      })
    }

    pipeline.push({
      $sort: {
        [sortBy]: sortOrder,
      },
    })

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
    const _id = new mongoose.Types.ObjectId(req.params.id)
    const driver = await Driver.findById(_id)
    if (!driver) {
      res.status(404).send({ msg: `No such driver found !!` })
      return
    }

    const uploadPath = path.join(__dirname, "../../uploads")
    fs.unlinkSync(`${uploadPath}/${driver.profile}`)

    const deletedDriver = await Driver.findByIdAndDelete(_id)
    res.send({ msg: `${deletedDriver.name} deleted successfully :(` })
  } catch (error) {
    res.status(500).send({ error: error.message })
  }
}

async function feedback(req, res) {
  try {
    if (Object.keys(req.body).length === 0) {
      throw new Error("Please enter a valid city")
    }

    const _id = new mongoose.Types.ObjectId(req.body.id)
    const ride = await CreateRide.findById(_id)

    ride.rating = req.body.rating
    ride.feedback = req.body.feedback

    await ride.save()
    res.send({ msg: "Thanks for sharing your experience :)" })
  } catch (error) {
    res.status(500).send({ error: error.message })
  }
}

async function getNextSequenceValue(sequenceName) {
  const counter = await Counter.findOneAndUpdate(
    { _id: sequenceName },
    { $inc: { sequence_value: 1 } },
    { new: true, upsert: true }
  )
  return counter.sequence_value
}

module.exports = { create, fetchAll, fetch, deleteRide, feedback, getNextSequenceValue }