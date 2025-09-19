import React from 'react'
import { useState } from 'react';
import { UserContext } from './UserContext.jsx';
import axios from 'axios'

const base_url = import.meta.env.VITE_API_URL

export default function UserProvider({children}) {
  const userFromSessionStorage = sessionStorage.getItem('user')
  const [user, setUser] = useState(userFromSessionStorage ? JSON.parse(userFromSessionStorage): {email: '',password: ''})

  const signIn = async () => {
    const json = JSON.stringify(user)
    const headers = {headers: {'Content-Type':'application/json'}}
    try {
      const response = await axios.post(base_url + '/signIn',json,headers)
      const token = readAuthorizationHeader(response)
      const user = {email: response.data.email,access_token: token}
      setUser(user)
      sessionStorage.setItem("user",JSON.stringify(user))
    } catch(error) {
      setUser({email: '',password: ''})
      throw error
    }
  } 

  const updateToken = (response) => {
    const token = readAuthorizationHeader(response)
    const newUser = {...user,access_token: token}
    setUser(newUser)
    sessionStorage.setItem("user",JSON.stringify(newUser))
  }

  const readAuthorizationHeader = (response) => {
    if (response.headers.get('authorization') && 
      response.headers.get('authorization').split(' ')[0] === 'Bearer') {
      return response.headers.get('authorization').split(' ')[1]
    }
  }

  return (
    <UserContext.Provider value={{user, setUser,signIn,updateToken}}>
      { children }
    </UserContext.Provider>
  )
}