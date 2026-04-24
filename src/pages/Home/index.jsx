import { HeroSection } from './HeroSection'
import { CategoryFilterBar } from './CategoryFilterBar'
import { FeaturedListings } from './FeaturedListings'
import { TrustSection } from './TrustSection'
import { VerifiedListings } from './VerifiedListings'
import { HowItWorks } from './HowItWorks'
import { SellerCTA } from './SellerCTA'
import { useState } from 'react'

export default function HomePage() {
  const [selectedCategory, setSelectedCategory] = useState('all')

  return (
    <>
      <HeroSection />
      <CategoryFilterBar onCategoryChange={setSelectedCategory} />
      <FeaturedListings selectedCategory={selectedCategory} />
      <TrustSection />
      <VerifiedListings />
      <HowItWorks />
      <SellerCTA />
    </>
  )
}
