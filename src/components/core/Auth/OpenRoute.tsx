// @ts-nocheck
import { useAuth } from '@clerk/clerk-react'
import { Navigate } from "react-router-dom"

function OpenRoute({ children }) {
    const { isSignedIn, isLoaded } = useAuth()

    if (!isLoaded) {
        return null
    }

    if (!isSignedIn) {
        return children
    } else {
        return <Navigate to="/dashboard/my-profile" />
    }
}

export default OpenRoute
