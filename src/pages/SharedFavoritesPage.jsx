import { useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'

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

  if (loading) return <p>Ladataan...</p>
  if (error) return <p>{error}</p>

  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h1>Käyttäjän suosikit</h1>

      {favorites.length === 0 ? (
        <p>Ei suosikkeja</p>
      ) : (
        <table style={{ margin: '2rem auto', borderCollapse: 'collapse', width: '80%' }}>
          <thead>
            <tr style={{ backgroundColor: '#f0f0f0' }}>
              <th style={{ padding: '10px' }}>Elokuvan kansi</th>
              <th style={{ padding: '10px' }}>Nimi</th>
            </tr>
          </thead>
          <tbody>
            {favorites.map(fav => (
              <tr key={fav.id_favorite} style={{ borderBottom: '1px solid #ccc' }}>
                <td style={{ padding: '10px' }}>
                  {fav.poster_path ? (
                    <img
                      src={`https://image.tmdb.org/t/p/w185${fav.poster_path}`}
                      alt={fav.movie_title}
                      style={{ width: '100px', borderRadius: '8px' }}
                    />
                  ) : (
                    'Ei kuvaa'
                  )}
                </td>
                <td style={{ padding: '10px', fontSize: '1.1rem' }}>{fav.movie_title}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
