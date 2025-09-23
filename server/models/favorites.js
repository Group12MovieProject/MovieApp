import {pool} from '../helper/db.js'

const createFavorite = async (id_account, movie_title, tmdb_id) => {
    return await pool.query(
        'INSERT INTO favorites (id_account, movie_title, tmdb_id) VALUES ($1, $2, $3) RETURNING *',
        [id_account, movie_title, tmdb_id]
    )
}

const retrieveFavorites = async (id_account) => {
    return await pool.query(
        'SELECT * FROM favorites WHERE id_account = $1',
        [id_account]
    )
}

const removeFavorite = async (id_account, tmdb_id) => {
    return await pool.query(
        'DELETE FROM favorites WHERE id_account = $1 AND tmdb_id = $2',
        [id_account, tmdb_id]
    )
}

export { createFavorite, retrieveFavorites, removeFavorite }