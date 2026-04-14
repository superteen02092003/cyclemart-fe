import { HeroSection } from './HeroSection'
import { CategoryFilterBar } from './CategoryFilterBar'
import { FeaturedListings } from './FeaturedListings'
import { TrustSection } from './TrustSection'
import { VerifiedListings } from './VerifiedListings'
import { HowItWorks } from './HowItWorks'
import { SellerCTA } from './SellerCTA'

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <CategoryFilterBar />
      <FeaturedListings />
      <TrustSection />
      <VerifiedListings />
      <HowItWorks />
      <SellerCTA />
    </>
  )
}
