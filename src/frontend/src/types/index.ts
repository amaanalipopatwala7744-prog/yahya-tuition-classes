import type {
  Assignment,
  AssignmentSubmission,
  AttendanceRecord,
  ChatbotLead,
  ClassTest,
  GalleryImage,
  Student,
  TestResult,
} from "../backend.d.ts";

export type {
  Student,
  ClassTest,
  TestResult,
  Assignment,
  AssignmentSubmission,
  AttendanceRecord,
  ChatbotLead,
  GalleryImage,
};

export type {
  StudentId,
  TestId,
  ResultId,
  AssignmentId,
  AttendanceId,
  LeadId,
  ImageId,
  SubmissionId,
  Timestamp,
} from "../backend.d.ts";

// Enums exported as values from the runtime backend module (not the .d.ts declaration)
export {
  AttendanceStatus,
  ClassLevel,
  FollowUpStatus,
  GalleryCategory,
  SubmissionStatus,
  UserRole,
} from "../backend";

export interface NavLink {
  label: string;
  href: string;
}

export interface CourseInfo {
  classRange: string;
  subjects: string[];
  fee: string;
  duration: string;
}

export interface Testimonial {
  name: string;
  class: string;
  text: string;
  score: string;
}

export interface ChatMessage {
  role: "bot" | "user";
  text: string;
}
