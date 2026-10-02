import { cask } from "@/types";

type TWithIsListed = { isListed?: boolean | null };

export function getListedVariants<T extends TWithIsListed>(
    children: T[] | null | undefined
): T[] {
    return (children ?? []).filter((c) => Boolean(c?.isListed));
}

export function getFirstListedVariant(
    children: cask.TCask[] | null | undefined
): cask.TCask | null {
    return getListedVariants(children)[0] ?? null;
}
