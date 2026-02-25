const Navbar = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4 flex items-center justify-between backdrop-blur-md bg-background/80 border-b">
      <a href="/" className="font-headline text-2xl tracking-tight">
        vexlo
      </a>
      <div className="flex items-center gap-6">
        <a
          href="#how"
          className="text-muted-foreground text-sm font-body hover:text-foreground transition-colors duration-200 hidden sm:block"
        >
          How it works
        </a>
        <button className="h-9 px-4 bg-accent text-accent-foreground font-mono text-xs font-bold rounded-button hover:brightness-110 transition-all duration-200">
          Get Started
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
