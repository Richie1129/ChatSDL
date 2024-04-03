const mongoose = require('mongoose');

const ResponseSchema = new mongoose.Schema({
  role: 
  {
  type: String,
  enum: ['assistant'], // 假設角色有 'user' 和 'assistant'
  required: true
  },
  content: String,
  time: String, 
  date: String,
  from: { // 發送者信息
    _id: mongoose.Schema.Types.ObjectId,
    name: String,
    email: String,
    status: String
  },
  optionText: { type: String, required: false }
})

const Response = mongoose.model('Response', ResponseSchema);

module.exports = Response;