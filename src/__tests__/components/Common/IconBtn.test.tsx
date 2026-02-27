// @ts-nocheck
import { render, screen, fireEvent } from "@testing-library/react"
import IconBtn from "../../../components/Common/IconBtn"

describe("IconBtn Component", () => {
    test("renders with text only", () => {
        render(<IconBtn text="Click Me" onclick={jest.fn()} />)
        expect(screen.getByText("Click Me")).toBeInTheDocument()
        expect(screen.getByRole("button")).toBeInTheDocument()
    })

    test("renders with children", () => {
        render(
            <IconBtn text="With Icon" onclick={jest.fn()}>
                <span>Icon</span>
            </IconBtn>
        )
        expect(screen.getByText("With Icon")).toBeInTheDocument()
        expect(screen.getByText("Icon")).toBeInTheDocument()
    })

    test("calls onclick handler when clicked", () => {
        const handleClick = jest.fn()
        render(<IconBtn text="Click Me" onclick={handleClick} />)

        fireEvent.click(screen.getByRole("button"))
        expect(handleClick).toHaveBeenCalledTimes(1)
    })

    test("is disabled when disabled prop is true", () => {
        render(<IconBtn text="Disabled" onclick={jest.fn()} disabled={true} />)
        expect(screen.getByRole("button")).toBeDisabled()
    })

    test("applies outline styling", () => {
        // Note: Checking specific classes depends on implementation details
        // which might be brittle, but ensures outline prop does something.
        const { container } = render(
            <IconBtn text="Outline" onclick={jest.fn()} outline={true} />
        )
        expect(container.firstChild).toHaveClass("border-yellow-50 bg-transparent")
    })
})
