import assert from 'node:assert/strict'
import { afterEach, test } from 'node:test'
import { fetchWikipediaProfile } from './wikipedia.js'

const originalFetch = globalThis.fetch

afterEach(() => {
  globalThis.fetch = originalFetch
})

test('fetchWikipediaProfile accepts safe Wikipedia article and Wikimedia image URLs', async () => {
  globalThis.fetch = async () => Response.json({
    title: 'Tomato',
    extract: 'A short crop summary.',
    content_urls: { desktop: { page: 'https://en.wikipedia.org/wiki/Tomato' } },
    thumbnail: { source: 'https://upload.wikimedia.org/example.jpg' },
  })

  const result = await fetchWikipediaProfile('Tomato')
  assert.equal(result.articleUrl, 'https://en.wikipedia.org/wiki/Tomato')
  assert.equal(result.thumbnailUrl, 'https://upload.wikimedia.org/example.jpg')
})

test('fetchWikipediaProfile rejects unsafe external links from the API', async () => {
  globalThis.fetch = async () => Response.json({
    title: 'Tomato',
    extract: 'A short crop summary.',
    content_urls: { desktop: { page: 'javascript:alert(1)' } },
    thumbnail: { source: 'https://example.invalid/image.jpg' },
  })

  const result = await fetchWikipediaProfile('Tomato')
  assert.equal(result.articleUrl, 'https://en.wikipedia.org/wiki/Tomato')
  assert.equal(result.thumbnailUrl, '')
})
