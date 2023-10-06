const mongoose = require('mongoose')
const Driver = require('../models/driver')
const path = require('path')
const fs = require('fs')

const { capitalizeFirstLetter } = require('./vehiclePriceController')

async function add(req, res) {
  try {
    const { name, email, phoneCode, phone, city } = req.body
    if (!req.file) throw new Error("Profile image is required")

    const driverData = {
      name: capitalizeFirstLetter(name),
      profile: 'driver/' + req.file.filename,
      email,
      phoneCode,
      phone,
      city: capitalizeFirstLetter(city)
    }

    const driver = new Driver(driverData)
    await driver.save()
    res.status(201).send({ msg: `Welcome ${driver.name}, Driver added successfully` })
  } catch (error) {
    if (req.file) {
      const uploadPath = path.join(__dirname, "../../uploads")
      fs.unlinkSync(`${uploadPath}/driver/${req.file.filename}`)
    }

    switch (true) {
      case !!(error.keyPattern && error.keyPattern.email):
        return res.status(403).send({
          field: "email",
          msg: "Email is already registered",
        });
      case !!(error.keyPattern && error.keyPattern.phone):
        return res.status(403).send({
          field: "phone",
          msg: "Phone number is already registered",
        });
      case !!(error.errors && error.errors.name):
        return res.status(400).send({ error: error.errors.name.properties.message });
      case !!(error.errors && error.errors.email):
        return res.status(400).send({ error: error.errors.email.properties.message });
      case !!(error.errors && error.errors.phoneCode):
        return res.status(400).send({ error: error.errors.phoneCode.properties.message });
      case !!(error.errors && error.errors.phone):
        return res.status(400).send({ error: error.errors.phone.properties.message });
      default:
        res.status(500).send({ error: error.message })
    }
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
        data: [{ $count: "driverCount" }],
        drivers: [{ $skip: (currentPage - 1) * limit }, { $limit: limit }],
      },
    })

    const result = await Driver.aggregate(pipeline)

    if (!result[0].drivers.length) {
      res.status(404).send({ msg: `No drivers found !!` })
      return
    }

    const driverCount = result[0].data[0].driverCount
    const pageCount = Math.ceil(driverCount / limit)
    const drivers = result[0].drivers

    res.send({ driverCount, pageCount, drivers })
  } catch (error) {
    res.status(500).send({ error: error.message })
  }
}

async function edit(req, res) {
  try {
    if (!req.file) throw new Error("Profile image is required")
    const { id, ...remaining } = req.body;
    req.body = remaining;

    const _id = new mongoose.Types.ObjectId(id);
    const driver = await Driver.findById(_id)

    if (!driver) {
      res.status(404).send({ msg: `No such driver found !!` })
      return
    }
    const oldImage = driver.profile

    const updates = Object.keys(req.body)
    updates.forEach((update) => {
      driver[update] = req.body[update]
    })

    driver.name = capitalizeFirstLetter(req.body.name)
    driver.city = capitalizeFirstLetter(req.body.city)
    driver.profile = 'driver/' + req.file.filename
    await driver.save()

    const uploadPath = path.join(__dirname, "../../uploads")
    fs.unlinkSync(`${uploadPath}/${oldImage}`)

    res.status(200).send({ msg: `Driver edited successfully !!` })
  } catch (error) {
    if (req.file) {
      const uploadPath = path.join(__dirname, "../../uploads")
      fs.unlinkSync(`${uploadPath}/driver/${req.file.filename}`)
    }

    switch (true) {
      case !!(error.keyPattern && error.keyPattern.email):
        return res.status(403).send({
          field: "email",
          message: "Email is already registered",
        });
      case !!(error.keyPattern && error.keyPattern.phone):
        return res.status(403).send({
          field: "phone",
          message: "Phone number is already registered",
        });
      default:
        res.status(500).send({ error: error.message })
    }
  }
}

async function deleteDriver(req, res) {
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

async function changeDriverStatus(req, res) {
  try {
    const _id = new mongoose.Types.ObjectId(req.body.id);
    const driver = await Driver.findById(_id)
    if (!driver) {
      res.status(404).send({ msg: `No such driver found !!` })
      return
    }

    const status = req.body.status.toLowerCase()

    if (status === 'true') {
      driver.isApproved = true;
    } else if (status === 'false') {
      driver.isApproved = false;
    } else {
      res.status(400).send({ error: "Invalid driver status !!" })
    }

    await driver.save()
    res.send({ msg: `${driver.name} status is now ${driver.isApproved ? 'approved :)' : 'declined :('}` }
    )
  } catch (error) {
    res.status(500).send({ error: error.message })
  }
}

async function setServiceType(req, res) {
  try {
    const _id = new mongoose.Types.ObjectId(req.body.id);
    const driver = await Driver.findById(_id)
    if (!driver) {
      res.status(404).send({ msg: `No such driver found !!` })
      return
    }

    const serviceType = capitalizeFirstLetter(req.body.serviceType)
    driver.serviceType = serviceType

    await driver.save()
    res.send({ msg: `${serviceType} is assigned to ${driver.name}` }
    )
  } catch (error) {
    res.status(500).send({ error: error.message })
  }
}

async function removeServiceType(req, res) {
  try {
    const _id = new mongoose.Types.ObjectId(req.body.id);
    const driver = await Driver.findById(_id)
    if (!driver) {
      res.status(404).send({ msg: `No such driver found !!` })
      return
    }
    if (!driver.serviceType) {
      res.status(400).send({ error: `There is no service type assigned to ${driver.name}` })
      return
    }
    const serviceType = driver.serviceType
    driver.set({ serviceType: undefined });

    await driver.save()
    res.send({ msg: `${serviceType} is unassigned from ${driver.name}` })
  } catch (error) {
    res.status(500).send({ error: error.message })
  }
}

module.exports = { add, fetch, edit, deleteDriver, changeDriverStatus, setServiceType, removeServiceType }