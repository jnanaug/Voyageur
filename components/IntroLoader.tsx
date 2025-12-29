
import React, { useEffect, useState } from 'react';

interface IntroLoaderProps {
    onComplete: () => void;
}

const IntroLoader: React.FC<IntroLoaderProps> = ({ onComplete }) => {
    const [progress, setProgress] = useState(0);
    const [isZooming, setIsZooming] = useState(false);
    const [isExiting, setIsExiting] = useState(false);

    useEffect(() => {
        const DURATION = 3500;
        const startTime = Date.now();

        const animate = () => {
            const elapsed = Date.now() - startTime;
            const rawProgress = Math.min(100, (elapsed / DURATION) * 100);

            setProgress(rawProgress);

            if (rawProgress < 100) {
                requestAnimationFrame(animate);
            } else {
                setTimeout(() => {
                    setIsZooming(true);
                    setTimeout(() => {
                        setIsExiting(true);
                        setTimeout(onComplete, 500);
                    }, 1200);
                }, 200);
            }
        };

        requestAnimationFrame(animate);
    }, [onComplete]);

    // High-resolution coordinates
    const waveY = 4000 - (progress / 100) * 4500;

    return (
        <div className={`fixed inset-0 z-[10000] bg-black flex items-center justify-center overflow-hidden transition-opacity duration-500 ${isExiting ? 'opacity-0' : 'opacity-100'}`}>

            {/* ZOOM CONTAINER */}
            {/* Removed max-width to allow massive heroic size on all screens */}
            <div
                className={`relative w-[95vw] flex flex-col items-center justify-center translate-y-[7vh] ${isZooming ? 'scale-[5] opacity-0' : 'scale-100'}`}
                style={{
                    transition: 'transform 1.2s cubic-bezier(0.8, 0, 0.2, 1), opacity 1.2s ease-in',
                }}
            >

                <svg viewBox="0 0 16000 4000" className="w-full h-auto overflow-visible font-sans font-bold">
                    <defs>
                        <mask id="liquidMask">
                            <g transform={`translate(0, ${waveY})`}>
                                <rect x="0" y="0" width="40000" height="15000" fill="white" />
                                <path
                                    d="M 0 0 Q 2000 800 4000 0 T 8000 0 T 12000 0 T 16000 0 T 20000 0 T 24000 0 V 15000 H 0 Z"
                                    fill="white"
                                    className="animate-[waveScroll_2s_linear_infinite]"
                                />
                            </g>
                        </mask>
                    </defs>

                    {/* BACKGROUND TEXT */}
                    <text
                        x="8000" y="2000"
                        dominantBaseline="middle" textAnchor="middle"
                        fontSize="3200"
                        fill="#27272a"
                        letterSpacing="-150"
                    >
                        VOYAGEUR
                    </text>

                    {/* FOREGROUND TEXT */}
                    <text
                        x="8000" y="2000"
                        dominantBaseline="middle" textAnchor="middle"
                        fontSize="3200"
                        fill="#22d3ee"
                        letterSpacing="-150"
                        mask="url(#liquidMask)"
                    >
                        VOYAGEUR
                    </text>
                </svg>

                {/* MINIMIZED NUMBER */}
                <div
                    className="absolute bottom-[-5vw] right-4 transition-opacity duration-200"
                    style={{ opacity: isZooming ? 0 : 1 }}
                >
                    <span className="font-mono text-[2.5vw] text-white font-bold tabular-nums tracking-widest">
                        {Math.floor(progress).toString().padStart(3, '0')}
                    </span>
                    <span className="text-cyan-500 text-[1.5vw] ml-1">%</span>
                </div>

            </div>

            <style>{`
                @keyframes waveScroll {
                    0% { transform: translateX(-8000px); }
                    100% { transform: translateX(0px); }
                }
            `}</style>
        </div>
    );
};

export default IntroLoader;
