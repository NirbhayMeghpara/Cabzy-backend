require('../db/mongoose')
const Setting = require('../models/setting')

async function setupSetting() {

  try {
    Setting.findOne().then((setting) => {
      if (!setting) {
        const setting = new Setting({ driverTimeout: '30', stops: '1' })
        setting.save()
        console.log('Setting created successfully !!')
      }
      else {
        console.log('Setting is already exists !!')
      }
    })
  }
  catch (error) {
    console.error('Error:', error)
  }
}

setupSetting()