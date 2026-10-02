"use client";

import { cn } from "@/lib/utils";
import Image from "next/image";
type IProps = {
    src: string;
    unoptimized?: boolean;
    priority?: boolean;
    quality?: number;
    sizes?: string;
    typePlaceHolder?: "image" | "cask" | "user";
} & React.DetailedHTMLProps<
    React.ImgHTMLAttributes<HTMLImageElement>,
    HTMLImageElement
>;

export default function ImagePreload({
    src,
    className,
    typePlaceHolder,
    priority = false,
    quality = 75,
    sizes,
    ...props
}: IProps) {
    return (
        <Image
            {...props}
            src={src}
            className={cn("img", className)}
            width={props.width as number}
            priority={priority}
            fetchPriority={priority ? "high" : props.fetchPriority}
            loading={priority ? "eager" : props.loading || "lazy"}
            height={props.height as number}
            alt={(props.alt as string) || "Image Non-available"}
            quality={quality}
            sizes={
                sizes ||
                `(max-width: ${props.width || 768}px) 100vw, ${props.width || 768}px`
            }
            // onError={(e) => {
            //     const target = e.target as HTMLImageElement;
            //     target.src = srcPlaceholder;
            //     target.srcset = srcSetPlaceholder || "";
            // }}
        />
    );
}
