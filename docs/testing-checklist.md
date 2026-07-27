# HarvestIQ — Complete Testing Checklist

Use this while running the app at **http://localhost:3000**.

Mark each item: `[ ]` not tested · `[x]` passed · `[!]` failed (note what broke)

**Environment:** Browser _____________ · Device _____________ · Date _____________

---

## 0. Start-up & shell

- [ ] App loads without a blank/white screen
- [ ] “Loading your workspace…” appears briefly, then dashboard
- [ ] **Saved locally** badge shows (top-right of main area)
- [ ] Brand **HarvestIQ** is visible in the sidebar/header
- [ ] Profile chip (desktop) shows name + farm/cooperative

### Navigation — desktop sidebar links

- [ ] **Dashboard**
- [ ] **My Farms**
- [ ] **Diagnose**
- [ ] **Reports**
- [ ] **Resources**
- [ ] **Settings**
- [ ] Active link is visually highlighted on the current page

### Navigation — mobile

- [ ] **Menu** button opens/closes the nav list
- [ ] **Close** dismisses the menu
- [ ] Bottom quick nav: **Home / Farms / Scan / Reports / Help / Settings**
- [ ] Each quick-nav item routes correctly
- [ ] Toasts appear above the bottom nav (not hidden behind it)

---

## 1. Dashboard (`/`)

### Buttons / links

- [ ] **◎ New diagnosis** → goes to `/diagnose`

### Empty state (no data yet)

- [ ] Farms tracked = `0`
- [ ] Diagnoses run = `0`
- [ ] Avg. confidence = `—`
- [ ] Active high-risk alerts = `0`
- [ ] Recent activity empty message
- [ ] Highest current risk empty message
- [ ] Risk by crop type empty message
- [ ] Confidence trend empty message

### With data (after saving ≥1 diagnosis with forecast)

- [ ] Stats update correctly
- [ ] Recent activity shows disease name, farm, date, severity badge
- [ ] Risk leaderboard shows farm + risk badge
- [ ] Risk-by-crop bars render
- [ ] Confidence trend chart renders (≥2 diagnoses)

---

## 2. My Farms (`/farms`)

### Buttons

- [ ] **+ Add farm** (header)
- [ ] **+ Add your first farm** (empty state)
- [ ] **Edit** on a farm card
- [ ] **Remove** on a farm card
- [ ] Modal **Cancel**
- [ ] Modal **Save farm** / **Saving…** while saving

### Add farm — happy path

- [ ] Open modal
- [ ] Enter name, crop, acres, location
- [ ] Save → toast “Farm saved”
- [ ] Card appears with crop tag, acreage, diagnoses count `0`
- [ ] Refresh page → farm still there (persistence)

### Add farm — validation

- [ ] Empty name → error “Farm name is required” (or similar) + toast
- [ ] Name with 1 character → min-length error
- [ ] Negative acreage → number validation error
- [ ] Very long location → max-length error
- [ ] Invalid fields stay highlighted until corrected

### Edit farm

- [ ] Edit loads existing values
- [ ] Change fields → Save → card updates
- [ ] Refresh → edits persist

### Remove farm

- [ ] Remove deletes the card
- [ ] Toast “Farm removed”
- [ ] Refresh → farm stays gone

---

## 3. Diagnose (`/diagnose`)

### Stepper

- [ ] Steps update: Select field → Upload → Classify → Risk forecast
- [ ] Mobile shows step numbers; desktop shows full labels

### Farm selector

- [ ] Empty farms → “— Add a farm first —” + **Go to My Farms** link
- [ ] With farms → dropdown lists `Name (Crop)`
- [ ] Run diagnosis with no farm → farm error + toast

### Upload

- [ ] Click upload zone → file picker opens
- [ ] Drag-and-drop image works
- [ ] Non-image file → error toast
- [ ] Oversized image (>12 MB) → error toast
- [ ] Valid image → preview + viewfinder overlay
- [ ] Upload shows “Preparing your photo…” while processing

### Buttons after upload

- [ ] **◎ Run diagnosis** / **Analyzing…** while loading
- [ ] **Choose different photo** clears image and results
- [ ] Loading line: “Analyzing leaf image…”

### Diagnosis result

- [ ] Specimen card: disease name, confidence %, severity badge
- [ ] Description, symptoms, treatments, prevention tips appear
- [ ] On API failure: **Diagnosis failed** banner
- [ ] Banner **Try again** retries
- [ ] Banner **Dismiss** hides error

### Field conditions form

- [ ] Temperature, humidity, rainfall, leaf wetness, trend editable
- [ ] Units respect Settings (metric °C/mm vs imperial °F/in)
- [ ] Invalid humidity (>100) → field error
- [ ] Invalid wetness (>24) → field error
- [ ] Empty/invalid numbers blocked before forecast

### Forecast

- [ ] **⛅ Forecast outbreak risk** / **Forecasting…**
- [ ] Loading: “Modeling 7-day disease pressure…”
- [ ] 7-day bars + gauge + risk badge + summary + recommended actions
- [ ] On failure: **Forecast failed** banner with Try again / Dismiss

### Save

- [ ] **💾 Save to reports** / **Saving…**
- [ ] Toast “Saved to reports”
- [ ] Navigates to `/reports`
- [ ] Refresh → report still listed

---

## 4. Reports (`/reports`)

### Controls

- [ ] **All farms** filter dropdown
- [ ] Filter by a specific farm
- [ ] Empty state when no reports
- [ ] Click row → expands detail (chevron rotates)
- [ ] Click again → collapses
- [ ] Expanded: symptoms, treatment, 7-day risk (if forecast exists)
- [ ] **Delete this report**
- [ ] Toast “Report deleted”
- [ ] Refresh → deleted report stays gone

---

## 5. Resources (`/resources`)

### Controls

- [ ] Farm / field dropdown
- [ ] Location input (auto-fills from farm when available)
- [ ] Category chips:
  - [ ] Certified Agronomist
  - [ ] Extension Office
  - [ ] Crop Supply Store
  - [ ] Equipment Mechanic
  - [ ] Equipment Dealer
- [ ] Empty location + category click → validation error + toast
- [ ] Valid location + category → map iframe loads
- [ ] Tip text appears under map
- [ ] **Open full results in Google Maps ↗** opens new tab
- [ ] High-risk alert banner (if any high/severe forecasts exist)
- [ ] Banner **Find agronomists** selects agronomist category

---

## 6. Settings (`/settings`)

### Profile form

- [ ] Name + Farm / cooperative fields load current values
- [ ] **Save profile** / **Saving…**
- [ ] Toast “Profile updated”
- [ ] Sidebar/profile chip updates
- [ ] Empty name → validation error
- [ ] Empty farm/cooperative → validation error
- [ ] Refresh → profile persists

### Units

- [ ] Metric toggle on/off
- [ ] Toast “Units updated”
- [ ] Diagnose form labels switch °C/mm ↔ °F/in
- [ ] Refresh → unit preference persists

### Clear data

- [ ] **Clear data** shows confirm dialog
- [ ] Cancel confirm → nothing cleared
- [ ] Confirm → toast “Local workspace cleared”
- [ ] Redirects to dashboard
- [ ] Farms/diagnoses empty; profile reset to defaults
- [ ] Refresh → still cleared

---

## 7. Persistence & storage badge

- [ ] Add farm → refresh → still present
- [ ] Save diagnosis → refresh → still present
- [ ] Change settings → refresh → still present
- [ ] **Saved locally** badge when healthy
- [ ] **Saving…** badge during writes
- [ ] Storage failure shows toast / **Not saved** badge (hard to force; optional)

---

## 8. Responsive / mobile layout

Test at ~375px width (or phone):

- [ ] No horizontal page scroll (except intentional nav/chip scroll)
- [ ] Headers/buttons stack cleanly
- [ ] Farm modal is bottom-sheet style / full-width friendly
- [ ] Diagnose upload/actions full-width
- [ ] Settings Clear data stacks under text
- [ ] Map height usable on small screens
- [ ] Touch targets feel tappable (~44px buttons)

---

## 9. End-to-end happy path (full workflow)

- [ ] Settings: set name to a test grower → Save
- [ ] Farms: add “North Forty”, Tomato, 35 acres, Fresno County, CA
- [ ] Diagnose: select farm → upload leaf photo → Run diagnosis
- [ ] Enter conditions → Forecast outbreak risk
- [ ] Save to reports
- [ ] Dashboard shows updated stats / activity
- [ ] Reports lists the new item; expand works
- [ ] Resources: location filled → Extension Office map loads
- [ ] Refresh browser → all of the above still present

---

## 10. Known deferred (do **not** expect)

- [ ] ~~Login / register~~ (intentionally removed)
- [ ] ~~Live OpenWeather API~~ (manual conditions only)
- [ ] ~~Production YOLO / EfficientNet models~~ (demo AI)

---

## Bug log

| # | Area | Steps | Expected | Actual | Severity |
|---|------|-------|----------|--------|----------|
| 1 |      |       |          |        |          |
| 2 |      |       |          |        |          |
| 3 |      |       |          |        |          |

---

**Sign-off:** Tester _____________ · Result: Pass / Fail · Notes _____________
