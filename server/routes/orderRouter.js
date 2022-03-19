const router = require("express").Router();
const orderController = require("../controller/orderController")
const authorization = require('../middleware/authorization')

router.post('/place/:id?', authorization, orderController.placeOrder)

router.get('/retrieve/:id?', authorization, orderController.retrieveOrder)

router.delete('/delete/:id?', authorization, orderController.deleteOrder)

module.exports = router