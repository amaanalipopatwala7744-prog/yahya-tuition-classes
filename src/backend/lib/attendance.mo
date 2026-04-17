import List "mo:core/List";
import Principal "mo:core/Principal";
import CommonTypes "../types/common";
import AttendanceTypes "../types/attendance";

module {
  public type AttendanceRecord = AttendanceTypes.AttendanceRecord;

  public func markAttendance(
    records : List.List<AttendanceRecord>,
    nextId : Nat,
    studentId : CommonTypes.StudentId,
    date : Text,
    status : CommonTypes.AttendanceStatus,
    markedBy : Principal,
  ) : AttendanceRecord {
    let record : AttendanceRecord = {
      id = nextId;
      studentId;
      date;
      status;
      markedBy;
    };
    records.add(record);
    record;
  };

  public func getStudentAttendance(records : List.List<AttendanceRecord>, studentId : CommonTypes.StudentId) : [AttendanceRecord] {
    records.filter(func(r) { r.studentId == studentId }).toArray();
  };

  public func getAttendanceByDate(records : List.List<AttendanceRecord>, date : Text) : [AttendanceRecord] {
    records.filter(func(r) { r.date == date }).toArray();
  };

  public func updateAttendance(records : List.List<AttendanceRecord>, id : CommonTypes.AttendanceId, status : CommonTypes.AttendanceStatus) : Bool {
    var found = false;
    records.mapInPlace(func(r) {
      if (r.id == id) {
        found := true;
        { r with status };
      } else {
        r;
      };
    });
    found;
  };
};
