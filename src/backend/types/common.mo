module {
  public type Timestamp = Int;
  public type Counter = { var val : Nat };
  public type StudentId = Nat;
  public type AssignmentId = Nat;
  public type TestId = Nat;
  public type LeadId = Nat;
  public type ImageId = Nat;
  public type SubmissionId = Nat;
  public type ResultId = Nat;
  public type AttendanceId = Nat;

  public type ClassLevel = {
    #class6to8;
    #class9to10;
    #class11to12;
  };

  public type AttendanceStatus = {
    #present;
    #absent;
  };

  public type SubmissionStatus = {
    #submitted;
    #reviewed;
    #late;
  };

  public type FollowUpStatus = {
    #new_;
    #contacted;
    #enrolled;
  };

  public type GalleryCategory = {
    #classroom;
    #activities;
    #results;
  };
};
