import React, { useState, useEffect, useRef } from 'react'
import { useUser } from '../hooks/useUser'
import { useNavigate } from 'react-router-dom'
import { useFavorites } from '../hooks/useFavorites'
import './ProfilePage.css'

export default function Profile() {
    const { user, logout, deleteMe, verifyPassword } = useUser()
    const { favorites, loading, fetchFavorites, deleteFavorite, addFavorite, error } = useFavorites()
    const [deleteLoading, setDeleteLoading] = useState(false)
    const [newFavoriteTitle, setNewFavoriteTitle] = useState('')
    const [addingFavorite, setAddingFavorite] = useState(false)
    const hasFetchedFavorites = useRef(false)
    const navigate = useNavigate()

    useEffect(() => {
        if (user?.access_token && !hasFetchedFavorites.current) {
            fetchFavorites(user.access_token)
            hasFetchedFavorites.current = true
        }
    }, [user?.access_token, fetchFavorites])

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
        if (!newFavoriteTitle.trim()) {
            alert('Syötä elokuvan nimi!')
            return
        }
        
        setAddingFavorite(true)
        try {
            await addFavorite(newFavoriteTitle.trim(), user.access_token)
            setNewFavoriteTitle('')
            alert('Elokuva lisätty suosikkeihin!')
        } catch (err) {
            console.error('Failed to add favorite:', err)
            if (err.message === 'Movie not found') {
                alert('Elokuvaa ei löytynyt. Tarkista nimi ja yritä uudelleen.')
            } else if (err.message === 'Movie is already in favorites') {
                alert('Elokuva on jo suosikeissasi.')
            } else {
                alert('Elokuvan lisääminen epäonnistui: ' + err.message)
            }
        } finally {
            setAddingFavorite(false)
        }
    }

    const handleRemoveFavorite = async (movieId) => {
        try {
            await deleteFavorite(movieId, user.access_token)
        } catch (err) {
            console.error('Failed to remove favorite:', err)
        }
    }

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleAddFavorite()
        }
    }

    if (!user.access_token) {
        return (
            <div className="profile-container">
                <h1>Et ole kirjautunut sisään</h1>
                <p>Kirjaudu sisään nähdäksesi profiilisi.</p>
                <button onClick={() => navigate('/login')}>
                    Siirry kirjautumiseen
                </button>
            </div>
        )
    }

    return (
        <div className="profile-container">
            <h1>Käyttäjäprofiili</h1>

            <div className="profile-info">
                <h2>Tiedot</h2>
                <p><strong>Sähköposti:</strong> {user.email}</p>
            </div>

            <div className="profile-favorites">
                <h2>Omat suosikit</h2>
                {loading && <p>Ladataan suosikkeja...</p>}
                {error && <p style={{ color: 'red' }}>{error}</p>}
                {favorites.length === 0 && !loading ? (
                    <p>Ei suosikkeja vielä</p>
                ) : (
                    <ul>
                        {favorites.map((movie) => (
                            <li key={movie.tmdb_id}>
                                {movie.movie_title}
                                <button onClick={() => handleRemoveFavorite(movie.tmdb_id)}>
                                    Poista
                                </button>
                            </li>
                        ))}
                    </ul>
                )}

                <div className="add-favorite">
                    <input
                        type="text"
                        value={newFavoriteTitle}
                        onChange={(e) => setNewFavoriteTitle(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Elokuvan nimi (esim. Star Wars)"
                        autoComplete="off"
                        disabled={addingFavorite}
                    />
                    <button 
                        onClick={handleAddFavorite} 
                        disabled={addingFavorite || !newFavoriteTitle.trim()}
                    >
                        {addingFavorite ? 'Lisätään...' : 'Lisää suosikiksi'}
                    </button>
                </div>
                <p style={{ fontSize: '0.9em', color: '#666', marginTop: '5px' }}>
                    Kirjoita elokuvan nimi ja järjestelmä etsii sen automaattisesti. Jos useita elokuvia löytyy, valitaan relevanttein.
                </p>
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