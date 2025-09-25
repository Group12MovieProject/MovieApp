import React, { useEffect, useRef, useState } from 'react'
import MovieDetailsModal from './MovieDetailsModal'
import placeholderPoster from '../assets/placeholder.png'

const base_url = import.meta.env.VITE_API_URL
const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY
const TMDB_POSTER_BASE_URL = 'https://image.tmdb.org/t/p/w185'

const ShowReviews = ({ refreshTrigger = 0 }) => {
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [movieSummaries, setMovieSummaries] = useState({})
  const movieSummaryCacheRef = useRef({})
  const [selectedMovieId, setSelectedMovieId] = useState(null)
  const [movieDetails, setMovieDetails] = useState(null)
  const [detailsLoading, setDetailsLoading] = useState(false)
  const [detailsError, setDetailsError] = useState(null)
  const movieDetailsCacheRef = useRef({})

  const upsertMovieSummaries = (entries) => {
    movieSummaryCacheRef.current = { ...movieSummaryCacheRef.current, ...entries }
    setMovieSummaries(movieSummaryCacheRef.current)
  }

  useEffect(() => {
    let isCancelled = false

    const fetchMovieSummary = async (tmdbId) => {
      try {
        const response = await fetch(`https://api.themoviedb.org/3/movie/${tmdbId}?language=fi-FI`, {
          headers: {
            'Authorization': `Bearer ${TMDB_API_KEY}`,
            'Content-Type': 'application/json'
          }
        })

        if (!response.ok) {
          return {
            title: 'Elokuva ei löytynyt',
            posterPath: null
          }
        }

        const movieData = await response.json()
        return {
          title: movieData.title || 'Tuntematon elokuva',
          posterPath: movieData.poster_path || null
        }
      } catch (error) {
        console.error('Virhe elokuvan tietojen haussa:', error)
        return {
          title: 'Virhe elokuvan haussa',
          posterPath: null
        }
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
        const missingIds = uniqueIds.filter(id => !movieSummaryCacheRef.current[id])

        if (missingIds.length) {
          const summaryEntries = await Promise.all(missingIds.map(async (id) => [id, await fetchMovieSummary(id)]))
          if (!isCancelled) {
            const updates = {}
            summaryEntries.forEach(([id, summary]) => {
              if (summary) {
                updates[id] = summary
              }
            })

            if (Object.keys(updates).length) {
              upsertMovieSummaries(updates)
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

  const handleCardKeyDown = (event, tmdbId) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      openMovieDetails(tmdbId)
    }
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
            const summary = movieSummaries[review.tmdb_id]
            const title = summary?.title || 'Ladataan...'
            const posterPath = summary?.posterPath
            const posterSrc = posterPath ? `${TMDB_POSTER_BASE_URL}${posterPath}` : placeholderPoster
            const formattedDate = new Date(review.review_time).toLocaleDateString('fi-FI')

            return (
              <article
                className="review-card"
                key={review.id_review}
                role="button"
                tabIndex={0}
                onClick={() => openMovieDetails(review.tmdb_id)}
                onKeyDown={(event) => handleCardKeyDown(event, review.tmdb_id)}
                aria-label={`Näytä lisätiedot elokuvasta ${title}`}
              >
                <div className="review-card-poster">
                  <img
                    src={posterSrc}
                    alt={`Juliste: ${title}`}
                    loading="lazy"
                  />
                </div>

                <div className="review-card-title">
                  <p className="review-card-title-name">{title}</p>
                  <span className="review-card-date">{formattedDate}</span>
                </div>

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
