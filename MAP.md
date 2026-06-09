# SafeSchool — MAP.md

## Current Phase
> Phase 2 — Auth, Users & Core API

## Completed
- [x] Monorepo folders scaffolded
- [x] Docker Compose foundation added: nginx, php-fpm, MySQL, Redis, Mailpit
- [x] Laravel backend installed and upgraded to Laravel 12
- [x] Laravel migrations and starter tests verified
- [x] React + Vite frontend installed
- [x] Expo mobile app bootstrapped
- [x] Mobile ESLint and TypeScript checks configured
- [x] GitHub Actions CI configured
- [x] Phase 1 setup documented
- [x] Phase 1 final verification
- [x] Clerk backend SDK installed
- [x] Local users table prepared for Clerk identities
- [x] Spatie roles and permissions installed
- [x] Base roles seeded: admin, teacher, parent, student
- [x] Roles and permissions foundation verified
- [x] School model created
- [x] Users scoped to schools with nullable school_id
- [x] Demo school seeded for local development
- [x] Clerk webhook user sync
- [x] Clerk webhook signature verification added
- [x] Clerk JWT middleware for protected API routes
- [x] Protected /api/me endpoint added
- [x] Base API controller and response format
- [x] Parent/student relationship model
- [x] Guardian/student linking service with school-scope validation
- [x] Teacher/class relationship model
- [x] Class assignment service with school-scope validation
- [x] Phase 2 backend foundation review
- [x] Frontend /api/me error messages surfaced from backend
- [x] Frontend Clerk integration
- [x] Mobile Clerk dependencies installed
- [x] Mobile Clerk provider and /api/me profile wiring
- [x] Mobile Expo web support configured
- [x] Mobile Android dev-client config added
- [x] Mobile auth foundation deferred after environment limit identified
- [x] Frontend Tailwind foundation added
- [x] Frontend app shell components drafted
- [x] Frontend role-aware dashboard drafted
- [x] Frontend React Router foundation added
- [x] Frontend authenticated layout routes added
- [x] Backend classes index endpoint added
- [x] Backend classes index tests added
- [x] Frontend classes service connected to API
- [x] Frontend classes table renders school-scoped data
- [x] Demo class seeder added for local development
- [x] Backend class creation endpoint added
- [x] Backend class creation tests added
- [x] Frontend class creation form added
- [x] Frontend toast feedback added for class creation

## In Progress
- [ ] Frontend class management actions

## Up Next
- [ ] Frontend class management actions
- [ ] Frontend students screen foundation
- [ ] Mobile Android dev-client verification

## Decisions Log
| Date | Decision | Reason |
|------|----------|--------|
| 2026-06-04 | Monorepo structure | Keeps backend, web, and mobile changes atomic |
| 2026-06-04 | Laravel 12 over Laravel 11 | Laravel 11 is past security support; Composer blocks affected versions |
| 2026-06-06 | Clerk for authentication, Laravel for user domain data | Clerk owns identity; SafeSchool owns roles, school scope, and app-specific relationships |
| 2026-06-06 | Spatie Permission for authorization roles | Battle-tested Laravel role/permission package with policy-friendly integration |
| 2026-06-07 | Svix verification for Clerk webhooks | Public webhook endpoints must verify signed raw payloads before syncing users |
| 2026-06-07 | /api/me as first protected route | Frontend and mobile need a single SafeSchool profile endpoint after Clerk login |
| 2026-06-07 | Standard API response envelope | API consumers should receive predictable data/message and error/errors shapes |
| 2026-06-08 | Guardian/student pivot over parent_id | Real families can have multiple guardians and students; relationship metadata belongs on the link |
| 2026-06-08 | SchoolClass model over Class | `class` is a PHP keyword; school class membership needs role metadata and school scoping |
| 2026-06-08 | In-memory SQLite for backend tests | Feature tests should be fast and isolated from the local MySQL development database |
| 2026-06-09 | Defer mobile native verification | Mobile auth code is wired, but Android dev-client builds require a stronger local Android/JDK setup |
| 2026-06-09 | Tailwind for frontend styling | Component-scoped utility classes are a better long-term fit than growing custom page CSS |
| 2026-06-09 | React Router for frontend navigation | Product screens need direct URLs, refresh safety, and future nested routes |
