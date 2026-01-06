"use client"

import { useState, useEffect } from 'react';

interface TypewriterProps {
    text: string;
    speed?: number;
    delay?: number;
    className?: string;
    onComplete?: () => void;
}

export function Typewriter({ text, speed = 10, delay = 0, className, onComplete }: TypewriterProps) {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const timeout = setTimeout(() => {
            setIsVisible(true);
            if (onComplete) onComplete();
        }, delay);
        return () => clearTimeout(timeout);
    }, [delay, onComplete]);

    return (
        <span
            className={`${className} transition-opacity duration-200`}
            style={{ opacity: isVisible ? 1 : 0 }}
        >
            {text}
        </span>
    );
}
