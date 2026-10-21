# Anna Daan

A React + Vite food donation app. Authentication and donation data use Firebase; optional donation-photo uploads use Cloudinary.

## Run the web app

1. Install Node.js 20.19+ (or 22.12+) and npm.
2. Copy `.env.example` to `.env` and fill in the Firebase web-app values from **Firebase Console → Project settings → Your apps**.
3. Set `VITE_FIREBASE_WEB_CLIENT_ID` to the Google OAuth web client ID used by Firebase Authentication. Enable the Google provider in Firebase Authentication if you want Google sign-in.
4. To use donation photo uploads, also fill in the two Cloudinary settings in `.env`; otherwise leave them blank.
5. Install dependencies and start the app:

   ```sh
   npm ci
   npm run dev
   ```

The development server prints its local URL. For a production build, run `npm run build`; to preview it, run `npm run preview`.

The app now handles unavailable or invalid Firebase configuration with an in-app setup screen instead of a blank runtime crash. It does not bypass authentication or substitute mock data for live donations.

## Android Firebase setup

The original Android project is included. For native Android builds, provide your own `android/app/google-services.json` from the same Firebase project. That configuration file is intentionally not included in this ZIP.
