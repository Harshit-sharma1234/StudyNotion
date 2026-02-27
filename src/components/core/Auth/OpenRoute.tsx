// @ts-nocheck
// This will prevent authenticated users from accessing this route
import { useAuth } from "@clerk/clerk-react"
import { Navigate } from "react-router-dom"

function OpenRoute({ children }) {
  const { isSignedIn, isLoaded } = useAuth()

  if (!isLoaded) return null // Wait for initialization

  if (!isSignedIn) {
    return children
  } else {
    return <Navigate to="/dashboard/my-profile" />
  }
}

export default OpenRoute
