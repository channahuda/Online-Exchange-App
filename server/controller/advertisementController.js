const Ad = require('../model/advertisementModel')
const User = require('../model/userModel')
const cloudinary = require('cloudinary')
const fs = require('fs')

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET
})

const advertisementController =  {
    getAdInfo: async (req, res) => {
        try {
            if(!req.params.id) // if no id, return error
                return res.status(404).json({error:{code: res.statusCode, msg: 'Ad ID missing'}, data: null}) 
        
            
            const ad = await Ad.findById(req.params.id)
            if (!ad) return res.status(404).json({error:{code: res.statusCode, msg: 'No Ad found'}, data: null}) 
            return res.status(200).json({error:{code: null, msg: null}, data: ad})

        } catch (error) {
                return res.status(500).json({error:{code: error.code, msg: err.msg}, data: null}) 

        }
    },
    getAllAds: async (req, res) => {
            try {
                const all_ads = await Ad.find()
                if (!all_ads) return res.status(404).json({error:{code: res.statusCode, msg: 'No ads found'}, data: null}) 
                
                return res.status(200).json({error:{code: null, msg: 'null'}, data: all_ads})
            } catch (error) {
                return res.status(500).json({error:{code: error.code, msg: err.msg}, data: null}) 
            }             
    },
    postAd: async (req,res) => {
            try {

            const user = await User.findById(req.user.id)
            if (!user) return res.status(404).json({error:{code: res.statusCode, msg: 'No user found'}, data: null}) 
                
                if (user.role != 2){  //admin
                    return res.status(403).json({error:{code: res.statusCode, msg: 'You do not have permission to access this resource'}, data: null}) 
                }

                const {name, price, description, category, sub_category, status,image, area, city, province} = req.body

                if (!image) return res.status(400).json({error:{code: res.statusCode, msg: 'Image not found'}, data: null}) 

                const newAd = new Ad({name, price, description, category, sub_category, status, image, area, city, province})

                const ad = await newAd.save()
                await User.findOneAndUpdate({_id: user._id}, {$push:{ads: ad}});

                return res.status(200).json({error:{code: null, msg: null}, data: ad})

            } catch (error) {
                return res.status(500).json({error:{code: error.code, msg: err.msg}, data: null}) 
   
            }
        },   
    
    imageUpload: async (req,res)  => {
        try {
            if(!req.files)
            return res.status(404).json({error:{code: res.statusCode, msg: 'File missing'}, data: null}) 
            
            const file = req.files.file;
           // console.log(file)
            console.log(file.tempFilePath)
            if(file.size > 1024*1024) {
                
                removeTmp(file.tempFilePath)
                return res.status(404).json({error:{code: res.statusCode, msg: 'File size is too large'}, data: null}) 
            }
    
            if(file.mimetype !== 'image/jpeg' && file.mimetype !== 'image/png'){
                removeTmp(file.tempFilePath)
                return res.status(404).json({error:{code: res.statusCode, msg: 'File format is incorrect'}, data: null}) 
            }
    
            cloudinary.v2.uploader.upload(file.tempFilePath, {folder: "Online-Exchange-App"}, async(err, result)=>{
                if(err) return res.status(404).json({error:{code: res.statusCode, msg: err.msg}, data: null}) 
    
                removeTmp(file.tempFilePath)
                
                return res.status(200).json({error:{code: null, msg: null}, data: {public_id: result.public_id,url: result.secure_url}})
 
            })
    
        } catch (error) {
            return res.status(500).json({error:{code: res.statusCode, msg: error.msg}, data: null}) 

        }
    },

    deleteAd: async(req, res) =>{
        try {
            const user = await User.findById(req.user.id)
            if (!user) return res.status(404).json({error:{code: res.statusCode, msg: 'No user found'}, data: null}) 

            if(user.role === 1){ //if user is admin
                return res.status(400).json({error:{code: res.statusCode, msg: 'You are not  allowed to access this resource'}, data: null}) 
            }

            if (!req.params.id){
                return res.status(404).json({error:{code: res.statusCode, msg: 'Ad ID is missing'}, data:null}) 
            }

            await Ad.findByIdAndDelete(req.params.id)

            return res.status(200).json({error:{code: null, msg: null}, data: null}) 

        } catch (err) {
            return res.status(500).json({error:{code: res.statusCode, msg: error.msg}, data: null})  
        }
    },

    updateAd: async (req,res) => {
        try {
            const user = await User.findById(req.user.id)
            if (!user) return res.status(404).json({error:{code: res.statusCode, msg: 'No user found'}, data: null}) 

            if(user.role === 1){ //if user is admin

                if(!req.params.id){ // if no id, error
                    return res.status(400).json({error:{code: res.statusCode, msg: 'Ad ID missing'}, data:null}) 
                }

                const status = req.body.status;
                const ad = await Ad.findOneAndUpdate({_id: req.params.id}, status)

                return res.status(200).json({error:{code: null, msg: null}, data: ad}) 
            }

            else if (user.role === 2){// user is customer

                if(!req.params.id){ // id is present   
                    return res.status(400).json({error:{code: res.statusCode, msg: 'Ad ID missing'}, data:null}) 
                }
                
                console.log(user.ads)
                ////ERROR
                if (!user.ads._id.includes(req.params.id))
                    return res.status(403).json({error:{code: res.statusCode, msg: 'You are not allowed to access this resource'}, data:null})
                const {name, price, description, category, sub_category, status,image, area, city, province} = req.body;
               
                const ad = await Ad.findOneAndUpdate({_id: req.user.id}, {name, price, description, category, sub_category, status,image, area, city, province});
                return res.status(200).json({error:{code: null, msg: null}, data: ad}) 
        } 
    }   catch (error) {
            return res.status(500).json({error:{code: res.statusCode, msg: error.message}, data: null})  

        }
    }
}
    
const removeTmp = (path) =>{
    fs.unlink(path, err=>{
        if(err) throw err;
    })
}
    

module.exports = advertisementController 
    
     
