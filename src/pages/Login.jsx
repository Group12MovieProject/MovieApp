import { useState } from "react";
import { Link } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Kirjautuminen:", { email, password });
    alert(`Kirjautuminen: ${email}`);
  };

  return (
    <div style={{ maxWidth: "400px", margin: "2em auto" }}>
       <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: "1em" }}>
          <label>Sähköposti:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ width: "100%", padding: "0.5em" }}
          />
        </div>
        <div style={{ marginBottom: "1em" }}>
          <label>Salasana:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
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
  );
}
