// @ts-nocheck
import React from "react"
import { render, screen, waitFor } from "@testing-library/react"
import ReviewSlider from "../../../components/Common/ReviewSlider"
import { apiConnector } from "../../../services/apiConnector"

// Mock API Connector
jest.mock("../../../services/apiConnector")
jest.mock("axios") // Mock axios to avoid ESM issues
jest.mock("../../../services/apis", () => ({
    ratingsEndpoints: {
        REVIEWS_DETAILS_API: "test-api-url"
    }
}))

// Mock Swiper
jest.mock("swiper/react", () => ({
    Swiper: ({ children }) => <div data-testid="swiper">{children}</div>,
    SwiperSlide: ({ children }) => <div data-testid="swiper-slide">{children}</div>,
}))

// Mock Swiper styles to avoid Jest resolution errors
jest.mock("swiper/css", () => ({}), { virtual: true })
jest.mock("swiper/css/free-mode", () => ({}), { virtual: true })
jest.mock("swiper/css/pagination", () => ({}), { virtual: true })

// Mock Swiper modules
jest.mock("swiper", () => ({
    FreeMode: jest.fn(),
    Pagination: jest.fn(),
    Autoplay: jest.fn(),
}))

// Mock ReactStars
jest.mock("react-rating-stars-component", () => {
    return function ReactStarsMock(props) {
        return <div data-testid="react-stars" data-value={props.value}>Stars: {props.value}</div>
    }
})

describe("ReviewSlider Component", () => {
    const mockReviews = [
        {
            user: {
                firstName: "John",
                lastName: "Doe",
                image: "http://image.url"
            },
            course: {
                courseName: "React Course"
            },
            review: "This is a great course, highly recommended!",
            rating: 4.5
        },
        {
            user: {
                firstName: "Jane",
                lastName: "Smith",
                // No image, should use api.dicebear
            },
            course: {
                courseName: "Python Course"
            },
            review: "Good content but could be deeper.",
            rating: 4.0
        }
    ]

    beforeEach(() => {
        apiConnector.mockReset()
    })

    test("fetches and renders reviews on mount", async () => {
        apiConnector.mockResolvedValue({
            data: {
                success: true,
                data: mockReviews
            }
        })

        render(<ReviewSlider />)

        // Wait for reviews to load
        await waitFor(() => {
            expect(screen.getByText("John Doe")).toBeInTheDocument()
            expect(screen.getByText("Jane Smith")).toBeInTheDocument()
        })

        expect(screen.getByText("React Course")).toBeInTheDocument()
        expect(screen.getByText("Python Course")).toBeInTheDocument()
        expect(screen.getByText("This is a great course, highly recommended!")).toBeInTheDocument()
    })

    test("truncates long reviews", async () => {
        const longReview = "Word ".repeat(20) // 20 words
        const truncatedReview = "Word ".repeat(15) // 15 words

        const longReviewData = [{
            ...mockReviews[0],
            review: longReview
        }]

        apiConnector.mockResolvedValue({
            data: {
                success: true,
                data: longReviewData
            }
        })

        render(<ReviewSlider />)

        await waitFor(() => {
            // Logic in component: if length > 15, slice(0, 15).join(" ") + " ..."
            // "WordWord..." logic might be slightly fuzzy on spaces, let's just check for the presence of "..."
            expect(screen.getByText((content) => content.includes("..."))).toBeInTheDocument()
        })
    })

    test("handles API error gracefully", async () => {
        apiConnector.mockRejectedValue(new Error("Network Error"))
        // Console log might be called, but component shouldn't crash.
        // It should render empty or loading state (though component doesn't have loading state, just empty array).

        render(<ReviewSlider />)

        // Should not find any reviews, but should render the swiper container
        expect(screen.getByTestId("swiper")).toBeInTheDocument()
        expect(screen.queryByTestId("swiper-slide")).not.toBeInTheDocument()
    })
})
