const mongoose = require('mongoose');

const tokenSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    token: {
        type: String,
        unique: true,
        required: true
    },
    status: {
        type: String,
        required: true,
        default: 'unused'
    },
    email: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model('Tokens', tokenSchema);