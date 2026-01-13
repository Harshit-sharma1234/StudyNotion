import React from "react"
import { render, screen, waitFor, fireEvent } from "@testing-library/react"
import { Provider } from "react-redux"
import { configureStore } from "@reduxjs/toolkit"
import { MemoryRouter } from "react-router-dom"
import Navbar from "../../../components/Common/Navbar"
import authReducer from "../../../slices/authSlice"
import profileReducer from "../../../slices/profileSlice"
import cartReducer from "../../../slices/cartSlice"
import { apiConnector } from "../../../services/apiConnector"

// Mock API
jest.mock("../../../services/apiConnector")
jest.mock("../../../services/apis", () => ({
    categories: {
        CATEGORIES_API: "test-categories-api",
    },
}))

// Mock ProfileDropdown as it is complex and tested separately
jest.mock("../../../components/core/Auth/ProfileDropdown", () => {
    return () => <div data-testid="profile-dropdown">ProfileDropdown</div>
})

describe("Navbar Component", () => {
    let store

    const renderNavbar = (initialState = {}) => {
        store = configureStore({
            reducer: {
                auth: authReducer,
                profile: profileReducer,
                cart: cartReducer,
            },
            preloadedState: {
                auth: { token: null, ...initialState.auth },
                profile: { user: null, ...initialState.profile },
                cart: { totalItems: 0, ...initialState.cart },
            },
        })

        return render(
            <Provider store={store}>
                <MemoryRouter>
                    <Navbar />
                </MemoryRouter>
            </Provider>
        )
    }

    beforeEach(() => {
        apiConnector.mockReset()
        // Mock successful categories fetch by default
        apiConnector.mockResolvedValue({
            data: {
                data: [
                    { name: "Python", courses: [1, 2] },
                    { name: "Web Dev", courses: [3] }
                ]
            }
        })
    })

    test("renders logo and basic links", async () => {
        renderNavbar()
        expect(screen.getByAltText("Logo")).toBeInTheDocument()
        expect(screen.getByText("Home")).toBeInTheDocument()
        expect(screen.getByText("About Us")).toBeInTheDocument()
        expect(screen.getByText("Contact Us")).toBeInTheDocument()
        // Wait for api call to finish to avoid act warnings
        await waitFor(() => expect(apiConnector).toHaveBeenCalled())
    })

    test("renders Login and Signup buttons when user is not authenticated", async () => {
        renderNavbar({
            auth: { token: null }
        })
        expect(screen.getByText("Log in")).toBeInTheDocument()
        expect(screen.getByText("Sign up")).toBeInTheDocument()
        expect(screen.queryByTestId("profile-dropdown")).not.toBeInTheDocument()
        await waitFor(() => expect(apiConnector).toHaveBeenCalled())
    })

    test("renders ProfileDropdown and Cart when user is authenticated", async () => {
        renderNavbar({
            auth: { token: "mock-token" },
            profile: { user: { accountType: "Student" } },
            cart: { totalItems: 5 }
        })

        expect(screen.queryByText("Log in")).not.toBeInTheDocument()
        expect(screen.queryByText("Sign up")).not.toBeInTheDocument()
        expect(screen.getByTestId("profile-dropdown")).toBeInTheDocument()
        expect(screen.getByText("5")).toBeInTheDocument() // Cart count
        await waitFor(() => expect(apiConnector).toHaveBeenCalled())
    })

    test("fetches and displays categories in Catalog dropdown", async () => {
        renderNavbar()

        // Catalog is a group, hovering it reveals the dropdown.
        // However, the test might just check if the text exists in the document (hidden or not),
        // or simulate hover. The implementation uses CSS group-hover, which JSDOM doesn't fully emulate for visibility assertions 
        // unless we check styles.
        // But the elements should be in the DOM.

        const catalogText = screen.getByText("Catalog")
        expect(catalogText).toBeInTheDocument()

        await waitFor(() => {
            // We expect "Python" and "Web Dev" to be in the document
            // They are inside the dropdown
            expect(screen.getByText("Python")).toBeInTheDocument()
            expect(screen.getByText("Web Dev")).toBeInTheDocument()
        })
    })
})
