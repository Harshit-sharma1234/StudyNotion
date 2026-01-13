import { render, screen, fireEvent } from "@testing-library/react"
import { Provider } from "react-redux"
import { BrowserRouter } from "react-router-dom"
import { configureStore } from "@reduxjs/toolkit"
import LoginForm from "../../../../components/core/Auth/LoginForm"
import authReducer from "../../../../slices/authSlice"
import profileReducer from "../../../../slices/profileSlice"

// Mock the login operation
jest.mock("../../../../services/operations/authAPI", () => ({
    login: jest.fn(),
}))

import { login } from "../../../../services/operations/authAPI"

describe("LoginForm Component", () => {
    let store

    beforeEach(() => {
        store = configureStore({
            reducer: {
                auth: authReducer,
                profile: profileReducer,
            },
        })
        login.mockReturnValue((dispatch) => { }) // Mock thunk
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    const renderComponent = () =>
        render(
            <Provider store={store}>
                <BrowserRouter>
                    <LoginForm />
                </BrowserRouter>
            </Provider>
        )

    test("renders email and password inputs with required attributes", () => {
        renderComponent()

        const emailInput = screen.getByPlaceholderText(/Enter email address/i)
        const passwordInput = screen.getByPlaceholderText(/Enter Password/i)

        expect(emailInput).toBeInTheDocument()
        expect(emailInput).toBeRequired()
        expect(passwordInput).toBeInTheDocument()
        expect(passwordInput).toBeRequired()
    })

    test("toggles password visibility when eye icon is clicked", () => {
        renderComponent()

        const passwordInput = screen.getByPlaceholderText(/Enter Password/i)
        // Initially type is password
        expect(passwordInput).toHaveAttribute("type", "password")

        const label = passwordInput.closest("label")
        const toggleSpan = label.querySelector("span")

        // Click to show password
        fireEvent.click(toggleSpan)
        expect(passwordInput).toHaveAttribute("type", "text")

        // Click to hide password
        fireEvent.click(toggleSpan)
        expect(passwordInput).toHaveAttribute("type", "password")
    })

    test("updates input values on change event", () => {
        renderComponent()

        const emailInput = screen.getByPlaceholderText(/Enter email address/i)
        const passwordInput = screen.getByPlaceholderText(/Enter Password/i)

        fireEvent.change(emailInput, { target: { value: "test@example.com" } })
        fireEvent.change(passwordInput, { target: { value: "password123" } })

        expect(emailInput.value).toBe("test@example.com")
        expect(passwordInput.value).toBe("password123")
    })

    test("submits form with correct data when Sign In is clicked", () => {
        renderComponent()

        const emailInput = screen.getByPlaceholderText(/Enter email address/i)
        const passwordInput = screen.getByPlaceholderText(/Enter Password/i)
        const submitButton = screen.getByRole("button", { name: /Sign In/i })

        fireEvent.change(emailInput, { target: { value: "test@example.com" } })
        fireEvent.change(passwordInput, { target: { value: "password123" } })
        fireEvent.click(submitButton)

        expect(login).toHaveBeenCalledTimes(1)
        expect(login).toHaveBeenCalledWith(
            "test@example.com",
            "password123",
            expect.anything() // navigate function
        )
    })

    test("contains a link to forgot password", () => {
        renderComponent()
        const forgotLink = screen.getByText(/Forgot Password/i)
        expect(forgotLink).toBeInTheDocument()
        expect(forgotLink.closest("a")).toHaveAttribute("href", "/forgot-password")
    })
})
