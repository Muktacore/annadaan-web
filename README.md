<h1 align="center">AnnaDaan</h1>

<p align="center">
  Good food shouldn't go to waste while someone nearby goes hungry.<br>
  AnnaDaan connects food donors with NGOs and individuals, and tells both sides how urgent and how safe each donation is.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-61DAFB?logo=react&logoColor=black" alt="React">
  <img src="https://img.shields.io/badge/Tailwind-06B6D4?logo=tailwindcss&logoColor=white" alt="Tailwind">
  <img src="https://img.shields.io/badge/Firebase-FFCA28?logo=firebase&logoColor=black" alt="Firebase">
  <img src="https://img.shields.io/badge/Capacitor-119EFF?logo=capacitor&logoColor=white" alt="Capacitor">
  <img src="https://img.shields.io/badge/Vite-646CFF?logo=vite&logoColor=white" alt="Vite">
</p>

<!-- Add screenshots here, for example Home, Donation detail, Map, Insights:
<p align="center"><img src="docs/screens.png" width="800" alt="AnnaDaan screens"></p>
-->

---

## The idea

Restaurants, events and households often have surplus cooked food. NGOs and individuals nearby could use it, but there's no quick way to connect them or to know whether the food is still safe. AnnaDaan handles both: a simple donation and request flow, plus a safety and urgency layer on top.

This is our **final year project** at Government Polytechnic Mumbai.

## What you can do

**As a donor**
- Post a donation with a photo, food type, cooking time and how it's stored.
- See a freshness assessment with a plain-language explanation of why.
- Review and accept requests on your donation.

**As a recipient**
- Browse available donations on a list or an OpenStreetMap map.
- Request food. Unsafe donations are automatically blocked from being requested.
- Follow a request through a four-phase claim flow, from *Pending* to *Request accepted* to *Claimed*.

**For everyone**
- An **Insights** page with donation trends and a demand forecast.
- Google sign-in that works on the web and in the installed Android app.

## What makes it more than a listing app

| Feature | How it works |
|---|---|
| **Food-safety layer** | A rule-based engine checks donation age, storage, covered or uncovered, and time spent at unsafe temperatures. It marks each donation *Safe*, *Consume soon* or *Unsafe*. |
| **Explanations** | A templating layer turns rule results into human-readable sentences instead of a bare label. |
| **Urgency scoring** | Requests are ranked on need, time left and distance, so the donations that most need to move are surfaced first. |
| **Demand forecasting** | Random Forest, XGBoost and LSTM models predict donation volume. On simulated data all three beat a naive baseline by about 29 to 33% on test MAE. |

> **A note on honesty.** The freshness assessment currently comes from the rule layer. The forecasting results are on **simulated** data, so they show the architecture works, not real-world accuracy. A few rule thresholds (such as the maximum donation age) and the urgency weights are our own working assumptions pending expert review. A CNN freshness classifier is planned, not shipped.

## Tech stack

| Layer | Tools |
|---|---|
| Frontend | React (Vite), Tailwind CSS, shadcn/ui, Motion, React Router |
| Mobile | Capacitor (the same codebase runs as a web app and an Android app) |
| Backend | Firebase Authentication, Cloud Firestore with security rules |
| Maps | Leaflet with OpenStreetMap, no API key needed |
| Photos | Cloudinary (unsigned upload preset) |
| ML | scikit-learn, XGBoost, LSTM (demand forecasting) |

## Design

The theme is called **Deepened Soft NGO**: deep olive, warm beige and dusty clay, in Nunito, with a warm dark mode and status colors kept separate from the brand color so *Safe*, *Consume soon* and *Unsafe* are never confused with the interface.

## Run it locally

```bash
git clone <YOUR-REPO-LINK>
cd <repo-folder>
npm install
```

Create a `.env.local` with your Firebase and Cloudinary values (`VITE_CLOUDINARY_*` and the Firebase web config), then:

```bash
npm run dev
```

For the Android app:

```bash
npm run build
npx cap sync android
npx cap open android
```

## Roadmap

- [x] Responsive web app and Android wrapper
- [x] Firebase auth, live Firestore data, claim flow
- [x] Rule-based food-safety layer with explanations
- [x] Urgency scoring and Insights page
- [x] Demand forecasting (on simulated data)
- [ ] Pilot dataset of food photos and a CNN freshness classifier
- [ ] Grad-CAM explanations and confidence scoring
- [ ] Release APK

## Team

| | |
|---|---|
| **Yashmit Katekar** | Splash, Login, Home, Add Donation and Donation Detail screens; Firebase auth and Firestore data layer; Cloudinary uploads; claims logic; food-safety rule layer; forecasting; explanation templates; Insights page; urgency scoring |
| **Mukta** | Map, My Requests with the request stepper, Donation History, Profile; sidebar and routing; mascot artwork and animation; info pages; final UI integration |
