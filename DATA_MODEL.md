# Data Model

## Child

```ts
type Child = {
  id: string
  name: string
  active: boolean
}
```

## Sighting

```ts
type Sighting = {
  id: string
  timestamp: number
  animal: 'deer' | 'hare'
  value: number
  childIds: string[]
  childNamesSnapshot: string[]
  paid: boolean
}
```

## Notes

* Do NOT store balances
* Always derive from sightings
* Use snapshot names to preserve history integrity
