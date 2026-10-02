import Image from "next/image";

export default function IconArrowNarrowLeft({
    className,
}: {
    className?: string;
}) {
    return (
        <Image
            src="/icons/icon-arrow-narrow-left-line.svg"
            alt=""
            aria-hidden="true"
            width={20}
            height={20}
            className={className}
        />
    );
}
