import React from 'react'
import { useState } from 'react';
import { UserContext } from './UserContext.jsx';
import axios from 'axios'

const base_url = import.meta.env.VITE_API_URL
axios.defaults.withCredentials = true

export default function UserProvider({ children }) {
  const userFromSessionStorage = sessionStorage.getItem('user')
  const [user, setUser] = useState(userFromSessionStorage ? JSON.parse(userFromSessionStorage) : { email: '', password: '' })

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
    <UserContext.Provider value={{ user, setUser, signUp, signIn, updateToken, autoLogin }}>
      {children}
    </UserContext.Provider>
  )
}