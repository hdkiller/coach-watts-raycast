# Raycast Commands Reference

This document provides a detailed breakdown of all available Raycast commands, their views, keyboard shortcuts, and Coach Watts API endpoints.

---

## 1. Today's Training (`today.tsx`)

- **View Type**: Detail
- **API Endpoint**: `GET /api/recommendations/today`
- **Description**: Renders today's AI-generated activity recommendation.

### Displayed Information
- Recommendation summary & markdown body
- Actionable advice & key takeaways
- Target sport type, intensity, target duration (minutes), and target TSS
- Recommendation status & date

### Actions
- `Refresh`: Re-fetches today's recommendation from server
- `Copy Summary`: Copies recommendation text to clipboard
- `Open Coach Watts Dashboard`: Opens `https://coachwatts.com` in web browser

---

## 2. Recent Workouts (`workouts.tsx`)

- **View Type**: List with Detail panel
- **API Endpoint**: `GET /api/workouts?limit=50`
- **Description**: Searchable list of completed workouts with performance metrics.

### Displayed Information
- Workout title, sport type, and date
- Duration (formatted `Xh Ym`) and Distance (`km`)
- Training Stress Score (TSS), Average Watts, Normalized Power (NP)
- Average Heart Rate, Max Heart Rate, Elevation Gain

### Actions
- `Refresh Workouts`: Reloads workout list
- `Copy Workout Title`: Copies title to clipboard
- `Open in Coach Watts`: Opens `/activities` page on web app

---

## 3. Wellness & Biometrics (`wellness.tsx`)

- **View Type**: List with Detail panel
- **API Endpoint**: `GET /api/wellness?limit=14`
- **Description**: Tracks daily recovery, biometrics, and fitness load trends.

### Displayed Information
- Recovery score (%) and daily notes
- HRV (rMSSD in ms) & Resting Heart Rate (bpm)
- Sleep duration (hours) and sleep quality score
- Weight (kg)
- Fitness Load Trends: Chronic Training Load (CTL / Fitness), Acute Training Load (ATL / Fatigue), Training Stress Balance (TSB / Form)

---

## 4. Ask AI Coach (`ask-coach.tsx`)

- **View Type**: Form & Detail
- **API Endpoint**: `POST /api/chat/messages`
- **Description**: Interactive prompt interface to query Coach Watts AI.

### Inputs & Actions
- Multi-line markdown prompt text area
- `Submit`: Sends query to Coach Watts AI
- `Copy Response`: Copies AI response to clipboard
- `Ask Another Question`: Resets form for a new question

---

## 5. Trigger Data Sync (`sync.tsx`)

- **View Type**: HUD (No-view)
- **API Endpoint**: `POST /api/orchestrate/full-sync`
- **Description**: One-click action to trigger background data sync across connected integrations (Intervals.icu, Strava, Oura, Garmin, etc.).
