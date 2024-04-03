const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(`mongodb+srv://Richie:0921457822@richie.tvdyx.mongodb.net/`, () => {
  console.log('connected to mongodb')
})

//  test 為此 cluster 中的 database 