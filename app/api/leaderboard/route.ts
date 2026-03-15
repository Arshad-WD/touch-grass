import { NextResponse } from 'next/server';

// KV helper
async function getKv() {
  try {
    const { kv } = await import('@vercel/kv');
    return kv;
  } catch {
    return null;
  }
}

// Fallback mock data when KV is not configured
const mockLeaderboard = [
  { address: '0x1234...abcd', streak: 12, totalEarned: 145.50, verifiedToday: true },
  { address: '0x5678...efgh', streak: 8, totalEarned: 92.20, verifiedToday: true },
  { address: '0x9abc...ijkl', streak: 5, totalEarned: 45.00, verifiedToday: false },
  { address: '0xdef0...mnop', streak: 3, totalEarned: 22.10, verifiedToday: true },
  { address: '0x4321...zyxw', streak: 1, totalEarned: 5.40, verifiedToday: false },
];

export async function GET() {
  const kv = await getKv();

  if (!kv) {
    // KV not configured — return mock data
    return NextResponse.json(mockLeaderboard);
  }

  try {
    // Fetch top 20 from the 'leaderboard' sorted set (highest streak first)
    const topMembers = await kv.zrange('leaderboard', 0, 19, { rev: true });

    if (!topMembers || topMembers.length === 0) {
      return NextResponse.json([]);
    }

    // Build entries from user hashes
    const entries = await Promise.all(
      topMembers.map(async (memberAddr: any) => {
        const addr = String(memberAddr);
        const streak = await kv.hget<number>(`user:${addr}`, 'streak') ?? 0;
        const totalEarned = await kv.hget<number>(`user:${addr}`, 'totalEarned') ?? 0;
        const verifiedToday = await kv.hget<boolean>(`user:${addr}`, 'verifiedToday') ?? false;

        // Truncate address for display
        const displayAddr = addr.length > 12
          ? `${addr.slice(0, 6)}...${addr.slice(-4)}`
          : addr;

        return {
          address: displayAddr,
          streak,
          totalEarned,
          verifiedToday,
        };
      })
    );

    return NextResponse.json(entries);
  } catch (error) {
    console.error('Leaderboard fetch error:', error);
    // Fall back to mock on error
    return NextResponse.json(mockLeaderboard);
  }
}
