
const mongoose = require("mongoose")
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
    const city = capitalizeFirstLetter(decodeURIComponent(req.params.city))
    const page = parseInt(req.query.page) || 1;
    const limit = 4;

    const skip = (page - 1) * limit;

    const result = await VehiclePrice.aggregate([
      { $match: { city } },
      {
        $facet: {
          data: [
            { $count: 'totalPrices' }
          ],
          pricing: [
            { $skip: skip },
            { $limit: limit }
          ]
        }
      }
    ]);

    if (!result[0].pricing.length) {
      res.status(404).send({ msg: `No pricing available for ${city}` })
      return
    }
    const pricingCount = result[0].data[0].totalPrices
    const pricing = result[0].pricing

    res.send({ pricingCount, pricing })
  } catch (error) {
    res.status(500).send({ error: error.message })
  }
}


async function editPrice(req, res) {
  try {
    if (Object.keys(req.body).length === 0) {
      throw new Error("Please provide vehicle pricing")
    }

    const _id = new mongoose.Types.ObjectId(req.body.id);
    const vehiclePricing = await VehiclePrice.findById(_id)
    if (!vehiclePricing) {
      res.status(404).send({ msg: `No such vehicle type found !!` })
      return
    }
    vehiclePricing.driverProfit = req.body.driverProfit
    vehiclePricing.minFare = req.body.minFare
    vehiclePricing.basePriceDistance = req.body.basePriceDistance
    vehiclePricing.basePrice = req.body.basePrice
    vehiclePricing.unitDistancePrice = req.body.unitDistancePrice
    vehiclePricing.unitTimePrice = req.body.unitTimePrice
    vehiclePricing.maxSpace = req.body.maxSpace
    await vehiclePricing.save()
    res.send({ msg: `${vehiclePricing.vehicleType} edited successfully` })
  } catch (error) {
    console.log(error)
    if (error.errors.driverProfit) {
      return res.status(400).send({ error: error.errors.driverProfit.properties.message });
    }
    if (error.errors.maxSpace) {
      return res.status(400).send({ error: error.errors.maxSpace.properties.message });
    }
    res.status(500).send({ error: error.message });
  }
}

function capitalizeFirstLetter(word) {
  return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
}

module.exports = { addPrice, fetchPrice, editPrice }