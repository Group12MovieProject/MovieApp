import { Router } from 'express'
import { signUp, signIn, deleteMe } from '../controllers/UserController.js'
import { auth } from '../helper/auth.js' 
import jwt from 'jsonwebtoken'
const { sign } = jwt

const router = Router()

router.post('/signup', signUp)
router.post('/signin', signIn)
router.delete('/delete', auth, deleteMe)
export default router