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
    <div>
      <h1>Käyttäjän suosikit</h1>
      {favorites.length === 0 ? (
        <p>Ei suosikkeja</p>
      ) : (
        <ul>
          {favorites.map(fav => (
            <li key={fav.id_favorite}>{fav.movie_title}</li>
          ))}
        </ul>
      )}
    </div>
  )
}
