import CommonTypes "common";
import Principal "mo:core/Principal";

module {
  public type AttendanceRecord = {
    id : CommonTypes.AttendanceId;
    studentId : CommonTypes.StudentId;
    date : Text;
    status : CommonTypes.AttendanceStatus;
    markedBy : Principal;
  };
};
