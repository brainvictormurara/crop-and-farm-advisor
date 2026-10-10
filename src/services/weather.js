const FORECAST_ENDPOINT = 'https://api.open-meteo.com/v1/forecast'

const weatherConditions = {
  0: { description: 'Clear sky', icon: '☀️' },
  1: { description: 'Mainly clear', icon: '🌤️' },
  2: { description: 'Partly cloudy', icon: '⛅' },
  3: { description: 'Overcast', icon: '☁️' },
  45: { description: 'Fog', icon: '🌫️' },
  48: { description: 'Rime fog', icon: '🌫️' },
  51: { description: 'Light drizzle', icon: '🌦️' },
  53: { description: 'Moderate drizzle', icon: '🌦️' },
  55: { description: 'Dense drizzle', icon: '🌧️' },
  56: { description: 'Light freezing drizzle', icon: '🌧️' },
  57: { description: 'Dense freezing drizzle', icon: '🌧️' },
  61: { description: 'Slight rain', icon: '🌦️' },
  63: { description: 'Moderate rain', icon: '🌧️' },
  65: { description: 'Heavy rain', icon: '🌧️' },
  66: { description: 'Light freezing rain', icon: '🌧️' },
  67: { description: 'Heavy freezing rain', icon: '🌧️' },
  71: { description: 'Slight snowfall', icon: '🌨️' },
  73: { description: 'Moderate snowfall', icon: '🌨️' },
  75: { description: 'Heavy snowfall', icon: '❄️' },
  77: { description: 'Snow grains', icon: '🌨️' },
  80: { description: 'Slight rain showers', icon: '🌦️' },
  81: { description: 'Moderate rain showers', icon: '🌧️' },
  82: { description: 'Violent rain showers', icon: '🌧️' },
  85: { description: 'Slight snow showers', icon: '🌨️' },
  86: { description: 'Heavy snow showers', icon: '❄️' },
  95: { description: 'Thunderstorm', icon: '⛈️' },
  96: { description: 'Thunderstorm with slight hail', icon: '⛈️' },
  99: { description: 'Thunderstorm with heavy hail', icon: '⛈️' },
}

export async function fetchDailyForecast({ latitude, longitude }, { signal } = {}) {
  if (
    !Number.isFinite(latitude)
    || latitude < -90
    || latitude > 90
    || !Number.isFinite(longitude)
    || longitude < -180
    || longitude > 180
  ) {
    throw new Error('A valid latitude and longitude are required for the forecast.')
  }

  const endpoint = new URL(FORECAST_ENDPOINT)
  endpoint.search = new URLSearchParams({
    latitude: String(latitude),
    longitude: String(longitude),
    daily: 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max',
    forecast_days: '5',
    temperature_unit: 'celsius',
    timezone: 'auto',
  })

  const response = await fetch(endpoint, { signal })

  if (!response.ok) {
    throw new Error(`Weather request failed with status ${response.status}.`)
  }

  const data = await response.json()
  const daily = data.daily
  const fields = [
    daily?.time,
    daily?.weather_code,
    daily?.temperature_2m_max,
    daily?.temperature_2m_min,
    daily?.precipitation_sum,
    daily?.precipitation_probability_max,
  ]

  if (!fields.every((values) => Array.isArray(values) && values.length >= 5)) {
    throw new Error('The weather service returned an incomplete forecast.')
  }

  return Array.from({ length: 5 }, (_, index) => {
    const weatherCode = daily.weather_code[index]
    const condition = weatherConditions[weatherCode] || {
      description: 'Conditions unavailable',
      icon: '🌡️',
    }
    const forecast = {
      date: daily.time[index],
      weatherCode,
      ...condition,
      temperatureMax: daily.temperature_2m_max[index],
      temperatureMin: daily.temperature_2m_min[index],
      precipitation: daily.precipitation_sum[index],
      precipitationProbability: daily.precipitation_probability_max[index],
    }

    if (
      typeof forecast.date !== 'string'
      || !/^\d{4}-\d{2}-\d{2}$/.test(forecast.date)
      || Number.isNaN(Date.parse(`${forecast.date}T00:00:00Z`))
      || new Date(`${forecast.date}T00:00:00Z`).toISOString().slice(0, 10) !== forecast.date
      || !Number.isInteger(weatherCode)
      || weatherCode < 0
      || !Number.isFinite(forecast.temperatureMax)
      || !Number.isFinite(forecast.temperatureMin)
      || !Number.isFinite(forecast.precipitation)
      || !Number.isFinite(forecast.precipitationProbability)
      || forecast.precipitation < 0
      || forecast.precipitationProbability < 0
      || forecast.precipitationProbability > 100
    ) {
      throw new Error('The weather service returned invalid forecast values.')
    }

    return forecast
  })
}
