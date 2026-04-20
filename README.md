# SmartVenue Companion

SmartVenue Companion is a mobile-first event operations and fan experience platform for large venues. It helps attendees move smarter inside a stadium by combining live crowd awareness, queue intelligence, route guidance, proactive alerts, and a lightweight AI copilot into one responsive web app.

This project is designed as a hackathon-ready submission: visually strong, easy to demo, and resilient even without live cloud credentials.

## Problem

Large event venues create the same set of pain points again and again:

- long concession and restroom queuesNow run the project
- crowd bottlenecks near gates and exits
- poor wayfinding inside dense venues
- overloaded staff during peak movement windows
- lack of personalized guidance for families, VIPs, and accessibility users

SmartVenue Companion turns venue chaos into a coordinated digital experience.

## Solution

The app creates a digital operations layer for the venue:

- a live venue map highlights congestion by zone
- queue cards surface estimated wait times and virtual join actions
- route shortcuts guide users to restrooms, concessions, and safer exits
- proactive alerts anticipate spikes before they happen
- a built-in AI copilot answers common navigation questions
- manager mode exposes a lightweight control view for staff coordination
- AR mode simulates camera-guided venue assistance for a futuristic demo moment

## Why This Stands Out

- Strong problem-to-solution fit: every major feature maps to a real venue pain point.
- Demo friendly: the experience works as a polished frontend prototype without requiring backend deployment.
- Submission safe: external keys are removed from the submission build and the UI falls back gracefully.
- Inclusive by design: keyboard support, skip link, ARIA labeling, and reduced-motion handling are included.
- Lightweight stack: plain HTML, CSS, and JavaScript keep setup simple and review friction low.

## Core Features

### 1. Live Venue Intelligence

- congestion-aware stadium map
- dynamic zone states: smooth, busy, congested
- real-time style heatmap fallback for local demos
- scenario control center for live venue state switching during demos

### 2. Queue Optimization

- live queue cards for food, merch, and restrooms
- virtual queue join flow
- simulated prediction updates
- in-seat food delivery tracker

### 3. Smart Routing

- one-tap path activation
- accessibility-aware routing behavior
- emergency reroute mode
- Google Maps pathway reserved for configured builds

### 4. AI and Engagement

- VenueAI chatbot for quick venue questions
- command palette shortcut
- voice command simulation
- live fan wall and match context widgets

### 5. Operations View

- manager mode dashboard
- staff dispatch actions
- stadium throughput logging hooks
- analytics event integration hooks

## Submission-Ready Improvements Added

- removed hardcoded cloud credentials from the submission build
- added graceful fallback behavior when Google services are not configured
- fixed broken route activation logic
- fixed unsafe chat message rendering
- fixed modal HTML issues and several runtime bugs
- restored config compatibility for browser test coverage
- added missing `simulation-worker.js` referenced by the app
- updated PWA paths to work better in local/static hosting
- rewrote documentation for clearer judging and demo flow

## Demo Flow

For a 2-3 minute judging demo, show this sequence:

1. Open the dashboard and explain the venue congestion problem.
2. Hover or click venue sectors to show live map intelligence.
3. Join a queue and highlight the food delivery tracker.
4. Activate a route and explain adaptive guidance.
5. Open VenueAI and ask for food, restroom, or exit help.
6. Toggle manager mode to show staff-side visibility.
7. Trigger emergency mode to demonstrate safety-first routing.

## Tech Stack

- HTML5
- CSS3
- Vanilla JavaScript
- Service Worker for PWA behavior
- optional Google Maps / Firebase / GA integration hooks
- Python ML engine reference included for extensibility

## Project Structure

```text
index.html                 Main UI shell
styles.css                 Visual system and responsive styling
app.js                     Core product logic
config.js                  Centralized configuration
analytics.js               Analytics hooks and local summary mode
tests.js                   Lightweight browser test suite
sw.js                      PWA service worker
simulation-worker.js       Background simulation worker
STADIUMSENSE_ML_ENGINE.py  Reference ML engine for future backend integration
STADIUMSENSE_BACKEND.js    Reference backend architecture notes
```

## How To Run

### Recommended

Serve the folder with any static server and open `index.html`.

Examples:

```bash
python -m http.server 8000
```

or use VS Code Live Server.

### Notes

- The submission build does not require live Google credentials.
- Google Maps and Firebase flows stay disabled unless keys are configured in `config.js`.
- Local fallback visualizations keep the app demoable without backend services.

## Judging Criteria Alignment

### Innovation

SmartVenue Companion combines venue operations, crowd intelligence, and fan guidance into one cohesive interface instead of isolated features.

### Technical Execution

The project includes modular config, analytics hooks, worker-based simulation, accessibility support, PWA behavior, and fallback handling for external dependencies.

### Design and UX

The interface is visually bold, mobile-friendly, and built around rapid decision-making during live events.

### Feasibility

The current build is a strong prototype, while the included backend and ML reference files show a realistic path to production deployment.

## Future Expansion

- live sensor or CCTV ingestion for true density scoring
- QR ticket binding and personalized seat-aware routing
- Vertex AI or custom ML deployment for wait-time forecasting
- venue operator dashboard with historical crowd analytics
- multilingual voice assistant support

## Final Pitch

SmartVenue Companion is not just a navigation app. It is a venue intelligence layer that improves attendee flow, reduces friction, supports staff decisions, and makes the live event experience safer and smarter.
