import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  { q: "Do I need access to my prospect's Google accounts?", a: "No. Vexlo uses publicly available data — rankings, backlinks, and on-page signals. No Search Console or Analytics access required." },
  { q: "How fast is a proof report generated?", a: "Most reports are ready in under 30 seconds. We scan live data in real-time so your numbers are always fresh." },
  { q: "Can I white-label the reports?", a: "Yes. Agency Pro and Elite plans let you add your agency's logo, colors, and custom domain to every report." },
  { q: "What's a Proof Score?", a: "A single 0-100 metric that combines ranking position, backlink authority, and on-page health into one number your prospects instantly understand." },
  { q: "Is there a free plan?", a: "We offer a free trial so you can generate your first report with zero commitment. No credit card required." },
  { q: "What data sources does Vexlo use?", a: "We aggregate public SERP data, backlink databases, and on-page crawl results. All data is pulled fresh at report generation time." },
  { q: "Can I share reports with prospects?", a: "Absolutely. Every report has a unique shareable link. Send it before your call and let the data warm up the conversation." },
  { q: "Do you offer API access?", a: "Yes, on the Elite plan. Integrate proof reports into your CRM, outbound sequences, or custom dashboards via our REST API." },
];

const FAQ = () => {
  return (
    <section className="landing-section">
      <p className="section-label">FAQ</p>
      <h2 className="font-headline text-3xl sm:text-4xl mb-16 tracking-tight">
        Common <span className="italic">questions</span>
      </h2>

      <div className="max-w-[720px] mx-auto">
        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq, i) => (
            <AccordionItem
              key={i}
              value={`item-${i}`}
              className="border-b"
              style={{ borderColor: 'rgba(255,255,255,0.07)' }}
            >
              <AccordionTrigger className="py-5 text-left text-sm font-body font-medium text-foreground hover:no-underline gap-4">
                {faq.q}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground text-sm leading-relaxed">
                {faq.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
};

export default FAQ;
