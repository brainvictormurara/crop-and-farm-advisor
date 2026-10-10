const articleTitles = {
  Maize: 'Maize',
  Tomato: 'Tomato',
  Onion: 'Onion',
  Wheat: 'Wheat',
  Potato: 'Potato',
  Cabbage: 'Cabbage',
}

function isWikipediaUrl(value) {
  if (typeof value !== 'string') {
    return false
  }

  try {
    const url = new URL(value)
    return url.protocol === 'https:'
      && (url.hostname === 'wikipedia.org' || url.hostname.endsWith('.wikipedia.org'))
  } catch {
    return false
  }
}

function isWikimediaImageUrl(value) {
  if (typeof value !== 'string') {
    return false
  }

  try {
    const url = new URL(value)
    return url.protocol === 'https:'
      && (url.hostname === 'wikimedia.org' || url.hostname.endsWith('.wikimedia.org'))
  } catch {
    return false
  }
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

  if (!article || typeof article !== 'object' || typeof article.extract !== 'string' || !article.extract.trim()) {
    throw new Error('Wikipedia did not return a summary for this crop.')
  }

  const fallbackArticleUrl = `https://en.wikipedia.org/wiki/${encodeURIComponent(articleTitle)}`
  const articleUrl = isWikipediaUrl(article.content_urls?.desktop?.page)
    ? article.content_urls.desktop.page
    : fallbackArticleUrl
  const thumbnailUrl = isWikimediaImageUrl(article.thumbnail?.source)
    ? article.thumbnail.source
    : ''

  return {
    title: article.title || articleTitle,
    extract: article.extract,
    thumbnailUrl,
    articleUrl,
  }
}