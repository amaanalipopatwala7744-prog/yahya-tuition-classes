import CommonTypes "common";
import Principal "mo:core/Principal";

module {
  public type ClassTest = {
    id : CommonTypes.TestId;
    name : Text;
    subject : Text;
    testDate : CommonTypes.Timestamp;
    totalMarks : Nat;
    description : Text;
    createdAt : CommonTypes.Timestamp;
    createdBy : Principal;
  };

  public type TestResult = {
    id : CommonTypes.ResultId;
    testId : CommonTypes.TestId;
    studentId : CommonTypes.StudentId;
    marksObtained : Nat;
    feedback : ?Text;
  };
};
