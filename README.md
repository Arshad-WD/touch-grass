# 🌿 Touch Grass.

**Stake STRK. Go outside. Unlock yield.**

Touch Grass is a decentralized "Proof of Outdoor Activity" protocol built on **Starknet**. It challenges the digital-only existence of Web3 by incentivizing users to disconnect from their screens and interact with the physical world.

![Design Aesthetic](https://img.shields.io/badge/Design-Cinematic_Dark-000000?style=for-the-badge)
![Built on Starknet](https://img.shields.io/badge/Blockchain-Starknet-EB5432?style=for-the-badge)
![AI Powered](https://img.shields.io/badge/AI-Groq_Llama_3.2-A8C44A?style=for-the-badge)

---

## 🌌 The Mission

In an era of hyper-digitization, we've forgotten the value of the physical. Touch Grass uses game theory and blockchain incentives to pull you back to reality.
1. **Initiate**: Lock your STRK tokens in the vault.
2. **Disconnect**: Leave your screen and find real, physical grass.
3. **Verify**: Prove your location and activity via AI-verified photography.
4. **Prosper**: Reclaim your stake with yield—if you pass the check.

---

## 🛠️ Technical Architecture

### 🛡️ Anti-Cheat Engine (V2)
Our system implements a multi-layer verification stack in `/api/verify` to prevent spoofing:
- **Image Fingerprinting**: SHA-256 hashing to block duplicate/recycled photo uploads globally.
- **GPS Integrity**: Real-time geolocation check against user wallet metadata.
- **AI Vision**: Powered by **Groq + Llama 3.2 11B Vision**, detecting:
    - AI-generated vs Real environments.
    - Indoor vs Outdoor lighting.
    - Actual botanical presence (Is it actually grass?).
    - Screen-in-screen spoofing (screenshots of photos).

### ⚡ Performance Stack
- **Framework**: Next.js 15 (App Router).
- **Styling**: Tailwind CSS v4 + Pure React Inline Styles for cinematic control.
- **Blockchain**: Starknet.js + get-starknet (Sepolia Testnet).
- **Animations**: Custom `requestAnimationFrame` canvas starfield & magnetic physics engine.

---

## 🎨 Design Language
- **Background**: `#000000` (Deep Space).
- **Accent**: `#A8C44A` (Fresh Grass).
- **Typography**: Editorial Serif (*Instrument Serif*) + Functional Sans (*Inter*).
- **Interactivity**: Mouse-tracking spotlights and magnetic UI elements for tactile feedback.

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- [Argent X](https://www.argent.xyz/argent-x/) or [Braavos](https://braavos.app/) Starknet Wallet.

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/Arshad-WD/touch-grass.git
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables (`.env`):
   ```env
   GROQ_API_KEY=your_key_here
   KV_URL=your_vercel_kv_url
   KV_REST_API_READ_ONLY_TOKEN=...
   KV_REST_API_TOKEN=...
   KV_REST_API_URL=...
   ```
4. Run locally:
   ```bash
   npm run dev
   ```

---

## ⚖️ Disclaimer
This is an experimental protocol on the Starknet Sepolia testnet. Always ensure you are in a safe outdoor environment when touching grass.

---

*“The world is beautiful. Go see it.”*
