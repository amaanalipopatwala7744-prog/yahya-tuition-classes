import List "mo:core/List";
import AccessControl "mo:caffeineai-authorization/access-control";
import MixinAuthorization "mo:caffeineai-authorization/MixinAuthorization";
import MixinObjectStorage "mo:caffeineai-object-storage/Mixin";
import CommonTypes "types/common";
import StudentTypes "types/students";
import AttendanceTypes "types/attendance";
import AssignmentTypes "types/assignments";
import TestTypes "types/tests";
import LeadTypes "types/leads";
import GalleryTypes "types/gallery";
import StudentsMixin "mixins/students-api";
import AttendanceMixin "mixins/attendance-api";
import AssignmentsMixin "mixins/assignments-api";
import TestsMixin "mixins/tests-api";
import LeadsMixin "mixins/leads-api";
import GalleryMixin "mixins/gallery-api";

actor {
  // Authorization
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // Object storage infrastructure
  include MixinObjectStorage();

  // State
  let students = List.empty<StudentTypes.Student>();
  let nextStudentId : CommonTypes.Counter = { var val = 1 };

  let attendanceRecords = List.empty<AttendanceTypes.AttendanceRecord>();
  let nextAttendanceId : CommonTypes.Counter = { var val = 1 };

  let assignments = List.empty<AssignmentTypes.Assignment>();
  let nextAssignmentId : CommonTypes.Counter = { var val = 1 };

  let submissions = List.empty<AssignmentTypes.AssignmentSubmission>();
  let nextSubmissionId : CommonTypes.Counter = { var val = 1 };

  let tests = List.empty<TestTypes.ClassTest>();
  let nextTestId : CommonTypes.Counter = { var val = 1 };

  let testResults = List.empty<TestTypes.TestResult>();
  let nextResultId : CommonTypes.Counter = { var val = 1 };

  let leads = List.empty<LeadTypes.ChatbotLead>();
  let nextLeadId : CommonTypes.Counter = { var val = 1 };

  let galleryImages = List.empty<GalleryTypes.GalleryImage>();
  let nextImageId : CommonTypes.Counter = { var val = 1 };

  // Domain mixins
  include StudentsMixin(accessControlState, students, nextStudentId);
  include AttendanceMixin(accessControlState, attendanceRecords, nextAttendanceId, students);
  include AssignmentsMixin(accessControlState, assignments, submissions, nextAssignmentId, nextSubmissionId, students);
  include TestsMixin(accessControlState, tests, testResults, nextTestId, nextResultId, students);
  include LeadsMixin(accessControlState, leads, nextLeadId);
  include GalleryMixin(accessControlState, galleryImages, nextImageId);
};
