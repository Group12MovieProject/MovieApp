import { useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import './SharedFavoritesPage.css'

const base_url = import.meta.env.VITE_API_URL

export default function SharedFavoritesPage() {
  const { id_account } = useParams()
  const [favorites, setFavorites] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchShared = async () => {
      try {
        const res = await fetch(`${base_url}/favorites/share/${id_account}`)
        if (!res.ok) throw new Error('Virhe haettaessa suosikkeja')
        const data = await res.json()
        setFavorites(data.favorites || [])
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchShared()
  }, [id_account])

  if (loading) return <p className="shared-loading">Ladataan...</p>
  if (error) return <p className="shared-error">{error}</p>

  return (
    <div className="shared-favorites-container">
      <h1>Käyttäjän suosikit</h1>

      {favorites.length === 0 ? (
        <p className="shared-empty">Ei suosikkeja</p>
      ) : (
        <table className="shared-favorites-table">
          <thead>
            <tr>
              <th>Elokuvan kansi</th>
              <th>Nimi</th>
            </tr>
          </thead>
          <tbody>
            {favorites.map(fav => (
              <tr key={fav.id_favorite}>
                <td>
                  {fav.poster_path ? (
                    <img
                      src={`https://image.tmdb.org/t/p/w185${fav.poster_path}`}
                      alt={fav.movie_title}
                      className="shared-movie-poster"
                    />
                  ) : (
                    'Ei kuvaa'
                  )}
                </td>
                <td className="shared-movie-title">{fav.movie_title}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
