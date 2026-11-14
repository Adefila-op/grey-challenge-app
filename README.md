# Grey Consult Challenge App

- `web/` is the app. Deploy it to Vercel.
- `mobile/` wraps the deployed site in an Android app with Expo.
- `slides/` holds the four beginner presentations.

## 1. Deploy the web app to Vercel

1. Push this folder to a GitHub repository.
2. In Vercel, choose Add New > Project and import the repository.
3. Set **Root Directory** to `web`. Leave the build settings empty. There is no build step.
4. Under Environment Variables add `ANTHROPIC_API_KEY` with your Claude API key.
5. Deploy. Your site opens at `https://<project>.vercel.app`.

`web/index.html` is the whole front end. `web/api/ai.js` is a server function that
the AI tutor and AI grading call, so the key stays on the server.

The admin page now includes a secure-ish internal PIN area for:

- managing student registrations,
- showing how many students are present,
- uploading presentations,
- saving the app API key,
- and tracking independent student sign-ups.

`web/supabase-schema.sql` contains the schema for the auth profile, students, presentations, and app settings tables.

Optional environment variables:

- `ANTHROPIC_MODEL`: defaults to `claude-haiku-5-5`.
- `ANTHROPIC_WORKSPACE_ID`: only if your key is not scoped to one workspace.

Never put the key in `index.html` or commit it to Git.

## 2. Build the Android APK with Expo

Do this after the site is live, because the app loads the Vercel address.

```bash
npx create-expo-app@latest grey-challenge-app --template blank
cd grey-challenge-app
npx expo install react-native-webview
```

Copy `mobile/App.js`, `mobile/app.json` and `mobile/eas.json` into that folder,
replacing the files that are there. Then open `App.js` and set `APP_URL` to your
Vercel address.

```bash
npm install -g eas-cli
eas login
eas build -p android --profile preview
```

When the build finishes, Expo gives you a link to download the `.apk`.

To test before building: `npx expo start`, then open it in Expo Go.

## Known limits

- Progress is saved on each device only. There are no accounts or shared database.
- The admin PIN (2580) is inside `index.html`, so it is not secure.
- `/api/ai` has no sign-in or rate limit. Anyone who finds it can spend your API credit.
- Project uploads keep the file name only.
