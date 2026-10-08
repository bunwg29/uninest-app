const EARTH_RADIUS_METERS = 6_371_000;

const toRadians = (degrees: number) => (degrees * Math.PI) / 180;

export const haversineMeters = (
  from: { latitude: number; longitude: number },
  to: { latitude: number; longitude: number }
) => {
  const deltaLatitude = toRadians(to.latitude - from.latitude);
  const deltaLongitude = toRadians(to.longitude - from.longitude);
  const a =
    Math.sin(deltaLatitude / 2) ** 2 +
    Math.cos(toRadians(from.latitude)) *
      Math.cos(toRadians(to.latitude)) *
      Math.sin(deltaLongitude / 2) ** 2;

  return 2 * EARTH_RADIUS_METERS * Math.asin(Math.sqrt(a));
};

export const estimateWalkingMinutes = (meters: number) => Math.max(1, Math.round(meters / 80));

export const WALKING_DISTANCE_LIMIT_METERS = 1000;

export const estimateMotorbikeMinutes = (meters: number) => Math.max(1, Math.round(meters / 300));

export const formatTravelEstimate = (meters: number) =>
  meters < WALKING_DISTANCE_LIMIT_METERS
    ? `~${estimateWalkingMinutes(meters)} phút đi bộ`
    : `~${estimateMotorbikeMinutes(meters)} phút xe máy`;
