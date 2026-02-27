// @ts-nocheck
import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Footer from "../../../components/Common/Footer";

// Mock the data to verify rendering logic independent of content changes
jest.mock("../../../data/footer-links", () => ({
    FooterLink2: [
        {
            title: "Subjects",
            links: [
                { title: "Al", link: "/al" },
                { title: "Cloud", link: "/cloud" },
            ],
        },
        {
            title: "Languages",
            links: [
                { title: "Bash", link: "/bash" },
                { title: "C++", link: "/c++" },
            ],
        },
    ],
}));

describe("Footer Component", () => {
    test("renders Footer component without crashing", () => {
        render(
            <MemoryRouter>
                <Footer />
            </MemoryRouter>
        );
        expect(screen.getByText("Company")).toBeInTheDocument();
    });

    test("renders all main sections", () => {
        render(
            <MemoryRouter>
                <Footer />
            </MemoryRouter>
        );
        // Static sections from the component itself
        expect(screen.getByText("Company")).toBeInTheDocument();
        expect(screen.getByText("Resources")).toBeInTheDocument();
        expect(screen.getByText("Plans")).toBeInTheDocument();
        expect(screen.getByText("Community")).toBeInTheDocument();
    });

    test("renders dynamic sections from footer-links data", () => {
        render(
            <MemoryRouter>
                <Footer />
            </MemoryRouter>
        );
        // From our mock
        expect(screen.getByText("Subjects")).toBeInTheDocument();
        expect(screen.getByText("Al")).toBeInTheDocument();
        expect(screen.getByText("Languages")).toBeInTheDocument();
        expect(screen.getByText("Bash")).toBeInTheDocument();
    });

    test("renders bottom footer links", () => {
        render(
            <MemoryRouter>
                <Footer />
            </MemoryRouter>
        );
        expect(screen.getByText("Privacy Policy")).toBeInTheDocument();
        expect(screen.getByText("Cookie Policy")).toBeInTheDocument();
        expect(screen.getByText("Terms")).toBeInTheDocument();
    });
});
