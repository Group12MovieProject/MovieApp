import React, { useState, useEffect, useRef } from 'react'
import { useUser } from '../hooks/useUser'
import { useFavorites } from '../hooks/useFavorites'
import { useNavigate } from 'react-router-dom'
import './ProfilePage.css'

export default function ProfilePage() {
  const { user, logout, deleteMe, verifyPassword, autoLogin } = useUser()
  const [deleteLoading, setDeleteLoading] = useState(false)
  const { favorites, addFavorite, deleteFavorite, loading, error } = useFavorites()
  const [searchTerm, setSearchTerm] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const navigate = useNavigate()
  // const hasFetched = useRef(false)

  const tmdb_api = import.meta.env.VITE_TMDB_API_KEY

  const handleLogout = async () => {
    try {
      await logout()
      navigate('/login')
    } catch (error) {
      console.error('Logout error:', error)
      navigate('/login')
    }
  }

  const handleDeleteAccount = async ({ isRetry = false, currentUser = user } = {}) => {
    if (!window.confirm("Haluatko varmasti poistaa tilisi?")) return

    if (!currentUser?.id_account || !currentUser?.access_token) {
      if (isRetry) {
        await logout()
        alert('Kirjaudu uudelleen sisään')
        return
      }

      try {
        const refreshedUser = await autoLogin()

        if (!refreshedUser?.id_account || !refreshedUser?.access_token) {
          throw new Error('Token refresh failed')
        }

        return await handleDeleteAccount({ isRetry: true, currentUser: refreshedUser })
      } catch (error) {
        console.warn('Autologin failed before account deletion:', error)
        await logout()
        alert('Kirjaudu uudelleen sisään')
        return
      }
    }

    setDeleteLoading(true)

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/user/delete`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentUser.access_token}`
        },
        credentials: 'include'
      })

      if (res.status === 401) {
        if (isRetry) {
          await logout()
          alert('Istunto vanhentunut. Kirjaudu uudelleen sisään.')
          navigate('/login')
          return
        }

        try {
          const refreshedUser = await autoLogin()

          if (!refreshedUser?.access_token) {
            throw new Error('Token refresh failed')
          }

          return await handleDeleteAccount({ isRetry: true, currentUser: refreshedUser })
        } catch (error) {
          console.warn('Autologin failed on 401:', error)
          await logout()
          alert('Istunto vanhentunut. Kirjaudu uudelleen sisään.')
          navigate('/login')
          return
        }
      }

      if (res.ok) {
        await logout()
        navigate('/login')
      } else {
        const data = await res.json()
        alert(data.error || "Virhe tilin poistossa")
      }
    } catch (err) {
      console.error('Delete account error:', err)
      alert("Virhe tilin poistossa")
    } finally {
      setDeleteLoading(false)
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

  const handleAddFavorite = async (movie, { isRetry = false, currentUser = user } = {}) => {
    // estetään duplikaatti jo frontendissä
    if (favorites.some(fav => fav.tmdb_id === movie.id)) {
      alert("Tämä elokuva on jo suosikeissa!")
      return
    }

    if (!currentUser?.id_account || !currentUser?.access_token) {
      if (isRetry) {
        await logout()
        alert('Kirjaudu uudelleen sisään')
        return
      }

      try {
        const refreshedUser = await autoLogin()

        if (!refreshedUser?.id_account || !refreshedUser?.access_token) {
          throw new Error('Token refresh failed')
        }

        return await handleAddFavorite(movie, { isRetry: true, currentUser: refreshedUser })
      } catch (error) {
        console.warn('Autologin failed before adding favorite:', error)
        await logout()
        alert('Kirjaudu uudelleen sisään')
        return
      }
    }

    try {
      await addFavorite(
        { title: movie.title, id: movie.id, poster_path: movie.poster_path},
        currentUser.access_token,
        currentUser.id_account
      )
      setSearchTerm('')
      setSearchResults([])
    } catch (err) {
      console.error('Add favorite error:', err)
      
      // Jos 401, yritä autologinia
      if (err.message?.includes('401') || err.message?.includes('Istunto')) {
        if (isRetry) {
          await logout()
          alert('Istunto vanhentunut. Kirjaudu uudelleen sisään.')
          return
        }

        try {
          const refreshedUser = await autoLogin()

          if (!refreshedUser?.access_token) {
            throw new Error('Token refresh failed')
          }

          return await handleAddFavorite(movie, { isRetry: true, currentUser: refreshedUser })
        } catch (error) {
          console.warn('Autologin failed on error:', error)
          await logout()
          alert('Istunto vanhentunut. Kirjaudu uudelleen sisään.')
        }
      }
    }
  }

  const handleRemoveFavorite = async (id_favorite, { isRetry = false, currentUser = user } = {}) => {
    if (!currentUser?.id_account || !currentUser?.access_token) {
      if (isRetry) {
        await logout()
        alert('Kirjaudu uudelleen sisään')
        return
      }

      try {
        const refreshedUser = await autoLogin()

        if (!refreshedUser?.id_account || !refreshedUser?.access_token) {
          throw new Error('Token refresh failed')
        }

        return await handleRemoveFavorite(id_favorite, { isRetry: true, currentUser: refreshedUser })
      } catch (error) {
        console.warn('Autologin failed before removing favorite:', error)
        await logout()
        alert('Kirjaudu uudelleen sisään')
        return
      }
    }

    try {
      await deleteFavorite(id_favorite, currentUser.access_token)
    } catch (err) {
      console.error('Remove favorite error:', err)
      
      // Jos 401, yritä autologinia
      if (err.message?.includes('401') || err.message?.includes('Istunto')) {
        if (isRetry) {
          await logout()
          alert('Istunto vanhentunut. Kirjaudu uudelleen sisään.')
          return
        }

        try {
          const refreshedUser = await autoLogin()

          if (!refreshedUser?.access_token) {
            throw new Error('Token refresh failed')
          }

          return await handleRemoveFavorite(id_favorite, { isRetry: true, currentUser: refreshedUser })
        } catch (error) {
          console.warn('Autologin failed on error:', error)
          await logout()
          alert('Istunto vanhentunut. Kirjaudu uudelleen sisään.')
        }
      }
    }
  }

  return (
    <div className="profile-layout">
      <aside className="profile-aside">
        <h1>Käyttäjäprofiili</h1>
        <div className="profile-info">
          <h2>Tiedot</h2>
          <p><strong>Sähköposti:</strong> {user.email}</p>
        </div>
        {error && <p className="error-message">{error}</p>}
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
      </aside>

      <main className="favorites-main">
        <h1>Omat suosikit</h1>
        <div className="favorites-container">
          
          {loading && <p>Ladataan...</p>}
          {favorites.length === 0 && <p>Ei suosikkeja vielä</p>}
          <table className="favorites-table">
            <thead>
              <tr>
                <th>Juliste</th>
                <th>Elokuva</th>
                <th>Toiminnot</th>
              </tr>
            </thead>
            <tbody>
              {favorites.map(fav => (
                <tr key={fav.tmdb_id}>
                  <td>
                    {fav.poster_path ? (
                      <img 
                        src={`https://image.tmdb.org/t/p/w185${fav.poster_path}`} 
                        alt={fav.movie_title} 
                        style={{ width: "100px" }} 
                      />
                    ) : "Ei kuvaa"}
                  </td>
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
          <button
            className="share-favorites-btn"
            onClick={() => {
              const shareLink = `${window.location.origin}/share/${user.id_account}`
              navigator.clipboard.writeText(shareLink)
              alert("Jako-linkki kopioitu leikepöydälle: " + shareLink)
            }}
          >
            Jaa suosikit
          </button>
        </div>

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
      </main>
    </div>
  )
}
