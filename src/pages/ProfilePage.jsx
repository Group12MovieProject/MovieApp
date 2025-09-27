import React, { useState, useEffect, useRef } from 'react'
import { useUser } from '../hooks/useUser'
import { useFavorites } from '../hooks/useFavorites'
import { useNavigate } from 'react-router-dom'
import './ProfilePage.css'

export default function ProfilePage() {
  const { user, logout, deleteMe } = useUser()
  const { favorites, fetchFavorites, addFavorite, deleteFavorite, loading, error } = useFavorites()
  const [searchTerm, setSearchTerm] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const navigate = useNavigate()
  const hasFetched = useRef(false)

  const tmdb_api = import.meta.env.VITE_TMDB_API_KEY

  // Haetaan suosikit kun käyttäjä kirjautunut ja vain kerran
  useEffect(() => {
    if (user?.access_token) {
      fetchFavorites(user.access_token)
    }
  }, [user?.access_token])

  const handleSearch = async () => {
    if (!searchTerm.trim()) return
    try {
      const res = await fetch(
        `https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(searchTerm)}&language=fi-FI&page=1`,
        {
          headers: {
            Authorization: `Bearer ${tmdb_api}`
          }
        }
      )
      const data = await res.json()
      setSearchResults(data.results || [])
    } catch (err) {
      console.error('TMDB search error:', err)
    }
  }

  const handleAddFavorite = async (movie) => {
    // estetään duplikaatti jo frontendissä
    if (favorites.some(fav => fav.tmdb_id === movie.id)) {
      alert("Tämä elokuva on jo suosikeissa!")
      return
    }
    try {
      await addFavorite(
        { title: movie.title, id: movie.id },
        user.access_token,
        user.id_account
      )
      setSearchTerm('')
      setSearchResults([])
    } catch (err) {
      console.error('Add favorite error:', err)
    }
  }

  const handleRemoveFavorite = async (id_favorite) => {
    try {
      await deleteFavorite(id_favorite, user.access_token)
    } catch (err) {
      console.error('Remove favorite error:', err)
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

      {error && <p className="error-message">{error}</p>}

      <h2>Omat suosikit</h2>
      {loading && <p>Ladataan...</p>}
      {favorites.length === 0 && <p>Ei suosikkeja vielä</p>}
      <table className="favorites-table">
        <thead>
          <tr>
            <th>Elokuva</th>
            <th>Toiminnot</th>
          </tr>
        </thead>
        <tbody>
          {favorites.map(fav => (
            <tr key={fav.tmdb_id}>
              <td>{fav.movie_title}</td>
              <td>
                <button
                  className="remove-btn"
                  onClick={() => handleRemoveFavorite(fav.id_favorite)}
                >
                  Poista
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="search-section">
        <h3>Etsi elokuvia ja lisää suosikkeihin</h3>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Etsi elokuvia..."
        />
        <button onClick={handleSearch}>Hae</button>
      </div>

      {searchResults.length > 0 && (
        <ul className="search-results">
          {searchResults.slice(0, 5).map(movie => (
            <li key={movie.id}>
              {movie.title} ({movie.release_date?.slice(0, 4)})
              <button onClick={() => handleAddFavorite(movie)}>Lisää</button>
            </li>
          ))}
        </ul>
      )}

      <div className="profile-actions">
        <button onClick={logout} className="logout-btn">Kirjaudu ulos</button>
        <button
          onClick={deleteMe}
          className="delete-btn"
        >
          Poista tili
        </button>
      </div>
    </div>
  )
}
