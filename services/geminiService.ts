
import { GoogleGenAI, Type } from "@google/genai";
import { TripItinerary, DiningRecommendation } from "../types";

const createClient = () => {
    // Check env first
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

    // Check if the user hasn't pasted the key yet (still has the placeholder)
    if (!apiKey || apiKey.includes("PASTE_YOUR")) {
        console.error("API_KEY is missing. Please check .env");
        throw new Error("API Key is missing. Please add VITE_GEMINI_API_KEY to .env");
    }
    return new GoogleGenAI({ apiKey });
};

const cleanJson = (text: string) => {
    return text.replace(/^```json\s*/, '').replace(/^```\s*/, '').replace(/\s*```$/, '');
};

const sanitizeItinerary = (data: any): TripItinerary => {
    return {
        ...data,
        travelOptions: Array.isArray(data.travelOptions) ? data.travelOptions : [],
        accommodation: Array.isArray(data.accommodation) ? data.accommodation : [],
        days: Array.isArray(data.days) ? data.days.map((day: any) => ({
            ...day,
            activities: Array.isArray(day.activities) ? day.activities : []
        })) : []
    };
};

export const generateItinerary = async (
    prompt: string,
    startingLocation?: string,
    preferences?: { dietary?: string; luxury?: number }
): Promise<TripItinerary> => {
    const ai = createClient();

    // Build context with starting location if available
    const locationContext = startingLocation
        ? `The traveler is starting from ${startingLocation}. Plan travel options FROM ${startingLocation} TO the destination.`
        : '';

    // Build preference context
    const luxuryTierMap: { [key: number]: string } = {
        1: 'budget-friendly hostels and guesthouses (1-2 star)',
        2: 'economy hotels with basic amenities (2-3 star)',
        3: 'comfortable mid-range hotels (3-4 star)',
        4: 'premium hotels with excellent service (4-5 star)',
        5: 'luxury 5-star resorts and boutique experiences only'
    };

    const preferenceContext = preferences ? `
    TRAVELER PREFERENCES (IMPORTANT - FOLLOW THESE):
    ${preferences.dietary && preferences.dietary !== 'None' ? `- DIETARY RESTRICTION: ${preferences.dietary}. ALL restaurant and dining recommendations MUST be ${preferences.dietary}-friendly. Do NOT suggest any non-${preferences.dietary} food options.` : ''}
    ${preferences.luxury ? `- ACCOMMODATION PREFERENCE: Suggest ONLY ${luxuryTierMap[preferences.luxury]}. Match restaurant and activity recommendations to this budget level.` : ''}
    ` : '';

    // Retry logic for 503 (Overloaded) and 429 (Rate Limit)
    const retryWithBackoff = async <T>(fn: () => Promise<T>, retries = 3, delay = 1000): Promise<T> => {
        try {
            return await fn();
        } catch (error: any) {
            if (retries > 0 && (error?.message?.includes('503') || error?.message?.includes('429') || error?.status === 503)) {
                console.warn(`API Overloaded. Retrying in ${delay}ms... (${retries} attempts left)`);
                await new Promise(resolve => setTimeout(resolve, delay));
                return retryWithBackoff(fn, retries - 1, delay * 2);
            }
            throw error;
        }
    };

    const response = await retryWithBackoff(() => ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `Plan a comprehensive logistical trip based on: "${prompt}". 
        ${locationContext}
        ${preferenceContext}
        Act as a high-end travel agent. You MUST populate all arrays with data. Do NOT return empty arrays.
        1. 3 distinct Travel Options to get TO the destination (e.g. Flight, Train, Bus/Car).${startingLocation ? ` All travel options should depart FROM ${startingLocation}.` : ''}
        2. 4 Accommodation options (Hotels/Resorts) ranging from boutique to luxury.
        3. A detailed day-by-day itinerary matching the duration. EVERY step includes 'transitFromPrev' explaining exactly how to move from the previous location to the current one.
        4. CRITICAL: All prices and costs MUST be in Indian Rupees (INR). Use the ₹ symbol for all currency values.
        5. Provide precise latitude and longitude coordinates for the destination and for EACH activity location.
        6. CRITICAL TIME REQUIREMENTS:
           - Each activity MUST have an EXACT start time in 24-hour format (e.g., "09:00", "14:30", "19:00")
           - Do NOT use vague terms like "morning", "afternoon", "evening", "night"
           - Activities MUST NOT overlap - ensure each activity ends before the next one starts
           - Include realistic durations - breakfast (1 hour), lunch (1.5 hours), sightseeing (2-3 hours), dinner (2 hours)
           - Schedule activities sequentially with proper gaps for travel between locations
        7. CRITICAL TRAVEL TIME REQUIREMENTS for 'transitFromPrev':
           - Calculate ACCURATE travel times based on the actual distance between locations
           - Consider city traffic conditions and typical travel speeds
           - Provide specific durations like "25 mins", "45 mins", "1 hour 10 mins" - NOT rounded to 15 or 20 mins
           - Walking (5 km/h), Auto/Rickshaw in city (15-20 km/h with traffic), Taxi (25-30 km/h), Bus (20 km/h)
           - Be realistic: 2 km walk = 25 mins, 5 km auto = 20 mins, 10 km taxi = 25 mins
        
        Strictly follow the JSON schema.`,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    destination: { type: Type.STRING },
                    duration: { type: Type.STRING },
                    totalEstimatedCost: { type: Type.STRING },
                    summary: { type: Type.STRING },
                    coordinates: {
                        type: Type.OBJECT,
                        properties: {
                            lat: { type: Type.NUMBER },
                            lon: { type: Type.NUMBER }
                        }
                    },
                    travelOptions: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                type: { type: Type.STRING, enum: ["FLIGHT", "TRAIN", "BUS", "CAR"] },
                                provider: { type: Type.STRING },
                                departureTime: { type: Type.STRING },
                                arrivalTime: { type: Type.STRING },
                                duration: { type: Type.STRING },
                                price: { type: Type.STRING },
                                departureLocation: { type: Type.STRING },
                                arrivalLocation: { type: Type.STRING },
                                bookingLink: { type: Type.STRING }
                            }
                        }
                    },
                    accommodation: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                name: { type: Type.STRING },
                                type: { type: Type.STRING },
                                rating: { type: Type.STRING },
                                pricePerNight: { type: Type.STRING },
                                location: { type: Type.STRING },
                                description: { type: Type.STRING },
                                amenities: { type: Type.ARRAY, items: { type: Type.STRING } },
                                checkInTime: { type: Type.STRING },
                                imageUrl: { type: Type.STRING, description: "A keyword to search for an image of this hotel type" }
                            }
                        }
                    },
                    days: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                day: { type: Type.STRING },
                                theme: { type: Type.STRING },
                                activities: {
                                    type: Type.ARRAY,
                                    items: {
                                        type: Type.OBJECT,
                                        properties: {
                                            time: { type: Type.STRING },
                                            title: { type: Type.STRING },
                                            description: { type: Type.STRING },
                                            location: { type: Type.STRING },
                                            estimatedCost: { type: Type.STRING },
                                            bookingRequired: { type: Type.BOOLEAN },
                                            transitFromPrev: {
                                                type: Type.OBJECT,
                                                properties: {
                                                    mode: { type: Type.STRING },
                                                    duration: { type: Type.STRING },
                                                    cost: { type: Type.STRING },
                                                    instruction: { type: Type.STRING }
                                                },
                                                description: "How to get here from previous location"
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    },
                    dna: {
                        type: Type.OBJECT,
                        description: "Analyze the generated itinerary and rate it on these 4 axes. Scores MUST sum to exactly 100.",
                        properties: {
                            Adventure: { type: Type.NUMBER },
                            Luxury: { type: Type.NUMBER },
                            Culture: { type: Type.NUMBER },
                            Relaxation: { type: Type.NUMBER }
                        }
                    }
                }
            }
        }
    }));

    if (response.text) {
        try {
            const parsed = JSON.parse(cleanJson(response.text));
            return sanitizeItinerary(parsed);
        } catch (e) {
            console.error("Failed to parse itinerary JSON", e);
            throw new Error("Failed to parse itinerary");
        }
    }
    throw new Error("Failed to generate itinerary");
};

/**
 * Regenerate itinerary days based on selected travel and accommodation options
 * This creates an optimized itinerary considering arrival time and hotel location
 */
export const regenerateItineraryDays = async (
    baseItinerary: TripItinerary,
    selectedTravel: { arrivalTime: string; arrivalLocation: string; type: string } | null,
    selectedHotel: { name: string; location: string } | null
): Promise<TripItinerary> => {
    const ai = createClient();

    // Build context from selections
    const travelContext = selectedTravel
        ? `The traveler arrives at ${selectedTravel.arrivalLocation} at ${selectedTravel.arrivalTime} via ${selectedTravel.type}.`
        : '';

    const hotelContext = selectedHotel
        ? `They are staying at ${selectedHotel.name} located in ${selectedHotel.location}.`
        : '';

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `Regenerate ONLY the day-by-day itinerary for a trip to ${baseItinerary.destination} (${baseItinerary.duration}).
        
        ${travelContext}
        ${hotelContext}
        
        IMPORTANT CONTEXT:
        - Day 1 should start AFTER the arrival time (${selectedTravel?.arrivalTime || 'morning'})
        - Activities should be near the hotel location when possible
        - Plan activities that make sense given the hotel's area
        - Keep the same duration: ${baseItinerary.duration}
        
        CRITICAL TIME REQUIREMENTS:
        - Each activity MUST have an EXACT start time in 24-hour format (e.g., "09:00", "14:30", "19:00")
        - Do NOT use vague terms like "morning", "afternoon", "evening", "night"
        - Activities MUST NOT overlap
        - Include realistic durations and travel gaps
        
        All prices in INR (₹). Include coordinates for each activity.
        
        Return ONLY the days array with activities.`,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    days: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                day: { type: Type.STRING },
                                theme: { type: Type.STRING },
                                activities: {
                                    type: Type.ARRAY,
                                    items: {
                                        type: Type.OBJECT,
                                        properties: {
                                            time: { type: Type.STRING },
                                            title: { type: Type.STRING },
                                            description: { type: Type.STRING },
                                            location: { type: Type.STRING },
                                            estimatedCost: { type: Type.STRING },
                                            bookingRequired: { type: Type.BOOLEAN },
                                            coordinates: {
                                                type: Type.OBJECT,
                                                properties: {
                                                    lat: { type: Type.NUMBER },
                                                    lng: { type: Type.NUMBER }
                                                }
                                            },
                                            transitFromPrev: {
                                                type: Type.OBJECT,
                                                properties: {
                                                    mode: { type: Type.STRING },
                                                    duration: { type: Type.STRING },
                                                    cost: { type: Type.STRING },
                                                    instruction: { type: Type.STRING }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    });

    if (response.text) {
        try {
            const parsed = JSON.parse(cleanJson(response.text));
            // Merge regenerated days with base itinerary
            return {
                ...baseItinerary,
                days: parsed.days || baseItinerary.days
            };
        } catch (e) {
            console.error("Failed to parse regenerated itinerary JSON", e);
            throw new Error("Failed to regenerate itinerary");
        }
    }
    throw new Error("Failed to regenerate itinerary");
};

export const generateDiningOptions = async (prompt: string): Promise<DiningRecommendation[]> => {
    const ai = createClient();

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `Suggest 3 specific dining options/dishes based on this craving: "${prompt}".`,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        restaurantName: { type: Type.STRING },
                        cuisine: { type: Type.STRING },
                        dishName: { type: Type.STRING },
                        description: { type: Type.STRING },
                        price: { type: Type.STRING },
                        rating: { type: Type.STRING },
                        ambiance: { type: Type.STRING }
                    }
                }
            }
        }
    });

    if (response.text) {
        try {
            return JSON.parse(cleanJson(response.text)) as DiningRecommendation[];
        } catch (e) {
            console.error("Failed to parse dining JSON", e);
            throw new Error("Failed to parse dining options");
        }
    }
    throw new Error("Failed to generate dining options");
};

export const generateImage = async (prompt: string): Promise<string> => {
    try {
        const ai = createClient();
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-image",
            contents: {
                parts: [{ text: prompt }]
            }
        });

        for (const part of response.candidates?.[0]?.content?.parts || []) {
            if (part.inlineData) {
                return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
            }
        }
    } catch (e) {
        console.warn("Gemini Image Generation failed, falling back to default.", e);
    }

    return 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&q=80';
};

export interface TripAnalysis {
    isComplete: boolean;
    missingFields: string[];
    suggestions: {
        duration?: string[];
        budget?: string[];
        travelers?: string[];
        interests?: string[];
    };
    originalPrompt: string;
}

export const analyzeTripRequest = async (prompt: string): Promise<TripAnalysis> => {
    const ai = createClient();

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `Analyze this travel request: "${prompt}".
        Determine if it is missing critical information for a complete itinerary.
        Critical fields are: 
        1. Duration (how long?)
        2. Budget (low, medium, high?)
        3. Travelers (solo, couple, family?)
        4. Interests (adventure, food, culture, relaxation?)

        If missing, provide 3 specific, short options for the user to choose from for EACH missing field.
        Example options:
        - Duration: ["Weekend", "5 Days", "1 Week"]
        - Budget: ["Budget", "Comfort", "Luxury"]
        - Travelers: ["Solo", "Couple", "Group"]
        - Interests: ["Relaxation", "Adventure", "Culture"]

        Return JSON only.`,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    isComplete: { type: Type.BOOLEAN },
                    missingFields: { type: Type.ARRAY, items: { type: Type.STRING } },
                    suggestions: {
                        type: Type.OBJECT,
                        properties: {
                            duration: { type: Type.ARRAY, items: { type: Type.STRING } },
                            budget: { type: Type.ARRAY, items: { type: Type.STRING } },
                            travelers: { type: Type.ARRAY, items: { type: Type.STRING } },
                            interests: { type: Type.ARRAY, items: { type: Type.STRING } }
                        }
                    },
                    originalPrompt: { type: Type.STRING }
                }
            }
        }
    });

    if (response.text) {
        try {
            const result = JSON.parse(cleanJson(response.text));
            return { ...result, originalPrompt: prompt };
        } catch (e) {
            console.error("Analysis Parse Error", e);
        }
    }
    
    // Fallback if analysis fails (assume complete to unblock)
    return {
        isComplete: true,
        missingFields: [],
        suggestions: {},
        originalPrompt: prompt
    };
};
