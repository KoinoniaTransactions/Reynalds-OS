/** Pure, conservative outbound campaign checklist. Never sends or approves enrollment. */
export type CampaignSafetyInput = {
  fromDomain?: string;
  replyTo?: string;
  postalAddress?: string;
  unsubscribeMechanismVerified?: boolean;
  recipientSuppressionVerified?: boolean;
  listPermissionReviewed?: boolean;
  senderAuthenticationVerified?: boolean;
  reputationRampApproved?: boolean;
  ownerCampaignApproval?: boolean;
};
export function evaluateKoinoniaSendReadiness(input: CampaignSafetyInput) {
  const reasons: string[] = [];
  // Koinonia's approved customer-facing domain; admin/billing domain is never a sender.
  if (input.fromDomain?.trim().toLowerCase() !== "koinoniatransactions.com")
    reasons.push("sender_domain_unverified");
  if (!input.replyTo?.trim() || !/^[^\s@]+@koinoniatransactions\.com$/i.test(input.replyTo.trim()))
    reasons.push("reply_to_unverified");
  if (!input.postalAddress?.trim()) reasons.push("postal_address_missing");
  if (input.unsubscribeMechanismVerified !== true) reasons.push("unsubscribe_flow_unverified");
  if (input.recipientSuppressionVerified !== true) reasons.push("send_path_suppression_unverified");
  if (input.listPermissionReviewed !== true) reasons.push("list_permission_review_pending");
  if (input.senderAuthenticationVerified !== true) reasons.push("sender_authentication_unverified");
  if (input.reputationRampApproved !== true) reasons.push("sending_ramp_unapproved");
  if (input.ownerCampaignApproval !== true) reasons.push("owner_approval_required");
  return {
    checksPassed: reasons.length === 0,
    // Not an operational sender or a positive authorization even when all checklist items are true.
    sendingEnabled: false as const,
    enrollmentApproved: false as const,
    action: "manual_review" as const,
    reasons
  };
}
