
import React, { useEffect, useState, useRef, MouseEvent, useMemo } from 'react';
import { ArrowRight, ShieldCheck, Sparkles, Map, Coffee, Plane, Play, Zap, Bell, Menu, Music, Home, CreditCard, MoreHorizontal, Calendar, Search, Cloud, Users, ShoppingBag, Leaf, Award } from 'lucide-react';
import { AppView } from '../types';

interface HeroProps {
    setView: (view: AppView) => void;
}

const Hero: React.FC<HeroProps> = ({ setView }) => {
    const [loaded, setLoaded] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const dashboardRef = useRef<HTMLDivElement>(null);
    const requestRef = useRef<number>(0);

    useEffect(() => {
        setTimeout(() => setLoaded(true), 200);

        return () => {
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
        };
    }, []);

    const handleMouseMove = (e: MouseEvent) => {
        if (window.innerWidth < 768) return;
        if (!containerRef.current || !dashboardRef.current) return;

        cancelAnimationFrame(requestRef.current);

        requestRef.current = requestAnimationFrame(() => {
            if (!containerRef.current || !dashboardRef.current) return;

            const { left, top, width, height } = containerRef.current.getBoundingClientRect();
            const x = (e.clientX - left - width / 2) / (width / 2);
            const y = (e.clientY - top - height / 2) / (height / 2);

            dashboardRef.current.style.transform = `translate3d(0,0,0) rotateX(${5 - y * 2}deg) rotateY(${-5 + x * 2}deg)`;
        });
    };

    const handleMouseLeave = () => {
        if (!dashboardRef.current) return;
        dashboardRef.current.style.transform = `translate3d(0,0,0) rotateX(5deg) rotateY(-5deg)`;
    };

    return (
        <div
            className="relative min-h-screen flex flex-col overflow-x-hidden bg-black"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
        >

            {/* Monochrome Particles */}
            <FloatingParticles />

            {/* Background Grid */}
            <div className="absolute inset-0 pointer-events-none z-0">
                <div className={`absolute inset-0 bg-grid-pattern opacity-[0.2] grid-bg transition-transform duration-[3s] ease-out ${loaded ? 'scale-100' : 'scale-110'}`} />
            </div>

            {/* Main Grid Content */}
            <div className="relative z-10 w-full max-w-[1400px] mx-auto pt-32 lg:pt-48 pb-20 px-6 grid lg:grid-cols-2 gap-12 lg:gap-24 items-center">

                {/* LEFT COLUMN: Text Content */}
                <div className={`flex flex-col items-start text-left z-20 transition-all duration-1000 delay-500 ease-out ${loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>

                    <div className="inline-flex items-center gap-3 px-4 py-1.5 border border-cyan-500/30 bg-cyan-950/10 mb-8 backdrop-blur-md">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full bg-cyan-400 opacity-75"></span>
                            <span className="relative inline-flex h-2 w-2 bg-cyan-400"></span>
                        </span>
                        <span className="text-xs font-bold text-cyan-400 tracking-widest uppercase">System v2.5 Online</span>
                    </div>

                    <h1 className="text-5xl sm:text-6xl lg:text-8xl font-bold tracking-tighter mb-8 leading-[0.9] text-white uppercase">
                        Trip planning, <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-white to-orange-400 animate-pulse-slow">Reimagined.</span>
                    </h1>

                    <p className="text-base sm:text-lg text-zinc-400 max-w-lg mb-10 leading-relaxed border-l-2 border-cyan-500 pl-6 font-mono">
                        Your personal AI travel architect. Precision itineraries. Human verification. Automated logistics.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center gap-5 w-full sm:w-auto">
                        <button
                            onClick={() => setView(AppView.PLANNER)}
                            className="group relative w-full sm:w-auto px-8 py-4 bg-cyan-400 text-black font-bold text-sm uppercase tracking-widest overflow-hidden transition-all hover:bg-white hover:text-black"
                        >
                            <span className="relative flex items-center justify-center gap-3">
                                Create Itinerary
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </span>
                        </button>

                        <button
                            onClick={() => setView(AppView.HOW_IT_WORKS)}
                            className="w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-4 border border-white/20 bg-transparent text-white font-bold text-sm uppercase tracking-widest hover:bg-white hover:text-black transition-all group"
                        >
                            <span>See How It Works</span>
                        </button>
                    </div>

                    <div className="mt-16 flex items-center gap-4 text-xs font-mono text-zinc-500 uppercase tracking-wider">
                        <div className="flex -space-x-4">
                            {[1, 2, 3].map(i => <div key={i} className={`w-8 h-8 border border-black flex items-center justify-center bg-zinc-900 text-white font-bold text-[10px]`} >{i}</div>)}
                        </div>
                        <p className="text-cyan-500/80">10,000+ Operations Executed</p>
                    </div>
                </div>

                {/* RIGHT COLUMN: Sharp Dashboard */}
                <div
                    className={`w-full lg:h-[650px] h-auto perspective-container transition-all duration-[1.5s] ease-[cubic-bezier(0.25,1,0.5,1)] ${loaded ? 'scale-100 opacity-100 blur-0' : 'scale-125 opacity-0 blur-lg'}`}
                    ref={containerRef}
                >
                    <div
                        ref={dashboardRef}
                        className="md:rotate-3d relative w-full h-full bg-[#050505] border border-white/10 shadow-[0_0_100px_rgba(34,211,238,0.05)] overflow-hidden transition-transform duration-100 ease-out will-change-transform"
                        style={{
                            transform: typeof window !== 'undefined' && window.innerWidth > 768 ? 'translate3d(0,0,0) rotateX(5deg) rotateY(-5deg)' : 'none',
                        }}
                    >
                        {/* Header */}
                        <div className="h-14 md:h-16 border-b border-white/10 flex items-center px-4 md:px-6 justify-between bg-black relative z-10">
                            <div className="flex items-center gap-4 text-zinc-500">
                                <Menu className="w-5 h-5 cursor-pointer hover:text-white" />
                                <div className="h-4 w-px bg-white/10" />
                                <div className="flex items-center gap-2 px-3 py-1.5 border border-white/10 bg-white/5 text-zinc-400">
                                    <Search className="w-3 h-3" />
                                    <span className="text-xs truncate font-mono uppercase tracking-wider">Search System...</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="hidden sm:flex items-center gap-2 px-2 py-1 border border-cyan-500/20 text-[10px] text-cyan-400 bg-cyan-900/10 font-mono uppercase">
                                    <div className="w-1.5 h-1.5 bg-cyan-400 animate-pulse" />
                                    LIVE FEED
                                </div>
                            </div>
                        </div>

                        {/* Dashboard Grid - Sharp Edges & Colors */}
                        <div className="p-4 md:p-6 grid grid-cols-1 sm:grid-cols-12 md:grid-rows-6 gap-4 h-auto md:h-[calc(100%-4rem)] overflow-y-auto md:overflow-visible">

                            {/* WIDGET 1: Main Map */}
                            <div className="h-48 sm:h-auto sm:col-span-8 sm:row-span-4 bg-black border border-white/10 relative overflow-hidden group hover:border-cyan-500/50 transition-colors">
                                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-40 grayscale-[20%] group-hover:grayscale-0 transition-all duration-700" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />

                                <div className="absolute top-4 left-4 flex gap-2">
                                    <div className="bg-black/80 backdrop-blur border border-cyan-500/30 px-3 py-1 text-xs font-bold text-white flex items-center gap-2 uppercase tracking-wide">
                                        <Map className="w-3 h-3 text-cyan-400" /> Tokyo Sector
                                    </div>
                                </div>

                                {/* Animated Grid Overlay */}
                                <div className="absolute inset-0 bg-[linear-gradient(rgba(34,211,238,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(34,211,238,0.05)_1px,transparent_1px)] bg-[size:20px_20px]" />

                                <div className="absolute bottom-4 right-4 flex flex-col items-end">
                                    <div className="text-4xl font-bold text-white tracking-tighter">TYO</div>
                                    <div className="text-xs text-cyan-400 font-mono uppercase">Coordinates Locked</div>
                                </div>
                            </div>

                            {/* WIDGET 2: Weather */}
                            <div className="h-32 sm:h-auto sm:col-span-4 sm:row-span-2 bg-white text-black p-5 relative overflow-hidden group border border-white">
                                <div className="flex justify-between items-start z-10 relative">
                                    <div>
                                        <div className="text-xs font-bold uppercase tracking-widest mb-1 opacity-60">Local Weather</div>
                                        <div className="text-4xl font-bold mb-1 tracking-tighter">18°C</div>
                                        <div className="text-xs font-mono text-cyan-600 font-bold bg-cyan-100 px-2 py-0.5 w-fit">RAIN EXPECTED</div>
                                    </div>
                                    <Cloud className="w-8 h-8 text-cyan-500" />
                                </div>
                                <div className="absolute bottom-0 right-0 w-24 h-24 bg-cyan-100 rounded-tl-full opacity-50 translate-x-4 translate-y-4" />
                            </div>

                            {/* WIDGET 3: Expenses */}
                            <div className="h-32 sm:h-auto sm:col-span-4 sm:row-span-2 bg-black border border-white/10 p-4 flex flex-col justify-between group hover:border-emerald-500/50 transition-colors">
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-2">
                                        <CreditCard className="w-4 h-4 text-emerald-400" />
                                        <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Spend Analytics</span>
                                    </div>
                                </div>
                                <div className="text-3xl font-bold text-white tracking-tight">$2,405.00</div>
                                <div className="h-8 flex items-end gap-1">
                                    {[40, 70, 45, 90, 60, 75, 50].map((h, i) => (
                                        <div key={i} className="flex-1 bg-emerald-900/30 border-t border-emerald-500/50" style={{ height: `${h}%` }}>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* WIDGET 4: Timeline */}
                            <div className="sm:col-span-8 sm:row-span-2 bg-black border border-white/10 p-4 flex flex-col hover:border-orange-500/50 transition-colors">
                                <div className="flex items-center justify-between mb-3">
                                    <h4 className="text-xs font-bold text-zinc-400 uppercase flex items-center gap-2 tracking-widest">
                                        <Calendar className="w-3 h-3 text-orange-400" /> Active Schedule
                                    </h4>
                                    <div className="text-[10px] text-orange-400 font-mono">SYNCED</div>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-4 p-2 border-l-2 border-orange-500 bg-orange-500/5">
                                        <div className="text-xs font-mono text-orange-400">09:00</div>
                                        <div className="flex-1">
                                            <div className="text-sm text-white font-bold uppercase tracking-tight">Team Breakfast</div>
                                            <div className="text-[10px] text-zinc-500">Cafe De L'Amour</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4 p-2 border-l-2 border-zinc-700 bg-zinc-900/50">
                                        <div className="text-xs font-mono text-zinc-500">11:30</div>
                                        <div className="flex-1">
                                            <div className="text-sm text-zinc-400 font-bold uppercase tracking-tight">Museum Tour</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* WIDGET 5: System */}
                            <div className="sm:col-span-4 sm:row-span-2 grid grid-rows-2 gap-4">
                                <div className="bg-black border border-white/10 p-3 flex items-center justify-between group hover:border-purple-500/50 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-purple-500 text-black">
                                            <Music className="w-4 h-4 animate-spin-slow" />
                                        </div>
                                        <div>
                                            <div className="text-xs font-bold text-white uppercase">Now Playing</div>
                                            <div className="text-[10px] text-purple-400 font-mono">LO-FI RADIO</div>
                                        </div>
                                    </div>
                                    <div className="h-4 w-4 bg-purple-500/20 rounded-full animate-pulse" />
                                </div>

                                <div className="bg-black border border-white/10 p-3 flex items-center justify-between group hover:border-cyan-500/50 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-white/10 text-white">
                                            <Home className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <div className="text-xs font-bold text-white uppercase">Smart Home</div>
                                            <div className="text-[10px] text-zinc-500 font-mono">ARMED</div>
                                        </div>
                                    </div>
                                    <div className="text-[10px] font-bold text-red-500 border border-red-500/30 px-2 py-0.5">AWAY</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>

            {/* FEATURE BENTO GRID */}
            <div className="relative z-20 w-full max-w-[1400px] mx-auto px-6 pb-12 mt-24">
                <h3 className="text-2xl font-bold text-white mb-8 pl-4 border-l-4 border-cyan-400 flex items-center gap-4 uppercase tracking-wider">
                    System Capabilities
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-6 lg:grid-cols-12 gap-6 auto-rows-auto md:auto-rows-[340px]">

                    {/* ITEM 1: AI (Large) */}
                    <SpotlightCard className="md:col-span-6 lg:col-span-8 h-80 md:h-auto border-white/10 hover:border-cyan-400/50">
                        <div className="relative h-full flex flex-col justify-between z-10 p-8 md:p-10">
                            <div>
                                <div className="w-14 h-14 bg-cyan-400 text-black flex items-center justify-center mb-6">
                                    <Sparkles className="w-7 h-7" />
                                </div>
                                <h3 className="text-4xl font-bold text-white mb-4 uppercase tracking-tighter">Generative Core</h3>
                                <p className="text-zinc-400 max-w-lg text-lg font-mono leading-relaxed">
                                    Mathematical trip construction. Our engine processes millions of data points to build your perfect itinerary.
                                </p>
                            </div>
                            <div className="flex gap-3 mt-8">
                                <span className="px-3 py-1 bg-cyan-900/20 border border-cyan-400/30 text-cyan-400 text-xs font-bold font-mono uppercase">Gemini 2.5</span>
                                <span className="px-3 py-1 bg-cyan-900/20 border border-cyan-400/30 text-cyan-400 text-xs font-bold font-mono uppercase">Pro Vision</span>
                            </div>
                        </div>
                    </SpotlightCard>

                    {/* ITEM 2: Verified */}
                    <SpotlightCard className="md:col-span-6 lg:col-span-4 h-80 md:h-auto border-white/10 hover:border-orange-400/50">
                        <div className="relative h-full flex flex-col z-10 p-8">
                            <div className="w-12 h-12 bg-orange-400/10 border border-orange-400/50 text-orange-400 flex items-center justify-center mb-6">
                                <ShieldCheck className="w-6 h-6" />
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-3 uppercase tracking-tight">Human Verified</h3>
                            <p className="text-zinc-400 text-sm mb-6 font-mono leading-relaxed">
                                Every booking link double-checked by experts. Zero hallucinations.
                            </p>
                            <div className="mt-auto relative bg-black p-4 border border-white/10 flex items-center gap-4">
                                <div className="flex -space-x-3 grayscale">
                                    <img src="https://i.pravatar.cc/100?img=33" alt="Agent" className="w-10 h-10 border-2 border-black" />
                                    <img src="https://i.pravatar.cc/100?img=47" alt="Agent" className="w-10 h-10 border-2 border-black" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-xs text-white font-bold uppercase">Agent Review</span>
                                    <span className="text-[10px] text-orange-400 font-mono uppercase tracking-wider animate-pulse">In Progress...</span>
                                </div>
                            </div>
                        </div>
                    </SpotlightCard>

                    {/* ITEM 3: Dining */}
                    <SpotlightCard className="md:col-span-6 lg:col-span-4 h-64 md:h-auto hover:border-white/50" onClick={() => setView(AppView.DINING)}>
                        <div className="relative p-8 h-full flex flex-col overflow-hidden group">
                            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-40 grayscale group-hover:scale-105 transition-transform duration-700" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />

                            <div className="relative z-10 mt-auto">
                                <div className="p-2 bg-white text-black w-fit mb-4">
                                    <Coffee className="w-6 h-6" />
                                </div>
                                <h4 className="text-2xl font-bold text-white mb-2 uppercase tracking-tight">Dining Access</h4>
                                <p className="text-sm text-zinc-300 font-mono">Exclusive reservations.</p>
                            </div>
                        </div>
                    </SpotlightCard>

                    {/* ITEM 4: Logistics */}
                    <SpotlightCard className="md:col-span-6 lg:col-span-4 h-64 md:h-auto border-white/10 hover:border-emerald-400/50">
                        <div className="relative p-8 h-full flex flex-col justify-between">
                            <div className="relative z-10">
                                <div className="p-2 bg-emerald-400/10 border border-emerald-400/50 text-emerald-400 w-fit mb-6">
                                    <Plane className="w-6 h-6" />
                                </div>
                                <h4 className="text-xl font-bold text-white mb-2 uppercase tracking-tight">Logistics Radar</h4>
                                <p className="text-sm text-zinc-400 font-mono">Seamless transfers & tickets.</p>
                            </div>
                            <div className="h-1 w-full bg-emerald-900/30 overflow-hidden">
                                <div className="h-full bg-emerald-400 w-2/3" />
                            </div>
                        </div>
                    </SpotlightCard>

                    {/* ITEM 5: Real-time */}
                    <SpotlightCard className="md:col-span-12 lg:col-span-4 h-64 md:h-auto border-white/10 hover:border-cyan-400/50">
                        <div className="p-8 h-full flex flex-col relative justify-between">
                            <div className="flex items-center justify-between mb-4 relative z-10">
                                <div className="p-2 bg-cyan-400/10 border border-cyan-400/50 text-cyan-400">
                                    <Zap className="w-6 h-6" />
                                </div>
                            </div>

                            <div className="relative z-10">
                                <h4 className="text-xl font-bold text-white mb-2 uppercase tracking-tight">Real-time Sync</h4>
                                <p className="text-sm text-zinc-400 mb-4 font-mono">Flight delayed? We auto-adjust.</p>
                            </div>

                            <div className="mt-auto relative h-12 w-full bg-black border border-white/10 overflow-hidden flex items-center">
                                <div className="flex items-center gap-8 animate-[shimmer_10s_linear_infinite] whitespace-nowrap px-4">
                                    <span className="text-[10px] font-mono text-zinc-500">BA249 <span className="text-orange-400">DELAYED</span></span>
                                    <span className="text-[10px] font-mono text-zinc-500">UBER <span className="text-emerald-400">ARRIVED</span></span>
                                </div>
                            </div>
                        </div>
                    </SpotlightCard>

                </div>
            </div>

            {/* NEW: Ecosystem Access Section */}
            <div className="relative z-20 w-full max-w-[1400px] mx-auto px-6 pb-20">
                <h3 className="text-2xl font-bold text-white mb-8 pl-4 border-l-4 border-emerald-400 flex items-center gap-4 uppercase tracking-wider">
                    Extended Ecosystem
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <button onClick={() => setView(AppView.COMMUNITY)} className="group bg-black/50 backdrop-blur-sm border border-white/10 p-8 text-left hover:border-cyan-400/50 transition-all flex flex-col justify-between h-aut">
                        <div className="flex items-center justify-between mb-8">
                            <Users className="w-8 h-8 text-zinc-500 group-hover:text-cyan-400 transition-colors" />
                            <ArrowRight className="w-5 h-5 text-zinc-700 group-hover:text-cyan-400 transition-colors" />
                        </div>
                        <div>
                            <h4 className="text-xl font-bold text-white uppercase tracking-tight mb-3">Community</h4>
                            <p className="text-sm text-zinc-400 font-mono leading-relaxed">Global itinerary network.</p>
                        </div>
                    </button>

                    <button onClick={() => setView(AppView.MARKETPLACE)} className="group bg-black/50 backdrop-blur-sm border border-white/10 p-8 text-left hover:border-orange-400/50 transition-all flex flex-col justify-between h-auto">
                        <div className="flex items-center justify-between mb-8">
                            <ShoppingBag className="w-8 h-8 text-zinc-500 group-hover:text-orange-400 transition-colors" />
                            <ArrowRight className="w-5 h-5 text-zinc-700 group-hover:text-orange-400 transition-colors" />
                        </div>
                        <div>
                            <h4 className="text-xl font-bold text-white uppercase tracking-tight mb-3">Marketplace</h4>
                            <p className="text-sm text-zinc-400 font-mono leading-relaxed">Gear & Essentials.</p>
                        </div>
                    </button>

                    <button onClick={() => setView(AppView.SUSTAINABILITY)} className="group bg-black/50 backdrop-blur-sm border border-white/10 p-8 text-left hover:border-emerald-400/50 transition-all flex flex-col justify-between h-auto">
                        <div className="flex items-center justify-between mb-8">
                            <Leaf className="w-8 h-8 text-zinc-500 group-hover:text-emerald-400 transition-colors" />
                            <ArrowRight className="w-5 h-5 text-zinc-700 group-hover:text-emerald-400 transition-colors" />
                        </div>
                        <div>
                            <h4 className="text-xl font-bold text-white uppercase tracking-tight mb-3">Eco-Track</h4>
                            <p className="text-sm text-zinc-400 font-mono leading-relaxed">Carbon impact analytics.</p>
                        </div>
                    </button>

                    <button onClick={() => setView(AppView.REWARDS)} className="group bg-black/50 backdrop-blur-sm border border-white/10 p-8 text-left hover:border-purple-400/50 transition-all flex flex-col justify-between h-auto">
                        <div className="flex items-center justify-between mb-8">
                            <Award className="w-8 h-8 text-zinc-500 group-hover:text-purple-400 transition-colors" />
                            <ArrowRight className="w-5 h-5 text-zinc-700 group-hover:text-purple-400 transition-colors" />
                        </div>
                        <div>
                            <h4 className="text-xl font-bold text-white uppercase tracking-tight mb-3">Rewards</h4>
                            <p className="text-sm text-zinc-400 font-mono leading-relaxed">Voyager Points.</p>
                        </div>
                    </button>
                </div>
            </div>
        </div>
    );
};

// Spotlight Card - Sharp
const SpotlightCard: React.FC<{ children: React.ReactNode; className?: string; onClick?: () => void }> = ({ children, className = "", onClick }) => {
    const divRef = useRef<HTMLDivElement>(null);
    const frameRef = useRef<number>(0);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (window.innerWidth < 768) return;
        if (!divRef.current) return;

        cancelAnimationFrame(frameRef.current);

        const rect = divRef.current.getBoundingClientRect();
        const clientX = e.clientX;
        const clientY = e.clientY;

        frameRef.current = requestAnimationFrame(() => {
            if (!divRef.current) return;
            const x = clientX - rect.left;
            const y = clientY - rect.top;
            divRef.current.style.setProperty('--mouse-x', `${x}px`);
            divRef.current.style.setProperty('--mouse-y', `${y}px`);
        });
    };

    return (
        <div
            ref={divRef}
            onMouseMove={handleMouseMove}
            onClick={onClick}
            className={`spotlight-card border bg-black relative group cursor-pointer transition-all duration-300 ${className}`}
        >
            <div className="relative z-10 h-full">
                {children}
            </div>
        </div>
    );
};

// Monochrome Particles - Dust
const FloatingParticles = React.memo(() => {
    const particles = useMemo(() => {
        return Array.from({ length: 30 }).map((_, i) => ({
            id: i,
            left: Math.random() * 100,
            top: Math.random() * 100,
            size: Math.random() * 3 + 1,
            delay: Math.random() * 5,
            duration: Math.random() * 10 + 10,
            opacity: Math.random() * 0.5 + 0.1
        }));
    }, []);

    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
            {particles.map((p) => (
                <div
                    key={p.id}
                    className="absolute bg-white animate-float-slow will-change-transform"
                    style={{
                        left: `${p.left}%`,
                        top: `${p.top}%`,
                        width: `${p.size}px`,
                        height: `${p.size}px`,
                        opacity: p.opacity,
                        animationDelay: `${p.delay}s`,
                        animationDuration: `${p.duration}s`,
                    }}
                />
            ))}
        </div>
    );
});

export default Hero;
