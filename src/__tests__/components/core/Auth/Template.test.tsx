// @ts-nocheck
import { render, screen } from "@testing-library/react"
import { Provider } from "react-redux"
import { BrowserRouter } from "react-router-dom"
import { configureStore } from "@reduxjs/toolkit"
import Template from "../../../../components/core/Auth/Template"
import authReducer from "../../../../slices/authSlice"

// Mock child forms to isolate Template testing
jest.mock("../../../../components/core/Auth/LoginForm", () => () => <div data-testid="login-form">Login Form</div>)
jest.mock("../../../../components/core/Auth/SignupForm", () => () => <div data-testid="signup-form">Signup Form</div>)

describe("Template Component", () => {
    const renderTemplate = (formType, loading = false) => {
        const store = configureStore({
            reducer: { auth: authReducer },
            preloadedState: { auth: { loading } },
        })

        return render(
            <Provider store={store}>
                <BrowserRouter>
                    <Template
                        title="Test Title"
                        description1="Desc 1"
                        description2="Desc 2"
                        image="test.jpg"
                        formType={formType}
                    />
                </BrowserRouter>
            </Provider>
        )
    }

    test("renders loading spinner when loading is true", () => {
        const { container } = renderTemplate("login", true)
        // Assuming spinner class is used. Modify check based on actual output if needed.
        // The code uses <div className="spinner"></div>
        expect(container.getElementsByClassName("spinner").length).toBe(1)
    })

    test("renders content not loading", () => {
        renderTemplate("login", false)
        expect(screen.getByText("Test Title")).toBeInTheDocument()
        expect(screen.getByText("Desc 1")).toBeInTheDocument()
        expect(screen.getByText("Desc 2")).toBeInTheDocument()
        expect(screen.getByAltText("Students")).toHaveAttribute("src", "test.jpg")
    })

    test("renders LoginForm when formType is login", () => {
        renderTemplate("login", false)
        expect(screen.getByTestId("login-form")).toBeInTheDocument()
        expect(screen.queryByTestId("signup-form")).not.toBeInTheDocument()
    })

    test("renders SignupForm when formType is signup", () => {
        renderTemplate("signup", false)
        expect(screen.getByTestId("signup-form")).toBeInTheDocument()
        expect(screen.queryByTestId("login-form")).not.toBeInTheDocument()
    })
})
