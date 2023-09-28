
const VehiclePrice = require("../models/vehiclePrice")

async function addPrice(req, res) {
  try {
    if (Object.keys(req.body).length === 0) {
      throw new Error("Please enter a valid city")
    }

    req.body.country = capitalizeFirstLetter(req.body.country)
    req.body.city = capitalizeFirstLetter(req.body.city)
    req.body.vehicleType = capitalizeFirstLetter(req.body.vehicleType)

    const { city, vehicleType } = req.body
    const duplicateVehicleType = await VehiclePrice.findOne({ city, vehicleType });

    if (duplicateVehicleType) {
      res.status(409).send({ msg: `${duplicateVehicleType.vehicleType} pricing already added in ${duplicateVehicleType.city} city` });
      return
    }

    const vehiclePrice = new VehiclePrice(req.body);
    await vehiclePrice.save();

    res.send({ msg: `${vehiclePrice.vehicleType} pricing added for ${vehiclePrice.city} city` })
  } catch (error) {
    if (error.errors.driverProfit) {
      return res.status(400).send({ error: error.errors.driverProfit.properties.message });
    }
    if (error.errors.maxSpace) {
      return res.status(400).send({ error: error.errors.maxSpace.properties.message });
    }
    res.status(500).send({ error: error.message });
  }
}

async function fetchPrice(req, res) {
  try {
    if (Object.keys(req.body).length === 0) {
      throw new Error("Please enter a valid city")
    }
  }
  catch (error) {
    res.status(500).send({ error: error.message })
  }
}

function capitalizeFirstLetter(word) {
  return word.charAt(0).toUpperCase() + word.slice(1);
}

module.exports = { addPrice, fetchPrice }