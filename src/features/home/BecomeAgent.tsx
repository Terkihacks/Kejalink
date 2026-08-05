import { MessageSquare, Timer, DollarSign, ArrowRight, type LucideIcon } from 'lucide-react'
import { motion, useReducedMotion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { fadeUp, staggerContainer } from '@/lib/motion'

interface Benefit {
  icon: LucideIcon
  title: string
  description: string
  iconColor: string
  iconBg: string
}

const BENEFITS: Benefit[] = [
  {
    icon: MessageSquare,
    title: 'Get Real Requests',
    description:
      'Receive qualified tenant requests from active renters who are ready to move - in your area.',
    iconColor: 'text-primary',
    iconBg:    'bg-primary/10 border-primary/20',
  },
  {
    icon: Timer,
    title: 'Respond Fast',
    description:
      'Instant push notifications the moment a matching request comes in. First to respond wins.',
    iconColor: 'text-accent',
    iconBg:    'bg-accent/10 border-accent/20',
  },
  // {
  //   icon: DollarSign,
  //   title: 'Pay Per Lead',
  //   description:
  //     'Only pay when you accept a request. No monthly subscriptions, no hidden commissions.',
  //   iconColor: 'text-gold',
  //   iconBg:    'bg-gold/10 border-gold/20',
  // },
  {
    icon: DollarSign,
    title: 'Free Leads for new Agents',
    description:
      'New agents get free leads to help them grow their business.',
    iconColor: 'text-gold',
    iconBg:    'bg-gold/10 border-gold/20',
  },
]

/**
 * "Become an Agent" section - targets property agents, showcasing three benefits
 * and a gold CTA button to sign up for agent verification.
 * Benefit cards stagger in from below as they scroll into view (once).
 */
export function BecomeAgent() {
  const reduced = useReducedMotion()
  const navigate = useNavigate()

  return (
    <section id="agents" className="relative bg-card px-4 py-20 md:py-28">
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-border/60 to-transparent"
      />
      <div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-border/60 to-transparent"
      />

      <div className="container mx-auto">
        {/* Header */}
        <motion.div
          className="mb-16 text-center"
          variants={staggerContainer(0, 0.1)}
          initial={reduced ? 'visible' : 'hidden'}
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
        >
          <motion.div
            variants={fadeUp}
            className="mb-3 inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/8 px-4 py-1.5"
          >
            <span className="text-xs font-semibold uppercase tracking-[2.5px] text-gold">
              For Agents
            </span>
          </motion.div>
          <motion.h2 variants={fadeUp} className="font-display mb-4 text-3xl font-bold text-foreground md:text-4xl">
            Grow Your Business with KejaLink
          </motion.h2>
          <motion.p variants={fadeUp} className="mx-auto max-w-xl text-muted-foreground">
            Join Kenya&apos;s fastest-growing rental network. Get real tenant requests delivered
            directly to you - no cold calling, no guesswork.
          </motion.p>
        </motion.div>

        {/* Benefits grid */}
        <motion.div
          className="mb-12 grid gap-6 md:grid-cols-3 md:gap-8"
          variants={staggerContainer(0, 0.13)}
          initial={reduced ? 'visible' : 'hidden'}
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
        >
          {BENEFITS.map(b => (
            <motion.div
              key={b.title}
              variants={fadeUp}
              className="rounded-2xl border border-border/60 bg-background p-8 transition-all duration-300 hover:border-primary/25 hover:shadow-[0_4px_40px_rgba(0,206,146,0.06)]"
            >
              <div className={`mb-6 flex h-12 w-12 items-center justify-center rounded-xl border ${b.iconBg}`}>
                <b.icon className={`h-6 w-6 ${b.iconColor}`} />
              </div>
              <h3 className="font-display mb-3 text-lg font-semibold text-foreground">{b.title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{b.description}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* CTA */}
        <motion.div
          className="text-center"
          variants={fadeUp}
          initial={reduced ? 'visible' : 'hidden'}
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
        >
          <button
            type="button"
            onClick={() => navigate('/agent/login')}
            className="group inline-flex items-center gap-2.5 rounded-full bg-gold px-10 py-4 text-base font-semibold text-background shadow-[0_0_30px_rgba(245,166,35,0.3)] transition-all hover:bg-gold/90 hover:shadow-[0_0_50px_rgba(245,166,35,0.45)]"
          >
            Become a Verified Agent
            <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" strokeWidth={1.5} />
          </button>
          <p className="mt-4 text-xs text-muted-foreground">
            Free to sign up · Verification takes 24–48 hours
          </p>
        </motion.div>
      </div>
    </section>
  )
}
