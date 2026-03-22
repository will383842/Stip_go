# Stip Me — Stamp Your World

App mobile d'exploration qui transforme chaque lieu visité en un stamp sur ta carte du monde.

## Stack

| Composant | Technologie |
|-----------|------------|
| Backend | Laravel 12 (PHP 8.2+) |
| Base de données | PostgreSQL 16 + PostGIS 3.4 |
| Cache | Redis 7 (2 instances : cache 6379 + session 6380) |
| Frontend mobile | React Native + Expo SDK 55 |
| Carte | @rnmapbox/maps |
| UI | NativeWind 4 (Tailwind CSS) |
| State | Zustand 5 + TanStack Query v5 |
| WebSocket | Laravel Reverb |
| Admin | Filament v3.3 |
| Tests | Pest (backend) + Jest (frontend) + Maestro (E2E) |

## Prérequis

- PHP 8.2+ avec extensions `pgsql`, `redis`
- Composer
- Node.js 20+
- Android Studio (emulateur Android)
- Expo Go sur iPhone (test iOS)

## Installation backend

```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
# Configurer les identifiants PostgreSQL dans .env
php artisan migrate
php artisan serve
# Vérifier : curl http://localhost:8000/api/v1/health
```

## Installation mobile

```bash
cd mobile
npm install
npx expo start
# Scanner le QR code avec Expo Go (iPhone) ou l'emulateur Android
```

## Tester sur iPhone

1. Installer **Expo Go** depuis l'App Store (gratuit)
2. Lancer `npx expo start` sur le PC
3. Scanner le QR code avec l'iPhone
4. Hot reload automatique a chaque modification

Pour les modules natifs (Mapbox, haptics) : `eas build --platform ios --profile development`

## Lancer les tests

```bash
# Backend
cd backend
vendor/bin/pint --test          # Code style
vendor/bin/phpstan analyse      # Analyse statique (level 6)
php artisan test                # Tests Pest

# Mobile
cd mobile
npx tsc --noEmit                # TypeScript check
npx jest                        # Tests Jest
```

## Structure des dossiers

```
Stip_Me/
├── backend/           Laravel 12 (API + site web + admin Filament)
│   ├── app/
│   │   ├── Http/Controllers/Api/V1/   Controllers API
│   │   ├── Http/Controllers/Web/      Controllers pages web
│   │   ├── Models/                    Eloquent models
│   │   └── Services/                  Business logic
│   ├── config/stipme.php              Config metier (limites, feature flags)
│   ├── routes/api.php                 Routes API /api/v1/*
│   └── tests/                         Pest tests
├── mobile/            React Native + Expo
│   └── src/
│       ├── screens/       Ecrans (auth, map, passport, profile, dm, squad...)
│       ├── components/    Composants (atoms, molecules, organisms)
│       ├── stores/        Zustand stores (state client)
│       ├── hooks/         Custom hooks
│       ├── services/      API client (Axios)
│       ├── i18n/          Traductions FR + EN
│       ├── theme/         Couleurs, fonts, spacing, radius
│       └── navigation/    React Navigation (3 tabs)
└── docs/              Documentation
```

## Specs

Documents de reference : `App_StipMe/`

- `CLAUDE.md` — 89 regles critiques
- `STIP-ME-MVP1-DEFINITIF.md` — Features MVP1 (~57 features)
- `STIP-ME-MVP1-COMPLET.md` — Tables SQL, routes API, Redis, crons
- `GUIDE-IMPLEMENTATION-MVP1.md` — Versions, configs, commandes
- `PLANNING-GLOBAL-IMPLEMENTATION.md` — Planning sprints
