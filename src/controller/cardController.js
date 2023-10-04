const mongoose = require('mongoose');
const Card = require('../models/card')
const User = require('../models/user')

async function add(req, res) {
  try {
    const { cardHolderName, cardNumber, expiryDate, cvv } = req.body
    const owner = new mongoose.Types.ObjectId(req.body.id);
    const cardDetails = {
      owner,
      cardHolderName,
      cardNumber,
      expiryDate,
      cvv,
    }

    const card = new Card(cardDetails)
    await card.save()

    const user = await User.findByIdAndUpdate(owner, { defaultCard: card._id })
    await user.save()
    res.status(201).send({ msg: `Card added successfully` })
  } catch (error) {

    switch (true) {
      case !!(error.keyPattern && error.keyPattern.cardNumber):
        return res.status(403).send({ msg: "Card is already registered" });
      case !!(error.errors && error.errors.cardHolderName):
        return res.status(400).send({ error: error.errors.cardHolderName.properties.message });
      case !!(error.errors && error.errors.cardNumber):
        return res.status(400).send({ error: error.errors.cardNumber.properties.message });
      case !!(error.errors && error.errors.cvv):
        return res.status(400).send({ error: error.errors.cvv.properties.message });
      default:
        res.status(500).send({ error: error.message })
    }
  }
}

async function fetchCards(req, res) {
  try {
    console.log(req.body)
    if (Object.keys(req.body).length === 0) {
      throw new Error("Please enter a valid data")
    }

    const userID = new mongoose.Types.ObjectId(req.body.id);

    const cards = await Card.find({ owner: userID })

    if (!cards.length) {
      res.status(404).send({ msg: `No users found !!` })
      return
    }

    res.send(cards)
  } catch (error) {
    res.status(500).send({ error: error.message })
  }
}

async function deleteCard(req, res) {
  try {

    const cardID = new mongoose.Types.ObjectId(req.body.id);
    const ownerID = new mongoose.Types.ObjectId(req.body.userID);

    const pipeline = [
      {
        $match: {
          owner: ownerID
        }
      },
      {
        $facet: {
          data: [{ $count: "cardCount" }],
          card: [{ $match: { _id: cardID } }],
          cards: [{ $match: { _id: { $ne: cardID }, owner: ownerID } }]
        },
      }
    ];

    const result = await Card.aggregate(pipeline)

    if (result[0].card.length === 0) {
      res.status(400).send({ msg: "Unauthorized card access" })
      return
    }

    const user = await User.findById(ownerID)

    if (result[0].data[0].cardCount === 1) {
      user.defaultCard = ''
    } else {
      user.defaultCard = result[0].cards[0]._id
    }

    await user.save()
    await Card.findByIdAndDelete(cardID);

    res.send({ msg: `Card deleted successfully :(` })
  } catch (error) {
    res.status(500).send({ error: error.message })
  }
}

module.exports = { add, fetchCards, deleteCard }