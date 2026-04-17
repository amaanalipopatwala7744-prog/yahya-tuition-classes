import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export interface ClassTest {
    id: TestId;
    totalMarks: bigint;
    subject: string;
    testDate: Timestamp;
    name: string;
    createdAt: Timestamp;
    createdBy: Principal;
    description: string;
}
export type Timestamp = bigint;
export type LeadId = bigint;
export type TestId = bigint;
export type ResultId = bigint;
export type StudentId = bigint;
export type ImageId = bigint;
export interface TestResult {
    id: ResultId;
    studentId: StudentId;
    marksObtained: bigint;
    feedback?: string;
    testId: TestId;
}
export type SubmissionId = bigint;
export interface GalleryImage {
    id: ImageId;
    title: string;
    fileBlob: ExternalBlob;
    description: string;
    category: GalleryCategory;
    uploadedAt: Timestamp;
}
export type AttendanceId = bigint;
export interface ChatbotLead {
    id: LeadId;
    name: string;
    createdAt: Timestamp;
    preferredTime: string;
    classInterest: ClassLevel;
    phone: string;
    followUpStatus: FollowUpStatus;
}
export interface AssignmentSubmission {
    id: SubmissionId;
    status: SubmissionStatus;
    studentId: StudentId;
    fileBlob: ExternalBlob;
    submittedAt: Timestamp;
    assignmentId: AssignmentId;
}
export type AssignmentId = bigint;
export interface Assignment {
    id: AssignmentId;
    title: string;
    subject: string;
    createdAt: Timestamp;
    createdBy: Principal;
    fileBlob?: ExternalBlob;
    description: string;
    deadline: Timestamp;
}
export interface AttendanceRecord {
    id: AttendanceId;
    status: AttendanceStatus;
    studentId: StudentId;
    date: string;
    markedBy: Principal;
}
export interface Student {
    id: StudentId;
    principal: Principal;
    subjects: Array<string>;
    name: string;
    isActive: boolean;
    email: string;
    classLevel: ClassLevel;
    enrollmentDate: Timestamp;
    phone: string;
}
export enum AttendanceStatus {
    present = "present",
    absent = "absent"
}
export enum ClassLevel {
    class11to12 = "class11to12",
    class6to8 = "class6to8",
    class9to10 = "class9to10"
}
export enum FollowUpStatus {
    new_ = "new",
    enrolled = "enrolled",
    contacted = "contacted"
}
export enum GalleryCategory {
    activities = "activities",
    results = "results",
    classroom = "classroom"
}
export enum SubmissionStatus {
    submitted = "submitted",
    late = "late",
    reviewed = "reviewed"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addGalleryImage(title: string, description: string, fileBlob: ExternalBlob, category: GalleryCategory): Promise<GalleryImage>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createAssignment(title: string, subject: string, description: string, deadline: Timestamp, fileBlob: ExternalBlob | null): Promise<Assignment>;
    createStudent(principal: Principal, name: string, classLevel: ClassLevel, subjects: Array<string>, phone: string, email: string): Promise<Student>;
    createTest(name: string, subject: string, testDate: Timestamp, totalMarks: bigint, description: string): Promise<ClassTest>;
    deactivateStudent(id: StudentId): Promise<boolean>;
    deleteAssignment(id: AssignmentId): Promise<boolean>;
    deleteGalleryImage(id: ImageId): Promise<boolean>;
    deleteLead(id: LeadId): Promise<boolean>;
    deleteTest(id: TestId): Promise<boolean>;
    enterTestResult(testId: TestId, studentId: StudentId, marksObtained: bigint, feedback: string | null): Promise<TestResult>;
    getAttendanceByDate(date: string): Promise<Array<AttendanceRecord>>;
    getCallerUserRole(): Promise<UserRole>;
    getMyAttendance(): Promise<Array<AttendanceRecord>>;
    getMyProfile(): Promise<Student | null>;
    getMySubmissions(): Promise<Array<AssignmentSubmission>>;
    getMyTestResults(): Promise<Array<TestResult>>;
    getResultsByTest(testId: TestId): Promise<Array<TestResult>>;
    getStudent(id: StudentId): Promise<Student | null>;
    getStudentAttendance(studentId: StudentId): Promise<Array<AttendanceRecord>>;
    getSubmissionsByAssignment(assignmentId: AssignmentId): Promise<Array<AssignmentSubmission>>;
    isCallerAdmin(): Promise<boolean>;
    listActiveStudents(): Promise<Array<Student>>;
    listAssignments(): Promise<Array<Assignment>>;
    listGalleryImages(): Promise<Array<GalleryImage>>;
    listGalleryImagesByCategory(category: GalleryCategory): Promise<Array<GalleryImage>>;
    listLeads(): Promise<Array<ChatbotLead>>;
    listStudents(): Promise<Array<Student>>;
    listTests(): Promise<Array<ClassTest>>;
    markAttendance(studentId: StudentId, date: string, status: AttendanceStatus): Promise<AttendanceRecord>;
    submitAssignment(assignmentId: AssignmentId, fileBlob: ExternalBlob): Promise<AssignmentSubmission>;
    submitLead(name: string, phone: string, classInterest: ClassLevel, preferredTime: string): Promise<ChatbotLead>;
    updateAttendance(id: AttendanceId, status: AttendanceStatus): Promise<boolean>;
    updateLeadStatus(id: LeadId, status: FollowUpStatus): Promise<boolean>;
    updateStudent(updated: Student): Promise<boolean>;
    updateSubmissionStatus(id: SubmissionId, status: SubmissionStatus): Promise<boolean>;
    updateTestResult(id: ResultId, marksObtained: bigint, feedback: string | null): Promise<boolean>;
}
