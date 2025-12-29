import React, { useState, useEffect } from 'react';
import { Play, Pause, Square, MapPin, Activity, Clock, Zap, Loader2, Calendar, Check, Snowflake, StopCircle, CheckCircle, Shield, AlertTriangle, Terminal } from 'lucide-react';
import { useScramble } from '../hooks/useScramble';
import { StoredTrip } from '../types';

interface MissionControlHeaderProps {
    activeMission: StoredTrip | null;
    onComplete: (e: React.MouseEvent, id: string) => void;
    onFreeze: (e: React.MouseEvent, id: string) => void;
    onResume: (e: React.MouseEvent, id: string) => void;
    onSync: (e: React.MouseEvent, trip: StoredTrip) => void;
    syncProgress: Record<string, string>;
    syncingIds: Record<string, boolean>;
}

export const MissionControlHeader: React.FC<MissionControlHeaderProps> = ({
    activeMission,
    onComplete,
    onFreeze,
    onResume,
    onSync,
    syncProgress,
    syncingIds
}) => {
    // Calculate time - returns countdown (T-MINUS) or elapsed (T-PLUS)
    const calculateTime = (): { time: string; mode: 'countdown' | 'elapsed' } => {
        if (!activeMission) return { time: "00:00:00", mode: 'countdown' };

        const isPaused = activeMission.status === 'paused';
        const now = isPaused && activeMission.data?.last_frozen_at
            ? activeMission.data.last_frozen_at
            : new Date().getTime();

        const start = activeMission.startDate ? new Date(activeMission.startDate).getTime() : Date.now();
        const diff = start - now;

        // Trip has started - show elapsed time (T-PLUS)
        if (diff <= 0) {
            const elapsed = Math.abs(diff);
            const days = Math.floor(elapsed / (1000 * 60 * 60 * 24));
            const hours = Math.floor((elapsed % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((elapsed % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((elapsed % (1000 * 60)) / 1000);
            return {
                time: `${days > 0 ? `${days}d ` : ''}${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`,
                mode: 'elapsed'
            };
        }

        // Trip hasn't started - show countdown (T-MINUS)
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        return {
            time: `${days > 0 ? `${days}d ` : ''}${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`,
            mode: 'countdown'
        };
    };

    const [timerData, setTimerData] = useState(calculateTime());
    const [missionStatus, setMissionStatus] = useState<'standby' | 'active'>('standby');
    const [isBooting, setIsBooting] = useState(true);

    // Helper to trigger scramble effect
    const triggerScramble = () => {
        setIsBooting(true);
        setTimeout(() => setIsBooting(false), 1500);
    };

    // Boot sequence: Scramble for 1.5s on mount, then stabilize
    useEffect(() => {
        triggerScramble();
    }, []);

    // Re-trigger scramble when mission status changes (freeze/resume/complete)
    useEffect(() => {
        if (activeMission?.status) {
            triggerScramble();
        }
    }, [activeMission?.status]);

    // Hacker Scramble Effect: Active only during boot or specific status changes
    const scrambledTime = useScramble(timerData.time, 35, isBooting);

    // Helper to extract just the place name from long prompts
    const getCleanDestination = (raw: string) => {
        if (!raw) return 'SYSTEM STANDBY';
        // Remove common prefixes
        let clean = raw.replace(/^(a\s+)?(\d+\s+day\s+)?trip\s+to\s+/i, '')
            .replace(/^visit\s+/i, '')
            .replace(/^explore\s+/i, '');

        // Remove suffixes like "at 5k", "for 2 people"
        clean = clean.split(/\s+(at|for|with)\s+/i)[0];

        // Remove trailing commas or dots
        clean = clean.replace(/[.,]$/, '');

        return clean;
    };


    useEffect(() => {
        if (activeMission) {
            setMissionStatus('active');
            setTimerData(calculateTime()); // Update immediately

            // FREEZE LOGIC: Only run and update interval if NOT paused
            if (activeMission.status !== 'paused') {
                const interval = setInterval(() => {
                    setTimerData(calculateTime());
                }, 1000);
                return () => clearInterval(interval);
            }
        } else {
            setMissionStatus('standby');
            setTimerData({ time: "00:00:00", mode: 'countdown' });
        }
    }, [activeMission]); // Re-run when activeMission changes (including status)

    const isSynced = activeMission && (activeMission.data?.calendarEventIds?.length || 0) > 0;
    const isSyncing = activeMission && syncingIds[activeMission.id];

    return (
        <div className="col-span-12 mb-16 mt-8 w-full max-w-5xl mx-auto px-4 md:px-6 transition-opacity duration-700 ease-out">
            <div className="relative">
                <div className="flex flex-col gap-6 items-start relative z-10 w-full">
                    {/* Top: Title & Status */}
                    <div className="flex flex-col justify-center w-full">
                        {/* System Status Label - ALIGNED LEFT */}
                        <div className="flex items-center gap-4 mb-0 opacity-100">
                            <div className="h-[1px] w-12 bg-gradient-to-r from-cyan-500 to-transparent"></div>
                            <div className="text-cyan-400 font-mono text-[10px] font-bold tracking-[0.3em] uppercase flex items-center gap-2">
                                <span className="relative flex h-2 w-2">
                                    <span className={`absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75 ${activeMission?.status === 'paused' ? '' : 'animate-ping'}`}></span>
                                    <span className={`relative inline-flex rounded-full h-2 w-2 bg-cyan-500 ${activeMission?.status === 'paused' ? 'bg-amber-500' : ''}`}></span>
                                </span>
                                {activeMission ? (activeMission.status === 'paused' ? 'SYSTEM FROZEN' : 'SYSTEM ONLINE') : 'STANDBY'}
                            </div>
                        </div>

                        {/* Massive Modern Typography - INSTANT LOAD, NO DELAY */}
                        <div className="relative group">
                            {/* Main Text with Gradient Mask */}
                            <h1 className="text-7xl md:text-9xl lg:text-[11rem] font-black text-transparent bg-clip-text bg-gradient-to-br from-white via-zinc-200 to-zinc-500 uppercase tracking-tighter leading-[0.85] select-none scale-y-110 origin-left"
                                style={{
                                    filter: 'drop-shadow(0 0 40px rgba(34,211,238,0.15))'
                                }}>
                                {activeMission ? getCleanDestination(activeMission.destination) : 'VOYAGEUR'}
                            </h1>

                            {/* Outline Overlay for Depth */}
                            <h1 className="absolute top-0 left-0 text-7xl md:text-9xl lg:text-[11rem] font-black text-transparent stroke-text-cyan opacity-20 uppercase tracking-tighter leading-[0.85] pointer-events-none scale-y-110 origin-left"
                                style={{ WebkitTextStroke: '1px rgba(34,211,238,0.5)' }}>
                                {activeMission ? getCleanDestination(activeMission.destination) : 'VOYAGEUR'}
                            </h1>
                        </div>
                    </div>

                    {/* Bottom: Controls (Left Aligned) - MOVED LEFT */}
                    <div className="flex items-center gap-6">
                        {/* Timer - Simplified Style */}
                        <div className="flex flex-col items-start border-r border-white/10 pr-6 mr-2 hidden md:flex">
                            <div className={`text-[10px] uppercase tracking-[0.2em] mb-1 ${timerData.mode === 'elapsed' ? 'text-emerald-400' : 'text-zinc-500'}`}>
                                {activeMission ? (timerData.mode === 'elapsed' ? 'T-PLUS' : 'T-MINUS') : 'READY'}
                            </div>
                            <div className={`text-3xl font-mono font-bold tracking-tighter tabular-nums ${activeMission ? 'text-white' : 'text-zinc-700'}`}>
                                {isBooting ? scrambledTime : timerData.time}
                            </div>
                        </div>

                        {/* Actions */}

                        <div className="flex items-center gap-3">
                            {activeMission ? (
                                <>
                                    {/* SYNC BUTTON */}
                                    <button
                                        onClick={(e) => onSync(e, activeMission)}
                                        disabled={!!isSyncing}
                                        className={`h-10 px-4 rounded border flex items-center gap-2 text-sm font-bold uppercase tracking-wider transition-colors ${isSynced
                                            ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.2)]'
                                            : 'bg-zinc-800 hover:bg-zinc-700 border-white/10 text-zinc-300 hover:border-white/30'
                                            } ${isSyncing ? 'opacity-70 cursor-wait' : ''}`}
                                    >
                                        {isSyncing ? (
                                            <>
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                <span>{syncProgress[activeMission.id] || 'Syncing'}</span>
                                            </>
                                        ) : (
                                            isSynced ? (
                                                <>
                                                    <Check className="w-4 h-4" />
                                                    <span>Synced</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Calendar className="w-4 h-4" />
                                                    <span>Sync</span>
                                                </>
                                            )
                                        )}
                                    </button>

                                    {/* FREEZE / RESUME */}
                                    {activeMission.status === 'paused' ? (
                                        <button
                                            onClick={(e) => onResume(e, activeMission.id)}
                                            className="h-10 px-4 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/50 rounded flex items-center gap-2 text-cyan-400 transition-colors shadow-[0_0_15px_rgba(6,182,212,0.1)]"
                                        >
                                            <Play className="w-4 h-4 fill-current" />
                                            <span className="text-sm font-bold uppercase tracking-wider">Resume</span>
                                        </button>
                                    ) : (
                                        <button
                                            onClick={(e) => onFreeze(e, activeMission.id)}
                                            className="h-10 px-4 bg-zinc-800 hover:bg-zinc-700 border border-white/10 rounded flex items-center gap-2 text-zinc-300 transition-colors hover:border-blue-400/30 hover:text-blue-200"
                                            title="Freeze Mission"
                                        >
                                            <Snowflake className="w-4 h-4" />
                                        </button>
                                    )}

                                    {/* COMPLETE */}
                                    <button
                                        onClick={(e) => onComplete(e, activeMission.id)}
                                        className="h-10 px-4 bg-zinc-800 hover:bg-emerald-900/30 border border-white/10 hover:border-emerald-500/50 rounded flex items-center gap-2 text-zinc-300 hover:text-emerald-400 transition-colors"
                                        title="Complete Mission"
                                    >
                                        <CheckCircle className="w-4 h-4" />
                                        <span className="hidden sm:inline text-sm font-bold uppercase tracking-wider">Complete</span>
                                    </button>
                                </>
                            ) : (
                                <div className="h-10 px-4 flex items-center justify-center border border-dashed border-zinc-700 rounded text-zinc-500 text-xs uppercase tracking-wider">
                                    Awaiting Orders
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
