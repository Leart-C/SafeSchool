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

## In Progress
- [ ] Phase 2 backend foundation review

## Up Next
- [ ] Phase 2 backend foundation review
- [ ] Frontend Clerk integration
- [ ] Mobile Clerk integration

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
