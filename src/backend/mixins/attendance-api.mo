import List "mo:core/List";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Time "mo:core/Time";
import AccessControl "mo:caffeineai-authorization/access-control";
import CommonTypes "../types/common";
import AttendanceTypes "../types/attendance";
import AttendanceLib "../lib/attendance";
import StudentsLib "../lib/students";
import StudentTypes "../types/students";

mixin (
  accessControlState : AccessControl.AccessControlState,
  attendanceRecords : List.List<AttendanceTypes.AttendanceRecord>,
  nextAttendanceId : CommonTypes.Counter,
  students : List.List<StudentTypes.Student>,
) {
  // Admin: mark attendance for a student
  public shared ({ caller }) func markAttendance(
    studentId : CommonTypes.StudentId,
    date : Text,
    status : CommonTypes.AttendanceStatus,
  ) : async AttendanceTypes.AttendanceRecord {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can mark attendance");
    };
    let record = AttendanceLib.markAttendance(
      attendanceRecords,
      nextAttendanceId.val,
      studentId,
      date,
      status,
      caller,
    );
    nextAttendanceId.val += 1;
    record;
  };

  // Admin: update an existing attendance record
  public shared ({ caller }) func updateAttendance(
    id : CommonTypes.AttendanceId,
    status : CommonTypes.AttendanceStatus,
  ) : async Bool {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can update attendance");
    };
    AttendanceLib.updateAttendance(attendanceRecords, id, status);
  };

  // Admin: get attendance for a specific date
  public query ({ caller }) func getAttendanceByDate(date : Text) : async [AttendanceTypes.AttendanceRecord] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can view attendance by date");
    };
    AttendanceLib.getAttendanceByDate(attendanceRecords, date);
  };

  // Admin/Student: get attendance for a specific student
  public query ({ caller }) func getStudentAttendance(studentId : CommonTypes.StudentId) : async [AttendanceTypes.AttendanceRecord] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      // Check if caller is the student themselves
      let student = StudentsLib.getStudentByPrincipal(students, caller);
      switch (student) {
        case (?s) {
          if (s.id != studentId) {
            Runtime.trap("Unauthorized: Can only view your own attendance");
          };
        };
        case null {
          Runtime.trap("Unauthorized: Must be logged in to view attendance");
        };
      };
    };
    AttendanceLib.getStudentAttendance(attendanceRecords, studentId);
  };

  // Student: get own attendance
  public query ({ caller }) func getMyAttendance() : async [AttendanceTypes.AttendanceRecord] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Must be logged in to view attendance");
    };
    let student = StudentsLib.getStudentByPrincipal(students, caller);
    switch (student) {
      case (?s) { AttendanceLib.getStudentAttendance(attendanceRecords, s.id) };
      case null { [] };
    };
  };
};
