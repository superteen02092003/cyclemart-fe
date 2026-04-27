import { HeroSection } from './HeroSection'
import { CategoryFilterBar } from './CategoryFilterBar'
import { CategorySections } from './CategorySections'
import { TrustSection } from './TrustSection'
import { VerifiedListings } from './VerifiedListings'
import { HowItWorks } from './HowItWorks'
import { SellerCTA } from './SellerCTA'

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <CategoryFilterBar />
      <CategorySections />
      <TrustSection />
      <VerifiedListings />
      <HowItWorks />
      <SellerCTA />
    </>
  )
}
