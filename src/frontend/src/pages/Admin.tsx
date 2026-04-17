import {
  AttendanceStatus,
  ClassLevel,
  ExternalBlob,
  FollowUpStatus,
  GalleryCategory,
} from "@/backend";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useActor } from "@/hooks/useBackendActor";
import type {
  Assignment,
  AssignmentSubmission,
  ChatbotLead,
  ClassTest,
  GalleryImage,
  Student,
  TestResult,
} from "@/types";
import type { ImageId, LeadId, TestId } from "@/types";
import { useInternetIdentity } from "@caffeineai/core-infrastructure";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  BarChart3,
  BookOpen,
  Calendar,
  CheckCircle,
  ChevronLeft,
  ClipboardList,
  Eye,
  Image,
  LogIn,
  MessageSquare,
  Plus,
  Trash2,
  Upload,
  UserCheck,
  Users,
  XCircle,
} from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function classLabel(c: ClassLevel) {
  if (c === ClassLevel.class6to8) return "Class 6–8";
  if (c === ClassLevel.class9to10) return "Class 9–10";
  return "Class 11–12";
}

function tsToDate(ts: bigint) {
  return new Date(Number(ts) / 1_000_000).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function FormField({
  id,
  label,
  type = "text",
  value,
  onChange,
  placeholder,
}: {
  id: string;
  label: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="block font-body text-xs font-semibold text-muted-foreground mb-1 uppercase tracking-wide"
      >
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-smooth"
      />
    </div>
  );
}

function ClassSelect({
  id,
  value,
  onChange,
}: { id: string; value: ClassLevel; onChange: (v: ClassLevel) => void }) {
  return (
    <div>
      <label
        htmlFor={id}
        className="block font-body text-xs font-semibold text-muted-foreground mb-1 uppercase tracking-wide"
      >
        Class
      </label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value as ClassLevel)}
        className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-smooth"
      >
        <option value={ClassLevel.class6to8}>Class 6–8</option>
        <option value={ClassLevel.class9to10}>Class 9–10</option>
        <option value={ClassLevel.class11to12}>Class 11–12</option>
      </select>
    </div>
  );
}

function SectionHeader({
  title,
  count,
  onAdd,
  addLabel,
  addOcid,
}: {
  title: string;
  count?: number;
  onAdd?: () => void;
  addLabel?: string;
  addOcid?: string;
}) {
  return (
    <div className="flex items-center justify-between mb-5">
      <div>
        <h3 className="font-display font-bold text-lg text-foreground">
          {title}
        </h3>
        {count !== undefined && (
          <p className="font-body text-xs text-muted-foreground mt-0.5">
            {count} total
          </p>
        )}
      </div>
      {onAdd && (
        <Button
          size="sm"
          onClick={onAdd}
          data-ocid={addOcid}
          className="font-body gap-1.5"
        >
          <Plus className="w-3.5 h-3.5" />
          {addLabel ?? "Add"}
        </Button>
      )}
    </div>
  );
}

function LoadingCards({ n = 3 }: { n?: number }) {
  return (
    <div className="space-y-2" data-ocid="admin.loading_state">
      {["a", "b", "c", "d", "e", "f"].slice(0, n).map((k) => (
        <Skeleton key={k} className="h-16 w-full rounded-xl" />
      ))}
    </div>
  );
}

function EmptyState({ message, ocid }: { message: string; ocid: string }) {
  return (
    <div
      className="text-center py-12 text-muted-foreground font-body text-sm"
      data-ocid={ocid}
    >
      <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
        <ClipboardList className="w-5 h-5 text-muted-foreground" />
      </div>
      {message}
    </div>
  );
}

// ─── Login / Access Guards ────────────────────────────────────────────────────

function LoginPrompt() {
  const { login, loginStatus } = useInternetIdentity();
  return (
    <div className="min-h-[70vh] flex items-center justify-center bg-muted/20">
      <Card className="max-w-sm w-full mx-4 shadow-elevated">
        <CardContent className="p-8 text-center">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <UserCheck className="w-8 h-8 text-primary" />
          </div>
          <h2 className="font-display font-bold text-xl text-foreground mb-2">
            Admin Panel
          </h2>
          <p className="font-body text-sm text-muted-foreground mb-6">
            Sign in with your admin Internet Identity to access the management
            dashboard.
          </p>
          <Button
            onClick={() => login()}
            disabled={loginStatus === "logging-in"}
            data-ocid="admin.login_button"
            className="w-full font-body font-semibold"
          >
            <LogIn className="w-4 h-4 mr-2" />
            {loginStatus === "logging-in" ? "Signing in…" : "Admin Sign In"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Students Tab ─────────────────────────────────────────────────────────────

function StudentsTab() {
  const { actor, isFetching } = useActor();
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [filterClass, setFilterClass] = useState<ClassLevel | "">("");
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    classLevel: ClassLevel.class9to10,
    subjects: "Maths, Science",
  });

  const { data: students = [], isLoading } = useQuery({
    queryKey: ["students"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listStudents();
    },
    enabled: !!actor && !isFetching,
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("No actor");
      const { Principal } = await import("@icp-sdk/core/principal");
      return actor.createStudent(
        Principal.anonymous(),
        form.name,
        form.classLevel,
        form.subjects.split(",").map((s) => s.trim()),
        form.phone,
        form.email,
      );
    },
    onSuccess: () => {
      toast.success("Student added successfully!");
      qc.invalidateQueries({ queryKey: ["students"] });
      qc.invalidateQueries({ queryKey: ["active-students"] });
      setShowForm(false);
      setForm({
        name: "",
        phone: "",
        email: "",
        classLevel: ClassLevel.class9to10,
        subjects: "Maths, Science",
      });
    },
    onError: () => toast.error("Failed to add student"),
  });

  const deactivateMutation = useMutation({
    mutationFn: (id: bigint) => {
      if (!actor) throw new Error("No actor");
      return actor.deactivateStudent(id);
    },
    onSuccess: () => {
      toast.success("Student deactivated");
      qc.invalidateQueries({ queryKey: ["students"] });
      qc.invalidateQueries({ queryKey: ["active-students"] });
    },
    onError: () => toast.error("Failed to deactivate"),
  });

  const filtered = (students as Student[]).filter((s) => {
    const q = search.toLowerCase();
    return (
      s.name.toLowerCase().includes(q) &&
      (!filterClass || s.classLevel === filterClass)
    );
  });

  return (
    <div className="space-y-4">
      <SectionHeader
        title="Students"
        count={(students as Student[]).length}
        onAdd={() => setShowForm(!showForm)}
        addLabel="Add Student"
        addOcid="admin.add_student_button"
      />

      <div className="flex gap-2 flex-wrap">
        <input
          placeholder="Search by name…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          data-ocid="admin.student_search_input"
          className="flex-1 min-w-[160px] px-3 py-2 rounded-lg border border-input bg-background text-foreground font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-smooth"
        />
        <select
          value={filterClass}
          onChange={(e) => setFilterClass(e.target.value as ClassLevel | "")}
          data-ocid="admin.student_filter_select"
          className="px-3 py-2 rounded-lg border border-input bg-background text-foreground font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-smooth"
        >
          <option value="">All Classes</option>
          <option value={ClassLevel.class6to8}>Class 6–8</option>
          <option value={ClassLevel.class9to10}>Class 9–10</option>
          <option value={ClassLevel.class11to12}>Class 11–12</option>
        </select>
      </div>

      {showForm && (
        <Card
          className="border-primary/20 shadow-card"
          data-ocid="admin.add_student_dialog"
        >
          <CardHeader className="pb-2 pt-4 px-4">
            <CardTitle className="font-display text-base">
              New Student
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <FormField
                id="s-name"
                label="Full Name"
                value={form.name}
                onChange={(v) => setForm({ ...form, name: v })}
                placeholder="Arjun Shah"
              />
              <FormField
                id="s-phone"
                label="Phone"
                type="tel"
                value={form.phone}
                onChange={(v) => setForm({ ...form, phone: v })}
                placeholder="+91 98000 00000"
              />
              <FormField
                id="s-email"
                label="Email"
                type="email"
                value={form.email}
                onChange={(v) => setForm({ ...form, email: v })}
                placeholder="student@gmail.com"
              />
              <FormField
                id="s-subjects"
                label="Subjects (comma-separated)"
                value={form.subjects}
                onChange={(v) => setForm({ ...form, subjects: v })}
                placeholder="Maths, Science"
              />
            </div>
            <ClassSelect
              id="s-class"
              value={form.classLevel}
              onChange={(v) => setForm({ ...form, classLevel: v })}
            />
            <div className="flex gap-2 pt-1">
              <Button
                size="sm"
                onClick={() => createMutation.mutate()}
                disabled={createMutation.isPending || !form.name}
                data-ocid="admin.save_student_button"
                className="font-body"
              >
                {createMutation.isPending ? "Saving…" : "Save Student"}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowForm(false)}
                data-ocid="admin.cancel_student_button"
                className="font-body"
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <LoadingCards />
      ) : filtered.length === 0 ? (
        <EmptyState
          message="No students found. Add your first student above."
          ocid="students.empty_state"
        />
      ) : (
        <div className="space-y-2">
          {filtered.map((s, i) => (
            <Card
              key={s.id.toString()}
              data-ocid={`students.item.${i + 1}`}
              className="shadow-card"
            >
              <CardContent className="p-4 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-display font-semibold text-sm text-foreground truncate">
                    {s.name}
                  </p>
                  <p className="font-body text-xs text-muted-foreground">
                    {s.phone} · {s.email}
                  </p>
                  <p className="font-body text-xs text-muted-foreground mt-0.5">
                    {s.subjects.join(", ")}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Badge variant="secondary" className="font-body text-xs">
                    {classLabel(s.classLevel)}
                  </Badge>
                  {s.isActive ? (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => deactivateMutation.mutate(s.id)}
                      data-ocid={`students.deactivate_button.${i + 1}`}
                      className="font-body text-xs h-7 text-destructive border-destructive/30 hover:bg-destructive/5"
                    >
                      Deactivate
                    </Button>
                  ) : (
                    <Badge
                      variant="outline"
                      className="text-xs text-muted-foreground font-body"
                    >
                      Inactive
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Attendance Tab ───────────────────────────────────────────────────────────

function AttendanceTab() {
  const { actor, isFetching } = useActor();
  const qc = useQueryClient();
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [marked, setMarked] = useState<Record<string, AttendanceStatus>>({});

  const { data: students = [], isLoading } = useQuery({
    queryKey: ["active-students"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listActiveStudents();
    },
    enabled: !!actor && !isFetching,
  });

  const markMutation = useMutation({
    mutationFn: ({
      studentId,
      status,
    }: { studentId: bigint; status: AttendanceStatus }) => {
      if (!actor) throw new Error("No actor");
      return actor.markAttendance(studentId, selectedDate, status);
    },
    onSuccess: (_data, vars) => {
      setMarked((prev) => ({
        ...prev,
        [vars.studentId.toString()]: vars.status,
      }));
      qc.invalidateQueries({ queryKey: ["attendance"] });
    },
    onError: () => toast.error("Failed to mark attendance"),
  });

  const saveAll = async () => {
    const list = students as Student[];
    let saved = 0;
    for (const s of list) {
      if (!marked[s.id.toString()]) {
        await markMutation.mutateAsync({
          studentId: s.id,
          status: AttendanceStatus.present,
        });
        saved++;
      }
    }
    if (saved > 0 || Object.keys(marked).length > 0) {
      toast.success(`Attendance saved for ${selectedDate}`);
    }
  };

  return (
    <div className="space-y-4">
      <SectionHeader title="Attendance" />
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2 bg-muted/40 rounded-lg px-3 py-2">
          <Calendar className="w-4 h-4 text-muted-foreground" />
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => {
              setSelectedDate(e.target.value);
              setMarked({});
            }}
            data-ocid="attendance.date_input"
            className="bg-transparent text-foreground font-body text-sm focus:outline-none"
          />
        </div>
        <Button
          size="sm"
          onClick={saveAll}
          disabled={markMutation.isPending}
          data-ocid="attendance.save_button"
          className="font-body"
        >
          <CheckCircle className="w-3.5 h-3.5 mr-1.5" /> Save Attendance
        </Button>
      </div>

      {isLoading ? (
        <LoadingCards />
      ) : (students as Student[]).length === 0 ? (
        <EmptyState
          message="No active students found."
          ocid="attendance.empty_state"
        />
      ) : (
        <div className="space-y-2">
          {(students as Student[]).map((s, i) => {
            const status = marked[s.id.toString()];
            return (
              <Card
                key={s.id.toString()}
                data-ocid={`attendance.student.${i + 1}`}
                className="shadow-card"
              >
                <CardContent className="p-4 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-display font-semibold text-sm text-foreground">
                      {s.name}
                    </p>
                    <p className="font-body text-xs text-muted-foreground">
                      {classLabel(s.classLevel)}
                    </p>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <Button
                      size="sm"
                      variant={
                        status === AttendanceStatus.present
                          ? "default"
                          : "outline"
                      }
                      onClick={() =>
                        markMutation.mutate({
                          studentId: s.id,
                          status: AttendanceStatus.present,
                        })
                      }
                      data-ocid={`attendance.present_button.${i + 1}`}
                      className={`font-body h-8 px-3 text-xs transition-smooth ${status === AttendanceStatus.present ? "" : "text-primary border-primary/30 hover:bg-primary/5"}`}
                    >
                      <CheckCircle className="w-3 h-3 mr-1" /> Present
                    </Button>
                    <Button
                      size="sm"
                      variant={
                        status === AttendanceStatus.absent
                          ? "destructive"
                          : "outline"
                      }
                      onClick={() =>
                        markMutation.mutate({
                          studentId: s.id,
                          status: AttendanceStatus.absent,
                        })
                      }
                      data-ocid={`attendance.absent_button.${i + 1}`}
                      className={`font-body h-8 px-3 text-xs transition-smooth ${status === AttendanceStatus.absent ? "" : "text-destructive border-destructive/30 hover:bg-destructive/5"}`}
                    >
                      <XCircle className="w-3 h-3 mr-1" /> Absent
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Assignments Tab ──────────────────────────────────────────────────────────

function SubmissionsPanel({
  assignment,
  onClose,
}: { assignment: Assignment; onClose: () => void }) {
  const { actor, isFetching } = useActor();
  const { data: submissions = [], isLoading } = useQuery({
    queryKey: ["submissions", assignment.id.toString()],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getSubmissionsByAssignment(assignment.id);
    },
    enabled: !!actor && !isFetching,
  });

  return (
    <Card
      className="border-primary/20 shadow-card"
      data-ocid="assignments.submissions_panel"
    >
      <CardHeader className="pb-2 pt-4 px-4 flex flex-row items-center justify-between">
        <CardTitle className="font-display text-base">
          Submissions — {assignment.title}
        </CardTitle>
        <Button
          size="sm"
          variant="ghost"
          onClick={onClose}
          data-ocid="assignments.close_submissions_button"
          className="h-7 px-2"
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>
      </CardHeader>
      <CardContent className="px-4 pb-4">
        {isLoading ? (
          <Skeleton className="h-20 w-full" />
        ) : (submissions as AssignmentSubmission[]).length === 0 ? (
          <p
            className="text-sm text-muted-foreground font-body"
            data-ocid="submissions.empty_state"
          >
            No submissions yet.
          </p>
        ) : (
          <div className="divide-y divide-border">
            {(submissions as AssignmentSubmission[]).map((sub, i) => (
              <div
                key={sub.id.toString()}
                data-ocid={`submissions.item.${i + 1}`}
                className="flex items-center justify-between py-2.5"
              >
                <p className="font-body text-sm text-foreground">
                  Student #{sub.studentId.toString()}
                </p>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs font-body">
                    {sub.status}
                  </Badge>
                  <p className="font-body text-xs text-muted-foreground">
                    {tsToDate(sub.submittedAt)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function AssignmentsTab() {
  const { actor, isFetching } = useActor();
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [viewingAssignment, setViewingAssignment] = useState<Assignment | null>(
    null,
  );
  const [form, setForm] = useState({
    title: "",
    subject: "",
    description: "",
    deadline: "",
  });
  const [file, setFile] = useState<File | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const { data: assignments = [], isLoading } = useQuery({
    queryKey: ["assignments"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listAssignments();
    },
    enabled: !!actor && !isFetching,
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("No actor");
      const deadlineTs = BigInt(new Date(form.deadline).getTime()) * 1_000_000n;
      let blob: ExternalBlob | null = null;
      if (file) {
        const bytes = new Uint8Array(await file.arrayBuffer());
        blob = ExternalBlob.fromBytes(bytes);
      }
      return actor.createAssignment(
        form.title,
        form.subject,
        form.description,
        deadlineTs,
        blob,
      );
    },
    onSuccess: () => {
      toast.success("Assignment created!");
      qc.invalidateQueries({ queryKey: ["assignments"] });
      setShowForm(false);
      setForm({ title: "", subject: "", description: "", deadline: "" });
      setFile(null);
    },
    onError: () => toast.error("Failed to create assignment"),
  });

  return (
    <div className="space-y-4">
      <SectionHeader
        title="Assignments"
        count={(assignments as Assignment[]).length}
        onAdd={() => setShowForm(!showForm)}
        addLabel="New Assignment"
        addOcid="admin.add_assignment_button"
      />

      {viewingAssignment && (
        <SubmissionsPanel
          assignment={viewingAssignment}
          onClose={() => setViewingAssignment(null)}
        />
      )}

      {showForm && (
        <Card
          className="border-primary/20 shadow-card"
          data-ocid="admin.add_assignment_dialog"
        >
          <CardHeader className="pb-2 pt-4 px-4">
            <CardTitle className="font-display text-base">
              New Assignment
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <FormField
                id="a-title"
                label="Title"
                value={form.title}
                onChange={(v) => setForm({ ...form, title: v })}
                placeholder="Chapter 5 Problems"
              />
              <FormField
                id="a-subject"
                label="Subject"
                value={form.subject}
                onChange={(v) => setForm({ ...form, subject: v })}
                placeholder="Mathematics"
              />
              <FormField
                id="a-deadline"
                label="Deadline"
                type="date"
                value={form.deadline}
                onChange={(v) => setForm({ ...form, deadline: v })}
              />
            </div>
            <div>
              <label
                htmlFor="a-desc"
                className="block font-body text-xs font-semibold text-muted-foreground mb-1 uppercase tracking-wide"
              >
                Description
              </label>
              <textarea
                id="a-desc"
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                rows={3}
                placeholder="Describe the assignment tasks…"
                className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none transition-smooth"
              />
            </div>
            <div>
              <p className="block font-body text-xs font-semibold text-muted-foreground mb-1 uppercase tracking-wide">
                File (optional)
              </p>
              <input
                ref={fileRef}
                type="file"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                data-ocid="admin.assignment_file_input"
                className="hidden"
              />
              <Button
                size="sm"
                variant="outline"
                onClick={() => fileRef.current?.click()}
                className="font-body gap-1.5"
              >
                <Upload className="w-3.5 h-3.5" />
                {file ? file.name : "Choose File"}
              </Button>
            </div>
            <div className="flex gap-2 pt-1">
              <Button
                size="sm"
                onClick={() => createMutation.mutate()}
                disabled={
                  createMutation.isPending || !form.title || !form.deadline
                }
                data-ocid="admin.save_assignment_button"
                className="font-body"
              >
                {createMutation.isPending ? "Creating…" : "Create Assignment"}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowForm(false)}
                data-ocid="admin.cancel_assignment_button"
                className="font-body"
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <LoadingCards />
      ) : (assignments as Assignment[]).length === 0 ? (
        <EmptyState
          message="No assignments yet. Create your first assignment."
          ocid="assignments.empty_state"
        />
      ) : (
        <div className="space-y-2">
          {(assignments as Assignment[]).map((a, i) => (
            <Card
              key={a.id.toString()}
              data-ocid={`assignments.item.${i + 1}`}
              className="shadow-card"
            >
              <CardContent className="p-4 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-display font-semibold text-sm text-foreground">
                    {a.title}
                  </p>
                  <p className="font-body text-xs text-muted-foreground">
                    {a.subject} · Due {tsToDate(a.deadline)}
                  </p>
                  <p className="font-body text-xs text-muted-foreground mt-0.5 line-clamp-1">
                    {a.description}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    setViewingAssignment(
                      viewingAssignment?.id === a.id ? null : a,
                    )
                  }
                  data-ocid={`assignments.view_submissions_button.${i + 1}`}
                  className="font-body text-xs h-7 gap-1 flex-shrink-0"
                >
                  <Eye className="w-3.5 h-3.5" /> Submissions
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Tests Tab ────────────────────────────────────────────────────────────────

function EnterMarksPanel({
  test,
  students,
  onClose,
}: { test: ClassTest; students: Student[]; onClose: () => void }) {
  const { actor } = useActor();
  const qc = useQueryClient();
  const [marks, setMarks] = useState<Record<string, string>>({});
  const [feedback, setFeedback] = useState<Record<string, string>>({});

  const { data: existingResults = [] } = useQuery({
    queryKey: ["results-by-test", test.id.toString()],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getResultsByTest(test.id);
    },
    enabled: !!actor,
  });

  const existingMap = (existingResults as TestResult[]).reduce<
    Record<string, TestResult>
  >((acc, r) => {
    acc[r.studentId.toString()] = r;
    return acc;
  }, {});

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("No actor");
      const promises = students
        .map((s) => {
          const m = marks[s.id.toString()];
          if (m === undefined || m === "") return null;
          return actor.enterTestResult(
            test.id,
            s.id,
            BigInt(m),
            feedback[s.id.toString()] || null,
          );
        })
        .filter(Boolean);
      return Promise.all(promises);
    },
    onSuccess: () => {
      toast.success("Marks saved!");
      qc.invalidateQueries({
        queryKey: ["results-by-test", test.id.toString()],
      });
      onClose();
    },
    onError: () => toast.error("Failed to save marks"),
  });

  return (
    <Card
      className="border-primary/20 shadow-card"
      data-ocid="tests.enter_marks_panel"
    >
      <CardHeader className="pb-2 pt-4 px-4 flex flex-row items-center justify-between">
        <CardTitle className="font-display text-base">
          Marks — {test.name} (/{test.totalMarks.toString()})
        </CardTitle>
        <Button
          size="sm"
          variant="ghost"
          onClick={onClose}
          data-ocid="tests.close_marks_button"
          className="h-7 px-2"
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>
      </CardHeader>
      <CardContent className="px-4 pb-4 space-y-1">
        {students.map((s, i) => {
          const existing = existingMap[s.id.toString()];
          return (
            <div
              key={s.id.toString()}
              data-ocid={`tests.marks_row.${i + 1}`}
              className="flex items-center gap-3 py-2 border-b border-border last:border-0"
            >
              <p className="font-body text-sm text-foreground flex-1 min-w-0 truncate">
                {s.name}
              </p>
              <input
                type="number"
                min={0}
                max={Number(test.totalMarks)}
                placeholder={
                  existing ? existing.marksObtained.toString() : "Marks"
                }
                value={marks[s.id.toString()] ?? ""}
                onChange={(e) =>
                  setMarks((p) => ({ ...p, [s.id.toString()]: e.target.value }))
                }
                className="w-20 px-2 py-1 rounded-lg border border-input bg-background text-foreground font-body text-sm text-center focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
              <input
                type="text"
                placeholder="Feedback (optional)"
                value={feedback[s.id.toString()] ?? ""}
                onChange={(e) =>
                  setFeedback((p) => ({
                    ...p,
                    [s.id.toString()]: e.target.value,
                  }))
                }
                className="flex-1 min-w-0 px-2 py-1 rounded-lg border border-input bg-background text-foreground font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
          );
        })}
        <div className="flex gap-2 pt-3">
          <Button
            size="sm"
            onClick={() => saveMutation.mutate()}
            disabled={saveMutation.isPending}
            data-ocid="tests.save_marks_button"
            className="font-body"
          >
            {saveMutation.isPending ? "Saving…" : "Save Marks"}
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={onClose}
            data-ocid="tests.cancel_marks_button"
            className="font-body"
          >
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function TestsTab() {
  const { actor, isFetching } = useActor();
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [enterMarksTest, setEnterMarksTest] = useState<ClassTest | null>(null);
  const [form, setForm] = useState({
    name: "",
    subject: "",
    testDate: "",
    totalMarks: "100",
    description: "",
  });

  const { data: tests = [], isLoading } = useQuery({
    queryKey: ["tests"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listTests();
    },
    enabled: !!actor && !isFetching,
  });

  const { data: students = [] } = useQuery({
    queryKey: ["active-students"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listActiveStudents();
    },
    enabled: !!actor && !isFetching,
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("No actor");
      const dateTs = BigInt(new Date(form.testDate).getTime()) * 1_000_000n;
      return actor.createTest(
        form.name,
        form.subject,
        dateTs,
        BigInt(form.totalMarks),
        form.description,
      );
    },
    onSuccess: () => {
      toast.success("Test created!");
      qc.invalidateQueries({ queryKey: ["tests"] });
      setShowForm(false);
      setForm({
        name: "",
        subject: "",
        testDate: "",
        totalMarks: "100",
        description: "",
      });
    },
    onError: () => toast.error("Failed to create test"),
  });

  return (
    <div className="space-y-4">
      <SectionHeader
        title="Class Tests"
        count={(tests as ClassTest[]).length}
        onAdd={() => setShowForm(!showForm)}
        addLabel="New Test"
        addOcid="admin.add_test_button"
      />

      {enterMarksTest && (
        <EnterMarksPanel
          test={enterMarksTest}
          students={students as Student[]}
          onClose={() => setEnterMarksTest(null)}
        />
      )}

      {showForm && (
        <Card
          className="border-primary/20 shadow-card"
          data-ocid="admin.add_test_dialog"
        >
          <CardHeader className="pb-2 pt-4 px-4">
            <CardTitle className="font-display text-base">New Test</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <FormField
                id="t-name"
                label="Test Name"
                value={form.name}
                onChange={(v) => setForm({ ...form, name: v })}
                placeholder="Weekly Math Test"
              />
              <FormField
                id="t-subject"
                label="Subject"
                value={form.subject}
                onChange={(v) => setForm({ ...form, subject: v })}
                placeholder="Mathematics"
              />
              <FormField
                id="t-date"
                label="Test Date"
                type="date"
                value={form.testDate}
                onChange={(v) => setForm({ ...form, testDate: v })}
              />
              <FormField
                id="t-marks"
                label="Total Marks"
                type="number"
                value={form.totalMarks}
                onChange={(v) => setForm({ ...form, totalMarks: v })}
                placeholder="100"
              />
            </div>
            <div>
              <label
                htmlFor="t-desc"
                className="block font-body text-xs font-semibold text-muted-foreground mb-1 uppercase tracking-wide"
              >
                Description
              </label>
              <textarea
                id="t-desc"
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                rows={2}
                placeholder="Topics covered, instructions…"
                className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none transition-smooth"
              />
            </div>
            <div className="flex gap-2 pt-1">
              <Button
                size="sm"
                onClick={() => createMutation.mutate()}
                disabled={
                  createMutation.isPending || !form.name || !form.testDate
                }
                data-ocid="admin.save_test_button"
                className="font-body"
              >
                {createMutation.isPending ? "Creating…" : "Create Test"}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowForm(false)}
                data-ocid="admin.cancel_test_button"
                className="font-body"
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <LoadingCards />
      ) : (tests as ClassTest[]).length === 0 ? (
        <EmptyState
          message="No tests yet. Create your first class test."
          ocid="tests.empty_state"
        />
      ) : (
        <div className="space-y-2">
          {(tests as ClassTest[]).map((t, i) => (
            <Card
              key={t.id.toString()}
              data-ocid={`tests.item.${i + 1}`}
              className="shadow-card"
            >
              <CardContent className="p-4 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-display font-semibold text-sm text-foreground">
                    {t.name}
                  </p>
                  <p className="font-body text-xs text-muted-foreground">
                    {t.subject} · {tsToDate(t.testDate)} ·{" "}
                    {t.totalMarks.toString()} marks
                  </p>
                  {t.description && (
                    <p className="font-body text-xs text-muted-foreground mt-0.5 line-clamp-1">
                      {t.description}
                    </p>
                  )}
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    setEnterMarksTest(enterMarksTest?.id === t.id ? null : t)
                  }
                  data-ocid={`tests.enter_marks_button.${i + 1}`}
                  className="font-body text-xs h-7 gap-1 flex-shrink-0"
                >
                  <BarChart3 className="w-3.5 h-3.5" /> Marks
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Leads Tab ────────────────────────────────────────────────────────────────

const STATUS_STYLES: Record<string, string> = {
  new: "bg-primary/10 text-primary border-primary/20",
  contacted: "bg-accent/10 text-accent-foreground border-accent/20",
  enrolled: "bg-green-500/10 text-green-700 border-green-500/20",
};

function LeadsTab() {
  const { actor, isFetching } = useActor();
  const qc = useQueryClient();

  const { data: leads = [], isLoading } = useQuery({
    queryKey: ["leads"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listLeads();
    },
    enabled: !!actor && !isFetching,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, status }: { id: LeadId; status: FollowUpStatus }) => {
      if (!actor) throw new Error("No actor");
      return actor.updateLeadStatus(id, status);
    },
    onSuccess: () => {
      toast.success("Status updated");
      qc.invalidateQueries({ queryKey: ["leads"] });
    },
    onError: () => toast.error("Failed to update status"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: LeadId) => {
      if (!actor) throw new Error("No actor");
      return actor.deleteLead(id);
    },
    onSuccess: () => {
      toast.success("Lead deleted");
      qc.invalidateQueries({ queryKey: ["leads"] });
    },
    onError: () => toast.error("Failed to delete lead"),
  });

  return (
    <div className="space-y-4">
      <SectionHeader
        title="Chatbot Leads"
        count={(leads as ChatbotLead[]).length}
      />

      {isLoading ? (
        <LoadingCards />
      ) : (leads as ChatbotLead[]).length === 0 ? (
        <EmptyState
          message="No leads collected yet. Leads from the AI chatbot appear here."
          ocid="leads.empty_state"
        />
      ) : (
        <div className="space-y-2">
          {(leads as ChatbotLead[]).map((lead, i) => (
            <Card
              key={lead.id.toString()}
              data-ocid={`leads.item.${i + 1}`}
              className="shadow-card"
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-display font-semibold text-sm text-foreground">
                      {lead.name}
                    </p>
                    <p className="font-body text-xs text-muted-foreground">
                      📞 {lead.phone} · {classLabel(lead.classInterest)}
                    </p>
                    <p className="font-body text-xs text-muted-foreground mt-0.5">
                      ⏰ {lead.preferredTime} · {tsToDate(lead.createdAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <select
                      value={lead.followUpStatus}
                      onChange={(e) =>
                        updateMutation.mutate({
                          id: lead.id,
                          status: e.target.value as FollowUpStatus,
                        })
                      }
                      data-ocid={`leads.status_select.${i + 1}`}
                      className={`text-xs font-body px-2 py-1 rounded-lg border focus:outline-none focus:ring-2 focus:ring-primary/30 transition-smooth ${STATUS_STYLES[lead.followUpStatus] ?? ""}`}
                    >
                      <option value={FollowUpStatus.new_}>New</option>
                      <option value={FollowUpStatus.contacted}>
                        Contacted
                      </option>
                      <option value={FollowUpStatus.enrolled}>Enrolled</option>
                    </select>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => deleteMutation.mutate(lead.id)}
                      data-ocid={`leads.delete_button.${i + 1}`}
                      className="h-7 w-7 p-0 text-destructive hover:bg-destructive/5"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Gallery Tab ──────────────────────────────────────────────────────────────

function GalleryTab() {
  const { actor, isFetching } = useActor();
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: GalleryCategory.classroom,
  });
  const [file, setFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileRef = useRef<HTMLInputElement>(null);

  const { data: images = [], isLoading } = useQuery({
    queryKey: ["gallery"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listGalleryImages();
    },
    enabled: !!actor && !isFetching,
  });

  const uploadMutation = useMutation({
    mutationFn: async () => {
      if (!actor || !file) throw new Error("No actor or file");
      setUploadProgress(0);
      const bytes = new Uint8Array(await file.arrayBuffer());
      const blob = ExternalBlob.fromBytes(bytes).withUploadProgress((pct) =>
        setUploadProgress(pct),
      );
      return actor.addGalleryImage(
        form.title,
        form.description,
        blob,
        form.category,
      );
    },
    onSuccess: () => {
      toast.success("Image uploaded!");
      qc.invalidateQueries({ queryKey: ["gallery"] });
      setShowForm(false);
      setForm({
        title: "",
        description: "",
        category: GalleryCategory.classroom,
      });
      setFile(null);
      setUploadProgress(0);
    },
    onError: () => toast.error("Upload failed"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: ImageId) => {
      if (!actor) throw new Error("No actor");
      return actor.deleteGalleryImage(id);
    },
    onSuccess: () => {
      toast.success("Image deleted");
      qc.invalidateQueries({ queryKey: ["gallery"] });
    },
    onError: () => toast.error("Failed to delete image"),
  });

  return (
    <div className="space-y-4">
      <SectionHeader
        title="Gallery"
        count={(images as GalleryImage[]).length}
        onAdd={() => setShowForm(!showForm)}
        addLabel="Upload Image"
        addOcid="admin.upload_image_button"
      />

      {showForm && (
        <Card
          className="border-primary/20 shadow-card"
          data-ocid="admin.upload_image_dialog"
        >
          <CardHeader className="pb-2 pt-4 px-4">
            <CardTitle className="font-display text-base">
              Upload Image
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <FormField
                id="g-title"
                label="Title"
                value={form.title}
                onChange={(v) => setForm({ ...form, title: v })}
                placeholder="Classroom Activity"
              />
              <div>
                <label
                  htmlFor="g-category"
                  className="block font-body text-xs font-semibold text-muted-foreground mb-1 uppercase tracking-wide"
                >
                  Category
                </label>
                <select
                  id="g-category"
                  value={form.category}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      category: e.target.value as GalleryCategory,
                    })
                  }
                  data-ocid="admin.gallery_category_select"
                  className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-smooth"
                >
                  <option value={GalleryCategory.classroom}>Classroom</option>
                  <option value={GalleryCategory.activities}>Activities</option>
                  <option value={GalleryCategory.results}>Results</option>
                </select>
              </div>
            </div>
            <FormField
              id="g-desc"
              label="Description"
              value={form.description}
              onChange={(v) => setForm({ ...form, description: v })}
              placeholder="Brief description…"
            />
            <div>
              <p className="block font-body text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">
                Image File
              </p>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                data-ocid="admin.gallery_file_input"
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                data-ocid="admin.gallery_dropzone"
                className="w-full border-2 border-dashed border-input rounded-xl p-6 text-center cursor-pointer hover:border-primary/40 hover:bg-primary/5 transition-smooth"
              >
                {file ? (
                  <p className="font-body text-sm text-foreground">
                    {file.name}
                  </p>
                ) : (
                  <>
                    <Image className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                    <p className="font-body text-sm text-muted-foreground">
                      Click to choose an image
                    </p>
                    <p className="font-body text-xs text-muted-foreground mt-1">
                      JPG, PNG, WebP supported
                    </p>
                  </>
                )}
              </button>
            </div>
            {uploadMutation.isPending && uploadProgress > 0 && (
              <div className="rounded-lg bg-muted/50 p-3">
                <div className="flex justify-between mb-1.5">
                  <span className="font-body text-xs text-muted-foreground">
                    Uploading…
                  </span>
                  <span className="font-body text-xs font-semibold text-foreground">
                    {uploadProgress}%
                  </span>
                </div>
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}
            <div className="flex gap-2 pt-1">
              <Button
                size="sm"
                onClick={() => uploadMutation.mutate()}
                disabled={uploadMutation.isPending || !file || !form.title}
                data-ocid="admin.save_gallery_button"
                className="font-body gap-1.5"
              >
                <Upload className="w-3.5 h-3.5" />
                {uploadMutation.isPending ? "Uploading…" : "Upload Image"}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowForm(false)}
                data-ocid="admin.cancel_gallery_button"
                className="font-body"
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <div
          className="grid grid-cols-2 sm:grid-cols-3 gap-3"
          data-ocid="gallery.loading_state"
        >
          {["g1", "g2", "g3", "g4", "g5", "g6"].map((k) => (
            <Skeleton key={k} className="aspect-square rounded-xl" />
          ))}
        </div>
      ) : (images as GalleryImage[]).length === 0 ? (
        <EmptyState
          message="No images uploaded yet. Upload your first gallery photo."
          ocid="gallery.empty_state"
        />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {(images as GalleryImage[]).map((img, i) => (
            <div
              key={img.id.toString()}
              data-ocid={`gallery.item.${i + 1}`}
              className="group relative rounded-xl overflow-hidden aspect-square bg-muted shadow-card"
            >
              <img
                src={img.fileBlob.getDirectURL()}
                alt={img.title}
                className="w-full h-full object-cover transition-smooth group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-foreground/60 opacity-0 group-hover:opacity-100 transition-smooth flex flex-col justify-end p-2">
                <p className="font-body text-xs text-white font-semibold truncate">
                  {img.title}
                </p>
                <Badge
                  variant="secondary"
                  className="text-xs w-fit mt-1 font-body"
                >
                  {img.category}
                </Badge>
              </div>
              <button
                type="button"
                onClick={() => deleteMutation.mutate(img.id)}
                data-ocid={`gallery.delete_button.${i + 1}`}
                aria-label="Delete image"
                className="absolute top-2 right-2 w-7 h-7 rounded-full bg-destructive/90 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-smooth hover:bg-destructive"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Admin Page ───────────────────────────────────────────────────────────────

type AdminTab =
  | "students"
  | "attendance"
  | "assignments"
  | "tests"
  | "leads"
  | "gallery";

const ADMIN_TABS: { id: AdminTab; label: string; icon: React.ReactNode }[] = [
  { id: "students", label: "Students", icon: <Users className="w-4 h-4" /> },
  {
    id: "attendance",
    label: "Attendance",
    icon: <ClipboardList className="w-4 h-4" />,
  },
  {
    id: "assignments",
    label: "Assignments",
    icon: <BookOpen className="w-4 h-4" />,
  },
  { id: "tests", label: "Tests", icon: <BarChart3 className="w-4 h-4" /> },
  { id: "leads", label: "Leads", icon: <MessageSquare className="w-4 h-4" /> },
  { id: "gallery", label: "Gallery", icon: <Image className="w-4 h-4" /> },
];

export function AdminPage() {
  const { loginStatus, identity } = useInternetIdentity();
  const { actor, isFetching } = useActor();
  const isLoggedIn =
    (loginStatus === "success" || loginStatus === "idle") && !!identity;
  const [tab, setTab] = useState<AdminTab>("students");

  const { data: isAdmin, isLoading: isAdminLoading } = useQuery({
    queryKey: ["is-admin"],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching && isLoggedIn,
  });

  if (!isLoggedIn) return <LoginPrompt />;

  if (isAdminLoading) {
    return (
      <div
        className="min-h-[70vh] flex items-center justify-center"
        data-ocid="admin.loading_state"
      >
        <Skeleton className="h-8 w-48" />
      </div>
    );
  }

  if (isAdmin === false) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-muted/20">
        <Card className="max-w-sm w-full mx-4 shadow-elevated">
          <CardContent className="p-8 text-center">
            <div className="w-14 h-14 rounded-2xl bg-destructive/10 flex items-center justify-center mx-auto mb-4">
              <XCircle className="w-7 h-7 text-destructive" />
            </div>
            <p className="font-display font-bold text-lg text-foreground mb-2">
              Access Denied
            </p>
            <p className="font-body text-sm text-muted-foreground">
              You don't have admin privileges to access this panel.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/20">
      {/* Sticky Admin Header */}
      <div className="bg-card border-b border-border shadow-subtle sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div>
            <h1 className="font-display font-bold text-lg text-foreground">
              Admin Panel
            </h1>
            <p className="font-body text-xs text-muted-foreground hidden sm:block">
              Yahya Personal Tuition Classes
            </p>
          </div>
          <Badge
            variant="secondary"
            className="font-body text-xs gap-1.5 py-1 px-2.5"
          >
            <CheckCircle className="w-3 h-3 text-primary" /> Admin
          </Badge>
        </div>

        {/* Scrollable Tab Bar */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 overflow-x-auto scrollbar-hide">
          <div className="flex min-w-max sm:min-w-0" data-ocid="admin.tabs">
            {ADMIN_TABS.map((t) => (
              <button
                type="button"
                key={t.id}
                onClick={() => setTab(t.id)}
                data-ocid={`admin.${t.id}_tab`}
                className={`flex items-center gap-1.5 px-3 sm:px-4 py-3 font-body text-sm font-medium border-b-2 transition-smooth whitespace-nowrap ${
                  tab === t.id
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
                }`}
              >
                {t.icon}
                <span>{t.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        <div className="bg-card rounded-2xl shadow-card border border-border p-4 sm:p-6">
          {tab === "students" && <StudentsTab />}
          {tab === "attendance" && <AttendanceTab />}
          {tab === "assignments" && <AssignmentsTab />}
          {tab === "tests" && <TestsTab />}
          {tab === "leads" && <LeadsTab />}
          {tab === "gallery" && <GalleryTab />}
        </div>
      </div>
    </div>
  );
}
