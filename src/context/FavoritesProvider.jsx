import { useState } from 'react'
import { FavoritesContext } from './FavoritesContext.jsx'

export default function FavoritesProvider({ children }) {
    const [favorites, setFavorites] = useState([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    const fetchFavorites = async () => {
        setLoading(true)
        setError(null)

        try {
            const token = localStorage.getItem('access_token')
            const response = await fetch('/api/favorites', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                credentials: 'include'
            })

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`)
            }

            const data = await response.json()
            setFavorites(data.favorites || [])

        } catch (error) {
            setError('Unable to load favorites.')
            setFavorites([])
            throw error
        } finally {
            setLoading(false)
        }
    }

    const addFavorite = async (movie) => {
        try {
            const token = localStorage.getItem('access_token')
            const response = await fetch('/api/favorites', {
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
            })

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`)
            }

            const data = await response.json()

            setFavorites(prev => [...prev, data.favorite])
            return data.favorite
        } catch (error) {
            setError('Failed to add favorite.')
            throw error
        }
    }

    const deleteFavorite = async (tmdb_id) => {
        try {
            const token = localStorage.getItem('access_token')
            const response = await fetch('/api/favorites', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                credentials: 'include',
                body: JSON.stringify({ tmdb_id })
            })

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`)
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