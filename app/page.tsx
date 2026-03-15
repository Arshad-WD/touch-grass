import HeroSection from '@/components/landing/HeroSection';
import HowItWorksSection from '@/components/landing/HowItWorksSection';
import LeaderboardSection from '@/components/landing/LeaderboardSection';
import StakingCardSection from '@/components/landing/StakingCardSection';
import StreakSection from '@/components/landing/StreakSection';

export default function Home() {
  return (
    <div className="flex flex-col w-full h-full overflow-hidden bg-black">
      <HeroSection />
      <HowItWorksSection />
      <LeaderboardSection />
      <StakingCardSection />
      <StreakSection />
    </div>
  );
}
