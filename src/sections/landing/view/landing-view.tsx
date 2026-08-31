'use client';

import type { EducationLevel } from 'src/lib/api/catalog';

import { LandingCta } from '../landing-cta';
import { LandingHero } from '../landing-hero';
import { LandingLevels } from '../landing-levels';
import { LandingHow, LandingPlans, LandingFeatures } from '../landing-sections';

// ----------------------------------------------------------------------

type Props = {
  levels: EducationLevel[] | null;
};

export function LandingView({ levels }: Props) {
  return (
    <>
      <LandingHero />
      <LandingLevels levels={levels} />
      <LandingHow />
      <LandingFeatures />
      <LandingPlans />
      <LandingCta />
    </>
  );
}
