import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  { q: "What exactly is a Proof Report?", a: "A branded, shareable document showing a prospect's current Google rankings, 30-day trend, Proof Score (0–100), AI Overview presence, and a 2-paragraph sales narrative — all generated from public data in under 60 seconds." },
  { q: "Do I need access to the prospect's Google Search Console?", a: "No. Never. VEXLO uses only publicly observable ranking data. Zero credentials required from your prospect at any point." },
  { q: "How is this different from Ahrefs or SEMrush?", a: "Ahrefs and SEMrush are post-sale research tools. VEXLO is a pre-sale closing weapon. Different job. Different moment. Different outcome." },
  { q: "Is the data accurate enough to show a client?", a: "VEXLO uses the same public ranking signals agencies present in pitches daily. The disclaimer is built in: estimated public data for sales context — not certified analytics." },
  { q: "Can I white-label the reports?", a: "Agency Pro and Elite plans include custom brand kit: your logo, brand colors, and domain. The report reads as your agency's, not VEXLO's." },
  { q: "What is a Proof Score?", a: "A 0–100 composite score: ranking position (40%), 30-day trend (30%), AI Overview presence (20%), keyword coverage (10%). Green = strong proof. Red = urgent pain." },
  { q: "What happens after founding slots are gone?", a: "Pricing increases to public tiers. Founding members keep their rate permanently, regardless of future pricing changes." },
  { q: "When will VEXLO be live?", a: "Founding members get access first — before public launch. Expected Q2 2026. You'll receive a direct access link via email." },
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
