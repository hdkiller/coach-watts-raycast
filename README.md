# Coach Watts Raycast Extension

A Raycast extension for **Coach Watts** to quickly view training recommendations, recent workouts, wellness biometrics, ask the AI Coach questions, and trigger background data synchronization directly from macOS.

## 🚀 Features

- **Today's Training**: View daily AI activity recommendation, workout summary, target intensity, and duration.
- **Recent Workouts**: Search and inspect your completed workouts with key metrics (Power, HR, TSS, Distance, Pace).
- **Wellness & Biometrics**: Monitor recovery status, HRV, RHR, sleep hours, weight, and CTL/ATL/TSB load trends.
- **Ask AI Coach**: Submit questions to Coach Watts AI for personalized training or recovery advice.
- **Trigger Sync**: One-click action to trigger background data ingestion & sync.

## 🔧 Configuration

In Raycast, open extension preferences (`Cmd + ,` while highlighting any Coach Watts command):

1. **Server URL**: Base URL of your Coach Watts server (e.g. `http://localhost:3000` or `https://coachwatts.com`).
2. **API Key / Bearer Token**: Generated from Coach Watts settings page.

## 🛠️ Development

```bash
# Install dependencies
npm install

# Start extension in development mode (Raycast must be running)
npm run dev

# Run TypeScript type check
npm run typecheck

# Build extension bundle
npm run build
```
