import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CaskEditMoreActions } from "@/modules/dashboard/listing-cask/edit_v2/CaskEditMoreActions";

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
    Check: () => <span aria-hidden="true" />,
    ChevronRight: () => <span aria-hidden="true" />,
    Circle: () => <span aria-hidden="true" />,
}));

jest.mock("@/components/shared/icons/icon-dots-horizontal", () => ({
    __esModule: true,
    default: () => <span aria-hidden="true" />,
}));

describe("CaskEditMoreActions", () => {
    const openMenu = async (user: ReturnType<typeof userEvent.setup>) => {
        await user.click(screen.getByRole("button", { name: "More actions" }));
    };

    it("renders View and Delete without Duplicate", async () => {
        const user = userEvent.setup();

        render(
            <CaskEditMoreActions
                activeAction={0}
                onActiveActionChange={jest.fn()}
                onView={jest.fn()}
                onDelete={jest.fn()}
            />
        );

        await openMenu(user);

        expect(
            await screen.findByRole("menuitem", { name: "View" })
        ).toBeInTheDocument();
        expect(
            screen.getByRole("menuitem", { name: "Delete" })
        ).toBeInTheDocument();
        expect(
            screen.queryByRole("menuitem", { name: "Duplicate" })
        ).not.toBeInTheDocument();
        expect(screen.getAllByRole("menuitem")).toHaveLength(2);
    });

    it("calls the View and Delete handlers", async () => {
        const user = userEvent.setup();
        const onView = jest.fn();
        const onDelete = jest.fn();

        render(
            <CaskEditMoreActions
                activeAction={0}
                onActiveActionChange={jest.fn()}
                onView={onView}
                onDelete={onDelete}
            />
        );

        await openMenu(user);
        await user.click(await screen.findByRole("menuitem", { name: "View" }));
        expect(onView).toHaveBeenCalledTimes(1);

        await openMenu(user);
        await user.click(
            await screen.findByRole("menuitem", { name: "Delete" })
        );
        expect(onDelete).toHaveBeenCalledTimes(1);
    });

    it("closes the dropdown when Escape is pressed", async () => {
        const user = userEvent.setup();

        render(
            <CaskEditMoreActions
                activeAction={0}
                onActiveActionChange={jest.fn()}
                onView={jest.fn()}
                onDelete={jest.fn()}
            />
        );

        await openMenu(user);
        expect(
            await screen.findByRole("menuitem", { name: "View" })
        ).toBeInTheDocument();

        await user.keyboard("{Escape}");
        expect(
            screen.queryByRole("menuitem", { name: "View" })
        ).not.toBeInTheDocument();
    });
});
