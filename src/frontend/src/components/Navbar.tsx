import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Link } from "@tanstack/react-router";
import { BookOpen, GraduationCap, Menu, X } from "lucide-react";
import { useEffect, useState } from "react";

const navLinks = [
  { label: "Home", href: "#home" },
  { label: "About Us", href: "#about" },
  { label: "Courses", href: "#courses" },
  { label: "Timetable", href: "#timetable" },
  { label: "Results", href: "#results" },
  { label: "Gallery", href: "#gallery" },
  { label: "Contact", href: "#contact" },
];

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleNavClick = (href: string) => {
    setIsOpen(false);
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-smooth",
        scrolled
          ? "bg-card border-b border-border shadow-elevated"
          : "bg-card border-b border-border shadow-subtle",
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <button
            type="button"
            className="flex items-center gap-2.5 group"
            data-ocid="navbar.logo"
            onClick={() => handleNavClick("#home")}
          >
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-primary shadow-subtle">
              <GraduationCap className="w-5 h-5 text-primary-foreground" />
              <BookOpen className="w-3 h-3 text-primary-foreground absolute -bottom-0.5 -right-0.5 opacity-80" />
            </div>
            <div className="flex flex-col leading-none">
              <span className="font-display font-bold text-base text-primary tracking-tight">
                YAHYA
              </span>
              <span className="font-body text-xs text-muted-foreground tracking-wide">
                Personal Tuition
              </span>
            </div>
          </button>

          {/* Desktop nav */}
          <nav
            className="hidden md:flex items-center gap-1"
            data-ocid="navbar.nav"
          >
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                data-ocid={`navbar.link.${link.label.toLowerCase().replace(/\s+/g, "-")}`}
                onClick={(e) => {
                  e.preventDefault();
                  handleNavClick(link.href);
                }}
                className="px-3 py-1.5 rounded-lg text-sm font-body font-medium text-foreground/75 hover:text-primary hover:bg-primary/8 transition-smooth"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Desktop CTAs */}
          <div className="hidden md:flex items-center gap-2">
            <Link to="/login">
              <Button
                variant="outline"
                size="sm"
                data-ocid="navbar.login_button"
                className="font-body font-medium"
              >
                Student Login
              </Button>
            </Link>
            <Button
              size="sm"
              data-ocid="navbar.join_button"
              onClick={() => handleNavClick("#contact")}
              className="bg-accent text-accent-foreground hover:bg-accent/90 font-body font-semibold shadow-subtle"
            >
              Join Now
            </Button>
          </div>

          {/* Mobile hamburger */}
          <button
            type="button"
            className="md:hidden p-2 rounded-lg hover:bg-muted transition-smooth"
            onClick={() => setIsOpen(!isOpen)}
            aria-label={isOpen ? "Close menu" : "Open menu"}
            data-ocid="navbar.hamburger_toggle"
          >
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div
          className="md:hidden bg-card border-t border-border shadow-elevated"
          data-ocid="navbar.mobile_menu"
        >
          <nav className="px-4 py-3 flex flex-col gap-1">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                data-ocid={`navbar.mobile_link.${link.label.toLowerCase().replace(/\s+/g, "-")}`}
                onClick={(e) => {
                  e.preventDefault();
                  handleNavClick(link.href);
                }}
                className="px-3 py-2.5 rounded-lg text-sm font-body font-medium text-foreground/80 hover:text-primary hover:bg-primary/8 transition-smooth"
              >
                {link.label}
              </a>
            ))}
            <div className="flex flex-col gap-2 mt-2 pt-2 border-t border-border">
              <Link to="/login">
                <Button
                  variant="outline"
                  data-ocid="navbar.mobile_login_button"
                  className="w-full font-body"
                >
                  Student Login
                </Button>
              </Link>
              <Button
                data-ocid="navbar.mobile_join_button"
                onClick={() => handleNavClick("#contact")}
                className="w-full bg-accent text-accent-foreground hover:bg-accent/90 font-body font-semibold"
              >
                Join Now
              </Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
