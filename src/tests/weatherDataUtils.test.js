import { fetchRealWeatherData } from '../components/weatherDataUtils';
import axios from 'axios';

jest.mock('axios');

describe('Weather Data Utilities', () => {
  test('fetchRealWeatherData returns correct data', async () => {
    const mockResponse = {
      data: {
        main: { temp: 25, humidity: 60 },
        weather: [{ description: 'Sunny' }],
        wind: { speed: 5 }
      }
    };
    axios.get.mockResolvedValue(mockResponse);

    const result = await fetchRealWeatherData('Seattle');
    
    expect(result).toEqual({
      temperature: 25,
      description: 'Sunny',
      humidity: 60,
      windSpeed: 5
    });
  });

  test('handles location error', async () => {
    await expect(fetchRealWeatherData(''))
      .rejects.toThrow('Location is required');
  });
})