const User = require('../model/userModel')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const userController = {
    register: async (req,res) => {
        try {

            const {name, email, contact, password, province, city, role} = req.body;

            if(req?.body?.role != 2){
                return res.status(401).json({msg: "You do not have permission to access this resource"})
            }

            const user = await User.findOne({email})

            if (user) 
                return res.status(400).json({msg: "Email already exists"})

            if (password.length < 8)
                return res.status(400).json({msg: "Password must be atleast 8 characters long"})

            const hashedPassword = await bcrypt.hash(password, 10)

            const newUser = new User({name, email, contact, password: hashedPassword, province, city})

            await newUser.save()


            res.json({msg: "Registered Successfully!"})
            

        } catch (err) {
            return res.status(500).json({msg: err.message})
        }
    },

    login: async (req,res) => {
        try {
            const {email, password} = req.body

            const user = await User.findOne({email})

            if (!user)
                return res.status(400).json({msg: "Email doesnot exist"})

            const comparePassword = await bcrypt.compare(password, user.password)

            if (!comparePassword)
                return res.status(400).json({msg: "Incorrect password"})

            const accessToken = createAccessToken({id: user._id})
            const refreshToken = createRefreshToken({id: user._id})

            res.cookie('refreshtoken', refreshToken, {
                httpOnly: true,
                path: '/user/refresh_token',
                maxAge: 7*24*60*60*1000
            })

            res.json({msg: "Logged in!", accessToken: accessToken, refreshToken: refreshToken})

        } catch (error) {
            res.status(400).json({msg: error.message})
        }
        
    },

    getUserInfo: async (req, res) => {
        try {
            const user = await User.findById(req.user.id)
            if (!user) return res.status(400).json({msg: 'User doesnot exist'})

            if(user.role === 1){ //if user is admin

                if(!req?.query?.id){ // if no id, return all users
                    const all_users = await User.find()
                    res.json(all_users)
                }

                //if id, return signed in user info
                const user = await User.findById(req.query.id)
                if (!user) return res.status(400).json({msg: 'User does not exist'})
                res.json(user)
                
            }

            else if (user.role === 2){// user is customer
                
                if(req?.query?.id){ // id is present      
                // for now, later a signed in user will need another seller's info    
                    return res.status(401).json({msg: 'You are not allowed to access this resource'})   
                }
                //id is not present, return signed in user info
                res.json(user)
            }      
        } catch (error) {
            return res.status(500).json({msg: error.message})
        }
    },

    refreshToken: (req,res) =>{
        try {
            const rf_token = req.cookies.refreshtoken;
            if(!rf_token) return res.status(400).json({msg: "Please login or register"})

            jwt.verify(rf_token, process.env.REFRESH_TOKEN_SECRET, (err, user) =>{
                if(err) return res.status(400).json({msg: "Please login or register"})

                const accessToken = createAccessToken({id: user.id})
                res.json({user,accessToken})
            })

        } catch (err) {
            return res.status(500).json({msg: err.message})
        }
    },

    logout: async (req,res) => {
        try {
            res.clearCookie('refreshtoken', {path: '/user/refresh_token'})
            return res.status(200).json({msg:"Logged Out"})
        }
        catch(err){
            return res.status(500).json({msg: err.message})
        }
    },

    updateUserInfo: async (req,res) => {
        try {
            const user = await User.findById(req.user.id)
            if (!user) return res.status(400).json({msg: 'User doesnot exist'})

            if(user.role === 1){ //if user is admin

                if(!req?.query?.id){ // if no id, return all users
                    return res.status(403).json({msg: 'You are not authorized to access this resource'}) 
                }

                //if id, update user info
                const status = req.body.status;
                await User.findOneAndUpdate({_id: req.query.id}, status)
                res.json({msg: "User updated"})                
            }

            else if (user.role === 2){// user is customer

                if(req?.query?.id){ // id is present   
                    return res.status(403).json({msg: 'You are not allowed to access this resource'})   
                }
                //id is not present, update signed in user info
                const {name, contact, password, province, city, ads, favourites} = req.body;
                await User.findOneAndUpdate({_id: req.user.id}, {name, contact, password, province, city, ads, favourites});
                res.json({msg: "User updated"})
            }  
            
        } catch (error) {
            res.status(500).json({msg: error.message})
        }
    },

    updateUserStatus: async (req,res) => {
        try {
        } catch (error) {
            res.status(500).json({msg: error.message})
        }
    },

    getUserInfoForAdmin: async (req, res) => {
        try {
            const user = await User.findById(req.params.id)

            if (!user) return res.status(400).json({msg: 'User doesnot exist'})

            res.json(user)
        } catch (error) {
            return res.status(500).json({msg: error.message})
        }
    },

    deleteUser: async (req,res) => {
        try {
            if(req.body.role != 2){
                return res.status(403).json({msg: "You do not have permission to access this resource"})
            }

            await User.deleteOne({_id: req.user.id})

        res.json({msg: "User deleted"})
        } catch (error) {
            res.status(500).json({msg: err.message})
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