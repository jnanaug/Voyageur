import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Send, Loader2, Calendar, MapPin, DollarSign, Clock, CheckCircle, ArrowRight, Plane, Train, Bus, Car, Hotel, Bed, Star, Map as MapIcon, Navigation, ChevronDown, ChevronRight, Bookmark, Sparkles, ShieldCheck, Ticket, Users, CornerDownRight, Footprints, Camera, Utensils, Music, Info, X, History, Edit2, Save, Menu, ChevronLeft, Terminal, ExternalLink, RefreshCw, Zap } from 'lucide-react';
import { generateItinerary, generateImage, regenerateItineraryDays, analyzeTripRequest, TripAnalysis } from '../services/geminiService';
import { dbService } from '../services/dbService';
import { googleCalendarService } from '../services/googleCalendarService';
import { TripItinerary, AppView, UserProfile } from '../types';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { DayMap, getPlaceLink, getDirectionsLink } from './DayMap';
import LoadingScreen from './LoadingScreen';

interface TripPlannerProps {
    prompt: string;
    setPrompt: (prompt: string) => void;
    isLoggedIn: boolean;
    user: UserProfile | null;
    setView: (view: AppView) => void;
    setNavVisible: (visible: boolean) => void;
    initialTrip?: any | null;
    clearSelectedTrip?: () => void;
    onBackToLogs?: () => void;
}

type Tab = 'TRAVEL' | 'STAY' | 'ITINERARY';
type WizardState = 'INPUT' | 'CLARIFYING' | 'GENERATING' | 'RESULTS';

const HOTEL_IMAGES = [
    "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&q=80"
];

const TacticalBackground = () => (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        {/* Ambient Glow */}
        <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[1000px] h-[1000px] bg-cyan-900/20 blur-[120px] rounded-full mix-blend-screen" />
        
        {/* 3D Grid Floor */}
        <div 
            className="absolute inset-0 opacity-30" 
            style={{
                backgroundImage: 'linear-gradient(rgba(34, 211, 238, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(34, 211, 238, 0.1) 1px, transparent 1px)',
                backgroundSize: '60px 60px',
                transform: 'perspective(1000px) rotateX(60deg) translateY(200px) scale(2)',
                maskImage: 'linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 40%, rgba(0,0,0,0) 80%)'
            }} 
        />

        {/* HUD Circles */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vw] max-w-[800px] max-h-[800px] border border-cyan-500/5 rounded-full animate-[spin_120s_linear_infinite]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[60vw] max-w-[600px] max-h-[600px] border border-dashed border-cyan-500/10 rounded-full animate-[spin_60s_linear_infinite_reverse]" />
    </div>
);

const TripPlanner: React.FC<TripPlannerProps> = ({ prompt, setPrompt, isLoggedIn, user, setView, setNavVisible, initialTrip, clearSelectedTrip, onBackToLogs }) => {
    const [loading, setLoading] = useState(false);
    const [wizardState, setWizardState] = useState<WizardState>(initialTrip ? 'RESULTS' : 'INPUT');
    const [analysis, setAnalysis] = useState<TripAnalysis | null>(null);
    const [selections, setSelections] = useState<Record<string, string>>({});
    
    // Sequential Question State
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [customAnswer, setCustomAnswer] = useState('');

    // Initialize state from initialTrip prop to ensure immediate rendering
    const getInitialItinerary = (): TripItinerary | null => {
        if (!initialTrip || !initialTrip.data) return null;
        let data = initialTrip.data;
        if (typeof data === 'string') {
            try { return JSON.parse(data); } catch { return null; }
        }
        return data;
    };

    const [itinerary, setItinerary] = useState<TripItinerary | null>(getInitialItinerary);
    const [bgImage, setBgImage] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<Tab>(() => initialTrip ? 'ITINERARY' : 'TRAVEL');

    // History & Edit State
    const [currentTripId, setCurrentTripId] = useState<string | null>(() => initialTrip?.id || null);
    const [isEditing, setIsEditing] = useState(false);

    const [selectedTravelIndex, setSelectedTravelIndex] = useState<number | null>(null);
    const [selectedHotelIndex, setSelectedHotelIndex] = useState<number | null>(null);
    const [activeDay, setActiveDay] = useState<number>(0);
    const [expandedNode, setExpandedNode] = useState<number | null>(null);
    const [bookingStatus, setBookingStatus] = useState<'idle' | 'processing' | 'confirmed'>('idle');
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [startDate, setStartDate] = useState<Date | null>(null);
    const [confirmedTrips, setConfirmedTrips] = useState<any[]>([]);
    const [dateConflictWarning, setDateConflictWarning] = useState<string | null>(null);
    const [isSyncing, setIsSyncing] = useState(false);
    const [isRegenerating, setIsRegenerating] = useState(false);
    const [showCreditAlert, setShowCreditAlert] = useState(false); // NEW: Custom Credit Alert Modal
    // NEW: Track hover date for calendar preview
    const [hoverDate, setHoverDate] = useState<Date | null>(null);

    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' ? window.innerWidth < 768 : false);
    const nodeRefs = useRef<(HTMLDivElement | null)[]>([]);
    const dayScrollRef = useRef<HTMLDivElement>(null); // Ref for Day Tabs Container

    // Drag-to-Scroll Refs
    const isDragging = useRef(false);
    const startX = useRef(0);
    const scrollLeft = useRef(0);

    const [isScrolled, setIsScrolled] = useState(false);

    // === DYNAMIC COST CALCULATION ===
    // Parse price string like "₹5,000", "$350", "₹8,000" to number
    const parseCost = (costStr: string | undefined): number => {
        if (!costStr) return 0;
        const match = costStr.match(/[\d,]+/);
        return match ? parseFloat(match[0].replace(/,/g, '')) : 0;
    };

    // Parse duration string like "5 Days" to get number of nights (days - 1)
    const parseNights = (duration: string | undefined): number => {
        if (!duration) return 1;
        const match = duration.match(/(\d+)/);
        return match ? Math.max(1, parseInt(match[1]) - 1) : 1;
    };

    // Dynamically calculate total cost based on selections
    const calculatedCost = useMemo(() => {
        if (!itinerary) return null;

        const nights = parseNights(itinerary.duration);

        // Travel cost (selected or first option as default)
        const travelIdx = selectedTravelIndex ?? 0;
        const travelCost = parseCost(itinerary.travelOptions?.[travelIdx]?.price);

        // Accommodation cost (selected hotel × nights)
        const hotelIdx = selectedHotelIndex ?? 0;
        const hotelCost = parseCost(itinerary.accommodation?.[hotelIdx]?.pricePerNight) * nights;

        // Activity costs (sum of all activities across all days)
        let activityCost = 0;
        itinerary.days?.forEach(day => {
            day.activities?.forEach(activity => {
                activityCost += parseCost(activity.estimatedCost);
            });
        });

        return travelCost + hotelCost + activityCost;
    }, [itinerary, selectedTravelIndex, selectedHotelIndex]);

    // Formatted cost string with currency symbol
    const formattedCost = calculatedCost !== null
        ? `₹${calculatedCost.toLocaleString('en-IN')}`
        : itinerary?.totalEstimatedCost || '—';

    // === AUTO-SELECT BEST OPTIONS ===
    // Find the index of the cheapest travel option
    const findBestTravelIndex = (options: typeof itinerary.travelOptions): number => {
        if (!options || options.length === 0) return 0;
        let bestIdx = 0;
        let bestPrice = Infinity;
        options.forEach((opt, idx) => {
            const price = parseCost(opt.price);
            if (price > 0 && price < bestPrice) {
                bestPrice = price;
                bestIdx = idx;
            }
        });
        return bestIdx;
    };

    // Find the index of the best-rated hotel (or cheapest if no ratings)
    const findBestHotelIndex = (hotels: typeof itinerary.accommodation): number => {
        if (!hotels || hotels.length === 0) return 0;
        let bestIdx = 0;
        let bestRating = 0;
        hotels.forEach((hotel, idx) => {
            // Parse rating like "4.5" or "4.5/5"
            const ratingMatch = hotel.rating?.match(/[\d.]+/);
            const rating = ratingMatch ? parseFloat(ratingMatch[0]) : 0;
            if (rating > bestRating) {
                bestRating = rating;
                bestIdx = idx;
            }
        });
        return bestIdx;
    };

    // Auto-select best options when itinerary changes (and selections are null)
    useEffect(() => {
        if (itinerary && selectedTravelIndex === null && itinerary.travelOptions?.length > 0) {
            const bestTravel = findBestTravelIndex(itinerary.travelOptions);
            setSelectedTravelIndex(bestTravel);
            console.log('🎯 [AutoSelect] Best travel option:', bestTravel);
        }
        if (itinerary && selectedHotelIndex === null && itinerary.accommodation?.length > 0) {
            const bestHotel = findBestHotelIndex(itinerary.accommodation);
            setSelectedHotelIndex(bestHotel);
            console.log('🏨 [AutoSelect] Best hotel option:', bestHotel);
        }
    }, [itinerary, selectedTravelIndex, selectedHotelIndex]);

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

        if (user) {
            // Fetch confirmed trips for date exclusion
            const fetchConfirmed = async () => {
                const trips = await dbService.getTrips(user.id);
                const confirmed = trips.filter(t => t.status === 'confirmed');
                setConfirmedTrips(confirmed);
            };
            fetchConfirmed();
        }

        return () => {
            window.removeEventListener('resize', checkMobile);
            window.removeEventListener('scroll', handleScroll);
        };
    }, [user, initialTrip]);

    // Add Horizontal Scroll on Wheel for Day Tabs
    useEffect(() => {
        const el = dayScrollRef.current;
        if (el) {
            const onWheel = (e: WheelEvent) => {
                if (e.deltaY === 0) return;
                e.preventDefault();
                el.scrollLeft += e.deltaY;
            };
            el.addEventListener('wheel', onWheel);
            return () => el.removeEventListener('wheel', onWheel);
        }
    }, [activeTab, itinerary]); // Re-bind when tab/itinerary changes ensures ref is mounted

    // Handle initialTrip when navigation from Dashboard
    useEffect(() => {
        if (initialTrip) {
            console.log("🔍 [TripPlanner] initialTrip prop change:", initialTrip);
            handleLoadTrip(initialTrip);
        }

        // NO CLEANUP HERE. 
        // Clearing selectedTrip on unmount causes issues with React StrictMode (double mount/unmount).
        // Instead, we explicitly clear it when starting a NEW trip from Dashboard.
    }, [initialTrip]);

    // NEW: Hide Navigation when Modal is Open
    useEffect(() => {
        if (showConfirmModal) {
            setNavVisible(false);
        } else {
            setNavVisible(true);
        }
        return () => setNavVisible(true);
    }, [showConfirmModal, setNavVisible]);


    // NEW: Restore prompt from localStorage if returning from Pricing
    useEffect(() => {
        const savedPrompt = localStorage.getItem('voyageur_saved_prompt');
        if (savedPrompt) {
            console.log("📝 [TripPlanner] Restoring saved prompt:", savedPrompt);
            setPrompt(savedPrompt);
            localStorage.removeItem('voyageur_saved_prompt');
        }
    }, []);

    const handleLoadTrip = (trip: any) => {
        console.log("🔍 [TripPlanner] handleLoadTrip START", trip);

        if (!trip || !trip.data) {
            console.error("❌ [TripPlanner] Invalid trip data:", trip);
            return;
        }

        let itineraryData = trip.data;
        // Defensive: Parse if it's a string (shouldn't be, but just in case)
        if (typeof itineraryData === 'string') {
            try {
                itineraryData = JSON.parse(itineraryData);
            } catch (e) {
                console.error("❌ [TripPlanner] Failed to parse trip.data string", e);
            }
        }

        // Inject status from the StoredTrip wrapper if present
        if (trip.status) {
            itineraryData = { ...itineraryData, status: trip.status };
        }

        console.log("✅ [TripPlanner] Setting itinerary state:", itineraryData);
        console.log("🔍 [TripPlanner] Original Prompt Field:", itineraryData.originalPrompt);
        console.log("🔍 [TripPlanner] Destination Field:", trip.destination);

        setItinerary(itineraryData);
        setCurrentTripId(trip.id);
        // Use originalPrompt if available (new trips), otherwise fallback to destination (old trips)
        const promptToSet = itineraryData.originalPrompt || trip.destination || "";
        console.log("🎯 [TripPlanner] Setting Prompt to:", promptToSet);
        setPrompt(promptToSet);
        setWizardState('RESULTS');
        setActiveTab('ITINERARY');
        setIsEditing(false);

        setBgImage(null); // Reset or try to fetch again
        generateImage(`Cinematic wide angle travel shot of ${trip.destination}, black and white high contrast photography, 8k`)
            .then(setBgImage)
            .catch(console.error);

    };

    const handleSaveChanges = async () => {
        if (!user || !itinerary) return;
        setLoading(true);
        try {
            if (currentTripId) {
                await dbService.updateTrip(user.id, currentTripId, itinerary);
            } else {
                // Manual save = Draft (unless we want to add a 'save as confirmed' option? Assume draft for now)
                const newId = await dbService.saveTrip(user.id, itinerary, 'draft');
                setCurrentTripId(newId);
            }
            setIsEditing(false);
        } catch (error) {
            console.error("Failed to save:", error);
        } finally {
            setLoading(false);
        }
    };

    // Helper to deep update activity
    const updateActivity = (dayIndex: number, activityIndex: number, field: string, value: string) => {
        if (!itinerary) return;
        const newDays = [...itinerary.days];
        const newActivities = [...newDays[dayIndex].activities];
        newActivities[activityIndex] = { ...newActivities[activityIndex], [field]: value };
        newDays[dayIndex].activities = newActivities;
        setItinerary({ ...itinerary, days: newDays });
    };

    const handlePlanTrip = async () => {
        if (!prompt.trim()) return;

        if (!isLoggedIn) {
            setView(AppView.AUTH);
            return;
        }

        if (!user) return;

        // --- CREDIT CHECK ---
        if ((user.credits || 0) < 1) {
            setShowCreditAlert(true); // Use Custom Modal
            return;
        }

        setLoading(true);

        try {
            // STEP 1: ANALYZE PROMPT
            const analysisResult = await analyzeTripRequest(prompt);
            
            if (analysisResult.isComplete) {
                // Prompt is good, proceed to generation directly
                await executeGeneration(prompt);
            } else {
                // Missing info, go to clarification step
                setAnalysis(analysisResult);
                setWizardState('CLARIFYING');
                setLoading(false);
            }

        } catch (e) {
            console.error("Analysis Failed", e);
            // Fallback: Try generating anyway
            await executeGeneration(prompt);
        }
    };

    const handleNextQuestion = (answer: string) => {
        if (!analysis) return;
        
        const fieldName = analysis.missingFields[currentQuestionIndex];
        // Capitalize first letter for display key (e.g. 'duration' -> 'Duration')
        const displayKey = fieldName.charAt(0).toUpperCase() + fieldName.slice(1);
        
        const updatedSelections = { ...selections, [displayKey]: answer };
        setSelections(updatedSelections);
        setCustomAnswer('');

        if (currentQuestionIndex < analysis.missingFields.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
        } else {
            // Finished
            handleClarificationSubmit(updatedSelections);
        }
    };

    const handleClarificationSubmit = async (finalSelections: Record<string, string>) => {
        setWizardState('GENERATING');
        setLoading(true);

        // Construct enriched prompt
        let enrichedPrompt = prompt;
        Object.entries(finalSelections).forEach(([key, value]) => {
            enrichedPrompt += `, ${key}: ${value}`;
        });

        await executeGeneration(enrichedPrompt);
    };

    const executeGeneration = async (finalPrompt: string) => {
        // 1. Extract destination hint from prompt (for toast display)
        const destMatch = finalPrompt.match(/to\s+([A-Za-z\s,]+?)(?:\s+for|\s+in|\s*$)/i);
        const destHint = destMatch ? destMatch[1].trim() : finalPrompt.slice(0, 30);

        // 2. Save prompt immediately with 'generating' status
        if (user) {
            const promptId = dbService.savePromptWithStatus({
                user_id: user.id,
                prompt: finalPrompt,
                destination: destHint,
                status: 'generating'
            });

            // 3. Trigger toast notification
            localStorage.setItem('voyageur_pending_toast', JSON.stringify({
                type: 'generating',
                destination: destHint,
                timestamp: Date.now()
            }));
            if (typeof window !== 'undefined') window.dispatchEvent(new Event('voyageur:toast'));

            // 4. Redirect to Dashboard
            setView(AppView.DASHBOARD);

            // 5. Background Generation
            (async () => {
                let startingCity: string | undefined;
                try {
                    const { getCurrentLocation } = await import('../services/geolocationService');
                    const location = await getCurrentLocation();
                    if (location?.city) {
                        startingCity = location.formatted || location.city;
                    }
                } catch (locErr) {
                    console.warn('Could not get location:', locErr);
                }

                try {
                    let preferences: { dietary?: string; luxury?: number } | undefined;
                    try {
                        const savedSettings = localStorage.getItem('voyageur_settings_v1');
                        if (savedSettings) {
                            const parsed = JSON.parse(savedSettings);
                            preferences = {
                                dietary: parsed.dietary || 'None',
                                luxury: parsed.luxury || 3
                            };
                        }
                    } catch (e) {
                        console.warn('Could not load travel preferences:', e);
                    }

                    const result = await generateItinerary(finalPrompt, startingCity, preferences);
                    result.originalPrompt = finalPrompt;

                    // --- COST FIX ---
                    try {
                        const parseCost = (str: string | undefined) => {
                            if (!str) return 0;
                            const match = str.match(/[\d,]+/);
                            return match ? parseFloat(match[0].replace(/,/g, '')) : 0;
                        };
                        const parseNights = (dur: string | undefined): number => {
                            if (!dur) return 1;
                            const match = dur.match(/(\d+)/);
                            return match ? Math.max(1, parseInt(match[1]) - 1) : 1;
                        };
                        let bestTravelIdx = 0;
                        let minPrice = Infinity;
                        result.travelOptions?.forEach((opt, idx) => {
                            const p = parseCost(opt.price);
                            if (p > 0 && p < minPrice) { minPrice = p; bestTravelIdx = idx; }
                        });
                        let bestHotelIdx = 0;
                        let maxRating = -1;
                        result.accommodation?.forEach((h, idx) => {
                            const match = h.rating?.match(/[\d.]+/);
                            const r = match ? parseFloat(match[0]) : 0;
                            if (r > maxRating) { maxRating = r; bestHotelIdx = idx; }
                        });
                        const nights = parseNights(result.duration);
                        const travelCost = parseCost(result.travelOptions?.[bestTravelIdx]?.price);
                        const hotelCost = parseCost(result.accommodation?.[bestHotelIdx]?.pricePerNight) * nights;
                        let activityCost = 0;
                        result.days?.forEach(d => d.activities?.forEach(a => activityCost += parseCost(a.estimatedCost)));
                        const total = travelCost + hotelCost + activityCost;
                        if (total > 0) {
                            result.totalEstimatedCost = `₹${total.toLocaleString('en-IN')}`;
                        }
                    } catch (calcErr) {
                        console.warn('[Cost Fix] Failed to recalculate cost', calcErr);
                    }

                    dbService.updatePrompt(promptId, {
                        status: 'ready',
                        result: result
                    });

                    await dbService.deductCreditsRPC(user.id, 1);
                    if (typeof window !== 'undefined') window.dispatchEvent(new Event('voyageur:user-update'));

                    localStorage.setItem('voyageur_pending_toast', JSON.stringify({
                        type: 'success',
                        destination: result.destination,
                        promptId: promptId,
                        timestamp: Date.now()
                    }));
                    if (typeof window !== 'undefined') window.dispatchEvent(new Event('voyageur:toast'));

                } catch (err: any) {
                    console.error('❌ Background generation failed:', err);
                    let userFriendlyError = 'Generation failed. Please try again.';
                    if (err?.message?.includes('429')) userFriendlyError = 'API limit reached. Please wait a moment.';
                    
                    dbService.updatePrompt(promptId, {
                        status: 'failed',
                        error: userFriendlyError
                    });

                    localStorage.setItem('voyageur_pending_toast', JSON.stringify({
                        type: 'error',
                        destination: destHint,
                        message: userFriendlyError,
                        timestamp: Date.now()
                    }));
                    if (typeof window !== 'undefined') window.dispatchEvent(new Event('voyageur:toast'));
                }
            })();
        }
    };

    const handleNewTrip = () => {
        if (clearSelectedTrip) clearSelectedTrip();
        setItinerary(null);
        setPrompt("");
        setWizardState('INPUT');
        setCurrentTripId(null);
        setIsEditing(false);
        setBgImage(null);
        setSelections({});
        setAnalysis(null);
        window.scrollTo(0, 0);
    };

    // Regenerate itinerary based on current travel/hotel selections
    const handleRegenerateItinerary = async () => {
        if (!itinerary || isRegenerating) return;

        setIsRegenerating(true);
        try {
            // Get selected travel option details
            const selectedTravel = selectedTravelIndex !== null && itinerary.travelOptions?.[selectedTravelIndex]
                ? {
                    arrivalTime: itinerary.travelOptions[selectedTravelIndex].arrivalTime,
                    arrivalLocation: itinerary.travelOptions[selectedTravelIndex].arrivalLocation,
                    type: itinerary.travelOptions[selectedTravelIndex].type
                }
                : null;

            // Get selected hotel details
            const selectedHotel = selectedHotelIndex !== null && itinerary.accommodation?.[selectedHotelIndex]
                ? {
                    name: itinerary.accommodation[selectedHotelIndex].name,
                    location: itinerary.accommodation[selectedHotelIndex].location
                }
                : null;

            console.log('🔄 Regenerating itinerary with:', { selectedTravel, selectedHotel });

            const updatedItinerary = await regenerateItineraryDays(itinerary, selectedTravel, selectedHotel);
            setItinerary(updatedItinerary);
            setActiveTab('ITINERARY');
            setActiveDay(0);

            // Save updated itinerary to DB
            if (user && currentTripId) {
                await dbService.updateTrip(user.id, currentTripId, updatedItinerary);
                console.log('✅ Updated itinerary saved');
            }
        } catch (error) {
            console.error('Failed to regenerate itinerary:', error);
            alert('Failed to regenerate itinerary. Please try again.');
        } finally {
            setIsRegenerating(false);
        }
    };


    const handleInputFocus = () => {
        setTimeout(() => {
            textareaRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 300);
    };

    const handleDateChange = (date: Date | null) => {
        setStartDate(date);
        setDateConflictWarning(null);

        if (!date || !itinerary?.duration) return;

        // Extract duration (e.g. "4 days" -> 4)
        const durationMatch = itinerary.duration.match(/(\d+)/);
        const durationDays = durationMatch ? parseInt(durationMatch[0]) : 1;

        // Calculate proposed end date
        const proposedStart = date.getTime();
        const proposedEnd = proposedStart + (durationDays * 24 * 60 * 60 * 1000);

        // Check for intersection with ANY excluded interval
        const hasConflict = excludedIntervals.some(interval => {
            const blockedStart = interval.start.getTime();
            const blockedEnd = interval.end.getTime();

            // Intersection Formula: (StartA <= EndB) and (EndA >= StartB)
            // We use simple overlap: Start < End && End > Start
            return (proposedStart < blockedEnd) && (proposedEnd > blockedStart);
        });

        if (hasConflict) {
            setDateConflictWarning(`Trip duration (${durationDays} days) overlaps with an existing trip.`);
        }
    };

    // Compute excluded date intervals for react-datepicker
    const excludedIntervals = useMemo(() => {
        const intervals: { start: Date; end: Date }[] = [];
        for (const trip of confirmedTrips) {
            if (trip.id === currentTripId) continue; // Skip self when editing

            const tripStartStr = trip.startDate || trip.data?.startDate;
            if (!tripStartStr) continue;

            const tripDurationMatch = trip.duration?.match(/(\d+)/);
            const tripDuration = tripDurationMatch ? parseInt(tripDurationMatch[0]) : 1;

            const startParts = tripStartStr.split('-');
            const startDate = new Date(parseInt(startParts[0]), parseInt(startParts[1]) - 1, parseInt(startParts[2]));
            // Subtract 1 day because if I book 4 days starting 1st, I end on 4th (1,2,3,4).
            // So Start + (4-1) days.
            const endDate = new Date(startDate.getTime() + (tripDuration - 1) * 86400000);

            intervals.push({ start: startDate, end: endDate });
        }
        return intervals;
    }, [confirmedTrips, currentTripId]);

    // NEW: Calculate the currently selected trip's full date range for styling
    const tripDates = useMemo(() => {
        if (!startDate || !itinerary?.duration) return new Set<string>();

        const durationMatch = itinerary.duration.match(/(\d+)/);
        const days = durationMatch ? parseInt(durationMatch[0]) : 1;

        const set = new Set<string>();
        const current = new Date(startDate);
        for (let i = 0; i < days; i++) {
            // "YYYY-MM-DD" format for easy comparison
            set.add(current.toDateString());
            current.setDate(current.getDate() + 1);
        }
        return set;
    }, [startDate, itinerary]);

    // NEW PREVIEW: Calculate hover range to show "ghost" selection
    const previewDates = useMemo(() => {
        if (!hoverDate || !itinerary?.duration) return new Map<string, 'valid' | 'invalid'>();

        const durationMatch = itinerary.duration.match(/(\d+)/);
        const days = durationMatch ? parseInt(durationMatch[0]) : 1;

        const map = new Map<string, 'valid' | 'invalid'>();
        const current = new Date(hoverDate);

        // Calculate proposed end for overlap check
        const proposedStart = hoverDate.getTime();
        const proposedEnd = proposedStart + (days * 24 * 60 * 60 * 1000);

        // Check global conflict for this hover position
        const hasConflict = excludedIntervals.some(interval => {
            const blockedStart = interval.start.getTime();
            const blockedEnd = interval.end.getTime();
            return (proposedStart < blockedEnd) && (proposedEnd > blockedStart);
        });

        const status = hasConflict ? 'invalid' : 'valid';

        for (let i = 0; i < days; i++) {
            map.set(current.toDateString(), status);
            current.setDate(current.getDate() + 1);
        }
        return map;
    }, [hoverDate, itinerary, excludedIntervals]);

    const handleBookItinerary = async () => {
        // This is now the FINAL action called by the modal
        setShowConfirmModal(false);
        setBookingStatus('processing');

        try {
            // Format Date to YYYY-MM-DD string using LOCAL date (not UTC to avoid timezone shift)
            const formattedDate = startDate
                ? `${startDate.getFullYear()}-${String(startDate.getMonth() + 1).padStart(2, '0')}-${String(startDate.getDate()).padStart(2, '0')}`
                : undefined;

            if (user && itinerary && currentTripId && initialTrip?.status !== 'completed') {
                // EXISTING DRAFT: Update it

                const updatedItinerary = {
                    ...itinerary,
                    startDate: formattedDate,
                    status: 'confirmed' as const,
                    totalEstimatedCost: formattedCost,
                };

                await dbService.updateTrip(user.id, currentTripId, updatedItinerary);
                await dbService.updateTripStatus(user.id, currentTripId, 'confirmed');

            } else if (user && itinerary) {
                // NEW TRIP or RE-BOOKING (Completed -> New Active)
                // If it was completed, we create a FRESH copy so history is preserved.

                const updatedItinerary = {
                    ...itinerary,
                    startDate: formattedDate,
                    totalEstimatedCost: formattedCost
                };

                // Always create NEW ID for re-books or new trips
                const newId = await dbService.saveTrip(user.id, updatedItinerary, 'confirmed');
                setCurrentTripId(newId);
            }

            // NOTE: Google Calendar sync is now MANUAL only (via Dashboard button)
        } catch (error) {
            console.error("Failed to confirm trip:", error);
        }

        setTimeout(() => {
            setBookingStatus('confirmed');
            setTimeout(() => {
                setBookingStatus('idle');
                // Redirect to Dashboard (not Wallet) per instructions
                setView(AppView.DASHBOARD);
            }, 2000);
        }, 2000);
    };

    const handleManualSync = async () => {
        if (!itinerary || isSyncing) return;

        setIsSyncing(true);
        try {
            const eventDetails = { ...itinerary };
            // Ensure we have a start date (prefer state, fallback to itinerary prop)
            if (startDate) {
                eventDetails.startDate = `${startDate.getFullYear()}-${String(startDate.getMonth() + 1).padStart(2, '0')}-${String(startDate.getDate()).padStart(2, '0')}`;
            }

            const result = await googleCalendarService.createEvent(eventDetails);

            if (result.success) {
                alert("Trip added to Google Calendar!");
            } else {
                alert("Failed to add trip: " + (result.error || "Unknown error"));
            }
        } catch (e) {
            console.error(e);
            alert("Sync failed. Check console.");
        } finally {
            setIsSyncing(false);
        }
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
        return 'opacity-60 scale-100 blur-0 transition-all duration-500';
    };

    const activeActivity = expandedNode !== null && itinerary?.days?.[activeDay]?.activities?.[expandedNode]
        ? itinerary.days[activeDay].activities[expandedNode]
        : null;

    const pathData = useMemo(() => {
        if (!itinerary?.days?.[activeDay]?.activities) return { path: "", height: 0 };

        const items = itinerary.days[activeDay].activities;
        let currentY = 40;
        const yPositions: number[] = [];

        items.forEach((_, i) => {
            yPositions.push(currentY);
            const extra = (!isMobile && expandedNode === i) ? EXPANDED_EXTRA_HEIGHT : 0;
            currentY += BASE_STEP_Y + extra;
        });

        // Add some padding at the bottom
        const totalHeight = currentY + 100;

        let path = "";
        items.forEach((_, i) => {
            const y = yPositions[i];
            const xPercent = isMobile ? 50 : (i % 2 === 0 ? 20 : 80);

            if (i === 0) {
                path = `M ${xPercent} ${y} `;
            } else {
                const prevY = yPositions[i - 1];
                const prevXPercent = isMobile ? 50 : ((i - 1) % 2 === 0 ? 20 : 80);

                const dist = y - prevY;
                const cp1y = prevY + (dist / 2);
                const cp2y = y - (dist / 2);

                path += `C ${prevXPercent} ${cp1y}, ${xPercent} ${cp2y}, ${xPercent} ${y} `;
            }
        });
        return { path, height: totalHeight };
    }, [itinerary, activeDay, expandedNode, isMobile, BASE_STEP_Y, EXPANDED_EXTRA_HEIGHT]);

    return (
        <div className="min-h-screen bg-black relative selection:bg-cyan-500/30">
            <TacticalBackground />

            {loading && <LoadingScreen />}

            {/* WIZARD STATE: INPUT */}
            {wizardState === 'INPUT' && !itinerary && (
                <div className="min-h-screen pt-32 pb-20 px-6 max-w-7xl mx-auto flex flex-col items-center justify-center relative z-10">
                    
                    <div className="max-w-4xl w-full animate-fade-in-up">
                        {/* Energized Header */}
                        <div className="text-center mb-16 relative">
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-1 bg-cyan-500/20 blur-xl" />
                            <span className="relative inline-block py-1 mb-6 text-xs font-bold tracking-[0.4em] text-cyan-400 uppercase bg-black border border-cyan-500/50 px-6 font-mono shadow-[0_0_15px_rgba(34,211,238,0.4)]">
                                Command Center
                            </span>
                            <h1 className="mb-4 font-sans text-5xl md:text-7xl font-bold tracking-tighter text-white uppercase drop-shadow-[0_0_30px_rgba(255,255,255,0.1)]">
                                Initialize <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-white to-cyan-400 animate-shimmer bg-[length:200%_100%]">Mission</span>
                            </h1>
                            <p className="max-w-xl mx-auto font-mono text-xs text-zinc-500 tracking-wider uppercase">
                                Neural Logistics Engine :: Standby
                            </p>
                        </div>

                        {/* TACTICAL INPUT HUD */}
                        <div className="relative group max-w-3xl mx-auto">
                            {/* HUD Glow */}
                            <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500/50 to-emerald-500/50 opacity-20 blur-lg group-hover:opacity-40 transition duration-500" />
                            
                            <div className="relative bg-black/80 backdrop-blur-xl border border-white/10 p-1">
                                {/* Corner Decorations */}
                                <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-cyan-500" />
                                <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-cyan-500" />
                                <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-cyan-500" />
                                <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-cyan-500" />

                                {/* Header Bar */}
                                <div className="h-10 bg-white/5 flex items-center justify-between px-4 border-b border-white/5">
                                    <div className="flex items-center gap-3">
                                        <div className="flex gap-1">
                                            <div className="w-1.5 h-1.5 bg-cyan-500 animate-pulse" />
                                            <div className="w-1.5 h-1.5 bg-cyan-500/30" />
                                            <div className="w-1.5 h-1.5 bg-cyan-500/30" />
                                        </div>
                                        <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest">Input_Stream.sh</span>
                                    </div>
                                    <div className="text-[10px] font-mono text-zinc-600">V.2.5.0</div>
                                </div>

                                {/* Text Area */}
                                <div className="relative">
                                    <textarea
                                        ref={textareaRef}
                                        value={prompt}
                                        onChange={(e) => setPrompt(e.target.value)}
                                        onFocus={handleInputFocus}
                                        placeholder="ENTER MISSION PARAMETERS..."
                                        className="w-full h-48 bg-transparent text-white text-xl md:text-2xl p-8 focus:outline-none resize-none placeholder-zinc-800 font-mono border-none uppercase leading-relaxed relative z-10"
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && !e.shiftKey) {
                                                e.preventDefault();
                                                handlePlanTrip();
                                            }
                                        }}
                                    />
                                    {/* Scanline Effect overlay */}
                                    <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_50%,rgba(0,0,0,0.3)_50%)] bg-[length:100%_4px] pointer-events-none opacity-20" />
                                </div>

                                {/* Footer Bar */}
                                <div className="flex justify-between items-center px-6 py-4 bg-white/5 border-t border-white/5">
                                    <div className="hidden md:flex flex-col">
                                        <span className="text-[9px] text-zinc-500 font-mono uppercase tracking-widest">System Status</span>
                                        <span className="text-[10px] text-emerald-400 font-mono font-bold uppercase tracking-widest">Optimal</span>
                                    </div>
                                    
                                    <button
                                        onClick={handlePlanTrip}
                                        disabled={loading || !prompt.trim()}
                                        className="relative group/btn overflow-hidden px-10 py-3 bg-cyan-500 text-black font-bold uppercase tracking-widest text-sm transition-all hover:bg-white hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed clip-path-slant"
                                    >
                                        <span className="relative z-10 flex items-center gap-2">
                                            Initiate <Zap className="w-4 h-4 fill-black" />
                                        </span>
                                        {/* Button Scan Effect */}
                                        <div className="absolute top-0 -left-[100%] w-full h-full bg-gradient-to-r from-transparent via-white/50 to-transparent group-hover/btn:animate-[shimmer_1s_infinite]" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* WIZARD STATE: CLARIFYING (Sequential) */}
            {wizardState === 'CLARIFYING' && analysis && analysis.missingFields.length > 0 && (
                <div className="min-h-screen pt-32 pb-20 px-6 max-w-7xl mx-auto flex flex-col items-center justify-center relative z-10">
                    
                    <div className="max-w-3xl w-full relative z-10 animate-fade-in-up">
                        {(() => {
                            const field = analysis.missingFields[currentQuestionIndex];
                            const labelMap: Record<string, string> = {
                                duration: "MISSION TIMEFRAME",
                                budget: "RESOURCE ALLOCATION",
                                travelers: "SQUAD CONFIGURATION",
                                interests: "OPERATIONAL PARAMETERS"
                            };
                            const questionLabel = labelMap[field] || `${field.toUpperCase()} REQUIRED`;
                            const options = (analysis.suggestions as any)[field] || [];

                            return (
                                <div className="relative">
                                    {/* Background Glow */}
                                    <div className="absolute -inset-1 bg-cyan-500/20 blur-xl opacity-50" />

                                    <div className="relative bg-black/90 border border-cyan-500/30 p-8 md:p-12 shadow-2xl overflow-hidden backdrop-blur-xl">
                                        {/* Tactical Corners */}
                                        <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-cyan-500" />
                                        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-cyan-500" />

                                        {/* Progress Bar */}
                                        <div className="absolute top-0 left-0 w-full h-1 bg-zinc-900/50">
                                            <div 
                                                className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 transition-all duration-500 ease-out shadow-[0_0_10px_rgba(34,211,238,0.8)]"
                                                style={{ width: `${((currentQuestionIndex + 1) / analysis.missingFields.length) * 100}%` }}
                                            />
                                        </div>

                                        {/* Header */}
                                        <div className="text-center mb-10">
                                            <div className="flex justify-center mb-4">
                                                <div className="px-3 py-1 bg-cyan-950/50 border border-cyan-500/30 text-[10px] font-mono text-cyan-400 uppercase tracking-[0.2em] animate-pulse">
                                                    Input_Required
                                                </div>
                                            </div>
                                            <h2 className="text-3xl md:text-5xl font-bold text-white uppercase tracking-tighter drop-shadow-lg">
                                                {questionLabel}
                                            </h2>
                                        </div>

                                        {/* Quick Options Grid */}
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                                            {options.map((opt: string) => (
                                                <button
                                                    key={opt}
                                                    onClick={() => handleNextQuestion(opt)}
                                                    className="relative py-6 bg-zinc-900/50 border border-white/10 hover:border-cyan-400 text-zinc-400 hover:text-white font-mono font-bold uppercase tracking-wider transition-all duration-200 group overflow-hidden hover:-translate-y-1 hover:shadow-[0_0_20px_rgba(34,211,238,0.15)]"
                                                >
                                                    <span className="relative z-10">{opt}</span>
                                                    {/* Scanning Line on Hover */}
                                                    <div className="absolute top-0 -left-[100%] w-full h-full bg-gradient-to-r from-transparent via-cyan-400/10 to-transparent group-hover:animate-[shimmer_0.5s_infinite]" />
                                                </button>
                                            ))}
                                        </div>

                                        {/* Manual Override Input */}
                                        <div className="relative group">
                                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-cyan-500 font-mono text-xs tracking-widest">
                                                &gt;_
                                            </div>
                                            <input
                                                type="text"
                                                value={customAnswer}
                                                onChange={(e) => setCustomAnswer(e.target.value)}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter' && customAnswer.trim()) {
                                                        handleNextQuestion(customAnswer);
                                                    }
                                                }}
                                                placeholder="MANUAL OVERRIDE..."
                                                className="w-full bg-black/50 border border-white/20 py-4 pl-12 pr-16 text-white font-mono text-sm focus:border-cyan-400 focus:bg-black focus:outline-none transition-all uppercase placeholder-zinc-700"
                                            />
                                            <button
                                                onClick={() => {
                                                    if (customAnswer.trim()) handleNextQuestion(customAnswer);
                                                }}
                                                disabled={!customAnswer.trim()}
                                                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-zinc-500 hover:text-cyan-400 transition-colors disabled:opacity-30"
                                            >
                                                <CornerDownRight className="w-4 h-4" />
                                            </button>
                                        </div>

                                        {/* Step Counter */}
                                        <div className="mt-8 flex justify-between items-end border-t border-white/5 pt-4">
                                            <div className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest">
                                                Sequence {currentQuestionIndex + 1} / {analysis.missingFields.length}
                                            </div>
                                            <div className="flex gap-1">
                                                {analysis.missingFields.map((_, i) => (
                                                    <div key={i} className={`w-1 h-1 rounded-full ${i <= currentQuestionIndex ? 'bg-cyan-400' : 'bg-zinc-800'}`} />
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })()}
                    </div>
                </div>
            )}

            {/* WIZARD STATE: RESULTS (Existing UI) */}
            {(wizardState === 'RESULTS' || wizardState === 'GENERATING') && itinerary && (
                // --- RESULTS STATE (Existing UI mostly, but wrapped) ---
                <div
                    className={`relative w-full pb-32 min-h-screen transition-all duration-700 ease-out will-change-[padding] pt-48`}
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
                        {/* HEADER */}
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12 items-end">
                            <div className="lg:col-span-8">
                                <span className="text-xs font-mono text-cyan-400 bg-cyan-400/10 px-2 py-0.5 border border-cyan-400/20 uppercase tracking-widest inline-block mb-3">
                                    Mission Generated
                                </span>
                                <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 tracking-tight leading-tight break-words uppercase font-sans drop-shadow-[0_0_20px_rgba(255,255,255,0.2)]">
                                    {itinerary.destination}
                                </h1>
                                <div className="flex flex-wrap items-center gap-6 text-sm text-zinc-400 border-t border-white/10 pt-4 w-fit font-mono">
                                    <span className="flex items-center gap-2"><Calendar className="w-4 h-4 text-orange-400" /> {itinerary.duration}</span>
                                    <span className="flex items-center gap-2"><span className="text-emerald-400 font-sans font-bold text-base">₹</span> {formattedCost.replace(/[₹$]/g, '')} Est.</span>
                                    <span className="flex items-center gap-2"><Users className="w-4 h-4 text-cyan-400" /> 2 Travelers</span>
                                </div>
                            </div>

                            <div className="lg:col-span-4 flex flex-col gap-4 items-start lg:items-end">
                                {/* ACTIONS BUTTONS */}
                                <div className="flex gap-4">
                                    <button
                                        onClick={() => {
                                            setItinerary(null);
                                            setWizardState('INPUT'); // Reset to input
                                        }}
                                        className="flex items-center gap-2 px-3 py-1 text-xs font-bold uppercase tracking-wider border border-white/20 text-zinc-400 hover:text-white hover:border-white transition-all"
                                    >
                                        <ChevronLeft className="w-3 h-3" /> Edit Prompt
                                    </button>

                                    {onBackToLogs && (
                                        <button
                                            onClick={onBackToLogs}
                                            className="flex items-center gap-2 px-3 py-1 text-xs font-bold uppercase tracking-wider border border-white/20 text-zinc-400 hover:text-white hover:border-white transition-all"
                                        >
                                            <Terminal className="w-3 h-3" /> Logs
                                        </button>
                                    )}

                                    <button
                                        onClick={handleNewTrip}
                                        className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-cyan-900/40 to-cyan-500/10 hover:from-cyan-400 hover:to-cyan-300 text-cyan-400 hover:text-black border border-cyan-500/30 hover:border-cyan-400 transition-all shadow-[0_0_15px_rgba(34,211,238,0.1)] hover:shadow-[0_0_25px_rgba(34,211,238,0.4)] uppercase font-bold text-xs tracking-widest group"
                                    >
                                        <Sparkles className="w-4 h-4 group-hover:animate-pulse" /> New Trip
                                    </button>
                                </div>

                                <div className="flex bg-black p-1 border border-white/10 w-full lg:w-auto overflow-x-auto hide-scrollbar">
                                    {[
                                        { id: 'TRAVEL', icon: Plane, label: 'Travel', color: 'text-cyan-400' },
                                        { id: 'STAY', icon: Hotel, label: 'Stay', color: 'text-orange-400' },
                                        { id: 'ITINERARY', icon: MapIcon, label: 'Itinerary', color: 'text-emerald-400' }
                                    ].map((tab) => (
                                        <button
                                            key={tab.id}
                                            onClick={() => setActiveTab(tab.id as Tab)}
                                            className={`flex-1 lg:flex-none flex items-center justify-center gap-2 px-6 md:px-6 py-2 text-sm font-bold uppercase transition-all whitespace-nowrap tracking-wider ${activeTab === tab.id
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
                        </div>

                        {/* CONTENT AREA */}
                        <div>

                            {/* --- TAB 1: INBOUND TRAVEL --- */}
                            {activeTab === 'TRAVEL' && (
                                <div className="space-y-6">
                                    {/* Lock indicator for confirmed trips */}
                                    {itinerary.status === 'confirmed' && (
                                        <div className="flex items-center gap-2 text-xs text-zinc-500 bg-zinc-900/50 p-3 border border-white/5">
                                            <CheckCircle className="w-4 h-4 text-emerald-400" />
                                            <span>Trip confirmed — travel option locked</span>
                                        </div>
                                    )}
                                    <div className="grid grid-cols-1 gap-6">
                                        {itinerary.travelOptions?.map((option, idx) => (
                                            <div
                                                key={idx}
                                                onClick={() => {
                                                    if (itinerary.status !== 'confirmed') {
                                                        setSelectedTravelIndex(idx);
                                                    }
                                                }}
                                                className={`border p-6 transition-all group relative overflow-hidden flex flex-col gap-6 ${itinerary.status === 'confirmed'
                                                    ? 'cursor-not-allowed opacity-60'
                                                    : 'cursor-pointer'
                                                    } ${selectedTravelIndex === idx
                                                        ? 'bg-cyan-900/10 border-cyan-400 shadow-[0_0_30px_rgba(34,211,238,0.2)]'
                                                        : 'bg-black/80 backdrop-blur-sm border-white/10 hover:border-cyan-400/50'
                                                    }`}
                                            >
                                                {/* Header Row: Icon + Type + Cost */}
                                                <div className="flex justify-between items-start">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`p-3 bg-white/5 border border-white/10 text-cyan-400 group-hover:bg-cyan-400 group-hover:text-black transition-colors ${selectedTravelIndex === idx ? 'bg-cyan-400 text-black' : ''}`}>
                                                            {option.type === 'FLIGHT' ? <Plane className="w-5 h-5" /> :
                                                                option.type === 'TRAIN' ? <Train className="w-5 h-5" /> :
                                                                    option.type === 'BUS' ? <Bus className="w-5 h-5" /> : <Car className="w-5 h-5" />}
                                                        </div>
                                                        <div>
                                                            <div className="text-[10px] font-bold uppercase text-zinc-500 tracking-wider mb-0.5">{option.type}</div>
                                                            <div className="font-bold text-white uppercase">{option.provider}</div>
                                                        </div>
                                                    </div>
                                                    <span className="text-sm font-bold text-emerald-400 border border-emerald-400/20 px-2 py-1 bg-emerald-400/10">{option.price}</span>
                                                </div>

                                                {/* Timeline Row */}
                                                <div className="flex items-center justify-between gap-4 font-mono text-sm">
                                                    <div>
                                                        <div className="text-white text-lg">{option.departureTime}</div>
                                                        <div className="text-[10px] text-zinc-500 uppercase truncate max-w-[120px]" title={option.departureLocation}>{option.departureLocation}</div>
                                                    </div>

                                                    <div className="flex-1 flex flex-col items-center px-2">
                                                        <div className="text-[10px] text-zinc-500 mb-1">{option.duration}</div>
                                                        <div className="w-full h-px bg-zinc-700 relative flex items-center">
                                                            <div className="w-1 h-1 bg-cyan-400 absolute left-0" />
                                                            <ArrowRight className="w-3 h-3 text-cyan-400 absolute right-0 -mr-1" />
                                                        </div>
                                                        <div className="text-[10px] text-cyan-400 mt-1 uppercase">Direct</div>
                                                    </div>

                                                    <div className="text-right">
                                                        <div className="text-white text-lg">{option.arrivalTime}</div>
                                                        <div className="text-[10px] text-zinc-500 uppercase truncate max-w-[120px]" title={option.arrivalLocation}>{option.arrivalLocation}</div>
                                                    </div>
                                                </div>

                                                {/* Selection Indicator */}
                                                <div className={`absolute top-4 right-4 transition-opacity ${selectedTravelIndex === idx ? 'opacity-100' : 'opacity-0'}`}>
                                                    <CheckCircle className="w-4 h-4 text-cyan-400 fill-cyan-400/20" />
                                                </div>

                                                {/* View Route Button - Shows route from current location to departure station */}
                                                <a
                                                    href={`https://www.google.com/maps/dir/?api=1&origin=current+location&destination=${encodeURIComponent(option.departureLocation)}&travelmode=driving`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    onClick={(e) => e.stopPropagation()}
                                                    className="mt-4 flex items-center justify-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wider border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10 hover:border-cyan-400 transition-all"
                                                >
                                                    <Navigation className="w-3 h-3" />
                                                    Get to {option.type === 'FLIGHT' ? 'Airport' : option.type === 'TRAIN' ? 'Station' : 'Pickup'}
                                                    <ExternalLink className="w-3 h-3" />
                                                </a>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* --- TAB 2: ACCOMMODATION --- */}
                            {activeTab === 'STAY' && (
                                <div className="space-y-6">
                                    {/* Lock indicator for confirmed trips */}
                                    {itinerary.status === 'confirmed' && (
                                        <div className="flex items-center gap-2 text-xs text-zinc-500 bg-zinc-900/50 p-3 border border-white/5">
                                            <CheckCircle className="w-4 h-4 text-emerald-400" />
                                            <span>Trip confirmed — accommodation locked</span>
                                        </div>
                                    )}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        {itinerary.accommodation?.map((hotel, idx) => (
                                            <div
                                                key={idx}
                                                onClick={() => {
                                                    if (itinerary.status !== 'confirmed') {
                                                        setSelectedHotelIndex(idx);
                                                    }
                                                }}
                                                className={`group transition-all border relative bg-black/90 backdrop-blur-sm ${itinerary.status === 'confirmed'
                                                    ? 'cursor-not-allowed opacity-60'
                                                    : 'cursor-pointer'
                                                    } ${selectedHotelIndex === idx
                                                        ? 'border-orange-400 ring-1 ring-orange-400 shadow-[0_0_30px_rgba(251,146,60,0.2)]'
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
                                                    <p className="text-zinc-400 text-sm mb-6 leading-relaxed line-clamp-3 font-sans">
                                                        {hotel.description}
                                                    </p>
                                                    <div className="mt-auto pt-4 border-t border-white/5 flex flex-wrap gap-2">
                                                        {hotel.amenities.slice(0, 3).map((amenity, i) => (
                                                            <span key={i} className="text-[10px] bg-white/5 px-2.5 py-1 text-zinc-300 border border-white/10 uppercase tracking-wide font-mono">{amenity}</span>
                                                        ))}
                                                        {hotel.amenities.length > 3 && <span className="text-[10px] bg-white/5 px-2.5 py-1 text-zinc-300 border border-white/10 uppercase tracking-wide font-mono">+{hotel.amenities.length - 3}</span>}
                                                    </div>
                                                    {/* View on Map Button */}
                                                    <a
                                                        href={getPlaceLink(hotel.name, itinerary.destination)}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        onClick={(e) => e.stopPropagation()}
                                                        className="mt-4 flex items-center justify-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wider border border-orange-500/30 text-orange-400 hover:bg-orange-500/10 hover:border-orange-400 transition-all"
                                                    >
                                                        <MapPin className="w-3 h-3" />
                                                        View on Map
                                                        <ExternalLink className="w-3 h-3" />
                                                    </a>
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
                                    <div
                                        className="sticky top-0 bg-black/95 backdrop-blur-xl z-[60] border-b border-white/10 mb-12 -mx-4 md:-mx-8 shadow-2xl transition-all relative group/tabs"
                                    >
                                        <div className="absolute top-0 bottom-0 left-0 w-8 md:w-16 bg-gradient-to-r from-black to-transparent z-10 pointer-events-none" />
                                        <div className="absolute top-0 bottom-0 right-0 w-8 md:w-16 bg-gradient-to-l from-black to-transparent z-10 pointer-events-none" />

                                        {/* SCROLL BUTTON: LEFT */}
                                        <button
                                            onClick={() => dayScrollRef.current?.scrollBy({ left: -200, behavior: 'smooth' })}
                                            className="absolute left-0 top-0 bottom-0 w-12 z-20 flex items-center justify-center bg-black/50 hover:bg-black/80 text-white opacity-0 group-hover/tabs:opacity-100 transition-opacity"
                                        >
                                            <ChevronLeft className="w-6 h-6" />
                                        </button>

                                        {/* SCROLL BUTTON: RIGHT */}
                                        <button
                                            onClick={() => dayScrollRef.current?.scrollBy({ left: 200, behavior: 'smooth' })}
                                            className="absolute right-0 top-0 bottom-0 w-12 z-20 flex items-center justify-center bg-black/50 hover:bg-black/80 text-white opacity-0 group-hover/tabs:opacity-100 transition-opacity"
                                        >
                                            <ChevronRight className="w-6 h-6" />
                                        </button>


                                        <div
                                            ref={dayScrollRef}
                                            className="flex overflow-x-auto hide-scrollbar gap-3 justify-start px-12 md:px-20 py-8 relative z-0 items-center h-[120px] cursor-grab active:cursor-grabbing select-none"
                                            onMouseDown={(e) => {
                                                isDragging.current = true;
                                                startX.current = e.pageX - (dayScrollRef.current?.offsetLeft || 0);
                                                scrollLeft.current = dayScrollRef.current?.scrollLeft || 0;
                                            }}
                                            onMouseLeave={() => { isDragging.current = false; }}
                                            onMouseUp={() => { isDragging.current = false; }}
                                            onMouseMove={(e) => {
                                                if (!isDragging.current) return;
                                                e.preventDefault();
                                                const x = e.pageX - (dayScrollRef.current?.offsetLeft || 0);
                                                const walk = (x - startX.current) * 2; // Scroll-fast
                                                if (dayScrollRef.current) {
                                                    dayScrollRef.current.scrollLeft = scrollLeft.current - walk;
                                                }
                                            }}
                                        >
                                            {itinerary.days?.map((day, idx) => (
                                                <button
                                                    key={idx}
                                                    onClick={() => {
                                                        setActiveDay(idx);
                                                        setExpandedNode(null);
                                                    }}
                                                    className={`group/btn relative flex-shrink-0 w-[100px] h-[70px] flex flex-col items-center justify-center rounded-xl border transition-all duration-300 ease-out ${activeDay === idx
                                                        ? 'border-cyan-400/50 bg-gradient-to-br from-cyan-950/80 to-black text-white shadow-[0_0_30px_-5px_rgba(34,211,238,0.4)] scale-110'
                                                        : 'border-white/5 bg-white/5 text-zinc-400 hover:bg-white/10 hover:border-white/20 hover:text-white hover:-translate-y-1 hover:shadow-lg'
                                                        }`}
                                                >
                                                    {/* GLOW EFFECT ON HOVER */}
                                                    <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-cyan-400/20 to-transparent opacity-0 group-hover/btn:opacity-100 transition-opacity duration-500 pointer-events-none" />

                                                    <span className="text-[10px] font-bold uppercase tracking-widest mb-1 font-mono z-10">Day {idx + 1}</span>
                                                    <span className="font-bold text-lg font-sans z-10">{day.day.split(' ')[0]}</span>
                                                </button>
                                            ))}
                                            <div className="w-8 flex-shrink-0" />
                                        </div>
                                    </div>

                                    {/* Regenerate Button - Only show for draft trips */}
                                    {itinerary.status !== 'confirmed' && (
                                        <div className="mb-6 flex justify-end">
                                            <button
                                                onClick={handleRegenerateItinerary}
                                                disabled={isRegenerating}
                                                className="flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wider border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 hover:border-emerald-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                <RefreshCw className={`w-3 h-3 ${isRegenerating ? 'animate-spin' : ''}`} />
                                                {isRegenerating ? 'Optimizing...' : 'Optimize for Selections'}
                                            </button>
                                        </div>
                                    )}

                                    {/* ITINERARY TIMELINE CONTAINER */}
                                    <div className="relative min-h-[800px] w-full max-w-3xl mx-auto py-12 px-4">

                                        {expandedNode !== null && (
                                            <div
                                                className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[2px] cursor-pointer"
                                                onClick={() => setExpandedNode(null)}
                                            />
                                        )}

                                        <svg
                                            className={`absolute top-0 left-0 w-full h-full pointer-events-none z-0 overflow-visible transition-opacity duration-500 ${expandedNode !== null ? 'opacity-60' : 'opacity-100'}`}
                                            xmlns="http://www.w3.org/2000/svg"
                                            viewBox={`0 0 100 ${pathData.height}`}
                                            preserveAspectRatio="none"
                                        >
                                            <defs>
                                                <linearGradient id="lineGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                                    <stop offset="0%" stopColor="#22d3ee" />
                                                    <stop offset="100%" stopColor="#fb923c" />
                                                </linearGradient>
                                            </defs>
                                            <path
                                                d={pathData.path}
                                                fill="none"
                                                stroke="url(#lineGradient)"
                                                strokeWidth="2"
                                                vectorEffect="non-scaling-stroke"
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
                                                                    <div className="bg-black border border-white/20 p-6 shadow-2xl relative overflow-hidden overflow-y-auto max-h-[420px]">

                                                                        <button
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                setExpandedNode(null);
                                                                            }}
                                                                            className="absolute top-4 right-4 p-2 bg-white/5 hover:bg-white/10 z-50 rounded-full"
                                                                        >
                                                                            <X className="w-4 h-4 text-white" />
                                                                        </button>

                                                                        <div className="flex justify-between items-start mb-2 pr-8 relative z-10">
                                                                            {isEditing ? (
                                                                                <input
                                                                                    value={activity.title}
                                                                                    onChange={(e) => updateActivity(activeDay, idx, 'title', e.target.value)}
                                                                                    className="bg-white/10 border border-white/20 text-white text-xl font-bold uppercase w-full p-2 focus:border-cyan-400 focus:outline-none"
                                                                                />
                                                                            ) : (
                                                                                <h4 className="font-bold text-white text-xl leading-tight uppercase">{activity.title}</h4>
                                                                            )}
                                                                        </div>

                                                                        {isEditing ? (
                                                                            <input
                                                                                value={activity.estimatedCost}
                                                                                onChange={(e) => updateActivity(activeDay, idx, 'estimatedCost', e.target.value)}
                                                                                className="bg-white/10 border border-white/20 text-white text-xs font-bold uppercase w-1/3 p-1 mb-3 focus:border-cyan-400 focus:outline-none"
                                                                            />
                                                                        ) : (
                                                                            <span className="inline-block text-xs bg-white text-black px-2 py-1 mb-3 font-bold border border-white">
                                                                                {activity.estimatedCost}
                                                                            </span>
                                                                        )}

                                                                        {isEditing ? (
                                                                            <textarea
                                                                                value={activity.description}
                                                                                onChange={(e) => updateActivity(activeDay, idx, 'description', e.target.value)}
                                                                                className="w-full h-32 bg-white/5 border border-white/20 text-sm text-zinc-300 p-3 mb-6 focus:border-cyan-400 focus:outline-none resize-none"
                                                                            />
                                                                        ) : (
                                                                            <p className="text-sm text-zinc-300 mb-6 leading-relaxed border-l-2 border-cyan-500/30 pl-3">
                                                                                {activity.description}
                                                                            </p>
                                                                        )}

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

                                                                        {/* View on Map button - Show if location is unique/different from recent activities */}
                                                                        {(() => {
                                                                            if (!activity.location) return null;

                                                                            // Helper to check if two locations are similar
                                                                            const isSimilarLocation = (loc1: string, loc2: string) => {
                                                                                if (!loc1 || !loc2) return false;
                                                                                const words1 = loc1.toLowerCase().split(/[\s,]+/).filter(w => w.length > 2);
                                                                                const words2 = loc2.toLowerCase().split(/[\s,]+/).filter(w => w.length > 2);
                                                                                const commonWords = words1.filter(w => words2.includes(w));
                                                                                return commonWords.length >= 2 || loc1.toLowerCase().includes(loc2.toLowerCase()) || loc2.toLowerCase().includes(loc1.toLowerCase());
                                                                            };

                                                                            // Check if this location was already shown in a recent activity (last 3)
                                                                            const recentActivities = itinerary.days[activeDay].activities.slice(Math.max(0, idx - 3), idx);
                                                                            const isDuplicate = recentActivities.some(prev =>
                                                                                prev.location && isSimilarLocation(activity.location!, prev.location)
                                                                            );

                                                                            if (isDuplicate) return null;

                                                                            return (
                                                                                <div className="mt-auto space-y-2">
                                                                                    <div className="flex gap-3">
                                                                                        <a
                                                                                            href={getPlaceLink(activity.location, itinerary.destination)}
                                                                                            target="_blank"
                                                                                            rel="noopener noreferrer"
                                                                                            onClick={(e) => e.stopPropagation()}
                                                                                            className="flex-1 py-3 bg-transparent border border-emerald-500/30 hover:bg-emerald-500/10 hover:border-emerald-400 text-emerald-400 text-sm font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-2"
                                                                                        >
                                                                                            <MapPin className="w-4 h-4" /> View on Map
                                                                                        </a>
                                                                                    </div>
                                                                                </div>
                                                                            );
                                                                        })()}
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
                                        <div className="text-2xl font-bold text-white">{formattedCost}</div>
                                    </div>


                                    <button
                                        onClick={() => setShowConfirmModal(true)}
                                        disabled={bookingStatus !== 'idle' || itinerary.status === 'confirmed'}
                                        className={`flex-1 md:flex-none md:w-auto px-8 py-4 font-bold text-sm uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${bookingStatus === 'idle'
                                            ? itinerary.status === 'confirmed'
                                                ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed border border-white/10'
                                                : 'bg-gradient-to-r from-cyan-400 to-emerald-400 text-black hover:scale-105'
                                            : bookingStatus === 'processing'
                                                ? 'bg-white text-black'
                                                : 'bg-emerald-500 text-black'
                                            }`}
                                    >
                                        {bookingStatus === 'idle' && (
                                            itinerary.status === 'confirmed'
                                                ? <><CheckCircle className="w-5 h-5" /> Mission Booked</>
                                                : <><ShieldCheck className="w-5 h-5" /> Confirm Itinerary</>
                                        )}
                                        {bookingStatus === 'processing' && <><Loader2 className="w-5 h-5 animate-spin" /> Processing...</>}
                                        {bookingStatus === 'confirmed' && <><CheckCircle className="w-5 h-5" /> Confirmed!</>}
                                    </button>
                                </div>
                            )}
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
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setExpandedNode(null);
                                        }}
                                        className="absolute top-4 right-4 p-2 bg-white/5 hover:bg-white/10 z-50 rounded-full"
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
                </div>
            )}


            {/* LAUNCH PROTOCOL MODAL */}
            {
                showConfirmModal && (
                    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                        <div className="absolute inset-0 bg-black/95 backdrop-blur-md animate-fade-in" onClick={() => setShowConfirmModal(false)} />
                        <div className="relative bg-black border border-white/20 p-8 max-w-md w-full shadow-[0_0_50px_rgba(34,211,238,0.2)] animate-fade-in-up">
                            {/* Cinematic Border Gradient */}
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-400 to-emerald-400" />
                            <div className="absolute bottom-0 right-0 w-full h-1 bg-gradient-to-l from-violet-500 to-fuchsia-500" />

                            <div className="flex flex-col items-center text-center mb-8">
                                <div className="w-20 h-20 bg-cyan-950/10 rounded-full flex items-center justify-center mb-6 border border-cyan-500/30 relative">
                                    <div className="absolute inset-0 rounded-full border border-cyan-400/20 animate-spin-slow" />
                                    <div className="absolute inset-2 rounded-full border border-dotted border-emerald-400/30 animate-reverse-spin" />
                                    <Plane className="w-8 h-8 text-cyan-400 rotate-[-45deg]" />
                                </div>
                                <h3 className="text-2xl font-bold text-white uppercase tracking-widest mb-1">Confirm Trip</h3>
                                <div className="text-[10px] text-cyan-400 font-mono tracking-[0.2em] mb-4">LOGISTICS PREPARATION</div>
                                <p className="text-zinc-400 text-sm font-mono max-w-xs">
                                    Confirming itinerary for <span className="text-white font-bold">{itinerary?.destination}</span>.
                                </p>
                            </div>

                            {/* DATE PICKER MODULE */}
                            <div className="mb-8">
                                <label className="block text-xs font-bold uppercase text-zinc-500 mb-2 tracking-widest">
                                    Select Start Date
                                </label>
                                <div className="relative group" onMouseLeave={() => setHoverDate(null)}>
                                    <DatePicker
                                        selected={startDate}
                                        onChange={handleDateChange}
                                        onDayMouseEnter={(date) => setHoverDate(date)}

                                        excludeDateIntervals={excludedIntervals}
                                        minDate={new Date()}
                                        dateFormat="yyyy-MM-dd"
                                        placeholderText="Select a date"
                                        className="relative w-full bg-black border border-white/20 text-white font-mono text-center py-4 px-4 focus:outline-none focus:border-cyan-400 transition-colors uppercase tracking-widest rounded-sm z-10"
                                        calendarClassName="dark-datepicker"
                                        wrapperClassName="w-full"
                                        popperPlacement="bottom"
                                        dayClassName={(date) => "bg-transparent hover:bg-transparent"}
                                        renderDayContents={(day, date) => {
                                            const dateStr = date.toDateString();
                                            let status: 'selected' | 'preview-valid' | 'preview-invalid' | 'excluded' | 'none' = 'none';

                                            // Check Excluded OR Past
                                            const today = new Date();
                                            today.setHours(0, 0, 0, 0);
                                            const isPast = date < today;

                                            const isExcludedInterval = excludedIntervals.some(interval =>
                                                date.getTime() >= interval.start.getTime() &&
                                                date.getTime() <= interval.end.getTime()
                                            );

                                            if (isExcludedInterval || isPast) status = 'excluded';
                                            else if (tripDates.has(dateStr)) status = 'selected';
                                            else {
                                                const preview = previewDates.get(dateStr);
                                                if (preview === 'valid') status = 'preview-valid';
                                                else if (preview === 'invalid') status = 'preview-invalid';
                                            }

                                            // Determine Position
                                            let position: 'start' | 'middle' | 'end' | 'single' = 'single';
                                            const checkNeighbor = (offset: number) => {
                                                const neighbor = new Date(date);
                                                neighbor.setDate(neighbor.getDate() + offset);
                                                const nStr = neighbor.toDateString();

                                                if (status === 'excluded') {
                                                    return excludedIntervals.some(interval =>
                                                        neighbor.getTime() >= interval.start.getTime() &&
                                                        neighbor.getTime() <= interval.end.getTime()
                                                    );
                                                }
                                                if (status === 'selected') return tripDates.has(nStr);
                                                if (status === 'preview-valid') return previewDates.get(nStr) === 'valid';
                                                if (status === 'preview-invalid') return previewDates.get(nStr) === 'invalid';

                                                return false;
                                            };

                                            const hasPrev = checkNeighbor(-1);
                                            const hasNext = checkNeighbor(1);

                                            if (hasPrev && hasNext) position = 'middle';
                                            else if (hasPrev && !hasNext) position = 'end';
                                            else if (!hasPrev && hasNext) position = 'start';

                                            // Base Classes - FULL SIZE
                                            const wrapperClass = "relative w-full h-full flex items-center justify-center z-10 font-mono text-sm";
                                            const bgBase = "absolute inset-0 transition-all duration-200 ease-out";

                                            let bgClass = "";
                                            let textClass = "text-zinc-500 group-hover:text-zinc-200 transition-colors";
                                            let roundingClass = "rounded-none";
                                            let styleObj = {};

                                            if (status === 'selected') {
                                                bgClass = "border-2 border-cyan-400 bg-cyan-500/20 shadow-[0_0_20px_rgba(34,211,238,0.3)]";
                                                textClass = "text-cyan-300 font-bold drop-shadow-[0_0_5px_rgba(34,211,238,0.8)]";
                                            } else if (status === 'preview-valid') {
                                                bgClass = "bg-cyan-500/30 backdrop-blur-sm shadow-[0_0_10px_rgba(34,211,238,0.1)]";
                                                textClass = "text-cyan-50 font-bold";
                                            } else if (status === 'preview-invalid') {
                                                // Red Fill (Smooth)
                                                bgClass = "bg-red-500/20 backdrop-blur-sm border-2 border-red-500/30";
                                                textClass = "text-red-300 font-bold opacity-90";
                                            } else if (status === 'excluded') {
                                                // RED HAZARD PATTERN: Black & Dark Red Stripes
                                                styleObj = {
                                                    backgroundImage: "repeating-linear-gradient(45deg, #09090b, #09090b 10px, #450a0a 10px, #450a0a 20px)"
                                                };
                                                bgClass = "border border-red-900/30 opacity-80";
                                                textClass = "text-red-500/60 font-medium cursor-not-allowed";
                                            }

                                            // Shape Logic for Seamless Range
                                            if (status === 'selected' || status === 'preview-valid') {
                                                if (position === 'start') roundingClass = "rounded-l-md border-r-0 mr-[-1px]"; // Negative margin to pull next item
                                                else if (position === 'end') roundingClass = "rounded-r-md border-l-0 ml-[-1px]";
                                                else if (position === 'middle') roundingClass = "rounded-none border-x-0 mx-[-1px]";
                                                else if (position === 'single') roundingClass = "rounded-md";
                                            } else {
                                                // Default rounding for single items (invalid/excluded)
                                                roundingClass = "rounded-md";
                                            }

                                            if (status === 'none') {
                                                bgClass = "hidden"; // Hide bg for none
                                            }

                                            return (
                                                <div className={wrapperClass}>
                                                    {status !== 'none' && (
                                                        <div className={`${bgBase} ${bgClass} ${roundingClass}`} style={styleObj} />
                                                    )}
                                                    <span className={`relative z-20 ${textClass}`}>{day}</span>
                                                </div>
                                            );
                                        }}
                                    />
                                    <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none z-20" />
                                </div>
                                <div className="mt-2 text-[10px] font-mono text-center h-4">
                                    {startDate ? (
                                        <span className="text-emerald-500/70">Selected: {startDate.toLocaleDateString('en-CA')}</span>
                                    ) : (
                                        <span className="text-zinc-500">Blocked dates are grayed out</span>
                                    )}
                                </div>
                            </div>

                            <div className="bg-white/5 border border-white/10 p-4 mb-8">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-xs font-bold uppercase text-zinc-500">Logistics Cost</span>
                                    <span className="text-white font-bold font-mono">{formattedCost}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-xs font-bold uppercase text-zinc-500">Duration</span>
                                    <span className="text-white font-bold font-mono">{itinerary?.duration}</span>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <button
                                    onClick={() => setShowConfirmModal(false)}
                                    className="flex-1 py-4 border border-white/20 text-zinc-400 hover:text-white hover:border-white font-bold uppercase tracking-widest text-xs transition-all"
                                >
                                    Abort
                                </button>
                                <button
                                    onClick={handleBookItinerary}
                                    disabled={!startDate || !!dateConflictWarning}
                                    className={`flex-1 py-4 font-bold uppercase tracking-widest text-xs transition-all shadow-[0_0_30px_rgba(34,211,238,0.2)] ${(!startDate || dateConflictWarning) ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed' : 'bg-gradient-to-r from-cyan-400 to-emerald-400 text-black hover:scale-105 hover:shadow-[0_0_50px_rgba(34,211,238,0.5)]'}`}
                                >
                                    {!startDate ? 'Select Date' : dateConflictWarning ? 'Date Blocked' : 'Confirm'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            {/* --- CREDIT ALERT MODAL (CUSTOM STYLE) --- */}
            {
                showCreditAlert && (
                    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
                        {/* Backdrop */}
                        <div
                            className="absolute inset-0 bg-black/80 backdrop-blur-md transition-opacity"
                            onClick={() => setShowCreditAlert(false)}
                        />

                        {/* Modal Content */}
                        <div className="relative bg-[#0A0A0A] border border-white/10 rounded-2xl p-8 max-w-sm w-full shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden animate-in fade-in zoom-in duration-200">
                            {/* Glow Effect */}
                            <div className="absolute -top-20 -left-20 w-40 h-40 bg-cyan-500/20 rounded-full blur-[80px]" />

                            <div className="relative z-10 flex flex-col items-center text-center gap-6">
                                <div className="w-16 h-16 rounded-full bg-cyan-950/50 border border-cyan-500/20 flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.1)]">
                                    <DollarSign className="w-8 h-8 text-cyan-400" />
                                </div>

                                <div className="space-y-2">
                                    <h3 className="text-xl font-bold text-white uppercase tracking-widest">Insufficient Credits</h3>
                                    <p className="text-zinc-400 text-sm leading-relaxed">
                                        You need <span className="text-white font-bold">1 Credit</span> to generate a trip.
                                    </p>
                                </div>

                                <div className="flex flex-col w-full gap-3 mt-2">
                                    <button
                                        onClick={() => {
                                            if (prompt.trim()) {
                                                localStorage.setItem('voyageur_saved_prompt', prompt);
                                            }
                                            setShowCreditAlert(false);
                                            setView(AppView.PRICING);
                                        }}
                                        className="w-full py-3 bg-gradient-to-r from-cyan-400 to-cyan-500 text-black font-bold uppercase tracking-widest text-xs rounded-lg hover:brightness-110 hover:scale-[1.02] transition-all shadow-[0_0_20px_rgba(34,211,238,0.3)]"
                                    >
                                        Get Credits
                                    </button>
                                    <button
                                        onClick={() => setShowCreditAlert(false)}
                                        className="w-full py-3 bg-transparent border border-white/10 text-zinc-500 font-bold uppercase tracking-widest text-xs rounded-lg hover:bg-white/5 hover:text-white transition-all"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }
            <style>{`
                .clip-path-slant {
                    clip-path: polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px);
                }
            `}</style>
        </div >
    );
};

export default TripPlanner;