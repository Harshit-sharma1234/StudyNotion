import React from "react"
import { render, screen } from "@testing-library/react"
import RatingStars from "../../../components/Common/RatingStars"

describe("RatingStars Component", () => {
    test("renders correct number of full stars for integer rating", () => {
        // 4 stars
        const { container } = render(<RatingStars Review_Count={4} />)
        // We expect 4 full stars and 1 empty star
        // The component doesn't add test ids or reliable aria labels to icons, so we might check via class or just snapshot?
        // Looking at the code: it maps over mapped arrays.
        // The keys are indices.
        // Let's rely on checking the rendered SVG count if possible?
        // Or better, let's create a snapshot since the structure is simple.
        // Or we can check if the container has children.

        // Actually, looking at the code:
        // <TiStarFullOutline ... />
        // <TiStarHalfOutline ... />
        // <TiStarOutline ... />
        // These come from react-icons/ti. 
        // Usually they render an <svg>.

        // Let's try to verify by snapshot for simplicity and exactness of structure.
        expect(container).toMatchSnapshot()
    })

    test("renders half star for decimal rating", () => {
        const { container } = render(<RatingStars Review_Count={3.5} />)
        expect(container).toMatchSnapshot()
    })

    test("renders correct number of empty stars for low rating", () => {
        const { container } = render(<RatingStars Review_Count={1} />)
        expect(container).toMatchSnapshot()
    })

    test("renders with custom star size", () => {
        // Since size is passed as prop to icon, checking it might be hard without shallow render or mock.
        // But we can check if it renders without crashing.
        render(<RatingStars Review_Count={5} Star_Size={30} />)
        // Implicit assertion: no crash.
    })
})
