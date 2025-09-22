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

// Open esimerkki
// const auth = (req,res,next) => {
//   let decodedUser = null
//   if (!req.headers.authorization || !req.cookies['refreshToken']) 
//     return res.status(401).json({error: 'Unauthorized'})
  
//   try { 
//     const authHeader = req.headers.authorization
//     const access_token = authHeader.split(" ")[1]
//     decodedUser = verify(access_token,jwt_secret)
//   } catch (error) { 
//     try {
//       const refresh_token = req.cookies['refreshToken']
//       decodedUser = verify(refresh_token,jwt_secret)
//     } catch (error) {
//       return res.status(401).json({error: 'Unauthorized'})
//     }
//   }    
//   finally {
//     res.exposeHeaders()
//     res.authorizationHeader(decodedUser.email)
//     next()
//   }
// }

export {auth}