const Footer = () => {
  return (
    <footer className="px-6 py-12 border-t">
      <div className="max-w-[1000px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <span className="font-headline text-lg">vexlo</span>
        <p className="text-muted-foreground text-xs font-mono">
          © {new Date().getFullYear()} Vexlo. Sales proof, simplified.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
