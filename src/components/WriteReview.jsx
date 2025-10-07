import React, { useState } from 'react'

const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY
const base_url = import.meta.env.VITE_API_URL

const WriteReview = ({ user, autoLogin, logout, onReviewAdded }) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [selectedMovie, setSelectedMovie] = useState(null)
  const [showDropdown, setShowDropdown] = useState(false)
  const [reviewText, setReviewText] = useState('')
  const [stars, setStars] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState(null)
  const [submitSuccess, setSubmitSuccess] = useState(null)

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
        setSearchResults(data.results.slice(0, 8))
        setShowDropdown(true)
      }
    } catch (error) {
      console.error('Virhe elokuvahaussa:', error)
    }
  }

  const handleSearchChange = (event) => {
    const query = event.target.value
    setSearchQuery(query)
    searchMovies(query)
  }

  const selectMovie = (movie) => {
    setSelectedMovie(movie)
    setSearchQuery(movie.title)
    setShowDropdown(false)
    setSubmitError(null)
    setSubmitSuccess(null)
  }

  const resetForm = () => {
    setSelectedMovie(null)
    setSearchQuery('')
    setSearchResults([])
    setShowDropdown(false)
    setReviewText('')
    setStars(0)
    setSubmitError(null)
    setSubmitSuccess(null)
  }

  const submitReview = async ({ isRetry = false, currentUser = user } = {}) => {
    if (!selectedMovie || !stars || reviewText.length < 10) {
      alert('Täytä kaikki kentät oikein')
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
          throw new Error('Token refresh returned incomplete user data')
        }

        return await submitReview({ isRetry: true, currentUser: refreshedUser })
      } catch (error) {
        console.warn('Autologin failed before review submission:', error)
        await logout()
        alert('Kirjaudu uudelleen sisään')
        return
      }
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
        await response.json().catch(() => null)

        if (typeof onReviewAdded === 'function') {
          await onReviewAdded()
        }

        resetForm()
        setSubmitSuccess('Arvostelu lisätty onnistuneesti!')
        return
      }

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
    } catch (error) {
      console.error('Virhe arvostelun lähetyksessä:', error)
      setSubmitError('Arvostelun lisääminen epäonnistui. Yritä myöhemmin uudelleen.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="add-review-section">
      <h2>Lisää uusi arvostelu</h2>

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

      {selectedMovie && (
        <div className="review-form">
          <h3>Arvostele: {selectedMovie.title}</h3>

          {submitSuccess && (
            <div className="form-message success-message">{submitSuccess}</div>
          )}
          {submitError && (
            <div className="form-message error-message">{submitError}</div>
          )}

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

          <div className="review-text">
            <label htmlFor="review-text">Arvostelusi:</label>
            <textarea
              id="review-text"
              value={reviewText}
              onChange={(event) => setReviewText(event.target.value)}
              placeholder="Kirjoita arvostelusi tähän..."
              rows={4}
              className="review-textarea"
            />
            <small>{reviewText.length}/500 merkkiä (vähintään 10 merkkiä)</small>
          </div>

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
              onClick={resetForm}
            >
              Peruuta
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default WriteReview
