// serviceDurations.js
// Export a mapping of service (lowercased) -> duration in minutes.
// Add or tune durations as you like.
export const SERVICE_DURATIONS = {
  haircut: 20,
  "hair cut": 20,
  "beard trim": 15,
  "hot towel shave": 30,
  facial: 40,
  "body massage": 60,
  manicure: 30,
  pedicure: 30,
  "full body massage": 90,
  // fallback duration used if service not found
  default: 20,
};
