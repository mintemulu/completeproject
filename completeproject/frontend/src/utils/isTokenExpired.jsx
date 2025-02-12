import { jwtDecode } from "jwt-decode";

export function formatTime(timestamp) {
  const date = new Date(timestamp * 1000);
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  return `${hours}:${minutes}`;
}

export function isTokenExpired(token) {
  if (token) {
    const decodedToken = jwtDecode(token);
    const currentTimeUTC = Math.floor(Date.now() / 1000); // Current time in UTC
    const expirationTimeUTC = decodedToken.exp;

    const expirationTimeFormatted = formatTime(expirationTimeUTC);
    const currentLocalTimeFormatted = formatTime(currentTimeUTC);
    console.log(expirationTimeFormatted);
    console.log(currentLocalTimeFormatted);

    // If expirationTimeUTC is less than currentTimeUTC, sign user out
    return expirationTimeUTC < currentTimeUTC;
  } else {
    // If no token provided, consider it as expired
    return true;
  }
}
