
import React, { useState } from 'react';
import { FEATURED_TRIPS } from '../data/featuredTrips';
import { ArrowRight, Lock, Unlock, Zap, Globe, Clock, CreditCard, Plane, MapPin } from 'lucide-react';

interface FeaturedExpeditionsProps {
    onSelectTrip: (trip: any) => void;
}

const FeaturedExpeditions: React.FC<FeaturedExpeditionsProps> = ({ onSelectTrip }) => {
    return (
        <div className="relative z-10 w-full">
            {/* Section Header */}
            <div className="flex items-end justify-between mb-8 px-2 border-b border-white/5 pb-4">
                <div>
                    <div className="flex items-center gap-2 mb-2">

                    </div>
                    <h2 className="text-3xl md:text-4xl font-bold text-white uppercase tracking-tighter drop-shadow-xl">
                        Featured <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-emerald-400">Expeditions</span>
                    </h2>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {FEATURED_TRIPS.map((trip, idx) => (
                    <FeaturedCard key={trip.id} trip={trip} index={idx} onSelect={onSelectTrip} />
                ))}
            </div>

            <style>{`
                @keyframes glitch {
                    0% { clip-path: polygon(0 2%, 100% 2%, 100% 5%, 0 5%); transform: translate(2px,0); opacity: 1; }
                    2% { clip-path: polygon(0 78%, 100% 78%, 100% 100%, 0 100%); transform: translate(-2px,0); }
                    6% { clip-path: polygon(0 78%, 100% 78%, 100% 100%, 0 100%); transform: translate(2px,0); }
                    8% { clip-path: polygon(0 52%, 100% 52%, 100% 59%, 0 59%); transform: translate(-2px,0); }
                    10% { clip-path: polygon(0 60%, 100% 60%, 100% 65%, 0 65%); transform: translate(2px,0); }
                    100% { clip-path: polygon(0 0, 0 0, 0 0, 0 0); transform: translate(0,0); opacity: 1; }
                }
                .group:hover .animate-glitch {
                    animation: glitch 0.3s cubic-bezier(.25, .46, .45, .94) both infinite;
                }
                .clip-corner {
                    clip-path: polygon(0 0, 100% 0, 100% 85%, 85% 100%, 0 100%);
                }
            `}</style>
        </div>
    );
};

const FeaturedCard = ({ trip, index, onSelect }: { trip: any, index: number, onSelect: (t: any) => void }) => {
    const [isHovered, setIsHovered] = useState(false);

    const handleSelect = () => {
        const tripWrapper = {
            id: crypto.randomUUID(),
            destination: trip.itinerary.destination,
            status: 'draft',
            data: trip.itinerary,
            created_at: new Date().toISOString()
        };
        onSelect(tripWrapper);
    };

    return (
        <div
            className="group relative h-[450px] cursor-pointer"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={handleSelect}
        >
            {/* Background Image Container */}
            <div className="absolute inset-0 bg-zinc-900 rounded-sm overflow-hidden clip-corner border border-white/5 transition-all duration-500 ease-out group-hover:border-cyan-500/50 group-hover:shadow-[0_0_30px_rgba(34,211,238,0.2)]">
                <img
                    src={trip.image}
                    alt={trip.title}
                    className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110 opacity-60 group-hover:opacity-100 grayscale group-hover:grayscale-0"
                />

                {/* Gradient Overlays */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-90 transition-opacity duration-300 group-hover:opacity-80" />
                <div className={`absolute inset-0 bg-gradient-to-b from-${trip.color}-500/10 to-transparent opacity-0 group-hover:opacity-40 transition-opacity duration-500 mix-blend-overlay`} />

                {/* Scanline */}
                <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_50%,rgba(0,0,0,0.8)_50%)] bg-[length:100%_4px] pointer-events-none opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
            </div>

            {/* Tactical HUD Overlay (Always Visible) */}
            <div className="absolute inset-0 p-6 flex flex-col justify-between z-10 pointer-events-none">
                {/* Top Bar */}
                <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                        <div className={`px-2 py-0.5 bg-black/80 backdrop-blur border border-white/10 text-[10px] font-mono font-bold uppercase tracking-widest text-${trip.color}-400`}>
                            SEQ_0{index + 1}
                        </div>
                        {trip.color === 'cyan' && <div className="px-2 py-0.5 bg-cyan-950/80 border border-cyan-500/30 text-[10px] font-mono text-cyan-400 uppercase tracking-widest">Premium</div>}
                    </div>

                    <div className="w-8 h-8 rounded-full bg-black/50 backdrop-blur border border-white/10 flex items-center justify-center group-hover:bg-cyan-500/20 group-hover:border-cyan-400 transition-colors">
                        <Globe className={`w-4 h-4 text-zinc-400 group-hover:text-cyan-400 transition-colors`} />
                    </div>
                </div>

                {/* Bottom Content */}
                <div className="relative">
                    {/* Decorative Lines */}
                    <div className="absolute -left-6 bottom-20 w-1 h-12 bg-gradient-to-b from-transparent via-cyan-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                    <h3 className="text-4xl font-black text-white uppercase tracking-tighter mb-1 relative">
                        <span className="relative z-10">{trip.title}</span>
                        {/* Glitch Effect Layer */}
                        <span className={`absolute top-0 left-0 text-${trip.color}-400 opacity-0 group-hover:opacity-70 group-hover:animate-glitch -z-10`}>
                            {trip.title}
                        </span>
                    </h3>

                    <div className={`text-sm font-mono font-bold text-${trip.color}-400 mb-6 tracking-[0.2em] uppercase flex items-center gap-2`}>
                        <MapPin className="w-3 h-3" /> {trip.subtitle}
                    </div>

                    {/* Stats Grid - Reveal on Hover */}
                    <div className="grid grid-cols-2 gap-2 mb-4 opacity-70 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                        <div className="flex items-center gap-2 text-xs text-zinc-300 font-mono">
                            <Clock className="w-3 h-3 text-cyan-500" />
                            {trip.itinerary.duration}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-zinc-300 font-mono">
                            <CreditCard className="w-3 h-3 text-emerald-500" />
                            {trip.itinerary.totalEstimatedCost}
                        </div>
                    </div>

                    {/* Action Button */}
                    <div className="mt-4 pt-4 border-t border-white/10 opacity-0 group-hover:opacity-100 transition-all duration-500 delay-100 transform translate-y-4 group-hover:translate-y-0">
                        <button className={`w-full py-3 bg-${trip.color}-500/20 border border-${trip.color}-500/50 hover:bg-${trip.color}-500 hover:text-black hover:border-${trip.color}-400 text-${trip.color}-300 uppercase font-bold tracking-widest text-xs transition-all flex items-center justify-center gap-2 group/btn`}>
                            Initialize Mission
                            <ArrowRight className="w-3 h-3 group-hover/btn:translate-x-1 transition-transform" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default FeaturedExpeditions;
