import React, { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import './MovieDetailsModal.css'

const imageBaseUrl = 'https://image.tmdb.org/t/p/w342'

const MovieDetailsModal = ({
  isOpen,
  onClose,
  movie,
  loading,
  error
}) => {
  const dialogRef = useRef(null)

  useEffect(() => {
    if (!isOpen) {
      return
    }

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  useEffect(() => {
    if (isOpen && dialogRef.current) {
      dialogRef.current.focus()
    }
  }, [isOpen])

  if (!isOpen) {
    return null
  }

  const stopPropagation = (event) => {
    event.stopPropagation()
  }

  const modalMarkup = (
    <div className="movie-modal-backdrop" onClick={onClose} role="presentation">
      <div
        className="movie-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="movie-modal-title"
        tabIndex={-1}
        ref={dialogRef}
        onClick={stopPropagation}
      >

        {loading && (
          <div className="movie-modal-loading">
            <p>Ladataan elokuvan tietoja…</p>
          </div>
        )}

        {error && !loading && (
          <div className="movie-modal-error">
            <p>Elokuvan tietojen hakeminen epäonnistui.</p>
            <p className="movie-modal-error-message">{error}</p>
          </div>
        )}

        {movie && !loading && !error && (
          <div className="movie-modal-content">
            <header className="movie-modal-header">
              {movie.poster_path ? (
                <img
                  src={`${imageBaseUrl}${movie.poster_path}`}
                  alt={movie.title}
                  className="movie-modal-poster"
                />
              ) : (
                <div className="movie-modal-poster placeholder" aria-hidden="true">
                  <span className="placeholder-text">Ei kuvaa</span>
                </div>
              )}
              <div className="movie-modal-basic-info">
                <h2 id="movie-modal-title">{movie.title}</h2>
                <p className="movie-modal-subtitle">
                  {movie.release_date ? new Date(movie.release_date).toLocaleDateString('fi-FI') : 'Julkaisuvuosi tuntematon'}
                </p>
                {movie.tagline && <p className="movie-modal-tagline">“{movie.tagline}”</p>}
              </div>
            </header>

            {movie.overview && (
              <section className="movie-modal-section">
                <h3>Synopsis</h3>
                <p>{movie.overview}</p>
              </section>
            )}

            <section className="movie-modal-section">
              <div className="movie-modal-meta">
                <div>
                  <h4>Genre(t)</h4>
                  <p>{movie.genres?.length ? movie.genres.map((genre) => genre.name).join(', ') : 'Ei tiedossa'}</p>
                </div>
                <div>
                  <h4>Julkaisuyhtiöt</h4>
                  <p>
                    {movie.production_companies?.length
                      ? movie.production_companies.map((company) => company.name).join(', ')
                      : 'Ei tiedossa'}
                  </p>
                </div>
              </div>
            </section>

            <section className="movie-modal-section">
              <div className="movie-modal-meta">
                <div>
                  <h4>Budjetti</h4>
                  <p>{movie.budget ? `${movie.budget.toLocaleString('fi-FI')} $` : 'Ei tiedossa'}</p>
                </div>
                <div>
                  <h4>Tulot</h4>
                  <p>{movie.revenue ? `${movie.revenue.toLocaleString('fi-FI')} $` : 'Ei tiedossa'}</p>
                </div>
              </div>
            </section>

            <footer className="movie-modal-footer">
              <button type="button" className="movie-modal-secondary" onClick={onClose}>
                Sulje
              </button>
              {movie.homepage && (
                <a
                  className="movie-modal-primary"
                  href={movie.homepage}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Virallinen sivu
                </a>
              )}
            </footer>
          </div>
        )}
      </div>
    </div>
  )

  const portalTarget = typeof document !== 'undefined' ? document.body : null

  return portalTarget ? createPortal(modalMarkup, portalTarget) : modalMarkup
}

export default MovieDetailsModal
