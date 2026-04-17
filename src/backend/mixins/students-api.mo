import List "mo:core/List";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Time "mo:core/Time";
import AccessControl "mo:caffeineai-authorization/access-control";
import CommonTypes "../types/common";
import StudentTypes "../types/students";
import StudentsLib "../lib/students";

mixin (
  accessControlState : AccessControl.AccessControlState,
  students : List.List<StudentTypes.Student>,
  nextStudentId : CommonTypes.Counter,
) {
  // Admin: create a new student record
  public shared ({ caller }) func createStudent(
    principal : Principal,
    name : Text,
    classLevel : CommonTypes.ClassLevel,
    subjects : [Text],
    phone : Text,
    email : Text,
  ) : async StudentTypes.Student {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can create students");
    };
    let student = StudentsLib.createStudent(
      students,
      nextStudentId.val,
      principal,
      name,
      classLevel,
      subjects,
      phone,
      email,
      Time.now(),
    );
    nextStudentId.val += 1;
    student;
  };

  // Admin: get any student by id
  public query ({ caller }) func getStudent(id : CommonTypes.StudentId) : async ?StudentTypes.Student {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can view student records");
    };
    StudentsLib.getStudent(students, id);
  };

  // Admin: list all students
  public query ({ caller }) func listStudents() : async [StudentTypes.Student] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can list students");
    };
    StudentsLib.listStudents(students);
  };

  // Admin: list active students only
  public query ({ caller }) func listActiveStudents() : async [StudentTypes.Student] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can list students");
    };
    StudentsLib.listActiveStudents(students);
  };

  // Admin: update student info
  public shared ({ caller }) func updateStudent(updated : StudentTypes.Student) : async Bool {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can update student records");
    };
    StudentsLib.updateStudent(students, updated);
  };

  // Admin: deactivate (soft-delete) a student
  public shared ({ caller }) func deactivateStudent(id : CommonTypes.StudentId) : async Bool {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can deactivate students");
    };
    StudentsLib.deactivateStudent(students, id);
  };

  // Student: get own profile
  public query ({ caller }) func getMyProfile() : async ?StudentTypes.Student {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Must be logged in to view profile");
    };
    StudentsLib.getStudentByPrincipal(students, caller);
  };
};
