import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import './NavBar.css'

export default function NavBar() {
  const [navQuery, setNavQuery] = useState('');
  const navigate = useNavigate();

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (navQuery.trim()) {
      navigate(`/searchpage?query=${encodeURIComponent(navQuery)}`);
      setNavQuery('');
    }
  };

  return (
    <nav className="custom-navbar">
      <div className="custom-navbar-inner custom-navbar-inner-justify">
        <div className="custom-navbar-left">
          <span className="custom-navbar-brand">Katve</span>
          <div className="custom-navbar-links">
            <Link className="custom-navbar-link" to="/">Home</Link>
            <Link className="custom-navbar-link" to="/favorites">Favorites</Link>
            <Link className="custom-navbar-link" to="/reviews">Reviews</Link>
            <Link className="custom-navbar-link" to="/groups">Groups</Link>
            <Link className="custom-navbar-link" to="/showtimes">Showtimes</Link>
          </div>
        </div>
        <div className="custom-navbar-right">
          <form className="custom-navbar-search" onSubmit={handleSearchSubmit}>
            <input
              type="search"
              placeholder="Search for movies, persons..."
              aria-label="Search"
              value={navQuery}
              onChange={e => setNavQuery(e.target.value)}
            />
            <button type="submit">Search</button>
          </form>
          <Link className="custom-navbar-login" to="/login">Login</Link>
        </div>
      </div>
    </nav>
  );
}