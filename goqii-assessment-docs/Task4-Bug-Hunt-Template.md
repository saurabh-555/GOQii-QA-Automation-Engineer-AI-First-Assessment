# Task 4 — Bug Hunt: GOQii Mobile App

**Exploration time:** ~30 minutes
**Areas covered:** Tracker/device sync, workout sync (outdoor/GPS), pedometer & calorie calculation, sleep tracking, notifications, step counter persistence

---

### Bug #1 — Tracker fails to connect and sync with the app
- **Category:** Functional Bug
- **Severity:** High
- **Priority:** High
- **Steps to Reproduce:**
  1. Open the GOQii app
  2. Navigate to Device Settings
  3. Attempt to sync the tracker
- **Expected Result:** The tracker connects and syncs seamlessly.
- **Actual Result:** The tracker fails to connect.


---

### Bug #2 — Incorrect calorie calculation
- **Category:** Functional Bug / Data Accuracy
- **Severity:** High
- **Priority:** High
- **Steps to Reproduce:**
  1. Use the pedometer during a walk or run
  2. Observe the calorie count during/after the activity
- **Expected Result:** The calorie count is accurate relative to the activity performed.
- **Actual Result:** The pedometer shows inaccurate calorie data, leading to incorrect calorie tracking.


---

### Bug #3 — App crashes unexpectedly when syncing outdoor workout data
- **Category:** Functional Bug
- **Severity:** High
- **Priority:** High
- **Steps to Reproduce:**
  1. Complete an outdoor run/walk session with GPS enabled on the tracker/app
  2. Open the GOQii app and pull down to refresh/sync workout data
  3. Observe app behavior during the data transfer phase
- **Expected Result:** Workout data syncs successfully, displaying distance, pace, and route map without interruptions.
- **Actual Result:** The application force-closes/crashes mid-sync, losing the session's detailed route and pace analytics.


---

### Bug #4 — Inaccurate sleep duration and missing REM sleep breakdown
- **Category:** Functional Bug / Performance Observation
- **Severity:** Medium
- **Priority:** Medium
- **Steps to Reproduce:**
  1. Wear the synced wearable band overnight
  2. Open the app the following morning and navigate to the Sleep Log section
  3. Compare recorded sleep start/end times against actual sleeping hours
- **Expected Result:** Sleep logs accurately reflect awake times and broken sleep intervals, with detailed stage logs (Deep, Light, REM).
- **Actual Result:** The app registers restful periods while awake (e.g., sitting still reading/watching TV) as deep sleep, overreporting overall sleep time by 2–3 hours.


---

### Bug #5 — Hourly water and inactivity reminders trigger in batches or late
- **Category:** UI / UX Improvement
- **Severity:** Low
- **Priority:** Medium
- **Steps to Reproduce:**
  1. Enable hourly hydration and step reminders in settings
  2. Leave the phone idle or lock the screen for several hours
  3. Unlock the device later in the day
- **Expected Result:** Notifications trigger individually at scheduled hourly intervals throughout the day.
- **Actual Result:** Reminders fail to fire at scheduled times and instead trigger all at once in a single bulk notification dump upon unlocking the phone.


---

### Bug #6 — Daily step count randomly resets to zero mid-day
- **Category:** Functional Bug
- **Severity:** High
- **Priority:** High
- **Steps to Reproduce:**
  1. Accumulate a significant step count (e.g., 5,000+ steps) during the day
  2. Disconnect and reconnect Bluetooth, or restart the app
  3. Check the step count display on the main dashboard
- **Expected Result:** Total accumulated step count for the day remains saved and continues incrementing.
- **Actual Result:** The dashboard step counter resets to 0, clearing daily progress before midnight.


---

## Summary

| # | Title | Category | Severity | Priority |
|---|-------|----------|----------|----------|
| 1 | Tracker fails to connect and sync | Functional | High | High |
| 2 | Incorrect calorie calculation | Functional / Data Accuracy | High | High |
| 3 | App crash during outdoor workout sync | Functional | High | High |
| 4 | Sleep tracking discrepancy | Functional / Performance | Medium | Medium |
| 5 | Delayed/batched reminder notifications | UI / UX | Low | Medium |
| 6 | Step counter resets mid-day | Functional | High | High |

**Observations across findings:** four of the six issues (#1, #3, #6, and arguably #2) center on the **sync/data-integrity layer between the tracker and the app** — connection reliability, mid-sync crashes, calorie computation, and step-count persistence after a Bluetooth/app restart. That's a meaningful pattern rather than six unrelated issues: it points to the device-sync pipeline as the highest-risk area in the app, which also lines up with the "highest risk areas" identified in the Task 1 test design doc (step sync data integrity, points/wallet calculation depending on accurate steps).

