const router = require('express').Router();
const User = require('../models/User');

// creating user
router.post('/', async (req, res) => {
  try {
    const { name, email, password, picture } = req.body;
    console.log(req.body);
    const user = await User.create({ name, email, password, picture });
    res.status(201).json(user);
  } catch (e) {
    let msg;

    if (e.code == 11000) {
      msg = "User already exists"
    } else {
      msg = e.message;
    }
    console.log(e);
    res.status(400).json(msg)
  }
})

// login user

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findByCredentials(email, password);
    user.status = 'online';
    await user.save();
    res.status(200).json(user);
  } catch (e) {
    res.status(400).json(e.message)
  }
})

// router.get('/api/data/1', (req, res) => {
//   // 在這裡查詢 MongoDB 資料庫並且回傳特定一筆資料
//   const data = { id: 1, name: 'John Doe' };
//   res.json(data);
// });


module.exports = router
