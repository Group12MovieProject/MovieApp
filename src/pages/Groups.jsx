import React, { useState } from 'react'
import { useUser } from '../hooks/useUser'
import ShowGroups from '../components/ShowGroups'
import CreateGroup from '../components/CreateGroup'
import './Groups.css'

export default function Groups() {
  const { user, autoLogin, logout} = useUser()
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const handleGroupAdded = () => {
    setRefreshTrigger(prev => prev + 1)
  }

  return (
    <div className="groups-container">
      <h1>Ryhmäsivu</h1>
    <ShowGroups refreshTrigger={refreshTrigger} />
    {user ? (
      <CreateGroup
        user={user}
        autoLogin={autoLogin}
        logout={logout}
        onGroupAdded={handleGroupAdded}
      />
    ) : (
      <div className="login-prompt">
        <p>Kirjaudu sisään luodaksesi ryhmän</p>
      </div>
    )}
    </div>
  )
}
