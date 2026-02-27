import React from "react";

interface SkeletonProps {
    variant?: "text" | "circular" | "rectangular";
    width?: string | number;
    height?: string | number;
    className?: string;
    animate?: "pulse" | "wave" | "none";
}

const Skeleton: React.FC<SkeletonProps> = ({
    variant = "rectangular",
    width,
    height,
    className = "",
    animate = "pulse",
}) => {
    const baseStyles = "bg-richblack-700 relative overflow-hidden";

    const animationStyles = {
        pulse: "animate-pulse",
        wave: "before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-richblack-600/10 before:to-transparent",
        none: "",
    };

    const variantStyles = {
        text: "rounded h-4 w-full",
        circular: "rounded-full",
        rectangular: "rounded-md",
    };

    return (
        <div
            className={`${baseStyles} ${animationStyles[animate]} ${variantStyles[variant]} ${className}`}
            style={{
                width: typeof width === "number" ? `${width}px` : width,
                height: typeof height === "number" ? `${height}px` : height
            }}
        />
    );
};

export default Skeleton;
