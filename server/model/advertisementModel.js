const mongoose = require('mongoose')


const advertisementSchema = new mongoose.Schema({
    name:{
        type: String,
        trim: true,
        required: true
    },
    price:{
        type: Number,
        trim: true,
        required: true
    },
    description:{
        type: String,
        required: true
    },
    image:{
        type: Object,
        required: true
    },
    category:{
        type: String,
        required: true
    },
    sub_category:{
        type: String,
        required: true
    },
    status:{
        type: String,
        required: true
    },
    area:{
        type: String,
        required: true
    },
    city:{
        type: String,
        required: true
    },
    province:{
        type: String,
        required: true
    }
}, {
    timestamps: true 
})


module.exports = mongoose.model('advertisement', advertisementSchema, 'advertisement')