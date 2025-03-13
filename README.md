# React Weather Dashboard

An interactive React-based weather dashboard application with advanced visualization of weather data, historical trends, and statistical insights.

![Weather Dashboard Preview](https://i.ibb.co/HN4LD6q/weather-dashboard-preview.jpg)

## Features

- **Interactive Visualizations**: View weather data in 7-day, hourly, and historical formats with dynamic charts
- **Statistical Analysis**: Analyze weather patterns with percentile rankings, z-scores, and anomaly detection
- **Historical Comparisons**: Compare current forecasts with 20-year historical data
- **Multiple Locations**: Switch between different cities and view their specific weather patterns
- **Unit Conversion**: Toggle between Fahrenheit and Celsius temperature units
- **Customizable Display**: Show/hide different metrics (temperature, precipitation, UV index, wind)
- **Visual Anomaly Indicators**: Easily spot unusual weather patterns with visual indicators
- **Responsive Design**: Works on desktop and mobile devices

## Tech Stack

- **React**: Front-end UI library
- **Recharts**: Data visualization library for creating interactive charts
- **Lucide React**: Icon library for weather and UI elements
- **JavaScript/ES6+**: Modern JavaScript features
- **CSS**: Styling with modern CSS features

## Getting Started

### Prerequisites

- Node.js 14+ and npm installed on your machine

### Installation

1. Clone this repository:
   ```
   git clone https://github.com/needsupport/react-weather-dashboard.git
   cd react-weather-dashboard
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the development server:
   ```
   npm start
   ```

4. Open [http://localhost:3000](http://localhost:3000) to view the app in your browser.

## Project Structure

```
react-weather-dashboard/
├── public/                 # Static files
├── src/                    # Source files
│   ├── components/         # React components
│   │   ├── WeatherCard.js  # Weather card component
│   │   ├── WeatherChart.js # Chart visualization component
│   │   ├── WeatherHeader.js# Header with controls
│   │   ├── weatherUtils.js # Utility functions for weather data
│   │   └── weatherDataUtils.js # Data generation utilities
│   ├── App.js              # Main App component
│   ├── index.js            # Entry point
│   └── ...                 # Other files
└── ...
```

## Data Simulation

This app uses simulated weather data to demonstrate weather visualization capabilities. The data generation includes:

- Mock current weather forecasts for different cities
- Historical weather trends over 20 years
- Statistical analysis including anomaly detection
- Seasonal patterns and extreme weather events

In a production environment, this would be replaced with real API calls to weather services.

## Weather Analysis Features

- **Z-Score Analysis**: Measures how unusual current weather is compared to historical averages
- **Percentile Ranking**: Shows where current conditions fall in historical distribution
- **Anomaly Detection**: Flags unusual weather patterns beyond 1.5 standard deviations
- **Historical Year Comparison**: Identifies past years with similar weather patterns
- **Climate Trend Analysis**: Visualizes climate changes over 20-year periods

## License

This project is open source and available under the MIT License.

## Acknowledgments

- Weather icons by Lucide React
- Chart visualizations powered by Recharts
