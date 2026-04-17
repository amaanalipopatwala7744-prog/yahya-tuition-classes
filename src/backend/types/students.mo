import CommonTypes "common";
import Principal "mo:core/Principal";
import Storage "mo:caffeineai-object-storage/Storage";

module {
  public type Student = {
    id : CommonTypes.StudentId;
    principal : Principal;
    name : Text;
    classLevel : CommonTypes.ClassLevel;
    subjects : [Text];
    phone : Text;
    email : Text;
    enrollmentDate : CommonTypes.Timestamp;
    isActive : Bool;
  };
};
