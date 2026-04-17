import List "mo:core/List";
import CommonTypes "../types/common";
import LeadTypes "../types/leads";

module {
  public type ChatbotLead = LeadTypes.ChatbotLead;

  public func createLead(
    leads : List.List<ChatbotLead>,
    nextId : Nat,
    name : Text,
    phone : Text,
    classInterest : CommonTypes.ClassLevel,
    preferredTime : Text,
    createdAt : CommonTypes.Timestamp,
  ) : ChatbotLead {
    let lead : ChatbotLead = {
      id = nextId;
      name;
      phone;
      classInterest;
      preferredTime;
      createdAt;
      followUpStatus = #new_;
    };
    leads.add(lead);
    lead;
  };

  public func getLead(leads : List.List<ChatbotLead>, id : CommonTypes.LeadId) : ?ChatbotLead {
    leads.find(func(l) { l.id == id });
  };

  public func listLeads(leads : List.List<ChatbotLead>) : [ChatbotLead] {
    leads.toArray();
  };

  public func updateFollowUpStatus(leads : List.List<ChatbotLead>, id : CommonTypes.LeadId, status : CommonTypes.FollowUpStatus) : Bool {
    var found = false;
    leads.mapInPlace(func(l) {
      if (l.id == id) {
        found := true;
        { l with followUpStatus = status };
      } else {
        l;
      };
    });
    found;
  };

  public func deleteLead(leads : List.List<ChatbotLead>, id : CommonTypes.LeadId) : Bool {
    let sizeBefore = leads.size();
    let filtered = leads.filter(func(l) { l.id != id });
    leads.clear();
    leads.append(filtered);
    leads.size() < sizeBefore;
  };
};
