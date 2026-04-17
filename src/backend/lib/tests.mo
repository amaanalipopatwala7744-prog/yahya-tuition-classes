import List "mo:core/List";
import Principal "mo:core/Principal";
import CommonTypes "../types/common";
import TestTypes "../types/tests";

module {
  public type ClassTest = TestTypes.ClassTest;
  public type TestResult = TestTypes.TestResult;

  public func createTest(
    tests : List.List<ClassTest>,
    nextId : Nat,
    name : Text,
    subject : Text,
    testDate : CommonTypes.Timestamp,
    totalMarks : Nat,
    description : Text,
    createdAt : CommonTypes.Timestamp,
    createdBy : Principal,
  ) : ClassTest {
    let classTest : ClassTest = {
      id = nextId;
      name;
      subject;
      testDate;
      totalMarks;
      description;
      createdAt;
      createdBy;
    };
    tests.add(classTest);
    classTest;
  };

  public func getTest(tests : List.List<ClassTest>, id : CommonTypes.TestId) : ?ClassTest {
    tests.find(func(t) { t.id == id });
  };

  public func listTests(tests : List.List<ClassTest>) : [ClassTest] {
    tests.toArray();
  };

  public func deleteTest(tests : List.List<ClassTest>, id : CommonTypes.TestId) : Bool {
    let sizeBefore = tests.size();
    let filtered = tests.filter(func(t) { t.id != id });
    tests.clear();
    tests.append(filtered);
    tests.size() < sizeBefore;
  };

  public func enterTestResult(
    results : List.List<TestResult>,
    nextId : Nat,
    testId : CommonTypes.TestId,
    studentId : CommonTypes.StudentId,
    marksObtained : Nat,
    feedback : ?Text,
  ) : TestResult {
    let result : TestResult = {
      id = nextId;
      testId;
      studentId;
      marksObtained;
      feedback;
    };
    results.add(result);
    result;
  };

  public func getResultsByTest(results : List.List<TestResult>, testId : CommonTypes.TestId) : [TestResult] {
    results.filter(func(r) { r.testId == testId }).toArray();
  };

  public func getResultsByStudent(results : List.List<TestResult>, studentId : CommonTypes.StudentId) : [TestResult] {
    results.filter(func(r) { r.studentId == studentId }).toArray();
  };

  public func updateTestResult(results : List.List<TestResult>, id : CommonTypes.ResultId, marksObtained : Nat, feedback : ?Text) : Bool {
    var found = false;
    results.mapInPlace(func(r) {
      if (r.id == id) {
        found := true;
        { r with marksObtained; feedback };
      } else {
        r;
      };
    });
    found;
  };
};
