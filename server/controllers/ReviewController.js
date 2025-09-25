import { insertReview, deleteReview, selectAllReviews, selectReviewById, selectReviewByAccountAndMovie } from '../models/Review.js'
import { ApiError } from '../helper/ApiError.js'

const postReview = async (req, res, next) => {
    try {
        const {id_account, tmdb_id, review_text, stars} = req.body

        if (!id_account || !tmdb_id || !review_text || !stars) {
            return next(new ApiError('Missing required information', 400))  // tarkistetaan vielä käytännössä virheviestin oikeellisuus
        }
        
        const existingReview = await selectReviewByAccountAndMovie(id_account, tmdb_id)

        if (existingReview.rowCount > 0) {
            return next(new ApiError('Review already exists for this movie', 409))
        }

        const insertResult = await insertReview(id_account, tmdb_id, review_text, stars)
        const newReviewId = insertResult.rows[0].id_review
        
        const fullReview = await selectReviewById(newReviewId)
        
        return res.status(200).json(fullReview.rows)
    } catch (error) {
        if (error.code === '23505') {
            return next(new ApiError('Review already exists for this movie', 409))
        }
        return next(new ApiError('Internal server error while posting review', 500)) // tämäkin syytä testata
    }
}

const removeReview =  async (req, res, next) => {
        try {
        const result = await deleteReview(req.params.id_review)
        return res.status(200).json(result.rows)
        }
        catch (error) {
            return next(new ApiError('Internal server error while deleting review', 500))
        }
}

const getAllReviews = async (req, res, next) => {
    try {
        const result = await selectAllReviews()
        return res.status(200).json(result.rows)
    } 
    catch (error) {
       return next(new ApiError('Internal server error while showing all reviews', 500)) 
    }
}

export { postReview, removeReview, getAllReviews }