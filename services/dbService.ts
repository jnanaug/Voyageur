
import { createClient } from '@supabase/supabase-js';
import { TripItinerary, StoredTrip, StoredPrompt } from '../types';

// Load env variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

let supabase: any = null;

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn("⚠️ Supabase credentials missing! App will run in offline mode.");
} else {
    supabase = createClient(supabaseUrl, supabaseAnonKey);
}

// Helper to handle RPC errors uniformly
const handleRpcError = (error: any, context: string) => {
    console.error(`❌ [${context}] Error:`, error);
    throw new Error(error.message || `Failed to ${context}`);
};

const TRIPS_KEY = 'voyageur_trips_v1';
const PROMPTS_KEY = 'voyageur_prompts';

// --- LOCAL STORAGE HELPERS ---

const saveLocalTrip = (userId: string, trip: TripItinerary): string => {
    const trips = JSON.parse(localStorage.getItem(TRIPS_KEY) || '[]');
    const newTrip: StoredTrip = {
        id: crypto.randomUUID(),
        user_id: userId,
        destination: trip.destination,
        total_cost: trip.totalEstimatedCost,
        duration: trip.duration,
        data: trip,
        status: trip.status || 'draft',
        created_at: Date.now(),
        updated_at: Date.now()
    };
    trips.push(newTrip);
    localStorage.setItem(TRIPS_KEY, JSON.stringify(trips));
    if (typeof window !== 'undefined') window.dispatchEvent(new Event('voyageur:db-update'));
    return newTrip.id;
};

const updateLocalTrip = (userId: string, tripId: string, trip: TripItinerary) => {
    const trips = JSON.parse(localStorage.getItem(TRIPS_KEY) || '[]');
    const index = trips.findIndex((t: StoredTrip) => t.id === tripId && t.user_id === userId);

    console.log("📦 [dbService.updateLocalTrip] TripID:", tripId.slice(0, 8), "Found at index:", index, "StartDate in trip:", trip.startDate, "Status:", trip.status);

    if (index !== -1) {
        trips[index].data = trip;
        trips[index].destination = trip.destination;
        trips[index].total_cost = trip.totalEstimatedCost;
        trips[index].duration = trip.duration;
        // ALSO UPDATE TOP-LEVEL startDate!
        trips[index].startDate = trip.startDate;
        trips[index].status = trip.status || trips[index].status;
        trips[index].updated_at = Date.now();
        console.log("📦 [dbService.updateLocalTrip] UPDATED existing entry. New startDate:", trips[index].startDate, "New status:", trips[index].status);
    } else {
        // Upsert: If correct ID isn't found locally (e.g. wiped), restore/create it
        const newTrip: StoredTrip = {
            id: tripId,
            user_id: userId,
            destination: trip.destination,
            total_cost: trip.totalEstimatedCost,
            duration: trip.duration,
            data: trip,
            status: trip.status || 'draft',
            startDate: trip.startDate, // Include startDate at top level
            created_at: Date.now(),
            updated_at: Date.now()
        };
        trips.push(newTrip);
        console.log("📦 [dbService.updateLocalTrip] CREATED new entry with startDate:", newTrip.startDate);
    }
    localStorage.setItem(TRIPS_KEY, JSON.stringify(trips));
    if (typeof window !== 'undefined') window.dispatchEvent(new Event('voyageur:db-update'));
    console.log("📦 [dbService.updateLocalTrip] LocalStorage WRITTEN. Total trips:", trips.length);
};

const updateLocalTripStatus = (userId: string, tripId: string, status: 'draft' | 'confirmed' | 'paused' | 'completed') => {
    const trips = JSON.parse(localStorage.getItem(TRIPS_KEY) || '[]');
    const index = trips.findIndex((t: StoredTrip) => t.id === tripId && t.user_id === userId);
    if (index !== -1) {
        trips[index].status = status;
        localStorage.setItem(TRIPS_KEY, JSON.stringify(trips));
        if (typeof window !== 'undefined') window.dispatchEvent(new Event('voyageur:db-update'));
    }
};

const saveLocalPrompt = (promptData: Omit<StoredPrompt, 'id' | 'created_at'>): string => {
    const prompts = JSON.parse(localStorage.getItem(PROMPTS_KEY) || '[]');
    const newPrompt: StoredPrompt = {
        id: crypto.randomUUID(),
        ...promptData,
        created_at: Date.now()
    };
    prompts.push(newPrompt);
    localStorage.setItem(PROMPTS_KEY, JSON.stringify(prompts));
    if (typeof window !== 'undefined') window.dispatchEvent(new Event('voyageur:db-update'));
    return newPrompt.id;
};

const updateLocalPrompt = (promptId: string, updates: Partial<StoredPrompt>) => {
    const prompts = JSON.parse(localStorage.getItem(PROMPTS_KEY) || '[]');
    const index = prompts.findIndex((p: StoredPrompt) => p.id === promptId);
    if (index !== -1) {
        prompts[index] = { ...prompts[index], ...updates };
        localStorage.setItem(PROMPTS_KEY, JSON.stringify(prompts));
        if (typeof window !== 'undefined') window.dispatchEvent(new Event('voyageur:db-update'));
    }
};

export const dbService = {

    // --- TRIPS ---

    async saveTrip(userId: string, trip: TripItinerary, status: 'draft' | 'confirmed' | 'completed' = 'draft'): Promise<string> {
        const tripId = crypto.randomUUID();
        const timestamp = new Date().toISOString();

        // 1. Optimistic Local Save (Always save locally for speed/offline capability)
        if (typeof localStorage !== 'undefined') {
            const trips = JSON.parse(localStorage.getItem(TRIPS_KEY) || '[]');
            // Check for existing ID to prevent duplicates
            const existingIndex = trips.findIndex((t: StoredTrip) => t.id === tripId);

            const newLocalTrip: StoredTrip = {
                id: tripId,
                user_id: userId,
                destination: trip.destination,
                total_cost: trip.totalEstimatedCost,
                duration: trip.duration,
                data: trip,
                status: status,
                created_at: Date.now()
            };

            if (existingIndex !== -1) {
                trips[existingIndex] = newLocalTrip;
            } else {
                trips.push(newLocalTrip);
            }
            localStorage.setItem(TRIPS_KEY, JSON.stringify(trips));
        }

        if (supabase) {
            const { data, error } = await supabase.from('trips').insert({
                id: tripId,
                user_id: userId,
                destination: trip.destination,
                total_cost: trip.totalEstimatedCost,
                duration: trip.duration,
                data: trip, // JSONB
                status: status,
                created_at: timestamp
            }).select().single();

            if (error) {
                console.warn("Supabase Save Error (Local saved as backup):", error.message);
                return tripId;
            }
            return data?.id || tripId;
        } else {
            return tripId;
        }
    },

    async updateTrip(userId: string, tripId: string, trip: TripItinerary): Promise<void> {
        // Optimistic Local Update
        updateLocalTrip(userId, tripId, trip);

        if (supabase) {
            const { error } = await supabase
                .from('trips')
                .update({
                    destination: trip.destination,
                    total_cost: trip.totalEstimatedCost,
                    duration: trip.duration,
                    data: trip
                })
                .eq('id', tripId)
                .eq('user_id', userId);

            if (error) {
                console.warn("Supabase Update Error (Local update already applied):", error.message);
            }
        }
    },

    async getTrips(userId: string): Promise<StoredTrip[]> {
        if (supabase) {
            const { data, error } = await supabase
                .from('trips')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false });

            if (error) {
                console.warn("Supabase Fetch Error (Falling back to Local Storage):", error.message);
                if (typeof localStorage !== 'undefined') {
                    const trips = JSON.parse(localStorage.getItem(TRIPS_KEY) || '[]');
                    const localTrips = trips.filter((t: StoredTrip) => t.user_id === userId);
                    return localTrips.map((t: StoredTrip) => ({ ...t, status: t.status || 'draft' }));
                }
                return [];
            }
            // 1. Process Remote Data
            const remoteTrips = data?.map((d: any) => ({
                ...d,
                startDate: d.startDate || d.data?.startDate,
                status: d.status || 'draft',
                created_at: new Date(d.created_at).getTime()
            })) || [];

            // 2. Process Local Data (The Authority on Recent Changes)
            // If a trip exists locally, we trust IT over the server (which might be lagging).
            let localTrips: StoredTrip[] = [];
            if (typeof localStorage !== 'undefined') {
                const stored = JSON.parse(localStorage.getItem(TRIPS_KEY) || '[]');
                localTrips = stored.filter((t: StoredTrip) => t.user_id === userId).map((t: StoredTrip) => ({
                    ...t,
                    startDate: (t.data as any).startDate, // Ensure hoisting for local too
                    status: t.status || 'draft'
                }));
            }

            // 3. Strict Merge: Local Wins Conflicts
            const mergedMap = new Map();

            // Populate with Remote
            remoteTrips.forEach(t => mergedMap.set(t.id, t));

            // Overwrite with Local (Fixes "Ghosting" / "Flashback" issue)
            localTrips.forEach(t => mergedMap.set(t.id, t));

            // Convert and Sort
            const merged = Array.from(mergedMap.values()).sort((a: any, b: any) => b.created_at - a.created_at);

            return merged;
        } else if (typeof localStorage !== 'undefined') {
            const trips = JSON.parse(localStorage.getItem(TRIPS_KEY) || '[]');
            const localTrips = trips.filter((t: StoredTrip) => t.user_id === userId);
            return localTrips.map((t: StoredTrip) => ({ ...t, status: t.status || 'draft' }));
        }
        return [];
    },

    async updateTripStatus(userId: string, tripId: string, status: 'draft' | 'confirmed' | 'paused' | 'completed'): Promise<void> {
        // Optimistic Local Update
        updateLocalTripStatus(userId, tripId, status);

        if (supabase) {
            const { error } = await supabase
                .from('trips')
                .update({ status: status })
                .eq('id', tripId)
                .eq('user_id', userId);

            if (error) {
                console.warn("Supabase Status Update Error (Local update already applied):", error.message);
            }
        }
    },

    // --- PROMPTS ---

    async savePrompt(userId: string, promptText: string): Promise<void> {
        if (supabase) {
            const { error } = await supabase.from('prompts').insert({
                user_id: userId,
                prompt: promptText,
                created_at: new Date().toISOString()
            });
            if (error) {
                console.warn("Supabase Prompt Save Error (Falling back to Local Storage):", error.message);
                saveLocalPrompt({ user_id: userId, prompt: promptText, status: 'ready' });
            }
        } else if (typeof localStorage !== 'undefined') {
            saveLocalPrompt({ user_id: userId, prompt: promptText, status: 'ready' });
        }
    },

    // Save prompt with status for background generation
    savePromptWithStatus(promptData: Omit<StoredPrompt, 'id' | 'created_at'>): string {
        const id = crypto.randomUUID();
        const created_at = Date.now();
        const fullPrompt: StoredPrompt = { id, created_at, ...promptData };

        // Save to localStorage immediately (for instant UI update)
        if (typeof localStorage !== 'undefined') {
            const prompts = JSON.parse(localStorage.getItem(PROMPTS_KEY) || '[]');
            prompts.push(fullPrompt);
            localStorage.setItem(PROMPTS_KEY, JSON.stringify(prompts));
            if (typeof window !== 'undefined') window.dispatchEvent(new Event('voyageur:db-update'));
        }

        // Also save to Supabase (async, fire-and-forget for speed)
        if (supabase) {
            supabase
                .from('prompts')
                .insert({
                    id,
                    user_id: promptData.user_id,
                    prompt: promptData.prompt,
                    destination: promptData.destination || null,
                    status: promptData.status,
                    created_at: new Date(created_at).toISOString()
                })
                .then(({ error }: any) => {
                    if (error) console.error('Supabase prompt insert error:', error.message);
                    else console.log('✅ Prompt saved to Supabase:', id);
                });
        }

        return id;
    },

    // Update prompt status/result after background generation
    updatePrompt(promptId: string, updates: Partial<StoredPrompt>) {
        // Update localStorage immediately
        if (typeof localStorage !== 'undefined') {
            updateLocalPrompt(promptId, updates);
        }

        // Also update Supabase (async, fire-and-forget)
        if (supabase) {
            const supabaseUpdates: any = { ...updates };
            // JSONB columns in Supabase generally accept objects directly, 
            // but we ensure it matches what we expect.
            if (updates.result && typeof updates.result !== 'string') {
                // If it's an object, let supabase-js handle it, or stringify if needed.
                // Usually sending object is fine for JSONB.
                // supabaseUpdates.result = updates.result; 
            }

            console.log('🔄 Attempting Supabase update:', promptId, supabaseUpdates);

            supabase
                .from('prompts')
                .update(supabaseUpdates)
                .eq('id', promptId)
                .select() // Return data to confirm update
                .then(({ data, error }: any) => {
                    if (error) {
                        console.error('❌ Supabase prompt update FAILED:', error.message);
                    } else if (!data || data.length === 0) {
                        console.warn('⚠️ Supabase update succeeded but NO ROWS modified. Check promptId or RLS.', promptId);
                    } else {
                        console.log('✅ Supabase prompt updated successfully:', data[0].status);
                    }
                });
        }
    },

    async getPrompts(userId: string): Promise<StoredPrompt[]> {
        // Get locally deleted IDs (fallback for RLS failures)
        const deletedIds = typeof localStorage !== 'undefined'
            ? JSON.parse(localStorage.getItem('voyageur_deleted_prompts') || '[]')
            : [];

        if (supabase) {
            const { data, error } = await supabase
                .from('prompts')
                .select('*')
                .eq('user_id', userId)
                .neq('status', 'consumed') // Filter out soft-deleted prompts
                .order('created_at', { ascending: false });

            if (error) {
                console.warn("Supabase Prompt Fetch Error (Falling back to Local Storage):", error.message);
                if (typeof localStorage !== 'undefined') {
                    const prompts = JSON.parse(localStorage.getItem(PROMPTS_KEY) || '[]');
                    return prompts.filter((p: StoredPrompt) => p.user_id === userId && !deletedIds.includes(p.id));
                }
                return [];
            }

            // 1. Process Remote Data
            const remotePrompts = (data || []).map((p: any) => ({
                id: p.id,
                user_id: p.user_id,
                prompt: p.prompt,
                destination: p.destination,
                status: p.status || 'ready',
                result: typeof p.result === 'string' ? JSON.parse(p.result) : p.result,
                error: p.error,
                created_at: new Date(p.created_at).getTime()
            }));

            // 2. Process Local Data (The Authority on Recent Changes)
            let localPrompts: StoredPrompt[] = [];
            if (typeof localStorage !== 'undefined') {
                const stored = JSON.parse(localStorage.getItem(PROMPTS_KEY) || '[]');
                localPrompts = stored.filter((p: StoredPrompt) => p.user_id === userId);
            }

            // 3. Strict Merge: Local Wins Conflicts
            // This ensures that if we just updated status to 'ready' locally,
            // we display it immediately even if Supabase is still 'generating'.
            const mergedMap = new Map();
            remotePrompts.forEach((p: any) => mergedMap.set(p.id, p));
            localPrompts.forEach((p: StoredPrompt) => mergedMap.set(p.id, p));

            // Filter deleted and Sort
            return Array.from(mergedMap.values())
                .filter((p: any) => !deletedIds.includes(p.id))
                .sort((a: any, b: any) => b.created_at - a.created_at);
        } else if (typeof localStorage !== 'undefined') {
            const prompts = JSON.parse(localStorage.getItem(PROMPTS_KEY) || '[]');
            return prompts.filter((p: StoredPrompt) => p.user_id === userId && !deletedIds.includes(p.id));
        }
        return [];
    },

    async deletePrompt(promptId: string) {
        if (typeof localStorage !== 'undefined') {
            // 1. Remove from main prompts cache
            const prompts: StoredPrompt[] = JSON.parse(localStorage.getItem(PROMPTS_KEY) || '[]');
            const updated = prompts.filter(p => p.id !== promptId);
            localStorage.setItem(PROMPTS_KEY, JSON.stringify(updated));
            if (typeof window !== 'undefined') window.dispatchEvent(new Event('voyageur:db-update'));

            // 2. Add to deleted IDs list (as a backup)
            const deleted = JSON.parse(localStorage.getItem('voyageur_deleted_prompts') || '[]');
            if (!deleted.includes(promptId)) {
                deleted.push(promptId);
                localStorage.setItem('voyageur_deleted_prompts', JSON.stringify(deleted));
            }
        }

        // Remove from Supabase (Soft Delete first, then Hard Delete)
        if (supabase) {
            // A. Soft Delete (Mark as consumed) - ensuring it hides even if DELETE fails (RLS)
            const { error: softError } = await supabase
                .from('prompts')
                .update({ status: 'consumed' })
                .eq('id', promptId);

            if (softError) console.warn("Soft delete prompt failed:", softError.message);

            // B. Hard Delete (Cleanup)
            await supabase
                .from('prompts')
                .delete()
                .eq('id', promptId);
        }
    },

    // --- STATS AGGREGATION ---
    async getStats(userId: string) {
        const allTrips = await this.getTrips(userId);
        // Count confirmed, paused, and completed for trip count
        const activeTrips = allTrips.filter(t => t.status === 'confirmed' || t.status === 'completed' || t.status === 'paused');
        const completedTrips = allTrips.filter(t => t.status === 'completed');

        // Calculate Total Spend AND Total Completions - FROM ALL TRIPS (Active + Completed)
        // This ensures re-booked trips (which are 'confirmed') still count their PAST completions
        let totalSpend = 0;
        let totalCompletions = 0; // For Voyager Points and Carbon Offset

        allTrips.forEach(t => {
            // Check for completionHistory (re-booked trips or multiple completions)
            const history = (t.data as any)?.completionHistory;

            if (history && Array.isArray(history) && history.length > 0) {
                // Sum all completions in history (ARCHIVED)
                history.forEach((costStr: string) => {
                    const match = costStr?.match?.(/[\d,]+/);
                    if (match) totalSpend += parseFloat(match[0].replace(/,/g, ''));
                });
                // Count historical completions
                totalCompletions += history.length;
            }

            // Add CURRENT trip cost and count ONLY if it is completed (ACTIVE)
            if (t.status === 'completed') {
                const costStr = t.total_cost || (t.data as any)?.totalEstimatedCost || '';
                if (costStr) {
                    const match = costStr.match(/[\d,]+/);
                    if (match) {
                        const cost = parseFloat(match[0].replace(/,/g, ''));
                        if (!isNaN(cost)) totalSpend += cost;
                    }
                }
                totalCompletions += 1;
            }
        });

        // Count unique cities from COMPLETED trips only
        const cities = new Set(
            completedTrips
                .map(t => t.destination?.toLowerCase().trim().split(',')[0].trim())
                .filter(Boolean)
        ).size;

        // --- DNA ANALYSIS ---
        const dnaScores = { Adventure: 0, Luxury: 0, Culture: 0, Relaxation: 0 };
        const keywords = {
            Adventure: ["hike", "hiking", "trek", "camp", "safari", "mountain", "kayak", "ski", "climb", "raft", "scuba", "dive", "explore", "wild", "forest", "jungle"],
            Luxury: ["resort", "spa", "5-star", "five star", "luxury", "gourmet", "yacht", "private", "chauffeur", "limousine", "suite", "fine dining", "champagne", "helicopter"],
            Culture: ["museum", "history", "historical", "temple", "art", "gallery", "culture", "cultural", "heritage", "ancient", "tour", "monument", "palace", "cathedral", "ruins"],
            Relaxation: ["beach", "massage", "relax", "pool", "leisure", "cruise", "island", "sunset", "lounge", "wellness", "yoga", "retreat", "sun"]
        };

        const analyzeText = (text: string, scores: typeof dnaScores, weight: number) => {
            if (!text) return;
            const lower = text.toLowerCase();
            (Object.keys(keywords) as Array<keyof typeof keywords>).forEach(category => {
                if (keywords[category].some(k => lower.includes(k))) {
                    scores[category] += weight;
                }
            });
        };

        // Aggregation for averaging
        const aggregatedDNA = { Adventure: 0, Luxury: 0, Culture: 0, Relaxation: 0 };
        let tripsWithDNA = 0;

        // Analyze ALL trips (Active + Completed)
        allTrips.forEach(t => {
            if (!t.data) return;

            // STRATEGY 2: LLM Tagging (Preferred)
            if (t.data.dna) {
                aggregatedDNA.Adventure += t.data.dna.Adventure || 0;
                aggregatedDNA.Luxury += t.data.dna.Luxury || 0;
                aggregatedDNA.Culture += t.data.dna.Culture || 0;
                aggregatedDNA.Relaxation += t.data.dna.Relaxation || 0;
                tripsWithDNA++;
                return;
            }

            // STRATEGY 1: Keyword Analysis (Fallback for Legacy Trips)
            const localScores = { Adventure: 0, Luxury: 0, Culture: 0, Relaxation: 0 };

            // 1. Destination (Weight: 2)
            analyzeText(t.destination, localScores, 2);

            // 2. Daily Itinerary (Themes & Activities)
            if (t.data.days) {
                t.data.days.forEach(day => {
                    analyzeText(day.theme, localScores, 2);
                    if (day.activities) {
                        day.activities.forEach(act => {
                            analyzeText(act.title, localScores, 1);
                            analyzeText(act.description, localScores, 1);
                        });
                    }
                });
            }

            // Normalize this single trip's keyword score to percentages (0-100)
            const totalLocal = Object.values(localScores).reduce((a, b) => a + b, 0);
            if (totalLocal > 0) {
                aggregatedDNA.Adventure += Math.round((localScores.Adventure / totalLocal) * 100);
                aggregatedDNA.Luxury += Math.round((localScores.Luxury / totalLocal) * 100);
                aggregatedDNA.Culture += Math.round((localScores.Culture / totalLocal) * 100);
                aggregatedDNA.Relaxation += Math.round((localScores.Relaxation / totalLocal) * 100);
                tripsWithDNA++;
            }
        });

        // Calculate Final Average
        const dna = {
            Adventure: tripsWithDNA ? Math.round(aggregatedDNA.Adventure / tripsWithDNA) : 0,
            Luxury: tripsWithDNA ? Math.round(aggregatedDNA.Luxury / tripsWithDNA) : 0,
            Culture: tripsWithDNA ? Math.round(aggregatedDNA.Culture / tripsWithDNA) : 0,
            Relaxation: tripsWithDNA ? Math.round(aggregatedDNA.Relaxation / tripsWithDNA) : 0
        };

        if (tripsWithDNA === 0 && allTrips.length > 0) {
            dna.Adventure = 25; dna.Luxury = 25; dna.Culture = 25; dna.Relaxation = 25;
        }

        return {
            dna,
            totalSpend: Math.round(totalSpend),
            tripCount: activeTrips.length,
            totalCompletions: totalCompletions, // For Voyager Points and Carbon Offset (includes re-booked trips)
            citiesVisited: cities,
            recentTrips: activeTrips.slice(0, 4)
        };
    },

    // --- CREDIT SYSTEM (RPCs) ---

    // Get latest credits (Remote Authority)
    async getUserCredits(userId: string): Promise<number> {
        if (!supabase) return 0;
        const { data, error } = await supabase
            .from('profiles')
            .select('credits')
            .eq('id', userId)
            .single();

        if (error) {
            console.error("Error fetching credits:", error);
            return 0;
        }
        return data?.credits || 0;
    },

    // Atomic Add (Via RPC)
    async addCreditsRPC(userId: string, amount: number): Promise<void> {
        if (!supabase) return;
        const { error } = await supabase.rpc('add_credits', {
            target_user_id: userId,
            amount: amount
        });
        if (error) handleRpcError(error, 'add credits');
    },

    // Atomic Deduct (Via RPC)
    async deductCreditsRPC(userId: string, amount: number): Promise<boolean> {
        if (!supabase) return false;
        const { data, error } = await supabase.rpc('deduct_credits', {
            target_user_id: userId,
            amount: amount
        });

        if (error) {
            console.error("Error deducting credits:", error);
            return false;
        }
        return data as boolean;
    },

    // Record Payment & Idempotency Check (Via RPC)
    async recordPaymentRPC(
        userId: string,
        provider: string,
        paymentId: string,
        amount: number,
        credits: number,
        status: string
    ): Promise<boolean> {
        if (!supabase) return false;
        const { data, error } = await supabase.rpc('record_payment', {
            p_user_id: userId,
            p_provider: provider,
            p_payment_id: paymentId,
            p_amount: amount,
            p_credits: credits,
            p_status: status
        });

        if (error) {
            console.error("Error recording payment:", error);
            return false; // Might be duplicate
        }
        return data as boolean;
    },

    // Get Payment History for a user
    async getPaymentHistory(userId: string): Promise<{
        id: string;
        credits_added: number;
        amount: number;
        status: string;
        created_at: string;
        provider: string;
    }[]> {
        if (!supabase) return [];
        const { data, error } = await supabase
            .from('payments')
            .select('id, credits_added, amount, status, created_at, provider')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(10);

        if (error) {
            console.error("Error fetching payment history:", error);
            return [];
        }
        return data || [];
    },

    // Save User Settings to Supabase
    async saveUserSettings(userId: string, settings: { dietary?: string; luxury?: number; darkMode?: boolean }): Promise<boolean> {
        if (!supabase) return false;

        try {
            const { error } = await supabase.rpc('upsert_user_settings', {
                p_user_id: userId,
                p_dietary: settings.dietary,
                p_luxury: settings.luxury,
                p_dark_mode: settings.darkMode
            });

            if (error) {
                console.error("Error saving user settings:", error);
                return false;
            }
            return true;
        } catch (e) {
            console.error("Exception saving user settings:", e);
            return false;
        }
    },

    // Load User Settings from Supabase
    async loadUserSettings(userId: string): Promise<{ dietary: string; luxury: number; darkMode: boolean } | null> {
        if (!supabase) return null;

        try {
            const { data, error } = await supabase.rpc('get_user_settings', {
                p_user_id: userId
            });

            if (error) {
                console.error("Error loading user settings:", error);
                return null;
            }

            if (data && data.length > 0) {
                return {
                    dietary: data[0].dietary || 'None',
                    luxury: data[0].luxury || 3,
                    darkMode: data[0].dark_mode ?? true
                };
            }
            return null;
        } catch (e) {
            console.error("Exception loading user settings:", e);
            return null;
        }
    },

    // Update user's display name in profiles table AND Supabase Auth Metadata
    async updateUserName(userId: string, newName: string): Promise<boolean> {
        if (!supabase) return false;

        try {
            // 1. Update Public Profile (Source of Truth for App)
            const { error: profileError } = await supabase
                .from('profiles')
                .update({ full_name: newName })
                .eq('id', userId);

            if (profileError) {
                console.error("Error updating user profile:", profileError);
                return false;
            }

            // 2. Update Auth Metadata (Source of Truth for Session/Initial Load)
            // This prevents the "old name flicker" on fresh logins/cleared cache.
            const { error: authError } = await supabase.auth.updateUser({
                data: { full_name: newName }
            });

            if (authError) {
                console.warn("Warning: Failed to sync auth metadata (non-critical):", authError);
                // We return true because the main profile update succeeded.
            }

            return true;
        } catch (e) {
            console.error("Exception updating user name:", e);
            return false;
        }
    },

    // Get Full User Profile (Credits + Name + etc) - Source of Truth
    async getUserProfile(userId: string): Promise<{ fullName: string; credits: number } | null> {
        if (!supabase) return null;
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('full_name, credits')
                .eq('id', userId)
                .eq('id', userId)
                .maybeSingle(); // Use maybeSingle to handle deleted profiles gracefully

            if (error) {
                console.error("Error fetching user profile:", error);
                return null;
            }

            // Self-Healing: If profile is missing (deleted but Auth exists), recreate it
            if (!data) {
                console.warn("⚠️ Profile missing for existing user. Attempting recovery...");
                const { error: insertError } = await supabase
                    .from('profiles')
                    .insert({ id: userId, full_name: 'Traveler', credits: 0 }); // Default values

                if (insertError) {
                    console.error("Failed to recreate profile:", insertError);
                    return null;
                }
                return { fullName: 'Traveler', credits: 0 };
            }

            return {
                fullName: data.full_name || '',
                credits: data.credits || 0
            };
        } catch (e) {
            console.error("Exception fetching user profile:", e);
            return null;
        }
    }
};
