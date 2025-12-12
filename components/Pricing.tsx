
import React from 'react';
import { Check, Zap, Crown, Globe } from 'lucide-react';

const Pricing: React.FC = () => {
    return (
        <div className="min-h-screen pt-24 pb-20 px-6 max-w-7xl mx-auto">
            <div className="pt-24 pb-12 px-6 mx-auto max-w-7xl text-center">
                <span className="inline-block py-1 mb-4 text-xs font-bold tracking-widest text-cyan-400 uppercase bg-cyan-900/10 rounded-full px-3 border border-cyan-500/20 font-mono">
                    Membership
                </span>
                <h1 className="mb-6 font-sans text-4xl font-bold tracking-tight text-white md:text-6xl uppercase">
                    Access Levels
                </h1>
                <p className="max-w-2xl mx-auto font-sans text-lg text-zinc-400 leading-relaxed">
                    Select your operational tier. Upgrade anytime.
                </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
                {/* FREE */}
                <div className="bg-black/50 backdrop-blur-md border border-white/10 p-8 flex flex-col hover:border-white/30 transition-all group hover:shadow-[0_0_20px_rgba(255,255,255,0.05)]">
                    <div className="mb-8">
                        <div className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2 font-mono">Basic</div>
                        <h3 className="text-4xl font-bold text-white mb-4 font-sans">Free</h3>
                        <p className="text-sm text-zinc-400 font-sans">Essential trip planning capabilities.</p>
                    </div>
                    <ul className="space-y-4 mb-8 flex-1">
                        <li className="flex gap-3 text-sm text-zinc-300 font-sans"><Check className="w-4 h-4 text-white" /> 1 AI Itinerary per month</li>
                        <li className="flex gap-3 text-sm text-zinc-300 font-sans"><Check className="w-4 h-4 text-white" /> Basic Logistics</li>
                        <li className="flex gap-3 text-sm text-zinc-300 font-sans"><Check className="w-4 h-4 text-white" /> Public Guides</li>
                    </ul>
                    <button className="w-full py-4 border border-white/20 text-white font-bold uppercase tracking-widest text-xs hover:bg-white hover:text-black transition-colors font-sans">Current Plan</button>
                </div>

                {/* VOYAGER */}
                <div className="bg-cyan-950/10 backdrop-blur-md border border-cyan-500/50 p-8 flex flex-col relative overflow-hidden transform md:-translate-y-4 shadow-[0_0_50px_rgba(34,211,238,0.15)] hover:shadow-[0_0_80px_rgba(34,211,238,0.25)] transition-all duration-500">
                    <div className="absolute top-0 right-0 bg-cyan-500 text-black text-[10px] font-bold px-3 py-1 uppercase tracking-wider font-mono">Popular</div>
                    <div className="mb-8 relative z-10">
                        <div className="text-xs font-bold text-cyan-400 uppercase tracking-widest mb-2 flex items-center gap-2 font-mono"><Zap className="w-3 h-3" /> Voyager</div>
                        <h3 className="text-4xl font-bold text-white mb-4 font-sans">$12<span className="text-lg text-zinc-500 font-normal">/mo</span></h3>
                        <p className="text-sm text-zinc-400 font-sans">Full AI power + automated bookings.</p>
                    </div>
                    <ul className="space-y-4 mb-8 flex-1 relative z-10">
                        <li className="flex gap-3 text-sm text-white font-sans"><Check className="w-4 h-4 text-cyan-400" /> Unlimited AI Itineraries</li>
                        <li className="flex gap-3 text-sm text-white font-sans"><Check className="w-4 h-4 text-cyan-400" /> One-Click Booking</li>
                        <li className="flex gap-3 text-sm text-white font-sans"><Check className="w-4 h-4 text-cyan-400" /> Dining Concierge Access</li>
                        <li className="flex gap-3 text-sm text-white font-sans"><Check className="w-4 h-4 text-cyan-400" /> Real-time Flight Alerts</li>
                    </ul>
                    <button className="relative z-10 w-full py-4 bg-cyan-400 text-black font-bold uppercase tracking-widest text-xs hover:bg-white transition-colors font-sans hover:shadow-[0_0_20px_rgba(34,211,238,0.4)]">Upgrade to Voyager</button>

                    <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/5 to-transparent pointer-events-none" />
                </div>

                {/* ELITE */}
                <div className="bg-black/50 backdrop-blur-md border border-white/10 p-8 flex flex-col hover:border-orange-500/50 transition-all group hover:shadow-[0_0_30px_rgba(249,115,22,0.15)]">
                    <div className="mb-8">
                        <div className="text-xs font-bold text-orange-500 uppercase tracking-widest mb-2 flex items-center gap-2 font-mono"><Crown className="w-3 h-3" /> Elite</div>
                        <h3 className="text-4xl font-bold text-white mb-4 font-sans">$49<span className="text-lg text-zinc-500 font-normal">/mo</span></h3>
                        <p className="text-sm text-zinc-400 font-sans">Personal human concierge 24/7.</p>
                    </div>
                    <ul className="space-y-4 mb-8 flex-1">
                        <li className="flex gap-3 text-sm text-zinc-300 font-sans"><Check className="w-4 h-4 text-orange-500" /> All Voyager Features</li>
                        <li className="flex gap-3 text-sm text-zinc-300 font-sans"><Check className="w-4 h-4 text-orange-500" /> Dedicated Human Agent</li>
                        <li className="flex gap-3 text-sm text-zinc-300 font-sans"><Check className="w-4 h-4 text-orange-500" /> Exclusive Reservations</li>
                        <li className="flex gap-3 text-sm text-zinc-300 font-sans"><Check className="w-4 h-4 text-orange-500" /> 2x Voyager Points</li>
                    </ul>
                    <button className="w-full py-4 border border-white/20 text-white font-bold uppercase tracking-widest text-xs hover:border-orange-500 hover:text-orange-500 transition-colors font-sans bg-transparent">Contact Sales</button>
                </div>
            </div>
        </div>
    );
};

export default Pricing;
