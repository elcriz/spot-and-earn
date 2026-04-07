# Spot & Earn

A mobile-first Progressive Web App for tracking animal sightings and earnings for children.

## Features

- 🦌 Track deer sightings (+€1.00 each)
- 🐇 Track hare sightings (+€0.50 each)
- 👨‍👩‍👧‍👦 Manage multiple children
- 💰 View balances and mark as paid
- 📜 View complete sighting history
- 💾 Offline-first with IndexedDB storage
- 📱 Mobile-first responsive design
- 🔄 PWA support for installation

## Tech Stack

- React 18 with TypeScript
- Vite for build tooling
- Material-UI (MUI) v5
- React Router v6
- IndexedDB via `idb` library
- PWA support via `vite-plugin-pwa`

## Getting Started

### Install dependencies

\`\`\`bash
npm install
\`\`\`

### Run development server

\`\`\`bash
npm run dev
\`\`\`

### Build for production

\`\`\`bash
npm run build
\`\`\`

### Preview production build

\`\`\`bash
npm run preview
\`\`\`

## Usage

1. **Home Screen**: Select which children are with you, then tap animal buttons to log sightings
2. **Balances**: View current unpaid balances and mark all as paid
3. **History**: View all sightings in reverse chronological order
4. **Settings**: Add, edit, or remove children

## Data Model

All data is stored locally in IndexedDB:

- **Children**: Track child names and active/inactive state
- **Sightings**: Track animal type, value, timestamp, and payment status
- Balances are derived from unpaid sightings (never stored directly)

## Architecture

```
src/
├── components/     # Reusable components (Layout, etc.)
├── pages/          # Page components (Home, Balances, History, Settings)
├── hooks/          # Custom hooks (useApp, useBalances)
├── models/         # TypeScript types and constants
├── services/       # IndexedDB service layer
├── App.tsx         # Main app with routing
└── main.tsx        # Entry point
```

## License

MIT
