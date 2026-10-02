const DEFAULT_WORDS_PER_MINUTE = 200;

function collectText(value: unknown, text: string[]) {
    if (Array.isArray(value)) {
        value.forEach((item) => collectText(item, text));
        return;
    }
    if (typeof value !== "object" || value === null) return;

    Object.entries(value).forEach(([key, child]) => {
        if (key === "text" && typeof child === "string") {
            text.push(child);
            return;
        }
        collectText(child, text);
    });
}

export function calculateReadTimeMinutes(
    content: unknown,
    wordsPerMinute = DEFAULT_WORDS_PER_MINUTE
) {
    const text: string[] = [];
    collectText(content, text);
    const wordCount =
        text.join(" ").match(/[\p{L}\p{N}]+(?:['’\-][\p{L}\p{N}]+)*/gu)
            ?.length ?? 0;

    return Math.max(1, Math.ceil(wordCount / wordsPerMinute));
}

export function getReadTimeMinutes({
    content,
    override,
}: {
    content: unknown;
    override?: number | null;
}) {
    if (typeof override === "number" && Number.isFinite(override)) {
        return Math.max(1, Math.ceil(override));
    }
    return calculateReadTimeMinutes(content);
}
