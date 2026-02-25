const Footer = () => {
  return (
    <footer className="py-20 lg:py-32 px-5 lg:px-10 border-t border-border">
      <div className="max-w-[1280px] mx-auto grid grid-cols-2 md:grid-cols-4 gap-10">
        {/* Brand */}
        <div>
          <span className="font-mono text-sm uppercase tracking-widest text-foreground block mb-4">
            Vexlo
          </span>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Sales proof, simplified. SEO reporting for agencies that close.
          </p>
        </div>

        {/* Product */}
        <div>
          <h4 className="font-mono text-xs uppercase tracking-widest text-foreground mb-4">
            Product
          </h4>
          <ul className="space-y-2">
            <li><a href="#how" className="text-muted-foreground text-sm hover:text-foreground transition-colors duration-200">How it works</a></li>
            <li><a href="#features" className="text-muted-foreground text-sm hover:text-foreground transition-colors duration-200">Features</a></li>
            <li><a href="#pricing" className="text-muted-foreground text-sm hover:text-foreground transition-colors duration-200">Pricing</a></li>
            <li><a href="#demo" className="text-muted-foreground text-sm hover:text-foreground transition-colors duration-200">Demo</a></li>
          </ul>
        </div>

        {/* Company */}
        <div>
          <h4 className="font-mono text-xs uppercase tracking-widest text-foreground mb-4">
            Company
          </h4>
          <ul className="space-y-2">
            <li><a href="#" className="text-muted-foreground text-sm hover:text-foreground transition-colors duration-200">About</a></li>
            <li><a href="#" className="text-muted-foreground text-sm hover:text-foreground transition-colors duration-200">Blog</a></li>
            <li><a href="#" className="text-muted-foreground text-sm hover:text-foreground transition-colors duration-200">Contact</a></li>
          </ul>
        </div>

        {/* Legal */}
        <div>
          <h4 className="font-mono text-xs uppercase tracking-widest text-foreground mb-4">
            Legal
          </h4>
          <ul className="space-y-2">
            <li><a href="#" className="text-muted-foreground text-sm hover:text-foreground transition-colors duration-200">Privacy</a></li>
            <li><a href="#" className="text-muted-foreground text-sm hover:text-foreground transition-colors duration-200">Terms</a></li>
          </ul>
        </div>
      </div>

      <div className="max-w-[1280px] mx-auto mt-16 pt-8 border-t border-border">
        <p className="text-muted-foreground text-xs font-mono text-center">
          © {new Date().getFullYear()} Vexlo. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
