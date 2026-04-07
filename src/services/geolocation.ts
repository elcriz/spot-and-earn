export async function getCurrentLocation(): Promise<{
  latitude: number;
  longitude: number;
  accuracy: number;
} | null> {
  if (!navigator.geolocation) {
    console.log('Geolocation not supported');
    return null;
  }

  try {
    const position = await new Promise<GeolocationPosition>((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0,
      });
    });

    return {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      accuracy: position.coords.accuracy,
    };
  } catch (error) {
    console.log('Location not available:', error);
    return null;
  }
}

export function getMapUrl(latitude: number, longitude: number): string {
  return `https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}&zoom=15`;
}
