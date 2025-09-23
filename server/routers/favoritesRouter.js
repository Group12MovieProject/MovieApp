import { Router } from 'express'
import {addFavorite, removeFavorite, getFavorite } from '../controllers/FavoritesController.js'

const router = Router()

router.post('/add', addFavorite)
router.get('/get', getFavorite)
router.delete('/delete', removeFavorite)

export default router