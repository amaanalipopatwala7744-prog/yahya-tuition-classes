import { ExternalBlob } from "@/backend";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useListAssignments,
  useListTests,
  useMyAttendance,
  useMyProfile,
  useMySubmissions,
  useMyTestResults,
  useSubmitAssignment,
} from "@/hooks/useQueries";
import type {
  Assignment,
  AssignmentSubmission,
  AttendanceRecord,
  ClassTest,
  TestResult,
} from "@/types";
import { AttendanceStatus, SubmissionStatus } from "@/types";
import { useInternetIdentity } from "@caffeineai/core-infrastructure";
import {
  AlertCircle,
  Award,
  BarChart3,
  BookOpen,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Clock,
  FileText,
  GraduationCap,
  LogIn,
  LogOut,
  TrendingUp,
  Upload,
  XCircle,
} from "lucide-react";
import { motion } from "motion/react";
import { useRef, useState } from "react";
import { toast } from "sonner";

// ── helpers ──────────────────────────────────────────────────────────────────

function classLevelLabel(cl: string) {
  switch (cl) {
    case "class6to8":
      return "Class 6–8";
    case "class9to10":
      return "Class 9–10";
    case "class11to12":
      return "Class 11–12";
    default:
      return cl;
  }
}

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

// ── LoginPrompt ───────────────────────────────────────────────────────────────

function LoginPrompt() {
  const { login, loginStatus } = useInternetIdentity();
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-sm w-full"
      >
        <div className="w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center mx-auto mb-5 shadow-card">
          <GraduationCap className="w-10 h-10 text-primary" />
        </div>
        <h2 className="font-display font-bold text-2xl text-foreground mb-2">
          Student Portal
        </h2>
        <p className="font-body text-sm text-muted-foreground mb-2 leading-relaxed">
          Sign in to access your personal dashboard — attendance records,
          assignments, and test results.
        </p>
        <p className="font-body text-xs text-muted-foreground mb-6">
          Yahya Personal Tuition Classes · Vadodara
        </p>
        <Button
          onClick={() => login()}
          disabled={loginStatus === "logging-in"}
          data-ocid="student.login_button"
          className="w-full font-body font-semibold"
          size="lg"
        >
          <LogIn className="w-4 h-4 mr-2" />
          {loginStatus === "logging-in"
            ? "Signing in…"
            : "Sign In with Internet Identity"}
        </Button>
      </motion.div>
    </div>
  );
}

// ── SummaryWidgets ────────────────────────────────────────────────────────────

function SummaryWidgets({
  attendance,
  assignments,
  submissions,
  testResults,
  tests,
}: {
  attendance: AttendanceRecord[];
  assignments: Assignment[];
  submissions: AssignmentSubmission[];
  testResults: TestResult[];
  tests: ClassTest[];
}) {
  const now = BigInt(Date.now()) * 1_000_000n;

  // Attendance: current month %
  const thisMonth = new Date().getMonth();
  const thisYear = new Date().getFullYear();
  const monthRecords = attendance.filter((r) => {
    const d = new Date(r.date);
    return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
  });
  const monthPct =
    monthRecords.length > 0
      ? Math.round(
          (monthRecords.filter((r) => r.status === AttendanceStatus.present)
            .length /
            monthRecords.length) *
            100,
        )
      : null;

  // Pending assignments: active deadline & no submission
  const submittedIds = new Set(
    submissions.map((s) => s.assignmentId.toString()),
  );
  const pending = assignments.filter(
    (a) => a.deadline >= now && !submittedIds.has(a.id.toString()),
  ).length;

  // Recent test average
  const testMap = new Map(tests.map((t) => [t.id.toString(), t]));
  const recent = testResults.slice(-5);
  const avgPct =
    recent.length > 0
      ? Math.round(
          recent.reduce((sum, r) => {
            const t = testMap.get(r.testId.toString());
            return (
              sum +
              (t ? (Number(r.marksObtained) / Number(t.totalMarks)) * 100 : 0)
            );
          }, 0) / recent.length,
        )
      : null;

  const widgets = [
    {
      icon: CheckCircle,
      label: "This Month Attendance",
      value: monthPct !== null ? `${monthPct}%` : "—",
      color:
        monthPct !== null && monthPct >= 75
          ? "text-primary"
          : "text-destructive",
      ocid: "student.attendance_widget",
    },
    {
      icon: ClipboardList,
      label: "Pending Assignments",
      value: pending.toString(),
      color: pending > 0 ? "text-accent" : "text-primary",
      ocid: "student.assignments_widget",
    },
    {
      icon: BarChart3,
      label: "Recent Test Avg",
      value: avgPct !== null ? `${avgPct}%` : "—",
      color: "text-primary",
      ocid: "student.tests_widget",
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-3 mb-6">
      {widgets.map((w, i) => (
        <motion.div
          key={w.label}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.08 }}
          data-ocid={w.ocid}
        >
          <Card className="shadow-card hover:shadow-elevated transition-smooth">
            <CardContent className="p-4 text-center">
              <w.icon className={`w-5 h-5 mx-auto mb-1.5 ${w.color}`} />
              <p className={`font-display font-bold text-xl ${w.color}`}>
                {w.value}
              </p>
              <p className="font-body text-xs text-muted-foreground mt-0.5 leading-tight">
                {w.label}
              </p>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}

// ── AttendanceSection ─────────────────────────────────────────────────────────

function AttendanceSection({ records }: { records: AttendanceRecord[] }) {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());

  const filtered = records.filter((r) => {
    const d = new Date(r.date);
    return d.getMonth() === month && d.getFullYear() === year;
  });

  const present = filtered.filter(
    (r) => r.status === AttendanceStatus.present,
  ).length;
  const total = filtered.length;
  const pct = total > 0 ? Math.round((present / total) * 100) : null;

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay();
  const dateStatusMap = new Map(records.map((r) => [r.date, r.status]));

  const prevMonth = () => {
    if (month === 0) {
      setMonth(11);
      setYear((y) => y - 1);
    } else setMonth((m) => m - 1);
  };
  const nextMonth = () => {
    const canGoNext =
      year < today.getFullYear() ||
      (year === today.getFullYear() && month < today.getMonth());
    if (!canGoNext) return;
    if (month === 11) {
      setMonth(0);
      setYear((y) => y + 1);
    } else setMonth((m) => m + 1);
  };

  return (
    <div className="space-y-5">
      {/* Monthly stats */}
      <div className="flex items-center justify-between p-4 rounded-xl bg-primary/5 border border-primary/10">
        <div>
          <p className="font-body text-xs text-muted-foreground mb-0.5">
            Monthly Attendance
          </p>
          <p className="font-display font-bold text-3xl text-primary">
            {pct !== null ? `${pct}%` : "—"}
          </p>
        </div>
        <div className="flex gap-4 text-sm font-body">
          <div className="text-center">
            <p className="font-semibold text-foreground">{present}</p>
            <p className="text-xs text-muted-foreground">Present</p>
          </div>
          <div className="text-center">
            <p className="font-semibold text-foreground">{total - present}</p>
            <p className="text-xs text-muted-foreground">Absent</p>
          </div>
          <div className="text-center">
            <p className="font-semibold text-foreground">{total}</p>
            <p className="text-xs text-muted-foreground">Total</p>
          </div>
        </div>
        {pct !== null && (
          <Badge
            className={
              pct >= 75
                ? "bg-primary/10 text-primary border-primary/20"
                : "bg-destructive/10 text-destructive border-destructive/20"
            }
            data-ocid="attendance.monthly_badge"
          >
            {pct >= 75 ? "Good" : "Low"}
          </Badge>
        )}
      </div>

      {/* Month picker */}
      <div
        className="flex items-center justify-between"
        data-ocid="attendance.month_filter"
      >
        <Button
          variant="ghost"
          size="icon"
          onClick={prevMonth}
          data-ocid="attendance.prev_month"
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>
        <p className="font-display font-semibold text-foreground">
          {MONTHS[month]} {year}
        </p>
        <Button
          variant="ghost"
          size="icon"
          onClick={nextMonth}
          disabled={year === today.getFullYear() && month === today.getMonth()}
          data-ocid="attendance.next_month"
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      {/* Calendar grid */}
      <div className="rounded-xl border border-border overflow-hidden">
        <div className="grid grid-cols-7 bg-muted/40">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
            <div
              key={d}
              className="p-2 text-center text-xs font-display font-semibold text-muted-foreground"
            >
              {d}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 bg-card">
          {["s0", "s1", "s2", "s3", "s4", "s5", "s6"]
            .slice(0, firstDayOfWeek)
            .map((k) => (
              <div
                key={`pad-${year}-${month}-${k}`}
                className="p-2 min-h-[44px]"
              />
            ))}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
            const status = dateStatusMap.get(dateStr);
            const isToday = dateStr === today.toISOString().split("T")[0];
            return (
              <div
                key={day}
                className={`p-1.5 min-h-[44px] flex flex-col items-center justify-center border-t border-border/40 ${
                  status === AttendanceStatus.present
                    ? "bg-primary/8"
                    : status === AttendanceStatus.absent
                      ? "bg-destructive/8"
                      : ""
                }`}
              >
                <span
                  className={`font-body text-xs font-medium ${
                    isToday
                      ? "bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center"
                      : "text-foreground"
                  }`}
                >
                  {day}
                </span>
                {status === AttendanceStatus.present && (
                  <CheckCircle className="w-3 h-3 text-primary mt-0.5" />
                )}
                {status === AttendanceStatus.absent && (
                  <XCircle className="w-3 h-3 text-destructive mt-0.5" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {filtered.length === 0 && (
        <div
          className="text-center py-6 text-muted-foreground font-body text-sm"
          data-ocid="attendance.empty_state"
        >
          No attendance records for {MONTHS[month]} {year}.
        </div>
      )}
    </div>
  );
}

// ── AssignmentsSection ────────────────────────────────────────────────────────

function AssignmentsSection({
  assignments,
  submissions,
}: {
  assignments: Assignment[];
  submissions: AssignmentSubmission[];
}) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const now = BigInt(Date.now()) * 1_000_000n;
  const submitMutation = useSubmitAssignment();

  const submissionMap = new Map(
    submissions.map((s) => [s.assignmentId.toString(), s]),
  );

  const handleFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
    assignmentId: bigint,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const bytes = new Uint8Array(await file.arrayBuffer());
    const blob = ExternalBlob.fromBytes(bytes);
    submitMutation.mutate(
      { assignmentId, fileBlob: blob },
      {
        onSuccess: () => {
          toast.success("Assignment submitted successfully!");
          setSelectedId(null);
        },
        onError: () => toast.error("Submission failed. Please try again."),
      },
    );
  };

  const statusBadge = (
    submission: AssignmentSubmission | undefined,
    deadline: bigint,
  ) => {
    if (!submission) {
      return deadline < now ? (
        <Badge variant="destructive" className="text-xs">
          Overdue
        </Badge>
      ) : (
        <Badge
          variant="outline"
          className="text-xs text-accent border-accent/30 bg-accent/5"
        >
          Pending
        </Badge>
      );
    }
    switch (submission.status) {
      case SubmissionStatus.submitted:
        return (
          <Badge className="text-xs bg-primary/10 text-primary border-primary/20">
            Submitted
          </Badge>
        );
      case SubmissionStatus.late:
        return (
          <Badge variant="destructive" className="text-xs opacity-80">
            Late
          </Badge>
        );
      case SubmissionStatus.reviewed:
        return (
          <Badge className="text-xs bg-accent/10 text-accent border-accent/20">
            Reviewed
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="text-xs">
            Submitted
          </Badge>
        );
    }
  };

  if (assignments.length === 0) {
    return (
      <div className="text-center py-12" data-ocid="assignments.empty_state">
        <ClipboardList className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
        <p className="font-body text-sm text-muted-foreground">
          No assignments yet.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {assignments.map((a, i) => {
        const sub = submissionMap.get(a.id.toString());
        const canSubmit = !sub && a.deadline >= now;
        const isSelected = selectedId === a.id.toString();
        return (
          <motion.div
            key={a.id.toString()}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card
              className={`shadow-card transition-smooth cursor-pointer ${isSelected ? "ring-2 ring-primary/30" : "hover:shadow-elevated"}`}
              onClick={() => setSelectedId(isSelected ? null : a.id.toString())}
              data-ocid={`assignments.item.${i + 1}`}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-display font-semibold text-sm text-foreground">
                        {a.title}
                      </p>
                      <Badge
                        variant="outline"
                        className="text-xs font-body shrink-0"
                      >
                        {a.subject}
                      </Badge>
                    </div>
                    <p className="font-body text-xs text-muted-foreground mt-1 line-clamp-2">
                      {a.description}
                    </p>
                    <div className="flex items-center gap-1 mt-2 text-xs font-body text-muted-foreground">
                      <Clock className="w-3 h-3 shrink-0" />
                      <span>
                        Due{" "}
                        {new Date(
                          Number(a.deadline / 1_000_000n),
                        ).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                  </div>
                  <div className="shrink-0">{statusBadge(sub, a.deadline)}</div>
                </div>

                {/* Expanded detail / upload */}
                {isSelected && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="mt-4 pt-4 border-t border-border space-y-3"
                  >
                    {sub && (
                      <div className="flex items-center gap-2 text-xs font-body text-muted-foreground">
                        <FileText className="w-3.5 h-3.5 text-primary" />
                        Submitted on{" "}
                        {new Date(
                          Number(sub.submittedAt / 1_000_000n),
                        ).toLocaleDateString("en-IN")}
                      </div>
                    )}
                    {canSubmit && (
                      <div>
                        <input
                          ref={fileInputRef}
                          type="file"
                          className="hidden"
                          onChange={(e) => handleFileChange(e, a.id)}
                          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                          data-ocid={`assignments.upload_input.${i + 1}`}
                        />
                        <Button
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            fileInputRef.current?.click();
                          }}
                          disabled={submitMutation.isPending}
                          className="w-full"
                          data-ocid={`assignments.upload_button.${i + 1}`}
                        >
                          <Upload className="w-3.5 h-3.5 mr-1.5" />
                          {submitMutation.isPending
                            ? "Uploading…"
                            : "Upload Submission"}
                        </Button>
                      </div>
                    )}
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}

// ── TestResultsSection ────────────────────────────────────────────────────────

function TestResultsSection({
  results,
  tests,
}: { results: TestResult[]; tests: ClassTest[] }) {
  const testMap = new Map(tests.map((t) => [t.id.toString(), t]));

  // Subject-wise averages
  const subjectData: Record<string, { total: number; count: number }> = {};
  for (const r of results) {
    const t = testMap.get(r.testId.toString());
    if (!t) continue;
    const pct = (Number(r.marksObtained) / Number(t.totalMarks)) * 100;
    if (!subjectData[t.subject])
      subjectData[t.subject] = { total: 0, count: 0 };
    subjectData[t.subject].total += pct;
    subjectData[t.subject].count += 1;
  }
  const subjectAverages = Object.entries(subjectData)
    .map(([subject, data]) => ({
      subject,
      avg: Math.round(data.total / data.count),
    }))
    .sort((a, b) => b.avg - a.avg);

  if (results.length === 0) {
    return (
      <div className="text-center py-12" data-ocid="results.empty_state">
        <Award className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
        <p className="font-body text-sm text-muted-foreground">
          No test results yet.
        </p>
      </div>
    );
  }

  const grade = (pct: number) => {
    if (pct >= 90) return { label: "A+", color: "text-primary" };
    if (pct >= 75) return { label: "A", color: "text-primary" };
    if (pct >= 60) return { label: "B", color: "text-accent" };
    if (pct >= 45) return { label: "C", color: "text-muted-foreground" };
    return { label: "D", color: "text-destructive" };
  };

  return (
    <div className="space-y-5">
      {/* Subject-wise performance summary */}
      {subjectAverages.length > 0 && (
        <Card className="shadow-card" data-ocid="results.subject_summary">
          <CardHeader className="pb-2 pt-4 px-4">
            <CardTitle className="font-display text-sm font-semibold text-foreground flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" /> Subject-wise
              Performance
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4 space-y-3">
            {subjectAverages.map((s) => {
              const g = grade(s.avg);
              return (
                <div key={s.subject} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-body text-xs font-medium text-foreground">
                      {s.subject}
                    </span>
                    <span
                      className={`font-display font-bold text-sm ${g.color}`}
                    >
                      {s.avg}% · {g.label}
                    </span>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${s.avg}%` }}
                      transition={{ duration: 0.8, delay: 0.2 }}
                      className="h-full bg-primary rounded-full"
                    />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* Individual test results */}
      <div className="space-y-3">
        {results.map((r, i) => {
          const test = testMap.get(r.testId.toString());
          const pct = test
            ? Math.round(
                (Number(r.marksObtained) / Number(test.totalMarks)) * 100,
              )
            : 0;
          const g = grade(pct);
          return (
            <motion.div
              key={r.id.toString()}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card
                className="shadow-card"
                data-ocid={`test_results.item.${i + 1}`}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="font-display font-semibold text-sm text-foreground truncate">
                        {test?.name ?? "Test"}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                        <Badge variant="outline" className="text-xs font-body">
                          {test?.subject}
                        </Badge>
                        {test?.testDate && (
                          <span className="font-body text-xs text-muted-foreground">
                            {new Date(
                              Number(test.testDate / 1_000_000n),
                            ).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                            })}
                          </span>
                        )}
                      </div>
                      {r.feedback && (
                        <p className="font-body text-xs text-muted-foreground mt-1 italic line-clamp-1">
                          {r.feedback}
                        </p>
                      )}
                    </div>
                    <div className="text-right shrink-0">
                      <p
                        className={`font-display font-bold text-2xl ${g.color}`}
                      >
                        {g.label}
                      </p>
                      <p className="font-body text-xs text-muted-foreground">
                        {r.marksObtained.toString()}/
                        {test?.totalMarks.toString()}
                      </p>
                      <p className="font-body text-xs font-semibold text-muted-foreground">
                        {pct}%
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export function StudentPortalPage() {
  const { identity, clear, isAuthenticated } = useInternetIdentity();
  const isLoggedIn = isAuthenticated && !!identity;
  const [tab, setTab] = useState("attendance");

  const { data: profile, isLoading: profileLoading } = useMyProfile();
  const { data: attendance = [], isLoading: attLoading } = useMyAttendance();
  const { data: assignments = [], isLoading: assignLoading } =
    useListAssignments();
  const { data: submissions = [] } = useMySubmissions();
  const { data: testResults = [], isLoading: resultsLoading } =
    useMyTestResults();
  const { data: tests = [] } = useListTests();

  if (!isLoggedIn) return <LoginPrompt />;

  const handleLogout = () => {
    clear();
    window.location.href = "/";
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Welcome card */}
        <Card
          className="mb-6 shadow-elevated bg-primary text-primary-foreground"
          data-ocid="student.welcome_card"
        >
          <CardContent className="p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                {profileLoading ? (
                  <Skeleton className="h-6 w-36 bg-primary-foreground/20 mb-2" />
                ) : (
                  <h1 className="font-display font-bold text-xl text-primary-foreground truncate">
                    Welcome, {profile?.name ?? "Student"} 👋
                  </h1>
                )}
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  {profile?.classLevel && (
                    <Badge className="bg-primary-foreground/20 text-primary-foreground border-primary-foreground/30 font-body text-xs">
                      {classLevelLabel(profile.classLevel)}
                    </Badge>
                  )}
                  {(profile?.subjects?.length ?? 0) > 0 && (
                    <span className="font-body text-xs text-primary-foreground/80">
                      {profile?.subjects?.join(" · ")}
                    </span>
                  )}
                </div>
                {profile?.phone && (
                  <p className="font-body text-xs text-primary-foreground/70 mt-1">
                    {profile.phone}
                  </p>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="shrink-0 text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/10"
                data-ocid="student.logout_button"
              >
                <LogOut className="w-4 h-4 mr-1" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Summary widgets */}
        <SummaryWidgets
          attendance={attendance as AttendanceRecord[]}
          assignments={assignments as Assignment[]}
          submissions={submissions as AssignmentSubmission[]}
          testResults={testResults as TestResult[]}
          tests={tests as ClassTest[]}
        />

        {/* Tabs */}
        <Tabs value={tab} onValueChange={setTab} data-ocid="student.tabs">
          <TabsList
            className="w-full mb-5 grid grid-cols-3"
            data-ocid="student.tab_list"
          >
            <TabsTrigger value="attendance" data-ocid="student.attendance_tab">
              <CheckCircle className="w-3.5 h-3.5 mr-1.5 shrink-0" />
              <span>Attendance</span>
            </TabsTrigger>
            <TabsTrigger
              value="assignments"
              data-ocid="student.assignments_tab"
            >
              <BookOpen className="w-3.5 h-3.5 mr-1.5 shrink-0" />
              <span>Assignments</span>
            </TabsTrigger>
            <TabsTrigger value="results" data-ocid="student.results_tab">
              <TrendingUp className="w-3.5 h-3.5 mr-1.5 shrink-0" />
              <span>Results</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="attendance" data-ocid="student.attendance_panel">
            {attLoading ? (
              <div className="space-y-3" data-ocid="attendance.loading_state">
                <Skeleton className="h-24 w-full rounded-xl" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-48 w-full rounded-xl" />
              </div>
            ) : (
              <AttendanceSection records={attendance as AttendanceRecord[]} />
            )}
          </TabsContent>

          <TabsContent
            value="assignments"
            data-ocid="student.assignments_panel"
          >
            {assignLoading ? (
              <div className="space-y-3" data-ocid="assignments.loading_state">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-24 w-full rounded-xl" />
                ))}
              </div>
            ) : (
              <AssignmentsSection
                assignments={assignments as Assignment[]}
                submissions={submissions as AssignmentSubmission[]}
              />
            )}
          </TabsContent>

          <TabsContent value="results" data-ocid="student.results_panel">
            {resultsLoading ? (
              <div className="space-y-3" data-ocid="results.loading_state">
                <Skeleton className="h-40 w-full rounded-xl" />
                {[1, 2].map((i) => (
                  <Skeleton key={i} className="h-20 w-full rounded-xl" />
                ))}
              </div>
            ) : (
              <TestResultsSection
                results={testResults as TestResult[]}
                tests={tests as ClassTest[]}
              />
            )}
          </TabsContent>
        </Tabs>

        {/* Low attendance warning */}
        {!attLoading &&
          attendance.length > 0 &&
          (() => {
            const present = attendance.filter(
              (r) => r.status === AttendanceStatus.present,
            ).length;
            const pct = Math.round((present / attendance.length) * 100);
            return pct < 75 ? (
              <div
                className="mt-4 flex items-start gap-3 p-4 rounded-xl bg-destructive/5 border border-destructive/20"
                data-ocid="student.attendance_warning"
              >
                <AlertCircle className="w-4 h-4 text-destructive mt-0.5 shrink-0" />
                <div>
                  <p className="font-body text-sm font-semibold text-destructive">
                    Attendance below 75%
                  </p>
                  <p className="font-body text-xs text-muted-foreground mt-0.5">
                    Your overall attendance is {pct}%. Please attend more
                    classes to maintain eligibility.
                  </p>
                </div>
              </div>
            ) : null;
          })()}
      </motion.div>
    </div>
  );
}
