import { NextResponse } from 'next/server';

// KV helper that works even without KV configured
async function getKv() {
  try {
    const { kv } = await import('@vercel/kv');
    return kv;
  } catch {
    return null;
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { address } = body;

    if (!address) {
      return NextResponse.json(
        { error: 'Address is required' },
        { status: 400 }
      );
    }

    const kv = await getKv();
    const today = new Date().toISOString().split('T')[0];

    if (!kv) {
      // KV not configured — return simulated response
      return NextResponse.json({
        streak: 1,
        totalEarned: 1.2,
        todayYield: 1.2,
        streakMultiplier: 1.05,
        message: 'Streak updated (KV not configured — simulated)',
      });
    }

    // Get existing user data from KV
    const lastVerified = await kv.hget<string>(`user:${address}`, 'lastVerified');
    const currentStreak = await kv.hget<number>(`user:${address}`, 'streak') ?? 0;
    const totalEarned = await kv.hget<number>(`user:${address}`, 'totalEarned') ?? 0;
    const stakedAmount = await kv.hget<number>(`user:${address}`, 'stakedAmount') ?? 50;

    // Prevent double claiming same day
    if (lastVerified === today) {
      return NextResponse.json({
        streak: currentStreak,
        totalEarned: totalEarned,
        alreadyVerified: true,
        message: 'Already verified today!',
      });
    }

    // Check if streak should continue or reset
    let newStreak = 1;
    if (lastVerified) {
      const lastDate = new Date(lastVerified);
      const todayDate = new Date(today);
      const diffDays = Math.floor(
        (todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      newStreak = diffDays === 1 ? currentStreak + 1 : 1;
    }

    // Calculate yield: base rate + streak bonus
    const baseYield = stakedAmount * 0.00096; // ~35% APR daily
    const streakMultiplier = 1 + newStreak * 0.05; // 5% bonus per streak day
    const todayYield = parseFloat((baseYield * streakMultiplier).toFixed(4));
    const newTotalEarned = parseFloat((totalEarned + todayYield).toFixed(4));

    // Write all user data to KV
    await kv.hset(`user:${address}`, {
      lastVerified: today,
      streak: newStreak,
      totalEarned: newTotalEarned,
      verifiedToday: true,
      stakedAmount: stakedAmount,
    });

    // Update leaderboard sorted set (score = streak count)
    await kv.zadd('leaderboard', {
      score: newStreak,
      member: address,
    });

    return NextResponse.json({
      streak: newStreak,
      totalEarned: newTotalEarned,
      todayYield: todayYield,
      streakMultiplier: streakMultiplier,
      message: 'Streak updated successfully',
    });
  } catch (error) {
    console.error('Update streak error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
