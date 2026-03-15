# 🌿 Touch Grass

> Stake STRK. Go outside. Unlock yield.

A DeFi app that locks your staking yield until you prove 
you went outdoors and touched grass. Built on Starknet 
using the Starkzap SDK.

## Live App
🔗 https://touchgrass.jenixweblancer.in

## How It Works
1. Connect your wallet via Starknet (Argent X / Braavos)
2. Stake STRK on Starknet Sepolia
3. Go outside and touch some grass
4. Upload a photo + GPS location
5. Groq AI verifies you were actually outdoors
6. Yield unlocked — your streak climbs the leaderboard
7. Miss a day → streak resets → start again

## Anti-Cheat System
- Duplicate image detection (SHA-256 hashing)
- AI-generated image detection via Groq Vision
- EXIF date verification (no old photos)
- Stock photo detection
- Screenshot detection
- GPS location cross-check
- One verification per wallet per day

## Starkzap Modules Used
- ✅ Wallets
- ✅ Staking
- ✅ Gasless Transactions (AVNU Paymaster)

## Tech Stack
- Next.js 14 (App Router + TypeScript)
- Starkzap SDK
- Groq API (llama-3.2-11b-vision-preview)
- Upstash Redis (leaderboard + streak storage)
- Vercel (hosting)
- Starknet Sepolia (testnet)

## Setup

### Prerequisites
- Node.js 18+
- Argent X or Braavos wallet
- Groq API key (free at console.groq.com)
- Upstash Redis database (free at upstash.com)

### Installation
```bash
git clone https://github.com/Arshad-WD/touch-grass.git
cd touch-grass
npm install
```

### Environment Variables
Create a `.env.local` file:
```env
GROQ_API_KEY=your_groq_api_key
UPSTASH_REDIS_REST_URL=your_upstash_url
UPSTASH_REDIS_REST_TOKEN=your_upstash_token
```

### Run locally
```bash
npm run dev
```

Open http://localhost:3000

## Builder
Built for the Starkzap Developer Challenge
Challenge window: 24th Feb → 17th March 2025