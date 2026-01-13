import { render, screen, fireEvent } from "@testing-library/react"
import ConfirmationModal from "../../../components/Common/ConfirmationModal"

describe("ConfirmationModal Component", () => {
    const mockData = {
        text1: "Are you sure?",
        text2: "This action cannot be undone.",
        btn1Text: "Yes",
        btn2Text: "Cancel",
        btn1Handler: jest.fn(),
        btn2Handler: jest.fn(),
    }

    test("renders modal content correctly", () => {
        render(<ConfirmationModal modalData={mockData} />)
        expect(screen.getByText("Are you sure?")).toBeInTheDocument()
        expect(screen.getByText("This action cannot be undone.")).toBeInTheDocument()
        expect(screen.getByText("Yes")).toBeInTheDocument()
        expect(screen.getByText("Cancel")).toBeInTheDocument()
    })

    test("calls handlers when buttons are clicked", () => {
        render(<ConfirmationModal modalData={mockData} />)

        fireEvent.click(screen.getByText("Yes"))
        expect(mockData.btn1Handler).toHaveBeenCalledTimes(1)

        fireEvent.click(screen.getByText("Cancel"))
        expect(mockData.btn2Handler).toHaveBeenCalledTimes(1)
    })
})
