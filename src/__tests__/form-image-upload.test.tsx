import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FormImageUpload } from "@/components/shared/form-image-upload";
import React from "react";
import { UseFormSetValue, FieldValues } from "react-hook-form";

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

jest.mock("lucide-react", () => ({
    EyeIcon: () => <span aria-hidden="true" />,
    EyeOff: () => <span aria-hidden="true" />,
    Trash2: () => <span aria-hidden="true" />,
}));

describe("FormImageUpload", () => {
    it("renders the initial image from defaultValue and removes it when trash button is clicked", async () => {
        const user = userEvent.setup();
        const setValue: UseFormSetValue<FieldValues> = jest.fn();
        const onValueChange = jest.fn();

        const form = {
            setValue,
        };

        const { rerender } = render(
            <FormImageUpload
                fieldName="imageUrl"
                form={form}
                defaultValue={["https://example.com/test-vintage.jpg"]}
                onValueChange={onValueChange}
                appearance="general-information"
            />
        );

        // Verify initial image preview is present
        const removeBtn = screen.getByRole("button", { name: "Remove image" });
        expect(removeBtn).toBeInTheDocument();
        expect(
            screen.getByRole("img", {
                name: "https://example.com/test-vintage.jpg",
            })
        ).toBeInTheDocument();

        // Click remove image
        await user.click(removeBtn);

        // Verify image preview and remove button are removed
        expect(
            screen.queryByRole("button", { name: "Remove image" })
        ).not.toBeInTheDocument();
        expect(
            screen.queryByRole("img", {
                name: "https://example.com/test-vintage.jpg",
            })
        ).not.toBeInTheDocument();

        // Verify empty state is displayed
        expect(screen.getByText("Click to upload")).toBeInTheDocument();

        // Verify handlers were called with empty/null
        expect(onValueChange).toHaveBeenCalledWith(null);
        expect(setValue).toHaveBeenCalledWith("imageUrl", "");

        // Re-render component with the same defaultValue (simulating parent re-renders)
        rerender(
            <FormImageUpload
                fieldName="imageUrl"
                form={form}
                defaultValue={["https://example.com/test-vintage.jpg"]}
                onValueChange={onValueChange}
                appearance="general-information"
            />
        );

        // Verify image is NOT resurrected into the box
        expect(
            screen.queryByRole("button", { name: "Remove image" })
        ).not.toBeInTheDocument();
        expect(
            screen.queryByRole("img", {
                name: "https://example.com/test-vintage.jpg",
            })
        ).not.toBeInTheDocument();
        expect(screen.getByText("Click to upload")).toBeInTheDocument();
    });

    it("resets image when defaultValue explicitly changes to a new value", async () => {
        const setValue: UseFormSetValue<FieldValues> = jest.fn();
        const onValueChange = jest.fn();
        const form = { setValue };

        const { rerender } = render(
            <FormImageUpload
                fieldName="imageUrl"
                form={form}
                defaultValue={["https://example.com/vintage-1.jpg"]}
                onValueChange={onValueChange}
                appearance="general-information"
            />
        );

        expect(
            screen.getByRole("img", {
                name: "https://example.com/vintage-1.jpg",
            })
        ).toBeInTheDocument();

        // Change defaultValue to vintage-2
        rerender(
            <FormImageUpload
                fieldName="imageUrl"
                form={form}
                defaultValue={["https://example.com/vintage-2.jpg"]}
                onValueChange={onValueChange}
                appearance="general-information"
            />
        );

        expect(
            screen.getByRole("img", {
                name: "https://example.com/vintage-2.jpg",
            })
        ).toBeInTheDocument();
    });
});
