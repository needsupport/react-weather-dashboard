import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import WeatherDashboard from '../components/WeatherDashboard';
import { fetchRealWeatherData } from '../components/weatherDataUtils';

jest.mock('../components/weatherDataUtils');

describe('WeatherDashboard', () => {
  beforeEach(() => {
    fetchRealWeatherData.mockResolvedValue({
      temperature: 25,
      description: 'Sunny',
      humidity: 60,
      windSpeed: 5
    });
  });

  test('renders loading state', () => {
    render(<WeatherDashboard />);
    expect(screen.getByText(/Loading.../i)).toBeInTheDocument();
  });

  test('fetches and displays weather data', async () => {
    render(<WeatherDashboard />);
    
    await waitFor(() => {
      expect(screen.getByText(/Sunny/i)).toBeInTheDocument();
      expect(screen.getByText(/25°/i)).toBeInTheDocument();
    });
  });

  test('handles geolocation', async () => {
    const mockGeolocation = {
      getCurrentPosition: jest.fn().mockImplementation((success) => 
        Promise.resolve(success({
          coords: {
            latitude: 37.7749,
            longitude: -122.4194
          }
        }))
      )
    };
    global.navigator.geolocation = mockGeolocation;

    render(<WeatherDashboard />);
    
    const geolocationButton = screen.getByRole('button', { name: /use my location/i });
    fireEvent.click(geolocationButton);

    await waitFor(() => {
      expect(mockGeolocation.getCurrentPosition).toHaveBeenCalled();
    });
  });
})