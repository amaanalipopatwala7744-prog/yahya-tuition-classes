import List "mo:core/List";
import Runtime "mo:core/Runtime";
import Time "mo:core/Time";
import AccessControl "mo:caffeineai-authorization/access-control";
import CommonTypes "../types/common";
import TestTypes "../types/tests";
import TestsLib "../lib/tests";
import StudentsLib "../lib/students";
import StudentTypes "../types/students";

mixin (
  accessControlState : AccessControl.AccessControlState,
  tests : List.List<TestTypes.ClassTest>,
  testResults : List.List<TestTypes.TestResult>,
  nextTestId : CommonTypes.Counter,
  nextResultId : CommonTypes.Counter,
  students : List.List<StudentTypes.Student>,
) {
  // Admin: create a class test
  public shared ({ caller }) func createTest(
    name : Text,
    subject : Text,
    testDate : CommonTypes.Timestamp,
    totalMarks : Nat,
    description : Text,
  ) : async TestTypes.ClassTest {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can create tests");
    };
    let now = Time.now();
    let classTest = TestsLib.createTest(
      tests,
      nextTestId.val,
      name,
      subject,
      testDate,
      totalMarks,
      description,
      now,
      caller,
    );
    nextTestId.val += 1;
    classTest;
  };

  // Admin: delete a test
  public shared ({ caller }) func deleteTest(id : CommonTypes.TestId) : async Bool {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can delete tests");
    };
    TestsLib.deleteTest(tests, id);
  };

  // Admin: enter test result for a student
  public shared ({ caller }) func enterTestResult(
    testId : CommonTypes.TestId,
    studentId : CommonTypes.StudentId,
    marksObtained : Nat,
    feedback : ?Text,
  ) : async TestTypes.TestResult {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can enter test results");
    };
    let result = TestsLib.enterTestResult(
      testResults,
      nextResultId.val,
      testId,
      studentId,
      marksObtained,
      feedback,
    );
    nextResultId.val += 1;
    result;
  };

  // Admin: update a test result
  public shared ({ caller }) func updateTestResult(
    id : CommonTypes.ResultId,
    marksObtained : Nat,
    feedback : ?Text,
  ) : async Bool {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can update test results");
    };
    TestsLib.updateTestResult(testResults, id, marksObtained, feedback);
  };

  // Admin: get all results for a test
  public query ({ caller }) func getResultsByTest(testId : CommonTypes.TestId) : async [TestTypes.TestResult] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can view results by test");
    };
    TestsLib.getResultsByTest(testResults, testId);
  };

  // All: list all tests (authenticated users)
  public query ({ caller }) func listTests() : async [TestTypes.ClassTest] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Must be logged in to view tests");
    };
    TestsLib.listTests(tests);
  };

  // Student: get own test results
  public query ({ caller }) func getMyTestResults() : async [TestTypes.TestResult] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Must be logged in to view test results");
    };
    let student = StudentsLib.getStudentByPrincipal(students, caller);
    switch (student) {
      case (?s) { TestsLib.getResultsByStudent(testResults, s.id) };
      case null { [] };
    };
  };
};
