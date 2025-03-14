# National Weather Service API Reference

This document provides a reference for the National Weather Service (NWS) API capabilities integrated in the Weather Dashboard.

## API Overview
The NWS API allows developers to access critical forecasts, alerts, and observations along with other weather data. The API is designed with a cache-friendly approach that expires content based on the information lifecycle and uses JSON-LD format for machine data discovery.

- Base URL: `https://api.weather.gov`
- Format: JSON-LD
- Authentication: None required
- Rate Limiting: Yes, but limits are generous

## Main Endpoints

### Points
```
/points/{latitude},{longitude}
```
This is the entry point for the API. It returns metadata about a location, including office, grid coordinates, and URLs for forecast data.

**Example:**
```
https://api.weather.gov/points/39.7456,-97.0892
```

### Gridpoints
```
/gridpoints/{office}/{grid X},{grid Y}
```
Returns raw forecast data for a specific grid point in a forecast office's area.

**Example:**
```
https://api.weather.gov/gridpoints/TOP/31,80
```

### Forecast
```
/gridpoints/{office}/{grid X},{grid Y}/forecast
```
Returns a human-readable forecast for a specific grid point.

**Example:**
```
https://api.weather.gov/gridpoints/TOP/31,80/forecast
```

### Hourly Forecast
```
/gridpoints/{office}/{grid X},{grid Y}/forecast/hourly
```
Returns an hour-by-hour forecast for a specific grid point.

**Example:**
```
https://api.weather.gov/gridpoints/TOP/31,80/forecast/hourly
```

### Stations
```
/stations
```
Returns a list of observation stations.

**Example:**
```
https://api.weather.gov/stations
```

### Station Observations
```
/stations/{station}/observations
```
Returns observations from a specific station.

**Example:**
```
https://api.weather.gov/stations/KJFK/observations
```

### Alerts
```
/alerts
```
Returns active weather alerts and warnings.

**Example:**
```
https://api.weather.gov/alerts/active
```

## Available Data Properties

The NWS API provides a wide range of weather data properties, including:

### Temperature Related
- `temperature` - Current temperature
- `maxTemperature` - Maximum temperature
- `minTemperature` - Minimum temperature
- `apparentTemperature` - "Feels like" temperature
- `heatIndex` - Heat index value
- `windChill` - Wind chill value

### Precipitation Related
- `probabilityOfPrecipitation` - Chance of precipitation
- `quantitativePrecipitation` - Amount of precipitation
- `snowfallAmount` - Amount of snowfall
- `iceAccumulation` - Amount of ice accumulation
- `precipitation` - Recent precipitation

### Wind Related
- `windSpeed` - Wind speed
- `windDirection` - Wind direction in degrees
- `windGust` - Wind gust speed

### Atmospheric Conditions
- `barometricPressure` - Atmospheric pressure
- `dewpoint` - Dewpoint temperature
- `relativeHumidity` - Relative humidity percentage
- `visibility` - Visibility distance

### Cloud/Sky Conditions
- `skyCover` - Percentage of sky covered by clouds
- `ceilingHeight` - Height of cloud ceiling

### Hazard Conditions
- `thunderstormProbability` - Probability of thunderstorms
- `lightningActivityLevel` - Level of lightning activity
- `hazards` - Weather hazards

## Integration in the Weather Dashboard

Our application uses these endpoints in the following way:

1. First, we call the `/points/{lat},{lon}` endpoint with user location
2. From the response, we extract the forecast office and grid coordinates
3. We then call the forecast endpoint for human-readable forecasts
4. The data is transformed into a consistent format used by our UI components

### Example Request Flow

```javascript
// Step 1: Convert location to NWS grid
GET https://api.weather.gov/points/47.6062,-122.3321

// Step 2: Get forecast using grid from response
GET https://api.weather.gov/gridpoints/SEW/124,67/forecast
```

## Data Usage Best Practices

1. Cache responses according to the expiration headers
2. Handle null values for some properties
3. Use proper error handling for API failures
4. Respect rate limits and implement exponential backoff
5. Include a User-Agent header with your contact information

## Resources

- [NWS API Documentation](https://www.weather.gov/documentation/services-web-api)
- [NWS API Community Docs](https://weather-gov.github.io/api/)
- [NWS API GitHub Repository](https://github.com/weather-gov/api)