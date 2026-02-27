// @ts-nocheck
import { render, screen, fireEvent } from "@testing-library/react"
import Tab from "../../../components/Common/Tab"

describe("Tab Component", () => {
    const tabData = [
        { id: 1, type: "student", tabName: "Student" },
        { id: 2, type: "instructor", tabName: "Instructor" },
    ]
    const setField = jest.fn()

    test("renders all tabs", () => {
        render(<Tab tabData={tabData} field="student" setField={setField} />)
        expect(screen.getByText("Student")).toBeInTheDocument()
        expect(screen.getByText("Instructor")).toBeInTheDocument()
    })

    test("highlights active tab", () => {
        render(<Tab tabData={tabData} field="student" setField={setField} />)

        const studentTab = screen.getByText("Student")
        const instructorTab = screen.getByText("Instructor")

        expect(studentTab).toHaveClass("bg-richblack-900")
        expect(instructorTab).toHaveClass("bg-transparent")
    })

    test("calls setField when tab is clicked", () => {
        render(<Tab tabData={tabData} field="student" setField={setField} />)

        fireEvent.click(screen.getByText("Instructor"))
        expect(setField).toHaveBeenCalledWith("instructor")
    })
})
