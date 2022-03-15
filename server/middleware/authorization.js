const jwt = require('jsonwebtoken')


const authorization = (req, res, next) => {
    try {
        const token = req.header('Authorization')
        if (!token)  return res.status(401).json({msg: 'Invalid Authorization'})

        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
            if(err) return res.status(401).json({msg: "Invalid Authorization"})

            req.user = user
            next()
        })
    }
    catch (error) {
        return res.status(500).json({msg: error.message})
    }
}

/*    role: (role) => {
        return (req, res, next) => { //admin role = 1, user = 2
            try {
                console.log(role)
                if (!role)
                    return res.status(500).json({msg: "Role is missing"})

                if (req?.user?.role){ //for logged in users
                    if (req?.user?.role !== role) 
                        return res.status(401).json({msg: "You do not have permission to access this resource"})
                }
                else if(req?.body?.role){ //for users creating a new account
                    if((req?.body?.role !== role))
                        return res.status(401).json({msg: "You do not have permission to access this resource"})
                }

                next()
            } 
            catch (error) {
                    return res.status(500).json({msg: error.message})
            }
        }
    }
}
*/
module.exports = authorization