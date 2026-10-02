import Image from "next/image";

export default function IconDotsHorizontal({
    className,
}: {
    className?: string;
}) {
    return (
        <Image
            src="/icons/icon-dots-horizontal-line.svg"
            alt=""
            aria-hidden="true"
            width={20}
            height={20}
            className={className}
        />
    );
}
