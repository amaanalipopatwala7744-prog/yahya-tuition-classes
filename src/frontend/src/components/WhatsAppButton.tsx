import { MessageCircle } from "lucide-react";

const WHATSAPP_NUMBER = "918200078923";
const WHATSAPP_MESSAGE = "Hello, I want to join Yahya Tuition Classes";

export function WhatsAppButton() {
  const href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      data-ocid="whatsapp.floating_button"
      className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 rounded-full bg-[#25D366] shadow-elevated transition-smooth hover:scale-110 active:scale-95"
    >
      <MessageCircle className="w-7 h-7 text-white" />
      <span className="sr-only">Chat on WhatsApp</span>
    </a>
  );
}
