
import React from 'react';
import { Check, Zap, Crown, Globe } from 'lucide-react';

const Pricing: React.FC = () => {
    return (
        <div className="min-h-screen pt-32 pb-20 px-6 max-w-7xl mx-auto">
            <div className="text-center mb-20 animate-fade-in-up">
                <h2 className="text-5xl font-bold text-white mb-6 uppercase tracking-tighter">Access Levels</h2>
                <p className="text-lg text-slate-400 max-w-2xl mx-auto font-mono">
                    Select your operational tier. Upgrade anytime.
                </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
                {/* FREE */}
                <div className="bg-black border border-white/10 p-8 flex flex-col hover:border-white/30 transition-colors group">
                    <div className="mb-8">
                        <div className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">Basic</div>
                        <h3 className="text-4xl font-bold text-white mb-4">Free</h3>
                        <p className="text-sm text-zinc-400 font-mono">Essential trip planning capabilities.</p>
                    </div>
                    <ul className="space-y-4 mb-8 flex-1">
                        <li className="flex gap-3 text-sm text-zinc-300"><Check className="w-4 h-4 text-white" /> 1 AI Itinerary per month</li>
                        <li className="flex gap-3 text-sm text-zinc-300"><Check className="w-4 h-4 text-white" /> Basic Logistics</li>
                        <li className="flex gap-3 text-sm text-zinc-300"><Check className="w-4 h-4 text-white" /> Public Guides</li>
                    </ul>
                    <button className="w-full py-4 border border-white text-white font-bold uppercase tracking-widest text-xs hover:bg-white hover:text-black transition-colors">Current Plan</button>
                </div>

                {/* VOYAGER */}
                <div className="bg-black border border-cyan-500 p-8 flex flex-col relative overflow-hidden transform md:-translate-y-4 shadow-[0_0_50px_rgba(34,211,238,0.1)]">
                    <div className="absolute top-0 right-0 bg-cyan-500 text-black text-xs font-bold px-3 py-1 uppercase tracking-wider">Popular</div>
                    <div className="mb-8 relative z-10">
                        <div className="text-xs font-bold text-cyan-400 uppercase tracking-widest mb-2 flex items-center gap-2"><Zap className="w-3 h-3" /> Voyager</div>
                        <h3 className="text-4xl font-bold text-white mb-4">$12<span className="text-lg text-zinc-500">/mo</span></h3>
                        <p className="text-sm text-zinc-400 font-mono">Full AI power + automated bookings.</p>
                    </div>
                    <ul className="space-y-4 mb-8 flex-1 relative z-10">
                        <li className="flex gap-3 text-sm text-white"><Check className="w-4 h-4 text-cyan-400" /> Unlimited AI Itineraries</li>
                        <li className="flex gap-3 text-sm text-white"><Check className="w-4 h-4 text-cyan-400" /> One-Click Booking</li>
                        <li className="flex gap-3 text-sm text-white"><Check className="w-4 h-4 text-cyan-400" /> Dining Concierge Access</li>
                        <li className="flex gap-3 text-sm text-white"><Check className="w-4 h-4 text-cyan-400" /> Real-time Flight Alerts</li>
                    </ul>
                    <button className="relative z-10 w-full py-4 bg-cyan-400 text-black font-bold uppercase tracking-widest text-xs hover:bg-white transition-colors">Upgrade to Voyager</button>
                    
                    <div className="absolute inset-0 bg-gradient-to-b from-cyan-900/10 to-transparent pointer-events-none" />
                </div>

                {/* ELITE */}
                <div className="bg-black border border-white/10 p-8 flex flex-col hover:border-orange-500/50 transition-colors group">
                    <div className="mb-8">
                        <div className="text-xs font-bold text-orange-500 uppercase tracking-widest mb-2 flex items-center gap-2"><Crown className="w-3 h-3" /> Elite</div>
                        <h3 className="text-4xl font-bold text-white mb-4">$49<span className="text-lg text-zinc-500">/mo</span></h3>
                        <p className="text-sm text-zinc-400 font-mono">Personal human concierge 24/7.</p>
                    </div>
                    <ul className="space-y-4 mb-8 flex-1">
                        <li className="flex gap-3 text-sm text-zinc-300"><Check className="w-4 h-4 text-orange-500" /> All Voyager Features</li>
                        <li className="flex gap-3 text-sm text-zinc-300"><Check className="w-4 h-4 text-orange-500" /> Dedicated Human Agent</li>
                        <li className="flex gap-3 text-sm text-zinc-300"><Check className="w-4 h-4 text-orange-500" /> Exclusive Reservations</li>
                        <li className="flex gap-3 text-sm text-zinc-300"><Check className="w-4 h-4 text-orange-500" /> 2x Voyager Points</li>
                    </ul>
                    <button className="w-full py-4 border border-zinc-700 text-white font-bold uppercase tracking-widest text-xs hover:border-orange-500 hover:text-orange-500 transition-colors">Contact Sales</button>
                </div>
            </div>
        </div>
    );
};

export default Pricing;
