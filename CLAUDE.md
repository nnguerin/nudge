# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development
npm start              # Start Expo development server
npm run web           # Run on web
npm run ios           # Build/run on iOS simulator
npm run android       # Build/run on Android emulator

# Code Quality
npm run lint          # Run ESLint + Prettier checks
npm run format        # Fix ESLint + run Prettier formatting

# Database
npm run regen-db-types  # Regenerate Supabase TypeScript types (run after schema changes)
```

## Technology Stack

- **Expo/React Native** with Expo Router (file-based routing in `app/`)
- **NativeWind** - Tailwind CSS for React Native (requires Metro + Babel integration)
- **Supabase** - PostgreSQL backend with auto-generated TypeScript types
- **React Query** - Server state with optimistic updates
- **Zustand** - Client state (primarily auth/session)

## Architecture

### Data Flow

```
api/           → hooks/           → components/
(Supabase calls)  (React Query)      (UI)
```

- `api/` - Direct Supabase client operations with type-safe DTOs
- `hooks/` - React Query hooks wrapping API calls, handle caching and optimistic updates
- `store/store.ts` - Zustand store for global session/profile state

### Provider Structure (app/_layout.tsx)

```
QueryClientProvider → SupabaseAuthProvider → GestureHandlerRootView → Router
```

### Query Key Pattern

Hierarchical keys in `hooks/nudges.ts` for granular cache invalidation:
```typescript
nudgeKeys.list(userId)    // ['nudges', 'list', userId]
nudgeKeys.detail(id)      // ['nudges', 'detail', id]
```

## Key Patterns

### Supabase Many-to-One Workaround

Supabase returns arrays for joined relationships. Extract first element manually:
```typescript
creator_profile: nudge.creator_profile[0]
```

### Optimistic Updates

Upvote mutations use `onMutate` for instant UI updates with rollback on error. See `hooks/nudges.ts`.

### Path Aliases

`@/*` maps to project root (configured in tsconfig.json):
```typescript
import { useStore } from '@/store/store'
```

## Environment Setup

Create `.env.local` with:
```
EXPO_PUBLIC_SUPABASE_URL=<your_supabase_url>
EXPO_PUBLIC_SUPABASE_ANON_KEY=<your_supabase_anon_key>
```

## Key Files

- `database.types.ts` - Auto-generated, do not edit manually
- `api/types.tsx` - DTOs and API response types
- `utils/supabase.ts` - Supabase client singleton
