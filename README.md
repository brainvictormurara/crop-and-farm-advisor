# Crop and Farm Advisor

Crop and Farm Advisor is a responsive field guide for crop information, location lookup, and local five-day weather forecasts.

## Features

- Search crop profiles for Maize (including the corn alias), Tomato, Onion, Wheat, Potato, and Cabbage.
- View growing guidance and optional summaries from Wikipedia.
- Search towns and cities with the Open-Meteo Geocoding API and select a matching location.
- View a five-day daily forecast for the selected location, including conditions, high and low temperatures, precipitation, and precipitation probability.

## Run locally

Requires Node.js 20.19 or later (or Node.js 22.12 or later) and npm.

```sh
npm ci
npm run dev
```

Open the local URL printed by Vite. To create and preview a production build:

```sh
npm run build
npm run preview
```

## Tests

Run the dependency-free service tests with Node's built-in test runner:

```sh
npm test
```

The service tests cover Open-Meteo request parameters, result normalization, malformed and failed API responses, forecast values, and safe Wikipedia URLs.

## Data attribution

- Location search and weather forecasts are provided by [Open-Meteo](https://open-meteo.com/). Forecast cards link to Open-Meteo for attribution.
- Crop summaries are retrieved from the [Wikipedia REST API](https://en.wikipedia.org/api/rest_v1/) and link to their source articles. Wikipedia content is available under its applicable licenses; see the linked article for attribution and license details.

## GitHub Pages deployment

The Vite base path in `vite.config.js` is set to `/crop-and-farm-advisor/`. The workflow at `.github/workflows/deploy.yml` builds and deploys the `dist` folder to GitHub Pages when changes are pushed to `main`; it can also be started manually with `workflow_dispatch`.

In the repository's GitHub Pages settings, select **GitHub Actions** as the build and deployment source. The workflow uses `npm ci` and `npm run build`; no private API keys are required.
