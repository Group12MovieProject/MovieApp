import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUser } from '../hooks/useUser'

const base_url = import.meta.env.VITE_API_URL

const ShowGroups = ({ refreshTrigger = 0 }) => {
  const [groups, setGroups] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [joiningGroup, setJoiningGroup] = useState(null)
  const [membershipStatus, setMembershipStatus] = useState({})
  const navigate = useNavigate()
  const { user, autoLogin, logout, isInitialized } = useUser()

  // Save to localStorage whenever membershipStatus changes
  useEffect(() => {
    if (user?.id_account) {
      localStorage.setItem(`groupMembershipStatus_${user.id_account}`, JSON.stringify(membershipStatus))
    }
  }, [membershipStatus, user?.id_account])

  // Clear membership status when user logs out or changes
  useEffect(() => {
    if (!user?.id_account) {
      setMembershipStatus({})
      localStorage.removeItem('groupMembershipStatus')
      // Also remove all user-specific keys
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('groupMembershipStatus_')) {
          localStorage.removeItem(key)
        }
      })
    } else {
      // Load statuses for current user
      const saved = localStorage.getItem(`groupMembershipStatus_${user.id_account}`)
      if (saved) {
        setMembershipStatus(JSON.parse(saved))
      } else {
        setMembershipStatus({})
      }
    }
  }, [user?.id_account])

  useEffect(() => {
    let isCancelled = false

    const fetchGroups = async () => {
      setLoading(true)
      setError(null)

      try {
        const response = await fetch(base_url + '/group/')

        if (!response.ok) {
          throw new Error('Ryhmien hakeminen epäonnistui')
        }

        const data = await response.json()
        if (isCancelled) return

        setGroups(data)
      } catch (err) {
        if (!isCancelled) {
          setError(err.message || 'Ryhmien hakeminen epäonnistui')
        }
      } finally {
        if (!isCancelled) {
          setLoading(false)
        }
      }
    }

    fetchGroups()

    return () => {
      isCancelled = true
    }
  }, [refreshTrigger])

  useEffect(() => {
    const fetchMembershipStatuses = async () => {
      // Wait for user initialization before checking memberships
      if (!isInitialized || !groups.length) return

      const statuses = { ...membershipStatus }

      await Promise.all(
        groups.map(async (group) => {
          const fetchForGroup = async ({ isRetry = false, currentUser = user } = {}) => {
            // If we don't have token data, skip this group (user not logged in)
            if (!currentUser?.id_account || !currentUser?.access_token) {
              if (isRetry) {
                await logout?.()
                return
              }
              return
            }

            try {
              const response = await fetch(`${base_url}/group/${group.id_group}/my-membership`, {
                method: 'GET',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${currentUser.access_token}`
                },
                credentials: 'include'
              })

              if (response.status === 401) {
                if (isRetry) {
                  await logout?.()
                  return
                }

                // Try autologin once and retry
                try {
                  const refreshedUser = await autoLogin()
                  if (!refreshedUser?.access_token) throw new Error('Token refresh failed')
                  return await fetchForGroup({ isRetry: true, currentUser: refreshedUser })
                } catch (error) {
                  console.warn('Autologin failed while fetching membership:', error)
                  await logout?.()
                  return
                }
              }

              if (response.ok) {
                const data = await response.json()
                if (data.status === 'none') {
                  delete statuses[group.id_group]
                } else {
                  statuses[group.id_group] = data.status
                }
              }
            } catch (err) {
              console.error(`Error fetching membership for group ${group.id_group}:`, err)
            }
          }

          await fetchForGroup()
        })
      )

      setMembershipStatus(statuses)
    }

    fetchMembershipStatuses()
  }, [groups, user?.access_token, refreshTrigger, autoLogin, logout, isInitialized])

  const handleJoinGroup = async (event, groupId) => {
    event.stopPropagation()
    
    if (!user?.access_token) {
      alert('Kirjaudu sisään liittyäksesi ryhmään')
      navigate('/login')
      return
    }

    setJoiningGroup(groupId)

    try {
      const response = await fetch(`${base_url}/group/${groupId}/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.access_token}`
        },
        credentials: 'include'
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error?.message || 'Liittymispyyntö epäonnistui')
      }

      setMembershipStatus(prev => ({ ...prev, [groupId]: 'pending' }))
    } catch (error) {
      console.error('Error joining group:', error)
      alert(error.message || 'Liittymispyyntö epäonnistui')
    } finally {
      setJoiningGroup(null)
    }
  }

  const getMembershipButton = (groupId) => {
    const status = membershipStatus[groupId]
    
    if (status === 'approved') {
      return (
        <button className="join-group-button member" disabled>
          ✓ Ryhmän jäsen
        </button>
      )
    }
    
    if (status === 'pending') {
      return (
        <button className="join-group-button pending" disabled>
          ⏳ Odottaa hyväksyntää
        </button>
      )
    }
    
    return (
      <button
        className="join-group-button"
        onClick={(e) => handleJoinGroup(e, groupId)}
        disabled={joiningGroup === groupId}
      >
        {joiningGroup === groupId ? 'Lähetetään...' : 'Liity ryhmään'}
      </button>
    )
  }

  if (loading) return <div className="groups-loading">Ladataan ryhmiä...</div>
  if (error) return <div className="groups-error">Virhe: {error}</div>

  return (
    <div className="groups-list">
      {groups && groups.length > 0 ? (
        groups.map((g) => (
          <div
            key={g.id_group ?? g.id}
            className="group-item"
            onClick={() => navigate(`/groups/${g.id_group ?? g.id}`)}
            style={{ cursor: 'pointer' }}
            role="button"
            tabIndex={0}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault()
                navigate(`/groups/${g.id_group ?? g.id}`)
              }
            }}
          >
            <h3>{g.group_name || g.name}</h3>
            {(g.description || g.group_desc || g.desc) && (
              <p>{g.description || g.group_desc || g.desc}</p>
            )}
            
            {user && getMembershipButton(g.id_group ?? g.id)}
          </div>
        ))
      ) : (
        <div className="no-groups">Ei ryhmiä näytettäväksi</div>
      )}
    </div>
  )
}

export default ShowGroups
    


