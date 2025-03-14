# React Weather Dashboard

An interactive React weather dashboard with support for multiple weather data providers including the National Weather Service (NWS) API and OpenWeather API.

## 🌦️ Features

- Current weather conditions and forecasts
- Support for both NWS and OpenWeather APIs
- Temperature, precipitation, UV index, and wind metrics
- Historical data comparison and visualization
- Responsive design for all device sizes
- Unit conversion (Fahrenheit/Celsius)
- Geolocation support
- Runtime API configuration

## 🚀 Setup Instructions

### Prerequisites

- Node.js 16+
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/needsupport/react-weather-dashboard.git
cd react-weather-dashboard
```

2. Install frontend dependencies:
```bash
npm install
```

3. Install backend dependencies:
```bash
cd server
npm install
cd ..
```

4. Create environment variables (optional - can be configured at runtime):
```bash
# Copy the example file
cp .env.example .env
```

### Running the Application

1. Start the backend server:
```bash
cd server
npm start
```

2. In a new terminal, start the frontend:
```bash
npm start
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

4. Configure the API through the Settings button in the UI

## 📦 Project Structure

```
react-weather-dashboard/
├── public/                # Static files
├── server/                # Backend API proxy server
│   ├── index.js           # Express server main file
│   └── package.json       # Server dependencies
├── src/                   # Frontend source code
│   ├── components/        # React components
│   │   ├── ConfigurationPanel.js  # API settings UI
│   │   ├── WeatherCard.js        # Single day weather card
│   │   ├── WeatherChart.js       # Weather data visualizations
│   │   ├── WeatherDashboard.js   # Main container component
│   │   ├── WeatherHeader.js      # App header with controls
│   │   ├── weatherDataUtils.js   # API and data fetching utilities
│   │   └── weatherUtils.js       # Weather calculation helpers
│   ├── App.js             # Root component
│   ├── index.js           # Application entry point
│   └── ErrorBoundary.js   # Error handling component
├── docs/                  # Documentation
│   └── nws-api-reference.md  # NWS API reference
└── package.json           # Frontend dependencies
```

## 🧪 Testing

Run the test suite:
```bash
npm test
```

Run specific tests:
```bash
npm test -- --watch weatherUtils
```

## 🔄 Supported Weather APIs

### National Weather Service (NWS) API
- Free and open API from the US government
- No API key required
- Provides detailed forecasts for US locations
- Documentation: [NWS API Reference](docs/nws-api-reference.md)

### OpenWeather API
- Requires an API key (free tier available)
- Global coverage
- Documentation: https://openweathermap.org/api

## NWS API Capabilities

The National Weather Service API provides extensive weather data including:

- **Data Types**: Current conditions, forecasts, alerts, hourly forecasts
- **Parameters**: Temperature, precipitation, wind, humidity, pressure, and more
- **Geographic Coverage**: United States and territories
- **Resolution**: 2.5km grid resolution
- **Update Frequency**: Hourly or better

For complete details, see our [NWS API Reference](docs/nws-api-reference.md).

## 🛠️ Technology Stack

- **Frontend**:
  - React 18
  - Tailwind CSS
  - Recharts for data visualization
  - Lucide React for icons

- **Backend**:
  - Express.js
  - axios for API calls
  - apicache for caching
  - express-rate-limit for rate limiting

## 📱 iOS Development

This web application can be adapted for iOS. See our [iOS adaptation guide](ios-adaptation.md) for:

- UI/UX modifications for iOS
- Native feature integration
- Development approach options

## 📝 Development Notes

### Security

The application uses a backend proxy server to secure API keys. Never expose API keys in client-side code.

### API Rate Limiting

Weather APIs have rate limits. The backend implements caching and rate limiting to avoid exceeding these limits.

### Performance Optimization

The app uses:
- React.memo for pure components
- useReducer for complex state
- Binary search for efficient data processing
- API response caching

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.
