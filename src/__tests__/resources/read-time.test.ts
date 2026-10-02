import {
    calculateReadTimeMinutes,
    getReadTimeMinutes,
} from "@/modules/resources/utils/read-time";

function contentWithText(text: string) {
    return {
        root: {
            type: "root",
            children: [
                {
                    type: "paragraph",
                    children: [{ type: "text", text }],
                },
            ],
        },
    };
}

it("calculates reading time from Lexical text at 200 words per minute", () => {
    const content = contentWithText(
        Array.from({ length: 201 }, (_, index) => `word${index}`).join(" ")
    );

    expect(calculateReadTimeMinutes(content)).toBe(2);
});

it("returns at least one minute for empty content", () => {
    expect(calculateReadTimeMinutes(contentWithText(""))).toBe(1);
});

it("uses the manual reading-time override when provided", () => {
    expect(
        getReadTimeMinutes({
            content: contentWithText("short content"),
            override: 7,
        })
    ).toBe(7);
});
