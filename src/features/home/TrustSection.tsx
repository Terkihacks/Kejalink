import { Users, Home, Clock, Star, type LucideIcon } from 'lucide-react'
import { motion, useReducedMotion } from 'framer-motion'
import { fadeUp, staggerContainer } from '@/lib/motion'

interface Stat {
  icon: LucideIcon
  value: string
  label: string
  color: string
  glow: string
}

const STATS: Stat[] = [
  {
    icon: Users,
    value: '300+',
    label: 'Verified Agents',
    color: 'text-primary',
    glow:  'bg-primary/10 border-primary/20',
  },
  {
    icon: Home,
    value: '1,200+',
    label: 'Houses Matched',
    color: 'text-primary',
    glow:  'bg-primary/10 border-primary/20',
  },
  {
    icon: Clock,
    value: '< 5 min',
    label: 'Avg. Response Time',
    color: 'text-primary',
    glow:  'bg-primary/10 border-primary/20',
  },
  {
    icon: Star,
    value: '4.9★',
    label: 'Agent Rating',
    color: 'text-gold',
    glow:  'bg-gold/10 border-gold/20',
  },
]

/**
 * Trust / social-proof section — four key metrics displayed as large stat cards.
 *
 * A central ambient glow reinforces the brand palette. Icon containers scale up
 * on hover via `group-hover:scale-110` to add subtle interactivity.
 * Stats stagger in from below as they enter the viewport (once).
 */
export function TrustSection() {
  const reduced = useReducedMotion()

  return (
    <section className="relative bg-background px-4 py-20 md:py-28">
      {/* Centre ambient glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden"
      >
        <div className="h-[500px] w-[700px] rounded-full bg-primary/5 blur-[140px]" />
      </div>

      <div className="container relative mx-auto">
        <motion.div
          className="mb-4 text-center"
          variants={fadeUp}
          initial={reduced ? 'visible' : 'hidden'}
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
        >
          <span className="text-xs font-semibold uppercase tracking-[2.5px] text-primary">
            Track Record
          </span>
        </motion.div>
        <motion.h2
          className="font-display mb-16 text-center text-3xl font-bold text-foreground md:text-4xl"
          variants={fadeUp}
          initial={reduced ? 'visible' : 'hidden'}
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
        >
          Trusted by Thousands Across Kenya
        </motion.h2>

        <motion.div
          className="grid gap-8 sm:grid-cols-2 md:grid-cols-4"
          variants={staggerContainer(0, 0.12)}
          initial={reduced ? 'visible' : 'hidden'}
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
        >
          {STATS.map(stat => (
            <motion.div key={stat.label} variants={fadeUp} className="group flex flex-col items-center text-center">
              <div
                className={[
                  'mb-5 flex h-12 w-12 items-center justify-center rounded-xl border transition-all duration-300',
                  stat.glow,
                  'group-hover:scale-110 group-hover:shadow-[0_4px_24px_rgba(0,206,146,0.15)]',
                ].join(' ')}
              >
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
              <span className={`font-display mb-1.5 text-4xl font-black leading-none tracking-[-0.015em] md:text-5xl ${stat.color}`}>
                {stat.value}
              </span>
              <span className="text-sm text-muted-foreground">{stat.label}</span>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
