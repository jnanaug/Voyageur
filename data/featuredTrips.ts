
import { TripItinerary } from '../types';

export const FEATURED_TRIPS: { id: string; title: string; subtitle: string; image: string; color: string; itinerary: TripItinerary }[] = [
    {
        id: 'feat_tokyo_cyber',
        title: "NEON DRIFT",
        subtitle: "TOKYO, JAPAN",
        image: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&q=80",
        color: "cyan",
        itinerary: {
            destination: "Tokyo, Japan",
            duration: "7 Days",
            totalEstimatedCost: "₹2,45,000",
            summary: "A high-octane journey through the electric streets of Tokyo, blending cyberpunk aesthetics with ancient tradition. From the neon canyons of Shinjuku to the digital frontiers of Akihabara.",
            travelOptions: [
                { type: "FLIGHT", provider: "JAL", departureTime: "22:00", arrivalTime: "06:00", duration: "9h", price: "₹65,000", departureLocation: "DEL", arrivalLocation: "HND", bookingLink: "https://www.jal.co.jp" },
                { type: "FLIGHT", provider: "ANA", departureTime: "18:00", arrivalTime: "04:00", duration: "10h", price: "₹72,000", departureLocation: "BOM", arrivalLocation: "NRT", bookingLink: "https://www.ana.co.jp" }
            ],
            accommodation: [
                { name: "Park Hyatt Tokyo", type: "Luxury", rating: "5.0", pricePerNight: "₹45,000", location: "Shinjuku", description: "Lost in Translation vibes with panoramic city views.", amenities: ["Pool", "Spa", "Jazz Bar"], imageUrl: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&q=80", checkInTime: "15:00", bookingLink: "https://hyatt.com" },
                { name: "Hotel Gajoen", type: "Boutique", rating: "4.8", pricePerNight: "₹35,000", location: "Meguro", description: "A museum-like hotel showcasing traditional Japanese art.", amenities: ["Garden", "Art Tour"], imageUrl: "https://images.unsplash.com/photo-1493996687846-48a38c8d2452?auto=format&fit=crop&q=80", checkInTime: "15:00", bookingLink: "https://hotelgajoen-tokyo.com" }
            ],
            days: [
                {
                    day: "Day 1", theme: "Arrival & Neon", activities: [
                        { time: "18:00", title: "Shinjuku Night Walk", description: "Explore the neon-lit Kabukicho district.", estimatedCost: "₹0", bookingRequired: false, location: "Shinjuku" },
                        { time: "20:00", title: "Omoide Yokocho Dinner", description: "Yakitori in Memory Lane.", estimatedCost: "₹3,000", bookingRequired: false, location: "Shinjuku" }
                    ]
                },
                {
                    day: "Day 2", theme: "Digital Art", activities: [
                        { time: "10:00", title: "TeamLab Planets", description: "Immersive digital art installation.", estimatedCost: "₹2,500", bookingRequired: true, location: "Toyosu" },
                        { time: "14:00", title: "Akihabara Tech Dive", description: "Retro gaming and electronics hunting.", estimatedCost: "₹5,000", bookingRequired: false, location: "Akihabara" }
                    ]
                },
                {
                    day: "Day 3", theme: "Cyberpunk Aesthetics", activities: [
                        { time: "11:00", title: "Nakagin Capsule Tower", description: "Witness the remains of metabolic architecture.", estimatedCost: "₹0", bookingRequired: false, location: "Ginza" },
                        { time: "19:00", title: "Daikoku Parking Area", description: "Underground car meet culture (Friday/Saturday nights).", estimatedCost: "₹5,000 (Taxi)", bookingRequired: false, location: "Yokohama" }
                    ]
                }
            ]
        }
    },
    {
        id: 'feat_iceland_void',
        title: "THE VOID",
        subtitle: "ICELAND",
        image: "https://images.unsplash.com/photo-1476610182048-b716b8518aae?auto=format&fit=crop&q=80",
        color: "emerald",
        itinerary: {
            destination: "Reykjavik, Iceland",
            duration: "5 Days",
            totalEstimatedCost: "₹3,10,000",
            summary: "Escape to the edge of the world. Glaciers, volcanoes, and the silence of the north. A tactical retreat into absolute nature.",
            travelOptions: [
                { type: "FLIGHT", provider: "Finnair", departureTime: "08:00", arrivalTime: "16:00", duration: "11h", price: "₹85,000", departureLocation: "DEL", arrivalLocation: "KEF", bookingLink: "https://finnair.com" }
            ],
            accommodation: [
                { name: "The Retreat at Blue Lagoon", type: "Luxury", rating: "5.0", pricePerNight: "₹1,20,000", location: "Grindavik", description: "Suites built directly into volcanic earth and geothermal waters.", amenities: ["Private Lagoon", "Spa"], imageUrl: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&q=80", checkInTime: "15:00", bookingLink: "https://bluelagoon.com" },
                { name: "Ion Adventure Hotel", type: "Design", rating: "4.7", pricePerNight: "₹40,000", location: "Selfoss", description: "Northern lights viewing platform on a lava flow.", amenities: ["Bar", "Pool"], imageUrl: "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&q=80", checkInTime: "15:00", bookingLink: "https://ioniceland.is" }
            ],
            days: [
                {
                    day: "Day 1", theme: "Ice & Fire", activities: [
                        { time: "14:00", title: "Blue Lagoon Access", description: "Decompress in geothermal silica waters.", estimatedCost: "₹12,000", bookingRequired: true, location: "Grindavik" },
                        { time: "20:00", title: "Moss Restaurant", description: "New Nordic cuisine with volcanic views.", estimatedCost: "₹15,000", bookingRequired: true, location: "Grindavik" }
                    ]
                },
                {
                    day: "Day 2", theme: "Golden Circle", activities: [
                        { time: "09:00", title: "Thingvellir National Park", description: "Walk between tectonic plates.", estimatedCost: "₹2,000", bookingRequired: false, location: "Thingvellir" },
                        { time: "13:00", title: "Geysir Geothermal Area", description: "Witness the Strokkur geyser eruption.", estimatedCost: "₹0", bookingRequired: false, location: "Geysir" }
                    ]
                },
                {
                    day: "Day 3", theme: "Glacial Force", activities: [
                        { time: "10:00", title: "Sólheimajökull Hike", description: "Guided glacier trek with ice axes.", estimatedCost: "₹10,000", bookingRequired: true, location: "Sólheimajökull" },
                        { time: "15:00", title: "Black Sand Beach", description: "Reynisfjara's basalt columns.", estimatedCost: "₹0", bookingRequired: false, location: "Vik" }
                    ]
                }
            ]
        }
    },
    {
        id: 'feat_cairo_sands',
        title: "ETERNAL SANDS",
        subtitle: "CAIRO, EGYPT",
        image: "https://images.unsplash.com/photo-1503177119275-0aa32b3a9368?auto=format&fit=crop&q=80",
        color: "orange",
        itinerary: {
            destination: "Cairo, Egypt",
            duration: "6 Days",
            totalEstimatedCost: "₹1,80,000",
            summary: "Walk among gods. A historical deep-dive into the cradle of civilization, exploring tombs, temples, and the chaotic energy of Cairo.",
            travelOptions: [
                { type: "FLIGHT", provider: "Emirates", departureTime: "10:00", arrivalTime: "18:00", duration: "9h", price: "₹55,000", departureLocation: "BOM", arrivalLocation: "CAI", bookingLink: "https://emirates.com" }
            ],
            accommodation: [
                { name: "Marriott Mena House", type: "Historic", rating: "4.9", pricePerNight: "₹30,000", location: "Giza", description: "Breakfast with a direct view of the Pyramids.", amenities: ["Gardens", "Golf"], imageUrl: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80", checkInTime: "14:00", bookingLink: "https://marriott.com" }
            ],
            days: [
                {
                    day: "Day 1", theme: "The Pyramids", activities: [
                        { time: "08:00", title: "Giza Plateau Private Tour", description: "Great Pyramid and Sphinx with Egyptologist.", estimatedCost: "₹8,000", bookingRequired: true, location: "Giza" },
                        { time: "13:00", title: "Khufu's Boat Museum", description: "Ancient solar barge.", estimatedCost: "₹2,000", bookingRequired: false, location: "Giza" }
                    ]
                },
                {
                    day: "Day 2", theme: "City of the Dead", activities: [
                        { time: "10:00", title: "Egyptian Museum", description: "Tutankhamun's treasures.", estimatedCost: "₹3,000", bookingRequired: false, location: "Tahrir" },
                        { time: "16:00", title: "Khan el-Khalili", description: "Sunset shopping in the medieval souk.", estimatedCost: "₹0", bookingRequired: false, location: "Islamic Cairo" }
                    ]
                }
            ]
        }
    }
];
