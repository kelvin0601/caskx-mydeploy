import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
    baseDirectory: __dirname,
});

const eslintConfig = [
    {
        ignores: ["src/__tests__/**", ".next/**", "dist/**", "node_modules/**"],
    },
    ...compat.extends("next/core-web-vitals", "next/typescript"),
    {
        rules: {
            "@typescript-eslint/no-unused-vars": "off",
        },
    },
    {
        files: [
            "src/modules/dashboard/**/*.{ts,tsx}",
            "src/layouts/DashboardLayout/**/*.{ts,tsx}",
        ],
        rules: {
            "no-restricted-syntax": [
                "error",
                {
                    selector:
                        "Literal[value=/grid-cols-\\[[^\\]]*(px|rem|auto)/]",
                    message:
                        "Dashboard grid tracks must use fractional fr values. Keep fixed image/control sizing inside the grid cell.",
                },
                {
                    selector:
                        "TemplateElement[value.raw=/grid-cols-\\[[^\\]]*(px|rem|auto)/]",
                    message:
                        "Dashboard grid tracks must use fractional fr values. Keep fixed image/control sizing inside the grid cell.",
                },
            ],
        },
    },
];

export default eslintConfig;
