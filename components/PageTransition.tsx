import React from 'react';

export default function PageTransition({ children }: { children: React.ReactNode }) {
  // Removing the old page transition logic to keep things clean and performant
  // Next.js handles route transitions gracefully; we don't need the motion wrapper here
  // unless we specifically add leave animations later.
  return <>{children}</>;
}
