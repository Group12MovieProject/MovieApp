import { insertReview, deleteReview, selectAllReviews } from '../models/Review.js'
import { ApiError } from '../helper/ApiError.js'

const postReview = async (req, res, next) => {
    try {
        const {id_account, tmdb_id, review_text, stars} = req.body

        if (!id_account || !tmdb_id || !review_text || !stars) {
            return next(new ApiError('Missing required information', 400))  // tarkistetaan vielä käytännössä virheviestin oikeellisuus
        }
        const result = await insertReview(id_account, tmdb_id, review_text, stars)
        return res.status(200).json(result.rows)
    } catch (error) {
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