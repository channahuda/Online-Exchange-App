require('dotenv').config()
const express =  require('express')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const cookieparser = require("cookie-parser")
const fileUpload = require("express-fileupload")


const app = express()
app.use(express.json())
app.use(cookieparser())
app.use(bodyParser.urlencoded({extended:true}));
app.use(fileUpload({
    useTempFiles: true
}))

const URI = process.env.MONGODB_URL
mongoose.connect(URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}, err => {
    if (err) throw err;
    console.log('Connected to MongoDB')
})


app.use('/user', require('./routes/userRouter'))
app.use('/ad', require('./routes/advertisementRouter'))

const PORT = process.env.PORT || 5000

app.listen(PORT, () =>{
    console.log('Server is running on port', PORT)
})