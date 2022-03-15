const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    contact: {
      type: Number,
      required: true,
  },
    password: {
        type: String,
        required: true
    },
    role: {
        type: Number,
        default: 2
    },
    province: {
    	type: String,
        required: true
    },
    city: {
    	type: String,
        required: true
    },
    ads: {
        type: Array,
        default: []
    },
    favourites: {
        type: Array,
        default: []
    },
    status:{
        type: String,
        default: 'active'
    },
}, {
    timestamps: true
})

module.exports = mongoose.model('user', userSchema, 'user')