import { Router } from 'express'
import {addFavorite, deleteFavorite, getFavorite } from '../controllers/FavoritesController.js'
import { auth } from '../helper/auth.js'

const router = Router()

router.use(auth)

router.post('/', addFavorite)
router.get('/', getFavorite)
router.delete('/', deleteFavorite)

export default router