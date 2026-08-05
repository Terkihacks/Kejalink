import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui'

interface FaqItem {
  question: string
  answer: string
}

const FAQS: FaqItem[] = [
  {
    question: 'How does KejaLink work?',
    answer:
      'Submit your housing request with your preferences - area, budget, house type, and move date. Our platform instantly notifies verified agents in that area who have matching properties. Agents contact you directly via WhatsApp or call, and you can schedule viewings at your convenience.',
  },
  {
    question: 'Is it free for renters?',
    answer:
      'Yes. KejaLink is completely free for renters. You can submit unlimited requests and connect with as many verified agents as you need - no charges, no hidden fees, ever.',
  },
  {
    question: 'How do agents join KejaLink?',
    answer:
      "Agents apply through our 'Become an Agent' section. We run a verification process including ID check, business registration review, and previous tenant feedback. Only agents who pass are approved - this protects renters and keeps standards high.",
  },
  {
    question: 'Are all agents verified?',
    answer:
      'Absolutely. Every agent on KejaLink has been manually vetted. No unverified agent can contact you. If an agent misbehaves, they are immediately suspended - your safety is our priority.',
  },
  {
    question: 'How fast will I get a response?',
    answer:
      'Most requests receive their first agent response within 3–5 minutes. Agents are notified instantly when a matching request comes in, and they are motivated to respond quickly since they only pay when they accept.',
  },
  {
    question: 'What areas does KejaLink cover?',
    answer:
      'We currently cover Nairobi and its surroundings - including Westlands, Kilimani, Karen, South B, South C, Kasarani, Thika Road, Embakasi, and many more. We\'re actively expanding to Mombasa and Kisumu.',
  },
]

/**
 * FAQ section - collapses all questions into an Accordion component.
 *
 * Uses the custom `Accordion` (no Radix) from `@/components/ui` with
 * `type="single" collapsible` so only one answer is visible at a time.
 */
export function FAQ() {
  return (
    <section id="faq" className="relative bg-secondary/20 px-4 py-20 md:py-28">
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-border/60 to-transparent"
      />

      <div className="container mx-auto max-w-3xl">
        <div className="mb-4 text-center">
          <span className="text-xs font-semibold uppercase tracking-[2.5px] text-primary">
            Got Questions?
          </span>
        </div>
        <h2 className="font-display mb-12 text-center text-3xl font-bold text-foreground md:text-4xl">
          Frequently Asked Questions
        </h2>

        <Accordion type="single" collapsible className="w-full">
          {FAQS.map((faq, i) => (
            <AccordionItem
              key={faq.question}
              value={`item-${i}`}
              className="border-border/50"
            >
              <AccordionTrigger className="text-base font-medium text-foreground hover:text-primary">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="leading-relaxed text-muted-foreground">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  )
}
