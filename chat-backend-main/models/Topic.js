const mongoose = require('mongoose');

const TopicSchema = new mongoose.Schema({
    topicName: String,
    roomKey: String,
})

const Topic = mongoose.model('Topic', TopicSchema);

module.exports = Topic
