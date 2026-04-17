import {
  GraduationCap,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
} from "lucide-react";

type QuickLink = { label: string; href: string };
type PortalLink = { label: string; href: string };

const footerLinks: { quickLinks: QuickLink[]; portal: PortalLink[] } = {
  quickLinks: [
    { label: "Home", href: "#home" },
    { label: "About Us", href: "#about" },
    { label: "Courses & Fees", href: "#courses" },
    { label: "Timetable", href: "#timetable" },
    { label: "Results", href: "#results" },
    { label: "Gallery", href: "#gallery" },
  ],
  portal: [
    { label: "Student Login", href: "/login" },
    { label: "Parent Portal", href: "/parent" },
    { label: "Admin Login", href: "/admin" },
    { label: "Pay Fees Online", href: "#courses" },
  ],
};

export function Footer() {
  const year = new Date().getFullYear();
  const hostname =
    typeof window !== "undefined" ? window.location.hostname : "";

  const handleNavClick = (href: string) => {
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <footer className="bg-primary text-primary-foreground" data-ocid="footer">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary-foreground/15">
                <GraduationCap className="w-5 h-5 text-primary-foreground" />
              </div>
              <div className="flex flex-col leading-none">
                <span className="font-display font-bold text-base tracking-tight">
                  YAHYA
                </span>
                <span className="font-body text-xs opacity-75 tracking-wide">
                  Personal Tuition
                </span>
              </div>
            </div>
            <p className="font-body text-sm opacity-80 leading-relaxed mb-4">
              Learn Better, Score Higher. Personal coaching for students in
              Vadodara — Classes 6 to 12.
            </p>
            <div className="flex flex-col gap-2 text-sm opacity-85">
              <a
                href="tel:+918200078923"
                className="flex items-center gap-2 hover:opacity-100 transition-smooth font-body"
              >
                <Phone className="w-3.5 h-3.5 flex-shrink-0" />
                <span>+91 8200078923</span>
              </a>
              <a
                href="tel:+919824489368"
                className="flex items-center gap-2 hover:opacity-100 transition-smooth font-body"
              >
                <Phone className="w-3.5 h-3.5 flex-shrink-0" />
                <span>+91 9824489368</span>
              </a>
              <a
                href="mailto:yahyapersonaltutionclasses2000@gmail.com"
                className="flex items-center gap-2 hover:opacity-100 transition-smooth font-body break-all"
              >
                <Mail className="w-3.5 h-3.5 flex-shrink-0" />
                <span>yahyapersonaltutionclasses2000@gmail.com</span>
              </a>
              <div className="flex items-start gap-2 font-body">
                <MapPin className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                <span>Vadodara, Gujarat, India</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-display font-semibold text-sm uppercase tracking-wider opacity-60 mb-4">
              Quick Links
            </h3>
            <ul className="flex flex-col gap-2">
              {footerLinks.quickLinks.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    onClick={(e) => {
                      e.preventDefault();
                      handleNavClick(link.href);
                    }}
                    className="font-body text-sm opacity-80 hover:opacity-100 hover:translate-x-1 inline-block transition-smooth"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Portal */}
          <div>
            <h3 className="font-display font-semibold text-sm uppercase tracking-wider opacity-60 mb-4">
              Portal
            </h3>
            <ul className="flex flex-col gap-2">
              {footerLinks.portal.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    onClick={
                      link.href.startsWith("#")
                        ? (e) => {
                            e.preventDefault();
                            const el = document.querySelector(link.href);
                            if (el) el.scrollIntoView({ behavior: "smooth" });
                          }
                        : undefined
                    }
                    className="font-body text-sm opacity-80 hover:opacity-100 hover:translate-x-1 inline-block transition-smooth"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* CTA */}
          <div>
            <h3 className="font-display font-semibold text-sm uppercase tracking-wider opacity-60 mb-4">
              Book Free Demo
            </h3>
            <p className="font-body text-sm opacity-80 mb-4 leading-relaxed">
              Get a free demo class and experience our teaching methodology
              firsthand.
            </p>
            <a
              href={`https://wa.me/918200078923?text=${encodeURIComponent("Hello, I want to book a free demo class at Yahya Personal Tuition Classes")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#25D366] text-white px-4 py-2.5 rounded-lg text-sm font-body font-semibold hover:bg-[#20bd5a] transition-smooth shadow-subtle"
              data-ocid="footer.whatsapp_button"
            >
              <MessageCircle className="w-4 h-4" />
              Chat on WhatsApp
            </a>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-primary-foreground/20 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs opacity-60 font-body">
          <span>
            © {year} Yahya Personal Tuition Classes, Vadodara. All rights
            reserved.
          </span>
          <span>
            Built with love using{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(hostname)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:opacity-100 transition-smooth underline"
            >
              caffeine.ai
            </a>
          </span>
        </div>
      </div>
    </footer>
  );
}
