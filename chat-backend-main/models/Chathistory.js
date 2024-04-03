// const mongoose = require('mongoose');

// const ChathistorySchema = new mongoose.Schema({
//   role: {String, enum: ['user', 'system', 'assistant']},
//   content: String,
//   from: Object,
//   socketid: String,
//   time: String, 
//   date: String,
// })

// const Chathistory = mongoose.model('Chathistory', ChathistorySchema);

// module.exports = Chathistory;
const mongoose = require('mongoose');

const chathistorySchema = new mongoose.Schema({
  content: String, // 消息內容
  time: String, // 發送時間
  date: String, // 發送日期
  role: { // 發送者角色
    type: String,
    enum: ['user', 'assistant'], // 假設角色有 'user' 和 'assistant'
    required: true
  },
  from: { // 發送者信息
    _id: mongoose.Schema.Types.ObjectId,
    name: String,
    email: String,
    status: String
  },
  optionText: { type: String, required: false },
  socketid: String // socket ID
});

const Chathistory = mongoose.model('Chathistory', chathistorySchema);

module.exports = Chathistory;
