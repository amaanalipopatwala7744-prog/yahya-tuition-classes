import List "mo:core/List";
import Principal "mo:core/Principal";
import Storage "mo:caffeineai-object-storage/Storage";
import CommonTypes "../types/common";
import AssignmentTypes "../types/assignments";

module {
  public type Assignment = AssignmentTypes.Assignment;
  public type AssignmentSubmission = AssignmentTypes.AssignmentSubmission;

  public func createAssignment(
    assignments : List.List<Assignment>,
    nextId : Nat,
    title : Text,
    subject : Text,
    description : Text,
    deadline : CommonTypes.Timestamp,
    fileBlob : ?Storage.ExternalBlob,
    createdAt : CommonTypes.Timestamp,
    createdBy : Principal,
  ) : Assignment {
    let assignment : Assignment = {
      id = nextId;
      title;
      subject;
      description;
      deadline;
      fileBlob;
      createdAt;
      createdBy;
    };
    assignments.add(assignment);
    assignment;
  };

  public func getAssignment(assignments : List.List<Assignment>, id : CommonTypes.AssignmentId) : ?Assignment {
    assignments.find(func(a) { a.id == id });
  };

  public func listAssignments(assignments : List.List<Assignment>) : [Assignment] {
    assignments.toArray();
  };

  public func deleteAssignment(assignments : List.List<Assignment>, id : CommonTypes.AssignmentId) : Bool {
    let sizeBefore = assignments.size();
    let filtered = assignments.filter(func(a) { a.id != id });
    assignments.clear();
    assignments.append(filtered);
    assignments.size() < sizeBefore;
  };

  public func submitAssignment(
    submissions : List.List<AssignmentSubmission>,
    nextId : Nat,
    assignmentId : CommonTypes.AssignmentId,
    studentId : CommonTypes.StudentId,
    submittedAt : CommonTypes.Timestamp,
    fileBlob : Storage.ExternalBlob,
  ) : AssignmentSubmission {
    let submission : AssignmentSubmission = {
      id = nextId;
      assignmentId;
      studentId;
      submittedAt;
      fileBlob;
      status = #submitted;
    };
    submissions.add(submission);
    submission;
  };

  public func getSubmissionsByAssignment(submissions : List.List<AssignmentSubmission>, assignmentId : CommonTypes.AssignmentId) : [AssignmentSubmission] {
    submissions.filter(func(s) { s.assignmentId == assignmentId }).toArray();
  };

  public func getSubmissionsByStudent(submissions : List.List<AssignmentSubmission>, studentId : CommonTypes.StudentId) : [AssignmentSubmission] {
    submissions.filter(func(s) { s.studentId == studentId }).toArray();
  };

  public func updateSubmissionStatus(submissions : List.List<AssignmentSubmission>, id : CommonTypes.SubmissionId, status : CommonTypes.SubmissionStatus) : Bool {
    var found = false;
    submissions.mapInPlace(func(s) {
      if (s.id == id) {
        found := true;
        { s with status };
      } else {
        s;
      };
    });
    found;
  };
};
