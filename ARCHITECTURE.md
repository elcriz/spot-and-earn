# Architecture

## State Management

* React Context
* Custom hook: useAppState()

## Storage

* IndexedDB via idb
* Data hydrated on app load

## Routing

* React Router v6
* Routes:

  * /
  * /balances
  * /history
  * /settings

## UI

* Material UI components
* BottomNavigation for tabs

## Data Flow

UI → Context → IndexedDB
↑
Hydration on load
