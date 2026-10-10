const GEOCODING_ENDPOINT = 'https://geocoding-api.open-meteo.com/v1/search'

export async function searchLocations(query, { signal } = {}) {
  const endpoint = new URL(GEOCODING_ENDPOINT)
  endpoint.search = new URLSearchParams({
    name: query,
    count: '10',
    language: 'en',
    format: 'json',
  })

  const response = await fetch(endpoint, { signal })

  if (!response.ok) {
    throw new Error(`Location search failed with status ${response.status}.`)
  }

  const data = await response.json()

  if (data.results === undefined) {
    return []
  }

  if (!Array.isArray(data.results)) {
    throw new Error('The location service returned an invalid response.')
  }

  return data.results
    .filter((result) =>
      result
      && typeof result.name === 'string'
      && result.name.trim()
      && typeof result.country === 'string'
      && result.country.trim()
      && Number.isFinite(result.latitude)
      && result.latitude >= -90
      && result.latitude <= 90
      && Number.isFinite(result.longitude)
      && result.longitude >= -180
      && result.longitude <= 180,
    )
    .map((result) => ({
      name: result.name,
      admin1: typeof result.admin1 === 'string' ? result.admin1 : '',
      country: result.country,
      latitude: result.latitude,
      longitude: result.longitude,
    }))
}
