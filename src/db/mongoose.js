const mongoose = require("mongoose");

mongoose.connect("mongodb://127.0.0.1:27017/Cabzy")
  .then(() => {
    console.log('Connected successfully with database !!');
  })
  .catch(error => {
    console.error('Error : ' + error);
  });
