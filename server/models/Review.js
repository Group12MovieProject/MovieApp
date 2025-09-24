import { pool } from  '../helper/db.js'

const insertReview = async (id_account, tmdb_id, review_text, stars) => {
    return await pool.query(
        'INSERT INTO reviews (id_account, tmdb_id, review_text, stars) VALUES ($1, $2, $3, $4) RETURNING *',
        [id_account, tmdb_id, review_text, stars]
    )
}

const deleteReview = async (id_review) => {
    return await pool.query ('DELETE FROM reviews WHERE id_review = $1 RETURNING *', [id_review])
}

const selectAllReviews = async () => {
    return await pool.query(
        'SELECT id_review, reviews.id_account, reviews.tmdb_id, reviews.review_text, reviews.stars, reviews.review_time, account.email FROM reviews INNER JOIN account ON reviews.id_account = account.id_account')
}

const selectReviewById = async (id_review) => {
    return await pool.query(
        'SELECT id_review, reviews.id_account, reviews.tmdb_id, reviews.review_text, reviews.stars, reviews.review_time, account.email FROM reviews INNER JOIN account ON reviews.id_account = account.id_account WHERE id_review = $1',
        [id_review]
    )
}

export {insertReview, deleteReview, selectAllReviews, selectReviewById}