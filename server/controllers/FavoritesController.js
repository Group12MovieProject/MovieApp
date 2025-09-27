import { createFavorite, retrieveFavorites, removeFavorite } from '../models/favorites.js'
import { ApiError } from '../helper/ApiError.js'

const addFavorite = async (req, res, next) => {
    try {
        const {id_account, movie_title, tmdb_id } = req.body

        if (!movie_title || !tmdb_id) {
            return next(new ApiError('Movie title and TMDB ID are required', 400))
        }

        const result = await createFavorite(id_account, movie_title, tmdb_id)

        return res.status(201).json({
            message: 'Favorite added successfully',
            favorite: result.rows[0]
        })
    } catch (error) {
        if (error.code === '23505') { //This prevents duplicates
            return next(new ApiError('Movie already in favorites', 409))
        }
        return next(new ApiError('Internal server error while adding favorite', 500))
    }
}

const getFavorite = async (req, res, next) => {
    try {
        const id_account = req.user.id_account 
        const result = await retrieveFavorites(id_account)

        return res.status(201).json({
            message: 'Favorites retrieved successfully',
            favorites: result.rows || [],
            count: result.rowCount
        })
    } catch (error) {
        return next(new ApiError('Internal server error while retrieving favorites', 500))
    }
}

const deleteFavorite = async (req, res, next) => {
    try {
        const result = await removeFavorite(req.params.id_favorite)
        
        if (result.rowCount === 0) {
            return next(new ApiError('Favorite not found', 404))
        }
        
        return res.status(201).json({
            message: 'Favorite removed successfully',
            favorite: result.rows[0]
        })
    } catch (error) {
        return next(new ApiError('Internal server error while removing favorite', 500))
    }
}

export { addFavorite, deleteFavorite, getFavorite }