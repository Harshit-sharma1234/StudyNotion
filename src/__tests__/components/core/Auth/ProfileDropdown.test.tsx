// @ts-nocheck
import { render, screen, fireEvent } from "@testing-library/react"
import { Provider } from "react-redux"
import { BrowserRouter } from "react-router-dom"
import { configureStore } from "@reduxjs/toolkit"
import ProfileDropdown from "../../../../components/core/Auth/ProfileDropdown"
import profileReducer from "../../../../slices/profileSlice"
import authReducer from "../../../../slices/authSlice"

// Mock logout
jest.mock("../../../../services/operations/authAPI", () => ({
    logout: jest.fn(),
}))

import { logout } from "../../../../services/operations/authAPI"

describe("ProfileDropdown Component", () => {
    let store
    const mockUser = {
        firstName: "Test",
        lastName: "User",
        image: "test-image.jpg",
    }

    beforeEach(() => {
        store = configureStore({
            reducer: {
                profile: profileReducer,
                auth: authReducer,
            },
            preloadedState: {
                profile: {
                    user: mockUser,
                    loading: false,
                },
            },
        })
        logout.mockReturnValue({ type: "auth/logout" })
    })

    const renderComponent = (customStore = store) =>
        render(
            <Provider store={customStore}>
                <BrowserRouter>
                    <ProfileDropdown />
                </BrowserRouter>
            </Provider>
        )

    test("does not render if user is null", () => {
        const emptyStore = configureStore({
            reducer: { profile: profileReducer },
            preloadedState: { profile: { user: null } },
        })
        const { container } = renderComponent(emptyStore)
        expect(container).toBeEmptyDOMElement()
    })

    test("renders user image when user exists", () => {
        renderComponent()
        const img = screen.getByAltText("profile-Test")
        expect(img).toBeInTheDocument()
        expect(img).toHaveAttribute("src", "test-image.jpg")
    })

    test("opens dropdown on click", () => {
        renderComponent()

        // Dropdown should be closed initially
        expect(screen.queryByText(/Dashboard/i)).not.toBeInTheDocument()

        // Click to open
        fireEvent.click(screen.getByRole("button"))
        expect(screen.getByText(/Dashboard/i)).toBeInTheDocument()
        expect(screen.getByText(/Logout/i)).toBeInTheDocument()
    })

    test("navigates to dashboard on click", () => {
        renderComponent()
        fireEvent.click(screen.getByRole("button")) // open

        const dashboardLink = screen.getByText(/Dashboard/i).closest("a")
        expect(dashboardLink).toHaveAttribute("href", "/dashboard/my-profile")
    })

    test("calls logout on click", () => {
        renderComponent()
        fireEvent.click(screen.getByRole("button")) // open

        fireEvent.click(screen.getByText(/Logout/i))
        expect(logout).toHaveBeenCalled()
    })
})
