import { Router } from 'express'
import {addFavorite, deleteFavorite, getFavorite } from '../controllers/FavoritesController.js'

const router = Router()

router.post('/add', addFavorite)
router.get('/get', getFavorite)
router.delete('/delete', deleteFavorite)

export default router