"use client";

export function ColorsTab({ mode = "light" }: { mode?: "light" | "dark" }) {
    const bgColors =
        mode === "light"
            ? [
                  {
                      class: "bg-bg-main",
                      label: "bg-bg-main",
                      desc: "Main Cream (#FFFCF6)",
                  },
                  {
                      class: "bg-bg-sf1",
                      label: "bg-bg-sf1",
                      desc: "Surface 1 (#FFFDF7)",
                  },
                  {
                      class: "bg-bg-sf2",
                      label: "bg-bg-sf2",
                      desc: "Surface 2 (#ECE4D7)",
                  },
                  {
                      class: "bg-bg-sf3",
                      label: "bg-bg-sf3",
                      desc: "Surface 3 (Dark 8%)",
                  },
                  {
                      class: "bg-bg-sf4",
                      label: "bg-bg-sf4",
                      desc: "Surface 4 (Dark 4%)",
                  },
              ]
            : [
                  {
                      class: "bg-bg-dark-main",
                      label: "bg-bg-dark-main",
                      desc: "Dark Main (#0E0702)",
                  },
                  {
                      class: "bg-bg-dark-sf1",
                      label: "bg-bg-dark-sf1",
                      desc: "Surface 1 (White 6%)",
                  },
                  {
                      class: "bg-bg-dark-sf3",
                      label: "bg-bg-dark-sf3",
                      desc: "Surface 3 (White 15%)",
                  },
                  {
                      class: "bg-bg-dark-sf4",
                      label: "bg-bg-dark-sf4",
                      desc: "Surface 4 (White 10%)",
                  },
              ];

    const typoColors =
        mode === "light"
            ? [
                  {
                      class: "bg-typo-primary",
                      label: "text-typo-primary",
                      desc: "Primary Text (100%)",
                  },
                  {
                      class: "bg-typo-sub",
                      label: "text-typo-sub",
                      desc: "Sub Text (70%)",
                  },
                  {
                      class: "bg-typo-soft",
                      label: "text-typo-soft",
                      desc: "Soft Text (50%)",
                  },
                  {
                      class: "bg-typo-note",
                      label: "text-typo-note",
                      desc: "Note Text (40%)",
                  },
                  {
                      class: "bg-typo-disable",
                      label: "text-typo-disable",
                      desc: "Disabled Text (15%)",
                  },
              ]
            : [
                  {
                      class: "bg-typo-dark-primary",
                      label: "text-typo-dark-primary",
                      desc: "Primary Text (Cream 100%)",
                  },
                  {
                      class: "bg-typo-dark-sub",
                      label: "text-typo-dark-sub",
                      desc: "Sub Text (Cream 70%)",
                  },
                  {
                      class: "bg-typo-dark-soft",
                      label: "text-typo-dark-soft",
                      desc: "Soft Text (Cream 50%)",
                  },
                  {
                      class: "bg-typo-dark-note",
                      label: "text-typo-dark-note",
                      desc: "Note Text (Cream 40%)",
                  },
                  {
                      class: "bg-typo-dark-disable",
                      label: "text-typo-dark-disable",
                      desc: "Disabled Text (Cream 15%)",
                  },
              ];

    const statusColors = [
        { class: "bg-brand", label: "bg-brand", desc: "Brand Gold" },
        { class: "bg-success", label: "bg-success", desc: "Success Green" },
        { class: "bg-error", label: "bg-error", desc: "Error Red" },
        { class: "bg-warn", label: "bg-warn", desc: "Warning Orange" },
        { class: "bg-complete", label: "bg-complete", desc: "Complete Blue" },
    ];

    return (
        <div className="space-y-8 duration-200 animate-in fade-in">
            <ColorSection title="Background Colors" colors={bgColors} />
            <ColorSection title="Typography Colors" colors={typoColors} />
            <ColorSection
                title="Status & Accent Colors"
                colors={statusColors}
                gridCols="grid-cols-5 tb:grid-cols-3 mb:grid-cols-2"
            />
        </div>
    );
}

function ColorSection({
    title,
    colors,
    gridCols = "grid-cols-3 mb:grid-cols-2",
}: {
    title: string;
    colors: { class: string; label: string; desc: string }[];
    gridCols?: string;
}) {
    return (
        <section className="space-y-4">
            <h3 className="border-b border-bd-main pb-2 font-reckless text-2xl font-medium dark:border-bd-dark-main">
                {title}
            </h3>
            <div className={`grid ${gridCols} gap-3`}>
                {colors.map((color) => (
                    <div
                        key={color.label}
                        className="flex flex-col gap-2 border border-bd-main bg-bg-sf1 p-3 dark:border-bd-dark-main dark:bg-bg-dark-sf1"
                    >
                        <div
                            className={`h-14 w-full ${color.class} border border-bd-main dark:border-bd-dark-main`}
                        />
                        <div className="flex flex-col">
                            <span className="font-mono text-xs font-semibold text-typo-primary dark:text-typo-dark-primary">
                                {color.label}
                            </span>
                            <span className="text-[10px] text-typo-note dark:text-typo-dark-note">
                                {color.desc}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}
