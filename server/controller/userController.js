const User = require('../model/userModel')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const userController = {
    register: async (req,res) => {
        try {

            const {name, email, contact, password, province, city} = req.body;

            if(req?.body?.role != 2){
                return res.status(401).json({error:{code: res.statusCode, msg: 'You do not have permission to access this resource'}, data: null}) 
            }

            const user = await User.findOne({email})

            if (user) return res.status(409).json({error:{code: res.statusCode, msg: 'Email already exists'}, data: null}) 

            if (password.length < 8) return res.status(400).json({error:{code: res.statusCode, msg: 'Password must be atleaast 8 characters long'}, data: null}) 

            const hashedPassword = await bcrypt.hash(password, 10)

            const newUser = new User({name, email, contact, password: hashedPassword, province, city})

            await newUser.save()


            res.json({msg: "Registered Successfully!"})
            

        } catch (err) {
            return res.status(500).json({error:{code: res.statusCode, msg: 'Interval Server Error'}, data: null}) 
        }
    },

    login: async (req,res) => {
        try {
            const {email, password} = req.body

            const user = await User.findOne({email})

            if (!user) return res.status(401).json({error:{code: res.statusCode, msg: 'Email does not exist'}, data: null}) 

            const comparePassword = await bcrypt.compare(password, user.password)

            if (!comparePassword) return res.status(401).json({error:{code: res.statusCode, msg: 'Incorrect password'}, data: null}) 


            const accessToken = createAccessToken({id: user._id})
            const refreshToken = createRefreshToken({id: user._id})

            res.cookie('refreshtoken', refreshToken, {
                httpOnly: true,
                path: '/user/refresh_token',
                maxAge: 7*24*60*60*1000
            })

            res.json({error:{code: null, msg: null}, data:{accessToken: accessToken, refreshToken: refreshToken}})

        } catch (error) {
            return res.status(500).json({error:{code: res.statusCode, msg: 'Interval Server Error'}, data: null}) 
        }
        
    },

    getUserInfo: async (req, res) => {
        try {
            const user = await User.findById(req.user.id).select("-password")
            if (!user) return res.status(404).json({error:{code: res.statusCode, msg: 'User does not exist'}, data: null}) 

            if(user.role === 1){ //if user is admin

                if(!req.params.id) // if no id, return error
                    return res.status(404).json({error:{code: res.statusCode, msg: 'User ID missing'}, data: null}) 
                

                //if id, return signed in user info
                const user = await User.findById(req.params.id)
                if (!user) return res.status(404).json({error:{code: res.statusCode, msg: 'User does not exist'}, data: null}) 
                return res.status(200).json({error:{code: null, msg: null}, data: user}) 
                
            }

            else if (user.role === 2){// user is customer

                if(!req.params.id){ // id is not present, return signed in user info
                    return res.status(500).json({error:{code: null, msg: null}, data: user}) 
                }

                //id is present, return that user's info
                const user = await User.findById(req.params.id)
                if (!user) return res.status(404).json({error:{code: res.statusCode, msg: 'User does not exist'}, data: null}) 
                
                return res.status(200).json({error:{code: null, msg: null}, data: user}) 
                
            }      
        } catch (error) {
            return res.status(500).json({error:{code: res.statusCode, msg: 'Interval Server Error'}, data: null}) 
        }
    },

    getAllUsers: async (req, res) => {
        try {
            const all_users = await User.find().select("-password")
                if (!all_users) return res.status(404).json({error:{code: res.statusCode, msg: 'No user found'}, data: null}) 
             
            
                return res.status(200).json({error:{code: null, msg: 'null'}, data: all_users}) 
                
            
    
        } catch (error) {
            return res.status(500).json({error:{code: res.statusCode, msg: 'Interval Server Error'}, data: null})  
        }
    },

    refreshToken: (req,res) =>{
        try {
            const rf_token = req.cookies.refreshtoken;
            if(!rf_token) return res.status(404).json({error:{code: res.statusCode, msg: 'Please login or register'}, data: null}) 


            jwt.verify(rf_token, process.env.REFRESH_TOKEN_SECRET, (err, user) =>{
                if(err) return res.status(500).json({error:{code: res.statusCode, msg: 'Please login or register'}, data: null}) 


                const accessToken = createAccessToken({id: user.id})
                return res.status(200).json({error:{code: null, msg: null}, data: accessToken}) 
            })

        } catch (err) {
            return res.status(500).json({error:{code: res.statusCode, msg: 'Interval Server Error'}, data: null})  
        }
    },

    logout: async (req,res) => {
        try {
            res.clearCookie('refreshtoken', {path: '/user/refresh_token'})
            return res.status(200).json({error:{code: null, msg: null}, data: null}) 
        }
        catch(err){
            return res.status(500).json({error:{code: res.statusCode, msg: 'Interval Server Error'}, data: null})  
        }
    },

    updateUserInfo: async (req,res) => {
        try {
            const user = await User.findById(req.user.id)
            if (!user) return res.status(404).json({error:{code: res.statusCode, msg: 'No user found'}, data: null}) 

            if(user.role === 1){ //if user is admin

                if(!req.params.id){ // if no id, error
                    return res.status(400).json({error:{code: res.statusCode, msg: 'You are not authorized to access this resource'}, data:null}) 
                }

                const status = req.body.status;
                await User.findOneAndUpdate({_id: req.params.id}, status)

                return res.status(200).json({error:{code: null, msg: null}, data: user}) 
            }

            else if (user.role === 2){// user is customer

                if(req.params.id){ // id is present   
                    return res.status(400).json({error:{code: res.statusCode, msg: 'You are not authorized to access this resource'}, data:null}) 
                }
                //id is not present, update signed in user info
                const {name, contact, password, province, city, ads, favourites, status} = req.body;
                await User.findOneAndUpdate({_id: req.user.id}, {name, contact, password, province, city, ads, favourites,status});
                return res.status(200).json({error:{code: null, msg: null}, data: user}) 
            }  
            
        } catch (error) {
            return res.status(500).json({error:{code: res.statusCode, msg: 'Interval Server Error'}, data: null})  
        }
    }
}

    const createAccessToken = (user) => {
        return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {expiresIn: '30m'})
    }

    const createRefreshToken = (user) => {
        return jwt.sign(user, process.env.REFRESH_TOKEN_SECRET, {expiresIn: '7d'})
    }


module.exports = userController