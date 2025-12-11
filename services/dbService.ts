
import { TripItinerary } from '../types';
import { supabase } from './supabaseClient';

// --- LOCAL STORAGE KEYS ---
const TRIPS_KEY = 'voyageur_trips';
const PROMPTS_KEY = 'voyageur_prompts';

interface StoredTrip {
    id: string;
    user_id: string;
    destination: string;
    total_cost: string;
    duration: string;
    data: TripItinerary;
    created_at: number;
}

interface StoredPrompt {
    id: string;
    user_id: string;
    prompt: string;
    created_at: number;
}

// Helper to save to local storage
const saveLocalTrip = (userId: string, trip: TripItinerary) => {
    if (typeof localStorage === 'undefined') return;
    const trips = JSON.parse(localStorage.getItem(TRIPS_KEY) || '[]');
    const newTrip: StoredTrip = {
        id: crypto.randomUUID(),
        user_id: userId,
        destination: trip.destination,
        total_cost: trip.totalEstimatedCost,
        duration: trip.duration,
        data: trip,
        created_at: Date.now()
    };
    trips.unshift(newTrip); 
    localStorage.setItem(TRIPS_KEY, JSON.stringify(trips));
};

const saveLocalPrompt = (userId: string, promptText: string) => {
    if (typeof localStorage === 'undefined') return;
    const prompts = JSON.parse(localStorage.getItem(PROMPTS_KEY) || '[]');
    const newPrompt: StoredPrompt = {
        id: crypto.randomUUID(),
        user_id: userId,
        prompt: promptText,
        created_at: Date.now()
    };
    prompts.unshift(newPrompt);
    localStorage.setItem(PROMPTS_KEY, JSON.stringify(prompts));
}

export const dbService = {
    
    // --- TRIPS ---
    
    async saveTrip(userId: string, trip: TripItinerary): Promise<void> {
        if (supabase) {
            const { error } = await supabase.from('trips').insert({
                user_id: userId,
                destination: trip.destination,
                total_cost: trip.totalEstimatedCost,
                duration: trip.duration,
                data: trip, // JSONB
                created_at: new Date().toISOString()
            });
            
            if (error) {
                // If table doesn't exist (PGRST205), fallback to local
                if (error.code === 'PGRST205' || error.message.includes('relation "public.trips" does not exist')) {
                    console.warn("Supabase tables missing. Saving to Local Storage instead. Please run supabase_setup.sql");
                    saveLocalTrip(userId, trip);
                } else {
                    console.error("Supabase Save Error:", JSON.stringify(error, null, 2));
                }
            }
        } else if (typeof localStorage !== 'undefined') {
            saveLocalTrip(userId, trip);
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
                 // If table doesn't exist, try local
                 if (error.code === 'PGRST205' || error.message.includes('relation "public.trips" does not exist')) {
                     console.warn("Supabase tables missing. Fetching from Local Storage.");
                     if (typeof localStorage !== 'undefined') {
                        const trips = JSON.parse(localStorage.getItem(TRIPS_KEY) || '[]');
                        return trips.filter((t: StoredTrip) => t.user_id === userId);
                    }
                 }
                console.error("Supabase Fetch Error:", JSON.stringify(error, null, 2));
                return [];
            }
            return data?.map((d: any) => ({
                ...d,
                created_at: new Date(d.created_at).getTime()
            })) || [];
        } else if (typeof localStorage !== 'undefined') {
            const trips = JSON.parse(localStorage.getItem(TRIPS_KEY) || '[]');
            return trips.filter((t: StoredTrip) => t.user_id === userId);
        }
        return [];
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
                 if (error.code === 'PGRST205' || error.message.includes('relation "public.prompts" does not exist')) {
                    saveLocalPrompt(userId, promptText);
                 } else {
                    console.error("Supabase Prompt Save Error:", JSON.stringify(error, null, 2));
                 }
            }
        } else if (typeof localStorage !== 'undefined') {
            saveLocalPrompt(userId, promptText);
        }
    },

    async getPrompts(userId: string): Promise<StoredPrompt[]> {
        if (supabase) {
            const { data, error } = await supabase
                .from('prompts')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false });

            if (error) {
                if (error.code === 'PGRST205' || error.message.includes('relation "public.prompts" does not exist')) {
                     if (typeof localStorage !== 'undefined') {
                        const prompts = JSON.parse(localStorage.getItem(PROMPTS_KEY) || '[]');
                        return prompts.filter((p: StoredPrompt) => p.user_id === userId);
                    }
                }
                console.error("Supabase Prompt Fetch Error:", JSON.stringify(error, null, 2));
                return [];
            }
            return data || [];
        } else if (typeof localStorage !== 'undefined') {
            const prompts = JSON.parse(localStorage.getItem(PROMPTS_KEY) || '[]');
            return prompts.filter((p: StoredPrompt) => p.user_id === userId);
        }
        return [];
    },

    // --- STATS AGGREGATION ---
    async getStats(userId: string) {
        const trips = await this.getTrips(userId);
        
        // Calculate Total Spend (naive parsing)
        let totalSpend = 0;
        trips.forEach(t => {
            if (t.total_cost) {
                const costString = t.total_cost.replace(/[^0-9.]/g, '');
                const cost = parseFloat(costString);
                if (!isNaN(cost)) totalSpend += cost;
            }
        });

        const cities = new Set(trips.map(t => t.destination)).size;

        return {
            totalSpend: Math.round(totalSpend),
            tripCount: trips.length,
            citiesVisited: cities,
            recentTrips: trips.slice(0, 2)
        };
    }
};
