const mongoose = require('mongoose')
const User = require('../models/user')
const path = require('path')
const fs = require('fs')
const { capitalizeFirstLetter } = require('./vehiclePriceController')

async function add(req, res) {
  try {
    const { name, email, phoneCode, phone } = req.body
    if (!req.file) throw new Error("Profile image is required")

    const userData = {
      name: capitalizeFirstLetter(name),
      profile: 'user/' + req.file.filename,
      email,
      phoneCode,
      phone,
    }

    const user = new User(userData)
    await user.save()
    res.status(201).send({ msg: `Welcome ${user.name}, User added successfully` })
  } catch (error) {
    if (req.file) {
      const uploadPath = path.join(__dirname, "../../uploads")
      fs.unlinkSync(`${uploadPath}/user/${req.file.filename}`)
    }


    console.log(error)

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
  const currentPage = parseInt(req.query.page) || 1
  const limit = parseInt(req.query.limit) || 5
  const searchValue = req.query.search ? req.query.search.trim() : ""

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
    $facet: {
      data: [{ $count: "userCount" }],
      users: [{ $skip: (currentPage - 1) * limit }, { $limit: limit }],
    },
  })

  try {
    const result = await User.aggregate(pipeline)

    if (!result[0].users.length) {
      throw new Error("No user found")
    }

    const userCount = result[0].data[0].userCount
    const pageCount = Math.ceil(userCount / limit)
    const users = result[0].users

    res.send({ userCount, pageCount, users })
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
    const user = await User.findById(_id)

    if (!user) {
      res.status(404).send({ msg: `No such user found !!` })
      return
    }
    const oldImage = user.profile

    const updates = Object.keys(req.body)
    updates.forEach((update) => {
      user[update] = req.body[update]
    })

    user.name = capitalizeFirstLetter(req.body.name)
    user.profile = 'user/' + req.file.filename
    await user.save()

    const uploadPath = path.join(__dirname, "../../uploads")
    fs.unlinkSync(`${uploadPath}/${oldImage}`)

    res.status(200).send({ msg: `User edited successfully !!` })
  } catch (error) {
    if (req.file) {
      const uploadPath = path.join(__dirname, "../../uploads")
      fs.unlinkSync(`${uploadPath}/user/${req.file.filename}`)
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

async function deleteUser(req, res) {
  try {
    const _id = new mongoose.Types.ObjectId(req.params.id);
    const user = await User.findByIdAndDelete(_id);

    if (!user) {
      res.status(404).send({ msg: `No such user found !!` })
      return
    }

    const uploadPath = path.join(__dirname, "../../uploads")
    fs.unlinkSync(`${uploadPath}/${user.profile}`)

    res.send({ msg: `${user.name} deleted successfully :(` })
  } catch (error) {
    res.status(500).send({ error: error.message })
  }
}

module.exports = { add, fetch, edit, deleteUser }