import { Router } from 'express'
import { addReview, deleteReview, showAllReviews } from '../controllers/ReviewController.js'
import { auth } from '../helper/auth.js' 

const router = Router()


router.post('/addreview', auth, addReview)
router.delete('/deletereview', auth, deleteReview)
router.get('/showallreviews', showAllReviews)

export default router