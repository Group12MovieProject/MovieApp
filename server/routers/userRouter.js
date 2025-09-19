import {Router} from 'express'
import {signUp, signIn} from '../controllers/UserController.js'
import jwt from 'jsonwebtoken'
import {hash} from 'bcrypt'

const {sign} = jwt

const router = Router()

router.post('/signup', signUp)
router.post('/signin', signIn)

// Väliaikainen hash generator - poista tuotannossa!
router.get('/hash/:password', async (req, res) => {
    const hashedPassword = await hash(req.params.password, 10)
    res.json({ password: req.params.password, hash: hashedPassword })
})

export default router