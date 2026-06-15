# Deploying Niyyah OS from your phone

Everything below works in **mobile Safari** — no terminal needed. You'll set up
Firebase (auth + database), then deploy to Vercel (the hosted URL).

Total time: ~15 minutes. You'll copy 6 values from Firebase into Vercel.

---

## Part A — Firebase (the backend)

Open **console.firebase.google.com** and sign in with your Google account.

### 1. Create a project
- Tap **Add project** → name it `niyyah-os` → continue (Analytics optional) → create.

### 2. Add a Web app and copy the keys
- On the project home, tap the **`</>`** (Web) icon.
- Nickname it `niyyah-web` → **Register app**.
- You'll see a `firebaseConfig` block. **Keep this screen** — you'll copy these 6
  values into Vercel in Part B:

  | Firebase config field | Vercel variable |
  | --- | --- |
  | `apiKey` | `NEXT_PUBLIC_FIREBASE_API_KEY` |
  | `authDomain` | `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` |
  | `projectId` | `NEXT_PUBLIC_FIREBASE_PROJECT_ID` |
  | `storageBucket` | `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` |
  | `messagingSenderId` | `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` |
  | `appId` | `NEXT_PUBLIC_FIREBASE_APP_ID` |

  (You can always find these again under **Project settings → Your apps**.)

### 3. Turn on sign-in
- Left menu → **Build → Authentication → Get started**.
- **Sign-in method** tab → enable **Email/Password** → save.
- Enable **Google** → pick a support email → save.

### 4. Create the database
- Left menu → **Build → Firestore Database → Create database**.
- Choose **Production mode** → pick a region near you → enable.

### 5. Paste the security rules
- In Firestore, open the **Rules** tab.
- Replace everything with the contents of [`firestore.rules`](./firestore.rules)
  in this repo → **Publish**.

> Indexes: the assessment, daily check-in, dashboard, and reflection all work
> immediately. The **Partner** page needs two composite indexes — the first time
> you open it, Firestore prints an error in the browser console with a tap-to-
> create link. Or add them manually in **Firestore → Indexes** using the fields
> listed in [`firestore.indexes.json`](./firestore.indexes.json).

---

## Part B — Vercel (the hosted URL)

Open **vercel.com** and tap **Sign Up** → **Continue with GitHub** (authorize it).

### 1. Import the repo
- **Add New… → Project**.
- Find **`Trade-tracker-`** → **Import**.
  (If you don't see it, tap **Adjust GitHub App Permissions** and grant access to
  the repo.)

### 2. Configure
- **Framework Preset**: Next.js (auto-detected). Leave build settings as-is.
- Expand **Environment Variables** and add the 6 values from Part A, step 2.
- *(Optional)* For AI interpretation & summaries, also add:
  - `ANTHROPIC_API_KEY` = your key from console.anthropic.com
  - `ANTHROPIC_MODEL` = `claude-sonnet-4-6`
  - Without these, the app still works using built-in deterministic insights.

### 3. Deploy
- Tap **Deploy**. After ~1–2 minutes you'll get a live URL like
  `https://trade-tracker.vercel.app`. That's your product. 🎉

---

## Part C — One required post-deploy step

Google sign-in only works on domains Firebase trusts.

- Back in **Firebase → Authentication → Settings → Authorized domains**.
- Tap **Add domain** and add your Vercel domain (e.g. `trade-tracker.vercel.app`).
  - `localhost` is already there for local testing.

Now open your Vercel URL, tap **Begin**, create an account, and take the
assessment.

---

## Updating later
Every push to the default branch (`claude/niyyah-os-platform-v8bs7b`) triggers a
new Vercel deployment automatically. Editing files on github.com from your phone
is enough to ship changes.

## Troubleshooting
- **"Firebase isn't configured yet"** on the app → an env var is missing or
  misspelled in Vercel. Check all 6, then redeploy (Vercel → Deployments →
  ⋯ → Redeploy).
- **Google popup closes / fails** → you skipped Part C (authorized domain).
- **Partner page error** → create the two Firestore indexes (see note above).
