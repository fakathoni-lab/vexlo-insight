import { useState } from "react";
import { ChevronDown } from "lucide-react";

const faqs = [
  { q: "Do I need access to my prospect's Google accounts?", a: "No. Vexlo uses publicly available data — rankings, backlinks, and on-page signals. No Search Console or Analytics access required." },
  { q: "How fast is a proof report generated?", a: "Most reports are ready in under 30 seconds. We scan live data in real-time so your numbers are always fresh." },
  { q: "Can I white-label the reports?", a: "Yes. Pro and Elite plans let you add your agency's logo, colors, and custom domain to every report." },
  { q: "What's a Proof Score?", a: "A single 0-100 metric that combines ranking position, backlink authority, and on-page health into one number your prospects instantly understand." },
  { q: "Is there a free plan?", a: "We offer a free trial so you can generate your first report with zero commitment. No credit card required." },
  { q: "What data sources does Vexlo use?", a: "We aggregate public SERP data, backlink databases, and on-page crawl results. All data is pulled fresh at report generation time." },
  { q: "Can I share reports with prospects?", a: "Absolutely. Every report has a unique shareable link. Send it before your call and let the data warm up the conversation." },
  { q: "Do you offer API access?", a: "Yes, on the Elite plan. Integrate proof reports into your CRM, outbound sequences, or custom dashboards via our REST API." },
];

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (i: number) => setOpenIndex(openIndex === i ? null : i);

  return (
    <section className="py-20 lg:py-32 px-5 lg:px-10 max-w-[1280px] mx-auto">
      <p className="text-accent font-mono text-xs tracking-widest uppercase mb-3">
        FAQ
      </p>
      <h2 className="font-headline text-3xl sm:text-4xl mb-16 tracking-tight">
        Common <span className="italic">questions</span>
      </h2>

      <div className="max-w-[720px] mx-auto divide-y divide-border">
        {faqs.map((faq, i) => (
          <div key={i}>
            <button
              onClick={() => toggle(i)}
              className="w-full flex items-center justify-between py-5 text-left gap-4"
            >
              <span className="text-foreground text-sm font-body font-medium">{faq.q}</span>
              <ChevronDown
                className={`w-4 h-4 text-muted-foreground shrink-0 transition-transform duration-300 ${
                  openIndex === i ? "rotate-180" : ""
                }`}
              />
            </button>
            <div
              className="overflow-hidden transition-all duration-300"
              style={{ maxHeight: openIndex === i ? "200px" : "0px" }}
            >
              <p className="text-muted-foreground text-sm leading-relaxed pb-5">
                {faq.a}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default FAQ;
