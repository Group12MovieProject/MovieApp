import React, { useEffect, useRef, useState } from 'react'
import MovieDetailsModal from './MovieDetailsModal'

const base_url = import.meta.env.VITE_API_URL
const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY

const ShowReviews = ({ refreshTrigger = 0 }) => {
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [movieTitles, setMovieTitles] = useState({})
  const movieTitleCacheRef = useRef({})
  const [selectedMovieId, setSelectedMovieId] = useState(null)
  const [movieDetails, setMovieDetails] = useState(null)
  const [detailsLoading, setDetailsLoading] = useState(false)
  const [detailsError, setDetailsError] = useState(null)
  const movieDetailsCacheRef = useRef({})

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

  useEffect(() => {
    if (!selectedMovieId) {
      return
    }

    let isCancelled = false

    const loadDetails = async () => {
      if (movieDetailsCacheRef.current[selectedMovieId]) {
        setMovieDetails(movieDetailsCacheRef.current[selectedMovieId])
        setDetailsError(null)
        setDetailsLoading(false)
        return
      }

      setDetailsLoading(true)
      setDetailsError(null)
      setMovieDetails(null)

      try {
        const response = await fetch(`https://api.themoviedb.org/3/movie/${selectedMovieId}?language=fi-FI`, {
          headers: {
            'Authorization': `Bearer ${TMDB_API_KEY}`,
            'Content-Type': 'application/json'
          }
        })

        if (!response.ok) {
          throw new Error('Elokuvan tietojen hakeminen epäonnistui')
        }

        const data = await response.json()

        if (!isCancelled) {
          movieDetailsCacheRef.current[selectedMovieId] = data
          setMovieDetails(data)
          setDetailsLoading(false)
        }
      } catch (err) {
        if (!isCancelled) {
          console.error('Virhe elokuvan tietojen haussa:', err)
          setDetailsError(err.message || 'Elokuvan tietojen hakeminen epäonnistui')
          setDetailsLoading(false)
        }
      }
    }

    loadDetails()

    return () => {
      isCancelled = true
    }
  }, [selectedMovieId])

  const openMovieDetails = (tmdbId) => {
    if (!tmdbId) {
      return
    }

    setSelectedMovieId(tmdbId)
    setDetailsError(null)

    if (movieDetailsCacheRef.current[tmdbId]) {
      setMovieDetails(movieDetailsCacheRef.current[tmdbId])
      setDetailsLoading(false)
    } else {
      setDetailsLoading(true)
      setMovieDetails(null)
    }
  }

  const closeMovieDetails = () => {
    setSelectedMovieId(null)
    setDetailsError(null)
    setDetailsLoading(false)
  }

  if (loading) {
    return <p>Ladataan arvosteluja...</p>
  }

  if (error) {
    return <p className="error">Virhe: {error}</p>
  }

  return (
    <div className="reviews-card-container">
      {reviews.length === 0 ? (
        <div className="reviews-empty">Ei arvosteluja vielä</div>
      ) : (
        <div className="reviews-cards">
          {reviews.map((review) => {
            const title = movieTitles[review.tmdb_id] || 'Ladataan...'
            const formattedDate = new Date(review.review_time).toLocaleDateString('fi-FI')

            return (
              <article className="review-card" key={review.id_review}>
                <header className="review-card-header">
                  <button
                    type="button"
                    className="movie-title-button"
                    onClick={() => openMovieDetails(review.tmdb_id)}
                  >
                    {title}
                  </button>
                  <span className="review-card-date">{formattedDate}</span>
                </header>

                <div className="review-card-stars" aria-label={`Arvosana ${review.stars} / 5`}>
                  <span className="stars">
                    {'★'.repeat(review.stars)}{'☆'.repeat(5 - review.stars)}
                  </span>
                </div>

                <p className="review-card-text">{review.review_text}</p>

                <footer className="review-card-footer">
                  <span className="review-card-author-label">Kirjoittaja</span>
                  <span className="review-card-author">{review.email}</span>
                </footer>
              </article>
            )
          })}
        </div>
      )}

      <MovieDetailsModal
        isOpen={Boolean(selectedMovieId)}
        movie={movieDetails}
        loading={detailsLoading}
        error={detailsError}
        onClose={closeMovieDetails}
      />
    </div>
  )
}

export default ShowReviews
