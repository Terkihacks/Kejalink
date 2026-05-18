import { useEffect } from 'react'
import { Hero } from './Hero'
import { HowItWorks } from './HowItWorks'
import { BecomeAgent } from './BecomeAgent'
import { TrustSection } from './TrustSection'
import { FAQ } from './FAQ'

/**
 * Root page for the `/` route.
 *
 * Composes all home sections in order:
 * Hero → How It Works → Trust stats → Become an Agent → FAQ
 *
 * Sets `document.title` on mount so the browser tab is correctly labelled.
 */
export function HomePage() {
  useEffect(() => {
    document.title = 'KejaLink — Kenya\'s Verified Rental Marketplace'
  }, [])

  return (
    <>
      <Hero />
      <HowItWorks />
      <TrustSection />
      <BecomeAgent />
      <FAQ />
    </>
  )
}
