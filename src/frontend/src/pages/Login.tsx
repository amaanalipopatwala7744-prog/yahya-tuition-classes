import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useIsAdmin } from "@/hooks/useQueries";
import { useInternetIdentity } from "@caffeineai/core-infrastructure";
import { useNavigate } from "@tanstack/react-router";
import {
  AlertCircle,
  ArrowLeft,
  BookOpen,
  GraduationCap,
  Loader2,
  LogIn,
  ShieldCheck,
  Users,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";

type LoginMode = "student" | "admin";

function LogoBadge() {
  return (
    <div className="flex flex-col items-center gap-3 mb-6">
      <div className="relative flex items-center justify-center w-16 h-16 rounded-2xl bg-primary shadow-elevated">
        <GraduationCap className="w-8 h-8 text-primary-foreground" />
        <BookOpen className="w-4 h-4 text-primary-foreground absolute -bottom-1 -right-1 opacity-80" />
      </div>
      <div className="text-center">
        <div className="font-display font-bold text-xl text-primary tracking-tight">
          YAHYA
        </div>
        <div className="font-body text-sm text-muted-foreground tracking-wide">
          Personal Tuition Classes
        </div>
        <div className="font-body text-xs text-accent font-medium mt-0.5">
          Learn Better, Score Higher
        </div>
      </div>
    </div>
  );
}

function RoleChecker({
  mode,
  onError,
}: { mode: LoginMode; onError: (msg: string) => void }) {
  const { data: isAdmin, isLoading, isError } = useIsAdmin();
  const navigate = useNavigate();
  const [handled, setHandled] = useState(false);

  useEffect(() => {
    if (isLoading || handled) return;

    if (isError) {
      if (mode === "student") {
        navigate({ to: "/student" });
      } else {
        onError("Unable to verify admin role. Please try again.");
      }
      setHandled(true);
      return;
    }

    if (isAdmin === undefined) return;

    if (mode === "admin") {
      if (isAdmin) {
        navigate({ to: "/admin" });
      } else {
        onError(
          "Access denied. Your account does not have admin privileges. Please contact the administrator.",
        );
      }
    } else {
      // Students go to student portal; admins also allowed
      navigate({ to: "/student" });
    }
    setHandled(true);
  }, [isAdmin, isLoading, isError, handled, mode, navigate, onError]);

  if (isLoading) {
    return (
      <div
        className="flex flex-col items-center gap-3 py-4"
        data-ocid="login.loading_state"
      >
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
        <p className="font-body text-sm text-muted-foreground">
          {mode === "admin"
            ? "Verifying admin access…"
            : "Loading your portal…"}
        </p>
      </div>
    );
  }

  return null;
}

function LoginTab({ mode }: { mode: LoginMode }) {
  const { login, loginStatus, identity } = useInternetIdentity();
  const [error, setError] = useState<string | null>(null);
  const isLoggedIn = !!identity;
  const isLoggingIn = loginStatus === "logging-in";

  const handleLogin = () => {
    setError(null);
    login();
  };

  const isAdmin = mode === "admin";

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="text-center space-y-1.5">
        <div
          className={`w-12 h-12 rounded-xl mx-auto flex items-center justify-center shadow-subtle ${isAdmin ? "bg-accent/15" : "bg-primary/10"}`}
        >
          {isAdmin ? (
            <ShieldCheck className="w-6 h-6 text-accent" />
          ) : (
            <Users className="w-6 h-6 text-primary" />
          )}
        </div>
        <h2 className="font-display font-bold text-lg text-foreground">
          {isAdmin ? "Admin Login" : "Student Login"}
        </h2>
        <p className="font-body text-sm text-muted-foreground">
          {isAdmin
            ? "Manage students, attendance, assignments and test results."
            : "View your attendance, assignments, test scores and results."}
        </p>
      </div>

      {/* Error alert */}
      {error && (
        <Alert variant="destructive" data-ocid="login.error_state">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="font-body text-sm">
            {error}
          </AlertDescription>
        </Alert>
      )}

      {/* Role checker after login */}
      {isLoggedIn && !error && <RoleChecker mode={mode} onError={setError} />}

      {/* Login button */}
      {!isLoggedIn && (
        <Button
          onClick={handleLogin}
          disabled={isLoggingIn}
          className={`w-full font-body font-semibold h-11 ${
            isAdmin
              ? "bg-accent text-accent-foreground hover:bg-accent/90"
              : "bg-primary text-primary-foreground hover:bg-primary/90"
          }`}
          data-ocid={
            isAdmin ? "login.admin_login_button" : "login.student_login_button"
          }
        >
          {isLoggingIn ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Connecting…
            </>
          ) : (
            <>
              <LogIn className="w-4 h-4 mr-2" />
              Sign in with Internet Identity
            </>
          )}
        </Button>
      )}

      {/* Info box */}
      <div className="rounded-lg bg-muted/60 border border-border px-4 py-3 space-y-1">
        <p className="font-body text-xs font-semibold text-foreground/80">
          {isAdmin ? "Admin Access" : "Secure Login"}
        </p>
        <p className="font-body text-xs text-muted-foreground leading-relaxed">
          {isAdmin
            ? "Admin accounts are provisioned by the system. Contact the administrator if you need access."
            : "Use Internet Identity for a secure, passwordless login. Your identity is privacy-preserving."}
        </p>
      </div>
    </div>
  );
}

export function LoginPage() {
  const [activeTab, setActiveTab] = useState<LoginMode>("student");

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12">
      {/* Background decoration */}
      <div
        className="absolute inset-0 overflow-hidden pointer-events-none"
        aria-hidden
      >
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-accent/5 blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
        className="w-full max-w-md relative z-10"
      >
        {/* Back to home */}
        <a
          href="/"
          className="inline-flex items-center gap-1.5 font-body text-sm text-muted-foreground hover:text-primary transition-smooth mb-6 group"
          data-ocid="login.back_to_home_link"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-smooth" />
          Back to Homepage
        </a>

        <Card className="shadow-elevated border-border" data-ocid="login.card">
          <CardContent className="pt-8 pb-6 px-6 sm:px-8">
            {/* Logo */}
            <LogoBadge />

            {/* Tagline */}
            <p className="text-center font-body text-sm text-muted-foreground mb-6 leading-relaxed">
              Welcome back! Choose your login type below to access your portal.
            </p>

            {/* Tabs */}
            <Tabs
              value={activeTab}
              onValueChange={(v) => setActiveTab(v as LoginMode)}
              data-ocid="login.tabs"
            >
              <TabsList
                className="grid w-full grid-cols-2 mb-6"
                data-ocid="login.tab_list"
              >
                <TabsTrigger
                  value="student"
                  data-ocid="login.student_tab"
                  className="font-body font-medium text-sm"
                >
                  <Users className="w-3.5 h-3.5 mr-1.5" />
                  Student
                </TabsTrigger>
                <TabsTrigger
                  value="admin"
                  data-ocid="login.admin_tab"
                  className="font-body font-medium text-sm"
                >
                  <ShieldCheck className="w-3.5 h-3.5 mr-1.5" />
                  Admin
                </TabsTrigger>
              </TabsList>

              <TabsContent
                value="student"
                data-ocid="login.student_tab_content"
              >
                <LoginTab mode="student" />
              </TabsContent>

              <TabsContent value="admin" data-ocid="login.admin_tab_content">
                <LoginTab mode="admin" />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Footer note */}
        <p className="text-center font-body text-xs text-muted-foreground mt-4">
          Need help?{" "}
          <a
            href="https://wa.me/918200078923"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
            data-ocid="login.whatsapp_help_link"
          >
            Chat on WhatsApp
          </a>
        </p>
      </motion.div>
    </div>
  );
}
