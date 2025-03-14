# React Weather Dashboard

An interactive React weather dashboard with historical data visualization and statistical insights.

## 🌦️ Features

- Current weather conditions
- Historical weather data comparison
- Statistical analysis of weather patterns
- Temperature, precipitation, UV index, and wind metrics
- Responsive design for all device sizes
- Unit conversion (Fahrenheit/Celsius)
- Geolocation support

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

4. Create environment variables:
```bash
# Copy the example file
cp .env.example .env
```

5. Add your OpenWeather API key to the `.env` file:
```
OPENWEATHER_API_KEY=your_api_key_here
```

> Get an API key at [OpenWeatherMap](https://openweathermap.org/api)

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

## 📦 Project Structure

```
react-weather-dashboard/
├── public/                # Static files
├── server/                # Backend API proxy server
│   ├── index.js           # Express server main file
│   └── package.json       # Server dependencies
├── src/                   # Frontend source code
│   ├── components/        # React components
│   │   ├── WeatherCard.js      # Single day weather card
│   │   ├── WeatherChart.js     # Weather data visualizations
│   │   ├── WeatherDashboard.js # Main container component
│   │   ├── WeatherHeader.js    # App header with controls
│   │   ├── weatherDataUtils.js # API and data fetching utilities
│   │   └── weatherUtils.js     # Weather calculation helpers
│   ├── App.js             # Root component
│   ├── index.js           # Application entry point
│   └── ErrorBoundary.js   # Error handling component
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

## 📝 Development Notes

### Security

The application uses a backend proxy server to secure API keys. Never expose API keys in client-side code.

### API Rate Limiting

The OpenWeather API has rate limits. The backend implements caching and rate limiting to avoid exceeding these limits.

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

This project is licensed under the MIT License - see the LICENSE file for details.
