const mongoose = require('mongoose');

const StatisticsSchema = new mongoose.Schema({
    from: {
        type: Object,
        required: true
    },
    to: String,
    count: {
        type: Number,
        required: true
    }

});

const Statistics = mongoose.model('Statistics', StatisticsSchema);

module.exports = Statistics;