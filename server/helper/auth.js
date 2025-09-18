import jwt from 'jsonwebtoken'

const {verify} = jwt

const auth = (req,res,next) => {
    const access_token = req.headers['authorization']
    if(!access_token) {
        return res.status(401).json({message: 'No token provided'})
    }
    verify(access_token, process.env.JWT_SECRET,(err,decoded) => {
        if(err) {
            return res.status(401).json({message: 'Failed to authenticate token'})
        }
        next()
    })
}

export {auth}