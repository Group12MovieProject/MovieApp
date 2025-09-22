import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {useUser} from '../hooks/useUser'
import './NavBar.css'

export default function NavBar() {
  const [navQuery, setNavQuery] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)
  const navigate = useNavigate()
  const {user} = useUser()

  const isLoggedIn = user && user.access_token

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    if (navQuery.trim()) {
      navigate(`/searchpage?query=${encodeURIComponent(navQuery)}`)
      setNavQuery('')
    }
  }

  return (
    <nav className="custom-navbar">
      <div className="custom-navbar-inner custom-navbar-inner-justify">
        <div className="custom-navbar-left-group">
          <span className="custom-navbar-brand">Katve</span>
          <button
            className="custom-navbar-burger"
            aria-label="Avaa valikko"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(o => !o)}
            type="button">
            <span className="burger-bar"></span>
            <span className="burger-bar"></span>
            <span className="burger-bar"></span>
          </button>
        </div>
        <div className={`custom-navbar-links${menuOpen ? ' open' : ''}`}>
          <Link className="custom-navbar-link" to="/" onClick={()=>setMenuOpen(false)}>Koti</Link>
          <Link className="custom-navbar-link" to="/favorites" onClick={()=>setMenuOpen(false)}>Suosikkilista</Link>
          <Link className="custom-navbar-link" to="/reviews" onClick={()=>setMenuOpen(false)}>Arvostelut</Link>
          <Link className="custom-navbar-link" to="/groups" onClick={()=>setMenuOpen(false)}>Ryhmät</Link>
          <Link className="custom-navbar-link" to="/showtimes" onClick={()=>setMenuOpen(false)}>Näytösajat</Link>
        </div>
        <div className="custom-navbar-right-group">
          <form className="custom-navbar-search" onSubmit={handleSearchSubmit}>
            <input
              type="search"
              placeholder="Etsi elokuvia, henkilöitä..."
              aria-label="Search"
              value={navQuery}
              onChange={e => setNavQuery(e.target.value)}
            />
            <span className="search-icon">🔍</span>
          </form>
          {isLoggedIn ? (
            <Link className="custom-navbar-profile" to="/profilepage" onClick={()=>setMenuOpen(false)}>
              Profiili
            </Link>
          ) : (
            <Link className="custom-navbar-login" to="/login" onClick={()=>setMenuOpen(false)}>
              Kirjaudu
            </Link>
          )}
        </div>
      </div>
    </nav>
  )
}