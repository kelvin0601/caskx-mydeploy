import { cn } from "@/lib/utils";
import { m } from "motion/react";
import { HTMLAttributes, PropsWithChildren, forwardRef } from "react";

export type TSlideTransition = HTMLAttributes<HTMLDivElement> &
    PropsWithChildren & {
        direction?: "left" | "right";
        duration?: number;
        isJustBack?: boolean;
        isBackAction?: boolean;
    };

const SlideTransition = forwardRef<HTMLDivElement, TSlideTransition>(
    (props, ref) => {
        const {
            children,
            className,
            duration = 500,
            isJustBack,
            isBackAction,
        } = props;
        const handleDirection = () => {
            let direction: "left" | "right" = "right";

            if (isBackAction) {
                direction = "left";
            } else {
                direction = "right";
            }

            return direction;
        };
        const direction = handleDirection();
        const variants = {
            enter: {
                x: isJustBack ? 0 : direction === "right" ? "100%" : "-100%",
                opacity: 0,
            },
            center: {
                x: 0,
                opacity: 1,
            },
            exit: {
                x: direction === "right" ? "-100%" : "100%",
                opacity: 0,
                duration: 0.1,
            },
        };

        return (
            <m.div
                ref={ref}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{
                    x: { type: "tween", duration: 0.3 },
                    opacity: { duration: 0.3 },
                    duration: duration / 1000,
                    ease: "easeOut",
                }}
                className={cn("w-full")}
            >
                <div className={cn("rounded-md bg-bg-main", className)}>
                    {children}
                </div>
            </m.div>
        );
    }
);

SlideTransition.displayName = "SlideTransition";

export default SlideTransition;
