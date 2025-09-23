import { Router } from 'express'
import { addReview, deleteReview, showAllReviews } from '../controllers/ReviewController.js'
import { auth } from '../helper/auth.js' 

const router = Router()


router.post('/add', auth, addReview)
router.delete('/delete', auth, deleteReview)
router.get('/', showAllReviews)

export default router