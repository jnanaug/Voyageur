
import React, { useState, useRef, useEffect } from 'react';
import { CreditCard, ArrowRight, Calendar, History, ChevronRight, LayoutGrid, Settings, Plane, Crown, Leaf, MapPin, Zap, Terminal, Globe, Star, Wallet, Award, Fingerprint, Users, Link } from 'lucide-react';
import { AppView, UserProfile } from '../types';
import { dbService } from '../services/dbService';

interface DashboardProps {
    setView: (view: AppView) => void;
    user: UserProfile | null;
}

type Tab = 'overview' | 'prompts' | 'settings';

const TimelineNode = ({ status, label }: { status: 'completed' | 'active' | 'pending', label: string }) => (
    <div className="flex flex-col items-center gap-3 relative z-10 group">
        <div className={`w-6 h-6 border-2 flex items-center justify-center transition-all duration-300 ${status === 'completed' ? 'bg-white border-white text-black' :
            status === 'active' ? 'bg-black border-cyan-400 animate-pulse' :
                'bg-black border-zinc-700'
            }`}>
            {status === 'completed' && <div className="w-2 h-2 bg-black" />}
            {status === 'active' && <div className="w-1.5 h-1.5 bg-cyan-400 animate-ping" />}
        </div>
        <span className={`text-[10px] font-bold uppercase tracking-wider transition-colors duration-300 ${status === 'pending' ? 'text-zinc-600' :
            status === 'active' ? 'text-cyan-400' : 'text-zinc-300'
            }`}>{label}</span>
    </div>
);

const DNAProgress = ({ label, value, color }: { label: string, value: number, color?: string }) => (
    <div>
        <div className="flex justify-between text-xs font-bold text-zinc-400 mb-1.5 uppercase tracking-wider">
            <span>{label}</span>
            <span>{value}%</span>
        </div>
        <div className="h-2 bg-zinc-900 overflow-hidden border border-white/10">
            <div className={`h-full bg-gradient-to-r from-cyan-500 to-teal-500 relative`} style={{ width: `${value}%` }}>
            </div>
        </div>
    </div>
);

const ToggleSwitch = () => (
    <label className="relative inline-flex items-center cursor-pointer group">
        <input type="checkbox" className="sr-only peer" />
        <div className="w-10 h-5 bg-zinc-800 peer-focus:outline-none peer peer-checked:after:translate-x-full peer-checked:after:border-black after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-black after:border-zinc-300 after:border after:h-4 after:w-4 after:transition-all peer-checked:bg-cyan-400 border border-white/10 group-hover:border-cyan-400/50 transition-colors"></div>
    </label>
);

const SettingRow = ({ label, desc, children }: { label: string, desc: string, children?: React.ReactNode }) => (
    <div className="flex justify-between items-center py-4 border-b border-white/5 first:pt-0 last:border-0 hover:bg-white/[0.02] -mx-4 px-4 transition-colors">
        <div>
            <div className="text-sm font-bold text-white uppercase tracking-wide">{label}</div>
            <div className="text-xs text-zinc-500 mt-0.5">{desc}</div>
        </div>
        {children}
    </div>
);


// --- MOCK DATA FOR MAP ---
const CITY_COORDINATES: Record<string, { lat: number, lon: number }> = {
    "Paris": { lat: 48.8566, lon: 2.3522 },
    "London": { lat: 51.5074, lon: -0.1278 },
    "New York": { lat: 40.7128, lon: -74.0060 },
    "Tokyo": { lat: 35.6762, lon: 139.6503 },
    "Dubai": { lat: 25.2048, lon: 55.2708 },
    "Singapore": { lat: 1.3521, lon: 103.8198 },
    "Los Angeles": { lat: 34.0522, lon: -118.2437 },
    "Sydney": { lat: -33.8688, lon: 151.2093 },
    "Rome": { lat: 41.9028, lon: 12.4964 },
    "Barcelona": { lat: 41.3851, lon: 2.1734 },
    "Amsterdam": { lat: 52.3676, lon: 4.9041 },
    "Berlin": { lat: 52.5200, lon: 13.4050 },
    "San Francisco": { lat: 37.7749, lon: -122.4194 },
    "Rio de Janeiro": { lat: -22.9068, lon: -43.1729 },
    "Cape Town": { lat: -33.9249, lon: 18.4241 },
    "Mumbai": { lat: 19.0760, lon: 72.8777 },
    "Bangkok": { lat: 13.7563, lon: 100.5018 },
    "Istanbul": { lat: 41.0082, lon: 28.9784 },
    "Cairo": { lat: 30.0444, lon: 31.2357 },
    "Mexico City": { lat: 19.4326, lon: -99.1332 },
    // Add more as needed or use a geocoding service in production
};

const WorldMap = ({ visitedCities }: { visitedCities: string[] }) => {
    // Simple Equirectangular projection (Plate Carrée)
    // x = (lon + 180) * (width / 360)
    // y = (90 - lat) * (height / 180)

    const getPosition = (city: string) => {
        const coords = CITY_COORDINATES[city] || CITY_COORDINATES[Object.keys(CITY_COORDINATES).find(c => city.includes(c)) || ''];

        if (!coords) return null;

        const x = ((coords.lon + 180) / 360) * 100;
        const y = ((90 - coords.lat) / 180) * 100;

        return { left: `${x}%`, top: `${y}%` };
    };

    return (
        <div className="relative w-full h-full bg-[#111] overflow-hidden group">
            {/* Map Image - Using a flat Equirectangular projection silhouette */}
            <div
                className="absolute inset-0 opacity-30 transition-transform duration-700 group-hover:scale-105"
                style={{
                    backgroundImage: `url('https://upload.wikimedia.org/wikipedia/commons/8/83/Equirectangular_projection_SW.jpg')`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    filter: 'invert(1) grayscale(1) contrast(1.5)' // Make it dark and moody
                }}
            />

            {/* Dots */}
            {visitedCities.map((city, idx) => {
                const pos = getPosition(city);
                if (!pos) return null;

                return (
                    <div
                        key={idx}
                        className="absolute w-2 h-2 bg-cyan-400 rounded-full shadow-[0_0_10px_rgba(34,211,238,0.8)] animate-pulse"
                        style={pos}
                        title={city}
                    >
                        <div className="absolute -inset-1 bg-cyan-400/30 rounded-full animate-ping" />
                    </div>
                );
            })}

            {/* Overlay Text */}
            <div className="absolute bottom-4 left-4 text-xs text-zinc-500 font-mono uppercase">
                {visitedCities.length > 0 ? `${visitedCities.length} Locations Tracked` : 'Global Satellites Offline'}
            </div>
        </div>
    );
};

const Dashboard: React.FC<DashboardProps> = ({ setView, user }) => {
    const [activeTab, setActiveTab] = useState<Tab>('overview');
    const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });
    const tabsRef = useRef<{ [key: string]: HTMLButtonElement | null }>({});

    const [stats, setStats] = useState({ totalSpend: 0, tripCount: 0, citiesVisited: 0, recentTrips: [] as any[] });
    const [prompts, setPrompts] = useState<any[]>([]);



    console.log("📊 [Dashboard.tsx] Rendered with User:", user);
    console.log("📊 [Dashboard.tsx] user.fullName:", user?.fullName);

    const firstName = (user?.fullName ? String(user.fullName) : 'Traveler').split(' ')[0];

    const tabs = [
        { id: 'overview', label: 'Overview', icon: LayoutGrid },
        { id: 'prompts', label: 'Prompt Log', icon: History },
        { id: 'settings', label: 'Settings', icon: Settings },
    ];

    useEffect(() => {
        const activeEl = tabsRef.current[activeTab];
        if (activeEl) {
            setIndicatorStyle({
                left: activeEl.offsetLeft,
                width: activeEl.offsetWidth
            });
        }
    }, [activeTab]);

    useEffect(() => {
        if (user) {
            const loadData = async () => {
                try {
                    const s = await dbService.getStats(user.id);
                    if (s) setStats(s);
                    const p = await dbService.getPrompts(user.id);
                    if (p) setPrompts(p);
                } catch (e) {
                    console.error("Dashboard data load failed", e);
                }
            };
            loadData();
        }
    }, [user, activeTab]);

    // Extract unique cities from recent trips for the map
    const visitedCityNames = Array.from(new Set((stats?.recentTrips || []).map((t: any) => t?.destination).filter(Boolean)));

    return (
        <div className="min-h-screen pt-32 pb-20 px-6 max-w-[1400px] mx-auto animate-fade-in-up bg-black">

            {/* HEADER SECTION */}
            <div className="flex flex-col md:flex-row items-end justify-between mb-12 gap-8">
                <div className="w-full md:w-auto">
                    <div className="flex items-center gap-2 mb-3">
                        <div className="w-2 h-2 bg-cyan-400 animate-pulse" />
                        <span className="text-xs font-mono text-cyan-400 uppercase tracking-widest border border-cyan-400/20 px-2 py-0.5 bg-cyan-400/10">System Online</span>
                    </div>
                    <h1 className="text-5xl font-bold text-white mb-2 tracking-tight uppercase">{firstName}'s HQ</h1>

                    <div className="relative flex items-center bg-black p-1 border border-white/10 w-fit mt-6 overflow-hidden">
                        {/* Sliding Indicator */}
                        <div
                            className="absolute top-1 bottom-1 bg-white transition-all duration-300 ease-[cubic-bezier(0.25,1,0.5,1)] z-0"
                            style={{ left: indicatorStyle.left, width: indicatorStyle.width }}
                        />

                        {tabs.map((tab) => {
                            const isActive = activeTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    ref={(el) => { tabsRef.current[tab.id] = el; }}
                                    onClick={() => setActiveTab(tab.id as Tab)}
                                    className={`relative z-10 px-5 py-2 text-sm font-bold transition-colors duration-300 flex items-center gap-2 uppercase tracking-wide ${isActive ? 'text-black' : 'text-zinc-500 hover:text-white'
                                        }`}
                                >
                                    <tab.icon className={`w-4 h-4`} />
                                    {tab.label}
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={() => setView(AppView.DINING)}
                        className="flex items-center justify-center gap-2 px-6 py-4 border border-white/20 text-white font-bold text-sm uppercase tracking-widest transition-all hover:bg-white hover:text-black"
                    >
                        Concierge
                    </button>
                    <button
                        onClick={() => setView(AppView.PLANNER)}
                        className="flex items-center justify-center gap-2 px-8 py-4 bg-white text-black font-bold text-sm uppercase tracking-widest transition-all hover:bg-cyan-400 hover:border-cyan-400"
                    >
                        <Plane className="w-5 h-5" /> Initialize New Trip
                    </button>
                </div>
            </div>

            {activeTab === 'overview' && (
                <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-12 gap-6 animate-fade-in-up">

                    {/* Spend Card */}
                    <div
                        onClick={() => setView(AppView.WALLET)}
                        className="md:col-span-2 lg:col-span-3 bg-black border border-white/10 p-8 relative overflow-hidden group hover:border-emerald-400/30 transition-all duration-500 cursor-pointer"
                    >
                        <div className="flex justify-between items-start mb-6">
                            <div className="p-3 bg-white/5 border border-white/10 text-white"><CreditCard className="w-5 h-5" /></div>
                            <span className="text-xs font-mono text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 px-2 py-1">+12%</span>
                        </div>
                        <div className="text-4xl font-bold text-white mb-1 tracking-tight">${(stats?.totalSpend || 0).toLocaleString()}</div>
                        <div className="text-xs text-zinc-500 uppercase tracking-widest font-bold">Lifetime Spend</div>
                        <div className="absolute bottom-0 left-0 w-full h-1 bg-zinc-900">
                            <div className="h-full bg-emerald-400 w-[5%]" />
                        </div>
                    </div>

                    {/* Loyalty Card */}
                    <div
                        onClick={() => setView(AppView.REWARDS)}
                        className="md:col-span-2 lg:col-span-3 bg-black border border-white/10 p-8 relative overflow-hidden group hover:border-orange-400/30 transition-all duration-500 cursor-pointer"
                    >
                        <div className="flex justify-between items-start mb-6 relative z-10">
                            <div className="p-3 bg-white/5 border border-white/10 text-white"><Crown className="w-5 h-5" /></div>
                            <span className="text-[10px] font-bold text-orange-400 bg-orange-400/10 border border-orange-400/20 px-2 py-1 uppercase tracking-wider">Member</span>
                        </div>
                        <div className="text-4xl font-bold text-white mb-1 tracking-tight">{(stats?.tripCount || 0) * 150}</div>
                        <div className="text-xs text-zinc-500 uppercase tracking-widest font-bold relative z-10">Voyager Points</div>
                    </div>

                    {/* Carbon Card */}
                    <div
                        onClick={() => setView(AppView.SUSTAINABILITY)}
                        className="md:col-span-2 lg:col-span-3 bg-black border border-white/10 p-8 relative overflow-hidden group hover:border-cyan-400/30 transition-all duration-500 cursor-pointer"
                    >
                        <div className="flex justify-between items-start mb-6">
                            <div className="p-3 bg-white/5 border border-white/10 text-white"><Leaf className="w-5 h-5" /></div>
                            <span className="text-xs font-bold text-zinc-400 bg-white/5 px-2 py-1 border border-white/10">Neutral</span>
                        </div>
                        <div className="text-4xl font-bold text-white mb-1 tracking-tight">{(stats?.tripCount || 0) * 0.5}t</div>
                        <div className="text-xs text-zinc-500 uppercase tracking-widest font-bold">Carbon Offset</div>
                    </div>

                    {/* Trips Count */}
                    <div className="md:col-span-2 lg:col-span-3 bg-black border border-white/10 p-8 relative overflow-hidden group hover:border-white/30 transition-all duration-500">
                        <div className="flex justify-between items-start mb-6">
                            <div className="p-3 bg-white/5 border border-white/10 text-white"><MapPin className="w-5 h-5" /></div>
                        </div>
                        <div className="text-4xl font-bold text-white mb-1 tracking-tight">{stats?.citiesVisited || 0}</div>
                        <div className="text-xs text-zinc-500 uppercase tracking-widest font-bold">Cities Unlocked</div>
                    </div>

                    {/* ACTIVE TRIP */}
                    <div className="lg:col-span-8 bg-black border border-white/10 relative group shadow-2xl overflow-hidden hover:border-cyan-400/20">
                        {(stats?.recentTrips || []).length > 0 ? (
                            <>
                                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-20 grayscale group-hover:scale-105 transition-transform duration-700" />
                                <div className="absolute inset-0 bg-black/80" />
                                <div className="relative z-10 p-8 md:p-10 flex flex-col justify-center min-h-[300px]">
                                    <div className="inline-flex items-center gap-2 mb-4">
                                        <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                                        <span className="text-emerald-400 text-xs font-bold uppercase tracking-wider">Most Recent</span>
                                    </div>
                                    <h2 className="text-3xl font-bold text-white mb-2 uppercase">{stats?.recentTrips[0]?.destination || 'Unknown'}</h2>
                                    <p className="text-zinc-400 max-w-md mb-8 font-mono">{stats?.recentTrips[0]?.duration || 'N/A'} • {stats?.recentTrips[0]?.total_cost || 'N/A'}</p>
                                    <button className="w-fit px-6 py-3 bg-white hover:bg-cyan-400 text-black font-bold uppercase tracking-widest transition-colors">
                                        View Itinerary
                                    </button>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-20 grayscale group-hover:scale-105 transition-transform duration-700" />
                                <div className="absolute inset-0 bg-black/80" />
                                <div className="relative z-10 p-8 md:p-10 flex flex-col justify-center min-h-[300px]">
                                    <h2 className="text-3xl font-bold text-white mb-4 uppercase">No Active Missions</h2>
                                    <p className="text-zinc-400 max-w-md mb-8 font-mono">You haven't planned any trips yet. Start a new prompt.</p>
                                    <button
                                        onClick={() => setView(AppView.PLANNER)}
                                        className="w-fit px-6 py-3 bg-white hover:bg-cyan-400 text-black font-bold uppercase tracking-widest transition-colors"
                                    >
                                        Start Planning
                                    </button>
                                </div>
                            </>
                        )}
                    </div>

                    {/* TRAVEL DNA */}
                    <div className="lg:col-span-4 flex flex-col gap-6">
                        <div
                            onClick={() => setView(AppView.TRAVEL_DNA)}
                            className="flex-1 bg-black p-8 border border-white/10 relative overflow-hidden hover:border-cyan-400/20 cursor-pointer"
                        >
                            <h3 className="text-xs font-bold text-white uppercase tracking-widest mb-8 flex items-center gap-2">
                                <Fingerprint className="w-4 h-4 text-cyan-400" /> Travel DNA
                            </h3>
                            <div className="space-y-6">
                                <DNAProgress label="Adventure" value={75} />
                                <DNAProgress label="Luxury" value={30} />
                                <DNAProgress label="Culture" value={90} />
                                <DNAProgress label="Relaxation" value={45} />
                            </div>
                        </div>
                    </div>

                    {/* WORLD MAP */}
                    <div className="lg:col-span-8 min-h-[12rem] bg-black border border-white/10 relative overflow-hidden group hover:border-cyan-400/30 transition-all duration-500">
                        <WorldMap visitedCities={visitedCityNames} />
                    </div>

                    {/* QUICK ACTIONS & INTEGRATIONS */}
                    <div className="lg:col-span-4 grid gap-6">
                        <div
                            onClick={() => setView(AppView.INTEGRATIONS)}
                            className="bg-black p-6 border border-white/10 flex items-center justify-between cursor-pointer hover:border-white/30"
                        >
                            <div>
                                <h3 className="text-xs font-bold text-white uppercase tracking-widest mb-1">Integrations</h3>
                                <div className="text-[10px] text-zinc-500 font-mono">3 Active Connections</div>
                            </div>
                            <Link className="w-4 h-4 text-zinc-400" />
                        </div>

                        <div
                            onClick={() => setView(AppView.COMMUNITY)}
                            className="bg-black p-6 border border-white/10 flex items-center justify-between cursor-pointer hover:border-white/30"
                        >
                            <div>
                                <h3 className="text-xs font-bold text-white uppercase tracking-widest mb-1">Community</h3>
                                <div className="text-[10px] text-zinc-500 font-mono">Trending Itineraries</div>
                            </div>
                            <Users className="w-4 h-4 text-zinc-400" />
                        </div>
                    </div>

                    {/* HISTORY */}
                    <div className="lg:col-span-12">
                        <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2 uppercase tracking-wide">
                            <History className="w-5 h-5 text-zinc-400" /> Recent Expeditions
                        </h3>
                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {(stats?.recentTrips || []).length > 0 ? (stats?.recentTrips || []).map((trip: any) => (
                                <div key={trip?.id || Math.random()} className="h-40 border border-white/10 p-6 flex flex-col justify-between hover:bg-white/5 transition-colors group">
                                    <div className="flex justify-between items-start">
                                        <h4 className="text-xl font-bold text-white uppercase">{trip?.destination || 'Unknown'}</h4>
                                        <span className="text-xs text-zinc-500 font-mono">{trip?.created_at ? new Date(trip.created_at).toLocaleDateString() : 'N/A'}</span>
                                    </div>
                                    <div className="flex justify-between items-end">
                                        <span className="text-sm text-zinc-400 font-mono">{trip?.duration || 'N/A'}</span>
                                        <ArrowRight className="w-5 h-5 text-zinc-600 group-hover:text-cyan-400 transition-colors" />
                                    </div>
                                </div>
                            )) : (
                                <div className="h-40 border border-white/10 border-dashed flex items-center justify-center text-zinc-600 font-mono text-sm uppercase col-span-4">
                                    No history found.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'prompts' && (
                <div className="max-w-4xl mx-auto animate-fade-in-up">
                    <div className="bg-black border border-white/10 overflow-hidden">
                        <div className="p-8 border-b border-white/10 flex justify-between items-center bg-white/[0.02]">
                            <h2 className="text-2xl font-bold text-white flex items-center gap-3 uppercase">
                                <Terminal className="w-6 h-6 text-white" /> Interaction Logs
                            </h2>
                            <div className="flex gap-2">
                                <button className="px-4 py-2 bg-black border border-white/20 text-xs font-bold text-zinc-400 hover:text-white hover:border-white transition-all uppercase tracking-wider">Export CSV</button>
                            </div>
                        </div>
                        {prompts.length > 0 ? (
                            <div className="max-h-[500px] overflow-y-auto">
                                {prompts.map((p, idx) => (
                                    <div key={p.id} className="p-6 border-b border-white/5 hover:bg-white/5 transition-colors group">
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="text-xs font-mono text-cyan-400 uppercase tracking-widest">CMD_{idx + 100}</span>
                                            <span className="text-xs text-zinc-600 font-mono">{new Date(p.created_at).toLocaleString()}</span>
                                        </div>
                                        <p className="text-zinc-300 font-mono text-sm leading-relaxed">
                                            <span className="text-zinc-600 mr-2">$</span>
                                            {p.prompt}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="p-8 text-center text-zinc-600 font-mono uppercase">
                                No prompts recorded.
                            </div>
                        )}
                    </div>
                </div>
            )}

            {activeTab === 'settings' && (
                <div className="max-w-5xl mx-auto grid md:grid-cols-12 gap-8 animate-fade-in-up">
                    {/* Sidebar */}
                    <div className="md:col-span-4 space-y-3">
                        <div className="bg-white text-black p-4 border border-white font-bold flex items-center justify-between uppercase tracking-wide text-sm">
                            Preferences <ChevronRight className="w-4 h-4" />
                        </div>
                        {['Notifications', 'Billing & Plan', 'Integrations'].map(item => (
                            <div key={item} className="bg-black p-4 border border-white/10 text-zinc-400 hover:text-white hover:border-white cursor-pointer transition-all font-medium text-sm uppercase tracking-wide">
                                {item}
                            </div>
                        ))}
                    </div>

                    {/* Main Settings Area */}
                    <div className="md:col-span-8 bg-black border border-white/10 p-8 md:p-10">
                        <div className="mb-10 pb-6 border-b border-white/10">
                            <h3 className="text-2xl font-bold text-white mb-2 uppercase">Travel Parameters</h3>
                            <p className="text-sm text-zinc-500 font-mono">Configure AI behavior.</p>
                        </div>

                        <div className="space-y-2">
                            <SettingRow label="Dietary Restrictions" desc="Filter dining options">
                                <select className="bg-black border border-white/20 text-white text-sm font-medium px-4 py-2 outline-none focus:border-white transition-colors cursor-pointer min-w-[140px] appearance-none uppercase tracking-wider">
                                    <option>None</option>
                                    <option>Vegetarian</option>
                                    <option>Vegan</option>
                                </select>
                            </SettingRow>

                            <SettingRow label="Seat Preference" desc="Flight bookings">
                                <div className="flex bg-black p-1 border border-white/10">
                                    <button className="px-4 py-1 text-xs font-bold bg-white text-black uppercase">Window</button>
                                    <button className="px-4 py-1 text-xs font-bold text-zinc-500 hover:text-white uppercase">Aisle</button>
                                </div>
                            </SettingRow>

                            <SettingRow label="Luxury Tier" desc="Hotel rating">
                                <div className="flex items-center gap-1 text-white">
                                    <Star className="w-4 h-4 fill-orange-400 text-orange-400" />
                                    <Star className="w-4 h-4 fill-orange-400 text-orange-400" />
                                    <Star className="w-4 h-4 fill-orange-400 text-orange-400" />
                                    <Star className="w-4 h-4 fill-orange-400 text-orange-400" />
                                    <Star className="w-4 h-4 text-zinc-800" />
                                </div>
                            </SettingRow>

                            <div className="py-8">
                                <h3 className="text-lg font-bold text-white mb-4 uppercase">Application</h3>

                                <SettingRow label="Dark Mode" desc="Always on">
                                    <ToggleSwitch />
                                </SettingRow>

                                <SettingRow label="Real-time Updates" desc="SMS alerts">
                                    <ToggleSwitch />
                                </SettingRow>

                                <SettingRow label="Calendar Sync" desc="Google Calendar">
                                    <button className="text-xs text-black font-bold bg-white border border-white px-4 py-2 hover:bg-zinc-200 transition-colors uppercase tracking-wider">Connect</button>
                                </SettingRow>
                            </div>

                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default Dashboard;