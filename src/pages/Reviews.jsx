import React, { useState } from 'react'
import { useUser } from '../hooks/useUser'
import WriteReview from '../components/WriteReview'
import ShowReviews from '../components/ShowReviews'
import './Reviews.css'

export default function Reviews() {
  const { user, autoLogin, logout } = useUser()
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const handleReviewAdded = () => {
    setRefreshTrigger(prev => prev + 1)
  }

  return (
    <div className="reviews-container">
      <h1>Elokuva-arvostelut</h1>

      {user ? (
        <WriteReview
          user={user}
          autoLogin={autoLogin}
          logout={logout}
          onReviewAdded={handleReviewAdded}
        />
      ) : (
        <div className="login-prompt">
          <p>Kirjaudu sisään lisätäksesi arvostelun</p>
        </div>
      )}

      <ShowReviews refreshTrigger={refreshTrigger} />
    </div>
  )
}
