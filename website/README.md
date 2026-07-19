# Offline Study Library Frontend Scaffold

This folder contains the Phase 4.1 frontend architecture for the offline-first study library. It is a production-ready scaffold, not a feature-complete application.

## How to Open

Open `website/index.html` directly in a modern browser. No build step, package install, framework, or local server is required.

## Folder Structure

- `index.html` contains only the persistent application shell: sidebar, header, main content, toast region, modal region, and footer.
- `assets/css/` contains layered styles for reset, variables, base typography, layout, navigation, cards, player scaffolding, and motion.
- `assets/js/app.js` initializes state, renders app chrome, and delegates route rendering.
- `assets/js/router.js` maps hash routes to placeholder page modules.
- `assets/js/state.js` owns the shared `AppState` object and minimal subscription/setter helpers.
- `assets/js/api.js` exposes mock library accessors with TODO markers for later data loading.
- `assets/js/storage.js` wraps localStorage for favorites, history, and settings.
- `assets/js/components/` contains self-owned shell components.
- `assets/js/pages/` contains route placeholder renderers.
- `assets/js/utils/` contains small DOM, event, formatting, and debounce helpers.
- `assets/icons/` and `assets/fonts/` are reserved for future local assets.

## Module Responsibilities

`app.js` is the composition root. It imports state, storage, routing, and components, then renders the current route into the main container.

`state.js` keeps the exact Phase 4.1 state shape: `library`, `currentPage`, `selectedSubject`, `selectedVideo`, `searchQuery`, `favorites`, `history`, `continueWatching`, `settings`, and `loading`.

`router.js` uses hash navigation for direct-file compatibility and supports `/`, `/subject`, `/player`, `/favorites`, `/history`, `/settings`, and `/search`.

Page modules export `render()` only. They return placeholder HTML and intentionally avoid search, playback, sorting, favorite, history, settings, thumbnail, and library-loading logic.

## Future Phases

Future work can connect `api.js` to `videos.json`, replace placeholder pages with real library views, add player controls, wire search indexing, implement favorite/history actions, and expand settings persistence.

## Communication Flow

Components read state through `getState()` and render markup. Route changes update `currentPage` through the router. Persistent data wrappers in `storage.js` are available for later feature phases, but this scaffold does not implement business behavior.
