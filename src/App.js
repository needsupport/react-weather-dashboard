import React from 'react';
import './App.css';
import WeatherDashboard from './components/WeatherDashboard';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1 className="text-3xl font-bold text-blue-600 mb-4">Weather Dashboard</h1>
        <p className="text-gray-600 mb-6">Interactive weather visualization with historical data</p>
      </header>
      <main>
        <WeatherDashboard />
      </main>
      <footer className="mt-8 text-center text-gray-500 text-sm pb-4">
        <p>© 2025 Weather Dashboard | Made with React and Recharts</p>
      </footer>
    </div>
  );
}

export default App;
