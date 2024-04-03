const mongoose = require('mongoose');

const ProcessSchema = new mongoose.Schema({
    result: String,
    from: {
        type: Object,
        required: true
    },
    to: String,
    imageSrc: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Process = mongoose.model('Process', ProcessSchema);

module.exports = Process;
