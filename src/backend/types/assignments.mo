import CommonTypes "common";
import Principal "mo:core/Principal";
import Storage "mo:caffeineai-object-storage/Storage";

module {
  public type Assignment = {
    id : CommonTypes.AssignmentId;
    title : Text;
    subject : Text;
    description : Text;
    deadline : CommonTypes.Timestamp;
    fileBlob : ?Storage.ExternalBlob;
    createdAt : CommonTypes.Timestamp;
    createdBy : Principal;
  };

  public type AssignmentSubmission = {
    id : CommonTypes.SubmissionId;
    assignmentId : CommonTypes.AssignmentId;
    studentId : CommonTypes.StudentId;
    submittedAt : CommonTypes.Timestamp;
    fileBlob : Storage.ExternalBlob;
    status : CommonTypes.SubmissionStatus;
  };
};
