# Anna Daan

<p align="center">
  Good food shouldn't go to waste while someone nearby goes hungry.
</p>

Anna Daan is a React + Vite food donation application that connects food donors with NGOs and individuals. It combines donation management with food-safety assessment, urgency scoring and demand forecasting.

This is our **final-year project** at Government Polytechnic Mumbai.

## What You Can Do

### As a donor
- Post donations with photos, food type, cooking time and storage details.
- View freshness assessments with plain-language explanations.
- Review and accept donation requests.

### As a recipient
- Browse available donations through a list or OpenStreetMap.
- Request food. Unsafe donations are automatically blocked.
- Track requests through Pending, Request Accepted and Claimed stages.

### For everyone
- View donation trends and demand forecasts on the Insights page.
- Use Google sign-in on the web and installed Android application.

## Key Features

| Feature | Description |
|---|---|
| Food Safety | Rule-based assessment of donation age, storage and temperature conditions. |
| Explanations | Converts assessment results into understandable explanations. |
| Urgency Scoring | Prioritizes requests using need, time remaining and distance. |
| Demand Forecasting | Random Forest, XGBoost and LSTM models predict donation volume. |
| Insights | Displays donation statistics and forecasting results. |

**Important:** The current freshness assessment uses a rule-based engine. Forecasting results are based on simulated data and do not establish real-world accuracy. A CNN-based freshness classifier is planned, not yet shipped.

## Technology Stack

| Layer | Technologies |
|---|---|
| Frontend | React, Vite, Tailwind CSS, shadcn/ui |
| Animations | Motion |
| Mobile | Capacitor |
| Backend | Firebase Authentication, Cloud Firestore |
| Maps | Leaflet, OpenStreetMap |
| Photos | Cloudinary |
| Machine Learning | scikit-learn, XGBoost, LSTM |

## Run the Web App Locally

### Requirements
- Node.js 20.19+ or 22.12+
- npm

### Installation

```bash
npm ci
```

Create a `.env.local` file in the project root and configure your Firebase web application credentials.

Set `VITE_FIREBASE_WEB_CLIENT_ID` to the Google OAuth web client ID used by Firebase Authentication.

Enable Google sign-in in Firebase Authentication if you want Google login.

For donation photo uploads, configure the Cloudinary settings too.

Start the development server:

```bash
npm run dev
```

For a production build:

```bash
npm run build
```

To preview the production build:

```bash
npm run preview
```

The app provides an in-app setup screen when Firebase configuration is unavailable or invalid.

## Android Setup

The Android project is included.

For native Android builds, provide your own `android/app/google-services.json` from the same Firebase project.

Then run:

```bash
npm run build
npx cap sync android
npx cap open android
```

## Roadmap

- [x] Responsive web application and Android wrapper
- [x] Firebase authentication and Firestore integration
- [x] Donation and claim management
- [x] Rule-based food-safety assessment
- [x] Explanation templates
- [x] Urgency scoring
- [x] Insights dashboard
- [x] Demand forecasting using simulated data
- [ ] Pilot dataset and CNN freshness classifier
- [ ] Grad-CAM explanations
- [ ] Release APK

## Team

| Member | Contributions |
|---|---|
| Yashmit Katekar | Authentication, donation screens, Firebase integration, claims, food-safety rules, forecasting, Insights and urgency scoring |
| Mukta Diwale | Map, My Requests, Donation History, Profile, routing, mascot artwork, animations, information pages and UI integration |

---

**Anna Daan — Connecting surplus food with people who need it.**