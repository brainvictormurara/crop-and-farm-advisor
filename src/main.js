import './style.css'
import { findCropByName } from './data/crops.js'
import { fetchWikipediaProfile } from './services/wikipedia.js'

document.querySelector('#app').innerHTML = `
  <header class="site-header">
    <a class="brand" href="/" aria-label="Crop and Farm Advisor home">
      <span class="brand-mark" aria-hidden="true">
        <svg viewBox="0 0 32 32" fill="none">
          <path d="M25.5 6.5C15 6 7.1 10.6 7.1 18.1c0 4.2 3.1 7.2 7.1 7.2 7.9 0 11.8-8.7 11.3-18.8Z" />
          <path d="M6 26c3.7-6.2 8.5-10.3 15-13.5" />
        </svg>
      </span>
      <span class="brand-name">Crop and Farm Advisor</span>
    </a>
    <span class="header-note">A practical field guide</span>
  </header>

  <main class="page-content">
    <section class="search-panel" aria-labelledby="page-title">
      <div class="hero-copy">
        <p class="eyebrow"><span class="status-dot"></span> GROW WITH CLARITY</p>
        <h1 id="page-title">Crop and<br class="desktop-break"> Farm Advisor</h1>
        <p class="intro">Find a crop and get useful information to help you understand what you grow.</p>
      </div>

      <div class="hero-art" aria-hidden="true">
        <svg viewBox="0 0 300 250" fill="none">
          <path class="art-ground" d="M14 218c59-25 136-34 272-11" />
          <path class="art-stem" d="M151 215c-4-55-1-105 11-161" />
          <path class="art-leaf" d="M159 106c2-36 27-56 76-59-7 42-32 62-76 59Z" />
          <path class="art-vein" d="M164 101c21-20 41-34 65-47" />
          <path class="art-leaf" d="M155 145c-8-37-34-54-79-49 13 40 39 57 79 49Z" />
          <path class="art-vein" d="M149 139c-20-17-39-28-61-36" />
          <path class="art-leaf" d="M153 72c-2-29-19-46-52-52 2 34 19 51 52 52Z" />
          <path class="art-vein" d="M151 68c-12-17-25-29-42-40" />
          <circle class="art-sun" cx="233" cy="45" r="13" />
          <path class="art-sunray" d="M233 21v-8m0 64v-8m24-24h8m-64 0h8m41-17 6-6m-45 45 6-6m33 0 6 6m-45-45 6 6" />
        </svg>
      </div>

      <form class="crop-search" id="crop-search" role="search">
        <label for="crop-query">SEARCH FOR A CROP</label>
        <div class="search-fields">
          <div class="input-wrap">
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle cx="10.8" cy="10.8" r="6.8" />
              <path d="m16 16 4.3 4.3" />
            </svg>
            <input id="crop-query" name="crop" type="search" placeholder="Try tomato, wheat, or corn" autocomplete="off" />
          </div>
          <button type="submit">Search <span aria-hidden="true">&#8594;</span></button>
        </div>
      </form>
    </section>

    <section class="results-section" aria-labelledby="results-title" aria-live="polite">
      <div class="results-heading">
        <h2 id="results-title">Crop results</h2>
        <span class="results-label">YOUR FIELD NOTES</span>
      </div>
      <div class="empty-state" id="crop-results">
        <span class="empty-mark" aria-hidden="true">
          <svg viewBox="0 0 48 48" fill="none">
            <path d="M24 39V22m0 8c-9 0-13-5-13-13 9 0 13 5 13 13Zm0-7c0-9 5-14 14-14 0 9-5 14-14 14Z" />
            <path d="M12 39h24" />
          </svg>
        </span>
        <p class="empty-title">Your next crop starts here</p>
        <p class="empty-copy">Search for a crop to see its useful growing information.</p>
      </div>
    </section>
  </main>

  <footer class="site-footer">
    <span>Crop and Farm Advisor</span>
    <span>Made for curious growers <span class="footer-sun" aria-hidden="true">&#9678;</span></span>
  </footer>
`

const cropSearchForm = document.querySelector('#crop-search')
const cropQueryInput = document.querySelector('#crop-query')
const cropResults = document.querySelector('#crop-results')
const inputWrap = cropQueryInput.closest('.input-wrap')

function renderMessage(title, description) {
  cropResults.className = 'empty-state'
  cropResults.setAttribute('role', 'status')

  const titleElement = document.createElement('p')
  titleElement.className = 'empty-title'
  titleElement.textContent = title

  const descriptionElement = document.createElement('p')
  descriptionElement.className = 'empty-copy'
  descriptionElement.textContent = description

  cropResults.replaceChildren(titleElement, descriptionElement)
}

function renderCrop(crop) {
  cropResults.className = 'crop-card'
  cropResults.removeAttribute('role')

  const heading = document.createElement('h3')
  heading.className = 'crop-name'
  heading.textContent = crop.name

  const description = document.createElement('p')
  description.className = 'crop-description'
  description.textContent = crop.description

  const facts = document.createElement('dl')
  facts.className = 'crop-facts'

  for (const [label, value] of [
    ['Planting and growing', crop.planting],
    ['Approximate maturity', crop.maturity],
    ['Basic water requirement', crop.water],
  ]) {
    const fact = document.createElement('div')
    fact.className = 'crop-fact'

    const term = document.createElement('dt')
    term.textContent = label

    const detail = document.createElement('dd')
    detail.textContent = value

    fact.append(term, detail)
    facts.append(fact)
  }

  const note = document.createElement('p')
  note.className = 'crop-note'
  note.textContent = 'Growing times and water needs are estimates and vary by variety, soil, and climate.'

  cropResults.replaceChildren(heading, description, facts, note)

  const wikipediaSection = document.createElement('section')
  wikipediaSection.className = 'wikipedia-section'
  wikipediaSection.setAttribute('aria-label', 'From Wikipedia')
  wikipediaSection.setAttribute('aria-live', 'polite')
  wikipediaSection.setAttribute('aria-busy', 'true')

  const wikipediaHeading = document.createElement('h4')
  wikipediaHeading.className = 'wikipedia-heading'
  wikipediaHeading.textContent = 'From Wikipedia'

  const loadingMessage = document.createElement('p')
  loadingMessage.className = 'wikipedia-message'
  loadingMessage.setAttribute('role', 'status')
  loadingMessage.textContent = 'Loading Wikipedia profile...'

  wikipediaSection.append(wikipediaHeading, loadingMessage)
  cropResults.append(wikipediaSection)

  return wikipediaSection
}

function renderWikipediaProfile(section, profile) {
  section.setAttribute('aria-busy', 'false')
  section.replaceChildren()

  const heading = document.createElement('h4')
  heading.className = 'wikipedia-heading'
  heading.textContent = 'From Wikipedia'

  const content = document.createElement('div')
  content.className = 'wikipedia-content'

  const extract = document.createElement('p')
  extract.className = 'wikipedia-extract'
  extract.textContent = profile.extract
  content.append(extract)

  if (profile.thumbnailUrl) {
    const image = document.createElement('img')
    image.className = 'wikipedia-thumbnail'
    image.src = profile.thumbnailUrl
    image.alt = `${profile.title} from Wikipedia`
    image.loading = 'lazy'
    content.append(image)
  }

  const articleLink = document.createElement('a')
  articleLink.className = 'wikipedia-link'
  articleLink.href = profile.articleUrl
  articleLink.target = '_blank'
  articleLink.rel = 'noopener noreferrer'
  articleLink.textContent = 'Read the full Wikipedia article'

  section.append(heading, content, articleLink)
}

function renderWikipediaUnavailable(section) {
  section.setAttribute('aria-busy', 'false')
  section.replaceChildren()

  const heading = document.createElement('h4')
  heading.className = 'wikipedia-heading'
  heading.textContent = 'From Wikipedia'

  const message = document.createElement('p')
  message.className = 'wikipedia-message'
  message.setAttribute('role', 'status')
  message.textContent = 'Wikipedia information is unavailable right now. Your local crop profile is still available.'

  section.append(heading, message)
}

cropQueryInput.addEventListener('input', () => {
  cropQueryInput.removeAttribute('aria-invalid')
  inputWrap.classList.remove('has-error')
})

let activeWikipediaController

cropSearchForm.addEventListener('submit', async (event) => {
  event.preventDefault()
  activeWikipediaController?.abort()
  activeWikipediaController = undefined

  const query = cropQueryInput.value.trim().replace(/\s+/g, ' ')

  if (!query) {
    cropQueryInput.setAttribute('aria-invalid', 'true')
    inputWrap.classList.add('has-error')
    renderMessage('Enter a crop to search', 'Type a crop name such as Maize, Tomato, or Wheat.')
    cropQueryInput.focus()
    return
  }

  cropQueryInput.removeAttribute('aria-invalid')
  inputWrap.classList.remove('has-error')

  const crop = findCropByName(query)

  if (!crop) {
    renderMessage('Crop not found', `We couldn't find "${query}". Try Maize, Tomato, Onion, Wheat, Potato, or Cabbage.`)
    return
  }

  const wikipediaSection = renderCrop(crop)
  const requestController = new AbortController()
  activeWikipediaController = requestController

  try {
    const profile = await fetchWikipediaProfile(crop.name, { signal: requestController.signal })

    if (activeWikipediaController !== requestController) {
      return
    }

    activeWikipediaController = undefined
    renderWikipediaProfile(wikipediaSection, profile)
  } catch {
    if (requestController.signal.aborted) {
      return
    }

    activeWikipediaController = undefined
    renderWikipediaUnavailable(wikipediaSection)
  }
})
