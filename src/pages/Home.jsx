import React, { useEffect, useState } from 'react'
import placeholder from '../assets/placeholder.png'
import './Home.css'

const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY

export default function Home() {
  const [topMovies, setTopMovies] = useState([])
  const [popularMovies, setPopularMovies] = useState([])
  const [topScrollIndex, setTopScrollIndex] = useState(0)
  const [popScrollIndex, setPopScrollIndex] = useState(0)
  const scrollAmount = 3 // how many posters are scrolled at button press

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

  const visibleMoviesCount = 4
  
  const handleTopPrev = () => {
    setTopScrollIndex(idx => Math.max(0, idx - scrollAmount))
  }
  const handleTopNext = () => {
    const maxScrollIndex = Math.max(0, topMovies.length - visibleMoviesCount);
    setTopScrollIndex(idx => Math.min(maxScrollIndex, idx + scrollAmount))
  }

  const handlePopPrev = () => {
    setPopScrollIndex(idx => Math.max(0, idx - scrollAmount))
  }
  const handlePopNext = () => {
    const maxScrollIndex = Math.max(0, popularMovies.length - visibleMoviesCount);
    setPopScrollIndex(idx => Math.min(maxScrollIndex, idx + scrollAmount))
  }

  return (
    <div className="home-container">
      <h2 className="home-title">Suositut elokuvat</h2>
      <div className="home-carousel">
        <button onClick={handlePopPrev} disabled={popScrollIndex === 0}>&lt;</button>
        <div className="home-movie-list">
          {popularMovies.map((movie, idx) => (
            <div 
              key={movie.id} 
              className="home-movie-item"
              style={{
                transform: `translateX(-${popScrollIndex * (160 + 16)}px)`,
                transition: 'transform 0.3s ease'
              }}
            >
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
        <button onClick={handlePopNext} disabled={popScrollIndex >= Math.max(0, popularMovies.length - visibleMoviesCount)}>&gt;</button>
      </div>
      <h2 className="home-title" style={{ marginTop: '2em' }}>Parhaiten arvioidut elokuvat</h2>
      <div className="home-carousel">
        <button onClick={handleTopPrev} disabled={topScrollIndex === 0}>&lt;</button>
        <div className="home-movie-list">
          {topMovies.map((movie, idx) => (
            <div 
              key={movie.id} 
              className="home-movie-item"
              style={{
                transform: `translateX(-${topScrollIndex * (160 + 16)}px)`,
                transition: 'transform 0.3s ease'
              }}
            >
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
        <button onClick={handleTopNext} disabled={topScrollIndex >= Math.max(0, topMovies.length - visibleMoviesCount)}>&gt;</button>
      </div>
    </div>
  )
}