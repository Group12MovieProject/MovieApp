import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useUser } from '../hooks/useUser'
import { useNavigate } from 'react-router-dom'
//import './Login.css'

export default function Login() {
  const { user, setUser, signIn, autoLogin } = useUser()
  const [autoLogging, setAutoLogging] = useState(true)
  const navigate = useNavigate()

    useEffect(() => {
    (async() => {
      try {
        await autoLogin()
        navigate("/")
      } catch {
        // If there is any error change to login screen.
        setAutoLogging(false)
      }
    })()
  }, [])

  // const [email, setEmail] = useState("");
  // const [password, setPassword] = useState("");

  // const handleSubmit = (e) => {
  //   e.preventDefault();
  //   console.log("Kirjautuminen:", { email, password });
  //   alert(`Kirjautuminen: ${email}`);
  // };

  const login = async (e) => {
    e.preventDefault()
    try {
      await signIn(user.email, user.password)
      navigate("/")
    } catch (error) {
      const message = error.response && error.response.data ? error.response.data.error : error
      alert(message)
    }
  }


  return (
    autoLogging ? (
      <p>Logging in ...</p>
    ) : (
      <div style={{ maxWidth: "400px", margin: "2em auto" }}>
        <h2>Kirjaudu</h2>
        <form onSubmit={login}>
          <div style={{ marginBottom: "1em" }}>
            <label>Sähköposti:</label>
            <input
              type="email"
              value={user.email}
              onChange={e => setUser({ ...user, email: e.target.value })}
              required
              style={{ width: "100%", padding: "0.5em" }}
            />
          </div>
          <div style={{ marginBottom: "1em" }}>
            <label>Salasana:</label>
            <input
              type="password"
              value={user.password}
              onChange={e => setUser({ ...user, password: e.target.value })}
              required
              style={{ width: "100%", padding: "0.5em" }}
            />
          </div>
          <button type="submit" style={{ padding: "0.5em 1em" }}>
            Kirjaudu
          </button>
        </form>
        <p style={{ marginTop: "1em" }}>
          Ei vielä tiliä? <Link to="/register">Rekisteröidy tästä</Link>
        </p>
      </div>
    )
  )
}
