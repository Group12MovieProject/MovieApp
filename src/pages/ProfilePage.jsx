import React, { useState } from 'react'
import { useUser } from '../hooks/useUser'
import { useNavigate } from 'react-router-dom'
import './ProfilePage.css'


export default function Profile() {
    const { user, logout, deleteMe, verifyPassword } = useUser()
    const [deleteLoading, setDeleteLoading] = useState(false)
    const navigate = useNavigate()

    const handleLogout = async () => {
        try {
            await logout()
            navigate('/login')
        } catch (error) {
            console.error('Logout error:', error)
            navigate('/login')
        }
    }

    const handleDeleteAccount = async () => {
        const confirmDelete = window.confirm(
            'Haluatko varmasti poistaa tilisi? Tätä toimintoa ei voi peruuttaa.'
        )

        if (!confirmDelete) return

        const password = window.prompt(
            'Vahvista tilin poisto syöttämällä salasanasi:'
        )

        if (!password) {
            alert('Tilin poisto peruutettu.')
            return
        }

        setDeleteLoading(true)

        try {
            await verifyPassword(password)

            await deleteMe()

            alert('Tili poistettu onnistuneesti!')
            navigate('/register')
        } catch (error) {
            console.error('Delete account error:', error)

            if (error.response?.status === 401) {
                alert('Väärä salasana. Tilin poisto peruutettu.')
            } else {
                alert('Tilin poistaminen epäonnistui: ' + (error.response?.data?.error || error.message))
            }
        } finally {
            setDeleteLoading(false)
        }
    }

    if (!user.access_token) {
        return (
            <div className="profile-container">
                <h1>Et ole kirjautunut sisään</h1>
                <p>Kirjaudu sisään nähdäksesi profiilisi.</p>
                <button onClick={() => navigate('/login')}>
                    Siirry kirjautumiseen
                </button>
            </div>
        )
    }



    return (
        <div className="profile-container">
            <h1>Käyttäjäprofiili</h1>

            <div className="profile-info">
                <h2>Tiedot</h2>
                <p><strong>Sähköposti:</strong> {user.email}</p>
            </div>

            <div className="profile-actions">
                <button
                    className="logout-button"
                    onClick={handleLogout}
                >
                    Kirjaudu ulos
                </button>

                <button
                    className="delete-account-button"
                    onClick={handleDeleteAccount}
                    disabled={deleteLoading}
                >
                    {deleteLoading ? 'Poistetaan tilii...' : 'Poista tili'}
                </button>
            </div>
        </div>
        
    )
}