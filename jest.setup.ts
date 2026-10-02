require("dotenv").config();

jest.mock("next/font/google", () => ({
    Inter: () => ({ variable: "--font-inter", className: "font-inter" }),
    Work_Sans: () => ({
        variable: "--font-work-sans",
        className: "font-work-sans",
    }),
    Coda: () => ({ variable: "--font-coda", className: "font-coda" }),
}));

jest.mock("next/font/local", () => () => ({
    variable: "--font-local",
    className: "font-local",
}));
