require('../db/mongoose')
const Admin = require('../models/admin')

async function setupAdmin() {

  try {
    Admin.findOne().then((admin) => {
      if (!admin) {
        const admin = new Admin({
          email: "nirbhay_admin@cabzy.com",
          password: "nirbhay@admin"
        })
        admin.save()
        console.log('Admin created successfully !!')
      }
      else {
        console.log('Admin is already exists !!')
      }
    })
  }
  catch (error) {
    console.error('Error:', error)
  }
}

setupAdmin()