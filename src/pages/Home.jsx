import React, { useEffect, useState, useRef } from 'react'
import placeholder from '../assets/placeholder.png'
import './Home.css'

const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY

export default function Home() {
  const [topMovies, setTopMovies] = useState([])
  const [popularMovies, setPopularMovies] = useState([])
  const [popCanScrollLeft, setPopCanScrollLeft] = useState(false)
  const [popCanScrollRight, setPopCanScrollRight] = useState(false)
  const [topCanScrollLeft, setTopCanScrollLeft] = useState(false)
  const [topCanScrollRight, setTopCanScrollRight] = useState(false)
  const topScrollRef = useRef(null)
  const popScrollRef = useRef(null)

  useEffect(() => {
    fetch('https://api.themoviedb.org/3/movie/top_rated?page=1', {
      headers: {
        'Authorization': 'Bearer ' + TMDB_API_KEY,
        'Content-Type': 'application/json',
      },
    })
      .then(res => res.json())
      .then(data => setTopMovies(data.results || []));

    fetch('https://api.themoviedb.org/3/movie/popular?page=1', {
      headers: {
        'Authorization': 'Bearer ' + TMDB_API_KEY,
        'Content-Type': 'application/json',
      },
    })
      .then(res => res.json())
      .then(data => setPopularMovies(data.results || []))
  }, [])

  const updateScrollState = (ref, setCanScrollLeft, setCanScrollRight) => {
    if (ref.current) {
      const { scrollLeft, scrollWidth, clientWidth } = ref.current
      setCanScrollLeft(scrollLeft > 0)
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth)
    }
  }

  const scrollLeft = (ref, setCanScrollLeft, setCanScrollRight) => {
    if (ref.current) {
      ref.current.scrollBy({ left: -320, behavior: 'smooth' })
      setTimeout(() => updateScrollState(ref, setCanScrollLeft, setCanScrollRight), 300)
    }
  }

  const scrollRight = (ref, setCanScrollLeft, setCanScrollRight) => {
    if (ref.current) {
      ref.current.scrollBy({ left: 320, behavior: 'smooth' })
      setTimeout(() => updateScrollState(ref, setCanScrollLeft, setCanScrollRight), 300)
    }
  }

  useEffect(() => {
    if (topMovies.length > 0) {
      setTimeout(() => updateScrollState(topScrollRef, setTopCanScrollLeft, setTopCanScrollRight), 100)
    }
  }, [topMovies])

  useEffect(() => {
    if (popularMovies.length > 0) {
      setTimeout(() => updateScrollState(popScrollRef, setPopCanScrollLeft, setPopCanScrollRight), 100)
    }
  }, [popularMovies])

  return (
    <div className="home-container">
      <h2 className="home-title">Suositut elokuvat</h2>
      <div className="home-carousel">
        <button 
          onClick={() => scrollLeft(popScrollRef, setPopCanScrollLeft, setPopCanScrollRight)} 
          disabled={!popCanScrollLeft}
          className="carousel-btn"
        >
          &lt;
        </button>
        <div className="home-movie-list" ref={popScrollRef}>
          {popularMovies.map((movie, idx) => (
            <div key={movie.id} className="home-movie-item">
              <img
                src={movie.poster_path ? `https://image.tmdb.org/t/p/w185${movie.poster_path}` : placeholder}
                alt={movie.title}
                className="home-movie-poster"
              />
              <div className="home-movie-title">
                {idx + 1}. {movie.title} <span className="home-movie-score">(TMDB: {movie.vote_average})</span>
              </div>
            </div>
          ))}
        </div>
        <button 
          onClick={() => scrollRight(popScrollRef, setPopCanScrollLeft, setPopCanScrollRight)} 
          disabled={!popCanScrollRight}
          className="carousel-btn"
        >
          &gt;
        </button>
      </div>
      
      <h2 className="home-title" style={{ marginTop: '2em' }}>Parhaiten arvioidut elokuvat</h2>
      <div className="home-carousel">
        <button 
          onClick={() => scrollLeft(topScrollRef, setTopCanScrollLeft, setTopCanScrollRight)} 
          disabled={!topCanScrollLeft}
          className="carousel-btn"
        >
          &lt;
        </button>
        <div className="home-movie-list" ref={topScrollRef}>
          {topMovies.map((movie, idx) => (
            <div key={movie.id} className="home-movie-item">
              <img
                src={movie.poster_path ? `https://image.tmdb.org/t/p/w185${movie.poster_path}` : placeholder}
                alt={movie.title}
                className="home-movie-poster"
              />
              <div className="home-movie-title">
                {idx + 1}. {movie.title} <span className="home-movie-score">(TMDB: {movie.vote_average})</span>
              </div>
            </div>
          ))}
        </div>
        <button 
          onClick={() => scrollRight(topScrollRef, setTopCanScrollLeft, setTopCanScrollRight)} 
          disabled={!topCanScrollRight}
          className="carousel-btn"
        >
          &gt;
        </button>
      </div>
    </div>
  )
}