interface Coordinates {
  latitude: number;
  longitude: number;
}

/**
 * Calculates the Haversine distance between two coordinates in kilometers
 * @param coords1 First coordinate (latitude, longitude)
 * @param coords2 Second coordinate (latitude, longitude)
 * @returns Distance in kilometers
 */
export const calculateHaversineDistance = (coords1: Coordinates, coords2: Coordinates): number => {
  const toRad = (value: number) => (value * Math.PI) / 180;
  const R = 6371; // Earth's radius in kilometers

  const dLat = toRad(coords2.latitude - coords1.latitude);
  const dLon = toRad(coords2.longitude - coords1.longitude);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(coords1.latitude)) * Math.cos(toRad(coords2.latitude)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return distance;
};