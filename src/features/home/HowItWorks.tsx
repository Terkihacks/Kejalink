import { ClipboardList, Users, CalendarCheck, type LucideIcon } from 'lucide-react'
import { motion, useReducedMotion } from 'framer-motion'
import { fadeUp, staggerContainer } from '@/lib/motion'

interface Step {
  icon: LucideIcon
  num: string
  title: string
  description: string
}

const STEPS: Step[] = [
  {
    icon: ClipboardList,
    num: '01',
    title: 'Submit Your Request',
    description:
      'Tell us your location, budget, house type, and when you want to move. Takes under two minutes.',
  },
  {
    icon: Users,
    num: '02',
    title: 'Agents Review Your Needs',
    description:
      'Verified agents in your area receive your request and reach out with options that match exactly.',
  },
  {
    icon: CalendarCheck,
    num: '03',
    title: 'Schedule a Viewing',
    description:
      'Connect directly with agents, tour homes, and move in - all on your own timeline.',
  },
]

/**
 * "How It Works" section - three numbered steps explaining the renter journey.
 *
 * Uses dashed connector lines between cards on desktop (hidden on mobile).
 * Cards gain a green glow on hover via Tailwind's `group` modifier.
 * Cards animate in from below as they enter the viewport (once).
 */
export function HowItWorks() {
  const reduced = useReducedMotion()

  return (
    <section id="how-it-works" className="relative bg-secondary/20 px-4 py-20 md:py-28">
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-border/60 to-transparent"
      />
      <div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-border/60 to-transparent"
      />

      <div className="container mx-auto">
        <motion.div
          className="mb-4 text-center"
          variants={fadeUp}
          initial={reduced ? 'visible' : 'hidden'}
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
        >
          <span className="text-xs font-semibold uppercase tracking-[2.5px] text-primary">
            Simple Process
          </span>
        </motion.div>
        <motion.h2
          className="font-display mb-3 text-center text-3xl font-bold text-foreground md:text-4xl"
          variants={fadeUp}
          initial={reduced ? 'visible' : 'hidden'}
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
        >
          How It Works
        </motion.h2>
        <motion.p
          className="mx-auto mb-14 max-w-md text-center text-muted-foreground"
          variants={fadeUp}
          initial={reduced ? 'visible' : 'hidden'}
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
        >
          Connect · Verify · Move In - in three simple steps.
        </motion.p>

        <motion.div
          className="relative grid gap-6 md:grid-cols-3 md:gap-8"
          variants={staggerContainer(0, 0.13)}
          initial={reduced ? 'visible' : 'hidden'}
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
        >
          {STEPS.map((step, i) => (
            <motion.div
              key={step.num}
              variants={fadeUp}
              className="group relative rounded-2xl border border-border/60 bg-card p-8 transition-all duration-300 hover:border-primary/30 hover:shadow-[0_4px_40px_rgba(0,206,146,0.07)]"
            >
              {/* Large decorative step number */}
              <span className="font-display mb-5 block text-[3.5rem] font-black leading-none tracking-[-0.03em] text-foreground/[0.12] transition-colors group-hover:text-primary/30">
                {step.num}
              </span>

              {/* Icon */}
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 transition-colors group-hover:bg-primary/15">
                <step.icon className="h-6 w-6 text-primary" />
              </div>

              <h3 className="font-display mb-2.5 text-lg font-semibold text-foreground">{step.title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{step.description}</p>

              {/* Desktop connector between cards */}
              {i < STEPS.length - 1 && (
                <div
                  aria-hidden="true"
                  className="absolute -right-4 top-16 hidden w-8 border-t border-dashed border-border/60 md:block"
                />
              )}
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
