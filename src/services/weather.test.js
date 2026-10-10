import assert from 'node:assert/strict'
import { afterEach, test } from 'node:test'
import { fetchDailyForecast } from './weather.js'

const originalFetch = globalThis.fetch

afterEach(() => {
  globalThis.fetch = originalFetch
})

function forecastResponse(overrides = {}) {
  return {
    daily: {
      time: [
        '2026-10-10',
        '2026-10-11',
        '2026-10-12',
        '2026-10-13',
        '2026-10-14',
      ],
      weather_code: [0, 1, 2, 61, 95],
      temperature_2m_max: [25, 26, 27, 24, 22],
      temperature_2m_min: [12, 13, 14, 11, 10],
      precipitation_sum: [0, 0, 1.2, 4.5, 8],
      precipitation_probability_max: [0, 5, 20, 65, 90],
      ...overrides,
    },
  }
}

test('fetchDailyForecast requests five daily values for the selected coordinates', async () => {
  globalThis.fetch = async (input) => {
    const url = new URL(input)
    assert.equal(url.origin, 'https://api.open-meteo.com')
    assert.equal(url.pathname, '/v1/forecast')
    assert.equal(url.searchParams.get('latitude'), '-18.18')
    assert.equal(url.searchParams.get('longitude'), '31.55')
    assert.equal(url.searchParams.get('forecast_days'), '5')
    assert.equal(url.searchParams.get('temperature_unit'), 'celsius')
    assert.equal(url.searchParams.get('timezone'), 'auto')
    assert.match(url.searchParams.get('daily'), /weather_code/)
    assert.match(url.searchParams.get('daily'), /temperature_2m_max/)
    assert.match(url.searchParams.get('daily'), /temperature_2m_min/)
    assert.match(url.searchParams.get('daily'), /precipitation_sum/)
    assert.match(url.searchParams.get('daily'), /precipitation_probability_max/)
    return Response.json(forecastResponse())
  }

  const result = await fetchDailyForecast({ latitude: -18.18, longitude: 31.55 })
  assert.equal(result.length, 5)
  assert.equal(result[0].description, 'Clear sky')
  assert.equal(result[0].temperatureMax, 25)
  assert.equal(result[3].precipitationProbability, 65)
  assert.equal(result[4].description, 'Thunderstorm')
})

test('fetchDailyForecast uses a safe fallback for an unknown WMO code', async () => {
  globalThis.fetch = async () => Response.json(forecastResponse({ weather_code: [999, 1, 2, 61, 95] }))
  const result = await fetchDailyForecast({ latitude: 0, longitude: 0 })
  assert.equal(result[0].description, 'Conditions unavailable')
})

test('fetchDailyForecast rejects invalid coordinates before making a request', async () => {
  let called = false
  globalThis.fetch = async () => {
    called = true
    return Response.json(forecastResponse())
  }

  await assert.rejects(
    fetchDailyForecast({ latitude: Number.NaN, longitude: 31.55 }),
    /valid latitude and longitude/,
  )
  assert.equal(called, false)
})

test('fetchDailyForecast rejects malformed response arrays and values', async (t) => {
  const malformedResponses = [
    { weather_code: [0, 1] },
    { time: ['not-a-date', '2026-10-11', '2026-10-12', '2026-10-13', '2026-10-14'] },
    { time: ['2026-02-31', '2026-10-11', '2026-10-12', '2026-10-13', '2026-10-14'] },
    { temperature_2m_max: [25, 26, 27, 24, Number.NaN] },
    { precipitation_probability_max: [0, 5, 20, 65, 101] },
    { weather_code: [-1, 1, 2, 61, 95] },
  ]

  for (const responseOverrides of malformedResponses) {
    await t.test(JSON.stringify(responseOverrides), async () => {
      globalThis.fetch = async () => Response.json(forecastResponse(responseOverrides))
      await assert.rejects(fetchDailyForecast({ latitude: 0, longitude: 0 }))
    })
  }
})

test('fetchDailyForecast rejects non-success HTTP responses', async () => {
  globalThis.fetch = async () => new Response('Unavailable', { status: 502 })
  await assert.rejects(
    fetchDailyForecast({ latitude: 0, longitude: 0 }),
    /status 502/,
  )
})

test('fetchDailyForecast propagates network failures', async () => {
  globalThis.fetch = async () => {
    throw new TypeError('Failed to fetch')
  }
  await assert.rejects(fetchDailyForecast({ latitude: 0, longitude: 0 }), /Failed to fetch/)
})
