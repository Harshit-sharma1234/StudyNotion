// @ts-nocheck
import { useEffect } from "react";
import { useUser, useAuth } from "@clerk/clerk-react";
import { useDispatch, useSelector } from "react-redux";
import { setUser } from "../../../slices/profileSlice";
import { setToken } from "../../../slices/authSlice";
import { useNavigate, useLocation } from "react-router-dom";

/**
 * ClerkRoleSync component handles the synchronization between Clerk's auth state
 * and the application's Redux profile state.
 * It also handles the redirection to Onboarding if a new user hasn't selected a role.
 */
const ClerkRoleSync = () => {
    const { user, isLoaded: userLoaded } = useUser();
    const { isSignedIn, isLoaded: authLoaded, getToken } = useAuth();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const reduxUser = useSelector((state) => state.profile.user);

    useEffect(() => {
        if (authLoaded && userLoaded) {
            if (isSignedIn && user) {
                // Sync token
                const syncToken = async () => {
                    const token = await getToken();
                    if (token) {
                        dispatch(setToken(token));
                        localStorage.setItem("token", JSON.stringify(token));
                    }
                };
                syncToken();

                // Construct user object compatible with the app's existing logic
                // We look in unsafeMetadata for the accountType (role)
                const accountType = user.unsafeMetadata?.accountType;

                const syncUser = {
                    ...user,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.primaryEmailAddress?.emailAddress,
                    image: user.imageUrl,
                    accountType: accountType,
                };

                // If Redux doesn't have the user or it's different, update it
                // We compare accountType specifically to trigger logic dependent on it
                if (!reduxUser || reduxUser.accountType !== accountType || reduxUser.email !== syncUser.email) {
                    dispatch(setUser(syncUser));
                }

                // REDIRECTION LOGIC:
                // 1. If logged in but no accountType is selected, force onboarding
                if (!accountType && location.pathname !== "/onboarding") {
                    navigate("/onboarding");
                }

                // 2. If they HAVE a role and are trying to access /onboarding, send them to dashboard
                if (accountType && location.pathname === "/onboarding") {
                    navigate("/dashboard/my-profile");
                }
            } else {
                // If not signed in to Clerk, ensure Redux user is also null
                if (reduxUser) {
                    dispatch(setUser(null));
                }
            }
        }
    }, [isSignedIn, user, authLoaded, userLoaded, dispatch, navigate, location.pathname, reduxUser]);

    return null;
};

export default ClerkRoleSync;
