import { useState } from "react";
import { Link } from "react-router-dom";
import { useUser } from '../hooks/useUser'
import { useNavigate } from 'react-router-dom'
import './Register.css'

export default function Register() {
  const { signUp } = useUser()
  const navigate = useNavigate()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [errorMessage, setErrorMessage] = useState("")

  const validatePassword = (pwd) => {

    setErrorMessage("")

    if (!pwd || pwd.length < 8) {
      setErrorMessage('Salasanan täytyy sisältää vähintään kahdeksan merkkiä')
      return false
    }

    if (!/[A-Z]/.test(pwd) || !/\d/.test(pwd)) {
      setErrorMessage('Salasanassa täytyy olla vähintään yksi iso kirjain ja yksi numero')
      return false
    }

    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    setErrorMessage("")

    if (!validatePassword(password)) return

    try {
      await signUp(email, password)
      navigate("/")
    } catch (error) {
      const status = error?.response?.status
      if (status === 409) {
        setErrorMessage('Sähköpostiosoite on varattu')
        return
      }
      const message = error?.response?.data?.error || error.message || String(error)
      setErrorMessage(`Kirjautuminen epäonnistui: ${message}`)
    }
  }

  return (
    <div className="register-container">
      <h2>Rekisteröinti</h2>
      {errorMessage && <div className="register-error">{errorMessage}</div>}
      <form className="register-form" onSubmit={handleSubmit}>
        <div className="register-form-group">
          <label>Sähköposti:</label>
          <input
            type="email"
            value={email}
            onChange={e => {
              setEmail(e.target.value)
              setErrorMessage("")
            }}
            required
          />
        </div>
        <div className="register-form-group">
          <label>Salasana:</label>
          <input
            type="password"
            value={password}
            onChange={e => {
              setPassword(e.target.value)
              setErrorMessage("")
            }}
            required
          />
        </div>
        <button type="submit" className="register-submit-btn">
          Rekisteröidy
        </button>
      </form>
      <p className="register-login-link">
        Onko sinulla jo tili? <Link to="/login">Kirjaudu tästä</Link>
      </p>
    </div>
  )
}
