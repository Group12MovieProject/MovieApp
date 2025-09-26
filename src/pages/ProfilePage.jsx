import React, { useState, useEffect, useRef } from 'react'
import { useUser } from '../hooks/useUser'
import { useFavorites } from '../hooks/useFavorites'
import { useNavigate } from 'react-router-dom'
import './ProfilePage.css'

export default function ProfilePage() {
  const { user, logout, deleteMe, verifyPassword } = useUser()
  const { favorites, fetchFavorites, addFavorite, deleteFavorite, loading } = useFavorites()
  const [searchTerm, setSearchTerm] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const navigate = useNavigate()
  const hasFetched = useRef(false)

  const tmdb_api = import.meta.env.VITE_TMDB_API_KEY

    useEffect(() => {
        if (user?.access_token && !hasFetchedFavorites.current) {
            fetchFavorites(user.access_token)
            hasFetchedFavorites.current = true
        }
    }, [user?.access_token])

    const handleLogout = async () => {
        try {
            await logout()
            navigate('/login')
        } catch (error) {
            console.error('Logout error:', error)
            navigate('/login')
        }
    }

    const handleDeleteAccount = async () => {
        const confirmDelete = window.confirm(
            'Haluatko varmasti poistaa tilisi? Tätä toimintoa ei voi peruuttaa.'
        )

        if (!confirmDelete) return

        const password = window.prompt(
            'Vahvista tilin poisto syöttämällä salasanasi:'
        )

        if (!password) {
            alert('Tilin poisto peruutettu.')
            return
        }

        setDeleteLoading(true)

        try {
            await verifyPassword(password)

            await deleteMe()

            alert('Tili poistettu onnistuneesti!')
            navigate('/register')
        } catch (error) {
            console.error('Delete account error:', error)

            if (error.response?.status === 401) {
                alert('Väärä salasana. Tilin poisto peruutettu.')
            } else {
                alert('Tilin poistaminen epäonnistui: ' + (error.response?.data?.error || error.message))
            }
        } finally {
            setDeleteLoading(false)
        }
    }

    const handleAddFavorite = async () => {
        if (!newFavorite.trim()) return
        try {
            await addFavorite({ title: newFavorite, id: Date.now() }, user.access_token)
            setNewFavorite('')
        } catch (err) {
            console.error('Failed to add favorite:', err)
        }
    }

    const handleRemoveFavorite = async (movieId) => {
    try {
        await deleteFavorite(movieId, user.access_token)
    } catch (err) {
        console.error('Failed to remove favorite:', err)
    }
}

  if (!user.access_token) {
    return (
      <div className="profile-container">
        <h1>Et ole kirjautunut sisään</h1>
        <button onClick={() => navigate('/login')}>Kirjaudu sisään</button>
      </div>
    )
  }

  return (
    <div className="profile-container">
      <h1>Käyttäjäprofiili</h1>
      <p><strong>Sähköposti:</strong> {user.email}</p>

            <div className="profile-favorites">
                <h2>Omat suosikit</h2>

                {favorites.length === 0 ? (
                    <p>Ei suosikkeja vielä</p>
                ) : (
                    <ul>
                        {favorites.map((movie) => (
                            <li key={movie.tmdb_id || movie.id}>
                                {movie.movie_title || movie.title}
                                <button onClick={() => handleRemoveFavorite(movie.tmdb_id || movie.id)}>
                                    Poista
                                </button>
                            </li>
                        ))}
                    </ul>
                )}

                <div className="add-favorite">
                    <input
                        type="text"
                        value={newFavorite}
                        onChange={(e) => setNewFavorite(e.target.value)}
                        placeholder="Lisää elokuva suosikkeihin..."
                    />

                    <button onClick={handleAddFavorite}>Lisää</button>
                </div>
            </div>

            <div className="profile-actions">
                <button
                    className="logout-button"
                    onClick={handleLogout}
                >
                    Kirjaudu ulos
                </button>

                <button
                    className="delete-account-button"
                    onClick={handleDeleteAccount}
                    disabled={deleteLoading}
                >
                    {deleteLoading ? 'Poistetaan tilii...' : 'Poista tili'}
                </button>
            </div>
        </div>

    )
}
