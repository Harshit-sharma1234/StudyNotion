import { render, screen } from "@testing-library/react"
import { Provider } from "react-redux"
import { MemoryRouter, Routes, Route } from "react-router-dom"
import { configureStore } from "@reduxjs/toolkit"
import PrivateRoute from "../../../../components/core/Auth/PrivateRoute"
import authReducer from "../../../../slices/authSlice"

describe("PrivateRoute Component", () => {
    const renderRoute = (metrics) => {
        const store = configureStore({
            reducer: { auth: authReducer },
            preloadedState: {
                auth: { token: metrics.token }
            },
        })

        render(
            <Provider store={store}>
                <MemoryRouter initialEntries={["/dashboard"]}>
                    <Routes>
                        <Route path="/dashboard" element={
                            <PrivateRoute>
                                <div>Private Content</div>
                            </PrivateRoute>
                        } />
                        <Route path="/login" element={<div>Login Page</div>} />
                    </Routes>
                </MemoryRouter>
            </Provider>
        )
    }

    test("renders children if token is present", () => {
        renderRoute({ token: "valid-token" })
        expect(screen.getByText("Private Content")).toBeInTheDocument()
        expect(screen.queryByText("Login Page")).not.toBeInTheDocument()
    })

    test("redirects to login if token is null", () => {
        renderRoute({ token: null })
        expect(screen.queryByText("Private Content")).not.toBeInTheDocument()
        expect(screen.getByText("Login Page")).toBeInTheDocument()
    })
})
