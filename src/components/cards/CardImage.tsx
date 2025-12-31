import { motion } from "framer-motion";
import { memo } from "react";

interface CardImageProps {
    src: string;
    alt: string;
    className?: string;
    layoutId?: string;
}

export const CardImage = memo(({ src, alt, className = "", layoutId }: CardImageProps) => {
    return (
        <motion.img 
            src={src || "https://via.placeholder.com/300x400"} 
            alt={alt} 
            className={`rounded-lg w-full ${className}`}
            layoutId={layoutId}
            loading="lazy"
        />
    );
});

CardImage.displayName = "CardImage";
