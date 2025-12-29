
import { useState, useEffect, useRef } from 'react';

const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%&";

export const useScramble = (text: string, speed: number = 40, active: boolean = true) => {
    const [scrambledText, setScrambledText] = useState(text);
    const intervalRef = useRef<any>(null);
    const iterationRef = useRef(0);

    useEffect(() => {
        if (!active) {
            setScrambledText(text);
            return;
        }

        // Reset iteration on text change
        iterationRef.current = 0;

        clearInterval(intervalRef.current);

        intervalRef.current = setInterval(() => {
            setScrambledText(prev => {
                const result = text
                    .split("")
                    .map((char, index) => {
                        if (index < iterationRef.current) {
                            return text[index];
                        }
                        return CHARS[Math.floor(Math.random() * CHARS.length)];
                    })
                    .join("");

                if (iterationRef.current >= text.length) {
                    clearInterval(intervalRef.current);
                }

                iterationRef.current += 1 / 3; // Slow down the reveal

                return result;
            });
        }, speed);

        return () => clearInterval(intervalRef.current);
    }, [text, speed, active]);

    return scrambledText;
};
