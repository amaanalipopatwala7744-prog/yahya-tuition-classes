import List "mo:core/List";
import Runtime "mo:core/Runtime";
import Time "mo:core/Time";
import Storage "mo:caffeineai-object-storage/Storage";
import AccessControl "mo:caffeineai-authorization/access-control";
import CommonTypes "../types/common";
import AssignmentTypes "../types/assignments";
import AssignmentsLib "../lib/assignments";
import StudentsLib "../lib/students";
import StudentTypes "../types/students";

mixin (
  accessControlState : AccessControl.AccessControlState,
  assignments : List.List<AssignmentTypes.Assignment>,
  submissions : List.List<AssignmentTypes.AssignmentSubmission>,
  nextAssignmentId : CommonTypes.Counter,
  nextSubmissionId : CommonTypes.Counter,
  students : List.List<StudentTypes.Student>,
) {
  // Admin: create an assignment
  public shared ({ caller }) func createAssignment(
    title : Text,
    subject : Text,
    description : Text,
    deadline : CommonTypes.Timestamp,
    fileBlob : ?Storage.ExternalBlob,
  ) : async AssignmentTypes.Assignment {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can create assignments");
    };
    let now = Time.now();
    let assignment = AssignmentsLib.createAssignment(
      assignments,
      nextAssignmentId.val,
      title,
      subject,
      description,
      deadline,
      fileBlob,
      now,
      caller,
    );
    nextAssignmentId.val += 1;
    assignment;
  };

  // Admin: delete an assignment
  public shared ({ caller }) func deleteAssignment(id : CommonTypes.AssignmentId) : async Bool {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can delete assignments");
    };
    AssignmentsLib.deleteAssignment(assignments, id);
  };

  // Admin: list all submissions for an assignment
  public query ({ caller }) func getSubmissionsByAssignment(assignmentId : CommonTypes.AssignmentId) : async [AssignmentTypes.AssignmentSubmission] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can view all submissions");
    };
    AssignmentsLib.getSubmissionsByAssignment(submissions, assignmentId);
  };

  // Admin: review/update submission status
  public shared ({ caller }) func updateSubmissionStatus(
    id : CommonTypes.SubmissionId,
    status : CommonTypes.SubmissionStatus,
  ) : async Bool {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can update submission status");
    };
    AssignmentsLib.updateSubmissionStatus(submissions, id, status);
  };

  // All: list all assignments (authenticated users)
  public query ({ caller }) func listAssignments() : async [AssignmentTypes.Assignment] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Must be logged in to view assignments");
    };
    AssignmentsLib.listAssignments(assignments);
  };

  // Student: submit an assignment
  public shared ({ caller }) func submitAssignment(
    assignmentId : CommonTypes.AssignmentId,
    fileBlob : Storage.ExternalBlob,
  ) : async AssignmentTypes.AssignmentSubmission {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Must be logged in to submit assignments");
    };
    let student = StudentsLib.getStudentByPrincipal(students, caller);
    let studentId = switch (student) {
      case (?s) { s.id };
      case null { Runtime.trap("Student record not found for caller") };
    };
    let submission = AssignmentsLib.submitAssignment(
      submissions,
      nextSubmissionId.val,
      assignmentId,
      studentId,
      Time.now(),
      fileBlob,
    );
    nextSubmissionId.val += 1;
    submission;
  };

  // Student: get own submissions
  public query ({ caller }) func getMySubmissions() : async [AssignmentTypes.AssignmentSubmission] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Must be logged in to view submissions");
    };
    let student = StudentsLib.getStudentByPrincipal(students, caller);
    switch (student) {
      case (?s) { AssignmentsLib.getSubmissionsByStudent(submissions, s.id) };
      case null { [] };
    };
  };
};
