
import React, { useState } from 'react';
import { Search, Star, Loader2, Bookmark, Clock, CheckCircle } from 'lucide-react';
import { generateDiningOptions, generateImage } from '../services/geminiService';
import { DiningRecommendation } from '../types';

const DiningConcierge: React.FC = () => {
    const [craving, setCraving] = useState('');
    const [recommendations, setRecommendations] = useState<DiningRecommendation[]>([]);
    const [images, setImages] = useState<Record<number, string>>({});
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<'search' | 'saved' | 'preorder'>('search');

    const handleSearch = async () => {
        if (!craving.trim()) return;
        setLoading(true);
        setRecommendations([]);
        setImages({});

        try {
            const results = await generateDiningOptions(craving);
            setRecommendations(results);

            results.forEach((rec, idx) => {
                generateImage(`Professional high-end food photography of ${rec.dishName} at ${rec.restaurantName}, ${rec.cuisine}, 4k resolution, cinematic lighting, delicious, vibrant colors`)
                    .then(url => {
                        setImages(prev => ({ ...prev, [idx]: url }));
                    })
                    .catch(e => console.error("Failed to generate image for", rec.restaurantName, e));
            });

        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen pt-32 pb-12 px-6 max-w-7xl mx-auto bg-black">
            <div className="text-center mb-16">
                <span className="inline-block px-3 py-1 bg-white/5 border border-white/10 text-cyan-400 text-xs font-mono font-bold uppercase tracking-widest mb-6 backdrop-blur-sm">Beta Feature</span>
                <h2 className="text-4xl md:text-6xl font-bold text-white mb-6 uppercase font-sans tracking-tight">Elite Dining</h2>
                <p className="text-zinc-400 max-w-2xl mx-auto font-sans text-lg leading-relaxed">
                    Describe your craving. Define the vibe. We secure the table.
                </p>
            </div>

            <div className="flex justify-center mb-12">
                <div className="flex bg-black p-1 border border-white/10">
                    <button onClick={() => setActiveTab('search')} className={`px-6 py-2 text-xs font-bold uppercase tracking-widest transition-colors ${activeTab === 'search' ? 'bg-white text-black' : 'text-zinc-500 hover:text-white'}`}>Search</button>
                    <button onClick={() => setActiveTab('saved')} className={`px-6 py-2 text-xs font-bold uppercase tracking-widest transition-colors ${activeTab === 'saved' ? 'bg-white text-black' : 'text-zinc-500 hover:text-white'}`}>Saved</button>
                    <button onClick={() => setActiveTab('preorder')} className={`px-6 py-2 text-xs font-bold uppercase tracking-widest transition-colors ${activeTab === 'preorder' ? 'bg-white text-black' : 'text-zinc-500 hover:text-white'}`}>Pre-Order</button>
                </div>
            </div>

            {activeTab === 'search' && (
                <>
                    <div className="max-w-2xl mx-auto mb-16 relative">
                        <div className="relative flex gap-0">
                            <input
                                type="text"
                                value={craving}
                                onChange={(e) => setCraving(e.target.value)}
                                placeholder="e.g. Authentic sushi in Tokyo..."
                                className="flex-1 bg-black/50 backdrop-blur-md border border-white/20 px-6 py-4 text-white focus:outline-none focus:border-cyan-400/50 focus:shadow-[0_0_30px_rgba(34,211,238,0.1)] transition-all placeholder-zinc-600 font-sans text-lg"
                                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                            />
                            <button
                                onClick={handleSearch}
                                disabled={loading}
                                className="bg-white text-black px-8 py-4 font-bold uppercase tracking-wider hover:bg-zinc-200 transition-colors disabled:opacity-50"
                            >
                                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'SEARCH'}
                            </button>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6">
                        {recommendations.map((rec, idx) => (
                            <div key={idx} className="border border-white/10 bg-black/80 backdrop-blur-md hover:border-cyan-400/50 hover:shadow-[0_0_30px_rgba(34,211,238,0.1)] transition-all group duration-300">
                                <div className="h-48 bg-zinc-900 relative overflow-hidden transition-all duration-500 border-b border-white/5">
                                    {images[idx] ? (
                                        <img src={images[idx]} alt={rec.dishName} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-black">
                                            <Loader2 className="w-6 h-6 text-white animate-spin" />
                                        </div>
                                    )}
                                    <div className="absolute top-4 right-4 bg-black/80 backdrop-blur px-2 py-1 text-xs font-bold text-white flex items-center gap-1 border border-white/20">
                                        <Star className="w-3 h-3 text-orange-400 fill-orange-400" /> {rec.rating}
                                    </div>
                                </div>
                                <div className="p-6">
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="text-xl font-bold text-white uppercase font-sans tracking-tight">{rec.restaurantName}</h3>
                                        <span className="text-sm text-cyan-400 font-mono bg-cyan-950/30 px-2 py-1 border border-cyan-900/50">{rec.price}</span>
                                    </div>
                                    <p className="text-zinc-500 text-xs font-bold uppercase tracking-wide mb-4 font-mono">{rec.cuisine} • {rec.ambiance}</p>
                                    <div className="bg-white/5 border border-white/10 p-4 mb-6">
                                        <p className="text-[10px] text-zinc-500 uppercase font-bold mb-1 tracking-wider">Signature Dish</p>
                                        <p className="text-zinc-200 text-sm font-sans">{rec.dishName}</p>
                                    </div>
                                    <p className="text-zinc-400 text-sm mb-6 line-clamp-3 font-sans leading-relaxed">{rec.description}</p>
                                    <button className="w-full py-3 bg-white text-black text-xs font-bold uppercase tracking-widest hover:bg-cyan-400 transition-colors">
                                        Reserve Table
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}

            {activeTab === 'saved' && (
                <div className="grid md:grid-cols-3 gap-6">
                    {/* Mock Saved Item 1 */}
                    <div className="border border-white/10 bg-black/80 backdrop-blur-md group relative hover:border-emerald-400/50 transition-all">
                        <div className="h-48 bg-zinc-900 relative overflow-hidden">
                            <img src="https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&q=80" alt="Bar" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                            <div className="absolute top-4 left-4 bg-emerald-500 text-black px-2 py-1 text-[10px] font-bold uppercase tracking-wider">Open Now</div>
                            <button className="absolute top-4 right-4 p-2 bg-black/50 text-white hover:text-cyan-400 hover:bg-black transition-colors rounded-full"><Bookmark className="w-4 h-4 fill-white" /></button>
                        </div>
                        <div className="p-6">
                            <h3 className="text-lg font-bold text-white uppercase mb-1 font-sans">The Alchemist</h3>
                            <p className="text-zinc-500 text-xs font-mono mb-4">Molecular Mixology • London</p>
                            <button className="w-full py-3 border border-white/20 text-white hover:bg-white hover:text-black text-xs font-bold uppercase tracking-widest transition-colors">Book Now</button>
                        </div>
                    </div>
                    {/* Mock Saved Item 2 */}
                    <div className="border border-white/10 bg-black/80 backdrop-blur-md group relative hover:border-orange-400/50 transition-all">
                        <div className="h-48 bg-zinc-900 relative overflow-hidden">
                            <img src="https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&q=80" alt="Restaurant" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                            <div className="absolute top-4 left-4 bg-red-500 text-white px-2 py-1 text-[10px] font-bold uppercase tracking-wider">Closed</div>
                            <button className="absolute top-4 right-4 p-2 bg-black/50 text-white hover:text-cyan-400 hover:bg-black transition-colors rounded-full"><Bookmark className="w-4 h-4 fill-white" /></button>
                        </div>
                        <div className="p-6">
                            <h3 className="text-lg font-bold text-white uppercase mb-1 font-sans">Nobu Tokyo</h3>
                            <p className="text-zinc-500 text-xs font-mono mb-4">Japanese Fusion • Tokyo</p>
                            <button className="w-full py-3 border border-white/20 text-white hover:bg-white hover:text-black text-xs font-bold uppercase tracking-widest transition-colors">View Menu</button>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'preorder' && (
                <div className="max-w-2xl mx-auto border border-white/10 bg-black p-8">
                    <div className="flex items-center justify-between mb-8 pb-8 border-b border-white/10">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                                <span className="text-emerald-400 text-xs font-bold uppercase tracking-wider">Order Active</span>
                            </div>
                            <h3 className="text-2xl font-bold text-white uppercase">Order #8821</h3>
                            <p className="text-zinc-500 font-mono text-sm">Est. Arrival: 19:45</p>
                        </div>
                        <div className="text-right">
                            <div className="text-3xl font-bold text-white">$145.00</div>
                            <div className="text-xs text-zinc-500 uppercase">Paid via Wallet</div>
                        </div>
                    </div>

                    <div className="space-y-8 relative">
                        {/* Timeline Line */}
                        <div className="absolute left-3 top-2 bottom-2 w-px bg-zinc-800" />

                        <div className="flex gap-6 relative">
                            <div className="w-6 h-6 rounded-full bg-emerald-500 border-4 border-black z-10 flex items-center justify-center">
                                <CheckCircle className="w-3 h-3 text-black" />
                            </div>
                            <div>
                                <h4 className="text-sm font-bold text-white uppercase">Order Confirmed</h4>
                                <p className="text-xs text-zinc-500 font-mono">18:30 • Payment processed</p>
                            </div>
                        </div>
                        <div className="flex gap-6 relative">
                            <div className="w-6 h-6 rounded-full bg-emerald-500 border-4 border-black z-10 flex items-center justify-center">
                                <Clock className="w-3 h-3 text-black" />
                            </div>
                            <div>
                                <h4 className="text-sm font-bold text-white uppercase">Preparing</h4>
                                <p className="text-xs text-zinc-500 font-mono">18:45 • Chef initiated</p>
                            </div>
                        </div>
                        <div className="flex gap-6 relative">
                            <div className="w-6 h-6 rounded-full bg-zinc-800 border-4 border-black z-10" />
                            <div>
                                <h4 className="text-sm font-bold text-zinc-500 uppercase">Ready for Pickup</h4>
                                <p className="text-xs text-zinc-600 font-mono">Est. 19:45</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DiningConcierge;
