import React, { useEffect, useState } from 'react'
import placeholder from '../assets/placeholder.png';
import './Home.css';

const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY;

export default function Home() {
  const [topMovies, setTopMovies] = useState([]);
  const [topIdx, setTopIdx] = useState(0);
  const [popularMovies, setPopularMovies] = useState([]);
  const [popIdx, setPopIdx] = useState(0);
  const pageSize = 6;

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
      .then(data => setPopularMovies(data.results || []));
  }, []);

  // Top rated
  const handleTopPrev = () => {
    setTopIdx(idx => Math.max(0, idx - pageSize));
  };
  const handleTopNext = () => {
    setTopIdx(idx => Math.min(topMovies.length - pageSize, idx + pageSize));
  };
  const visibleTopMovies = topMovies.slice(topIdx, topIdx + pageSize);

  // Popular
  const handlePopPrev = () => {
    setPopIdx(idx => Math.max(0, idx - pageSize));
  };
  const handlePopNext = () => {
    setPopIdx(idx => Math.min(popularMovies.length - pageSize, idx + pageSize));
  };
  const visiblePopularMovies = popularMovies.slice(popIdx, popIdx + pageSize);

  return (
    <div className="home-container">
      <h2 className="home-title">Suositut elokuvat</h2>
      <div className="home-carousel">
        <button onClick={handlePopPrev} disabled={popIdx === 0}>&lt;</button>
        <div className="home-movie-list">
          {visiblePopularMovies.map((movie, idx) => (
            <div key={movie.id} className="home-movie-item">
              <img
                src={movie.poster_path ? `https://image.tmdb.org/t/p/w185${movie.poster_path}` : placeholder}
                alt={movie.title}
                className="home-movie-poster"
              />
              <div className="home-movie-title">
                {popIdx + idx + 1}. {movie.title} <span className="home-movie-score">(TMDB: {movie.vote_average})</span>
              </div>
            </div>
          ))}
        </div>
        <button onClick={handlePopNext} disabled={popIdx + pageSize >= popularMovies.length}>&gt;</button>
      </div>
      <h2 className="home-title" style={{ marginTop: '2em' }}>Parhaiten arvioidut elokuvat</h2>
      <div className="home-carousel">
        <button onClick={handleTopPrev} disabled={topIdx === 0}>&lt;</button>
        <div className="home-movie-list">
          {visibleTopMovies.map((movie, idx) => (
            <div key={movie.id} className="home-movie-item">
              <img
                src={movie.poster_path ? `https://image.tmdb.org/t/p/w185${movie.poster_path}` : placeholder}
                alt={movie.title}
                className="home-movie-poster"
              />
              <div className="home-movie-title">
                {topIdx + idx + 1}. {movie.title} <span className="home-movie-score">(TMDB: {movie.vote_average})</span>
              </div>
            </div>
          ))}
        </div>
        <button onClick={handleTopNext} disabled={topIdx + pageSize >= topMovies.length}>&gt;</button>
      </div>
    </div>
  );
}