import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

const base_url = import.meta.env.VITE_API_URL

const ShowGroups = ({ refreshTrigger = 0 }) => {
  const [groups, setGroups] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

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
          </div>
        ))
      ) : (
        <div className="no-groups">Ei ryhmiä näytettäväksi</div>
      )}
    </div>
  )
}

export default ShowGroups
    


