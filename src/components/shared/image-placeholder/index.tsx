"use client";

import { memo, useState } from "react";
import { cn, getImageSource, renderImagePlaceholder } from "@/lib/utils";
import { global } from "@/types/global/global";
import Image, { ImageProps } from "next/image";
import IconDistilleryPlaceholder from "../icons/icon-distillery-placeholder";

type IProps = {
    src?: string;
    unoptimized?: boolean;
    priority?: boolean;
    fill?: boolean;
    width?: number | `${number}`;
    height?: number | `${number}`;
    imgClassName?: string;
    typePlaceholder?: global.TPlaceholderType;
} & Omit<
    React.DetailedHTMLProps<
        React.ImgHTMLAttributes<HTMLImageElement>,
        HTMLImageElement
    >,
    "width" | "height"
>;

const ImagePlaceholder = memo(function ImagePlaceholder({
    src,
    imgClassName,
    typePlaceholder = "image",
    ...props
}: IProps) {
    const [prevSrc, setPrevSrc] = useState(src);
    const [isError, setIsError] = useState(false);

    if (src !== prevSrc) {
        setPrevSrc(src);
        setIsError(false);
    }

    const imagePlaceholder = renderImagePlaceholder(
        typePlaceholder === "distillery" ? "image" : typePlaceholder
    );
    const { src: srcPlaceholder } = getImageSource({
        url: imagePlaceholder,
        width: props.width as number,
        height: props.height as number,
        alt: props.alt as string,
    });

    const isDistillery = typePlaceholder === "distillery";
    const showFallback = isError || !src;

    const finalProps = { ...props } as Partial<ImageProps>;
    if (finalProps.fill) {
        delete finalProps.width;
        delete finalProps.height;
    } else {
        if (!finalProps.width && props.width) {
            finalProps.width = props.width;
        }
        if (!finalProps.height && props.height) {
            finalProps.height = props.height;
        }
    }

    return (
        <div
            className={cn(
                "relative h-full w-full overflow-hidden",
                props.className
            )}
        >
            {/* Fallback elements rendered when there is an error or no src */}
            {showFallback ? (
                isDistillery ? (
                    <div className="absolute inset-0 z-0 flex items-center justify-center bg-bg-sf4">
                        <div className="w-[35%] min-w-[2rem] max-w-[7.625rem] text-[#DBD2CD]">
                            <IconDistilleryPlaceholder className="h-auto w-full" />
                        </div>
                    </div>
                ) : (
                    <img
                        src={srcPlaceholder}
                        alt={(props.alt as string) || "Image unavailable"}
                        width={props.width as number}
                        height={props.height as number}
                        className={cn(
                            "img img-h absolute inset-0 z-0 object-cover",
                            imgClassName
                        )}
                        loading={props.loading || "lazy"}
                    />
                )
            ) : (
                /* Main Image rendered when valid and no error */
                <>
                    <Image
                        {...finalProps}
                        src={src}
                        onError={() => setIsError(true)}
                        alt={(props.alt as string) || "Image Non-available"}
                        className={cn(
                            "img img-h absolute inset-0 z-10 object-cover",
                            imgClassName
                        )}
                        quality={100}
                        fetchPriority="low"
                        loading="lazy"
                        sizes={
                            props.sizes ||
                            `(max-width: ${props.width || 768}px) 100vw, ${props.width || 768}px`
                        }
                    />
                    <Image
                        width={100}
                        height={100}
                        priority
                        fetchPriority="high"
                        src={src}
                        alt={(props.alt as string) || "Image Non-available"}
                        className={cn(
                            "img img-h z-9 absolute inset-0 object-cover",
                            imgClassName
                        )}
                        quality={10}
                    />
                </>
            )}
        </div>
    );
});

export default ImagePlaceholder;
