import { fireEvent, render, screen } from "@testing-library/react";
import { AddNewVintageCard } from "@/components/shared/listing-cask-add-v2/AddNewVintageCard";

jest.mock("query-string", () => ({
    stringify: jest.fn((obj) =>
        Object.entries(obj)
            .map(([key, value]) => `${key}=${value}`)
            .join("&")
    ),
    parse: jest.fn((value) =>
        Object.fromEntries(new URLSearchParams(value as string))
    ),
}));

describe("AddNewVintageCard", () => {
    it("renders the Figma empty state and adds a vintage on click", () => {
        const onAdd = jest.fn();

        render(<AddNewVintageCard onAdd={onAdd} />);

        expect(screen.getByText("No vintage available")).toBeInTheDocument();
        expect(
            screen.getByRole("button", { name: "Add New Vintage" })
        ).toBeInTheDocument();
        expect(screen.queryByRole("img")).not.toBeInTheDocument();

        fireEvent.click(
            screen.getByRole("button", { name: "Add New Vintage" })
        );

        expect(onAdd).toHaveBeenCalledTimes(1);
    });
});
