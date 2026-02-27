// @ts-nocheck
import { render, screen } from "@testing-library/react"
import { Provider } from "react-redux"
import { MemoryRouter, Routes, Route } from "react-router-dom" // Use MemoryRouter for testing navigation
import { configureStore } from "@reduxjs/toolkit"
import OpenRoute from "../../../../components/core/Auth/OpenRoute"
import authReducer from "../../../../slices/authSlice"

describe("OpenRoute Component", () => {
    const renderRoute = (metrics) => {
        const store = configureStore({
            reducer: { auth: authReducer },
            preloadedState: {
                auth: { token: metrics.token }
            },
        })

        render(
            <Provider store={store}>
                <MemoryRouter initialEntries={["/login"]}>
                    <Routes>
                        <Route path="/login" element={
                            <OpenRoute>
                                <div>Protected Content</div>
                            </OpenRoute>
                        } />
                        <Route path="/dashboard/my-profile" element={<div>Dashboard</div>} />
                    </Routes>
                </MemoryRouter>
            </Provider>
        )
    }

    test("renders children if token is null", () => {
        renderRoute({ token: null })
        expect(screen.getByText("Protected Content")).toBeInTheDocument()
        expect(screen.queryByText("Dashboard")).not.toBeInTheDocument()
    })

    test("redirects to dashboard if token is present", () => {
        renderRoute({ token: "test-token" })
        expect(screen.queryByText("Protected Content")).not.toBeInTheDocument()
        expect(screen.getByText("Dashboard")).toBeInTheDocument()
    })
})
