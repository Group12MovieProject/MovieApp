import { useState } from 'react'
import { FavoritesContext } from './FavoritesContext.jsx'

const base_url = import.meta.env.VITE_API_URL
const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY

export default function FavoritesProvider({ children }) {
    const [favorites, setFavorites] = useState([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    const fetchFavorites = async (token) => {
        if (!token) {
            setError('No authentication token')
            return
        }
        setLoading(true)
        setError(null)

        try {
            const response = await fetch(base_url + '/favorites', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                credentials: 'include'
            })

            if (!response.ok) {
                throw new Error('Request failed')
            }

            const data = await response.json()
            setFavorites(data.favorites || [])

        } catch (error) {
            setError('Unable to load favorites.')
            setFavorites([])
        } finally {
            setLoading(false)
        }
    }

        const searchMovieByTitle = async (title) => {
        try {
            const response = await fetch(`https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(title)}&language=fi-FI&page=1`, {
                headers: {
                    'Authorization': `Bearer ${TMDB_API_KEY}`,
                    'Content-Type': 'application/json'
                }
            })

            if (!response.ok) {
                throw new Error('Movie search failed')
            }

            const data = await response.json()
            return data.results
        } catch (error) {
            throw new Error('Failed to search for movie')
        }
    }

const addFavorite = async (movieTitle, token) => {
    if (!token) {
        setError('No authentication token');
        throw new Error('No authentication token');
    }

    if (!movieTitle || typeof movieTitle !== 'string' || movieTitle.trim() === '') {
        setError('Movie title is required');
        throw new Error('Movie title is required');
    }

    try {
        const searchResults = await searchMovieByTitle(movieTitle.trim());
        if (searchResults.length === 0) {
            throw new Error('Movie not found');
        }
        const movie = searchResults[0];
        const response = await fetch(base_url + '/favorites', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            credentials: 'include',
            body: JSON.stringify({
                movie_title: movie.title,
                tmdb_id: movie.id
            })
        });

        if (!response.ok) {
            if (response.status === 409) {
                throw new Error('Movie is already in favorites');
            }
            throw new Error('Failed to add favorite');
        }
        await fetchFavorites(token);
    } catch (err) {
        setError(err.message)
        throw err
    }
}

    const deleteFavorite = async (tmdb_id, token) => {
        if (!token) {
            setError('No authentication token')
            throw new Error('No authentication token')
        }

        try {
            const response = await fetch(base_url + '/favorites', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                credentials: 'include',
                body: JSON.stringify({ tmdb_id })
            })

            if (!response.ok) {
                throw new Error('Request failed')
            }

            setFavorites(prev => prev.filter(fav => fav.tmdb_id !== tmdb_id))
        } catch (error) {
            setError('Failed to remove favorite.')
            throw error
        }
    }

    return (
        <FavoritesContext.Provider value={{ favorites, loading, error, addFavorite, deleteFavorite, fetchFavorites }} >
            {children}
        </FavoritesContext.Provider>
    )
}