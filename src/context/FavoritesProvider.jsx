import { useState } from 'react'
import { FavoritesContext } from './FavoritesContext.jsx'

const base_url = import.meta.env.VITE_API_URL

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
            const response = await fetch(base_url + '/favorites/', {
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
            throw error
        } finally {
            setLoading(false)
        }
    }

    const addFavorite = async (movie, token, id_account) => {

        if (!token) {
            setError('No authentication token')
            throw new Error('No authentication token')
        }

        try {
            const response = await fetch(base_url + '/favorites/add', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                credentials: 'include',
                body: JSON.stringify({
                    id_account: id_account,
                    movie_title: movie.title,
                    tmdb_id: movie.id
                })
            })

            if (!response.ok) {
                throw new Error('Request failed')
            }

            const data = await response.json()
            setFavorites(prev => [...prev, data.favorite])
            return data.favorite
        } catch (error) {
            setError('Failed to add favorite.')
            throw error
        }
    }

    const deleteFavorite = async (id_favorite, token) => {

        if (!token) {
            setError('No authentication token')
            throw new Error('No authentication token')
        }

        try {
            const response = await fetch(base_url + `/favorites/delete/${id_favorite}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                credentials: 'include',
            })

            if (!response.ok) {
                throw new Error('Request failed')
            }

            setFavorites(prev => prev.filter(fav => fav.id_favorite !== id_favorite))
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