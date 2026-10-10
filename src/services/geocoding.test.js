import assert from 'node:assert/strict'
import { afterEach, test } from 'node:test'
import { searchLocations } from './geocoding.js'

const originalFetch = globalThis.fetch

afterEach(() => {
  globalThis.fetch = originalFetch
})

test('searchLocations requests the query and normalizes valid results', async () => {
  globalThis.fetch = async (input) => {
    const url = new URL(input)
    assert.equal(url.origin, 'https://geocoding-api.open-meteo.com')
    assert.equal(url.pathname, '/v1/search')
    assert.equal(url.searchParams.get('name'), 'Marondera')
    assert.equal(url.searchParams.get('count'), '10')
    assert.equal(url.searchParams.get('language'), 'en')

    return Response.json({
      results: [
        {
          name: 'Marondera',
          admin1: 'Mashonaland East',
          country: 'Zimbabwe',
          latitude: -18.18,
          longitude: 31.55,
          timezone: 'Africa/Harare',
        },
        {
          name: 'Invalid result',
          country: 'Nowhere',
          latitude: 'unknown',
          longitude: 0,
        },
        {
          name: 'Out-of-range result',
          country: 'Nowhere',
          latitude: 91,
          longitude: 0,
        },
      ],
    })
  }

  assert.deepEqual(await searchLocations('Marondera'), [
    {
      name: 'Marondera',
      admin1: 'Mashonaland East',
      country: 'Zimbabwe',
      latitude: -18.18,
      longitude: 31.55,
    },
  ])
})

test('searchLocations returns an empty list when no results are present', async () => {
  globalThis.fetch = async () => Response.json({})
  assert.deepEqual(await searchLocations('No such town'), [])
})

test('searchLocations rejects malformed result collections', async () => {
  globalThis.fetch = async () => Response.json({ results: 'not-an-array' })
  await assert.rejects(searchLocations('Harare'), /invalid response/)
})

test('searchLocations rejects non-success HTTP responses', async () => {
  globalThis.fetch = async () => new Response('Unavailable', { status: 503 })
  await assert.rejects(searchLocations('Harare'), /status 503/)
})

test('searchLocations propagates network failures', async () => {
  globalThis.fetch = async () => {
    throw new TypeError('Failed to fetch')
  }
  await assert.rejects(searchLocations('Harare'), /Failed to fetch/)
})
