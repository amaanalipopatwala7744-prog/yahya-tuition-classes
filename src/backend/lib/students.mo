import List "mo:core/List";
import Principal "mo:core/Principal";
import Time "mo:core/Time";
import CommonTypes "../types/common";
import StudentTypes "../types/students";

module {
  public type Student = StudentTypes.Student;

  public func createStudent(
    students : List.List<Student>,
    nextId : Nat,
    principal : Principal,
    name : Text,
    classLevel : CommonTypes.ClassLevel,
    subjects : [Text],
    phone : Text,
    email : Text,
    enrollmentDate : CommonTypes.Timestamp,
  ) : Student {
    let student : Student = {
      id = nextId;
      principal;
      name;
      classLevel;
      subjects;
      phone;
      email;
      enrollmentDate;
      isActive = true;
    };
    students.add(student);
    student;
  };

  public func getStudent(students : List.List<Student>, id : CommonTypes.StudentId) : ?Student {
    students.find(func(s) { s.id == id });
  };

  public func getStudentByPrincipal(students : List.List<Student>, principal : Principal) : ?Student {
    students.find(func(s) { Principal.equal(s.principal, principal) });
  };

  public func updateStudent(students : List.List<Student>, updated : Student) : Bool {
    var found = false;
    students.mapInPlace(func(s) {
      if (s.id == updated.id) {
        found := true;
        updated;
      } else {
        s;
      };
    });
    found;
  };

  public func deactivateStudent(students : List.List<Student>, id : CommonTypes.StudentId) : Bool {
    var found = false;
    students.mapInPlace(func(s) {
      if (s.id == id) {
        found := true;
        { s with isActive = false };
      } else {
        s;
      };
    });
    found;
  };

  public func listStudents(students : List.List<Student>) : [Student] {
    students.toArray();
  };

  public func listActiveStudents(students : List.List<Student>) : [Student] {
    students.filter(func(s) { s.isActive }).toArray();
  };
};
