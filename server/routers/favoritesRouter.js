import { Router } from 'express'
import {addFavorite, deleteFavorite, getFavorite } from '../controllers/FavoritesController.js'
import { getSharedFavorites } from '../controllers/FavoritesController.js'
import { auth } from '../helper/auth.js'

const router = Router()

router.post('/add', auth, addFavorite)
router.get('/', auth, getFavorite)
router.delete('/delete/:id_favorite', auth,  deleteFavorite)
router.get('/share/:id_account', getSharedFavorites)

export default router