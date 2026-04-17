import { Toaster } from "@/components/ui/sonner";
import type { ReactNode } from "react";
import { ChatbotWidget } from "./ChatbotWidget";
import { Footer } from "./Footer";
import { Navbar } from "./Navbar";
import { WhatsAppButton } from "./WhatsAppButton";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
      <WhatsAppButton />
      <ChatbotWidget />
      <Toaster position="top-right" richColors />
    </div>
  );
}
