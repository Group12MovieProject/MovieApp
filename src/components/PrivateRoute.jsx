import React from 'react'
import { Outlet, Navigate } from 'react-router-dom'
import { useUser } from '../hooks/useUser'

export default function PrivateRoute() {
    const { user } = useUser()
    if (!user.access_token) return <Navigate to="/login" />
    return <Outlet />
}