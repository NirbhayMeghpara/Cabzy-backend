const mongoose = require('mongoose')
const User = require('../models/user')
require('dotenv').config()
const stripe = require('stripe')(process.env.STRIPE_KEY)

async function add(req, res) {
  try {
    const token = req.body.token
    const owner = new mongoose.Types.ObjectId(req.body.id)

    let userStripeID
    const user = await User.findById(owner)
    if (!user.stripeID) {
      const customer = await stripe.customers.create({
        name: user.name,
        email: user.email,
        phone: user.phone
      })

      if (!customer) {
        res.status(500).send({ error: "User not created successfully in stripe" })
        return
      }
      user.stripeID = customer.id
      userStripeID = customer.id
    }

    userStripeID = user.stripeID
    const source = await stripe.customers.createSource(userStripeID, { source: token })
    if (!source) {
      res.status(500).send({ error: "Card not added to Stripe customer" })
      return
    }

    user.cards.push(source.id)
    await user.save()
    res.status(201).send({ msg: `Card added successfully` })
  } catch (error) {
    res.status(500).send({ error: error.message })
  }
}

async function fetchCards(req, res) {
  try {
    if (Object.keys(req.body).length === 0) {
      throw new Error("Please enter a valid data")
    }
    const userID = new mongoose.Types.ObjectId(req.body.id)

    const user = await User.findById(userID)
    if (!user.cards.length) {
      res.status(404).send({ error: 'No card available. Please add card' })
      return
    }

    const cards = await stripe.customers.listSources(user.stripeID, { object: 'card' })
    const customer = await stripe.customers.retrieve(user.stripeID)
    res.send({ cards: cards.data, defaultCard: customer.default_source })
  } catch (error) {
    res.status(500).send({ error: error.message })
  }
}

async function deleteCard(req, res) {
  try {
    const cardID = req.body.cardID
    const userID = new mongoose.Types.ObjectId(req.body.userID)

    const user = await User.findById(userID)
    if (!(user.stripeID && user.cards.includes(cardID))) {
      res.status(400).send({ error: 'Unauthorized Card Access' })
      return
    }

    const response = await stripe.customers.deleteSource(user.stripeID, cardID)
    if (!response.deleted) {
      res.status(500).send({ error: "Error occured while deleting card !!" })
      return
    }

    user.cards = user.cards.filter(id => id.toString() !== cardID.toString())
    await user.save()
    res.send({ msg: `Card deleted successfully :(` })
  } catch (error) {
    res.status(500).send({ error: error.message })
  }
}

async function changeDefaultCard(req, res) {
  try {
    if (Object.keys(req.body).length === 0) {
      throw new Error("Please enter a valid data")
    }
    const newCardID = req.body.cardID
    const userID = new mongoose.Types.ObjectId(req.body.userID)

    const user = await User.findById(userID)
    if (!(user.stripeID && user.cards.includes(newCardID))) {
      res.status(400).send({ error: 'Unauthorized Card Access' })
      return
    }

    const response = await stripe.customers.update(user.stripeID, { default_source: newCardID })
    if (!response) {
      res.status(500).send({ error: "Error occured while updating card as default !!" })
      return
    }

    res.send({ msg: `Default card updated successfully` })
  } catch (error) {
    res.status(500).send({ error: error.message })
  }
}

module.exports = { add, fetchCards, deleteCard, changeDefaultCard }