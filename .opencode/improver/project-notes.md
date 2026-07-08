# Project Notes — WhosIn

Last updated: 08-Jul-2026

## Stack
- React + TypeScript + Vite (Rolldown)
- Tailwind CSS v4
- Supabase (auth + DB)
- Motion (framer-motion) for animations
- Deployed on Vercel: https://whosin-rosy.vercel.app

## Key Architecture Decisions
- State via Zustand store (useAppStore.ts) — single store with slice patterns
- Supabase for persistence; optimistic updates (state writes before DB sync)
- Auth: Google OAuth + phone signup; RLS open (ALL on all tables for anon + authenticated)
- Confirmation dialogs use custom ConfirmModal (components/ui/index.tsx) — never window.confirm()

## Supabase Migrations Status
- `20250706000300_add_event_category_summary`: ✅ Applied (category + summary on events)
- `20250706000400_add_event_route_fields`: ✅ Applied 08-Jul-2026 (route_name + route_details on events)
- `20250708000500_auth_authenticated_rls_and_trigger`: ✅ Applied (auth trigger + RLS policies)
- `20250708000600_fix_phone_nullable`: ✅ Applied (phone nullable)
- 2 blob URL stories cleaned from DB (expired/invalid)

## Recent Changes (08-Jul-2026)
- **Story viewer**: `object-cover` → `object-contain` so full image visible with black bars instead of cropping
- **Story upload**: Blob URLs (`URL.createObjectURL`) replaced with base64 data URLs (FileReader.readAsDataURL) to persist across navigations/sessions — fixes black screen on reload
- **Delete story**: `deleteStory()` added to store (state + DB), trash icon on own stories in viewer with ConfirmModal (danger variant)
- **Badge system**: 12 criteria auto-evaluated in `evaluateBadges()`, grid on ProfilePage (🔒 vs glow)
- **ConfirmModal**: reusable component with danger/default variant, used everywhere instead of window.confirm()
- **FAB**: `z-[60]` above BottomNav (`z-50`)
- **Section headers**: icon alignment fix via `.section-title > span { display: inline-flex; align-items: center; }`
