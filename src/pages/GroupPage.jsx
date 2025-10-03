import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useUser } from '../hooks/useUser'
import './GroupPage.css'

const base_url = import.meta.env.VITE_API_URL

export default function GroupPage() {
    const { groupId } = useParams()
    const navigate = useNavigate()
    const { user, autoLogin, logout } = useUser()

    const [group, setGroup] = useState({})
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [isOwner, setIsOwner] = useState(false)
    const [pendingMembers, setPendingMembers] = useState([])
    const [pendingLoading, setPendingLoading] = useState(false)
    const [approvingId, setApprovingId] = useState(null)
    const [rejectingId, setRejectingId] = useState(null)

    useEffect(() => {
        const fetchGroupPage = async () => {
            if (!user?.access_token) {
                setGroup({})
                setIsOwner(false)
                setError('Kirjaudu sisään päästäksesi ryhmäsivulle')
                setLoading(false)
                return
            }

            setLoading(true)
            setError(null)

            const attemptFetch = async (token, hasRetried = false) => {
                const response = await fetch(`${base_url}/group/${groupId}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    credentials: 'include'
                })

                if (response.status === 401 && !hasRetried) {
                    try {
                        const refreshedUser = await autoLogin()
                        if (refreshedUser?.access_token) {
                            return attemptFetch(refreshedUser.access_token, true)
                        }
                    } catch {
                        await logout()
                        throw new Error('Istunto vanhentunut, kirjaudu sisään uudelleen')
                    }
                }

                return response
            }

            try {
                const response = await attemptFetch(user.access_token)

                if (response.status === 401) {
                    setError('Kirjautuminen epäonnistui, kirjaudu sisään uudelleen')
                    await logout()
                    return
                }

                if (response.status === 403) {
                    const errorData = await response.json().catch(() => null)
                    setError(
                        errorData?.error?.message ??
                        'Sinulla ei ole oikeutta nähdä tätä ryhmää'
                    )
                    return
                }

                if (response.status === 404) {
                    const errorData = await response.json().catch(() => null)
                    setError(errorData?.error?.message ?? 'Ryhmää ei löytynyt')
                    return
                }

                if (!response.ok) {
                    throw new Error('Request failed')
                }

                const data = await response.json()
                setGroup(data)
                setIsOwner(data.owner_id === user.id_account)
            } catch (error) {
                console.error('Virhe ryhmän haussa:', error)
                setError(error.message || 'Ryhmän hakeminen epäonnistui')
            } finally {
                setLoading(false)
            }
        }

        fetchGroupPage()
    }, [groupId, user?.access_token, autoLogin, logout])

    useEffect(() => {
        const fetchPendingMembers = async () => {
            if (!isOwner || !user?.access_token) return

            setPendingLoading(true)

            try {
                const response = await fetch(`${base_url}/group/${groupId}/members?status=pending`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${user.access_token}`
                    },
                    credentials: 'include'
                })

                if (response.status === 401) {
                    try {
                        const refreshedUser = await autoLogin()
                        if (refreshedUser?.access_token) {
                            const retryResponse = await fetch(`${base_url}/group/${groupId}/members?status=pending`, {
                                method: 'GET',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': `Bearer ${refreshedUser.access_token}`
                                },
                                credentials: 'include'
                            })
                            
                            if (retryResponse.ok) {
                                const data = await retryResponse.json()
                                setPendingMembers(data)
                            }
                        }
                    } catch {
                        // Fail silently for pending members
                    }
                } else if (response.ok) {
                    const data = await response.json()
                    setPendingMembers(data)
                }
            } catch (error) {
                console.error('Error fetching pending members:', error)
            } finally {
                setPendingLoading(false)
            }
        }

        fetchPendingMembers()
    }, [isOwner, groupId, user?.access_token, autoLogin])

    const handleDeleteGroup = async () => {
        if (!isOwner) {
            alert('Vain ryhmän omistaja voi poistaa ryhmää')
            return
        }

        const confirmDelete = window.confirm(
            'Haluatko varmasti poistaa ryhmän? Tätä toimintoa ei voi peruuttaa'
        )

        if (!confirmDelete) return

        setLoading(true)

        try {
            const response = await fetch(`${base_url}/group/delete/${group.id_group}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.access_token}`
                },
                credentials: 'include'
            })

            if (response.status === 401) {
                try {
                    const refreshedUser = await autoLogin()
                    if (refreshedUser?.access_token) {
                        return handleDeleteGroup()
                    }
                } catch {
                    await logout()
                    setError('Istunto vanhentunut, kirjaudu sisään uudelleen')
                    return
                }
            }

            if (response.status === 403) {
                setError('Sinulla ei ole oikeutta poistaa tätä ryhmää')
                return
            }

            if (response.status === 404) {
                setError('Ryhmää ei löytynyt')
                return
            }

            if (!response.ok) {
                const err = await response.json().catch(() => ({ error: 'Poisto epäonnistui' }))
                throw new Error(err.error?.message || err.error || 'Poisto epäonnistui')
            }

            alert('Ryhmä poistettu onnistuneesti!')
            navigate('/groups')
        } catch (error) {
            console.error('Error deleting group:', error)
            alert('Ryhmän poistaminen epäonnistui: ' + (error.message || error))
        } finally {
            setLoading(false)
        }
    }

    const handleApproveMember = async (accountId) => {
        if (!isOwner) return

        setApprovingId(accountId)

        // Optimistically remove from pending list
        const originalPending = [...pendingMembers]
        setPendingMembers(pendingMembers.filter(m => m.id_account !== accountId))

        try {
            const response = await fetch(`${base_url}/group/${groupId}/members/${accountId}/approve`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.access_token}`
                },
                credentials: 'include'
            })

            if (response.status === 401) {
                try {
                    const refreshedUser = await autoLogin()
                    if (refreshedUser?.access_token) {
                        const retryResponse = await fetch(`${base_url}/group/${groupId}/members/${accountId}/approve`, {
                            method: 'PATCH',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${refreshedUser.access_token}`
                            },
                            credentials: 'include'
                        })

                        if (!retryResponse.ok) {
                            throw new Error('Hyväksyminen epäonnistui')
                        }
                    }
                } catch {
                    // Revert on error
                    setPendingMembers(originalPending)
                    alert('Jäsenen hyväksyminen epäonnistui')
                }
            } else if (!response.ok) {
                // Revert on error
                setPendingMembers(originalPending)
                const err = await response.json().catch(() => ({ error: 'Hyväksyminen epäonnistui' }))
                alert(err.error?.message || err.error || 'Hyväksyminen epäonnistui')
            }
        } catch (error) {
            console.error('Error approving member:', error)
            setPendingMembers(originalPending)
            alert('Jäsenen hyväksyminen epäonnistui')
        } finally {
            setApprovingId(null)
        }
    }

    const handleRejectMember = async (accountId) => {
        if (!isOwner) return

        setRejectingId(accountId)

        // Optimistically remove from pending list
        const originalPending = [...pendingMembers]
        setPendingMembers(pendingMembers.filter(m => m.id_account !== accountId))

        try {
            const response = await fetch(`${base_url}/group/${groupId}/members/${accountId}/reject`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.access_token}`
                },
                credentials: 'include'
            })

            if (response.status === 401) {
                try {
                    const refreshedUser = await autoLogin()
                    if (refreshedUser?.access_token) {
                        const retryResponse = await fetch(`${base_url}/group/${groupId}/members/${accountId}/reject`, {
                            method: 'DELETE',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${refreshedUser.access_token}`
                            },
                            credentials: 'include'
                        })

                        if (!retryResponse.ok) {
                            throw new Error('Hylkääminen epäonnistui')
                        }
                    }
                } catch {
                    // Revert on error
                    setPendingMembers(originalPending)
                    alert('Jäsenen hylkääminen epäonnistui')
                }
            } else if (!response.ok) {
                // Revert on error
                setPendingMembers(originalPending)
                const err = await response.json().catch(() => ({ error: 'Hylkääminen epäonnistui' }))
                alert(err.error?.message || err.error || 'Hylkääminen epäonnistui')
            }
        } catch (error) {
            console.error('Error rejecting member:', error)
            setPendingMembers(originalPending)
            alert('Jäsenen hylkääminen epäonnistui')
        } finally {
            setRejectingId(null)
        }
    }

    if (loading) {
        return <div className="group-loading">Ladataan ryhmäsivua...</div>
    }

    if (error) {
        return (
            <div className="group-error" role="alert">
                <div className="group-error__icon" aria-hidden="true"></div>
                <div className="group-error__content">
                    <h2>Ryhmän lataus epäonnistui</h2>
                    <p>{error}</p>
                    <div className="group-error__actions">
                        <button type="button" onClick={() => navigate('/groups')}>
                            Palaa ryhmälistaan
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="group-page-container">
            <div className="group-main">
                <h1>{group.group_name || group.name}</h1>

                {/* Lisätään tähän ryhmään jaettu sisältö */}
            </div>

            <aside className="group-aside">
                <h2>Tietoja</h2>
                {/* Näytetään ryhmän kuvaus, myöhemmin jäsenlista ja ylläpitäjän tiedot yms */}
                {(group.description || group.group_desc || group.desc) && (
                    <p className="group-description">{group.description || group.group_desc || group.desc}</p>
                )}
                <p><strong>Ryhmän ylläpitäjän sähköposti:</strong> {user.email}</p>
                
                {isOwner && pendingMembers.length > 0 && (
                    <div className="pending-members-section">
                        <h3>Jäsenpyynnöt</h3>
                        {pendingLoading ? (
                            <p>Ladataan...</p>
                        ) : (
                            <ul className="pending-members-list">
                                {pendingMembers.map((member) => (
                                    <li key={member.id_account} className="pending-member-item">
                                        <div className="pending-member-info">
                                            <strong>{member.email}</strong>
                                            <span className="pending-member-date">
                                                {new Date(member.joined_at).toLocaleDateString('fi-FI')}
                                            </span>
                                        </div>
                                        <div className="pending-member-actions">
                                            <button
                                                className="approve-button"
                                                onClick={() => handleApproveMember(member.id_account)}
                                                disabled={approvingId === member.id_account || rejectingId === member.id_account}
                                            >
                                                {approvingId === member.id_account ? 'Hyväksytään...' : 'Hyväksy'}
                                            </button>
                                            <button
                                                className="reject-button"
                                                onClick={() => handleRejectMember(member.id_account)}
                                                disabled={approvingId === member.id_account || rejectingId === member.id_account}
                                            >
                                                {rejectingId === member.id_account ? 'Hylätään...' : 'Hylkää'}
                                            </button>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                )}
                
                {isOwner && (
                    <button
                        className="delete-group-button"
                        onClick={handleDeleteGroup}
                        disabled={loading}
                    >
                        {loading ? 'Poistetaan ryhmää...' : 'Poista ryhmä'}
                    </button>
                )}
            </aside>
        </div>
    )
}