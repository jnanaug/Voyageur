
import React from 'react';
import { Calendar, Mail, Map, Smartphone, Check } from 'lucide-react';

const Integrations: React.FC = () => {
    const apps = [
        { name: "Google Calendar", desc: "Sync itineraries directly to your schedule.", icon: Calendar, connected: true },
        { name: "Gmail", desc: "Auto-import flight tickets and confirmations.", icon: Mail, connected: false },
        { name: "Apple Wallet", desc: "Add boarding passes to your phone.", icon: Smartphone, connected: false },
        { name: "Google Maps", desc: "Save locations to your personal lists.", icon: Map, connected: true },
    ];

    return (
        <div className="min-h-screen pt-32 pb-20 px-6 max-w-4xl mx-auto">
            <div className="mb-12">
                <h2 className="text-4xl font-bold text-white mb-4 uppercase tracking-tighter">System Integrations</h2>
                <p className="text-zinc-500 font-mono">Connect external data streams for seamless logistics.</p>
            </div>

            <div className="space-y-4">
                {apps.map((app, idx) => (
                    <div key={idx} className="bg-black border border-white/10 p-6 flex items-center justify-between group hover:border-white/30 transition-colors">
                        <div className="flex items-center gap-6">
                            <div className="w-12 h-12 bg-zinc-900 flex items-center justify-center border border-white/5">
                                <app.icon className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-white uppercase">{app.name}</h3>
                                <p className="text-zinc-500 text-sm font-mono">{app.desc}</p>
                            </div>
                        </div>
                        <button className={`px-6 py-3 text-xs font-bold uppercase tracking-wider border transition-colors ${
                            app.connected 
                            ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400' 
                            : 'border-white/20 text-white hover:bg-white hover:text-black'
                        }`}>
                            {app.connected ? 'Connected' : 'Connect'}
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Integrations;