Build a full-stack Next.js 14 app called "Touch Grass" — a DeFi app where users stake STRK crypto and must prove they went outside daily to unlock their yield.

## Tech Stack
- Next.js 14 App Router + TypeScript + Tailwind CSS
- Vercel KV for leaderboard persistence
- Groq API (llama-3.2-11b-vision-preview) for photo verification
- Starkzap SDK for wallet connect + staking on Sepolia testnet
- Browser Geolocation API for GPS capture

## Environment Variables needed
GROQ_API_KEY=
KV_REST_API_URL=
KV_REST_API_TOKEN=
NEXT_PUBLIC_STARKZAP_APP_ID=

## Pages

### 1. Home page `/` — Leaderboard
- Header: "🌿 touch grass" with tagline "stake strk. go outside. earn yield."
- Big CTA button "Connect Wallet" using Starkzap social login (email/Google)
- Live leaderboard table showing: rank, wallet address (truncated 0x1234...abcd), streak (days), yield earned (STRK), verified today (green checkmark or pending)
- Leaderboard fetched from /api/leaderboard, sorted by streak descending
- Auto-refreshes every 30 seconds
- If user is connected, highlight their row

### 2. Stake page `/stake`
- Show connected wallet address + Sepolia STRK balance
- Input field for stake amount
- Show estimated daily yield (APR ~35%, so daily = amount * 0.00096)
- Show gas fee: "free (gasless via AVNU paymaster)"
- "Stake STRK" button calls Starkzap SDK staking module
- On success show tx hash as a clickable link to Sepolia Starkscan
- After staking, show "Now go outside and touch some grass →" CTA to /claim

### 3. Claim page `/claim`
- Title: "Prove you touched grass"
- Photo upload zone — tap to upload or take photo, shows preview
- GPS capture button — uses navigator.geolocation, shows lat/lng on success
- "Verify & Unlock Yield" button — disabled until photo uploaded
- On click: sends photo (base64) + GPS coords to /api/verify
- Show loading state: "Groq AI is checking your grass..."
- On success: green banner "Outdoor activity verified! +X STRK unlocked"
- On fail: amber banner with reason from AI e.g. "This looks like an indoor photo"
- On success: update leaderboard via /api/update-streak

## API Routes

### GET /api/leaderboard
- Reads from Vercel KV sorted set "leaderboard"
- Returns top 20 entries with { address, streak, totalEarned, verifiedToday }

### POST /api/verify
- Accepts { imageBase64, mimeType, lat, lng, address }
- Calls Groq API with llama-3.2-11b-vision-preview
- Prompt: "You are verifying outdoor activity for a DeFi app. Does this photo show a person outdoors near grass, plants, trees, sky, or natural environment? GPS coordinates provided: {lat}, {lng}. Be strict — reject indoor photos, screenshots, or stock images. Reply ONLY with valid JSON: {verified: boolean, reason: string, confidence: 'high'|'medium'|'low'}"
- Parse response, return { verified, reason, confidence }

### POST /api/stake
- Accepts { amount, address }
- Uses Starkzap SDK to stake STRK on Sepolia
- Returns { success, txHash }

### POST /api/update-streak
- Accepts { address }
- Checks if user already verified today (store lastVerified date in KV)
- If not verified today: increment streak, update totalEarned, set verifiedToday=true
- Updates Vercel KV sorted set "leaderboard" with new streak score
- Returns { streak, totalEarned }

## Design
- Clean, minimal, mobile-first
- Color palette: white background, black text, green (#22c55e) for success/verified states, amber (#f59e0b) for locked/pending
- Font: system font stack
- No gradients, no shadows — flat and clean
- Cards with light gray borders (border-gray-100)
- All buttons: rounded-xl, black background, white text for primary actions
- Leaderboard rows: subtle green highlight for current user
- Streak count displayed with a fire emoji if streak >= 3 days

## Starkzap SDK usage
- Import from "starkzap"
- Use OnboardStrategy.Social for Google/email login
- Use wallet.stake() for staking STRK token
- Use sepoliaTokens.STRK for the token address
- Use Amount.parse(amount, token) for amount formatting
- Wrap SDK calls in try/catch, show user-friendly errors

## Key UX details
- Truncate wallet addresses: show first 6 + last 4 chars
- All STRK amounts shown to 2 decimal places
- Dates shown as "today", "yesterday", or "X days ago"
- Mobile-first — all tap targets minimum 44px height
- Leaderboard empty state: "No one has touched grass yet today. Be the first."
- After verification, confetti animation using canvas-confetti npm package

## README.md to include
# 🌿 Touch Grass
> Stake STRK. Go outside. Unlock yield.

A DeFi app that locks your staking yield until you prove you went outside and touched grass. Powered by Starkzap SDK, verified by Groq AI vision.

## How it works
1. Connect your wallet via Starkzap social login
2. Stake STRK on Starknet Sepolia
3. Go outside and touch some grass
4. Upload a photo + GPS location
5. Groq AI verifies you were actually outdoors
6. Yield unlocked — your streak grows on the leaderboard

## Starkzap Modules Used
- Wallets (social login)
- Staking
- Gasless Transactions (AVNU Paymaster)

## Stack
Next.js 14 · Vercel KV · Groq Llama Vision · Starkzap SDK

## Setup
\`\`\`
npm install
cp .env.example .env.local
# fill in your keys
npm run dev
\`\`\`