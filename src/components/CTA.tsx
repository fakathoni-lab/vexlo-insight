const CTA = () => {
  return (
    <section className="px-6 py-32 text-center">
      <h2 className="font-headline text-4xl sm:text-5xl mb-6 tracking-tight">
        Stop pitching.<br />
        Start <span className="text-accent italic">proving</span>.
      </h2>
      <p className="text-muted-foreground text-lg max-w-[460px] mx-auto mb-10 leading-relaxed">
        Your next discovery call deserves data-backed proof. Get your first report free.
      </p>
      <button className="h-12 px-8 bg-accent text-accent-foreground font-mono text-sm font-bold rounded-button hover:brightness-110 active:brightness-95 transition-all duration-200">
        Generate Free Report →
      </button>
    </section>
  );
};

export default CTA;
