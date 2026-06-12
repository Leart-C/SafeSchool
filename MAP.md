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
- [x] Backend class update/archive endpoint added
- [x] Backend class update/archive tests added
- [x] Frontend class edit/archive actions added
- [x] Frontend classes feature split into form and table components
- [x] Backend students index endpoint added
- [x] Backend students index tests added
- [x] Frontend students service connected to API
- [x] Frontend students table renders school-scoped data
- [x] Demo student seeder added for local development
- [x] Backend student profile endpoint added
- [x] Backend student profile tests added
- [x] Student controllers refactored to thin service-backed actions
- [x] Frontend student profile route added
- [x] Frontend student profile split into focused components
- [x] Frontend students list split into header and table components
- [x] Class API controller refactored to service-backed actions
- [x] Clerk webhook controller refactored to service-backed processing
- [x] Backend attendance records table added
- [x] Backend attendance index endpoint added
- [x] Backend attendance index tests added
- [x] Frontend attendance service connected to API
- [x] Frontend attendance table renders school-scoped records
- [x] Demo attendance seeder added for local development
- [x] Backend class attendance roster endpoint added
- [x] Backend class attendance roster tests added
- [x] Backend class attendance save endpoint added
- [x] Backend class attendance save tests added
- [x] Frontend attendance taking UI added
- [x] Frontend attendance save feedback and roster refresh added
- [x] Frontend TanStack Query provider added
- [x] Authenticated profile migrated to TanStack Query
- [x] Attendance records migrated to TanStack Query
- [x] Frontend TanStack Query foundation completed
- [x] Classes page migrated to TanStack Query
- [x] Students list migrated to TanStack Query
- [x] Student profile migrated to TanStack Query
- [x] Attendance taking panel migrated to TanStack Query
- [x] Centralized frontend query keys added
- [x] Attendance role permissions seeded
- [x] Attendance backend role and class-scope access added
- [x] Attendance role-access tests added
- [x] Frontend attendance management UI hidden by role
- [x] Backend messages table added
- [x] Message model and audience enum added
- [x] Backend message list/create endpoints added
- [x] Backend message list/create tests added
- [x] Frontend messages service connected to API
- [x] Frontend messages list and create form added
- [x] Frontend message creation gated by role
- [x] Shared date formatter supports dates and timestamps
- [x] Director role added to backend roles
- [x] Director attendance and messaging permissions seeded
- [x] Director attendance access added
- [x] Director dashboard access added
- [x] Director role access tests added
- [x] Message lifecycle fields added
- [x] Backend message update/archive endpoints added
- [x] Backend archived messages hidden from active list
- [x] Backend message lifecycle tests added
- [x] Frontend message edit/archive actions added
- [x] Frontend UI helper and base UI primitives refreshed
- [x] Frontend app shell and dashboard UI refreshed
- [x] Frontend classes UI refreshed
- [x] Frontend students list and profile UI refreshed
- [x] Frontend attendance UI refreshed
- [x] Frontend messages UI refreshed
- [x] Backend user management permissions seeded
- [x] Backend users index endpoint added
- [x] Backend user role update endpoint added
- [x] Backend user management tests added
- [x] Frontend users management page added
- [x] Frontend role-aware users navigation added
- [x] Frontend user role editing added
- [x] Class membership permissions seeded
- [x] Backend class profile endpoint added
- [x] Backend class member add/remove endpoints added
- [x] Backend class profile and membership tests added
- [x] Frontend class profile route added
- [x] Frontend class membership management UI added
- [x] Backend student profiles table added
- [x] Backend official student registration endpoint added
- [x] Backend student registration tests added
- [x] Frontend student registration form added
- [x] Frontend official student profile details added
- [x] Backend guardian registration/linking endpoint added
- [x] Backend guardian registration/linking tests added
- [x] Guardian phone field added to user records
- [x] Frontend guardian linking form added to student profile
- [x] Backend guardian edit/unlink endpoints added
- [x] Backend guardian lifecycle tests added
- [x] Frontend guardian edit/unlink actions added

## In Progress
- [ ] Guardian edit/unlink branch verification and commit

## Up Next
- [ ] Guardian search/reuse picker
- [ ] Parent-facing child dashboard
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
| 2026-06-09 | Thin API controllers with service-backed actions | Controllers should coordinate HTTP only; domain querying, mapping, and processing live in services |
| 2026-06-10 | TanStack Query for frontend API state | Server state should use a dedicated cache/refetch layer instead of repeated useEffect/useState fetching |
