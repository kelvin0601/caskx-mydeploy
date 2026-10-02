#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const ROOT = process.cwd();
const BUDGET = 100_000;

const IGNORE_DIRS = new Set([
    ".git",
    ".next",
    ".turbo",
    "build",
    "coverage",
    "dist",
    "node_modules",
    ".idea",
    ".vscode",
]);

const APP_ROUTE_FILES = new Set([
    "page.tsx",
    "route.ts",
]);

const APP_SHELL_FILES = new Set([
    "layout.tsx",
    "error.tsx",
    "global-error.tsx",
    "not-found.tsx",
    "robots.ts",
    "sitemap.ts",
    "_loading.tsx",
]);

const PATTERNS = [
    {
        title: "Add a route page",
        verifiedAgainst: [
            "src/app/(site)/(root)/marketplace/page.tsx",
            "src/app/(site)/(root)/distillery/page.tsx",
        ],
        mirror:
            "Keep the page thin. Let it import a feature module and keep route-specific data fetching in the page layer.",
        steps: [
            "Create `src/app/<segment>/page.tsx` for the route shell.",
            "Import the matching module from `src/modules/<feature>/` instead of inlining the full screen.",
            "Keep `layout.tsx` and route-group concerns in the nearest app segment.",
        ],
        notTouched:
            "`src/components/ui/*` - route assembly should not fork primitives.",
    },
    {
        title: "Add a feature module screen",
        verifiedAgainst: [
            "src/modules/home/index.tsx",
            "src/modules/cask-listing/index.tsx",
        ],
        mirror:
            "The module owns orchestration. Split the UI into nested folders only when the screen starts to carry real complexity.",
        steps: [
            "Create `src/modules/<name>/index.tsx` as the entry surface.",
            "Move reusable subpieces into sibling folders such as `banner/`, `sidebar/`, `forms/`, or `pages/`.",
            "Keep cross-page primitives in `src/components/shared/` instead of duplicating them inside the module.",
        ],
        notTouched:
            "`src/app/*` - pages should stay as route shells, not feature implementations.",
    },
    {
        title: "Add a service plus server action",
        verifiedAgainst: [
            "src/services/distilleries.ts",
            "src/services/server-action/distillery.ts",
        ],
        mirror:
            "Put network logic in `src/services/`, then wrap server-rendered data access in `src/services/server-action/` when a page prefetches through React Query.",
        steps: [
            "Add the API client function in `src/services/<domain>.ts`.",
            "Add the server-action wrapper in `src/services/server-action/<domain>.ts` if the route prefetches data.",
            "Reuse shared constants and query keys instead of hardcoding string literals in the page.",
        ],
        notTouched:
            "`src/modules/<name>/` - the module should consume the service, not duplicate it.",
    },
    {
        title: "Add a shared component",
        verifiedAgainst: [
            "src/components/shared/distillery-card/index.tsx",
            "src/components/shared/category-card/index.tsx",
        ],
        mirror:
            "Shared components stay feature-neutral. If the component starts carrying product-specific logic, promote that logic back into the relevant module.",
        steps: [
            "Create `src/components/shared/<name>/index.tsx` for the shared surface.",
            "Split internal subparts only if they are reused or independently testable.",
            "Keep layout, sizing, and behavior generic enough to be reused by multiple modules.",
        ],
        notTouched:
            "`src/services/` - shared UI should not own API access.",
    },
    {
        title: "Add a Zustand slice",
        verifiedAgainst: [
            "src/store/slices/authSlice.ts",
            "src/store/slices/caskSlice.ts",
        ],
        mirror:
            "Slices are small and focused. Keep data derivation near the slice and keep feature wiring in the provider or module that consumes it.",
        steps: [
            "Create `src/store/slices/<feature>Slice.ts` with a narrowly scoped state shape.",
            "Export selectors or hooks from the local store entry point when multiple components need the same state.",
            "Avoid baking server-fetched data flow into the slice unless the state is truly cross-route.",
        ],
        notTouched:
            "`src/components/ui/*` - primitives should not know about store internals.",
    },
];

function readText(relPath) {
    return fs.readFileSync(path.join(ROOT, relPath), "utf8");
}

function fileExists(relPath) {
    return fs.existsSync(path.join(ROOT, relPath));
}

function listDir(relPath) {
    const absPath = path.join(ROOT, relPath);
    if (!fs.existsSync(absPath)) {
        return [];
    }

    return fs
        .readdirSync(absPath, { withFileTypes: true })
        .filter((entry) => !entry.name.startsWith("."))
        .sort((left, right) => left.name.localeCompare(right.name));
}

function walkFiles(relPath, options = {}) {
    const {
        maxDepth = Infinity,
        include = () => true,
        depth = 0,
    } = options;

    const absPath = path.join(ROOT, relPath);
    if (!fs.existsSync(absPath)) {
        return [];
    }

    const entries = fs
        .readdirSync(absPath, { withFileTypes: true })
        .filter((entry) => !entry.name.startsWith("."))
        .sort((left, right) => left.name.localeCompare(right.name));

    const results = [];

    for (const entry of entries) {
        const childRel = path.posix.join(relPath, entry.name);
        if (entry.isDirectory()) {
            if (depth < maxDepth) {
                results.push(...walkFiles(childRel, { maxDepth, include, depth: depth + 1 }));
            }
            continue;
        }

        if (include(childRel, entry)) {
            results.push(childRel);
        }
    }

    return results;
}

function humanizeSegment(segment) {
    return segment
        .replace(/^\((.*)\)$/, "$1")
        .replace(/^\[(.*)\]$/, "$1")
        .replace(/^_+/, "")
        .replace(/-/g, " ")
        .replace(/_/g, " ")
        .replace(/\b\w/g, (match) => match.toUpperCase());
}

function formatListLine(items, maxItems = 5) {
    if (items.length === 0) {
        return "none";
    }

    const shown = items.slice(0, maxItems);
    const tail = items.length > maxItems ? `, +${items.length - maxItems} more` : "";
    return `${shown.join(", ")}${tail}`;
}

function findModuleImport(fileRelPath) {
    const source = readText(fileRelPath);
    const matches = [...source.matchAll(/from\s+["']@\/modules\/([^"']+)["']/g)];
    if (matches.length === 0) {
        return null;
    }

    const modulePath = matches[0][1].replace(/\/index$/, "");
    return `src/modules/${modulePath}`;
}

function routePathFromFile(fileRelPath) {
    const parts = fileRelPath.split(path.posix.sep);
    const appIndex = parts.indexOf("app");
    const remainder = parts.slice(appIndex + 1);
    const fileName = remainder.pop();

    const routeParts = remainder.filter((segment) => !/^\(.*\)$/.test(segment));
    if (fileName !== "page.tsx" && fileName !== "route.ts") {
        return null;
    }

    if (routeParts.length === 0) {
        return "/";
    }

    return `/${routeParts.join("/")}`;
}

function routeGroupFromFile(fileRelPath) {
    const parts = fileRelPath.split(path.posix.sep);
    const appIndex = parts.indexOf("app");
    const remainder = parts.slice(appIndex + 1);
    const group = remainder.find((segment) => /^\(.*\)$/.test(segment));

    if (!group) {
        return "Ungrouped";
    }

    return humanizeSegment(group);
}

function summarizeModuleDirectory(dirRelPath) {
    const entries = listDir(dirRelPath);
    const files = entries.filter((entry) => entry.isFile()).map((entry) => entry.name);
    const dirs = entries.filter((entry) => entry.isDirectory()).map((entry) => entry.name);

    const entryFiles = files.filter((name) => /^index\.(ts|tsx)$/.test(name));
    const supportingFiles = files.filter((name) => !/^index\.(ts|tsx)$/.test(name) && !/^README\.md$/i.test(name));

    const parts = [];
    if (entryFiles.length > 0) {
        parts.push(entryFiles.join(" + "));
    }
    if (dirs.length > 0) {
        parts.push(`children: ${formatListLine(dirs)}`);
    }
    if (supportingFiles.length > 0) {
        parts.push(`files: ${formatListLine(supportingFiles)}`);
    }

    return parts.length > 0 ? parts.join("; ") : "empty folder";
}

function summarizeSharedComponent(dirRelPath) {
    const entries = listDir(dirRelPath);
    const files = entries.filter((entry) => entry.isFile()).map((entry) => entry.name);
    const dirs = entries.filter((entry) => entry.isDirectory()).map((entry) => entry.name);
    const parts = [];

    if (files.includes("index.tsx")) {
        parts.push("index.tsx");
    } else if (files.includes("index.ts")) {
        parts.push("index.ts");
    }

    if (files.includes("README.md")) {
        parts.push("README.md");
    }

    const localChildren = dirs.slice(0, 4);
    if (localChildren.length > 0) {
        parts.push(`children: ${formatListLine(localChildren)}`);
    }

    const otherFiles = files.filter((name) => !["index.tsx", "index.ts", "README.md"].includes(name));
    if (otherFiles.length > 0) {
        parts.push(`files: ${formatListLine(otherFiles)}`);
    }

    return parts.length > 0 ? parts.join("; ") : "empty folder";
}

function summarizeServiceDirectory(dirRelPath) {
    const entries = listDir(dirRelPath);
    const files = entries.filter((entry) => entry.isFile()).map((entry) => entry.name);
    const dirs = entries.filter((entry) => entry.isDirectory()).map((entry) => entry.name);

    const parts = [];
    if (dirs.length > 0) {
        parts.push(`subdirs: ${formatListLine(dirs)}`);
    }
    if (files.length > 0) {
        parts.push(`files: ${formatListLine(files)}`);
    }

    return parts.length > 0 ? parts.join("; ") : "empty folder";
}

function summarizeFlatDirectory(dirRelPath, maxItems = 5) {
    const entries = listDir(dirRelPath);
    const files = entries.filter((entry) => entry.isFile()).map((entry) => entry.name);
    const dirs = entries.filter((entry) => entry.isDirectory()).map((entry) => entry.name);
    const parts = [];

    if (dirs.length > 0) {
        parts.push(`dirs: ${formatListLine(dirs, maxItems)}`);
    }
    if (files.length > 0) {
        parts.push(`files: ${formatListLine(files, maxItems)}`);
    }

    return parts.length > 0 ? parts.join("; ") : "empty folder";
}

function getGitInfo() {
    let commit = "unknown";
    let dirty = false;

    try {
        commit = execFileSync("git", ["rev-parse", "--short", "HEAD"], {
            cwd: ROOT,
            encoding: "utf8",
        }).trim();
    } catch {
        commit = "unknown";
    }

    try {
        const status = execFileSync("git", ["status", "--porcelain"], {
            cwd: ROOT,
            encoding: "utf8",
        }).trim();
        dirty = status.length > 0;
    } catch {
        dirty = false;
    }

    return { commit, dirty };
}

function collectAppEntries() {
    const pageFiles = walkFiles("src/app", {
        include: (relPath, entry) =>
            entry.isFile() && APP_ROUTE_FILES.has(entry.name),
    }).filter((relPath) => !/\/api\//.test(relPath));

    const shellFiles = walkFiles("src/app", {
        include: (relPath, entry) =>
            entry.isFile() && APP_SHELL_FILES.has(entry.name),
    });

    const apiRoutes = pageFiles
        .filter((relPath) => /\/route\.ts$/.test(relPath))
        .sort((left, right) => left.localeCompare(right));

    const pageRoutes = pageFiles
        .filter((relPath) => /\/page\.tsx$/.test(relPath))
        .sort((left, right) => left.localeCompare(right));

    const grouped = new Map();
    for (const fileRelPath of pageRoutes) {
        const group = routeGroupFromFile(fileRelPath);
        const list = grouped.get(group) || [];
        list.push(fileRelPath);
        grouped.set(group, list);
    }

    return {
        groupedPageRoutes: [...grouped.entries()].sort((left, right) =>
            left[0].localeCompare(right[0]),
        ),
        apiRoutes,
        shellFiles: shellFiles.sort((left, right) => left.localeCompare(right)),
    };
}

function collectTopLevelDirectories(baseRelPath) {
    const absPath = path.join(ROOT, baseRelPath);
    if (!fs.existsSync(absPath)) {
        return [];
    }

    return fs
        .readdirSync(absPath, { withFileTypes: true })
        .filter((entry) => entry.isDirectory() && !entry.name.startsWith("."))
        .map((entry) => entry.name)
        .sort((left, right) => left.localeCompare(right));
}

function collectTopLevelFiles(baseRelPath) {
    const absPath = path.join(ROOT, baseRelPath);
    if (!fs.existsSync(absPath)) {
        return [];
    }

    return fs
        .readdirSync(absPath, { withFileTypes: true })
        .filter((entry) => entry.isFile() && !entry.name.startsWith("."))
        .map((entry) => entry.name)
        .sort((left, right) => left.localeCompare(right));
}

function buildCodeMap() {
    const { commit, dirty } = getGitInfo();
    const generatedAt = new Date().toLocaleString("en-GB", {
        dateStyle: "medium",
        timeStyle: "short",
    });
    const banner = [
        "# CODEMAP",
        "",
        `Generated: ${generatedAt}`,
        `Commit: ${commit}${dirty ? " (dirty)" : ""}`,
        "Regenerate: npm run codemap",
        "",
        "This file is generated from the current repo tree. Read it first when you need orientation, then open the source files it points to.",
    ];

    const lines = [...banner, ""];

    const { groupedPageRoutes, apiRoutes, shellFiles } = collectAppEntries();

    lines.push("## App Routes");
    for (const [group, routes] of groupedPageRoutes) {
        lines.push(`### ${group}`);
        for (const fileRelPath of routes) {
            const routePath = routePathFromFile(fileRelPath);
            const moduleImport = findModuleImport(fileRelPath);
            const suffix = moduleImport ? ` | module: \`${moduleImport}\`` : "";
            lines.push(`- \`${routePath}\` — \`${fileRelPath}\`${suffix}`);
        }
        lines.push("");
    }

    lines.push("## API Routes");
    if (apiRoutes.length === 0) {
        lines.push("- none");
    } else {
        for (const fileRelPath of apiRoutes) {
            const routePath = routePathFromFile(fileRelPath);
            lines.push(`- \`${routePath}\` — \`${fileRelPath}\``);
        }
    }
    lines.push("");

    lines.push("## App Shells");
    if (shellFiles.length === 0) {
        lines.push("- none");
    } else {
        for (const fileRelPath of shellFiles) {
            lines.push(`- \`${fileRelPath}\``);
        }
    }
    lines.push("");

    lines.push("## Feature Modules");
    for (const moduleName of collectTopLevelDirectories("src/modules")) {
        const dirRelPath = path.posix.join("src/modules", moduleName);
        lines.push(`- \`${dirRelPath}/\` — ${summarizeModuleDirectory(dirRelPath)}`);
    }
    lines.push("");

    lines.push("## Shared Components");
    for (const componentName of collectTopLevelDirectories("src/components/shared")) {
        const dirRelPath = path.posix.join("src/components/shared", componentName);
        lines.push(`- \`${dirRelPath}/\` — ${summarizeSharedComponent(dirRelPath)}`);
    }
    lines.push("");

    lines.push("## UI Primitives");
    for (const primitiveName of collectTopLevelFiles("src/components/ui")) {
        lines.push(`- \`src/components/ui/${primitiveName}\``);
    }
    lines.push("");

    lines.push("## Services");
    lines.push(`- \`src/services/\` — ${summarizeServiceDirectory("src/services")}`);
    lines.push(`- \`src/services/server-action/\` — ${summarizeServiceDirectory("src/services/server-action")}`);
    lines.push(`- \`src/services/socket/\` — ${summarizeServiceDirectory("src/services/socket")}`);
    lines.push(`- \`src/services/external/\` — ${summarizeServiceDirectory("src/services/external")}`);
    lines.push("");

    lines.push("## State");
    lines.push(`- \`src/store/\` — ${summarizeFlatDirectory("src/store")}`);
    lines.push(`- \`src/store/slices/\` — ${summarizeFlatDirectory("src/store/slices")}`);
    lines.push(`- \`src/store/account/\` — ${summarizeFlatDirectory("src/store/account")}`);
    lines.push(`- \`src/store/checkout/\` — ${summarizeFlatDirectory("src/store/checkout")}`);
    lines.push(`- \`src/store/dashboard/\` — ${summarizeFlatDirectory("src/store/dashboard")}`);
    lines.push("");

    lines.push("## Config, Lib, Helpers");
    lines.push(`- \`src/config/\` — ${summarizeFlatDirectory("src/config")}`);
    lines.push(`- \`src/lib/\` — ${summarizeFlatDirectory("src/lib")}`);
    lines.push(`- \`src/helpers/\` — ${summarizeFlatDirectory("src/helpers")}`);
    lines.push("");

    lines.push("## Assets");
    lines.push(`- \`src/assets/styles/\` — ${summarizeFlatDirectory("src/assets/styles")}`);
    lines.push(`- \`src/assets/content/\` — ${summarizeFlatDirectory("src/assets/content", 8)}`);
    lines.push(`- \`public/fonts/\` — ${summarizeFlatDirectory("public/fonts", 6)}`);
    lines.push(`- \`public/images/\` — ${summarizeFlatDirectory("public/images", 8)}`);
    lines.push(`- \`public/icons/\` — ${summarizeFlatDirectory("public/icons", 8)}`);
    lines.push("");

    lines.push("## Scripts");
    const packageJson = JSON.parse(readText("package.json"));
    for (const [scriptName, scriptCommand] of Object.entries(packageJson.scripts || {})) {
        lines.push(`- \`${scriptName}\` — \`${scriptCommand}\``);
    }
    lines.push("");

    lines.push("## Env Vars");
    const envVars = new Map();
    const envFiles = [
        "next.config.ts",
        "Dockerfile",
        "src/config/env.ts",
        "src/lib/auth-middleware.ts",
        "src/lib/constants/auth.ts",
        "src/middleware.ts",
    ].filter(fileExists);

    for (const relPath of envFiles) {
        const source = readText(relPath);
        for (const match of source.matchAll(/process\.env\.([A-Z0-9_]+)/g)) {
            const name = match[1];
            if (!envVars.has(name)) {
                envVars.set(name, new Set());
            }
            envVars.get(name).add(relPath);
        }
    }

    for (const [name, sources] of [...envVars.entries()].sort((left, right) =>
        left[0].localeCompare(right[0]),
    )) {
        lines.push(`- \`${name}\` — ${formatListLine([...sources].sort(), 3)}`);
    }

    lines.push("");
    lines.push("## Notes");
    lines.push("- This map is generated from the repo tree, not hand-written.");
    lines.push("- If a section is stale, regenerate before trusting it.");

    const output = lines.join("\n").trimEnd() + "\n";
    return output.length > BUDGET
        ? `${output.slice(0, BUDGET - 24).trimEnd()}\n\n… truncated to stay within budget\n`
        : output;
}

function buildPatterns() {
    const { commit, dirty } = getGitInfo();
    const generatedAt = new Date().toLocaleString("en-GB", {
        dateStyle: "medium",
        timeStyle: "short",
    });

    const lines = [
        "# PATTERNS",
        "",
        `Generated: ${generatedAt}`,
        `Commit: ${commit}${dirty ? " (dirty)" : ""}`,
        "Regenerate: npm run codemap",
        "",
        "These patterns are derived from real files in this repo. If a reference path disappears, the section is flagged stale instead of silently drifting.",
        "",
    ];

    for (const pattern of PATTERNS) {
        const missing = pattern.verifiedAgainst.filter((relPath) => !fileExists(relPath));
        const staleLabel = missing.length > 0 ? `  ⚠ STALE (missing: ${missing.join(", ")})` : "";
        lines.push(`### ${pattern.title}${staleLabel}`);
        lines.push(`Verified against: ${pattern.verifiedAgainst.map((relPath) => `\`${relPath}\``).join(", ")}`);
        lines.push(`Mirror: ${pattern.mirror}`);
        lines.push("Steps:");
        pattern.steps.forEach((step, index) => {
            lines.push(`${index + 1}. ${step}`);
        });
        lines.push(`Not touched: ${pattern.notTouched}`);
        lines.push("");
    }

    const output = lines.join("\n").trimEnd() + "\n";
    return output;
}

function writeIfChanged(relPath, content) {
    const absPath = path.join(ROOT, relPath);
    const existing = fs.existsSync(absPath) ? fs.readFileSync(absPath, "utf8") : null;
    if (existing === content) {
        return false;
    }

    fs.writeFileSync(absPath, content);
    return true;
}

function main() {
    const codemap = buildCodeMap();
    const patterns = buildPatterns();

    const changedCodemap = writeIfChanged("CODEMAP.md", codemap);
    const changedPatterns = writeIfChanged("PATTERNS.md", patterns);

    if (changedCodemap || changedPatterns) {
        console.log(
            [
                changedCodemap ? "updated CODEMAP.md" : "CODEMAP.md already up to date",
                changedPatterns ? "updated PATTERNS.md" : "PATTERNS.md already up to date",
            ].join("\n"),
        );
    } else {
        console.log("CODEMAP.md and PATTERNS.md already up to date");
    }
}

main();
