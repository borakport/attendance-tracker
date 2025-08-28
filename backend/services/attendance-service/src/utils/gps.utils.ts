interface Coordinates {
  latitude: number;
  longitude: number;
}

export class GPSUtils {
  /**
   * Calculate distance between two GPS coordinates using Haversine formula
   * @returns Distance in meters
   */
  static calculateDistance(point1: Coordinates, point2: Coordinates): number {
    const R = 6371000; // Earth's radius in meters
    const lat1Rad = this.toRadians(point1.latitude);
    const lat2Rad = this.toRadians(point2.latitude);
    const deltaLat = this.toRadians(point2.latitude - point1.latitude);
    const deltaLon = this.toRadians(point2.longitude - point1.longitude);

    const a =
      Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
      Math.cos(lat1Rad) * Math.cos(lat2Rad) *
      Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  /**
   * Check if coordinates are within radius
   */
  static isWithinRadius(
    userCoords: Coordinates,
    centerCoords: Coordinates,
    radiusMeters: number
  ): boolean {
    const distance = this.calculateDistance(userCoords, centerCoords);
    return distance <= radiusMeters;
  }

  /**
   * Validate GPS coordinates
   */
  static validateCoordinates(coords: Coordinates): boolean {
    const { latitude, longitude } = coords;
    return (
      latitude >= -90 && latitude <= 90 &&
      longitude >= -180 && longitude <= 180
    );
  }

  /**
   * Convert degrees to radians
   */
  private static toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  /**
   * Generate random coordinates within radius (for testing)
   */
  static generateRandomCoordinates(
    center: Coordinates,
    radiusMeters: number
  ): Coordinates {
    // Convert radius from meters to degrees
    const radiusInDegrees = radiusMeters / 111000;

    const u = Math.random();
    const v = Math.random();
    const w = radiusInDegrees * Math.sqrt(u);
    const t = 2 * Math.PI * v;
    const x = w * Math.cos(t);
    const y = w * Math.sin(t);

    // Adjust the x-coordinate for the shrinking of the east-west distances
    const newX = x / Math.cos(this.toRadians(center.latitude));

    return {
      latitude: center.latitude + y,
      longitude: center.longitude + newX,
    };
  }

  /**
   * Format coordinates for display
   */
  static formatCoordinates(coords: Coordinates): string {
    return `${coords.latitude.toFixed(6)}, ${coords.longitude.toFixed(6)}`;
  }
}
