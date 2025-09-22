import { Router } from 'express'
import { signUp, signIn, deleteMe, autoLogin, logout, verifyPassword  } from '../controllers/UserController.js'
import { auth } from '../helper/auth.js' 

const router = Router()

router.post('/signup', signUp)
router.post('/signin', signIn)
router.delete('/delete', auth, deleteMe)
router.post('/delete', auth, deleteMe)
router.post('/autologin', autoLogin)
router.post('/logout', logout)
router.post('/verify-password', auth, verifyPassword) 

export default router