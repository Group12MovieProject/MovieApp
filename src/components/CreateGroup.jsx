import React, { useState } from "react"

const base_url = import.meta.env.VITE_API_URL

const CreateGroup = ({ user, autoLogin, logout, onGroupAdded }) => {
    const [groupName, setGroupName] = useState('')
    const [groupDesc, setGroupDesc] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [submitError, setSubmitError] = useState(null)
    const [submitSuccess, setSubmitSuccess] = useState(null)

    const resetForm = () => {
        setGroupName('')
        setGroupDesc('')
    }

    const submitGroup = async ({ isRetry = false, currentUser = user } = {}) => {
        if (groupName.trim().length < 5 || groupDesc.trim().length < 10) {
            setSubmitError('Täytä kaikki kentät oikein: nimi vähintään 5 ja kuvaus vähintään 10 merkkiä')
            return
        }

        if (!currentUser?.id_account || !currentUser?.access_token) {
            if (isRetry) {
                await logout?.()
                setSubmitError('Kirjaudu uudelleen sisään')
                return
            }

            try {
                const refreshedUser = await autoLogin?.()
                if (!refreshedUser?.id_account || !refreshedUser?.access_token) {
                    throw new Error('Token refresh returned incomplete user data')
                }
                return await submitGroup({ isRetry: true, currentUser: refreshedUser })
            } catch (error) {
                console.warn('Autologin failed before group submission:', error)
                await logout?.()
                setSubmitError('Kirjaudu uudelleen sisään')
                return
            }
        }

        setIsSubmitting(true)
        setSubmitError(null)
        setSubmitSuccess(null)

        const groupData = {
            owner_id: currentUser.id_account,
            group_name: groupName,
            description: groupDesc,
        }

        try {
            const response = await fetch(base_url + '/group/add', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${currentUser.access_token}`,
                },
                body: JSON.stringify(groupData),
            })

        if (response.status === 401) {
            if (isRetry) {
                await logout()
                setSubmitError('Istunto vanhentunut, kirjaudu sisään uudelleen')
                return
            }

            console.log('Token vanhentunut, autologin yrittää uusia')
                try {
                const refreshedUser = await autoLogin()
                if (!refreshedUser?.access_token) {
                    throw new Error('Token refresh failed')
                }
                return await submitGroup({ isRetry: true, currentUser: refreshedUser })
            } catch (error) {
                await logout()
                setSubmitError('Istunto vanhentunut, kirjaudu sisään uudelleen')
                return
            }
        }

        if (response.ok) {
            await response.json().catch(() => null)

            if (typeof onGroupAdded === 'function') {
                await onGroupAdded()
            }

            resetForm()
            setSubmitSuccess('Ryhmä lisätty onnistuneesti!')
            return
        }

        let errorPayload = null
        try {
            errorPayload = await response.json()
        } catch (parseError) {
            const text = await response.text()
            errorPayload = { error: { message: text } }
        }
        // tarvitsee tarkistaa, että estääkö duplikaatit vain nykyiseltä käyttäjältä vai vaikuttaako kaikille
        if (response.status === 409) {
            setSubmitError('Tämän niminen ryhmä on jo olemassa')
            return
        }

        const message = errorPayload?.error?.message || 'Ryhmän lisääminen epäonnistui.'
        console.error('Backend error:', response.status, message)
        setSubmitError(message)
    } catch (error) {
        console.error('Virhe ryhmän lisäämisessä:', error)
        setSubmitError('Ryhmän lisääminen epäonnistui. Yritä myöhemmin uudelleen.')
    } finally {
        setIsSubmitting(false)
    }
}

    return (
        <section className="add-group-section">
            <h2>Luo uusi ryhmä</h2>

            {submitSuccess && <div className="form-message success-message">{submitSuccess}</div>}
            {submitError && <div className="form-message error-message">{submitError}</div>}

            <div className="group-form">
                <label>
                    Ryhmän nimi
                    <input
                        type="text"
                        value={groupName}
                        onChange={(e) => setGroupName(e.target.value)}
                        placeholder="Nimi"
                    />
                </label>

                <label>
                    Kuvaus
                    <textarea
                        value={groupDesc}
                        onChange={(e) => setGroupDesc(e.target.value)}
                        placeholder="Kuvaus"
                        rows={4}
                    />
                </label>

                <button type="button" onClick={() => submitGroup()} disabled={isSubmitting}>
                    {isSubmitting ? 'Lähetetään...' : 'Luo ryhmä'}
                </button>
            </div>
        </section>
    )
}

export default CreateGroup