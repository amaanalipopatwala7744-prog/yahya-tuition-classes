import List "mo:core/List";
import Runtime "mo:core/Runtime";
import Time "mo:core/Time";
import AccessControl "mo:caffeineai-authorization/access-control";
import CommonTypes "../types/common";
import LeadTypes "../types/leads";
import LeadsLib "../lib/leads";

mixin (
  accessControlState : AccessControl.AccessControlState,
  leads : List.List<LeadTypes.ChatbotLead>,
  nextLeadId : CommonTypes.Counter,
) {
  // Public: submit a chatbot lead (no auth required)
  public shared func submitLead(
    name : Text,
    phone : Text,
    classInterest : CommonTypes.ClassLevel,
    preferredTime : Text,
  ) : async LeadTypes.ChatbotLead {
    let lead = LeadsLib.createLead(
      leads,
      nextLeadId.val,
      name,
      phone,
      classInterest,
      preferredTime,
      Time.now(),
    );
    nextLeadId.val += 1;
    lead;
  };

  // Admin: list all leads
  public query ({ caller }) func listLeads() : async [LeadTypes.ChatbotLead] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can view leads");
    };
    LeadsLib.listLeads(leads);
  };

  // Admin: update follow-up status of a lead
  public shared ({ caller }) func updateLeadStatus(
    id : CommonTypes.LeadId,
    status : CommonTypes.FollowUpStatus,
  ) : async Bool {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can update lead status");
    };
    LeadsLib.updateFollowUpStatus(leads, id, status);
  };

  // Admin: delete a lead
  public shared ({ caller }) func deleteLead(id : CommonTypes.LeadId) : async Bool {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can delete leads");
    };
    LeadsLib.deleteLead(leads, id);
  };
};
