import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useUser } from '../hooks/useUser'
import { useNavigate } from 'react-router-dom'
import './Login.css'

export default function Login() {
  const { user, setUser, signIn, isInitialized } = useUser()
  const [errorMessage, setErrorMessage] = useState("")
  const navigate = useNavigate()

  useEffect(() => {
    if (isInitialized && user.access_token) {
      navigate("/")
    }
  }, [isInitialized, user.access_token, navigate])

  if (!isInitialized) {
    return <div>Tarkistetaan kirjautumistilaa...</div>
  }

  const login = async (e) => {

    e.preventDefault()

    try {
      await signIn(user.email, user.password)
      navigate("/")
    } catch (error) {
      const status = error?.response?.status
      if (status === 400) {
        setErrorMessage('Vaaditaan sähköposti ja salasana')
        return
      }

      if (status === 404) {
        setErrorMessage('Käyttäjää ei löytynyt')
        return
      } else if (status === 401) {
        setErrorMessage('Väärä salasana')
        return
      } else {
        setErrorMessage('Palvelin ei vastaa')
        return
      }
    }
  }

  return (
    <div className="login-container">
      <h2>Kirjaudu</h2>
      {errorMessage && <div className="login-error">{errorMessage}</div>}
      <form className="login-form" onSubmit={login}>
        <div className="login-form-group">
          <label>Sähköposti:</label>
          <input
            type="email"
            value={user.email || ""}
            onChange={e => {
              setUser(prev => ({ ...(prev || {}), email: e.target.value }))
              setErrorMessage("")
            }}
            required
          />
        </div>
        <div className="login-form-group">
          <label>Salasana:</label>
          <input
            type="password"
            value={user.password || ""}
            onChange={e => {
              setUser(prev => ({ ...(prev || {}), password: e.target.value }))
              setErrorMessage("")
            }}
            required
          />
        </div>
        <button type="submit" className="login-submit-btn">
          Kirjaudu
        </button>
      </form>
      <p className="login-register-link">
        Ei vielä tiliä? <Link to="/register">Rekisteröidy tästä</Link>
      </p>
    </div>
  )
}
