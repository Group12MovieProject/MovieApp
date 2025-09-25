import React, { useEffect, useRef, useState } from 'react'

const base_url = import.meta.env.VITE_API_URL
const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY

const ShowReviews = ({ refreshTrigger = 0 }) => {
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [movieTitles, setMovieTitles] = useState({})
  const movieTitleCacheRef = useRef({})

  const upsertMovieTitles = (entries) => {
    movieTitleCacheRef.current = { ...movieTitleCacheRef.current, ...entries }
    setMovieTitles(movieTitleCacheRef.current)
  }

  useEffect(() => {
    let isCancelled = false

    const fetchMovieTitle = async (tmdbId) => {
      try {
        const response = await fetch(`https://api.themoviedb.org/3/movie/${tmdbId}?language=fi-FI`, {
          headers: {
            'Authorization': `Bearer ${TMDB_API_KEY}`,
            'Content-Type': 'application/json'
          }
        })

        if (!response.ok) {
          return 'Elokuva ei löytynyt'
        }

        const movieData = await response.json()
        return movieData.title || 'Tuntematon elokuva'
      } catch (error) {
        console.error('Virhe elokuvan tietojen haussa:', error)
        return 'Virhe elokuvan haussa'
      }
    }

    const fetchReviews = async () => {
      setLoading(true)
      setError(null)

      try {
        const response = await fetch(base_url + '/review/')

        if (!response.ok) {
          throw new Error('Arvostelujen hakeminen epäonnistui')
        }

        const data = await response.json()
        if (isCancelled) {
          return
        }

        setReviews(data)

        const uniqueIds = [...new Set(data.map(review => review.tmdb_id).filter(Boolean))]
        const missingIds = uniqueIds.filter(id => !movieTitleCacheRef.current[id])

        if (missingIds.length) {
          const titleEntries = await Promise.all(missingIds.map(async (id) => [id, await fetchMovieTitle(id)]))
          if (!isCancelled) {
            const updates = {}
            titleEntries.forEach(([id, title]) => {
              if (title) {
                updates[id] = title
              }
            })

            if (Object.keys(updates).length) {
              upsertMovieTitles(updates)
            }
          }
        }
      } catch (err) {
        if (!isCancelled) {
          setError(err.message || 'Arvostelujen hakeminen epäonnistui')
        }
      } finally {
        if (!isCancelled) {
          setLoading(false)
        }
      }
    }

    fetchReviews()

    return () => {
      isCancelled = true
    }
  }, [refreshTrigger])

  if (loading) {
    return <p>Ladataan arvosteluja...</p>
  }

  if (error) {
    return <p className="error">Virhe: {error}</p>
  }

  return (
    <div className="reviews-table-container">
      <table className="reviews-table">
        <thead>
          <tr>
            <th>Elokuva</th>
            <th>Arvostelu</th>
            <th>Tähdet</th>
            <th>Kirjoittaja</th>
            <th>Päivämäärä</th>
          </tr>
        </thead>
        <tbody>
          {reviews.length === 0 ? (
            <tr>
              <td colSpan="5">Ei arvosteluja vielä</td>
            </tr>
          ) : (
            reviews.map((review) => (
              <tr key={review.id_review}>
                <td>{movieTitles[review.tmdb_id] || 'Ladataan...'}</td>
                <td>{review.review_text}</td>
                <td>
                  <span className="stars">
                    {'★'.repeat(review.stars)}{'☆'.repeat(5 - review.stars)}
                  </span>
                </td>
                <td>{review.email}</td>
                <td>{new Date(review.review_time).toLocaleDateString('fi-FI')}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}

export default ShowReviews
