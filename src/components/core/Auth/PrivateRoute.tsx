// @ts-nocheck
import { useAuth } from '@clerk/clerk-react'
import { Navigate } from "react-router-dom"

function PrivateRoute({ children }) {
    const { isSignedIn, isLoaded } = useAuth()

    if (!isLoaded) {
        return (
            <div className="grid min-h-[calc(100vh-3.5rem)] place-items-center">
                <div className="spinner"></div>
            </div>
        )
    }

    if (isSignedIn) {
        return children
    } else {
        return <Navigate to="/" />
    }
}

export default PrivateRoute
