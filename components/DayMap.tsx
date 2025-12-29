import React from 'react';
import { GoogleMap, Marker, Polyline, useJsApiLoader } from '@react-google-maps/api';
import { MapPin, Navigation } from 'lucide-react';

interface LocationPoint {
    name: string;
    lat: number;
    lng: number;
    type?: 'activity' | 'hotel' | 'dining' | 'transport';
}

interface DayMapProps {
    locations: LocationPoint[];
    height?: string;
    showRoute?: boolean;
}

// Dark theme map style matching Voyageur's aesthetic
const darkMapStyle = [
    { elementType: 'geometry', stylers: [{ color: '#1a1a1a' }] },
    { elementType: 'labels.text.stroke', stylers: [{ color: '#1a1a1a' }] },
    { elementType: 'labels.text.fill', stylers: [{ color: '#746855' }] },
    { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#2c2c2c' }] },
    { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#1a1a1a' }] },
    { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#3c3c3c' }] },
    { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0e1626' }] },
    { featureType: 'poi', elementType: 'geometry', stylers: [{ color: '#1a1a1a' }] },
    { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: '#1a2e1a' }] },
];

const mapContainerStyle = {
    width: '100%',
    borderRadius: '8px',
};

export const DayMap: React.FC<DayMapProps> = ({
    locations,
    height = '280px',
    showRoute = true
}) => {
    const { isLoaded, loadError } = useJsApiLoader({
        googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
    });

    // No locations to show
    if (!locations || locations.length === 0) {
        return (
            <div className="bg-zinc-900/50 border border-white/10 rounded-lg p-8 text-center">
                <MapPin className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
                <p className="text-zinc-500 text-sm">No locations to display</p>
            </div>
        );
    }

    // API not loaded or error
    if (loadError) {
        return (
            <div className="bg-zinc-900/50 border border-red-500/20 rounded-lg p-8 text-center">
                <p className="text-red-400 text-sm">Failed to load map</p>
            </div>
        );
    }

    if (!isLoaded) {
        return (
            <div
                className="animate-pulse bg-zinc-800 rounded-lg flex items-center justify-center"
                style={{ height }}
            >
                <MapPin className="w-8 h-8 text-zinc-600 animate-bounce" />
            </div>
        );
    }

    // Create path for polyline
    const path = locations.map(loc => ({ lat: loc.lat, lng: loc.lng }));

    // Calculate center as average of all points
    const center = {
        lat: locations.reduce((sum, loc) => sum + loc.lat, 0) / locations.length,
        lng: locations.reduce((sum, loc) => sum + loc.lng, 0) / locations.length,
    };

    // Get marker color based on type
    const getMarkerIcon = (type?: string) => {
        const colors: Record<string, string> = {
            hotel: '#f97316', // orange
            dining: '#22c55e', // green
            activity: '#22d3ee', // cyan
            transport: '#a855f7', // purple
        };
        return colors[type || 'activity'] || '#22d3ee';
    };

    return (
        <div className="rounded-lg overflow-hidden border border-white/10">
            <GoogleMap
                mapContainerStyle={{ ...mapContainerStyle, height }}
                center={center}
                zoom={14}
                options={{
                    styles: darkMapStyle,
                    disableDefaultUI: true,
                    zoomControl: true,
                    mapTypeControl: false,
                    streetViewControl: false,
                    fullscreenControl: true,
                }}
            >
                {/* Markers for each location */}
                {locations.map((loc, idx) => (
                    <Marker
                        key={idx}
                        position={{ lat: loc.lat, lng: loc.lng }}
                        title={loc.name}
                        label={{
                            text: String(idx + 1),
                            color: '#000',
                            fontWeight: 'bold',
                            fontSize: '12px',
                        }}
                    />
                ))}

                {/* Route polyline connecting locations */}
                {showRoute && locations.length > 1 && (
                    <Polyline
                        path={path}
                        options={{
                            strokeColor: '#22d3ee',
                            strokeOpacity: 0.8,
                            strokeWeight: 3,
                            geodesic: true,
                        }}
                    />
                )}
            </GoogleMap>
        </div>
    );
};

// ==========================================
// HELPER FUNCTIONS FOR DEEP LINKS (FREE!)
// ==========================================

/**
 * Generate Google Maps directions deep link
 * Opens in Google Maps app/website with route
 */
export const getDirectionsLink = (
    from: { lat: number; lng: number } | string,
    to: { lat: number; lng: number } | string,
    mode: 'driving' | 'walking' | 'transit' | 'bicycling' = 'driving'
): string => {
    const origin = typeof from === 'string' ? encodeURIComponent(from) : `${from.lat},${from.lng}`;
    const destination = typeof to === 'string' ? encodeURIComponent(to) : `${to.lat},${to.lng}`;

    return `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&travelmode=${mode}`;
};

/**
 * Generate Google Maps search deep link for a place
 * Opens in Google Maps with the place highlighted
 */
export const getPlaceLink = (placeName: string, city?: string): string => {
    const query = city ? `${placeName} ${city}` : placeName;
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
};

/**
 * Generate Google Maps link for coordinates
 */
export const getCoordinatesLink = (lat: number, lng: number, label?: string): string => {
    if (label) {
        return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
    }
    return `https://www.google.com/maps/@${lat},${lng},15z`;
};

export default DayMap;
