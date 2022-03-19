const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
    {
        order_id: {
            type: String,
            required: true,
            pattern: "^[0-9]*$", //Dont know if this is right or not
            maxLength: 8, //fixed length to 8 from the figma page example I saw
            trim: true
        },
        products: [
            {
                product_id: {
                    type: String,
                },
                quantity: {
                    type: Number,
                    default: 1
                }
            }
        ],
        amount: {
            type: Number,
            required: true
        },
        address: {
            type: Object,
            required: true
        },
        status: {
            type: String,
            default: "placed"
        }
    },
    //Dunno If shipment_address, billing_address should be differentiated
    //other possible values could be: is_paid, paid_at, is_delivered, delivered_at... should be added
    {
        timestamps: true
    }
);

module.exports = mongoose.model('order', orderSchema, 'order');