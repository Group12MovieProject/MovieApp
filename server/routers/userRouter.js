import { Router } from 'express'
import { signUp, signIn, deleteMe, autologin, logout  } from '../controllers/UserController.js'
import { auth } from '../helper/auth.js' 

const router = Router()

router.post('/signup', signUp)
router.post('/signin', signIn)
router.delete('/delete', auth, deleteMe)
router.post('/autologin', autologin)
router.post('/logout', logout)

export default router