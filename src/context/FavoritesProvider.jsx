import { useState, useEffect, useContext} from 'react'
import { FavoritesContext } from './FavoritesContext.jsx'
import { UserContext } from './UserContext.jsx'

const base_url = import.meta.env.VITE_API_URL

export default function FavoritesProvider({ children }) {
    const [favorites, setFavorites] = useState([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const { user, autoLogin, logout } = useContext(UserContext)

    useEffect(() => {
        if (user?.access_token && user?.id_account) {
            fetchFavorites()
        } else {
            setFavorites([])
            setError(null)
        }
    }, [user?.access_token, user?.id_account, autoLogin, logout])

    const fetchFavorites = async ({ isRetry = false, currentUser = user } = {}) => {
        // Ensure we have a user/token; if not, try autologin once
        if (!currentUser?.access_token || !currentUser?.id_account) {
            if (isRetry) {
                setFavorites([])
                setError(null)
                await logout?.()
                return
            }

            try {
                const refreshed = await autoLogin?.()
                return await fetchFavorites({ isRetry: true, currentUser: refreshed })
            } catch (err) {
                setFavorites([])
                setError(null)
                await logout?.()
                return
            }
        }

        setLoading(true)
        setError(null)

        try {
            const response = await fetch(base_url + '/favorites/', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${currentUser.access_token}`
                },
                credentials: 'include'
            })

            if (response.status === 401) {
                if (isRetry) {
                    setFavorites([])
                    setError(null)
                    await logout?.()
                    return
                }

                try {
                    const refreshed = await autoLogin()
                    return await fetchFavorites({ isRetry: true, currentUser: refreshed })
                } catch (err) {
                    setFavorites([])
                    setError(null)
                    await logout?.()
                    return
                }
            }

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

    const clearFavorites = () => {
        setFavorites([])
        setError(null)
    }

    const addFavorite = async (movie, token, id_account, { isRetry = false, currentUser = user } = {}) => {
        if (!currentUser?.access_token || !id_account) {
            if (isRetry) {
                await logout?.()
                setError('No authentication token')
                throw new Error('No authentication token')
            }

            try {
                const refreshed = await autoLogin?.()
                return await addFavorite(movie, token, id_account, { isRetry: true, currentUser: refreshed })
            } catch (err) {
                await logout?.()
                setError('No authentication token')
                throw new Error('No authentication token')
            }
        }

        try {
            const response = await fetch(base_url + '/favorites/add', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${currentUser.access_token}`
                },
                credentials: 'include',
                body: JSON.stringify({
                    id_account: id_account,
                    movie_title: movie.title,
                    tmdb_id: movie.id
                })
            })

            if (response.status === 401) {
                if (isRetry) {
                    await logout?.()
                    setError('Istunto vanhentunut')
                    throw new Error('Istunto vanhentunut')
                }

                try {
                    const refreshed = await autoLogin()
                    return await addFavorite(movie, token, id_account, { isRetry: true, currentUser: refreshed })
                } catch (err) {
                    await logout?.()
                    setError('Istunto vanhentunut')
                    throw new Error('Istunto vanhentunut')
                }
            }

            if (response.status === 409) {
                const data = await response.json()
                setError(data.message || 'Movie already in favorites')
                throw new Error(data.message || 'Movie already in favorites')
            }

            if (!response.ok) {
                throw new Error('Request failed')
            }

            const data = await response.json()
            setFavorites(prev => [...prev, data.favorite])
            setError(null)
            return data.favorite
        } catch (error) {
            if (!error.message.includes('already')) {
                setError('Failed to add favorite.')
            }
            throw error
        }
    }

    const deleteFavorite = async (id_favorite, token, { isRetry = false, currentUser = user } = {}) => {
        if (!currentUser?.access_token) {
            if (isRetry) {
                await logout?.()
                setError('No authentication token')
                throw new Error('No authentication token')
            }

            try {
                const refreshed = await autoLogin?.()
                return await deleteFavorite(id_favorite, token, { isRetry: true, currentUser: refreshed })
            } catch (err) {
                await logout?.()
                setError('No authentication token')
                throw new Error('No authentication token')
            }
        }

        try {
            const response = await fetch(base_url + `/favorites/delete/${id_favorite}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${currentUser.access_token}`
                },
                credentials: 'include',
            })

            if (response.status === 401) {
                if (isRetry) {
                    await logout?.()
                    setError('Istunto vanhentunut')
                    throw new Error('Istunto vanhentunut')
                }

                try {
                    const refreshed = await autoLogin()
                    return await deleteFavorite(id_favorite, token, { isRetry: true, currentUser: refreshed })
                } catch (err) {
                    await logout?.()
                    setError('Istunto vanhentunut')
                    throw new Error('Istunto vanhentunut')
                }
            }

            if (!response.ok) {
                throw new Error('Request failed')
            }

            setFavorites(prev => prev.filter(fav => fav.id_favorite !== id_favorite))
            setError(null)
        } catch (error) {
            setError('Failed to remove favorite.')
            throw error
        }
    }

    return (
        <FavoritesContext.Provider value={{ 
            favorites, 
            loading, 
            error, 
            addFavorite, 
            deleteFavorite, 
            fetchFavorites,
            clearFavorites 
        }}>
            {children}
        </FavoritesContext.Provider>
    )
}