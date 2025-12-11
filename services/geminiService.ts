
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

export const generateItinerary = async (prompt: string): Promise<TripItinerary> => {
    const ai = createClient();

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `Plan a comprehensive logistical trip based on: "${prompt}". 
        Act as a high-end travel agent. You must provide:
        1. 3 distinct Travel Options to get TO the destination (e.g. Flight, Train, Bus/Car).
        2. 4 Accommodation options (Hotels/Resorts) ranging from boutique to luxury.
        3. A detailed day-by-day itinerary where EVERY step includes 'transitFromPrev' explaining exactly how to move from the previous location to the current one.
        
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
                    }
                }
            }
        }
    });

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
