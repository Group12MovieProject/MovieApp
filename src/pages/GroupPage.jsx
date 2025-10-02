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

    useEffect(() => {
        const fetchGroupPage = async () => {
            if (!user?.access_token) {
                setError('Kirjaudu sisään päästäksesi ryhmäsivulle')
                setLoading(false)
                return
            }
            try {
                const response = await fetch(`${base_url}/group/${groupId}`, {
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
                            return fetchGroupPage()
                        }
                    } catch {
                        await logout()
                        setError('Istunto vanhentunut, kirjaudu sisään uudelleen')
                        setLoading(false)
                        return
                    }
                    // tähän lisätä error käsittely jos ei ole oikeutta nähdä ryhmää (backendi eka)
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
        // eslint-disable-next-line
    }, [groupId, user])

    if (loading) return <div className="group-loading">Ladataan ryhmäsivua...</div>
    if (error) return <div className="group-error">Virhe: {error}</div>

    return (
        <div className="group-page-container">
            <h1>{group.group_name || group.name}</h1>
            {/* Add more group details here */}
        </div>
    )
}