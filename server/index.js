import express from 'express'
import cors from 'cors'
import userRouter from './routers/userRouter.js'
import cookieParser from 'cookie-parser'

const port = process.env.PORT || 3001

const app = express()
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use('/user',userRouter)
app.use(cookieParser())

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
