import express from 'express'
import cors from 'cors'
import userRouter from './routers/userRouter.js'
import favoritesRouter from './routers/favoritesRouter.js'
import reviewRouter from './routers/reviewRouter.js'
import groupRouter from './routers/groupRouter.js'
import cookieParser from 'cookie-parser'
import { auth } from './helper/auth.js'
import dotenv from 'dotenv'

dotenv.config()

const port = process.env.PORT || 3001

const app = express()

// CORS configuration
const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173'
const allowedOrigins = frontendUrl.split(',').map(url => url.trim())

app.use(cors({
  credentials: true,
  origin: allowedOrigins
}))
app.use(cookieParser())
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use('/user',userRouter)
app.use('/favorites', favoritesRouter)
app.use('/review', reviewRouter)
app.use('/group', groupRouter)

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`)
})

app.use((err,req,res,next) => {
    const statusCode = err.status || 500
    res.status(statusCode).json({
        error:{
            message: err.message,
            status: statusCode
        }
    })
})

app.get('/secured',auth,(req,res) => {
  return res.status(200).json({message: 'This is secured content.'})
})
