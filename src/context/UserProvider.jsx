import React from 'react'
import { useState, useEffect } from 'react';
import { UserContext } from './UserContext.jsx';
import axios from 'axios'

const base_url = import.meta.env.VITE_API_URL
axios.defaults.withCredentials = true

export default function UserProvider({ children }) {
  const userFromSessionStorage = sessionStorage.getItem('user')
  const [user, setUser] = useState(userFromSessionStorage ? JSON.parse(userFromSessionStorage) : { email: '', password: '' })
  const [isInitialized, setIsInitialized] = useState(false)

  const signUp = async (email, password) => {
    const json = JSON.stringify({ user: { email, password } })
    const headers = { headers: { 'Content-Type': 'application/json' } }
    try {
      await axios.post(base_url + '/user/signup', json, headers)
      return await signIn(email, password)
    } catch (error) {
      throw error
    }
  }

  const signIn = async (email, password) => {
    const userEmail = email || user.email
    const userPassword = password || user.password
    const json = JSON.stringify({ user: { email: userEmail, password: userPassword } })
    const headers = { headers: { 'Content-Type': 'application/json' } }
    try {
      axios.defaults.withCredentials = true
      const response = await axios.post(base_url + '/user/signin', json, headers)
      const token = readAuthorizationHeader(response)
      const user = { email: response.data.email, access_token: token }
      setUser(user)
      sessionStorage.setItem("user", JSON.stringify(user))
    } catch (error) {
      setUser({ email: '', password: '' })
      throw error
    }
  }

  const autoLogin = async () => {
    try {
      axios.defaults.withCredentials = true
      const response = await axios.post(base_url + '/user/autologin')
      saveUser(response)
    } catch (error) {
      throw error
    }
  }
// This runs autologin when opening website (needs some testing to see if it's working as it should)
  useEffect(() => {
    const attemptAutoLogin = async () => {
      try {
        if (!user.access_token) {
          await autoLogin()
        }
      } catch (error) {
        console.log('AutoLogin failed on startup - user needs to login manually')
      } finally {
        setIsInitialized(true)
      }
    }

    attemptAutoLogin()
  }, [])

  const logout = async () => {
    try {
      await axios.post(base_url + '/user/logout')
    } catch (error) {
      console.warn('Server logout failed:', error)
    }
    clearUserData()
  }


  const deleteMe = async () => {
    try {
      if (!user.access_token) {
        throw new Error('Not authenticated')
      }

      const headers = {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.access_token}`
        }
      }

      await axios.delete(base_url + '/user/delete', headers)

      clearUserData()
      return true
    } catch (error) {
      console.error('Account deletion failed:', error)
      throw error
    }
  }

const verifyPassword = async (password) => {
  try {
    if (!user.access_token) {
      throw new Error('Not authenticated')
    }

    const headers = {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${user.access_token}`
      }
    }

    const json = JSON.stringify({ password })
    await axios.post(base_url + '/user/verify-password', json, headers)
    
    return true
  } catch (error) {
    throw error
  }
}

  const clearUserData = () => {
    setUser({ email: '', password: '' })
    sessionStorage.removeItem('user')
  }

  const saveUser = (response) => {
    const token = readAuthorizationHeader(response)
    const user = { email: response.data.email, access_token: token }
    setUser(user)
    sessionStorage.setItem("user", JSON.stringify(user))
  }

  const updateToken = (response) => {
    const token = readAuthorizationHeader(response)
    const newUser = { ...user, access_token: token }
    setUser(newUser)
    sessionStorage.setItem("user", JSON.stringify(newUser))
  }

  const readAuthorizationHeader = (response) => {
    const authHeader = response.headers['authorization'] || response.headers['Authorization']
    if (authHeader && authHeader.split(' ')[0] === 'Bearer') {
      return authHeader.split(' ')[1]
    }
  }

  return (
    <UserContext.Provider value={{ user, setUser, signUp, signIn, updateToken, autoLogin, logout, clearUserData, deleteMe, verifyPassword, isInitialized }}>
      {children}
    </UserContext.Provider>
  )
}