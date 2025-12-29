/**
 * Geolocation Service
 * Uses browser's Geolocation API to get user's current position
 * and reverse geocode to get city/location name
 */

export interface UserLocation {
    lat: number;
    lng: number;
    city?: string;
    country?: string;
    formatted?: string; // Full formatted address
}

/**
 * Get user's current location using browser Geolocation API
 * Returns coordinates and optionally reverse-geocoded address
 */
export const getCurrentLocation = (): Promise<UserLocation | null> => {
    return new Promise((resolve) => {
        // Check if geolocation is supported
        if (!navigator.geolocation) {
            console.warn('⚠️ Geolocation not supported by browser');
            resolve(null);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                console.log('📍 Got coordinates:', latitude, longitude);

                const location: UserLocation = {
                    lat: latitude,
                    lng: longitude,
                };

                // Try to reverse geocode using free service
                try {
                    const cityName = await reverseGeocode(latitude, longitude);
                    if (cityName) {
                        location.city = cityName.city;
                        location.country = cityName.country;
                        location.formatted = cityName.formatted;
                    }
                } catch (e) {
                    console.warn('Reverse geocoding failed:', e);
                }

                resolve(location);
            },
            (error) => {
                console.warn('⚠️ Geolocation error:', error.message);
                resolve(null);
            },
            {
                enableHighAccuracy: false, // Faster, less battery
                timeout: 10000, // 10 seconds
                maximumAge: 300000 // Cache for 5 minutes
            }
        );
    });
};

/**
 * Reverse geocode coordinates to get city name
 * Uses free OpenStreetMap Nominatim API
 */
const reverseGeocode = async (lat: number, lng: number): Promise<{ city: string; country: string; formatted: string } | null> => {
    try {
        // Using OpenStreetMap Nominatim (free, no API key needed)
        const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10`,
            {
                headers: {
                    'User-Agent': 'Voyageur Travel App'
                }
            }
        );

        if (!response.ok) {
            throw new Error('Geocoding failed');
        }

        const data = await response.json();

        // Extract city from address
        const address = data.address || {};
        const city = address.city || address.town || address.village || address.county || address.state || 'Unknown';
        const country = address.country || '';

        return {
            city,
            country,
            formatted: `${city}, ${country}`
        };
    } catch (error) {
        console.error('Reverse geocoding error:', error);
        return null;
    }
};

/**
 * Check if location permission is granted
 */
export const checkLocationPermission = async (): Promise<'granted' | 'denied' | 'prompt'> => {
    if (!navigator.permissions) {
        return 'prompt'; // Fallback for browsers without permissions API
    }

    try {
        const result = await navigator.permissions.query({ name: 'geolocation' });
        return result.state;
    } catch {
        return 'prompt';
    }
};

export default {
    getCurrentLocation,
    checkLocationPermission
};
