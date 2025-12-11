
import React from 'react';
import { Award, Lock, Star, Trophy, Zap, Globe, Sun, Crown } from 'lucide-react';

const Rewards: React.FC = () => {
    return (
        <div className="min-h-screen pt-32 pb-20 px-6 max-w-7xl mx-auto">
            <div className="grid md:grid-cols-12 gap-12">
                {/* LEFT: Status */}
                <div className="md:col-span-4 space-y-8">
                    <div className="bg-black border border-white/10 p-8 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-12 bg-orange-500/10 blur-3xl rounded-full" />
                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-orange-500 text-black"><Crown className="w-5 h-5" /></div>
                                <span className="text-sm font-bold text-orange-500 uppercase tracking-widest">Gold Tier</span>
                            </div>
                            <h2 className="text-5xl font-bold text-white mb-2 tracking-tight">2,450</h2>
                            <p className="text-zinc-500 font-mono text-sm mb-8">Voyager Points available</p>
                            
                            <div className="w-full bg-zinc-900 h-1 mb-2">
                                <div className="bg-orange-500 h-full w-[75%]" />
                            </div>
                            <div className="flex justify-between text-[10px] text-zinc-500 uppercase tracking-wider">
                                <span>Gold</span>
                                <span>550 to Platinum</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-black border border-white/10 p-6">
                        <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-6">Ways to Earn</h3>
                        <ul className="space-y-4">
                            <li className="flex justify-between items-center text-sm">
                                <span className="text-zinc-400">Complete a Trip</span>
                                <span className="text-cyan-400 font-mono font-bold">+500</span>
                            </li>
                            <li className="flex justify-between items-center text-sm">
                                <span className="text-zinc-400">Write a Review</span>
                                <span className="text-cyan-400 font-mono font-bold">+50</span>
                            </li>
                            <li className="flex justify-between items-center text-sm">
                                <span className="text-zinc-400">Refer a Friend</span>
                                <span className="text-cyan-400 font-mono font-bold">+1000</span>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* RIGHT: Badges & Tiers */}
                <div className="md:col-span-8">
                    <div className="mb-12">
                        <h3 className="text-2xl font-bold text-white mb-6 uppercase tracking-tight">Mission Badges</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <Badge name="Early Adopter" icon={Zap} achieved={true} color="text-cyan-400" />
                            <Badge name="Global Citizen" icon={Globe} achieved={true} color="text-emerald-400" />
                            <Badge name="High Roller" icon={Crown} achieved={false} color="text-zinc-600" />
                            <Badge name="Beach Bum" icon={Sun} achieved={false} color="text-zinc-600" />
                        </div>
                    </div>

                    <div>
                        <h3 className="text-2xl font-bold text-white mb-6 uppercase tracking-tight">Tier Benefits</h3>
                        <div className="space-y-4">
                            <TierRow name="Bronze" points="0" benefits={["Basic AI Planning", "Standard Support"]} active={false} />
                            <TierRow name="Silver" points="1000" benefits={["1.5x Points", "Priority Support"]} active={false} />
                            <TierRow name="Gold" points="5000" benefits={["2x Points", "Dining Concierge", "Free Upgrades"]} active={true} />
                            <TierRow name="Platinum" points="10000" benefits={["Dedicated Agent", "Airport Lounge Access", "Exclusive Events"]} active={false} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const Badge = ({ name, icon: Icon, achieved, color }: any) => (
    <div className={`border p-6 flex flex-col items-center justify-center gap-4 text-center group ${achieved ? 'bg-white/5 border-white/20' : 'bg-black border-white/5 opacity-50'}`}>
        <Icon className={`w-8 h-8 ${color} ${achieved ? 'group-hover:scale-110 transition-transform' : 'grayscale'}`} />
        <span className={`text-xs font-bold uppercase tracking-wide ${achieved ? 'text-white' : 'text-zinc-600'}`}>{name}</span>
        {!achieved && <Lock className="w-3 h-3 text-zinc-700 absolute top-2 right-2" />}
    </div>
);

const TierRow = ({ name, points, benefits, active }: any) => (
    <div className={`border p-6 flex flex-col md:flex-row items-center justify-between gap-6 ${active ? 'bg-white/5 border-orange-500' : 'bg-black border-white/10'}`}>
        <div className="flex items-center gap-4">
            <div className={`w-3 h-3 rounded-full ${active ? 'bg-orange-500 animate-pulse' : 'bg-zinc-800'}`} />
            <div>
                <h4 className={`text-lg font-bold uppercase ${active ? 'text-white' : 'text-zinc-500'}`}>{name}</h4>
                <div className="text-xs text-zinc-600 font-mono">{points}+ Points</div>
            </div>
        </div>
        <div className="flex gap-4">
            {benefits.map((b: string) => (
                <span key={b} className="text-xs text-zinc-400 border border-white/10 px-2 py-1 bg-black">{b}</span>
            ))}
        </div>
    </div>
);

export default Rewards;
