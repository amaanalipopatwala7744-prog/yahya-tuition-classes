import CommonTypes "common";

module {
  public type ChatbotLead = {
    id : CommonTypes.LeadId;
    name : Text;
    phone : Text;
    classInterest : CommonTypes.ClassLevel;
    preferredTime : Text;
    createdAt : CommonTypes.Timestamp;
    followUpStatus : CommonTypes.FollowUpStatus;
  };
};
