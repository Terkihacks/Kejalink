import { Link } from 'react-router-dom'
import { MessageCircle, Mail, Phone, MapPin } from 'lucide-react'
import { KejaLinkWordmark } from '@/components/Logo'

const QUICK_LINKS = [
  { label: 'Request a House',  to: '/request' },
  { label: 'Become an Agent', href: '#agents' },
  { label: 'How It Works',    href: '#how-it-works' },
  { label: 'FAQs',            href: '#faq' },
] as const

const CONTACT_ITEMS = [
  { Icon: Mail,   text: 'hello@kejalink.co.ke' },
  { Icon: Phone,  text: '+254 700 000 000' },
  { Icon: MapPin, text: 'Nairobi, Kenya' },
] as const

/**
 * Site-wide footer.
 *
 * Columns: brand description | quick links | contact info | connect (WhatsApp + legal)
 *
 * Internal routes (`/request`) use React Router `<Link to="…">`.
 * Hash anchors remain plain `<a>` elements.
 */
export function Footer() {
  return (
    <footer className="relative border-t border-border/50 bg-card px-4 pb-8 pt-14 md:pt-16">
      <div className="container mx-auto">
        <div className="grid gap-10 md:grid-cols-4">

          {/* Brand */}
          <div className="md:col-span-1">
            <Link to="/" aria-label="KejaLink home">
              <KejaLinkWordmark />
            </Link>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              Kenya&apos;s verified rental marketplace. Connect with trusted agents and find your
              perfect home — faster than ever.
            </p>
          </div>

          {/* Quick links */}
          <div>
            <h3 className="mb-5 text-xs font-semibold uppercase tracking-[2px] text-muted-foreground">
              Quick Links
            </h3>
            <ul className="space-y-3 text-sm">
              {QUICK_LINKS.map(link => (
                <li key={link.label}>
                  {'to' in link ? (
                    <Link to={link.to} className="text-muted-foreground transition-colors hover:text-primary">
                      {link.label}
                    </Link>
                  ) : (
                    <a href={link.href} className="text-muted-foreground transition-colors hover:text-primary">
                      {link.label}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="mb-5 text-xs font-semibold uppercase tracking-[2px] text-muted-foreground">
              Contact
            </h3>
            <ul className="space-y-3 text-sm">
              {CONTACT_ITEMS.map(({ Icon, text }) => (
                <li key={text} className="flex items-center gap-2.5 text-muted-foreground">
                  <Icon className="h-4 w-4 shrink-0 text-muted-foreground" strokeWidth={1.5} />
                  <span>{text}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Connect */}
          <div>
            <h3 className="mb-5 text-xs font-semibold uppercase tracking-[2px] text-muted-foreground">
              Connect
            </h3>
            <a
              href="#"
              className="inline-flex items-center gap-2 rounded-full bg-whatsapp px-5 py-2.5 text-sm font-semibold text-whatsapp-foreground shadow-[0_0_20px_rgba(37,211,102,0.2)] transition-all hover:bg-whatsapp/90 hover:shadow-[0_0_30px_rgba(37,211,102,0.35)]"
            >
              <MessageCircle className="h-4 w-4" strokeWidth={1.5} />
              Chat on WhatsApp
            </a>
            <div className="mt-6 space-y-2.5 text-sm">
              <a href="#" className="block text-muted-foreground transition-colors hover:text-primary">Privacy Policy</a>
              <a href="#" className="block text-muted-foreground transition-colors hover:text-primary">Terms of Service</a>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 flex flex-col items-center justify-between gap-2 border-t border-border/40 pt-8 text-center text-xs text-muted-foreground sm:flex-row">
          <p>&copy; {new Date().getFullYear()} KejaLink · All rights reserved.</p>
          <p className="font-medium uppercase tracking-[1.5px]">Connect · Verify · Move In</p>
        </div>
      </div>
    </footer>
  )
}
