const articleTitles = {
  Maize: 'Maize',
  Tomato: 'Tomato',
  Onion: 'Onion',
  Wheat: 'Wheat',
  Potato: 'Potato',
  Cabbage: 'Cabbage',
}

export async function fetchWikipediaProfile(cropName, { signal } = {}) {
  const articleTitle = articleTitles[cropName]

  if (!articleTitle) {
    throw new Error(`No Wikipedia article is configured for ${cropName}.`)
  }

  const endpoint = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(articleTitle)}`
  const response = await fetch(endpoint, {
    headers: { Accept: 'application/json' },
    signal,
  })

  if (!response.ok) {
    throw new Error(`Wikipedia request failed with status ${response.status}.`)
  }

  const article = await response.json()

  if (!article.extract) {
    throw new Error('Wikipedia did not return a summary for this crop.')
  }

  const articleUrl = article.content_urls?.desktop?.page
    || `https://en.wikipedia.org/wiki/${encodeURIComponent(articleTitle)}`

  return {
    title: article.title || articleTitle,
    extract: article.extract,
    thumbnailUrl: article.thumbnail?.source || '',
    articleUrl,
  }
}