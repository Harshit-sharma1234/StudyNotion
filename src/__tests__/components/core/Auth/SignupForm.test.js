import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { Provider } from "react-redux"
import { BrowserRouter } from "react-router-dom"
import { configureStore } from "@reduxjs/toolkit"
import SignupForm from "../../../../components/core/Auth/SignupForm"
import authReducer from "../../../../slices/authSlice"
import profileReducer from "../../../../slices/profileSlice"

// Mock dependencies
jest.mock("../../../../services/operations/authAPI", () => ({
    sendOtp: jest.fn(),
}))

jest.mock("react-hot-toast", () => ({
    toast: {
        error: jest.fn(),
        success: jest.fn(),
        loading: jest.fn(),
        dismiss: jest.fn(),
    },
}))

import { sendOtp } from "../../../../services/operations/authAPI"
import { toast } from "react-hot-toast"

describe("SignupForm Component", () => {
    let store

    beforeEach(() => {
        store = configureStore({
            reducer: {
                auth: authReducer,
                profile: profileReducer,
            },
        })
        sendOtp.mockReturnValue((dispatch) => { })
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    const renderComponent = () =>
        render(
            <Provider store={store}>
                <BrowserRouter>
                    <SignupForm />
                </BrowserRouter>
            </Provider>
        )

    test("renders form inputs", () => {
        renderComponent()
        expect(screen.getByPlaceholderText("Enter first name")).toBeInTheDocument()
        expect(screen.getByPlaceholderText("Enter last name")).toBeInTheDocument()
        expect(screen.getByPlaceholderText("Enter email address")).toBeInTheDocument()
        expect(screen.getByPlaceholderText("Enter Password")).toBeInTheDocument()
        expect(screen.getByPlaceholderText("Confirm Password")).toBeInTheDocument()
    })

    test("validates password mismatch", () => {
        renderComponent()

        fireEvent.change(screen.getByPlaceholderText("Enter Password"), { target: { value: "password123" } })
        fireEvent.change(screen.getByPlaceholderText("Confirm Password"), { target: { value: "mismatch" } })

        // Fill other required fields to submit
        fireEvent.change(screen.getByPlaceholderText("Enter first name"), { target: { value: "John" } })
        fireEvent.change(screen.getByPlaceholderText("Enter last name"), { target: { value: "Doe" } })
        fireEvent.change(screen.getByPlaceholderText("Enter email address"), { target: { value: "john@example.com" } })

        fireEvent.click(screen.getByRole("button", { name: "Create Account" }))

        expect(toast.error).toHaveBeenCalledWith("Passwords Do Not Match")
        expect(sendOtp).not.toHaveBeenCalled()
    })

    test("switches between Student and Instructor tabs", () => {
        renderComponent()
        // Default is Student
        const studentTab = screen.getByText("Student")
        expect(studentTab).toHaveClass("bg-richblack-900")

        // Click Instructor
        fireEvent.click(screen.getByText("Instructor"))
        expect(screen.getByText("Instructor")).toHaveClass("bg-richblack-900")
        expect(studentTab).toHaveClass("bg-transparent")
    })

    test("submits valid form", async () => {
        renderComponent()

        fireEvent.change(screen.getByPlaceholderText("Enter first name"), { target: { value: "John" } })
        fireEvent.change(screen.getByPlaceholderText("Enter last name"), { target: { value: "Doe" } })
        fireEvent.change(screen.getByPlaceholderText("Enter email address"), { target: { value: "john@example.com" } })
        fireEvent.change(screen.getByPlaceholderText("Enter Password"), { target: { value: "password123" } })
        fireEvent.change(screen.getByPlaceholderText("Confirm Password"), { target: { value: "password123" } })

        fireEvent.click(screen.getByRole("button", { name: "Create Account" }))

        expect(sendOtp).toHaveBeenCalledTimes(1)
        expect(sendOtp).toHaveBeenCalledWith("john@example.com", expect.anything()) // navigate
    })
})
