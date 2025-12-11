
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Send, Loader2, Calendar, MapPin, DollarSign, Clock, CheckCircle, ArrowRight, Plane, Train, Bus, Car, Hotel, Bed, Star, Map, Navigation, ChevronDown, ChevronRight, Bookmark, Sparkles, ShieldCheck, Ticket, Users, CornerDownRight, Footprints, Camera, Utensils, Music, Info, X } from 'lucide-react';
import { generateItinerary, generateImage } from '../services/geminiService';
import { dbService } from '../services/dbService';
import { TripItinerary, AppView, UserProfile } from '../types';

interface TripPlannerProps {
    prompt: string;
    setPrompt: (prompt: string) => void;
    isLoggedIn: boolean;
    user: UserProfile | null;
    setView: (view: AppView) => void;
    setNavVisible: (visible: boolean) => void;
}

type Tab = 'TRAVEL' | 'STAY' | 'ITINERARY';

const HOTEL_IMAGES = [
    "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&q=80"
];

const CinematicLoader = () => {
    return (
        <div className="fixed inset-0 z-[900] bg-black flex items-center justify-center">
            <div className="flex items-center gap-1 h-12">
                <div className="w-1 bg-cyan-400/80 animate-[wave_1s_ease-in-out_infinite]" style={{ animationDelay: '0ms' }} />
                <div className="w-1 bg-cyan-300/80 animate-[wave_1s_ease-in-out_infinite]" style={{ animationDelay: '100ms' }} />
                <div className="w-1 bg-white/80 animate-[wave_1s_ease-in-out_infinite]" style={{ animationDelay: '200ms' }} />
                <div className="w-1 bg-cyan-300/80 animate-[wave_1s_ease-in-out_infinite]" style={{ animationDelay: '300ms' }} />
                <div className="w-1 bg-cyan-400/80 animate-[wave_1s_ease-in-out_infinite]" style={{ animationDelay: '400ms' }} />
            </div>
        </div>
    );
}

const TripPlanner: React.FC<TripPlannerProps> = ({ prompt, setPrompt, isLoggedIn, user, setView, setNavVisible }) => {
    const [loading, setLoading] = useState(false);
    const [itinerary, setItinerary] = useState<TripItinerary | null>(null);
    const [bgImage, setBgImage] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<Tab>('TRAVEL');

    const [selectedTravelIndex, setSelectedTravelIndex] = useState<number | null>(null);
    const [selectedHotelIndex, setSelectedHotelIndex] = useState<number | null>(null);
    const [activeDay, setActiveDay] = useState<number>(0);
    const [expandedNode, setExpandedNode] = useState<number | null>(null);
    const [bookingStatus, setBookingStatus] = useState<'idle' | 'processing' | 'confirmed'>('idle');

    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' ? window.innerWidth < 768 : false);
    const nodeRefs = useRef<(HTMLDivElement | null)[]>([]);
    const [isScrolled, setIsScrolled] = useState(false);

    const BASE_STEP_Y = 160;
    const EXPANDED_EXTRA_HEIGHT = isMobile ? 20 : 480;

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);

        let ticking = false;
        const handleScroll = () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    setIsScrolled(window.scrollY > 50);
                    ticking = false;
                });
                ticking = true;
            }
        };
        window.addEventListener('scroll', handleScroll);

        return () => {
            window.removeEventListener('resize', checkMobile);
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    const handlePlanTrip = async () => {
        if (!prompt.trim()) return;

        if (!isLoggedIn) {
            setView(AppView.AUTH);
            return;
        }

        setLoading(true);
        setItinerary(null);
        setBgImage(null);
        setSelectedTravelIndex(null);
        setSelectedHotelIndex(null);
        setActiveDay(0);
        setBookingStatus('idle');
        window.scrollTo(0, 0);

        try {
            // 1. Generate Itinerary
            const result = await generateItinerary(prompt);
            setItinerary(result);
            setActiveTab('TRAVEL');

            // 2. Save Data to DB (Supabase/Local)
            if (user) {
                dbService.saveTrip(user.id, result);
                dbService.savePrompt(user.id, prompt);
            }

            // 3. Generate Visuals
            generateImage(`Cinematic wide angle travel shot of ${result.destination}, black and white high contrast photography, 8k`)
                .then(setBgImage)
                .catch(console.error);

        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleInputFocus = () => {
        setTimeout(() => {
            textareaRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 300);
    };

    const handleBookItinerary = () => {
        setBookingStatus('processing');
        setTimeout(() => {
            setBookingStatus('confirmed');
            setTimeout(() => {
                // Optionally redirect to Wallet or Dashboard
                setBookingStatus('idle');
                setView(AppView.WALLET);
            }, 2000);
        }, 2000);
    };

    const handleNodeClick = (idx: number) => {
        if (expandedNode === idx) {
            setExpandedNode(null);
        } else {
            setExpandedNode(idx);
            if (!isMobile) {
                setTimeout(() => {
                    if (nodeRefs.current[idx]) {
                        const yOffset = -150;
                        const element = nodeRefs.current[idx];
                        const y = element!.getBoundingClientRect().top + window.scrollY + yOffset;
                        window.scrollTo({ top: y, behavior: 'smooth' });
                    }
                }, 100);
            }
        }
    };

    const getNodeStyle = (idx: number) => {
        if (expandedNode === null) return 'opacity-100 scale-100 blur-0';
        if (expandedNode === idx) return 'opacity-100 scale-100 z-50 blur-0';
        return 'opacity-20 scale-95 blur-[2px] grayscale transition-all duration-500';
    };

    const activeActivity = expandedNode !== null && itinerary?.days?.[activeDay]?.activities?.[expandedNode]
        ? itinerary.days[activeDay].activities[expandedNode]
        : null;

    const pathData = useMemo(() => {
        if (!itinerary?.days?.[activeDay]?.activities) return "";

        const items = itinerary.days[activeDay].activities;
        let currentY = 40;
        const yPositions: number[] = [];

        items.forEach((_, i) => {
            yPositions.push(currentY);
            const extra = (!isMobile && expandedNode === i) ? EXPANDED_EXTRA_HEIGHT : 0;
            currentY += BASE_STEP_Y + extra;
        });

        let path = "";
        items.forEach((_, i) => {
            const y = yPositions[i];
            const xPercent = isMobile ? 50 : (i % 2 === 0 ? 20 : 80);

            if (i === 0) {
                path = `M ${xPercent}% ${y} `;
            } else {
                const prevY = yPositions[i - 1];
                const prevXPercent = isMobile ? 50 : ((i - 1) % 2 === 0 ? 20 : 80);

                const dist = y - prevY;
                const cp1y = prevY + (dist / 2);
                const cp2y = y - (dist / 2);

                path += `C ${prevXPercent}% ${cp1y}, ${xPercent}% ${cp2y}, ${xPercent}% ${y} `;
            }
        });
        return path;
    }, [itinerary, activeDay, expandedNode, isMobile, BASE_STEP_Y, EXPANDED_EXTRA_HEIGHT]);

    return (
        <div className="min-h-screen bg-black relative">

            {loading && <CinematicLoader />}

            {!itinerary ? (
                // --- INPUT STATE ---
                <div className="min-h-screen flex flex-col items-center justify-center px-6 relative">
                    <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none" />

                    <div className="max-w-3xl w-full relative z-10 animate-fade-in-up py-10">
                        <div className="text-center mb-10">
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 mb-6">
                                <span className="w-1.5 h-1.5 bg-cyan-400 animate-pulse" />
                                <span className="text-xs font-mono text-cyan-400">LOGISTICS ENGINE ONLINE</span>
                            </div>
                            <h2 className="text-4xl md:text-6xl font-bold text-white mb-6 tracking-tight uppercase">
                                Precision <span className="text-zinc-500">Logistics.</span>
                            </h2>
                            <p className="text-lg text-zinc-400 font-mono">End-to-end planning. Flights, Transfers, Hotels.</p>
                        </div>

                        <div className="bg-black border border-white/20 shadow-2xl overflow-hidden group hover:border-cyan-400/30 transition-colors">
                            <div className="h-10 bg-white/5 border-b border-white/10 flex items-center px-4 gap-2">
                                <div className="flex gap-1.5">
                                    <div className="w-2.5 h-2.5 bg-zinc-700" />
                                    <div className="w-2.5 h-2.5 bg-zinc-700" />
                                    <div className="w-2.5 h-2.5 bg-zinc-700" />
                                </div>
                                <span className="ml-4 text-xs font-mono text-zinc-500">planner.exe</span>
                            </div>
                            <textarea
                                ref={textareaRef}
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                onFocus={handleInputFocus}
                                placeholder="ENTER MISSION PARAMETERS..."
                                className="w-full h-40 bg-black text-white text-lg p-6 focus:outline-none resize-none placeholder-zinc-700 font-mono"
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                                        handlePlanTrip();
                                    }
                                }}
                            />
                            <div className="flex justify-between items-center px-6 pb-6 bg-black">
                                <div className="hidden md:block text-xs text-zinc-600 font-mono">
                                    ⌘ + Enter to run
                                </div>
                                <button
                                    onClick={handlePlanTrip}
                                    disabled={loading || !prompt.trim()}
                                    className="flex items-center gap-2 px-6 py-2 bg-white text-black text-sm font-bold uppercase hover:bg-cyan-400 hover:text-black transition-all ml-auto"
                                >
                                    <Send className="w-4 h-4" /> Generate Plan
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                // --- RESULTS STATE ---
                <div
                    className={`relative w-full pb-32 min-h-screen transition-all duration-700 ease-out will-change-[padding] ${isScrolled ? 'pt-24 md:pt-32' : 'pt-32 md:pt-48'}`}
                >

                    {/* Background Image (Fixed, Grayscale) */}
                    {bgImage && (
                        <div className="fixed inset-0 z-0 opacity-30 pointer-events-none grayscale">
                            <img src={bgImage} alt={itinerary.destination} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/95 to-black/80" />
                        </div>
                    )}

                    <div className="relative z-10 max-w-5xl mx-auto px-4 md:px-6 animate-fade-in-up">
                        {/* HEADER */}
                        <div className="flex flex-col lg:flex-row items-start lg:items-end justify-between mb-12 gap-8">
                            <div className="flex-1 w-full">
                                <div className="flex items-center gap-3 mb-2">
                                    <span className="text-xs font-mono text-cyan-400 bg-cyan-400/10 px-2 py-0.5 border border-cyan-400/20 uppercase tracking-widest">
                                        Mission Generated
                                    </span>
                                </div>
                                <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 tracking-tight leading-tight break-words uppercase">
                                    {itinerary.destination}
                                </h1>
                                <div className="flex flex-wrap items-center gap-6 text-sm text-zinc-400 border-t border-white/10 pt-4 w-full md:w-fit font-mono">
                                    <span className="flex items-center gap-2"><Calendar className="w-4 h-4 text-orange-400" /> {itinerary.duration}</span>
                                    <span className="flex items-center gap-2"><DollarSign className="w-4 h-4 text-emerald-400" /> {itinerary.totalEstimatedCost} Est.</span>
                                    <span className="flex items-center gap-2"><Users className="w-4 h-4 text-cyan-400" /> 2 Travelers</span>
                                </div>
                            </div>

                            <div className="flex bg-black p-1 border border-white/10 w-full lg:w-auto overflow-x-auto hide-scrollbar">
                                {[
                                    { id: 'TRAVEL', icon: Plane, label: 'Travel', color: 'text-cyan-400' },
                                    { id: 'STAY', icon: Hotel, label: 'Stay', color: 'text-orange-400' },
                                    { id: 'ITINERARY', icon: Map, label: 'Itinerary', color: 'text-emerald-400' }
                                ].map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id as Tab)}
                                        className={`flex-1 lg:flex-none flex items-center justify-center gap-2 px-6 md:px-8 py-3 text-sm font-bold uppercase transition-all whitespace-nowrap tracking-wider ${activeTab === tab.id
                                            ? 'bg-white text-black'
                                            : 'text-zinc-500 hover:text-white hover:bg-white/5'
                                            }`}
                                    >
                                        <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? 'text-black' : tab.color}`} />
                                        {tab.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* CONTENT AREA */}
                        <div>

                            {/* --- TAB 1: INBOUND TRAVEL --- */}
                            {activeTab === 'TRAVEL' && (
                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 gap-6">
                                        {itinerary.travelOptions?.map((option, idx) => (
                                            <div
                                                key={idx}
                                                onClick={() => setSelectedTravelIndex(idx)}
                                                className={`cursor-pointer border p-6 md:p-8 transition-all group relative overflow-hidden flex flex-col md:flex-row gap-8 items-start md:items-center ${selectedTravelIndex === idx
                                                    ? 'bg-cyan-900/10 border-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.1)]'
                                                    : 'bg-black border-white/10 hover:border-cyan-400/50'
                                                    }`}
                                            >
                                                <div className="flex flex-col items-center justify-center gap-3 min-w-[80px]">
                                                    <div className={`p-4 bg-white/5 border border-white/10 text-cyan-400 group-hover:bg-cyan-400 group-hover:text-black transition-colors ${selectedTravelIndex === idx ? 'bg-cyan-400 text-black' : ''}`}>
                                                        {option.type === 'FLIGHT' ? <Plane className="w-8 h-8" /> :
                                                            option.type === 'TRAIN' ? <Train className="w-8 h-8" /> :
                                                                option.type === 'BUS' ? <Bus className="w-8 h-8" /> : <Car className="w-8 h-8" />}
                                                    </div>
                                                    <span className="text-[10px] font-bold uppercase text-zinc-500 tracking-wider">{option.type}</span>
                                                </div>

                                                <div className="flex-1 w-full relative pr-16">
                                                    <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-6 gap-2">
                                                        <div>
                                                            <h4 className="text-xl md:text-2xl font-bold text-white mb-1 uppercase">{option.provider}</h4>
                                                            <div className="flex items-center gap-2 text-zinc-400 text-sm font-mono">
                                                                <span className="bg-white/5 px-2 py-0.5 border border-white/10">{option.duration}</span>
                                                                <span>•</span>
                                                                <span>Direct</span>
                                                            </div>
                                                        </div>
                                                        <span className="text-xl font-bold text-emerald-400 whitespace-nowrap border border-emerald-400/20 px-3 py-1 bg-emerald-400/10">{option.price}</span>
                                                    </div>

                                                    <div className="flex flex-col md:flex-row items-center justify-between gap-4 w-full">
                                                        <div className="w-full md:flex-1 md:text-left text-center">
                                                            <div className="text-2xl font-mono text-white mb-1">{option.departureTime}</div>
                                                            <div className="text-xs text-zinc-500 font-bold uppercase truncate max-w-[200px] mx-auto md:mx-0" title={option.departureLocation}>{option.departureLocation}</div>
                                                        </div>

                                                        <div className="w-full md:flex-[2] flex flex-col items-center px-4">
                                                            <div className="text-[10px] text-zinc-500 mb-1 font-mono uppercase">EST: {option.duration}</div>
                                                            <div className="w-full h-px bg-zinc-700 relative flex items-center">
                                                                <div className="w-1.5 h-1.5 bg-cyan-400 absolute left-0" />
                                                                <div className="absolute right-0 text-cyan-400 -mr-1">
                                                                    <ArrowRight className="w-4 h-4" />
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="w-full md:flex-1 md:text-right text-center">
                                                            <div className="text-2xl font-mono text-white mb-1">{option.arrivalTime}</div>
                                                            <div className="text-xs text-zinc-500 font-bold uppercase truncate max-w-[200px] mx-auto md:ml-auto md:mr-0" title={option.arrivalLocation}>{option.arrivalLocation}</div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="absolute top-6 right-6">
                                                    <div className={`w-5 h-5 border flex items-center justify-center transition-colors ${selectedTravelIndex === idx ? 'border-cyan-400 bg-cyan-400 text-black' : 'border-zinc-700 text-transparent'}`}>
                                                        <CheckCircle className="w-3 h-3 fill-current" />
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* --- TAB 2: ACCOMMODATION --- */}
                            {activeTab === 'STAY' && (
                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        {itinerary.accommodation?.map((hotel, idx) => (
                                            <div
                                                key={idx}
                                                onClick={() => setSelectedHotelIndex(idx)}
                                                className={`cursor-pointer group transition-all border relative bg-black ${selectedHotelIndex === idx
                                                    ? 'border-orange-400 ring-1 ring-orange-400'
                                                    : 'border-white/10 hover:border-orange-400/40'
                                                    }`}
                                            >
                                                <div className="h-64 relative overflow-hidden">
                                                    <img
                                                        src={HOTEL_IMAGES[idx % HOTEL_IMAGES.length]}
                                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                                        alt={hotel.name}
                                                        onError={(e) => {
                                                            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80';
                                                        }}
                                                    />
                                                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />

                                                    {selectedHotelIndex === idx && (
                                                        <div className="absolute top-4 left-4">
                                                            <div className="bg-orange-400 text-black px-3 py-1.5 text-xs font-bold flex items-center gap-1.5 uppercase tracking-wide">
                                                                <CheckCircle className="w-3.5 h-3.5 fill-black" /> Selected
                                                            </div>
                                                        </div>
                                                    )}

                                                    <div className="absolute top-4 right-4 bg-black/80 backdrop-blur px-2.5 py-1 text-xs font-bold text-white flex items-center gap-1 border border-white/20">
                                                        <Star className="w-3 h-3 text-orange-400 fill-orange-400" /> {hotel.rating}
                                                    </div>

                                                    <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                                                        <div>
                                                            <h3 className="text-xl font-bold text-white mb-1 uppercase tracking-tight">{hotel.name}</h3>
                                                            <div className="flex items-center gap-1.5 text-zinc-300 text-xs font-mono">
                                                                <MapPin className="w-3 h-3 text-orange-400" /> {hotel.location}
                                                            </div>
                                                        </div>
                                                        <div className="text-xl font-bold text-white bg-black/80 px-3 py-1 border border-white/20">{hotel.pricePerNight}</div>
                                                    </div>
                                                </div>

                                                <div className="p-6 flex flex-col h-[calc(100%-16rem)]">
                                                    <p className="text-zinc-400 text-sm mb-6 leading-relaxed line-clamp-3">
                                                        {hotel.description}
                                                    </p>

                                                    <div className="mt-auto pt-4 border-t border-white/5 flex flex-wrap gap-2">
                                                        {hotel.amenities.slice(0, 3).map((amenity, i) => (
                                                            <span key={i} className="text-[10px] bg-white/5 px-2.5 py-1 text-zinc-300 border border-white/10 uppercase tracking-wide">{amenity}</span>
                                                        ))}
                                                        {hotel.amenities.length > 3 && <span className="text-[10px] bg-white/5 px-2.5 py-1 text-zinc-300 border border-white/10 uppercase tracking-wide">+{hotel.amenities.length - 3}</span>}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* --- TAB 3: ITINERARY --- */}
                            {activeTab === 'ITINERARY' && (
                                <div>
                                    {/* DAY TABS */}
                                    <div className="sticky top-0 bg-black/95 backdrop-blur-xl z-[60] border-b border-white/10 mb-12 -mx-4 md:-mx-8 shadow-2xl transition-all relative">
                                        <div className="absolute top-0 bottom-0 left-0 w-8 md:w-16 bg-gradient-to-r from-black to-transparent z-10 pointer-events-none" />
                                        <div className="absolute top-0 bottom-0 right-0 w-8 md:w-16 bg-gradient-to-l from-black to-transparent z-10 pointer-events-none" />

                                        <div className="flex overflow-x-auto hide-scrollbar gap-px justify-start px-6 md:px-12 py-6 snap-x relative z-0">
                                            {itinerary.days?.map((day, idx) => (
                                                <button
                                                    key={idx}
                                                    onClick={() => {
                                                        setActiveDay(idx);
                                                        setExpandedNode(null);
                                                    }}
                                                    className={`snap-center flex-shrink-0 px-6 py-3 border border-white/10 transition-all flex flex-col items-center min-w-[100px] ${activeDay === idx
                                                        ? 'bg-white text-black border-white'
                                                        : 'bg-black text-zinc-500 hover:bg-white/5'
                                                        }`}
                                                >
                                                    <span className="text-[10px] font-bold uppercase tracking-wider mb-0.5">Day {idx + 1}</span>
                                                    <span className="font-bold text-sm">{day.day.split(' ')[0]}</span>
                                                </button>
                                            ))}
                                            <div className="w-8 flex-shrink-0" />
                                        </div>
                                    </div>

                                    {/* MAP CONTAINER */}
                                    <div className="relative min-h-[800px] w-full max-w-3xl mx-auto py-12 px-4">

                                        {expandedNode !== null && (
                                            <div
                                                className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm cursor-pointer"
                                                onClick={() => setExpandedNode(null)}
                                            />
                                        )}

                                        <svg
                                            className={`absolute top-0 left-0 w-full h-full pointer-events-none z-0 overflow-visible transition-opacity duration-500 ${expandedNode !== null ? 'opacity-30 blur-[1px]' : 'opacity-100'}`}
                                            xmlns="http://www.w3.org/2000/svg"
                                        >
                                            <defs>
                                                <linearGradient id="lineGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                                    <stop offset="0%" stopColor="#22d3ee" />
                                                    <stop offset="100%" stopColor="#fb923c" />
                                                </linearGradient>
                                            </defs>
                                            <path
                                                d={pathData}
                                                fill="none"
                                                stroke="url(#lineGradient)"
                                                strokeWidth="2"
                                                strokeLinecap="square"
                                                className="transition-all duration-500 opacity-60"
                                            />
                                        </svg>

                                        {/* NODES */}
                                        <div className="relative">
                                            {itinerary.days?.[activeDay]?.activities?.map((activity, idx) => {
                                                const isEven = idx % 2 === 0;
                                                const isExpanded = expandedNode === idx;

                                                return (
                                                    <div
                                                        key={idx}
                                                        ref={(el) => { nodeRefs.current[idx] = el; }}
                                                        className={`flex relative justify-center md:justify-${isEven ? 'start' : 'end'} transition-all duration-500 ease-out ${getNodeStyle(idx)}`}
                                                        style={{
                                                            marginBottom: (!isMobile && isExpanded) ? `${EXPANDED_EXTRA_HEIGHT + 60}px` : '160px',
                                                            paddingLeft: !isMobile && isEven ? '20%' : '0',
                                                            paddingRight: !isMobile && !isEven ? '20%' : '0',
                                                        }}
                                                    >
                                                        <div className="relative group flex flex-col items-center">
                                                            {/* NODE BUTTON - SQUARE */}
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleNodeClick(idx);
                                                                }}
                                                                className={`relative w-20 h-20 border flex items-center justify-center transition-all duration-300 z-20 ${isExpanded
                                                                    ? 'bg-white border-white text-black scale-110 shadow-[0_0_30px_rgba(255,255,255,0.3)]'
                                                                    : 'bg-black border-white/20 text-white hover:border-cyan-400 hover:text-cyan-400 hover:scale-110'
                                                                    }`}
                                                            >
                                                                {idx === 0 ? <Camera className="w-8 h-8" /> :
                                                                    activity.title.toLowerCase().includes('lunch') || activity.title.toLowerCase().includes('dinner') ? <Utensils className="w-8 h-8" /> :
                                                                        activity.title.toLowerCase().includes('concert') ? <Music className="w-8 h-8" /> :
                                                                            <MapPin className="w-8 h-8" />}
                                                            </button>

                                                            {/* TIME LABEL */}
                                                            <div className={`absolute -top-10 left-1/2 -translate-x-1/2 bg-black px-3 py-1.5 border border-white/20 text-sm font-mono text-white whitespace-nowrap z-10 transition-opacity duration-300 ${isExpanded ? 'opacity-100' : 'opacity-80'}`}>
                                                                {activity.time}
                                                            </div>

                                                            {!isExpanded && (
                                                                <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 whitespace-nowrap">
                                                                    <span className="text-sm font-bold text-white bg-black px-3 py-1 border border-white/10 uppercase tracking-tight">{activity.title}</span>
                                                                </div>
                                                            )}

                                                            {/* DESKTOP CARD */}
                                                            {!isMobile && isExpanded && (
                                                                <div
                                                                    className={`
                                                                z-[100] animate-fade-in-up origin-top absolute top-[100%] mt-6 w-[400px] ${isEven ? 'left-0 md:left-full md:ml-8' : 'right-0 md:right-full md:mr-8'}
                                                            `}
                                                                    onClick={(e) => e.stopPropagation()}
                                                                >
                                                                    <div className="bg-black border border-white/20 p-6 shadow-2xl relative overflow-hidden overflow-y-auto h-[420px]">

                                                                        <button
                                                                            onClick={() => setExpandedNode(null)}
                                                                            className="absolute top-4 right-4 p-2 bg-white/5 hover:bg-white/10 z-10"
                                                                        >
                                                                            <X className="w-4 h-4 text-white" />
                                                                        </button>

                                                                        <div className="flex justify-between items-start mb-2 pr-8 relative z-10">
                                                                            <h4 className="font-bold text-white text-xl leading-tight uppercase">{activity.title}</h4>
                                                                        </div>

                                                                        <span className="inline-block text-xs bg-white text-black px-2 py-1 mb-3 font-bold border border-white">
                                                                            {activity.estimatedCost}
                                                                        </span>

                                                                        <p className="text-sm text-zinc-300 mb-6 leading-relaxed border-l-2 border-cyan-500/30 pl-3">
                                                                            {activity.description}
                                                                        </p>

                                                                        {activity.transitFromPrev && (
                                                                            <div className="bg-white/5 p-4 text-xs text-zinc-300 flex items-start gap-3 mb-4 border border-white/10">
                                                                                <div className="p-2 bg-black border border-cyan-500/30 text-cyan-400 mt-1">
                                                                                    <Footprints className="w-4 h-4" />
                                                                                </div>
                                                                                <div>
                                                                                    <div className="font-bold uppercase text-[10px] text-zinc-500 mb-1 tracking-wider">Logistics</div>
                                                                                    <div className="font-bold text-white mb-0.5">
                                                                                        {activity.transitFromPrev.mode} • {activity.transitFromPrev.duration}
                                                                                    </div>
                                                                                    <div className="opacity-80">{activity.transitFromPrev.instruction}</div>
                                                                                </div>
                                                                            </div>
                                                                        )}

                                                                        <div className="flex gap-3 mt-auto">
                                                                            <button className="flex-1 py-3 bg-white hover:bg-cyan-400 hover:text-black text-black text-sm font-bold uppercase tracking-wider transition-colors">
                                                                                Details
                                                                            </button>
                                                                            {activity.bookingRequired && (
                                                                                <button className="px-4 py-3 bg-transparent border border-white/20 hover:bg-white hover:text-black text-white text-sm font-bold uppercase tracking-wider transition-colors flex items-center gap-2">
                                                                                    <Ticket className="w-4 h-4" /> Book
                                                                                </button>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>

                                        <div className={`absolute top-[0%] left-1/2 -translate-x-1/2 md:left-[20%] -translate-y-[80px] transition-opacity ${expandedNode !== null ? 'opacity-20' : 'opacity-100'}`}>
                                            <div className="text-xs font-bold uppercase text-zinc-500 tracking-widest bg-black px-2 py-1 border border-white/10">Start</div>
                                        </div>

                                    </div>
                                </div>
                            )}

                            {/* GLOBAL BOOKING BAR */}
                            {activeTab === 'ITINERARY' && (
                                <div className="fixed bottom-0 left-0 right-0 bg-black/95 backdrop-blur-xl border-t border-white/10 p-4 md:p-6 z-[60] flex items-center justify-between gap-4 animate-fade-in-up">
                                    <div className="hidden md:block">
                                        <div className="text-xs text-zinc-500 uppercase font-bold tracking-widest">Estimated Cost</div>
                                        <div className="text-2xl font-bold text-white">{itinerary.totalEstimatedCost}</div>
                                    </div>
                                    <button
                                        onClick={handleBookItinerary}
                                        disabled={bookingStatus !== 'idle'}
                                        className={`flex-1 md:flex-none md:w-auto px-8 py-4 font-bold text-sm uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${bookingStatus === 'idle'
                                            ? 'bg-gradient-to-r from-cyan-400 to-emerald-400 text-black hover:scale-105'
                                            : bookingStatus === 'processing'
                                                ? 'bg-white text-black'
                                                : 'bg-emerald-500 text-black'
                                            }`}
                                    >
                                        {bookingStatus === 'idle' && <><Ticket className="w-5 h-5" /> Book Itinerary</>}
                                        {bookingStatus === 'processing' && <><Loader2 className="w-5 h-5 animate-spin" /> Processing...</>}
                                        {bookingStatus === 'confirmed' && <><CheckCircle className="w-5 h-5" /> Confirmed!</>}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* MOBILE MODAL CARD */}
                    {isMobile && activeActivity && (
                        <div
                            className="fixed inset-0 z-[1200] flex items-center justify-center p-4 animate-fade-in-up"
                            onClick={() => setExpandedNode(null)}
                        >
                            <div className="absolute inset-0 bg-black/90 backdrop-blur-md" />

                            <div
                                className="relative w-full max-w-sm bg-black border border-white/20 p-6 shadow-2xl overflow-hidden max-h-[80vh] overflow-y-auto"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <button
                                    onClick={() => setExpandedNode(null)}
                                    className="absolute top-4 right-4 p-2 bg-white/5 hover:bg-white/10 z-10"
                                >
                                    <X className="w-4 h-4 text-white" />
                                </button>

                                <div className="flex justify-between items-start mb-2 pr-8 relative z-10">
                                    <h4 className="font-bold text-white text-xl leading-tight uppercase">{activeActivity.title}</h4>
                                </div>

                                <span className="inline-block text-xs bg-white text-black px-2 py-1 mb-3 border border-white font-bold">
                                    {activeActivity.estimatedCost}
                                </span>

                                <p className="text-sm text-zinc-300 mb-6 leading-relaxed border-l-2 border-white/20 pl-3">
                                    {activeActivity.description}
                                </p>

                                {activeActivity.transitFromPrev && (
                                    <div className="bg-white/5 p-4 text-xs text-zinc-300 flex items-start gap-3 mb-4 border border-white/10">
                                        <div className="p-2 bg-black border border-cyan-400/30 text-cyan-400 mt-1">
                                            <Footprints className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <div className="font-bold uppercase text-[10px] text-zinc-500 mb-1 tracking-wider">Logistics</div>
                                            <div className="font-bold text-white mb-0.5">
                                                {activeActivity.transitFromPrev.mode} • {activeActivity.transitFromPrev.duration}
                                            </div>
                                            <div className="opacity-80">{activeActivity.transitFromPrev.instruction}</div>
                                        </div>
                                    </div>
                                )}

                                <div className="flex gap-3 mt-4">
                                    <button className="flex-1 py-3 bg-white text-black text-sm font-bold uppercase tracking-wider transition-colors hover:bg-cyan-400">
                                        Details
                                    </button>
                                    {activeActivity.bookingRequired && (
                                        <button className="px-4 py-3 bg-transparent border border-white/20 hover:bg-white hover:text-black text-white text-sm font-bold uppercase tracking-wider transition-colors flex items-center gap-2">
                                            <Ticket className="w-4 h-4" /> Book
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default TripPlanner;
