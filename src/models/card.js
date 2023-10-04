const mongoose = require("mongoose")

const cardSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    cardHolderName: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      validate(value) {
        if (!/^[a-zA-Z\s'-]+$/.test(value)) throw new Error("Please enter card holder name properly")
      },
    },

    cardNumber: {
      type: String,
      unique: true,
      required: true,
      trim: true,
      validate(value) {
        if (!/^[0-9]+$/.test(value) || value.length != 12) throw new Error(`Please enter a valid card number`)
      },
    },

    expiryDate: {
      type: String,
      trim: true,
      required: true,
    },

    cvv: {
      type: String,
      required: true,
      trim: true,
      validate(value) {
        if (!/^[0-9]+$/.test(value) || value.length != 3)
          throw new Error("Enter a valid cvv")
      },
    },
  }
)

const Card = mongoose.model("Card", cardSchema)

module.exports = Card
