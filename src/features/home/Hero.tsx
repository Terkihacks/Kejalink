import { Link } from 'react-router-dom'
import { CheckCircle, MessageCircle, ArrowRight } from 'lucide-react'
import { motion, useReducedMotion } from 'framer-motion'
import { fadeUp, fadeIn, staggerContainer } from '@/lib/motion'

const TRUST_SIGNALS = ['Verified Agents', 'No Fake Listings', 'Avg. 3-min Response'] as const

/**
 * Landing page hero section.
 *
 * Renders the primary headline, sub-copy, dual CTAs (Request a House + WhatsApp),
 * and three trust-signal badges. Ambient radial glows are decorative and
 * aria-hidden so they don't pollute the accessibility tree.
 */
export function Hero() {
  const reduced = useReducedMotion()
  const initial = reduced ? 'visible' : 'hidden'

  return (
    <section className="relative overflow-hidden bg-background px-4 py-24 md:py-36">
      {/* Ambient glow background */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-[10%] top-1/2 h-600 w-150 -translate-y-1/2 rounded-full bg-primary/10 blur-[120px]" />
        <div className="absolute right-[10%] top-[30%] h-100 w-100 rounded-full bg-accent/7 blur-[100px]" />
        <div className="absolute bottom-0 left-1/2 h-75 w-175 -translate-x-1/2 rounded-full bg-gold/5 blur-[100px]" />
      </div>

      <motion.div
        className="container relative mx-auto text-center"
        variants={staggerContainer(0.1, 0.12)}
        initial={initial}
        animate="visible"
      >
        {/* Eyebrow label */}
        <motion.p
          variants={fadeUp}
          className="mb-8 text-xs font-semibold uppercase tracking-[2.5px] text-primary"
        >
          Kenya&apos;s Verified Rental Marketplace
        </motion.p>

        {/* Gradient headline — deliberately NOT a motion element: this is the page's
            LCP candidate, and Chrome excludes opacity:0 elements from LCP timing
            until they become visible, so animating it in adds pure delay to the
            metric with no perceptible UX benefit this high up the page. */}
        <h1 className="font-display mx-auto max-w-4xl text-balance text-5xl font-black tracking-tight md:text-6xl lg:text-7xl">
          <span
            style={{
              background: 'var(--hero-gradient)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Find a house
          </span>
          <br />
          <span className="text-foreground/90">without the stress.</span>
        </h1>

        {/* Subheading */}
        <motion.p
          variants={fadeUp}
          className="mx-auto mt-6 max-w-lg text-pretty text-lg text-muted-foreground md:text-xl"
        >
          Tell us what you need. We&apos;ll match you with{' '}
          <span className="font-semibold text-primary">verified agents</span> in minutes.
          No fake listings. No guesswork.
        </motion.p>

        {/* CTAs */}
        <motion.div
          variants={fadeUp}
          className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
        >
          <Link
            to="/request"
            className="group flex w-full items-center justify-center gap-2.5 rounded-full bg-primary px-8 py-4 text-base font-semibold text-primary-foreground shadow-[0_0_30px_rgba(0,206,146,0.3)] transition-all hover:bg-primary/90 hover:shadow-[0_0_50px_rgba(0,206,146,0.45)] sm:w-auto"
          >
            Request a House
            <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" strokeWidth={1.5} />
          </Link>
          <button
            type="button"
            className="flex w-full items-center justify-center gap-2.5 rounded-full border border-border/60 bg-muted/20 px-8 py-4 text-base font-medium text-foreground/80 backdrop-blur transition-all hover:border-whatsapp/40 hover:text-foreground sm:w-auto"
          >
            <MessageCircle className="h-5 w-5 text-whatsapp" />
            Chat on WhatsApp
          </button>
        </motion.div>

        {/* Trust signals */}
        <motion.div
          variants={staggerContainer(0, 0.08)}
          className="mt-14 flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground md:gap-10"
        >
          {TRUST_SIGNALS.map(item => (
            <motion.div key={item} variants={fadeIn} className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 shrink-0 text-primary" strokeWidth={1.5} />
              <span>{item}</span>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  )
}
