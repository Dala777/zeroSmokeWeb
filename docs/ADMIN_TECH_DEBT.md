# Admin Panel Tech Debt Report

Generated: 2026-05-22

---

## 1. Pages Still Using Mock Data

| Page | File | Status | Notes |
|---|---|---|---|
| UsersList | `frontend/src/pages/admin/UsersList.tsx` | ✅ **MIGRATED** | Now consumes `/api/users` real endpoints |
| Dashboard | `frontend/src/pages/admin/Dashboard.tsx` | ✅ **REAL** | Uses `adminStatsService` with real API calls |
| MessagesList | `frontend/src/pages/admin/MessagesList.tsx` | ⚠️ **HYBRID** | Uses `storageService` (API + localStorage fallback) |
| MessageDetail | `frontend/src/pages/admin/MessageDetail.tsx` | ⚠️ **HYBRID** | Uses `storageService` (API + localStorage fallback) |
| FaqsList | `frontend/src/pages/admin/FaqsList.tsx` | ❌ **MOCK** | 4 hardcoded FAQs, no API calls |
| ArticlesList | `frontend/src/pages/admin/ArticlesList.tsx` | ❌ **MOCK** | 3 hardcoded articles, no API calls |
| ArticleEdit | `frontend/src/pages/admin/ArticleEdit.tsx` | ❌ **MOCK** | Uses mock data for edit, no real API integration |
| HomePage | `frontend/src/pages/admin/HomePage.tsx` | ❌ **LOCALSTORAGE** | Uses `storageService` with localStorage only |

### Migration Priority

1. **High**: FaqsList, ArticlesList — backend already has real endpoints (`/api/faqs`, `/api/articles`)
2. **Medium**: ArticleEdit — needs create/update flow with real API (`/api/articles`)
3. **Low**: HomePage — content management, localStorage persistence may be acceptable

---

## 2. Backend Routes Not Consumed by Frontend

These backend routes exist but are not used by any admin page:

| Route | Controller | Frontend Usage |
|---|---|---|
| `GET /api/admin/stats/high-risk-users` | `adminStats.controller` | ✅ Newly added to Dashboard |
| `GET /api/admin/stats/symptoms` | `adminStats.controller` | ✅ Newly added to Dashboard |
| `GET /api/admin/stats/relapses` | `adminStats.controller` | ✅ Newly added to Dashboard |
| `GET /api/users` | `user.controller` | ✅ Newly connected via UsersList |
| `GET /api/users/:id` | `user.controller` | ❌ Not used |
| `POST /api/users` | `user.controller` | ❌ Not used (create user) |
| `PUT /api/users/:id` | `user.controller` | ✅ Used for status toggle |
| `DELETE /api/users/:id` | `user.controller` | ✅ Used for delete |
| `GET /api/articles` | `article.controller` | ❌ Not used by admin (FaqsList uses mock) |
| `GET /api/faqs` | `faq.controller` | ❌ Not used by admin (ArticlesList uses mock) |
| `GET /api/messages` | `message.controller` | ❌ Not used (storageService fallback used instead) |

---

## 3. Dead / Unused Components

| File | Reason |
|---|---|
| `frontend/src/components/admin/AnalyticsChartCard.tsx` | Used by Dashboard — **alive** |
| `frontend/src/components/admin/AdminStatCard.tsx` | Used by Dashboard — **alive** |
| `frontend/src/components/admin/AdminLayout.tsx` | Used as layout wrapper — **alive** |
| `frontend/src/components/admin/AdminSidebar.tsx` | Used inside AdminLayout — **alive** |
| `frontend/src/components/admin/ErrorState.tsx` | Used by Dashboard & UsersList — **alive** |
| `frontend/src/components/admin/LoadingState.tsx` | Used by Dashboard & UsersList — **alive** |

No dead admin components found.

---

## 4. Duplicate / Redundant Code

- **`messages` route**: Both `adminStats.controller` (has notification stats) and `message.controller` (contact form messages) handle different concepts. **Not duplicate**.
- **`api.ts` vs `adminStatsService.ts`**: Both configure axios with auth headers but use different patterns (`api.ts` sets default headers, `adminStatsService.ts` passes per-request). **Should be unified**.
- **`storageService.ts`**: Contains its own `Article`, `FAQ`, `Message` interfaces that duplicate those in `types/index.ts`. **Potential refactor target**.

---

## 5. Broken Routes / Navigation

| Nav Link In Sidebar | Route | Exists? |
|---|---|---|
| Dashboard | `/admin` | ✅ |
| Dashboard | `/admin/dashboard` | ✅ |
| Homepage | `/admin/homepage` | ✅ |
| Articles | `/admin/articles` | ✅ |
| Articles | `/admin/articles/new` | ✅ |
| Articles | `/admin/articles/edit/:id` | ✅ |
| FAQs | `/admin/faqs` | ✅ |
| Users | `/admin/users` | ✅ |
| Messages | `/admin/messages` | ✅ |
| Messages | `/admin/messages/:id` | ✅ |
| Admins | `/admin/admins` | ❌ No route defined |
| Settings | `/admin/settings` | ❌ No route defined |

### Missing Routes
- `/admin/admins` — referenced in sidebar but not in `App.tsx` router
- `/admin/settings` — referenced in sidebar but not in `App.tsx` router

---

## 6. Type Inconsistencies

- `types/index.ts` defines `User` with `id?: number` and `_id?: string` — the real API returns `_id` as string; the `id` field is never used
- `Article` type in `types/index.ts` has both `id` (number) and `_id` (optional string) — real API uses `_id`
- `storageService.ts` redefines its own interfaces instead of importing from `types/index.ts`

---

## 7. Recommendations

1. **Migrate FaqsList** — connect to `faqAPI` (already exists in `api.ts`)
2. **Migrate ArticlesList** — connect to `articleAPI` (already exists in `api.ts`)
3. **Migrate ArticleEdit** — implement create/update via `articleAPI`
4. **Remove `storageService.ts` fallback** — use real API everywhere, remove fallback to localStorage
5. **Unify type definitions** — use `types/index.ts` exclusively, remove inline interfaces
6. **Add `/admin/admins` and `/admin/settings` routes** or remove from sidebar
7. **Unify auth pattern** — make `adminStatsService.ts` use axios defaults from `api.ts` instead of per-request headers
8. **Add error boundaries** — wrap admin routes with React error boundaries for production robustness
9. **Add `lastLogin` tracking** — the auth controller should update `lastLogin` on each successful login (it may already do this, verify)
10. **Standardize API response format** — some endpoints return `{ success, data }`, others return plain arrays (`/api/users`)
