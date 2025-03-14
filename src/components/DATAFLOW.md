# Weather Dashboard Data Flow

## Data Sources

The application retrieves weather data from the following sources:

1. **OpenWeatherMap API** - Primary source for current weather conditions
   - Endpoint: https://api.openweathermap.org/data/2.5/weather
   - Data retrieved: temperature, precipitation, wind, and general conditions
   - Authentication: API key

2. **Static Historical Data** - Stored in `weatherUtils.js` as `cityData`
   - Used for historical comparisons and trends
   - Includes average temperatures, precipitation patterns, and climate trends per city

## Data Transformation

Raw API data is transformed into a standardized format through `fetchRealWeatherData()` in `weatherDataUtils.js`:

1. API response → normalized data model
2. Unit conversions (metric → imperial if needed)
3. Data enrichment with calculated fields (UV index, historical comparisons)
4. Structure organization into `daily`, `hourly`, `historical`, and `historicalRanges` objects

## Component Hierarchy and Data Flow

```
WeatherDashboard
├── state: location, weatherData, ui, preferences
├── → WeatherHeader
│   ├── props: location, currentWeather, actions
│   └── state: menuOpen
├── → WeatherChart
│   ├── props: chartData, metrics
│   └── memoized processing: data transformation
└── → WeatherCards
    ├── props: dailyData, unit, selected, actions
    └── → WeatherCard (individual) [React.memo]
        └── props: day, historicalRange, unit, metrics
```

## State Management

- **WeatherDashboard**: Central state manager using React's useReducer
  - Location and user preferences
  - Weather data and loading states
  - UI interaction states

- **Component-level State**: Used for UI-specific concerns only
  - Dropdown visibility
  - Local selection states

## Data Validation

Data is validated at several points:
1. API response validation in `weatherDataUtils.js`
2. Null/undefined checks in rendering components
3. PropTypes validation for component props
4. Default values provided for all optional data

## Error Handling

1. API errors are caught and processed in `fetchRealWeatherData()`
2. Application-wide error boundaries catch rendering errors
3. Data loading errors are displayed in UI with retry options

## Data Flow Sequence

1. User selects a location or requests geolocation
2. WeatherDashboard triggers API request via fetchRealWeatherData()
3. API response is transformed into consistent format
4. Data is stored in WeatherDashboard state
5. Data is passed to child components via props
6. Child components render data with appropriate formatting
7. User interactions trigger state changes in WeatherDashboard
8. Updated state flows down to components to reflect changes

## Weather Data Structure

```javascript
{
  daily: [
    {
      id: "day1",
      day: "Monday",
      date: "2023-03-13",
      tempHigh: 75,
      tempLow: 55,
      precipitation: { chance: 20 },
      uvIndex: 6,
      wind: { speed: 10, direction: "NE" },
      icon: "sun"
    },
    // More daily entries...
  ],
  hourly: [
    // Hourly data structure (similar to daily)
  ],
  historical: [
    // Historical weather data
  ],
  historicalRanges: [
    {
      dayId: "day1",
      temperature: { min: 50, max: 80, avg: 65 },
      precipitation: { min: 10, max: 40, avg: 25 },
      anomalies: {
        temp: true,
        tempType: "hot",
        precip: false
      }
    }
    // More historical ranges...
  ]
}
```