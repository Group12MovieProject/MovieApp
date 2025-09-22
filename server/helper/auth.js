import jwt from 'jsonwebtoken'

const {verify, sign} = jwt

const auth = (req,res,next) => {
    const authHeader = req.headers['authorization'] 

    if(!authHeader) {
        return res.status(401).json({message: 'No token provided'})
    }

    const accessToken = authHeader.split(' ')[1]

    verify(accessToken, process.env.JWT_SECRET,(err,decoded) => {
        if(err) {
            return res.status(401).json({message: 'Failed to authenticate token'})
        }
        
        req.user = decoded
        next()
    })

}

export {auth}