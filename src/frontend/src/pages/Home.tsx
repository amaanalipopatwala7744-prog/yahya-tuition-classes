import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useSubmitLead } from "@/hooks/useQueries";
import { ClassLevel } from "@/types";
import {
  Award,
  BarChart3,
  BookOpen,
  Calendar,
  CheckCircle,
  ChevronRight,
  Clock,
  GraduationCap,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Shield,
  Star,
  Target,
  TrendingUp,
  Users,
  Zap,
  ZoomIn,
} from "lucide-react";
import { motion } from "motion/react";
import { useRef, useState } from "react";

/* ─── Static Data ─────────────────────────────────────────────── */

const features = [
  {
    icon: Users,
    title: "Small Batches",
    desc: "Only 5–8 students per batch for maximum personal attention and focused learning.",
  },
  {
    icon: Target,
    title: "Personalized Plans",
    desc: "Custom study plans tailored to each student's strengths, weaknesses, and pace.",
  },
  {
    icon: TrendingUp,
    title: "Weekly Tests",
    desc: "Regular assessments to track progress and identify areas for improvement.",
  },
  {
    icon: Shield,
    title: "Result-Oriented",
    desc: "Proven track record with students scoring 90%+ in board exams consistently.",
  },
  {
    icon: Zap,
    title: "Experienced Teacher",
    desc: "10+ years of teaching experience with deep subject matter expertise.",
  },
  {
    icon: BarChart3,
    title: "Progress Reports",
    desc: "Detailed monthly reports for parents with attendance, marks, and remarks.",
  },
];

const courses = [
  {
    classRange: "Class 6–8",
    subjects: ["Mathematics", "Science", "English", "Social Science"],
    fee: "₹800–₁,200/mo",
    popular: false,
  },
  {
    classRange: "Class 9–10",
    subjects: ["Mathematics", "Science", "English", "SST", "SSC Board Prep"],
    fee: "₹1,200–₂,000/mo",
    popular: true,
  },
  {
    classRange: "Class 11–12",
    subjects: ["Physics", "Chemistry", "Maths", "Biology", "Commerce"],
    fee: "₹2,000–₃,500/mo",
    popular: false,
  },
];

const batches = [
  {
    day: "Mon–Fri",
    time: "7:00 AM – 9:00 AM",
    label: "Morning Batch",
    seats: "2 seats left",
    urgent: true,
  },
  {
    day: "Mon–Fri",
    time: "4:00 PM – 6:00 PM",
    label: "Afternoon Batch",
    seats: "Available",
    urgent: false,
  },
  {
    day: "Mon–Fri",
    time: "6:00 PM – 8:00 PM",
    label: "Evening Batch",
    seats: "1 seat left",
    urgent: true,
  },
  {
    day: "Sat–Sun",
    time: "10:00 AM – 1:00 PM",
    label: "Weekend Batch",
    seats: "Available",
    urgent: false,
  },
];

const testimonials = [
  {
    name: "Priya Shah",
    class: "Class 10, 2024",
    text: "My daughter scored 95% in boards thanks to sir's personal attention and weekly tests. Best decision we made!",
    score: "95%",
  },
  {
    name: "Rohan Patel",
    class: "Class 12, 2023",
    text: "From 60% to 88% in just one year. The small batch size made all the difference. Highly recommend to every parent!",
    score: "88%",
  },
  {
    name: "Fatima Ansari",
    class: "Class 9, 2024",
    text: "Very structured teaching method. Sir explains every concept clearly and follows up until we understand completely.",
    score: "91%",
  },
];

const results = [
  {
    name: "Aisha Khan",
    class: "10th Board",
    score: "97%",
    subject: "Mathematics",
  },
  { name: "Dev Mehta", class: "12th Board", score: "93%", subject: "Physics" },
  { name: "Sara Joshi", class: "10th Board", score: "96%", subject: "Science" },
  {
    name: "Aryan Desai",
    class: "12th Board",
    score: "91%",
    subject: "Chemistry",
  },
  {
    name: "Nisha Verma",
    class: "10th Board",
    score: "98%",
    subject: "Mathematics",
  },
  {
    name: "Riya Malhotra",
    class: "12th Board",
    score: "89%",
    subject: "Commerce",
  },
];

const galleryImages = [
  {
    src: "/assets/generated/gallery-students-classroom.dim_600x400.jpg",
    label: "Classroom Sessions",
    category: "Classroom",
  },
  {
    src: "/assets/generated/gallery-whiteboard-teaching.dim_600x400.jpg",
    label: "Interactive Teaching",
    category: "Classroom",
  },
  {
    src: "/assets/generated/gallery-awards-ceremony.dim_600x400.jpg",
    label: "Award Ceremony",
    category: "Activities",
  },
  {
    src: "/assets/generated/gallery-board-results.dim_600x400.jpg",
    label: "Board Exam Results",
    category: "Results",
  },
  {
    src: "/assets/generated/gallery-parent-meeting.dim_600x400.jpg",
    label: "Parent-Teacher Meets",
    category: "Activities",
  },
  {
    src: "/assets/generated/gallery-classroom-interior.dim_600x400.jpg",
    label: "Our Classroom",
    category: "Classroom",
  },
];

const stats = [
  { value: "200+", label: "Students Taught" },
  { value: "10+", label: "Years Experience" },
  { value: "95%+", label: "Board Result Avg." },
  { value: "5–8", label: "Students Per Batch" },
];

/* ─── Helpers ────────────────────────────────────────────────── */

function SectionTitle({
  label,
  title,
  sub,
}: { label: string; title: string; sub?: string }) {
  return (
    <div className="text-center mb-10">
      <Badge
        variant="outline"
        className="mb-3 font-body text-primary border-primary/30 bg-primary/5 uppercase tracking-wider text-xs px-3 py-1"
      >
        {label}
      </Badge>
      <h2 className="font-display font-bold text-2xl sm:text-3xl text-foreground mb-3">
        {title}
      </h2>
      {sub && (
        <p className="font-body text-muted-foreground max-w-xl mx-auto text-sm sm:text-base">
          {sub}
        </p>
      )}
    </div>
  );
}

function ContactForm() {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    classLevel: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const submitLead = useSubmitLead();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.name && form.phone) {
      const classMap: Record<string, ClassLevel> = {
        "6-8": ClassLevel.class6to8,
        "9-10": ClassLevel.class9to10,
        "11-12": ClassLevel.class11to12,
      };
      try {
        await submitLead.mutateAsync({
          name: form.name,
          phone: form.phone,
          classInterest: classMap[form.classLevel] ?? ClassLevel.class9to10,
          preferredTime: "Flexible",
        });
      } catch {
        /* silent */
      }
    }
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div
        className="flex flex-col items-center justify-center py-10 text-center"
        data-ocid="contact.success_state"
      >
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
          <CheckCircle className="w-8 h-8 text-primary" />
        </div>
        <h4 className="font-display font-bold text-lg text-foreground mb-2">
          Demo Class Booked!
        </h4>
        <p className="font-body text-sm text-muted-foreground max-w-xs">
          We'll contact you within 24 hours to confirm your free demo class
          slot. See you soon!
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4"
      data-ocid="contact.form"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="cf-name"
            className="font-body text-sm font-medium text-foreground block mb-1.5"
          >
            Full Name *
          </label>
          <input
            id="cf-name"
            type="text"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Student's full name"
            data-ocid="contact.name_input"
            className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-foreground font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-smooth"
          />
        </div>
        <div>
          <label
            htmlFor="cf-phone"
            className="font-body text-sm font-medium text-foreground block mb-1.5"
          >
            Phone Number *
          </label>
          <input
            id="cf-phone"
            type="tel"
            required
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            placeholder="+91 00000 00000"
            data-ocid="contact.phone_input"
            className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-foreground font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-smooth"
          />
        </div>
      </div>
      <div>
        <label
          htmlFor="cf-email"
          className="font-body text-sm font-medium text-foreground block mb-1.5"
        >
          Email (optional)
        </label>
        <input
          id="cf-email"
          type="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          placeholder="parent@email.com"
          data-ocid="contact.email_input"
          className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-foreground font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-smooth"
        />
      </div>
      <div>
        <label
          htmlFor="cf-class"
          className="font-body text-sm font-medium text-foreground block mb-1.5"
        >
          Class
        </label>
        <select
          id="cf-class"
          value={form.classLevel}
          onChange={(e) => setForm({ ...form, classLevel: e.target.value })}
          data-ocid="contact.class_select"
          className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-foreground font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-smooth"
        >
          <option value="">Select class range</option>
          <option value="6-8">Class 6–8</option>
          <option value="9-10">Class 9–10</option>
          <option value="11-12">Class 11–12</option>
        </select>
      </div>
      <div>
        <label
          htmlFor="cf-message"
          className="font-body text-sm font-medium text-foreground block mb-1.5"
        >
          Message (optional)
        </label>
        <textarea
          id="cf-message"
          value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
          placeholder="Any specific subjects or requirements..."
          rows={3}
          data-ocid="contact.message_textarea"
          className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-foreground font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-smooth resize-none"
        />
      </div>
      <Button
        type="submit"
        className="w-full bg-accent text-accent-foreground hover:bg-accent/90 font-body font-semibold py-2.5"
        data-ocid="contact.submit_button"
      >
        Book Free Demo Class
      </Button>
      <p className="font-body text-xs text-muted-foreground text-center">
        Or call us:{" "}
        <a
          href="tel:+918200078923"
          className="text-primary hover:underline font-medium"
        >
          +91 8200078923
        </a>{" "}
        ·{" "}
        <a
          href="tel:+919824489368"
          className="text-primary hover:underline font-medium"
        >
          +91 9824489368
        </a>
      </p>
    </form>
  );
}

/* ─── Main Page ──────────────────────────────────────────────── */

export function HomePage() {
  const contactRef = useRef<HTMLDivElement>(null);
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);
  const whatsappHref = `https://wa.me/918200078923?text=${encodeURIComponent("Hello, I want to join Yahya Tuition Classes")}`;
  const scrollToContact = () =>
    contactRef.current?.scrollIntoView({ behavior: "smooth" });

  return (
    <div>
      {/* ── Urgency Banner ───────────────────────────────────── */}
      <div
        className="bg-accent text-accent-foreground py-2 px-4 text-center"
        data-ocid="hero.urgency_banner"
      >
        <p className="font-body text-sm font-semibold">
          🎓 Free Demo Class Available —{" "}
          <span className="underline underline-offset-2">Limited Seats!</span>{" "}
          Call now:{" "}
          <a
            href="tel:+918200078923"
            className="font-bold hover:opacity-80 transition-smooth"
          >
            +91 8200078923
          </a>
        </p>
      </div>

      {/* ── Hero ─────────────────────────────────────────────── */}
      <section
        id="home"
        className="bg-card border-b border-border overflow-hidden"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            {/* Left copy */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <p className="font-body text-sm font-semibold text-primary uppercase tracking-widest mb-3">
                #1 Personal Tuition in Vadodara
              </p>
              <h1 className="font-display font-bold text-3xl sm:text-4xl lg:text-[2.75rem] text-foreground leading-tight mb-5">
                Personal Attention.
                <br />
                <span className="text-primary">Better Results.</span>
                <br />
                Bright Future.
              </h1>
              <p className="font-body text-muted-foreground text-base sm:text-lg mb-5 leading-relaxed">
                Expert personal coaching for students in{" "}
                <strong className="text-foreground">Vadodara</strong> — Classes
                6 to 12. Small batches, dedicated teacher, result-oriented
                approach.
              </p>
              <div className="flex flex-wrap gap-x-5 gap-y-2 mb-7">
                {[
                  "Classes 6–12",
                  "10+ Years Exp.",
                  "95%+ Board Results",
                  "Vadodara",
                ].map((tag) => (
                  <span
                    key={tag}
                    className="flex items-center gap-1.5 text-sm font-body text-muted-foreground"
                  >
                    <CheckCircle className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                    {tag}
                  </span>
                ))}
              </div>
              <div className="flex flex-wrap gap-3">
                <Button
                  size="lg"
                  data-ocid="hero.join_button"
                  onClick={scrollToContact}
                  className="bg-primary text-primary-foreground hover:bg-primary/90 font-body font-semibold shadow-elevated px-6"
                >
                  Join Now <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
                <a
                  href={whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-ocid="hero.whatsapp_button"
                >
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-[#25D366] text-[#25D366] hover:bg-[#25D366]/8 font-body font-semibold"
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Chat on WhatsApp
                  </Button>
                </a>
              </div>
            </motion.div>

            {/* Right image */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="relative"
            >
              <div className="rounded-2xl overflow-hidden shadow-elevated border border-border">
                <img
                  src="/assets/generated/hero-tuition-classroom.dim_1200x800.jpg"
                  alt="Yahya Personal Tuition Classes – small group teaching in Vadodara"
                  className="w-full h-64 sm:h-80 lg:h-96 object-cover"
                  loading="eager"
                />
              </div>
              <div className="absolute -bottom-4 -left-3 bg-card rounded-xl shadow-elevated border border-border px-4 py-3 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Award className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-display font-bold text-xl text-foreground leading-none">
                    95%+
                  </p>
                  <p className="font-body text-xs text-muted-foreground mt-0.5">
                    Board Results
                  </p>
                </div>
              </div>
              <div className="absolute -top-4 -right-3 bg-card rounded-xl shadow-elevated border border-border px-4 py-3 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-accent/15 flex items-center justify-center flex-shrink-0">
                  <Star className="w-5 h-5 text-accent fill-accent" />
                </div>
                <div>
                  <p className="font-display font-bold text-xl text-foreground leading-none">
                    200+
                  </p>
                  <p className="font-body text-xs text-muted-foreground mt-0.5">
                    Students Taught
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Stats Bar ─────────────────────────────────────────── */}
      <section
        className="bg-primary text-primary-foreground py-8"
        data-ocid="stats.section"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
              >
                <p className="font-display font-bold text-2xl sm:text-3xl">
                  {stat.value}
                </p>
                <p className="font-body text-sm opacity-75 mt-1">
                  {stat.label}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Why Choose Us ─────────────────────────────────────── */}
      <section id="about" className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionTitle
            label="Why Choose Us"
            title="The Yahya Difference"
            sub="We don't just teach — we build confidence and academic excellence through personalized mentoring."
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
              >
                <Card
                  className="h-full hover:shadow-elevated transition-smooth group"
                  data-ocid={`features.item.${i + 1}`}
                >
                  <CardContent className="p-5">
                    <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/15 transition-smooth">
                      <f.icon className="w-5 h-5 text-primary" />
                    </div>
                    <h3 className="font-display font-semibold text-base text-foreground mb-2">
                      {f.title}
                    </h3>
                    <p className="font-body text-sm text-muted-foreground leading-relaxed">
                      {f.desc}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Courses & Fees ────────────────────────────────────── */}
      <section id="courses" className="py-16 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionTitle
            label="Courses & Fees"
            title="What We Offer"
            sub="Affordable, structured coaching for every grade. All subjects covered under one roof."
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
            {courses.map((course, i) => (
              <motion.div
                key={course.classRange}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Card
                  className={`h-full hover:shadow-elevated transition-smooth relative ${course.popular ? "border-primary ring-1 ring-primary/20" : ""}`}
                  data-ocid={`courses.item.${i + 1}`}
                >
                  {course.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                      <Badge className="bg-primary text-primary-foreground font-body text-xs px-3 shadow-subtle">
                        Most Popular
                      </Badge>
                    </div>
                  )}
                  <CardContent className="p-6 pt-7">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                          <BookOpen className="w-4 h-4 text-primary" />
                        </div>
                        <h3 className="font-display font-bold text-base text-foreground">
                          {course.classRange}
                        </h3>
                      </div>
                      <Badge className="bg-accent/15 text-accent border-accent/30 font-body font-semibold text-xs whitespace-nowrap">
                        {course.fee}
                      </Badge>
                    </div>
                    <ul className="space-y-2 mb-5">
                      {course.subjects.map((subj) => (
                        <li
                          key={subj}
                          className="flex items-center gap-2 text-sm font-body text-muted-foreground"
                        >
                          <CheckCircle className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                          {subj}
                        </li>
                      ))}
                    </ul>
                    <Button
                      className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-body"
                      size="sm"
                      data-ocid={`courses.enroll_button.${i + 1}`}
                      onClick={scrollToContact}
                    >
                      Enroll Now
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Free demo CTA strip */}
          <div className="bg-card border border-border rounded-xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-accent/15 flex items-center justify-center flex-shrink-0">
                <GraduationCap className="w-5 h-5 text-accent" />
              </div>
              <div>
                <p className="font-display font-semibold text-sm text-foreground">
                  Free Demo Class Available!
                </p>
                <p className="font-body text-xs text-muted-foreground">
                  Attend one free class before enrolling. Limited seats per
                  batch.
                </p>
              </div>
            </div>
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              data-ocid="courses.demo_button"
            >
              <Button
                size="sm"
                className="bg-accent text-accent-foreground hover:bg-accent/90 font-body font-semibold whitespace-nowrap"
              >
                Book Free Demo
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* ── Timetable ─────────────────────────────────────────── */}
      <section id="timetable" className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionTitle
            label="Schedule"
            title="Batch Timings"
            sub="Choose a batch that fits your school schedule. Flexible options available for all students."
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {batches.map((batch, i) => (
              <motion.div
                key={batch.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
              >
                <Card
                  className="text-center hover:shadow-elevated transition-smooth"
                  data-ocid={`timetable.item.${i + 1}`}
                >
                  <CardContent className="p-5">
                    <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center mb-3 mx-auto">
                      <Clock className="w-5 h-5 text-primary" />
                    </div>
                    <h3 className="font-display font-semibold text-sm text-foreground mb-1">
                      {batch.label}
                    </h3>
                    <p className="font-body text-xs text-muted-foreground mb-2">
                      {batch.day}
                    </p>
                    <p className="font-display font-bold text-base text-primary mb-3">
                      {batch.time}
                    </p>
                    <Badge
                      variant="outline"
                      className={`text-xs font-body ${
                        batch.urgent
                          ? "border-destructive/40 text-destructive bg-destructive/5"
                          : "border-primary/30 text-primary bg-primary/5"
                      }`}
                    >
                      {batch.seats}
                    </Badge>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
          <p className="text-center font-body text-xs text-muted-foreground mt-5">
            ✦ Flexible batch timing available on request · Contact us for custom
            schedules
          </p>
        </div>
      </section>

      {/* ── Student Results ───────────────────────────────────── */}
      <section id="results" className="py-16 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionTitle
            label="Student Results"
            title="Our Students Excel"
            sub="Real results from real students. We're proud of every success story."
          />
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {results.map((r, i) => (
              <motion.div
                key={r.name}
                initial={{ opacity: 0, scale: 0.92 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
              >
                <Card
                  className="text-center hover:shadow-elevated transition-smooth"
                  data-ocid={`results.item.${i + 1}`}
                >
                  <CardContent className="p-4">
                    <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center mx-auto mb-2">
                      <span className="font-display font-bold text-xs text-primary-foreground">
                        {r.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </span>
                    </div>
                    <p className="font-display font-bold text-xl text-primary">
                      {r.score}
                    </p>
                    <p className="font-body text-xs text-foreground font-medium truncate">
                      {r.name}
                    </p>
                    <p className="font-body text-xs text-muted-foreground">
                      {r.class}
                    </p>
                    <p className="font-body text-xs text-muted-foreground mt-0.5">
                      {r.subject}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ──────────────────────────────────────── */}
      <section className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionTitle
            label="Testimonials"
            title="What Parents Say"
            sub="Trusted by hundreds of families across Vadodara for consistent academic results."
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {testimonials.map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Card
                  className="h-full hover:shadow-elevated transition-smooth"
                  data-ocid={`testimonials.item.${i + 1}`}
                >
                  <CardContent className="p-5">
                    <div className="flex items-center gap-0.5 mb-3">
                      {["s1", "s2", "s3", "s4", "s5"].map((sk) => (
                        <Star
                          key={sk}
                          className="w-3.5 h-3.5 text-accent fill-accent"
                        />
                      ))}
                    </div>
                    <p className="font-body text-sm text-muted-foreground leading-relaxed mb-4 italic">
                      "{t.text}"
                    </p>
                    <div className="flex items-center justify-between pt-3 border-t border-border">
                      <div>
                        <p className="font-display font-semibold text-sm text-foreground">
                          {t.name}
                        </p>
                        <p className="font-body text-xs text-muted-foreground">
                          {t.class}
                        </p>
                      </div>
                      <Badge className="bg-primary/10 text-primary border-primary/20 font-display font-bold">
                        {t.score}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Gallery ───────────────────────────────────────────── */}
      <section id="gallery" className="py-16 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionTitle
            label="Gallery"
            title="Life at Yahya Classes"
            sub="A glimpse into our classroom environment, activities, and student achievements."
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {galleryImages.map((item) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.07 }}
              >
                <button
                  type="button"
                  className="relative group w-full rounded-xl overflow-hidden shadow-subtle hover:shadow-elevated transition-smooth aspect-video focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  onClick={() => setLightboxSrc(item.src)}
                  onKeyDown={(e) =>
                    e.key === "Enter" && setLightboxSrc(item.src)
                  }
                  data-ocid={`gallery.item.${galleryImages.indexOf(item) + 1}`}
                  aria-label={`View: ${item.label}`}
                >
                  <img
                    src={item.src}
                    alt={item.label}
                    className="w-full h-full object-cover group-hover:scale-105 transition-smooth"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/30 transition-smooth flex items-center justify-center">
                    <ZoomIn className="w-7 h-7 text-primary-foreground opacity-0 group-hover:opacity-100 transition-smooth" />
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-foreground/60 to-transparent p-3 translate-y-full group-hover:translate-y-0 transition-smooth">
                    <p className="font-body text-xs font-semibold text-primary-foreground">
                      {item.label}
                    </p>
                    <Badge
                      variant="outline"
                      className="text-[10px] mt-1 border-primary-foreground/30 text-primary-foreground bg-primary-foreground/10"
                    >
                      {item.category}
                    </Badge>
                  </div>
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Lightbox */}
      {lightboxSrc && (
        <dialog
          open
          className="fixed inset-0 z-50 m-0 w-full h-full max-w-none max-h-none flex items-center justify-center bg-foreground/80 p-4 border-none"
          aria-label="Image lightbox"
          data-ocid="gallery.lightbox"
          onClose={() => setLightboxSrc(null)}
          onClick={() => setLightboxSrc(null)}
          onKeyDown={(e) => e.key === "Escape" && setLightboxSrc(null)}
        >
          <div
            className="relative max-w-4xl w-full max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
          >
            <img
              src={lightboxSrc}
              alt="Gallery enlarged view"
              className="w-full h-full object-contain rounded-xl shadow-elevated"
            />
            <button
              type="button"
              onClick={() => setLightboxSrc(null)}
              className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-card shadow-elevated flex items-center justify-center font-body text-sm font-bold text-foreground hover:bg-muted transition-smooth"
              aria-label="Close lightbox"
              data-ocid="gallery.close_button"
            >
              ✕
            </button>
          </div>
        </dialog>
      )}

      {/* ── Contact ───────────────────────────────────────────── */}
      <section id="contact" className="py-16 bg-background" ref={contactRef}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionTitle
            label="Contact Us"
            title="Get in Touch"
            sub="Book a free demo class or reach out for admissions, fee structure, or batch availability."
          />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Contact info */}
            <div className="space-y-5">
              {[
                {
                  icon: Phone,
                  title: "Phone",
                  content: (
                    <>
                      <a
                        href="tel:+918200078923"
                        className="font-body text-sm text-muted-foreground hover:text-primary transition-smooth block"
                      >
                        +91 8200078923
                      </a>
                      <a
                        href="tel:+919824489368"
                        className="font-body text-sm text-muted-foreground hover:text-primary transition-smooth block"
                      >
                        +91 9824489368
                      </a>
                    </>
                  ),
                },
                {
                  icon: Mail,
                  title: "Email",
                  content: (
                    <a
                      href="mailto:yahyapersonaltutionclasses2000@gmail.com"
                      className="font-body text-sm text-muted-foreground hover:text-primary transition-smooth break-all"
                    >
                      yahyapersonaltutionclasses2000@gmail.com
                    </a>
                  ),
                },
                {
                  icon: MapPin,
                  title: "Location",
                  content: (
                    <p className="font-body text-sm text-muted-foreground">
                      Vadodara, Gujarat, India
                    </p>
                  ),
                },
                {
                  icon: Calendar,
                  title: "Class Hours",
                  content: (
                    <p className="font-body text-sm text-muted-foreground">
                      Mon–Sat: 7 AM – 8 PM · Sun: 10 AM – 1 PM
                    </p>
                  ),
                },
              ].map((item) => (
                <div key={item.title} className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <item.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-display font-semibold text-sm text-foreground mb-1">
                      {item.title}
                    </p>
                    {item.content}
                  </div>
                </div>
              ))}

              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                data-ocid="contact.whatsapp_button"
                className="inline-flex items-center gap-2.5 px-5 py-3 rounded-xl font-body font-semibold text-sm bg-[#25D366] text-white hover:bg-[#22c35e] transition-smooth shadow-subtle mt-2"
              >
                <MessageCircle className="w-4 h-4" />
                Chat on WhatsApp
              </a>

              <div className="grid grid-cols-2 gap-3 pt-2">
                {[
                  { label: "Demo Class", value: "FREE", sub: "No obligation" },
                  { label: "Batch Size", value: "5–8", sub: "Students max" },
                ].map((info) => (
                  <Card
                    key={info.label}
                    className="bg-primary/5 border-primary/15"
                  >
                    <CardContent className="p-3 text-center">
                      <p className="font-display font-bold text-xl text-primary">
                        {info.value}
                      </p>
                      <p className="font-body text-xs text-foreground font-medium">
                        {info.label}
                      </p>
                      <p className="font-body text-xs text-muted-foreground">
                        {info.sub}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Form card */}
            <Card className="shadow-card">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 rounded-lg bg-accent/15 flex items-center justify-center flex-shrink-0">
                    <GraduationCap className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-base text-foreground">
                      Book a Free Demo Class
                    </h3>
                    <p className="font-body text-xs text-muted-foreground">
                      We'll call you back within 24 hours
                    </p>
                  </div>
                </div>
                <ContactForm />
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
