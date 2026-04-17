import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSubmitLead } from "@/hooks/useQueries";
import { cn } from "@/lib/utils";
import { ClassLevel } from "@/types";
import {
  Bot,
  ExternalLink,
  Mail,
  MessageCircle,
  Phone,
  Send,
  X,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

// ─── Structured content helpers ───────────────────────────────────────────────

type MessageContent =
  | { type: "text"; text: string }
  | { type: "fee-table" }
  | { type: "timetable" }
  | { type: "contact" }
  | { type: "quick-replies"; text: string; options: string[] };

interface ChatMsg {
  role: "bot" | "user";
  content: MessageContent;
  id: number;
}

// ─── Lead collection flow ─────────────────────────────────────────────────────

type LeadStep = "idle" | "name" | "class" | "phone" | "time" | "done";

interface LeadDraft {
  name: string;
  classInterest: ClassLevel | null;
  phone: string;
  preferredTime: string;
}

const CLASS_OPTIONS = ["Class 6–8", "Class 9–10", "Class 11–12"];
const TIME_OPTIONS = [
  "Morning (7–9 AM)",
  "Afternoon (3–5 PM)",
  "Evening (6–8 PM)",
  "Weekend batch",
];

const classLabelToLevel: Record<string, ClassLevel> = {
  "Class 6–8": ClassLevel.class6to8,
  "Class 9–10": ClassLevel.class9to10,
  "Class 11–12": ClassLevel.class11to12,
};

// ─── Main component ───────────────────────────────────────────────────────────

let msgCounter = 100;
function nextId() {
  return ++msgCounter;
}

function makeBot(content: MessageContent): ChatMsg {
  return { role: "bot", content, id: nextId() };
}
function makeUser(text: string): ChatMsg {
  return { role: "user", content: { type: "text", text }, id: nextId() };
}

const GREETING: ChatMsg = makeBot({
  type: "quick-replies",
  text: "Hi! 👋 I'm Yahya AI Assistant.\n\nHow can I help you today?",
  options: ["Fees & Courses", "Timetable", "Demo Class", "Contact Us", "Other"],
});

export function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  const [messages, setMessages] = useState<ChatMsg[]>([GREETING]);
  const [input, setInput] = useState("");
  const [leadStep, setLeadStep] = useState<LeadStep>("idle");
  const [leadDraft, setLeadDraft] = useState<LeadDraft>({
    name: "",
    classInterest: null,
    phone: "",
    preferredTime: "",
  });
  const [isTyping, setIsTyping] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const submitLead = useSubmitLead();

  // Scroll to bottom on new messages
  // biome-ignore lint/correctness/useExhaustiveDependencies: intentional scroll trigger on length/typing change
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, isTyping]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setHasUnread(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const pushBot = useCallback(
    (content: MessageContent, delay = 600) => {
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        setMessages((prev) => [...prev, makeBot(content)]);
        if (!isOpen) setHasUnread(true);
      }, delay);
    },
    [isOpen],
  );

  const pushUser = useCallback((text: string) => {
    setMessages((prev) => [...prev, makeUser(text)]);
  }, []);

  // ─── Scripted flows ──────────────────────────────────────────────────────────

  const handleFeesAndCourses = useCallback(() => {
    pushUser("Fees & Courses");
    pushBot({ type: "fee-table" });
    pushBot(
      {
        type: "quick-replies",
        text: "Would you like to book a free demo class or ask something else?",
        options: ["Book Demo Class", "Timetable", "Contact Us", "Back to Menu"],
      },
      1200,
    );
  }, [pushUser, pushBot]);

  const handleTimetable = useCallback(() => {
    pushUser("Timetable");
    pushBot({ type: "timetable" });
    pushBot(
      {
        type: "quick-replies",
        text: "Any other questions?",
        options: [
          "Fees & Courses",
          "Book Demo Class",
          "Contact Us",
          "Back to Menu",
        ],
      },
      1200,
    );
  }, [pushUser, pushBot]);

  const startDemoFlow = useCallback(() => {
    pushUser("Demo Class");
    setLeadStep("name");
    setLeadDraft({
      name: "",
      classInterest: null,
      phone: "",
      preferredTime: "",
    });
    pushBot({
      type: "text",
      text: "Great! Let's book your free demo class. 🎓\n\nFirst, what's your name?",
    });
  }, [pushUser, pushBot]);

  const handleContactUs = useCallback(() => {
    pushUser("Contact Us");
    pushBot({ type: "contact" });
    pushBot(
      {
        type: "quick-replies",
        text: "Anything else I can help with?",
        options: [
          "Fees & Courses",
          "Timetable",
          "Book Demo Class",
          "Back to Menu",
        ],
      },
      1200,
    );
  }, [pushUser, pushBot]);

  const handleOther = useCallback(() => {
    pushUser("Other");
    pushBot({
      type: "quick-replies",
      text: "Sure! Here are some topics I can help with. Please select one or type your question below.",
      options: ["Fees & Courses", "Timetable", "Demo Class", "Contact Us"],
    });
  }, [pushUser, pushBot]);

  const handleBackToMenu = useCallback(() => {
    pushUser("Back to Menu");
    pushBot({
      type: "quick-replies",
      text: "Sure! What would you like to know?",
      options: [
        "Fees & Courses",
        "Timetable",
        "Demo Class",
        "Contact Us",
        "Other",
      ],
    });
  }, [pushUser, pushBot]);

  // ─── Lead flow steps ─────────────────────────────────────────────────────────

  const handleLeadInput = useCallback(
    async (userInput: string) => {
      if (leadStep === "name") {
        const name = userInput.trim();
        setLeadDraft((d) => ({ ...d, name }));
        setLeadStep("class");
        pushBot({
          type: "quick-replies",
          text: `Nice to meet you, ${name}! 😊\n\nWhich class is the student in?`,
          options: CLASS_OPTIONS,
        });
      } else if (leadStep === "class") {
        const level = classLabelToLevel[userInput] ?? ClassLevel.class9to10;
        setLeadDraft((d) => ({ ...d, classInterest: level }));
        setLeadStep("phone");
        pushBot({
          type: "text",
          text: "What's your phone number so we can confirm the demo timing?",
        });
      } else if (leadStep === "phone") {
        setLeadDraft((d) => ({ ...d, phone: userInput }));
        setLeadStep("time");
        pushBot({
          type: "quick-replies",
          text: "What time works best for you?",
          options: TIME_OPTIONS,
        });
      } else if (leadStep === "time") {
        const final = { ...leadDraft, preferredTime: userInput };
        setLeadDraft(final);
        setLeadStep("done");
        pushBot({
          type: "text",
          text: `✅ Thank you, ${final.name}!\n\nYour free demo class request has been received. We'll contact you at ${final.phone} to confirm your slot.\n\n📞 You can also reach us directly at +91 8200078923\n\nLearn Better, Score Higher! 🎓`,
        });
        pushBot(
          {
            type: "quick-replies",
            text: "Is there anything else I can help with?",
            options: ["Fees & Courses", "Timetable", "Contact Us"],
          },
          1400,
        );
        // Submit lead to backend
        if (final.classInterest) {
          submitLead.mutate({
            name: final.name,
            phone: final.phone,
            classInterest: final.classInterest,
            preferredTime: final.preferredTime,
          });
        }
      }
    },
    [leadStep, leadDraft, pushBot, submitLead],
  );

  // ─── Quick reply handler ─────────────────────────────────────────────────────

  const handleQuickReply = useCallback(
    (option: string) => {
      if (leadStep !== "idle" && leadStep !== "done") {
        handleLeadInput(option);
        return;
      }
      switch (option) {
        case "Fees & Courses":
          handleFeesAndCourses();
          break;
        case "Timetable":
          handleTimetable();
          break;
        case "Demo Class":
        case "Book Demo Class":
          startDemoFlow();
          break;
        case "Contact Us":
          handleContactUs();
          break;
        case "Other":
          handleOther();
          break;
        case "Back to Menu":
          handleBackToMenu();
          break;
        default: {
          pushUser(option);
          pushBot({
            type: "text",
            text: "I'm not sure about that yet. You can always WhatsApp us at +91 8200078923 for any queries!",
          });
          break;
        }
      }
    },
    [
      leadStep,
      handleLeadInput,
      handleFeesAndCourses,
      handleTimetable,
      startDemoFlow,
      handleContactUs,
      handleOther,
      handleBackToMenu,
      pushUser,
      pushBot,
    ],
  );

  // ─── Free text send ───────────────────────────────────────────────────────────

  const handleSend = useCallback(() => {
    const trimmed = input.trim();
    if (!trimmed) return;
    setInput("");
    pushUser(trimmed);

    if (leadStep !== "idle" && leadStep !== "done") {
      handleLeadInput(trimmed);
      return;
    }

    const lower = trimmed.toLowerCase();
    if (
      lower.includes("fee") ||
      lower.includes("cost") ||
      lower.includes("price") ||
      lower.includes("course") ||
      lower.includes("subject")
    ) {
      handleFeesAndCourses();
      return;
    }
    if (
      lower.includes("time") ||
      lower.includes("batch") ||
      lower.includes("schedule") ||
      lower.includes("timing") ||
      lower.includes("timetable")
    ) {
      handleTimetable();
      return;
    }
    if (
      lower.includes("demo") ||
      lower.includes("trial") ||
      lower.includes("free") ||
      lower.includes("book") ||
      lower.includes("join") ||
      lower.includes("admission")
    ) {
      startDemoFlow();
      return;
    }
    if (
      lower.includes("contact") ||
      lower.includes("phone") ||
      lower.includes("address") ||
      lower.includes("email") ||
      lower.includes("whatsapp")
    ) {
      handleContactUs();
      return;
    }

    pushBot({
      type: "quick-replies",
      text: "I can help you with the following. Please choose a topic:",
      options: ["Fees & Courses", "Timetable", "Demo Class", "Contact Us"],
    });
  }, [
    input,
    leadStep,
    handleLeadInput,
    handleFeesAndCourses,
    handleTimetable,
    startDemoFlow,
    handleContactUs,
    pushUser,
    pushBot,
  ]);

  // ─── Render helpers ───────────────────────────────────────────────────────────

  function renderContent(content: MessageContent, msgId: number) {
    switch (content.type) {
      case "text":
        return (
          <p className="whitespace-pre-line leading-relaxed text-sm font-body">
            {content.text}
          </p>
        );
      case "fee-table":
        return (
          <div className="text-sm font-body">
            <p className="font-semibold mb-2">📚 Course & Fee Structure</p>
            <div className="rounded-lg overflow-hidden border border-border/50">
              {[
                {
                  range: "Class 6–8",
                  subjects: "Maths, Science, English",
                  fee: "₹1,500–₂,000/mo",
                },
                {
                  range: "Class 9–10",
                  subjects: "Maths, Science, SST, English",
                  fee: "₹2,000–₂,500/mo",
                },
                {
                  range: "Class 11–12",
                  subjects: "Maths, Physics, Chemistry, Commerce",
                  fee: "₹2,500–₃,000/mo",
                },
              ].map((row, i) => (
                <div
                  key={row.range}
                  className={cn(
                    "px-3 py-2 flex flex-col gap-0.5",
                    i % 2 === 0 ? "bg-background/80" : "bg-muted/40",
                  )}
                >
                  <span className="font-semibold text-primary text-xs">
                    {row.range}
                  </span>
                  <span className="text-muted-foreground text-xs">
                    {row.subjects}
                  </span>
                  <span className="font-medium text-xs">{row.fee}</span>
                </div>
              ))}
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Small batches of 5–8 students · Fees vary by subject
            </p>
          </div>
        );
      case "timetable":
        return (
          <div className="text-sm font-body">
            <p className="font-semibold mb-2">🕐 Batch Timings</p>
            <div className="space-y-1.5">
              {[
                {
                  label: "Morning batch",
                  time: "7:00 AM – 9:00 AM",
                  days: "Mon–Sat",
                },
                {
                  label: "Afternoon batch",
                  time: "3:00 PM – 5:00 PM",
                  days: "Mon–Sat",
                },
                {
                  label: "Evening batch",
                  time: "6:00 PM – 8:00 PM",
                  days: "Mon–Sat",
                },
                {
                  label: "Weekend batch",
                  time: "9:00 AM – 12:00 PM",
                  days: "Sat & Sun",
                },
              ].map((b) => (
                <div
                  key={b.label}
                  className="flex justify-between items-center bg-background/70 rounded-lg px-3 py-2"
                >
                  <div>
                    <span className="font-medium text-xs block">{b.label}</span>
                    <span className="text-muted-foreground text-xs">
                      {b.days}
                    </span>
                  </div>
                  <span className="text-primary font-semibold text-xs">
                    {b.time}
                  </span>
                </div>
              ))}
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Flexible timing available on request
            </p>
          </div>
        );
      case "contact":
        return (
          <div className="text-sm font-body space-y-2">
            <p className="font-semibold">📬 Contact Us</p>
            <a
              href="tel:+918200078923"
              className="flex items-center gap-2 text-primary hover:underline text-xs"
            >
              <Phone className="w-3.5 h-3.5" /> +91 8200078923
            </a>
            <a
              href="tel:+919824489368"
              className="flex items-center gap-2 text-primary hover:underline text-xs"
            >
              <Phone className="w-3.5 h-3.5" /> +91 9824489368
            </a>
            <a
              href="mailto:yahyapersonaltutionclasses2000@gmail.com"
              className="flex items-center gap-2 text-primary hover:underline text-xs break-all"
            >
              <Mail className="w-3.5 h-3.5" />{" "}
              yahyapersonaltutionclasses2000@gmail.com
            </a>
            <a
              href="https://wa.me/918200078923?text=Hello%2C%20I%20want%20to%20join%20Yahya%20Tuition%20Classes"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-[#25D366] text-white rounded-lg px-3 py-2 text-xs font-semibold mt-1 hover:opacity-90 transition-opacity"
            >
              <ExternalLink className="w-3.5 h-3.5" /> Chat on WhatsApp
            </a>
            <p className="text-xs text-muted-foreground">
              📍 Vadodara, Gujarat
            </p>
          </div>
        );
      case "quick-replies":
        return (
          <div className="font-body">
            <p className="whitespace-pre-line leading-relaxed text-sm mb-2.5">
              {content.text}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {content.options.map((opt, i) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => handleQuickReply(opt)}
                  data-ocid={`chatbot.quick_reply.${msgId}.${i + 1}`}
                  className="text-xs px-2.5 py-1.5 rounded-full border border-primary/40 bg-primary/5 text-primary font-medium hover:bg-primary hover:text-primary-foreground transition-colors duration-200 cursor-pointer"
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        );
    }
  }

  // ─── JSX ──────────────────────────────────────────────────────────────────────

  return (
    <>
      {/* Toggle bubble */}
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        aria-label={isOpen ? "Close chat" : "Open Yahya AI chat"}
        data-ocid="chatbot.toggle_button"
        className={cn(
          "fixed bottom-24 right-6 z-50 flex items-center gap-2 px-3.5 h-12 rounded-full shadow-elevated transition-all duration-300 hover:scale-105 active:scale-95",
          isOpen
            ? "bg-card text-foreground border border-border"
            : "bg-primary text-primary-foreground",
        )}
      >
        {isOpen ? (
          <X className="w-4 h-4" />
        ) : (
          <>
            <MessageCircle className="w-4 h-4" />
            <span className="text-xs font-semibold font-display leading-none pr-0.5">
              Yahya AI
            </span>
          </>
        )}
        {/* Unread badge */}
        {!isOpen && hasUnread && (
          <span
            data-ocid="chatbot.unread_badge"
            className="absolute -top-1 -right-1 w-4 h-4 bg-destructive text-destructive-foreground rounded-full text-[10px] font-bold flex items-center justify-center animate-pulse"
          >
            1
          </span>
        )}
      </button>

      {/* Chat window */}
      {isOpen && (
        <div
          data-ocid="chatbot.dialog"
          className={cn(
            "fixed z-50 bg-card border border-border shadow-elevated flex flex-col overflow-hidden",
            // Full screen on tiny screens, floating on larger
            "inset-0 sm:inset-auto sm:bottom-40 sm:right-4 sm:w-96 sm:rounded-2xl sm:max-h-[520px]",
            "max-h-screen rounded-none sm:rounded-2xl",
          )}
        >
          {/* Header */}
          <div className="bg-primary text-primary-foreground px-4 py-3 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-primary-foreground/20 flex items-center justify-center ring-2 ring-primary-foreground/30">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <p className="font-display font-bold text-sm leading-none">
                  Yahya AI Assistant
                </p>
                <span className="flex items-center gap-1 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-300 animate-pulse" />
                  <p className="font-body text-xs opacity-80">
                    Online · replies instantly
                  </p>
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              aria-label="Close chatbot"
              data-ocid="chatbot.close_button"
              className="p-1.5 rounded-lg hover:bg-primary-foreground/15 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages area */}
          <div className="flex-1 overflow-y-auto px-3 py-3 flex flex-col gap-3 bg-muted/20">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={cn(
                  "max-w-[88%] rounded-2xl px-3.5 py-2.5",
                  msg.role === "bot"
                    ? "bg-card text-foreground self-start rounded-tl-sm shadow-sm border border-border/50"
                    : "bg-primary text-primary-foreground self-end rounded-tr-sm",
                )}
              >
                {renderContent(msg.content, msg.id)}
              </div>
            ))}

            {/* Typing indicator */}
            {isTyping && (
              <div className="max-w-[88%] self-start">
                <div className="bg-card border border-border/50 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm flex gap-1 items-center">
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      className="w-2 h-2 rounded-full bg-muted-foreground/50 animate-bounce"
                      style={{ animationDelay: `${i * 150}ms` }}
                    />
                  ))}
                </div>
              </div>
            )}
            <div ref={endRef} />
          </div>

          {/* Input area */}
          <div className="px-3 py-2.5 bg-card border-t border-border flex gap-2 flex-shrink-0">
            <Input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder={
                leadStep === "name"
                  ? "Enter your name…"
                  : leadStep === "phone"
                    ? "Enter your phone number…"
                    : "Type a message…"
              }
              data-ocid="chatbot.input"
              className="text-sm font-body flex-1 bg-muted/30"
              autoComplete="off"
            />
            <Button
              size="icon"
              onClick={handleSend}
              disabled={!input.trim()}
              data-ocid="chatbot.send_button"
              className="h-9 w-9 bg-primary text-primary-foreground flex-shrink-0"
              aria-label="Send message"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
