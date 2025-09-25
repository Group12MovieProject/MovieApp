import { Router } from 'express'
import { postReview, removeReview, getAllReviews } from '../controllers/ReviewController.js'
import { auth } from '../helper/auth.js' 

const router = Router()


router.post('/add', auth, postReview)
router.delete('/delete/:id_review', auth, removeReview)
router.get('/', getAllReviews)

export default router

