# PashuRakshak — Livestock Disease Detection & Management

A field-worker reporting system for sick or injured animals, with an
explainable risk assessment, veterinary referral, and a nearby-vet locator
— built for SIH 2026 internal hackathon.

## v2 additions

- **Rebranded** from the internal working name "LivestockGuard" to
  **PashuRakshak** ("protector of animals"), with the problem-statement
  number removed from the visible UI.
- **Multilingual UI**: English, Hindi, and Marathi, switchable from a
  dropdown in the top right (`src/i18n/`). Translations cover all main
  headings, labels, and buttons.
- **Redesigned visual identity**: warmer palette, rounded cards, an
  original hand-authored SVG hero illustration (no external image
  licensing concerns), and Lucide icons throughout the nav and buttons.
- **Vet locator**: the old hotspot map is now a straightforward map that
  pins every registered veterinarian. With location permission, it also
  sorts vets by distance (haversine formula, computed client-side) and
  shows the three closest with a tap-to-call button.
- **National toll-free veterinary helpline (1962)** surfaced in two
  places: a callout banner under the case-report form, and a persistent
  pill in the footer. This is India's real, actively-running toll-free
  veterinary emergency number under the Livestock Health & Disease
  Control Scheme — verified via a live search, not invented.
- Vets can now optionally save their clinic's location (via the browser's
  geolocation) when added from the Veterinary desk, which is what powers
  the locator map and "nearest to you" list.

## Architecture

```
┌─────────────────┐      HTTP/JSON       ┌──────────────────────┐      stdin/stdout JSON     ┌───────────────────┐
│  React frontend  │ ───────────────────▶ │  Java (Spring Boot)  │ ─────────────────────────▶ │  C++ risk engine   │
│  (Vite, Leaflet) │ ◀─────────────────── │  REST API + H2 DB    │ ◀───────────────────────── │  (native binary)   │
└─────────────────┘                       └──────────────────────┘                             └───────────────────┘
```

**Why this split, not one language for everything:**
- **Java (Spring Boot)** owns the web API, the database, validation, and
  orchestration — the part of the system that's I/O-heavy and benefits
  from a mature web/ORM ecosystem.
- **C++** owns the risk-scoring algorithm itself. It's pure CPU-bound
  logic with no need for a database connection or the JVM, gets invoked
  once per case report (and potentially in batches when a village's
  offline queue syncs), and is easy to unit-test in isolation from the
  web layer. The Java backend shells out to the compiled binary and
  passes/receives small JSON payloads over stdin/stdout.
- **React** is the frontend — a field-reporting form, a case ledger, a
  veterinary referral desk, and a Leaflet map showing case locations and
  active hotspots.

This mirrors the flowchart in the problem statement almost line for line:
*Report animal → collect photo/symptoms/location → AI/rules assess risk →
classify risk → refer to veterinarian → record confirmed case → aggregate
cases → detect hotspot → send early warning.*

## What's real vs. what's a placeholder

- **The risk-scoring model is a real, working, explainable rule engine** —
  not a stand-in. Weighted symptom scores, species multipliers, duration
  and outbreak-proximity boosts, vaccination discount. This is a
  legitimate approach for veterinary triage (see `cpp-risk-engine/risk_engine.cpp`
  for the exact weights and the comment explaining the design choice).
  The weights are starting points a real veterinary domain expert should
  tune before any real-world use.
- **Hotspot detection is real**: it counts HIGH/CRITICAL cases per village
  in a rolling window and raises/clears an alert against a threshold —
  both configurable in `application.properties`.
- **What's *not* included**: photo-based image classification ("does this
  skin lesion look infected") is left as a clearly marked extension point
  (`photoUrl` is stored but not analyzed). Adding it later means training
  a small image classifier (e.g. fine-tuned MobileNet/ResNet on a
  livestock-disease image dataset) and calling it from the Java backend
  the same way it calls the C++ engine — the architecture already has the
  seam for this, it just isn't required for the core system to work.

## Project layout

```
livestock-guard/
├── cpp-risk-engine/     # native risk-scoring binary
├── backend-java/        # Spring Boot REST API + H2 database
└── frontend-react/      # Vite + React dashboard
```

## Running it locally

You'll need: a C++ compiler (g++), Java 17+, Maven, and Node.js 18+.
None of this needs internet access at runtime — only the one-time
`mvn`/`npm install` steps need to reach Maven Central / npm to download
dependencies.

### 1. Build the risk engine

```bash
cd cpp-risk-engine
make
make test        # sanity check — should print a JSON risk result
```

### 2. Run the backend

```bash
cd backend-java
mvn spring-boot:run
```

This starts the API on `http://localhost:8080`. It creates a local H2
database file under `backend-java/data/` on first run — no separate
database server needed. If you'd rather use Postgres for a more
"production" demo, swap the three `spring.datasource.*` lines in
`src/main/resources/application.properties`.

If the backend can't find the risk engine binary, check
`livestockguard.risk-engine.path` in `application.properties` — it's a
relative path from wherever you launch the Java process.

### 3. Run the frontend

```bash
cd frontend-react
npm install
npm run dev
```

Open `http://localhost:5173`. Copy `.env.example` to `.env` if you need
to point the frontend at a different backend URL.

### 4. Try it end to end

1. Go to **Report a case**, fill in an animal with a few symptoms, submit.
2. You'll see the risk score and recommendation immediately (this round
   trip went: React → Java → C++ → Java → React).
3. Check **Case ledger** to see it logged.
4. If it's HIGH/CRITICAL, go to **Veterinary desk**, add a vet, assign the
   case.
5. Report 3+ HIGH/CRITICAL cases in the same village to see the
   **Hotspot map** raise an early-warning banner.

## Honest scope note for judges

Per the problem statement's own guidance for this category of tool: this
is presented as a **risk-assessment and decision-support system**, not a
diagnostic guarantee. The rule-based engine is deliberately transparent
so a vet can see exactly why a case was flagged, which matters more for
trust and adoption in the field than a black-box model would.
