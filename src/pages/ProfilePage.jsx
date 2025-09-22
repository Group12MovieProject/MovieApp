import React from 'react'
import { useUser } from '../hooks/useUser'
import { useNavigate } from 'react-router-dom'

export default function Profile() {
  const { user, logout } = useUser()
  const navigate = useNavigate()

  const handleLogout = async () => {
    try {
      await logout()
      navigate('/login')
    } catch (error) {
      console.error('Logout error:', error)
      navigate('/login')
    }
  }

    if (!user.access_token) {
    return (
      <div className="profile-container">
        <h1>Et ole kirjautunut sisään</h1>
        <p>Kirjaudu sisään nähdäksesi profiilisi.</p>
        <button onClick={() => navigate('/login')}>
          Siirry kirjautumiseen
        </button>
      </div>
    )
  }

  return (
    <div className="profile-container">
      <h1>Käyttäjäprofiili</h1>
      
      <div className="profile-info">
        <h2>Tiedot</h2>
        <p><strong>Sähköposti:</strong> {user.email}</p>
      </div>

      <div className="profile-actions">
        <button 
          className="logout-button"
          onClick={handleLogout}
        >
          Kirjaudu ulos
        </button>
      </div>
    </div>
  )
}