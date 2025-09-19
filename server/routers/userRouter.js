import {Router} from 'express'
import {signUp, signIn} from '../controllers/UserController.js'
import jwt from 'jsonwebtoken'
const {sign} = jwt

const router = Router()

router.post('/signup', signUp)
router.post('/signin', signIn)

export default router