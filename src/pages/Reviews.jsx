import React, { useState, useEffect } from 'react'
import { useUser } from '../hooks/useUser'
import './Reviews.css'

const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY
const base_url = import.meta.env.VITE_API_URL

export default function Reviews() {
  const { user, autoLogin, logout } = useUser()
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [movieTitles, setMovieTitles] = useState({}) 

  
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [selectedMovie, setSelectedMovie] = useState(null)
  const [showDropdown, setShowDropdown] = useState(false)
  const [reviewText, setReviewText] = useState('')
  const [stars, setStars] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState(null)
  const [submitSuccess, setSubmitSuccess] = useState(null)

  // hakee elokuvien nimet tmdb:stä
  const fetchMovieTitle = async (tmdbId) => {
    if (movieTitles[tmdbId]) {
      return movieTitles[tmdbId] // palaute elokuvien nimet cachesta jos löytyvät
    }

    try {
      const response = await fetch(`https://api.themoviedb.org/3/movie/${tmdbId}?language=fi-FI`, {
        headers: {
          'Authorization': `Bearer ${TMDB_API_KEY}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (response.ok) {
        const movieData = await response.json()
        const title = movieData.title || 'Tuntematon elokuva'
        setMovieTitles(prev => ({ ...prev, [tmdbId]: title }))
        return title
      } else {
        return 'Elokuva ei löytynyt'
      }
    } catch (error) {
      console.error('Virhe elokuvan tietojen haussa:', error)
      return 'Virhe elokuvan haussa'
    }
  }

  // hakee elokuvia tmdb apista nimen perusteella
  const searchMovies = async (query) => {
    if (query.length < 3) {
      setSearchResults([])
      setShowDropdown(false)
      return
    }

    try {
      const response = await fetch(`https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(query)}&language=fi-FI&page=1`, {
        headers: {
          'Authorization': `Bearer ${TMDB_API_KEY}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setSearchResults(data.results.slice(0, 8)) // hakutuloksien raja
        setShowDropdown(true)
      }
    } catch (error) {
      console.error('Virhe elokuvahaussa:', error)
    }
  }

  const handleSearchChange = (e) => {
    const query = e.target.value
    setSearchQuery(query)
    searchMovies(query)
  }

  // elokuvan valinta dropdown menusta
  const selectMovie = (movie) => {
    setSelectedMovie(movie)
    setSearchQuery(movie.title)
    setShowDropdown(false)
    setSubmitError(null)
    setSubmitSuccess(null)
  }

  const submitReview = async ({ isRetry = false, currentUser = user } = {}) => {
    if (!selectedMovie || !stars || reviewText.length < 10) {
      alert('Täytä kaikki kentät oikein')
      return
    }

    if (!currentUser?.id_account || !currentUser?.access_token) {
      alert('Kirjaudu uudelleen sisään')
      return
    }

    setIsSubmitting(true)
    setSubmitError(null)
    setSubmitSuccess(null)
    
    const reviewData = {
      id_account: currentUser.id_account,
      tmdb_id: selectedMovie.id,
      review_text: reviewText,
      stars: stars
    }
    
    console.log('Lähetetään arvostelu:', reviewData)
  console.log('User token:', currentUser.access_token ? 'Token löytyy' : 'Token puuttuu')
  console.log('User object:', currentUser)
    
    try {
      const response = await fetch(base_url + '/review/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentUser.access_token}`
        },
        body: JSON.stringify(reviewData)
      })
      if (response.status === 401) {
        if (isRetry) {
          await logout()
          setSubmitError('Istunto vanhentunut, kirjaudu sisään uudelleen')
          return
        }

        console.log('Token vanhentunut, autologin yrittää uusia')
        try {
          const refreshedUser = await autoLogin()
          if (!refreshedUser?.access_token) {
            throw new Error('Token refresh failed')
          }
          return await submitReview({ isRetry: true, currentUser: refreshedUser })
        } catch (error) {
          await logout()
          setSubmitError('Istunto vanhentunut, kirjaudu sisään uudelleen')
          return
        }
      }
      if (response.ok) {
        const newReview = await response.json()
        setReviews(prevReviews => [newReview[0], ...prevReviews])
        
        await fetchMovieTitle(selectedMovie.id)
        
        setSelectedMovie(null)
        setSearchQuery('')
        setReviewText('')
        setStars(0)
        setSubmitSuccess('Arvostelu lisätty onnistuneesti!')
        return
      } else {
        let errorPayload = null
        try {
          errorPayload = await response.json()
        } catch (parseError) {
          const text = await response.text()
          errorPayload = { error: { message: text } }
        }

        if (response.status === 409) {
          setSubmitError('Olet jo arvostellut tämän elokuvan. Pystyt muokkaamaan arvosteluasi myöhemmin.')
          return
        }

        const message = errorPayload?.error?.message || 'Arvostelun lisääminen epäonnistui.'
        console.error('Backend error:', response.status, message)
        setSubmitError(message)
        return
      }
    } catch (error) {
      console.error('Virhe arvostelun lähetyksessä:', error)
      setSubmitError('Arvostelun lisääminen epäonnistui. Yritä myöhemmin uudelleen.')
    } finally {
      setIsSubmitting(false)
    }
  }

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await fetch(base_url + '/review/')
        if (!response.ok) {
          throw new Error('Arvostelujen hakeminen epäonnistui')
        }
        const data = await response.json()
        setReviews(data)
        
        const moviePromises = data.map(review => 
          fetchMovieTitle(review.tmdb_id)
        )
        await Promise.all(moviePromises)
        
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchReviews()
  }, [])

  return (
    <div className="reviews-container">
      <h1>Elokuva-arvostelut</h1>
      
      {/* Arvostelun lisääminen - vain kirjautuneille */}
      {user && (
        <div className="add-review-section">
          <h2>Lisää uusi arvostelu</h2>
          
          {/* Elokuvahaku */}
          <div className="movie-search">
            <label htmlFor="movie-search">Etsi elokuva:</label>
            <div className="search-container">
              <input
                id="movie-search"
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder="Kirjoita elokuvan nimi..."
                className="search-input"
              />
              
              {/* Hakutulokset dropdown */}
              {showDropdown && searchResults.length > 0 && (
                <div className="search-dropdown">
                  {searchResults.map((movie) => (
                    <div
                      key={movie.id}
                      className="search-result"
                      onClick={() => selectMovie(movie)}
                    >
                      <img
                        src={movie.poster_path ? `https://image.tmdb.org/t/p/w92${movie.poster_path}` : '/placeholder.png'}
                        alt={movie.title}
                        className="movie-poster"
                      />
                      <div className="movie-info">
                        <h4>{movie.title}</h4>
                        <p>{movie.release_date ? new Date(movie.release_date).getFullYear() : 'Ei vuotta'}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Arvostelulomake - näkyy kun elokuva valittu */}
          {selectedMovie && (
            <div className="review-form">
              <h3>Arvostele: {selectedMovie.title}</h3>

              {submitSuccess && (
                <div className="form-message success-message">{submitSuccess}</div>
              )}
              {submitError && (
                <div className="form-message error-message">{submitError}</div>
              )}
              
              {/* Tähtien valinta */}
              <div className="star-rating">
                <label>Anna arvosana:</label>
                <div className="stars-input">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      className={`star ${star <= stars ? 'filled' : ''}`}
                      onClick={() => setStars(star)}
                    >
                      ★
                    </button>
                  ))}
                </div>
                <span className="rating-text">{stars > 0 ? `${stars}/5 tähteä` : 'Valitse arvosana'}</span>
              </div>

              {/* Arvosteluteksti */}
              <div className="review-text">
                <label htmlFor="review-text">Arvostelusi:</label>
                <textarea
                  id="review-text"
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  placeholder="Kirjoita arvostelusi tähän..."
                  rows={4}
                  className="review-textarea"
                />
                <small>{reviewText.length}/500 merkkiä (vähintään 10 merkkiä)</small>
              </div>

              {/* Lähetä-nappi */}
              <div className="form-actions">
                <button
                  type="button"
                  className="submit-btn"
                  disabled={!stars || reviewText.length < 10 || isSubmitting}
                  onClick={() => submitReview()}
                >
                  {isSubmitting ? 'Lähetetään...' : 'Lähetä arvostelu'}
                </button>
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => {
                    setSelectedMovie(null)
                    setSearchQuery('')
                    setReviewText('')
                    setStars(0)
                    setSubmitError(null)
                    setSubmitSuccess(null)
                  }}
                >
                  Peruuta
                </button>
              </div>
            </div>
          )}
        </div>
      )}
      
      {!user && (
        <div className="login-prompt">
          <p>Kirjaudu sisään lisätäksesi arvostelun</p>
        </div>
      )}
      
      {loading && <p>Ladataan arvosteluja...</p>}
      {error && <p className="error">Virhe: {error}</p>}
      
      {!loading && !error && (
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
      )}
    </div>
  )
}
