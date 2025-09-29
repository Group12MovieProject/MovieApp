import { pool } from '../helper/db.js'

const createFavorite = async (id_account, movie_title, tmdb_id) => {
    return await pool.query(
        'INSERT INTO favorites (id_account, movie_title, tmdb_id) VALUES ($1, $2, $3) RETURNING *',
        [id_account, movie_title, tmdb_id]
    )
}

const retrieveFavorites = async (id_account) => {
    return await pool.query(
        'SELECT id_favorite, favorites.id_account, favorites.movie_title, favorites.tmdb_id FROM favorites INNER JOIN account ON favorites.id_account = account.id_account WHERE favorites.id_account = $1',
        [id_account]
    )
}

const removeFavorite = async (id_favorite) => {
    return await pool.query(
        'DELETE FROM favorites WHERE id_favorite = $1 RETURNING *',
        [id_favorite]
    )
}

export { createFavorite, retrieveFavorites, removeFavorite }