
import React from 'react';
import { Medal, Lock, Globe, Camera, Plane, Map, Sun, Crown, Star } from 'lucide-react';

const Achievements: React.FC = () => {
    const badges = [
        { name: "First Steps", desc: "Plan your first trip", icon: Map, achieved: true },
        { name: "Globe Trotter", desc: "Visit 3 continents", icon: Globe, achieved: false },
        { name: "Shutterbug", desc: "Upload 50 photos", icon: Camera, achieved: true },
        { name: "Mile High", desc: "Fly 10,000 miles", icon: Plane, achieved: false },
        { name: "Food Critic", desc: "Review 10 restaurants", icon: Medal, achieved: false },
        { name: "Local Hero", desc: "Contribute to guides", icon: Medal, achieved: false },
    ];

    return (
        <div className="min-h-screen pt-32 pb-20 px-6 max-w-5xl mx-auto">
            <div className="text-center mb-16">
                <h2 className="text-4xl font-bold text-white mb-4 uppercase tracking-tighter">Mission Log</h2>
                <p className="text-zinc-500 font-mono">Track your progress and unlock elite status.</p>
            </div>

            {/* Level Progress */}
            <div className="bg-black border border-white/10 p-8 mb-16 relative overflow-hidden">
                <div className="flex justify-between items-end mb-4 relative z-10">
                    <div>
                        <div className="text-xs font-bold text-cyan-400 uppercase tracking-widest mb-1">Current Level</div>
                        <div className="text-4xl font-bold text-white uppercase">Explorer Lvl. 4</div>
                    </div>
                    <div className="text-right">
                         <div className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1">Next Milestone</div>
                         <div className="text-xl font-bold text-white uppercase">Pathfinder</div>
                    </div>
                </div>
                
                <div className="h-4 bg-zinc-900 border border-white/10 relative z-10">
                    <div className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 w-[65%]" />
                </div>
                <div className="mt-2 text-right text-xs font-mono text-zinc-500">2,450 / 3,000 XP</div>

                <div className="absolute top-0 right-0 p-32 bg-cyan-500/5 blur-[80px]" />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                {badges.map((badge, idx) => (
                    <div key={idx} className={`border p-8 flex flex-col items-center justify-center text-center relative group ${badge.achieved ? 'bg-white/5 border-white/20 hover:border-cyan-400/50 hover:bg-white/10 transition-all' : 'bg-black border-white/5 opacity-50'}`}>
                        <div className={`w-16 h-16 rounded-full border-2 flex items-center justify-center mb-6 ${badge.achieved ? 'border-cyan-400 text-cyan-400 bg-cyan-900/20' : 'border-zinc-800 text-zinc-800'}`}>
                            <badge.icon className="w-8 h-8" />
                        </div>
                        <h3 className={`text-lg font-bold uppercase mb-2 ${badge.achieved ? 'text-white' : 'text-zinc-600'}`}>{badge.name}</h3>
                        <p className="text-xs text-zinc-500 font-mono uppercase tracking-wide">{badge.desc}</p>
                        
                        {!badge.achieved && (
                            <div className="absolute top-4 right-4">
                                <Lock className="w-4 h-4 text-zinc-700" />
                            </div>
                        )}
                        {badge.achieved && (
                             <div className="absolute top-4 right-4">
                                <Star className="w-4 h-4 text-cyan-400 fill-cyan-400" />
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Achievements;
