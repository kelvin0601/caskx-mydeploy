// Mock query-string to avoid ESM issues
jest.mock("query-string", () => ({
    stringify: jest.fn((obj) =>
        Object.entries(obj)
            .map(([k, v]) => `${k}=${v}`)
            .join("&")
    ),
    parse: jest.fn((str) => Object.fromEntries(new URLSearchParams(str))),
}));

import { render, screen } from "@testing-library/react";
import { InfoRow } from "@/components/shared/info-row";

describe("InfoRow", () => {
    it("renders vertical orientation with label and value", () => {
        render(
            <InfoRow
                label="Email"
                value="test@example.com"
                orientation="vertical"
            />
        );

        expect(screen.getByText("Email")).toBeInTheDocument();
        expect(screen.getByText("test@example.com")).toBeInTheDocument();
    });

    it("renders horizontal orientation with label and value", () => {
        render(
            <InfoRow label="Name" value="John Doe" orientation="horizontal" />
        );

        expect(screen.getByText("Name")).toBeInTheDocument();
        expect(screen.getByText("John Doe")).toBeInTheDocument();
    });

    it("applies vertical class when orientation is vertical", () => {
        const { container } = render(
            <InfoRow
                label="Email"
                value="test@example.com"
                orientation="vertical"
            />
        );

        const wrapper = container.firstChild;
        expect(wrapper).toHaveClass("flex-col");
    });

    it("applies custom className", () => {
        const { container } = render(
            <InfoRow
                label="Email"
                value="test@example.com"
                className="custom-class"
            />
        );

        const wrapper = container.firstChild;
        expect(wrapper).toHaveClass("custom-class");
    });

    it("defaults to horizontal orientation", () => {
        const { container } = render(<InfoRow label="Name" value="John Doe" />);

        const wrapper = container.firstChild;
        expect(wrapper).not.toHaveClass("flex-col");
    });

    it("renders React node as value", () => {
        render(
            <InfoRow
                label="Website"
                value={<a href="https://example.com">example.com</a>}
                orientation="vertical"
            />
        );

        expect(screen.getByText("example.com")).toBeInTheDocument();
        expect(screen.getByRole("link")).toHaveAttribute(
            "href",
            "https://example.com"
        );
    });
});
