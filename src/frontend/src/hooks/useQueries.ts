import type { ExternalBlob } from "@/backend.d.ts";
import { useActor } from "@/hooks/useBackendActor";
import type {
  AssignmentId,
  AttendanceId,
  AttendanceStatus,
  ClassLevel,
  FollowUpStatus,
  GalleryCategory,
  ImageId,
  LeadId,
  ResultId,
  StudentId,
  SubmissionId,
  SubmissionStatus,
  TestId,
  Timestamp,
  UserRole,
} from "@/types";
import type { Principal } from "@icp-sdk/core/principal";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// ─── Students ────────────────────────────────────────────────────────────────

export function useListStudents() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["students"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listStudents();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useListActiveStudents() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["active-students"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listActiveStudents();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetStudent(id: StudentId | null) {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["student", id?.toString()],
    queryFn: async () => {
      if (!actor || !id) return null;
      return actor.getStudent(id);
    },
    enabled: !!actor && !isFetching && !!id,
  });
}

export function useMyProfile() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["my-profile"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getMyProfile();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateStudent() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (args: {
      principal: Principal;
      name: string;
      classLevel: ClassLevel;
      subjects: string[];
      phone: string;
      email: string;
    }) =>
      actor!.createStudent(
        args.principal,
        args.name,
        args.classLevel,
        args.subjects,
        args.phone,
        args.email,
      ),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["students"] }),
  });
}

export function useDeactivateStudent() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: StudentId) => actor!.deactivateStudent(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["students"] }),
  });
}

// ─── Attendance ───────────────────────────────────────────────────────────────

export function useMyAttendance() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["my-attendance"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getMyAttendance();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useStudentAttendance(studentId: StudentId | null) {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["student-attendance", studentId?.toString()],
    queryFn: async () => {
      if (!actor || !studentId) return [];
      return actor.getStudentAttendance(studentId);
    },
    enabled: !!actor && !isFetching && !!studentId,
  });
}

export function useMarkAttendance() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (args: {
      studentId: StudentId;
      date: string;
      status: AttendanceStatus;
    }) => actor!.markAttendance(args.studentId, args.date, args.status),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["my-attendance"] }),
  });
}

// ─── Assignments ──────────────────────────────────────────────────────────────

export function useListAssignments() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["assignments"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listAssignments();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateAssignment() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (args: {
      title: string;
      subject: string;
      description: string;
      deadline: Timestamp;
      fileBlob: ExternalBlob | null;
    }) =>
      actor!.createAssignment(
        args.title,
        args.subject,
        args.description,
        args.deadline,
        args.fileBlob,
      ),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["assignments"] }),
  });
}

export function useMySubmissions() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["my-submissions"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getMySubmissions();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSubmitAssignment() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (args: {
      assignmentId: AssignmentId;
      fileBlob: ExternalBlob;
    }) => actor!.submitAssignment(args.assignmentId, args.fileBlob),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["my-submissions"] }),
  });
}

// ─── Tests ────────────────────────────────────────────────────────────────────

export function useListTests() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["tests"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listTests();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useMyTestResults() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["my-test-results"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getMyTestResults();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useResultsByTest(testId: TestId | null) {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["results-by-test", testId?.toString()],
    queryFn: async () => {
      if (!actor || !testId) return [];
      return actor.getResultsByTest(testId);
    },
    enabled: !!actor && !isFetching && !!testId,
  });
}

// ─── Leads ────────────────────────────────────────────────────────────────────

export function useListLeads() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["leads"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listLeads();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSubmitLead() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (args: {
      name: string;
      phone: string;
      classInterest: ClassLevel;
      preferredTime: string;
    }) =>
      actor!.submitLead(
        args.name,
        args.phone,
        args.classInterest,
        args.preferredTime,
      ),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["leads"] }),
  });
}

// ─── Gallery ──────────────────────────────────────────────────────────────────

export function useListGalleryImages() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["gallery"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listGalleryImages();
    },
    enabled: !!actor && !isFetching,
  });
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export function useIsAdmin() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["is-admin"],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
  });
}
