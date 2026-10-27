# AnnaDaan — UI & Animation Polish Plan (3-model split)

**Goal:** interactive, "perfectly catchy" for a final-year demo — not flashy, not dull.
**Hard rule:** do NOT change the theme (colours, fonts, radius, layout). Only motion + interaction + feedback.

---

## 0. Ground rules for ALL models (read first)

1. **Use the shared tokens** from `src/lib/motion.js` — never hand-roll new durations/easings.
   | Use | Duration |
   |---|---|
   | Button / hover / tap feedback | 0.15 s |
   | Element entering | 0.3 – 0.4 s |
   | Page-level move | 0.3 s max |
2. **Reduced motion is automatic.** `main.jsx` wraps the app in `<MotionConfig reducedMotion="user">`. Don't add manual `useReducedMotion` checks for transform animations. (CSS keyframes still need their own `@media (prefers-reduced-motion)` block.)
3. **Animate only `transform` and `opacity`.** Never animate `width/height/top/left` (janky on phones). For progress bars use `scaleX` with `origin-left`.
4. **Hover effects use Tailwind `hover:`** (v4 already limits it to hover-capable devices, so nothing "sticks" on phones). Every hover lift needs a matching `active:` press state for touch.
5. **One animation owner per element.** Don't wrap `<DonationCard>` in another motion element — it animates itself.
6. **Phone first, desktop second.** Test at 390 px and 1280 px. Tap targets ≥ 44 px.
7. **Don't use `alert()`** — use `toast` from `sonner` (already mounted).
8. **Stay in your files** (see ownership) to avoid merge conflicts. If you need a change in someone else's file, write it in the "Requests" section at the bottom of this file.
9. Run `npm install && npm run lint && npm run build` before handing back.

### Shared toolbox (built by Model 1 — import, don't rebuild)

| Import | What it does |
|---|---|
| `@/lib/motion` | `EASE_OUT`, `DUR`, `SPRING_SOFT/SNAPPY/BOUNCY`, `fadeUp`, `staggerParent`, `staggerItem`, `popIn` |
| `@/components/motion/Reveal` | `<Reveal delay inView>`, `<Stagger>` + `<StaggerItem>` |
| `@/components/motion/CountUp` | `<CountUp value={64} suffix=" kg" />` counts up on scroll-in |
| `@/components/ui/skeleton` | `<Skeleton className="h-4 w-1/2" />` shimmer placeholder |
| `@/components/DonationCardSkeleton` | loading twin of `DonationCard` |
| `toast` from `"sonner"` | `toast.success("…")`, `toast.error("…")` — themed for light/dark |
| `.soft-pulse` (CSS) | gentle pulse for a "live"/"new" dot |
| `FoodBoxCharacter` | mascot poses: waving, celebrating, flying, meditating, running, squashed |

---

## 1. File ownership

| Model | Owns (only edit these) |
|---|---|
| **Model 1 – Claude (DONE)** | `main.jsx`, `App.jsx`, `index.css` *(append-only section "MOTION FOUNDATION")*, `layouts/*`, `components/{PageTransition,Sidebar,BottomNav,ThemeToggle,DonationCard,DonationCardSkeleton}.jsx`, `components/motion/*`, `components/ui/{button,skeleton,sonner}.jsx`, `lib/motion.js`, `pages/Home.jsx` |
| **Model 2 – "First impressions & input flows" (DONE)** | `pages/Splash.jsx`, `pages/Login.jsx`, `pages/AddDonation.jsx`, `pages/DonationDetail.jsx`, `components/{BowlSteam,FreshnessBadge}.jsx`, `components/ui/{input,select,tabs,label,textarea}.jsx` |
| **Model 3 – "Lists, map, profile & QA" (DONE)** | `pages/AvailableDonationsMap.jsx`, `pages/MyRequests.jsx`, `pages/DonationHistory.jsx`, `pages/Profile.jsx`, `components/{CategoryIcon,PageHeader}.jsx`, plus final QA / cleanup (section 4) |

Order: **Model 1 first (done) → Models 2 and 3 in parallel → Model 3 does the final QA pass.**

---

## 2. MODEL 1 (Claude) — what was done

**Problems found in the original code**
- `PageTransition.jsx` was never used (nothing imported it) and contained **two `export default`s**, so it would have crashed if imported. Route changes had no animation at all.
- `MainLayout` was mounted twice in `App.jsx` (normal vs "focus"), so the sidebar/nav fully re-mounted when going e.g. Home → Donate. That blocks any smooth nav animation.
- `Home` wrapped `DonationCard` in a motion div *and* the card had its own → double animation.
- Loading states were plain text; errors used `alert()`; `sonner` was installed but never mounted.
- 6 of 9 pages had zero motion.

**Changes**
1. **Global motion config** – `main.jsx`: `MotionConfig reducedMotion="user"` + themed `<Toaster />`.
2. **Route transitions (finally working)** – rewrote `PageTransition.jsx` (one export, uses `useOutlet` so the old page fades out cleanly, scrolls to top after exit). Directional nudge kept from your give/receive idea but reduced to 14 px. I **removed the logo "JourneyMark" badge** that popped up on every navigation — it overlapped page content and felt flashy. Easy to restore from the original zip if you love it.
3. **Single persistent layout** – `App.jsx` now has one `MainLayout` route group; `MainLayout.jsx` works out "focus" pages (`/donate`, `/donation/:id`) from the URL. Bottom nav slides in when it appears.
4. **Navigation**
   - Sidebar: the green active pill now *glides* between items (shared `layoutId`), icons scale on hover, Donate button lifts on hover.
   - Bottom nav: soft pill glides between tabs, active icon lifts, tap-shrink on icons, FAB springs on press.
5. **Theme toggle** – sun ↔ moon spin-swap.
6. **DonationCard** – staggered entrance, hover lift + border tint, image zoom, press-shrink. (Used on Home + Map.)
7. **Buttons (global)** – press feedback is now a subtle `scale(0.97)` instead of 1 px shift. Affects every button in the app.
8. **Home** – stats count up on load, skeleton cards while loading, "View map" arrow nudge, banner mascot **switches from flying → celebrating when you hover/press the banner** (image pre-loaded so no flicker). Removed unused `FoodBoxMascot` import.
9. **Phone polish (CSS)** – removed grey tap flash, removed 300 ms tap delay (matters in your Capacitor Android build).
10. **Verified:** `vite build` passes, ESLint clean on all files I touched, app loads in headless Chromium with no console errors and the auth redirect still works. *Not verified:* signed-in pages visually (needs a real Firebase login) — please click through once.

---

## 3a. MODEL 2 — what was done (Claude, round 2)

**Splash** – food bowl floats gently with `BowlSteam` over it (steam colour is now a prop: `<BowlSteam color="#A8B398" />`, default unchanged for the green Login panel); background blobs drift slowly; logo wobbles on hover/tap; "Get Started" has a soft light sweep every ~5 s and a tap-shrink.
**Login** – (mobile) new header: logo + **waving mascot that closes its eyes (meditating pose) while a password field is focused**; sliding pill under Log in / Sign up tabs (tabs are now controlled); show/hide password eye; spinners on both submit buttons; error banners slide in then shake once. Desktop layout untouched.
**AddDonation** – whole form staggers in; photo dropzone cross-fades into the preview with a "Change photo" chip (also fixes a blob-URL memory leak); location button swaps icon pin → spinner → tick; submit button pops when the form becomes valid and shows a "Still needed: …" hint while locked; spinner while posting; errors slide + shake; success screen = celebrating mascot + ripple rings + `toast.success`.
**DonationDetail** – skeleton loading layout; hero/tiles/sections stagger in; confidence bar slides in (transform, not width); sticky mobile action bar slides up; **both `alert()`s removed** → toasts ("Request sent", "Request accepted", "Marked as picked up", "Chat is coming soon", errors); spinners on busy buttons; "not found" now shows the squashed mascot.
**FreshnessBadge** – pops in on mount; only `consume_soon` gets a small pulsing dot.
**Verified:** `vite build` OK, ESLint clean on all files touched, screenshots checked at 390 px, Splash/Login/AddDonation clicked through in headless Chromium with zero console errors. *Not verified:* DonationDetail with live Firestore data (needs a real login).

**Notes for Model 3**
- `FreshnessBadge` now animates itself; the wrapper in `AvailableDonationsMap.jsx` / `MyRequests.jsx` is fine, no change needed.
- `components/characters/PeekingCharacter.jsx` and `CharacterScene.jsx` are still unused — I chose the box mascot for Login instead. Delete them in the QA pass.
- `DonationDetail` still imports nothing from Model 3's files.

---

## 3. MODEL 2 — original brief (kept for reference)

Files: `Splash`, `Login`, `AddDonation`, `DonationDetail` (+ `BowlSteam`, `FreshnessBadge`, form `ui/*`).

**Splash.jsx**
- Make the food illustration gently float (`y: [0,-6,0]`, 5 s loop) and reuse `BowlSteam` over it (same as Login) so the first screen is alive.
- Stagger already exists; add a soft hover-shine on "Get Started" (CSS gradient sweep, no new colours) and `whileTap` shrink.
- Note: background is hard-coded `#F5F1E7` — it ignores dark mode. Switch to `bg-background` only if the dark look matches; otherwise leave.

**Login.jsx**
- **Phone has no hero** (left panel is `hidden md:flex`). Add a compact mascot/steam header on mobile so the phone login feels as rich as desktop. `PeekingCharacter` exists but isn't used anywhere — either wire it above the form (it already reacts to `activeField="email"|"password"`) or delete it.
- Animated underline/pill that slides between "Log in" / "Sign up" tabs (`layoutId`).
- Submit button: spinner + disabled state while `busy`; **shake** the error banner once (x: [0,-6,6,-3,0], 0.35 s).
- Cross-fade between login/signup form content (`AnimatePresence mode="wait"`).

**AddDonation.jsx** (currently zero motion)
- Wrap form sections in `<Stagger>` / `<StaggerItem>`.
- Photo picker: cross-fade dashed placeholder → preview, small "Change photo" chip on hover; `whileTap` on the dropzone.
- Location button: show a ✔ icon with `popIn` once `location` is set; subtle pulse while `locating`.
- Disable-state of "Post donation": animate to enabled when form becomes valid (opacity/scale only).
- **Success screen:** replace the plain check circle with `FoodBoxCharacter type="celebrating"` + `popIn` heading, and a `toast.success`. Keep the existing 1.4 s redirect.
- Replace any inline error with a slide-in (see `ErrorMessage` in Login for the pattern).

**DonationDetail.jsx**
- Replace "Loading..." with skeleton blocks matching the layout (`Skeleton`).
- Wrap `InfoTile`s in `<Stagger>`; hero image/icon `popIn`.
- Confidence bar: animate fill with `scaleX` (`origin-left`) from 0 → value over 0.8 s on mount. Do **not** animate `width`.
- Request button: on success show a quick check + `toast.success("Request sent")` before navigating.
- **Remove `alert()`** (2 places): "Chat comes later" → `toast("Chat is coming soon")`; errors → `toast.error(message)`.
- Owner "Requests" list: each row enters with `StaggerItem`; Accept / Mark picked up buttons get a spinner when `busy`.

**FreshnessBadge.jsx:** tiny enter `popIn`; for `consume_soon` add a small dot using `.soft-pulse` (not on `safe`/`unsafe` — keep calm).

---

## 4. MODEL 3 — "Lists, map, profile & final QA"

Files: `AvailableDonationsMap`, `MyRequests` (incl. `RequestDetail`), `DonationHistory`, `Profile`, `PageHeader`, `CategoryIcon`.

**AvailableDonationsMap.jsx** (biggest "wow" opportunity)
- **Remove** the `motion`-less hover wrapper around `<DonationCard>` (`hover:-translate-y-0.5`) — the card now does its own hover; this would double-lift. Pass `index={i}` instead for the stagger.
- **Linked hover:** hovering/tapping a list card highlights its map marker (bigger radius + ring) and vice-versa; clicking a marker scrolls its card into view. This is the single most "interactive" thing you can add.
- Replace `map.fitBounds` jump with `map.flyToBounds(..., { duration: 0.8 })` and `map.flyTo` when a marker is selected.
- Animate the "N donations available" number with `<CountUp />`.
- Skeletons while `useAvailableDonations` is loading; `Stagger` on the banner.
- Keep `scrollWheelZoom={false}` on mobile (prevents scroll-trap); optionally enable on desktop only.

**MyRequests.jsx**
- `Stagger` the request rows (active + history tabs); cross-fade tab content.
- Tabs: sliding indicator under the active tab (`layoutId`).
- **RequestDetail status stepper (Pending → Accepted → Claimed):** animate the connecting line with `scaleX`/`scaleY`, pop the current step (`popIn`), and when status becomes `Claimed` show `FoodBoxCharacter type="celebrating"` once.
- Cancel request: confirm step + `toast`.

**DonationHistory.jsx** — `Stagger` rows, tab cross-fade, `CountUp` on any totals.

**Profile.jsx**
- Stat tiles → `CountUp`; hover-lift tiles (`hover:-translate-y-0.5`, `active:` press).
- Avatar: `whileTap` + soft scale-in of the new image after upload; `toast.success("Photo updated")`.
- Settings rows: press feedback; logout/destructive actions get a subtle confirm.
- Hero gradient card: single gentle entrance only (no looping animation).

**PageHeader.jsx** — back arrow nudges left on hover (`group-hover:-translate-x-0.5`).

### Final QA / cleanup checklist (Model 3, last)
- [ ] `npm run lint` and `npm run build` clean.
- [ ] Test **390 px** and **1280 px**, light **and** dark mode, on every page.
- [ ] Turn on OS "Reduce motion" → nothing loops, nothing flies.
- [ ] No horizontal scrollbar during page transitions.
- [ ] Sticky headers (`PageHeader`) and sticky bottom action bar (DonationDetail) still stick.
- [ ] Remove dead code: `components/FoodBoxMascot.jsx` + `.food-mascot*` CSS (unused), `components/CharacterScene.jsx` + empty `characters/characters.css` (unused; also duplicates `PeekingCharacter`), the first (overridden) `.donor-banner__mascot` rule in `index.css`.
- [ ] `button.jsx` imports `cn` from the `"cn"` npm package while everything else uses `@/lib/utils` — switch to `@/lib/utils` for consistency.
- [ ] Performance on a mid-range Android: no more than ~3 simultaneous looping animations on screen. Bundle is ~1.4 MB — optional: `React.lazy` the Map page (Leaflet) and use `LazyMotion` + `m` components.
- [ ] Home stats (128 / 64 kg / 23) are **hard-coded demo numbers** — wire to real counts or label them as demo before presenting.

---

## 4a. MODEL 3 — what was done (Claude, round 3)

**AvailableDonationsMap** – linked hover (card <-> marker: bigger pin + halo, ring on the card); clicking a marker flies the map to it, keeps the ring while its popup is open, and (desktop only) scrolls its card into view; `flyToBounds` for the initial/updated fit (first fit is instant, later fits fly; skipped when the pin set is unchanged); `CountUp` on the banner number; skeleton cards while loading; banner staggers in; cards get `index` for the stagger and the extra hover wrapper is gone; wheel-zoom only on desktop; popups no longer auto-pan (the map already flies to the marker).
**MyRequests** – page staggers in; summary numbers `CountUp`; sliding tab pill (new shared `components/SlidingTab.jsx`, `layoutId`) with controlled tabs; tab content staggers in on every switch (= cross-fade); skeleton rows while loading; press feedback on rows. **RequestDetail:** skeleton loading layout; stepper circles pop in, connecting lines fill with `scaleY`/`scaleX` (transform only), current step has a ring; mascot celebrates for ~2.8 s when status is `Claimed` then settles; cancel is now a two-step inline confirm with spinner + `toast.success/error`; both `alert()`s gone (chat button -> `toast("Chat is coming soon")`).
**DonationHistory** – stagger, sliding pill, `CountUp` on both totals, skeletons, tile/row press states.
**Profile** – hero single entrance; stat tiles stagger + `CountUp` + hover lift/press; avatar `whileTap`, new photo scales in, `toast.success("Photo updated")` (non-image -> `toast.error`); view/edit form cross-fade; gear icon rotates; settings rows are buttons with press feedback + "Coming soon" toast; Log Out needs a second tap (auto-resets after 3.5 s); "Profile updated" toast.
**PageHeader** – back arrow nudges left on hover / press.

**QA / cleanup done**
- Deleted unused `FoodBoxMascot.jsx`, `CharacterScene.jsx`, `PeekingCharacter.jsx` and empty `characters.css`; removed all `.food-mascot*` CSS.
- First `.donor-banner__mascot` rule trimmed to the two properties the later rule doesn't override (height, opacity) so the banner looks identical.
- All `components/ui/*` now import `cn` from `@/lib/utils` (it re-exports the same function).
- Dummy data removed: Home stats and Profile counts now come from real Firestore `donations` (new `hooks/useCommunityStats.js`, `useMyDonations`); unused mock arrays deleted from `lib/mockData.js` (labels/helpers kept).

**Not verified (no node_modules / network in the sandbox):** `npm run lint`, `npm run build`, and visual click-through. Syntax and undefined-identifier checks were run with the TypeScript parser. Run `npm install && npm run lint && npm run build` and click through the signed-in pages once.

---

## 5. Requests between models (append below)

_(Model 2 / 3: add any change you need in a file you don't own here.)_
